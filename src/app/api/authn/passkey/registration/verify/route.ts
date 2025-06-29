import type {
  RegistrationResponseJSON,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { serialize } from "cookie";
import { SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { User } from "@/generated/zod/modelSchema/UserSchema";
import { prisma } from "@/lib/prisma";
import { webAuthnConfig } from "@/lib/webauthn/config";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export async function POST(req: NextRequest) {
  if (!webAuthnConfig.origin) {
    return NextResponse.json({ error: "ORIGIN is not set" }, { status: 500 });
  }

  const {
    registrationResponse,
    sessionId,
    user,
  }: {
    registrationResponse: RegistrationResponseJSON;
    sessionId: string;
    user: User;
  } = await req.json();

  const currentSession = await prisma.webAuthnSession.findUnique({
    where: {
      id: sessionId,
      sessionType: "registration",
    },
  });

  const currentChallenge = currentSession?.challenge;
  if (!currentChallenge) {
    return NextResponse.json(
      { success: false, error: "No challenge found" },
      { status: 400 },
    );
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: currentChallenge,
      expectedOrigin: webAuthnConfig.origin,
    });

    if (!verification) {
      throw new Error("Registration verification failed");
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      await prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await prisma.passkey.create({
        data: {
          id: registrationInfo.credential.id,
          publicKey: Buffer.from(registrationInfo.credential.publicKey),
          userId: user.id,
          webauthnUserID: registrationInfo.credential.id,
          counter: BigInt(registrationInfo.credential.counter),
          deviceType: registrationInfo.credentialDeviceType,
          backedUp: registrationInfo.credentialBackedUp,
          transports: registrationInfo.credential.transports?.join(",") || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    const payload = {
      userId: user.id,
      username: user.username,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const cookie = serialize("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        verified,
        cookie,
      },
      { status: 200, headers: { "Set-Cookie": cookie } },
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Registration verification failed:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 400 },
    );
  }
}
