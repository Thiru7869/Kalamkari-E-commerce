import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { CommissionStatusSelect } from '@/components/admin/commission-status-select';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Commissions',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const PIECE_LABELS: Record<string, string> = {
  saree: 'Saree',
  dupatta: 'Dupatta',
  blouse: 'Blouse piece',
  painting: 'Painting',
  'home-decor': 'Home decor',
  other: 'Other',
};

export default async function AdminCommissionsPage() {
  // Must precede every query — see lib/require-admin.ts. These rows contain
  // customer names, emails and phone numbers.
  await requireAdmin();

  const requests = await prisma.commissionRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  });

  return (
    <>
      <h1 className="text-display-md">Commissions</h1>
      <p className="mt-2 text-muted-foreground">{requests.length} enquiries</p>

      {requests.length === 0 ? (
        <p className="mt-8 rounded-sm border border-border bg-background p-10 text-center text-muted-foreground">
          No commission enquiries yet.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {requests.map((request) => (
            <li key={request.id} className="rounded-sm border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg">
                    {request.name}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {PIECE_LABELS[request.pieceType] ?? request.pieceType}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${request.email}`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {request.email}
                    </a>
                    {request.phone && ` · ${request.phone}`}
                    {' · '}
                    {formatDate(request.createdAt)}
                  </p>
                </div>
                <CommissionStatusSelect id={request.id} status={request.status} />
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{request.brief}</p>

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4 text-xs">
                {request.fabric && (
                  <div>
                    <dt className="uppercase tracking-[0.12em] text-muted-foreground">Cloth</dt>
                    <dd className="mt-0.5">{request.fabric}</dd>
                  </div>
                )}
                {(request.budgetMin != null || request.budgetMax != null) && (
                  <div>
                    <dt className="uppercase tracking-[0.12em] text-muted-foreground">Budget</dt>
                    <dd className="tabular mt-0.5">
                      {request.budgetMin != null ? formatPrice(request.budgetMin) : '—'}
                      {' – '}
                      {request.budgetMax != null ? formatPrice(request.budgetMax) : '—'}
                    </dd>
                  </div>
                )}
                {request.timeline && (
                  <div>
                    <dt className="uppercase tracking-[0.12em] text-muted-foreground">Timeline</dt>
                    <dd className="mt-0.5">{request.timeline}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
