-- CreateEnum
CREATE TYPE "TechStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ON_WAY', 'ON_SITE');

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "status" "TechStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastPing" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationHistory" (
    "id" SERIAL NOT NULL,
    "techId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "Technician"("email");

-- CreateIndex
CREATE INDEX "LocationHistory_techId_recordedAt_idx" ON "LocationHistory"("techId", "recordedAt");

-- AddForeignKey
ALTER TABLE "LocationHistory" ADD CONSTRAINT "LocationHistory_techId_fkey" FOREIGN KEY ("techId") REFERENCES "Technician"("id") ON DELETE CASCADE ON UPDATE CASCADE;
