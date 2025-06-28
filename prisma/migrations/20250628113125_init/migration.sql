-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('registration', 'authentication');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkeys" (
    "id" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "userId" TEXT NOT NULL,
    "webauthnUserID" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "challenge" TEXT NOT NULL,
    "session_type" "SessionType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "passkeys_id_idx" ON "passkeys"("id");

-- CreateIndex
CREATE INDEX "passkeys_webauthnUserID_idx" ON "passkeys"("webauthnUserID");

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_webauthnUserID_userId_key" ON "passkeys"("webauthnUserID", "userId");

-- CreateIndex
CREATE INDEX "webauthn_sessions_userId_idx" ON "webauthn_sessions"("userId");

-- CreateIndex
CREATE INDEX "webauthn_sessions_expires_at_idx" ON "webauthn_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
