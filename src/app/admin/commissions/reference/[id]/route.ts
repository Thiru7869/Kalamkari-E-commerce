import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

/**
 * Serves a commission reference picture.
 *
 * Admin only, and the guard runs before the row is read — the same rule every
 * admin page follows. These are photographs customers sent privately, often of
 * their own homes and their own wardrobes, and a guessable cuid must never be
 * enough to fetch one.
 *
 * `no-store` because the response is private by definition: it must not sit in
 * a shared cache, and a CDN must not be able to serve it to the next caller.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Before the query, not after it. If this does not return, nothing is read.
  await requireAdmin();

  const { id } = await params;

  const reference = await prisma.commissionReference.findUnique({
    where: { id },
    select: { data: true, mimeType: true, filename: true, size: true },
  });

  if (!reference) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(reference.data), {
    headers: {
      'Content-Type': reference.mimeType,
      'Content-Length': String(reference.size),
      // Shown inline in the admin list, but never sniffed into something else.
      'Content-Disposition': `inline; filename="${reference.filename.replace(/"/g, '')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, private',
    },
  });
}
