import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { data, error } = await resend.emails.send({
    from: "ConfigVault <onboarding@resend.dev>",
    to: [to],
    subject: "Reset your password — ConfigVault",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111; margin: 0 0 8px;">Reset your password</h2>
        <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px;">
          We received a request to reset your ConfigVault password. Click the button below to choose a new one.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
          Reset Password
        </a>
        <p style="font-size: 13px; color: #888; line-height: 1.6; margin: 24px 0 0;">
          This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
        <p style="font-size: 11px; color: #aaa; margin: 0;">
          ConfigVault — Secure config management for modern teams
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
}
