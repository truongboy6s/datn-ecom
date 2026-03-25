import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "../utils/logger";

const hasMailConfig = Boolean(env.GMAIL_USER && env.GMAIL_PASS);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_PASS,
      },
    })
  : null;

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  if (!transporter) {
    logger.warn("Email verification skipped: GMAIL_USER/GMAIL_PASS is not configured.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.GMAIL_USER,
      to: email,
      subject: "Xác thực email - DATN Ecom",
      html: `
        <h2>Xác thực Email</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản DATN Ecom!</p>
        <p>Vui lòng nhấp vào liên kết bên dưới để xác thực email của bạn:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px;">
          Xác thực Email
        </a>
        <p>Hoặc copy link này: ${verificationLink}</p>
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
      `,
    });
    return true;
  } catch (error) {
    logger.warn("Unable to send verification email", {
      email,
      errorCode: (error as any)?.code,
      responseCode: (error as any)?.responseCode,
    });
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  if (!transporter) {
    logger.warn("Password reset skipped: GMAIL_USER/GMAIL_PASS is not configured.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.GMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu - DATN Ecom",
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng nhấp vào liên kết bên dưới để tạo mật khẩu mới:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px;">
          Đặt lại mật khẩu
        </a>
        <p>Hoac copy link nay: ${resetLink}</p>
        <p>Link nay se het han sau 1 gio.</p>
      `,
    });
    return true;
  } catch (error) {
    logger.warn("Unable to send password reset email", {
      email,
      errorCode: (error as any)?.code,
      responseCode: (error as any)?.responseCode,
    });
    return false;
  }
}

export default transporter;
