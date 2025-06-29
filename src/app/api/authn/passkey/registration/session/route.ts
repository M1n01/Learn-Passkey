import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const { sessionId, sessionType } = await req.json();
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 },
    );
  }

  await prisma.webAuthnSession.deleteMany({
    where: {
      id: sessionId,
      sessionType,
    },
  });

  return NextResponse.json({ success: true });
}
