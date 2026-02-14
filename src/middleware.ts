import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    const { pathname } = request.nextUrl;

    // 1. Define public routes that don't need authentication
    const publicRoutes = ["/login", "/register", "/forgot-password", "/api/public"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // 2. Define static assets or internal Next.js routes to ignore
    const isStaticAsset =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") || // files like favicon.ico, robots.txt
        pathname === "/favicon.ico";

    if (isStaticAsset) {
        return NextResponse.next();
    }

    // 3. Check for valid session
    let validSession = null;
    if (session) {
        validSession = await verifySession(session);
    }

    // 4. Redirect unauthenticated users to /login
    if (!validSession && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 5. Redirect authenticated users away from /login or /register to Dashboard
    if (validSession && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 6. Force password change guard
    // If the user's JWT has mustChangePassword=true, lock them to /set-new-password
    if (validSession?.mustChangePassword === true) {
        const allowedPaths = ["/set-new-password", "/api/"];
        const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

        if (!isAllowed) {
            return NextResponse.redirect(new URL("/set-new-password", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
