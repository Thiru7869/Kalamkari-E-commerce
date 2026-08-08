import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
  interface User {
    role?: string;
  }
}

const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const hasSmtp = Boolean(process.env.EMAIL_SERVER_HOST);

/**
 * Email sign-in.
 *
 * With SMTP configured this behaves normally. Without it — the default state of
 * a fresh clone — the link is written to the server console instead, so the
 * whole authenticated half of the site is testable locally with no mail
 * account. This override is refused outright in production, because a silently
 * console-logged sign-in link there would be a live account-takeover vector.
 */
const emailProvider = Nodemailer({
  server: hasSmtp
    ? {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      }
    : // Never dialled when sendVerificationRequest is overridden below.
      { host: 'localhost', port: 587, auth: { user: '', pass: '' } },
  from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
  ...(hasSmtp
    ? {}
    : {
        async sendVerificationRequest({ identifier, url }) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error(
              'Email sign-in is enabled but no SMTP server is configured. Set EMAIL_SERVER_HOST and related variables.',
            );
          }
          console.log(
            [
              '',
              '  ┌─ Sign-in link (development only — no SMTP configured) ─────────',
              `  │  to:  ${identifier}`,
              `  │  ${url}`,
              '  └────────────────────────────────────────────────────────────────',
              '',
            ].join('\n'),
          );
        },
      }),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // The Email provider requires database sessions; JWT is not an option here.
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: '/signin',
    verifyRequest: '/signin/check-email',
    error: '/signin',
  },
  providers: [
    emailProvider,
    ...(hasGoogle
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: string }).role ?? 'CUSTOMER';
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      // Claim any guest cart for this account.
      //
      // This runs here, in a route handler, because it deletes the guest
      // cookie — and cookie mutation is illegal during a Server Component
      // render, which is where the cart is otherwise read from. See the note
      // on `resolveCart` in lib/cart.ts.
      //
      // A failure here must never block sign-in: losing a bag is recoverable,
      // being unable to log in is not.
      try {
        const { mergeGuestCart } = await import('@/lib/cart');
        await mergeGuestCart(user.id);
      } catch (error) {
        console.error('[auth] guest cart merge failed:', error);
      }
    },
  },
  trustHost: true,
});

/** Which sign-in methods the deployment actually has configured. */
export const authProviders = { google: hasGoogle, email: true, smtp: hasSmtp };
