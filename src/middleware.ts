import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("sessionToken")?.value;
  const loginUrl = new URL("/authn", req.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("sessionToken");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * ルートと、以下のパスで始まるものを除くすべてのリクエストパスにマッチさせます:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - login, register (認証関連ページ)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|authn|images).*)",
    // 例: '/dashboard/:path*', '/settings' のように具体的に指定しても良い
  ],
};
