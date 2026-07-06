-- CreateEnum
CREATE TYPE "service_call_type" AS ENUM ('bill', 'waiter');
CREATE TYPE "service_call_status" AS ENUM ('waiting', 'accepted', 'completed');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "display_number" INTEGER;
ALTER TABLE "orders" ADD COLUMN "notes" TEXT;

-- Backfill display numbers for existing orders (starts at 1001 per restaurant)
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY created_at) + 1000 AS num
  FROM orders
  WHERE display_number IS NULL
)
UPDATE orders o
SET display_number = n.num
FROM numbered n
WHERE o.id = n.id;

-- CreateIndex
CREATE UNIQUE INDEX "uq_orders_restaurant_display_number" ON "orders"("restaurant_id", "display_number");

-- CreateTable
CREATE TABLE "service_calls" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "table_id" UUID NOT NULL,
    "type" "service_call_type" NOT NULL,
    "reason" VARCHAR(100),
    "status" "service_call_status" NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_service_calls_restaurant_status" ON "service_calls"("restaurant_id", "status");
CREATE INDEX "idx_service_calls_table" ON "service_calls"("table_id");

-- AddForeignKey
ALTER TABLE "service_calls" ADD CONSTRAINT "service_calls_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_calls" ADD CONSTRAINT "service_calls_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
