/**
 * WebAuthn (Passkey) 認証のための Relying Party (RP) 設定
 */
export const webAuthnConfig = {
  rpName: process.env.NEXT_PUBLIC_RP_NAME,
  rpID: process.env.NEXT_PUBLIC_RP_ID,
  origin: process.env.NEXT_PUBLIC_APP_URL,
} as const; // `as const` で各プロパティをreadonlyにし、具体的な文字列型とする

// 起動時に環境変数が正しく設定されているか検証
if (!webAuthnConfig.rpName || !webAuthnConfig.rpID || !webAuthnConfig.origin) {
  throw new Error(
    "WebAuthn RP configuration is missing or incomplete. Please check your environment variables (NEXT_PUBLIC_RP_NAME, NEXT_PUBLIC_RP_ID, NEXT_PUBLIC_APP_URL).",
  );
}

// 開発環境以外では、rpIDがoriginに含まれているか基本的なチェック
// (例: originが "https://example.com" なら rpIDは "example.com" であるべき)
const isDevelopment = process.env.NODE_ENV === "development";
if (!isDevelopment && !webAuthnConfig.origin.startsWith("https://")) {
  console.warn(
    `WebAuthn Warning: In production, origin ("${webAuthnConfig.origin}") should start with "https://".`,
  );
}
if (
  !isDevelopment &&
  webAuthnConfig.rpID !== new URL(webAuthnConfig.origin).hostname
) {
  console.warn(
    `WebAuthn Warning: rpID ("${webAuthnConfig.rpID}") does not match the hostname of origin ("${new URL(webAuthnConfig.origin).hostname}"). This can lead to Passkey registration/authentication failures.`,
  );
}
