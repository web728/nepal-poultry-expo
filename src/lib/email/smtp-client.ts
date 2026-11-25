/**
 * Minimal SMTP client for Cloudflare Workers, built on the native `cloudflare:sockets` TCP API.
 *
 * Why this exists: Nodemailer resolves the host itself and drives node:net/node:tls, which does not
 * behave reliably inside workerd ("proxy request failed, cannot connect to the specified address").
 * Here we hand the *hostname* straight to the runtime and let it do DNS + implicit TLS.
 *
 * Scope: implicit TLS (port 465), AUTH PLAIN (falls back to AUTH LOGIN), one recipient per message.
 * This file deliberately has no imports from the app (env, server-only, …) so it can be unit tested.
 */

export type SmtpSocket = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  close(): Promise<void>;
};

export type ConnectFn = (host: string, port: number) => SmtpSocket | Promise<SmtpSocket>;

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Name announced in EHLO. Defaults to the domain of `user`. */
  heloName?: string;
  /** Per-operation timeout (connect, each command, final DATA acceptance). */
  timeoutMs?: number;
  /** Test seam. Defaults to `cloudflare:sockets` with implicit TLS. */
  connect?: ConnectFn;
};

export type MailMessage = {
  from: { name?: string; address: string };
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  /** Full Message-ID including angle brackets, e.g. `<abc@example.com>`. */
  messageId: string;
  headers?: Record<string, string>;
  date?: Date;
};

export class SmtpError extends Error {
  readonly code: number | null;
  readonly step: string;
  /** 4xx and connection-level problems are worth retrying; 5xx usually are not (but the outbox retries anyway). */
  readonly transient: boolean;
  constructor(message: string, opts: { code?: number | null; step: string }) {
    super(message);
    this.name = "SmtpError";
    this.code = opts.code ?? null;
    this.step = opts.step;
    this.transient = opts.code == null || (opts.code >= 400 && opts.code < 500);
  }
}

const CRLF = "\r\n";
const encoder = new TextEncoder();

/* ------------------------------------------------------------------ */
/* Encoding helpers                                                    */
/* ------------------------------------------------------------------ */

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

const b64 = (s: string) => toBase64(encoder.encode(s));

/** Base64 body folded at 76 characters, as MIME requires. */
function base64Body(s: string): string {
  return (b64(s).match(/.{1,76}/g) ?? [""]).join(CRLF);
}

function assertNoLineBreaks(name: string, value: string) {
  if (/[\r\n\0]/.test(value)) throw new SmtpError(`Invalid characters in ${name}`, { step: "compose" });
}

/** RFC 2047 encoded-word (UTF-8, base64), split on code-point boundaries. Pure-ASCII text is returned untouched. */
function encodeHeaderText(value: string): string {
  assertNoLineBreaks("header", value);
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const words: string[] = [];
  let chunk = "";
  let bytes = 0;
  for (const ch of value) {
    const len = encoder.encode(ch).length;
    if (bytes + len > 45) {
      words.push(chunk);
      chunk = "";
      bytes = 0;
    }
    chunk += ch;
    bytes += len;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${b64(w)}?=`).join(`${CRLF} `);
}

function assertAddress(address: string): string {
  assertNoLineBreaks("address", address);
  if (!/^[^\s<>()",;:\\@]+@[^\s<>()",;:\\@]+\.[^\s<>()",;:\\@]+$/.test(address)) {
    throw new SmtpError(`Invalid e-mail address: ${address.slice(0, 80)}`, { step: "compose" });
  }
  return address;
}

function formatMailbox(name: string | undefined, address: string): string {
  assertAddress(address);
  if (!name) return `<${address}>`;
  assertNoLineBreaks("display name", name);
  const display = /^[\x20-\x7e]*$/.test(name)
    ? /^[A-Za-z0-9 ]*$/.test(name)
      ? name
      : `"${name.replace(/(["\\])/g, "\\$1")}"`
    : encodeHeaderText(name);
  return `${display} <${address}>`;
}

function rfc5322Date(d: Date): string {
  return d.toUTCString().replace("GMT", "+0000");
}

