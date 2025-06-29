import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  VerifiedAuthenticationResponse,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import cookie from "cookie";
import * as jose from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { webAuthnConfig } from "@/lib/webauthn/config";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const {
    authenticationResponse,
    sessionId,
  }: {
    authenticationResponse: AuthenticationResponseJSON;
    sessionId: string;
  } = await req.json();

  const passkey = await prisma.passkey.findUnique({
    where: { id: authenticationResponse.id },
    include: { user: true },
  });

  if (!passkey) {
    return NextResponse.json(
      { error: "Authenticator not found" },
      { status: 404 },
    );
  }

  const credential: WebAuthnCredential = {
    id: passkey.id,
    publicKey: passkey.publicKey,
    counter: Number(passkey.counter),
    transports: passkey.transports?.split(
      ",",
    ) as AuthenticatorTransportFuture[],
  };

  let verification: VerifiedAuthenticationResponse;
  try {
    if (!webAuthnConfig.rpID || !webAuthnConfig.origin) {
      return NextResponse.json(
        { error: "RP ID or ORIGIN is not set" },
        { status: 500 },
      );
    }

    const session = await prisma.webAuthnSession.findUnique({
      where: { id: sessionId, sessionType: "authentication" },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const expectedChallenge = session.challenge;

    verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: webAuthnConfig.origin,
      expectedRPID: webAuthnConfig.rpID,
      credential,
      requireUserVerification: true,
    });

    if (verification.verified) {
      await prisma.passkey.update({
        where: { id: verification.authenticationInfo.credentialID },
        data: { counter: verification.authenticationInfo.newCounter },
      });

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable not set");
      }

      const sessionToken = await new jose.SignJWT({
        userId: passkey.user.id,
        username: passkey.user.username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h") // 2 hours
        .sign(new TextEncoder().encode(jwtSecret));

      const sessionCookie = cookie.serialize("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 2, // 2 hours in seconds
      });

      const clearChallengeCookie = cookie.serialize("challenge-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        expires: new Date(0),
      });

      const response = NextResponse.json({
        verified: true,
        user: {
          id: passkey.user.id,
          username: passkey.user.username,
        },
      });

      response.headers.set("Set-Cookie", sessionCookie);
      response.headers.append("Set-Cookie", clearChallengeCookie);

      return response;
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Unexpected error in verification endpoint:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
