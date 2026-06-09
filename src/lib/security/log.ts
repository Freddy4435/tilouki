type LogLevel = "info" | "warn" | "error";

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function redactEmail(value: string): string {
  return value.replace(EMAIL_PATTERN, "[email]");
}

export function redactSensitiveData(
  meta?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") {
      redacted[key] =
        key.toLowerCase().includes("email") || key === "to"
          ? redactEmail(value)
          : value;
    } else if (Array.isArray(value)) {
      redacted[key] = value.map((item) =>
        typeof item === "string" ? redactEmail(item) : item,
      );
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export function logSecure(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = redactSensitiveData(meta);
  const prefix = `[secure] ${message}`;

  if (level === "error") {
    console.error(prefix, payload ?? "");
    return;
  }
  if (level === "warn") {
    console.warn(prefix, payload ?? "");
    return;
  }
  console.info(prefix, payload ?? "");
}
