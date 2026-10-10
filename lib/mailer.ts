import "server-only";

import nodemailer, {
  type SendMailOptions,
  type SMTPTransportOptions,
  type Transporter,
} from "nodemailer";

/**
 * The site's one way of sending email, through nodemailer.
 *
 * CONFIGURED FROM THE ENVIRONMENT, NEVER FROM CODE OR THE CMS. Credentials are
 * secrets, so they live in `.env.local` locally and in the host's environment
 * settings in production. There are two ways in; the first one configured wins.
 *
 * 1. GOOGLE WORKSPACE, BY SERVICE ACCOUNT (preferred). No mailbox password is
 *    stored anywhere, so a password change or an admin turning off app
 *    passwords does not silently stop the form.
 *
 *      GOOGLE_MAIL_USER            the Workspace mailbox the site sends as,
 *                                  e.g. web@company.com
 *      GOOGLE_SERVICE_ACCOUNT_KEY  the service account's JSON key file, pasted
 *                                  whole (only client_id and private_key are
 *                                  read)
 *
 *    The service account needs domain-wide delegation in the Workspace admin
 *    console (Security → Access and data control → API controls), granted to
 *    its client ID with exactly the scope `https://mail.google.com/`. Gmail
 *    sends as GOOGLE_MAIL_USER over smtp.gmail.com with an XOAUTH2 token that
 *    nodemailer mints and renews itself.
 *
 * 2. ANY SMTP ACCOUNT, BY PASSWORD.
 *
 *      SMTP_HOST     smtp.gmail.com, smtp.office365.com, smtp.zoho.in, …
 *      SMTP_PORT     465 (implicit TLS) or 587 (STARTTLS). Defaults to 465.
 *      SMTP_SECURE   optional; "true" or "false". Defaults to true on 465 only.
 *      SMTP_USER     the mailbox the site logs in as
 *      SMTP_PASS     its password. Google Workspace accepts only an app
 *                    password here (the account needs 2-Step Verification),
 *                    and revokes it whenever the account password changes.
 *
 * Either way:
 *
 *   MAIL_FROM     optional; `"Vakratunda Group website" <web@…>`. Defaults to
 *                 the sending mailbox. Gmail replaces a From the mailbox does
 *                 not own with the mailbox itself, unless the address is one
 *                 of its verified "Send mail as" aliases; other providers
 *                 refuse it outright.
 *
 * WITHOUT THEM, NOTHING IS PRETENDED. `sendMail` throws, the caller logs it
 * and tells the visitor the message did not go — a form that reports success
 * on a send that never happened is worse than no form at all.
 *
 * The transport is built once per server process and reused, so a warm
 * instance does not pay for a fresh TLS handshake (or a fresh Google token) on
 * every enquiry. The timeouts are a visitor's patience rather than
 * nodemailer's defaults (up to two minutes to connect): if the mail server has
 * not answered in ten seconds it is not going to, and the form should say so.
 */

const TIMEOUTS = {
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
} as const;

interface MailConfig {
  transport: SMTPTransportOptions;
  /** The mailbox that authenticates, and so the default From. */
  sender: string;
}

let transporter: Transporter | null = null;
let sender = "";

/**
 * The key as Google hands it over is JSON whose private_key holds "\n"
 * escapes. A host that strips the quotes or a hand-edited .env can leave
 * them literal, so they are turned back into newlines either way.
 */
function readServiceAccountKey(raw: string): { clientId: string; privateKey: string } {
  let key: { client_id?: unknown; private_key?: unknown };
  try {
    key = JSON.parse(raw);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON: paste the whole key file the Google Cloud console downloaded.",
    );
  }
  if (typeof key.client_id !== "string" || typeof key.private_key !== "string") {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY has no client_id or private_key: it must be a service account key file.",
    );
  }
  return { clientId: key.client_id, privateKey: key.private_key.replace(/\\n/g, "\n") };
}

function readGoogleConfig(): MailConfig | null {
  const user = process.env.GOOGLE_MAIL_USER?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  if (!user && !rawKey) return null;
  if (!user || !rawKey) {
    throw new Error(
      "Google Workspace email needs both GOOGLE_MAIL_USER and GOOGLE_SERVICE_ACCOUNT_KEY (see lib/mailer.ts).",
    );
  }

  const { clientId, privateKey } = readServiceAccountKey(rawKey);
  return {
    sender: user,
    transport: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { type: "OAuth2", user, serviceClient: clientId, privateKey },
      ...TIMEOUTS,
    },
  };
}

function readSmtpConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  return {
    sender: user,
    transport: { host, port, secure, auth: { user, pass }, ...TIMEOUTS },
  };
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const config = readGoogleConfig() ?? readSmtpConfig();
  if (!config) {
    throw new Error(
      "Email is not configured: set GOOGLE_MAIL_USER and GOOGLE_SERVICE_ACCOUNT_KEY, or SMTP_HOST, SMTP_USER and SMTP_PASS (see lib/mailer.ts).",
    );
  }

  transporter = nodemailer.createTransport(config.transport);
  sender = config.sender;
  return transporter;
}

/** Sends one message from the site's own address. Throws on any failure. */
export async function sendMail(message: Omit<SendMailOptions, "from">): Promise<void> {
  const mail = getTransporter();
  await mail.sendMail({ ...message, from: process.env.MAIL_FROM || sender });
}
