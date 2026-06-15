type LogLevel = "info" | "warn" | "error";

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g;
const SECRET_PATTERNS = [
  /\bsk_(?:test|live)_[a-zA-Z0-9]+\b/g,
  /\bpk_(?:test|live)_[a-zA-Z0-9]+\b/g,
  /\bwhsec_[a-zA-Z0-9]+\b/g,
  /\bre_[a-zA-Z0-9]+\b/g,
  /Bearer\s+[a-zA-Z0-9._-]+/gi,
] as const;

const SENSITIVE_META_KEYS = new Set([
  "html",
  "text",
  "body",
  "password",
  "smtp",
  "authorization",
]);

export function redactEmail(value: string): string {
  return value.replace(EMAIL_PATTERN, "[email]");
}

export function redactSecrets(value: string): string {
  let result = redactEmail(value);
  result = result.replace(PHONE_PATTERN, "[phone]");

  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, "[secret]");
  }

  return result;
}

function redactStringValue(key: string, value: string): string {
  const lowerKey = key.toLowerCase();

  if (SENSITIVE_META_KEYS.has(lowerKey)) {
    return "[redacted]";
  }

  if (
    lowerKey.includes("email") ||
    key === "to" ||
    key === "from" ||
    key === "subject"
  ) {
    return redactSecrets(value);
  }

  if (lowerKey === "error" || lowerKey.includes("message")) {
    return redactSecrets(value);
  }

  return redactSecrets(value);
}

export function redactSensitiveData(
  meta?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") {
      redacted[key] = redactStringValue(key, value);
    } else if (Array.isArray(value)) {
      redacted[key] = value.map((item) =>
        typeof item === "string" ? redactStringValue(key, item) : item,
      );
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export function logSecure(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
) {
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
