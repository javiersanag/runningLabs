import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "default_dev_secret_please_change_in_prod";
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY);

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + SESSION_DURATION);
    const session = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d") // Match cookie duration
        .sign(ENCODED_KEY);

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expires,
    });
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, ENCODED_KEY, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}
