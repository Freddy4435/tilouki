import type { PostgrestError } from "@supabase/supabase-js";

export class SupabaseDataError extends Error {
  readonly code: string;
  readonly details: string | null;
  readonly hint: string | null;

  constructor(message: string, error?: PostgrestError | null) {
    super(message);
    this.name = "SupabaseDataError";
    this.code = error?.code ?? "UNKNOWN";
    this.details = error?.details ?? null;
    this.hint = error?.hint ?? null;
  }
}

export function assertNoError(
  error: PostgrestError | null,
  context: string,
): asserts error is null {
  if (error) {
    throw new SupabaseDataError(`${context} : ${error.message}`, error);
  }
}

export function isNotFoundError(error: PostgrestError | null): boolean {
  return error?.code === "PGRST116";
}
