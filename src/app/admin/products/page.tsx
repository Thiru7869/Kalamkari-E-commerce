import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { ProductAdminRow } from '@/components/admin/product-admin-row';
import { formatPrice } from '@/lib/utils';
import { primaryImage } from '@/lib/serialize';

export const metadata: Metadata = {
  title: 'Catalogue',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  // Must precede every query — see lib/require-admin.ts.
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { category: { select: { name: true } }, fabric: { select: { name: true } } },
  });

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-display-md">Catalogue</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} pieces
        </p>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Stock and visibility can be changed here. Adding new pieces and editing copy is done
        through Prisma Store (<code>npm run db:store</code>) — a full CMS was deliberately
        left out rather than half-built.
      </p>

      <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full min-w-[54rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="px-4 py-3 font-medium">Piece</th>
              <th scope="col" className="px-4 py-3 font-medium">Category</th>
              <th scope="col" className="px-4 py-3 font-medium">Cloth</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Stock</th>
              <th scope="col" className="px-4 py-3 font-medium">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden rounded-sm bg-cotton-300">
                      <Image
                        src={primaryImage(product.images)}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product.category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.fabric?.name ?? '—'}
                </td>
                <td className="tabular px-4 py-3 text-right">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <ProductAdminRow
                    productId={product.id}
                    stock={product.stock}
                    status={product.status}
                    field="stock"
                  />
                </td>
                <td className="px-4 py-3">
                  <ProductAdminRow
                    productId={product.id}
                    stock={product.stock}
                    status={product.status}
                    field="status"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