/** Builds the full RFC 5322 message (headers + multipart/alternative body), CRLF line endings, no trailing dot. */
export function buildMimeMessage(msg: MailMessage): string {
  assertNoLineBreaks("Message-ID", msg.messageId);
  if (!/^<[^<>\s]+>$/.test(msg.messageId)) throw new SmtpError("Message-ID must look like <id@host>", { step: "compose" });

  const boundary = `=_npe_${crypto.randomUUID().replace(/-/g, "")}`;
  const headers: string[] = [
    `From: ${formatMailbox(msg.from.name, msg.from.address)}`,
    `To: ${formatMailbox(undefined, msg.to)}`,
  ];
  if (msg.replyTo) headers.push(`Reply-To: ${formatMailbox(undefined, msg.replyTo)}`);
  headers.push(
    `Subject: ${encodeHeaderText(msg.subject)}`,
    `Date: ${rfc5322Date(msg.date ?? new Date())}`,
    `Message-ID: ${msg.messageId}`,
    "MIME-Version: 1.0",
  );
  for (const [k, v] of Object.entries(msg.headers ?? {})) {
    if (!/^[A-Za-z0-9-]+$/.test(k)) throw new SmtpError(`Invalid header name: ${k}`, { step: "compose" });
    headers.push(`${k}: ${encodeHeaderText(v)}`);
  }
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

  const part = (type: string, body: string) =>
    [`--${boundary}`, `Content-Type: ${type}; charset=utf-8`, "Content-Transfer-Encoding: base64", "", base64Body(body)].join(CRLF);

  // Plain text first, HTML last: clients render the last alternative they understand.
  return [headers.join(CRLF), "", part("text/plain", msg.text), part("text/html", msg.html), `--${boundary}--`, ""].join(CRLF);
}

/** Dot-stuffing (RFC 5321 §4.5.2) with normalised CRLF line endings. */
function dotStuff(message: string): string {
  return message
    .replace(/\r?\n/g, CRLF)
    .split(CRLF)
    .map((l) => (l.startsWith(".") ? `.${l}` : l))
    .join(CRLF);
}

/* ------------------------------------------------------------------ */
/* Connection                                                          */
/* ------------------------------------------------------------------ */

type Reply = { code: number; text: string; lines: string[] };

async function defaultConnect(host: string, port: number): Promise<SmtpSocket> {
  // The ignore comments stop Next's bundlers from trying to resolve the Workers-only scheme at build time.
  // @ts-ignore -- module only exists inside workerd
  const mod = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "cloudflare:sockets");
  const socket = mod.connect({ hostname: host, port }, { secureTransport: "on", allowHalfOpen: false });
  // Surface connect/TLS failures here rather than on the first read.
  await socket.opened;
  return socket as SmtpSocket;
}

