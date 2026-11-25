import "server-only";
function read(name: string): string | undefined { return process.env[name]?.trim() || undefined; }
export const env = {
  get mongoUri(){return read("MONGODB_URI");},
  get mongoDbName(){return read("MONGODB_DB_NAME")??"nepal_poultry_expo";},
  get recaptchaSecret(){return read("RECAPTCHA_SECRET_KEY");},
  get recaptchaAllowedHostnames(){return (read("RECAPTCHA_ALLOWED_HOSTNAMES")??"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);},
  get googleServiceAccountBase64(){return read("GOOGLE_SERVICE_ACCOUNT_BASE64");},
  get googleSheetId(){return read("GOOGLE_SHEET_ID");},
  get googleSheetTab(){return read("GOOGLE_SHEET_TAB")??"Website Enquiries";},
  get gmailUser(){return read("GMAIL_USER");},
  get gmailAppPassword(){return read("GMAIL_APP_PASSWORD")?.replace(/\s+/g,"");},
  get emailFromName(){return read("EMAIL_FROM_NAME")??"Nepal Poultry & Livestock International Expo";},
  get emailToPrimary(){return read("EMAIL_TO_PRIMARY");},
  get emailToSecondary(){return read("EMAIL_TO_SECONDARY");},
  get otpSecret(){return read("OTP_SECRET");},
  get cronSecret(){return read("CRON_SECRET");},
  get signingSecret(){return read("BROCHURE_LINK_SECRET")??read("CRON_SECRET");},
  get ipHashSalt(){return read("IP_HASH_SALT")??read("CRON_SECRET");},
  get brochureFileName(){return read("BROCHURE_FILE_NAME")??"nepal-poultry-expo-brochure.pdf";},
  get isProduction(){return process.env.NODE_ENV==="production";},
};
export function sheetsConfigured():boolean{return Boolean(env.googleServiceAccountBase64&&env.googleSheetId);}
export function emailConfigured():boolean{return Boolean(env.gmailUser&&env.gmailAppPassword);}
