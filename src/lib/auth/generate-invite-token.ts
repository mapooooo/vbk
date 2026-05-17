import { randomBytes } from "crypto";

export function generateInviteToken(): string {
  return randomBytes(24).toString("hex");
}

export function inviteExpiresAt(days = 14): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
