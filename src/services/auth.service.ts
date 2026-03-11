import crypto from "crypto";
import bcrypt from "bcryptjs";

import { env } from "../config/env.js";
import prisma from "../config/database.js";
import { mailService } from "./mail.service.js";

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("emailAlreadyExists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: false,
        verifyToken: token,
        verifyTokenExpires: expires,
      },
    });

    await mailService.sendVerificationEmail(email, name, token);

    return user;
  },

  async confirmEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error("invalidOrExpiredToken");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpires: null,
      },
    });

    return user;
  },

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken: token, verifyTokenExpires: expires },
    });

    await mailService.sendVerificationEmail(email, user.name, token);
  },
};
