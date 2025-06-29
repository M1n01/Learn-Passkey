import {
  generateAuthenticationOptions,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { webAuthnConfig } from "@/lib/webauthn/config";

export async function GET(): Promise<NextResponse> {
  if (!webAuthnConfig.rpID) {
    return NextResponse.json({ error: "RP ID is not set" }, { status: 500 });
  }

  try {
    const optionsJSON: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID: webAuthnConfig.rpID,
        userVerification: "preferred",
      });

    const sessionId = crypto.randomUUID();
    await prisma.webAuthnSession.create({
      data: {
        id: sessionId,
        sessionType: "authentication",
        challenge: optionsJSON.challenge,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    return NextResponse.json({ optionsJSON, sessionId });
  } catch (error) {
    console.error("Unexpected error in options endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