function withTimeout<T>(promise: Promise<T>, ms: number, step: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SmtpError(`SMTP timeout after ${ms}ms during ${step}`, { step })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

class SmtpConnection {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private decoder = new TextDecoder();
  private buffer = "";

  constructor(
    private socket: SmtpSocket,
    private timeoutMs: number,
  ) {
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }

  private async readLine(step: string): Promise<string> {
    for (;;) {
      const idx = this.buffer.indexOf("\n");
      if (idx >= 0) {
        const line = this.buffer.slice(0, idx).replace(/\r$/, "");
        this.buffer = this.buffer.slice(idx + 1);
        return line;
      }
      const { value, done } = await withTimeout(this.reader.read(), this.timeoutMs, step);
      if (done) throw new SmtpError("SMTP connection closed unexpectedly", { step });
      this.buffer += this.decoder.decode(value, { stream: true });
      if (this.buffer.length > 64 * 1024) throw new SmtpError("SMTP response too large", { step });
    }
  }

  async readReply(step: string): Promise<Reply> {
    const lines: string[] = [];
    for (;;) {
      const line = await this.readLine(step);
      const m = /^(\d{3})([ -]|$)/.exec(line);
      if (!m) throw new SmtpError(`Malformed SMTP reply during ${step}: ${line.slice(0, 80)}`, { step });
      lines.push(line);
      if (m[2] !== "-") {
        return { code: Number(m[1]), lines, text: lines.map((l) => l.slice(4)).join("\n") };
      }
    }
  }

  async write(data: string, step: string): Promise<void> {
    await withTimeout(this.writer.write(encoder.encode(data)), this.timeoutMs, step);
  }

  /** Sends one command and requires one of `ok` as the reply code. `label` keeps secrets out of error text. */
  async command(line: string, ok: number[], step: string): Promise<Reply> {
    await this.write(line + CRLF, step);
    return this.expect(await this.readReply(step), ok, step);
  }

  expect(reply: Reply, ok: number[], step: string): Reply {
    if (!ok.includes(reply.code)) {
      throw new SmtpError(`SMTP ${step} failed: ${reply.code} ${reply.text.split("\n")[0].slice(0, 200)}`, { code: reply.code, step });
    }
    return reply;
  }

  async close(graceful: boolean): Promise<void> {
    if (graceful) {
      try {
        await this.write("QUIT" + CRLF, "QUIT");
        await withTimeout(this.readReply("QUIT"), 3000, "QUIT");
      } catch {
        /* the message is already accepted; a failed QUIT must not turn success into failure */
      }
    }
    await this.reader.cancel().catch(() => {});
    try {
      this.writer.releaseLock();
    } catch {
      /* pending write on a dead socket */
    }
    await this.socket.close().catch(() => {});
  }
}

async function openSession(cfg: SmtpConfig): Promise<SmtpConnection> {
  const timeoutMs = cfg.timeoutMs ?? 15_000;
  const connect = cfg.connect ?? defaultConnect;
  let socket: SmtpSocket;
  try {
    socket = await withTimeout(Promise.resolve(connect(cfg.host, cfg.port)), timeoutMs, "connect");
  } catch (err) {
    if (err instanceof SmtpError) throw err;
    throw new SmtpError(`SMTP connect to ${cfg.host}:${cfg.port} failed: ${err instanceof Error ? err.message : String(err)}`, { step: "connect" });
  }

  const conn = new SmtpConnection(socket, timeoutMs);
  try {
    conn.expect(await conn.readReply("greeting"), [220], "greeting");

    const helo = cfg.heloName ?? cfg.user.split("@")[1] ?? "localhost";
    const ehlo = await conn.command(`EHLO ${helo}`, [250], "EHLO");
    const authLine = ehlo.lines.map((l) => l.slice(4).toUpperCase()).find((l) => l.startsWith("AUTH "));
    const mechs = (authLine ?? "").split(/\s+/).slice(1);

    if (mechs.includes("PLAIN") || mechs.length === 0) {
      await conn.command(`AUTH PLAIN ${b64(`\0${cfg.user}\0${cfg.pass}`)}`, [235], "AUTH");
    } else if (mechs.includes("LOGIN")) {
      await conn.command("AUTH LOGIN", [334], "AUTH");
      await conn.command(b64(cfg.user), [334], "AUTH");
      await conn.command(b64(cfg.pass), [235], "AUTH");
    } else {
      throw new SmtpError(`No supported AUTH mechanism offered (${mechs.join(", ")})`, { step: "AUTH" });
    }
    return conn;
  } catch (err) {
    await conn.close(false);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Sends one message. Resolves only after the server has accepted it (250 after DATA). */
export async function sendSmtp(cfg: SmtpConfig, msg: MailMessage): Promise<{ response: string }> {
  // Compose first: bad input should fail before we open a socket.
  const mime = dotStuff(buildMimeMessage(msg));
  const from = assertAddress(msg.from.address);
  const to = assertAddress(msg.to);

  const conn = await openSession(cfg);
  let ok = false;
  try {
    await conn.command(`MAIL FROM:<${from}>`, [250], "MAIL FROM");
    await conn.command(`RCPT TO:<${to}>`, [250, 251], "RCPT TO");
    await conn.command("DATA", [354], "DATA");
    await conn.write(mime + CRLF + "." + CRLF, "DATA body");
    const done = conn.expect(await conn.readReply("DATA accept"), [250], "DATA accept");
    ok = true;
    return { response: done.text.split("\n")[0] };
  } finally {
    await conn.close(ok);
  }
}

/** Connect + EHLO + AUTH + QUIT, no mail sent. Reports per-step timings; used by the diagnostic route. */
export async function probeSmtp(cfg: SmtpConfig): Promise<{ ok: true; ms: number }> {
  const t0 = Date.now();
  const conn = await openSession(cfg);
  await conn.close(true);
  return { ok: true, ms: Date.now() - t0 };
}