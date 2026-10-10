import "server-only";

import nodemailer, {
  type SendMailOptions,
  type SMTPTransportOptions,
  type Transporter,
} from "nodemailer";

/**
 * The site's one way of sending email: an SMTP account, through nodemailer.
 *
 * TODAY THAT ACCOUNT IS A PERSONAL GMAIL, which accepts SMTP logins only with
 * an APP PASSWORD (Google Account → Security → 2-Step Verification must be on
 * → App passwords). The account's real password is refused. Google revokes
 * every app password when the account password changes, so a password change
 * stops the form until a new one is generated and SMTP_PASS is updated.
 *
 * CONFIGURED FROM THE ENVIRONMENT, NEVER FROM CODE OR THE CMS. The password
 * is a secret, so it lives in `.env.local` locally and in the host's
 * environment settings in production:
 *
 *   SMTP_HOST     smtp.gmail.com (or any other provider's SMTP host)
 *   SMTP_PORT     465 (implicit TLS) or 587 (STARTTLS). Defaults to 465.
 *   SMTP_SECURE   optional; "true" or "false". Defaults to true on 465 only.
 *   SMTP_USER     the mailbox the site logs in as — the full address
 *   SMTP_PASS     its app password (16 letters; spaces are ignored)
 *   MAIL_FROM     optional; `"Vakratunda Group website" <same@gmail.com>`.
 *                 Defaults to SMTP_USER. Only the display name is really
 *                 yours to choose: Gmail rewrites any address the account
 *                 does not own back to the account itself.
 *
 * WITHOUT THEM, NOTHING IS PRETENDED. `sendMail` throws, the caller logs it
 * and tells the visitor the message did not go — a form that reports success
 * on a send that never happened is worse than no form at all.
 *
 * The transport is built once per server process and reused, so a warm
 * instance does not pay for a fresh TLS handshake on every enquiry. The
 * timeouts are a visitor's patience rather than nodemailer's defaults (up to
 * two minutes to connect): if the mail server has not answered in ten seconds
 * it is not going to, and the form should say so.
 */

let transporter: Transporter | null = null;

function readConfig(): SMTPTransportOptions | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  // Google shows app passwords in groups of four; pasted with the spaces,
  // they would fail to log in.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const config = readConfig();
  if (!config) {
    throw new Error(
      "Email is not configured: set SMTP_HOST, SMTP_USER and SMTP_PASS (see lib/mailer.ts).",
    );
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
}

/** Sends one message from the site's own address. Throws on any failure. */
export async function sendMail(message: Omit<SendMailOptions, "from">): Promise<void> {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER?.trim();
  await getTransporter().sendMail({ ...message, from });
}
