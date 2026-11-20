-- Phase 1 backend hardening. Additive only: one new table, one index, and four
-- CHECK constraints. Nothing here deletes or rewrites a row.

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");

-- CreateIndex: payment-failure webhooks look an order up by its Razorpay id.
CREATE INDEX "Order_razorpayOrderId_idx" ON "Order"("razorpayOrderId");

-- Integrity constraints.
--
-- Added NOT VALID: Postgres enforces them on every INSERT and UPDATE from this
-- moment, without scanning the table or refusing to apply because of a row
-- written before they existed. The block after them then tries to VALIDATE
-- each one, and if old data violates it the migration still succeeds - it
-- raises a WARNING naming the constraint, so the rows can be looked at by a
-- person instead of being deleted by a migration.
ALTER TABLE "CartItem"  ADD CONSTRAINT "CartItem_quantity_positive"  CHECK ("quantity" > 0)  NOT VALID;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive" CHECK ("quantity" > 0)  NOT VALID;
ALTER TABLE "Product"   ADD CONSTRAINT "Product_stock_nonnegative"   CHECK ("stock" >= 0)    NOT VALID;
ALTER TABLE "Order"     ADD CONSTRAINT "Order_total_nonnegative"     CHECK ("total" >= 0)    NOT VALID;

DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT * FROM (VALUES
      ('CartItem',  'CartItem_quantity_positive'),
      ('OrderItem', 'OrderItem_quantity_positive'),
      ('Product',   'Product_stock_nonnegative'),
      ('Order',     'Order_total_nonnegative')
    ) AS t(tbl, name)
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I', c.tbl, c.name);
    EXCEPTION WHEN check_violation THEN
      RAISE WARNING 'Existing rows violate % on "%": enforced for new writes, not yet validated. Find and correct them by hand.', c.name, c.tbl;
    END;
  END LOOP;
END $$;
