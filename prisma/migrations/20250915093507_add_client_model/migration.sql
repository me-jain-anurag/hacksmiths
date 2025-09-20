-- AlterTable
ALTER TABLE "public"."audit_logs" ADD COLUMN     "apiClientId" INTEGER,
ADD COLUMN     "apiClientName" TEXT;

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_apiKey_key" ON "public"."clients"("apiKey");
