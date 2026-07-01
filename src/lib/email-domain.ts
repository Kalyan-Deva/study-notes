// Public post submissions must come from Gmail or an organization email.
// Common free/consumer and disposable providers are blocked; gmail.com is the
// one explicitly-allowed consumer provider. Anything not on the blocklist is
// treated as an "organization" domain and allowed. The email-confirmation click
// is the real gate — this just filters obvious throwaways up front.
const BLOCKED = new Set([
  // free consumer webmail (not gmail)
  "outlook.com", "hotmail.com", "hotmail.co.uk", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in", "ymail.com", "rocketmail.com",
  "aol.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me", "gmx.com", "gmx.net",
  "mail.com", "zoho.com", "yandex.com", "yandex.ru", "hey.com", "tutanota.com",
  // disposable / temp
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "getnada.com", "trashmail.com",
  "sharklasers.com", "dispostable.com", "yopmail.com", "fakeinbox.com",
  "maildrop.cc", "mohmal.com", "moakt.com", "spam4.me", "mailnesia.com",
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function emailAllowed(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!EMAIL_RE.test(value)) return false;
  const domain = value.split("@")[1] ?? "";
  if (domain === "gmail.com") return true;
  return !BLOCKED.has(domain);
}

export const EMAIL_RULE_MESSAGE =
  "Use a Gmail or organization email (free/temporary providers aren't allowed).";
