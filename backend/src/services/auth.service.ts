import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { env } from "../config/env";
import { Prisma } from "@prisma/client";
import { sendVerificationEmail } from "../config/mail";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

export class AuthService {
  static async register(data: Prisma.UserCreateInput) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    if (data.role === "ADMIN") {
      const providedSecret = (data as Prisma.UserCreateInput & { adminSecret?: string }).adminSecret;
      if (!providedSecret || providedSecret !== env.ADMIN_SECRET) {
        throw new Error("Invalid admin secret");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await UserRepository.create({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      ...(data.role ? { role: data.role } : {}),
    } as Prisma.UserCreateInput);

    // Save verification token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    // Registration is considered successful only when verification email is delivered.
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
    if (!emailSent) {
      try {
        await prisma.user.delete({ where: { id: user.id } });
      } catch (cleanupError) {
        logger.error("Failed to rollback user after email send failure", cleanupError);
      }

      throw new Error("Unable to send verification email. Please check Gmail configuration.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Registration successful. Please check your email to verify account.",
    };
  }

  static async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new Error("Invalid verification token");
    }

    if (!user.emailVerificationExpiresAt || new Date() > user.emailVerificationExpiresAt) {
      throw new Error("Verification token has expired");
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return {
      email: verifiedUser.email,
      message: "Email verified successfully!",
    };
  }

  static async login(email: string, pass: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new Error("Email not verified. Please check your email for verification link.");
    }

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    };
  }

  static async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null }) {
    if (!data.name && data.avatarUrl === undefined) {
      throw new Error("No profile fields provided");
    }

    const payload: Prisma.UserUpdateInput = {};
    if (typeof data.name === "string") {
      payload.name = data.name.trim();
    }
    if (data.avatarUrl !== undefined) {
      payload.avatarUrl = data.avatarUrl || null;
    }

    return await UserRepository.updateById(userId, payload);
  }
}
