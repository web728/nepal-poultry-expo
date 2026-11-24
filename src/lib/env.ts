import "server-only";

/**
 * Server-side environment access. Values are read lazily so a missing optional
 * integration (Sheets, Gmail) never breaks the build or the form API — the outbox
 * simply keeps those jobs pending until the credentials exist.
 */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export const env = {
  get mongoUri() {
    return read("MONGODB_URI");
  },
  get mongoDbName() {
    return read("MONGODB_DB_NAME") ?? "nepal_poultry_expo";
  },
  get recaptchaSecret() {
    return read("RECAPTCHA_SECRET_KEY");
  },
  get googleServiceAccountBase64() {
    return read("GOOGLE_SERVICE_ACCOUNT_BASE64");
  },
  get googleSheetId() {
    return read("GOOGLE_SHEET_ID");
  },
  get googleSheetTab() {
    return read("GOOGLE_SHEET_TAB") ?? "Website Enquiries";
  },
  get gmailUser() {
    return read("GMAIL_USER");
  },
  get gmailAppPassword() {
    // Google shows app passwords in groups of four ("abcd efgh ijkl mnop"); spaces are not part of it.
    return read("GMAIL_APP_PASSWORD")?.replace(/\s+/g, "");
  },
  get emailFromName() {
    return read("EMAIL_FROM_NAME") ?? "Nepal Poultry & Livestock International Expo";
  },
  get emailToPrimary() {
    return read("EMAIL_TO_PRIMARY");
  },
  get emailToSecondary() {
    return read("EMAIL_TO_SECONDARY");
  },
  /** Secret for cron/worker calls and for signing brochure download links. */
  get cronSecret() {
    return read("CRON_SECRET");
  },
  get signingSecret() {
    return read("BROCHURE_LINK_SECRET") ?? read("CRON_SECRET") ?? read("RECAPTCHA_SECRET_KEY");
  },
  get ipHashSalt() {
    return read("IP_HASH_SALT") ?? read("CRON_SECRET") ?? "npe-default-salt";
  },
  /** File name of the brochure inside private/brochure/. */
  get brochureFileName() {
    return read("BROCHURE_FILE_NAME") ?? "nepal-poultry-expo-brochure.pdf";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};

export function sheetsConfigured(): boolean {
  return Boolean(env.googleServiceAccountBase64 && env.googleSheetId);
}

export function emailConfigured(): boolean {
  return Boolean(env.gmailUser && env.gmailAppPassword);
}
