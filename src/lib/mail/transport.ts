import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';
import { site } from '@/content/site';

/**
 * The one place this codebase sends mail from.
 *
 * It reuses the SMTP configuration Auth.js already relies on for magic links
 * rather than introducing a second mail setup — one transport, one place to
 * change, one thing to get wrong.
 *
 * Two rules are enforced here rather than left to call sites:
 *
 *  1. **Nothing is ever delivered outside production.** Not when SMTP happens
 *     to be configured locally, not when someone is testing against a staging
 *     database with real customer rows in it. Outside production every message
 *     is written to the server console in full and dropped. Sending a real
 *     dispatch notice to a real customer from a developer's laptop is the kind
 *     of mistake that is only made once, and only needs to be made once.
 *
 *  2. **A failure to send never propagates.** Every function returns a result
 *     rather than throwing. An order is placed, a payment is captured and stock
 *     is decremented whether or not a mail server answers; losing the receipt
 *     is recoverable, failing the checkout because a mail host was slow is not.
 */

export type MailResult =
  | { status: 'sent' }
  | { status: 'previewed'; reason: 'not-production' | 'not-configured' }
  | { status: 'skipped'; reason: 'no-recipient' }
  | { status: 'failed'; error: string };

export type MailMessage = {
  to: string;
  subject: string;
  /** The real message. Every email here is written to be readable as text. */
  text: string;
  /** Optional light HTML rendering of the same content. Never image-bearing. */
  html?: string;
  /** Where a reply should go, when that differs from the sending identity. */
  replyTo?: string;
};

/** Mirrors the check in src/auth.ts — the same host drives both. */
export function isMailConfigured(): boolean {
  return Boolean(process.env.EMAIL_SERVER_HOST);
}

/** True only when mail will actually leave the building. */
export function willDeliver(): boolean {
  return isMailConfigured() && process.env.NODE_ENV === 'production';
}

let cached: Transporter | null = null;

function transport(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    // 465 is implicit TLS; everything else upgrades with STARTTLS.
    secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  return cached;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? 'no-reply@example.com';
}

/**
 * The address the store reads.
 *
 * Falls back to the published contact address, so a deployment that has filled
 * in `site.contact.email` needs no further configuration. Returns null when
 * neither is set, in which case store-side notifications are previewed rather
 * than sent — never silently discarded.
 */
export function storeInbox(): string | null {
  const configured = process.env.STORE_NOTIFICATION_EMAIL?.trim();
  if (configured) return configured;
  return site.contact.email.trim() || null;
}

function preview(message: MailMessage, reason: string) {
  console.log(
    [
      '',
      '  ┌─ Email (not delivered: ' + reason + ') ──────────────────────────',
      `  │  to:      ${message.to}`,
      `  │  subject: ${message.subject}`,
      message.replyTo ? `  │  reply-to: ${message.replyTo}` : null,
      '  ├────────────────────────────────────────────────────────────────',
      ...message.text.split('\n').map((line) => `  │  ${line}`),
      '  └────────────────────────────────────────────────────────────────',
      '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!message.to) return { status: 'skipped', reason: 'no-recipient' };

  if (process.env.NODE_ENV !== 'production') {
    preview(message, 'development');
    return { status: 'previewed', reason: 'not-production' };
  }

  if (!isMailConfigured()) {
    preview(message, 'no SMTP host configured');
    return { status: 'previewed', reason: 'not-configured' };
  }

  try {
    await transport().sendMail({
      from: fromAddress(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
    return { status: 'sent' };
  } catch (error) {
    // Logged, not thrown. See the note at the top of this file.
    console.error(`[mail] failed to send "${message.subject}":`, error);
    return { status: 'failed', error: error instanceof Error ? error.message : 'unknown' };
  }
}
