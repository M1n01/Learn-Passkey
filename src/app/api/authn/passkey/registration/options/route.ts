import { generateRegistrationOptions } from "@simplewebauthn/server";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { webAuthnConfig } from "@/lib/webauthn/config";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!webAuthnConfig.rpName || !webAuthnConfig.rpID) {
    return NextResponse.json(
      { error: "RP Name or RP ID is not set" },
      { status: 500 },
    );
  }

  try {
    const { username } = await request.json();

    const options = await generateRegistrationOptions({
      rpID: webAuthnConfig.rpID,
      rpName: webAuthnConfig.rpName,
      userName: username,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
      excludeCredentials: [], // 既存のクレデンシャルを除外
    });

    const sessionId = crypto.randomUUID();

    // WebAuthnSessionにチャレンジを保存
    await prisma.webAuthnSession.create({
      data: {
        id: sessionId,
        userId: username,
        challenge: options.challenge,
        sessionType: "registration",
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    return NextResponse.json({
      options,
      sessionId,
    });
  } catch (error) {
    console.error("Unexpected error in options endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
