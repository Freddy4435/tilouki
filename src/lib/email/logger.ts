import "server-only";

import { logSecure } from "@/lib/security/log";

type EmailLogLevel = "info" | "warn" | "error";

export function logEmail(level: EmailLogLevel, message: string, meta?: Record<string, unknown>) {
  logSecure(level, `[email] ${message}`, meta);
}
