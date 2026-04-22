import { createHmac, timingSafeEqual } from "node:crypto";

import type { User } from "@supabase/supabase-js";

import type { AppUser } from "@/types/app";

export const EMERGENCY_ADMIN_COOKIE = "emergency_admin_session";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function getEmergencyAdminPassword() {
  return process.env.EMERGENCY_ADMIN_PASSWORD ?? "";
}

function signEmergencyAdminEmail(email: string) {
  return createHmac("sha256", getEmergencyAdminPassword())
    .update(email.toLowerCase())
    .digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hasEmergencyAdminConfig() {
  return Boolean(getEmergencyAdminPassword() && getAdminEmails().length > 0);
}

export function isEmergencyAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function matchesEmergencyAdminCredentials(email: string, password: string) {
  if (!hasEmergencyAdminConfig() || !isEmergencyAdminEmail(email)) return false;

  return safeEquals(password, getEmergencyAdminPassword());
}

export function createEmergencyAdminCookieValue(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return `${normalizedEmail}.${signEmergencyAdminEmail(normalizedEmail)}`;
}

export function resolveEmergencyAdminEmailFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const email = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  const expectedSignature = signEmergencyAdminEmail(email);

  if (!isEmergencyAdminEmail(email) || !safeEquals(signature, expectedSignature)) {
    return null;
  }

  return email;
}

export function buildEmergencyAdminSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  return {
    authUser: {
      id: `emergency-admin:${normalizedEmail}`,
      email: normalizedEmail,
      aud: "authenticated",
      role: "authenticated",
      created_at: now,
      app_metadata: {
        provider: "email"
      },
      user_metadata: {
        full_name: "Emergency Admin"
      }
    } as unknown as User,
    appUser: {
      id: `emergency-admin:${normalizedEmail}`,
      email: normalizedEmail,
      full_name: "Emergency Admin",
      role: "admin",
      created_at: now,
      updated_at: now
    } as AppUser
  };
}
