import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "Khronos <noreply@khronos.app>";

/** Whether a real SMTP transport is configured */
const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

/**
 * Creates a Nodemailer transport.
 * Falls back to console logging when SMTP vars are missing (local dev).
 */
function getTransport() {
    if (!isSmtpConfigured) return null;

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

/**
 * Sends a temporary password to the user's email.
 * In development (no SMTP configured), logs the password to the server console.
 */
export async function sendTempPasswordEmail(
    to: string,
    tempPassword: string
): Promise<{ success: boolean; fallback?: boolean }> {
    const transport = getTransport();

    const subject = "Khronos — Your Temporary Password";
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;">Password Reset</h2>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                You requested a password reset for your Khronos account. Use the temporary password below to log in:
            </p>
            <div style="background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Temporary Password</p>
                <p style="color: #1a1a1a; font-size: 24px; font-weight: bold; font-family: monospace; margin: 0; letter-spacing: 2px;">${tempPassword}</p>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                After logging in, you'll be prompted to set a new password immediately.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    `;

    if (!transport) {
        // Dev fallback: log to server console
        console.log("\n┌─────────────────────────────────────────┐");
        console.log("│  📧 TEMP PASSWORD (Dev Console Fallback) │");
        console.log("├─────────────────────────────────────────┤");
        console.log(`│  To:       ${to}`);
        console.log(`│  Password: ${tempPassword}`);
        console.log("└─────────────────────────────────────────┘\n");
        return { success: true, fallback: true };
    }

    try {
        await transport.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send temp password email:", error);
        return { success: false };
    }
}
