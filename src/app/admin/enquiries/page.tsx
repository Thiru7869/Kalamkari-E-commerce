import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { EnquiryToggle } from '@/components/admin/enquiry-toggle';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Enquiries',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  // Must precede every query — see lib/require-admin.ts. These rows contain
  // customer names, emails and message contents.
  await requireAdmin();

  const enquiries = await prisma.enquiry.findMany({
    orderBy: [{ handled: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  });

  const unread = enquiries.filter((e) => !e.handled).length;

  return (
    <>
      <h1 className="text-display-md">Enquiries</h1>
      <p className="mt-2 text-muted-foreground">
        {enquiries.length} total{unread > 0 && ` · ${unread} unread`}
      </p>

      {enquiries.length === 0 ? (
        <p className="mt-8 rounded-sm border border-border bg-background p-10 text-center text-muted-foreground">
          No messages yet.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {enquiries.map((enquiry) => (
            <li
              key={enquiry.id}
              className={`rounded-sm border bg-background p-5 ${
                enquiry.handled ? 'border-border opacity-70' : 'border-primary/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg">{enquiry.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {enquiry.name} ·{' '}
                    <a
                      href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {enquiry.email}
                    </a>
                    {enquiry.phone && ` · ${enquiry.phone}`}
                    {' · '}
                    {formatDate(enquiry.createdAt)}
                  </p>
                </div>
                <EnquiryToggle id={enquiry.id} handled={enquiry.handled} />
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
                {enquiry.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
