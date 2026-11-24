/** Thrown when an optional integration (Google Sheets, Gmail) has no credentials yet. */
export class IntegrationNotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} is not configured`);
    this.name = "IntegrationNotConfiguredError";
  }
}

/** Short, credential-free error description safe to store and log. */
export function safeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return raw
    .replace(/(pass(word)?|secret|token|key|authorization)\s*[=:]\s*\S+/gi, "$1=[redacted]")
    .replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, "mongodb://[redacted]")
    .slice(0, 500);
}
