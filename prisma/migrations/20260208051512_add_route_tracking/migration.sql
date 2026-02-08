-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "addressLat" DOUBLE PRECISION,
ADD COLUMN     "addressLng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LocationHistory" ADD COLUMN     "isEndPoint" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStartPoint" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobId" TEXT;

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "currentJobId" TEXT;

-- CreateTable
CREATE TABLE "TechnicianRoute" (
    "id" SERIAL NOT NULL,
    "techId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION,
    "endLng" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TechnicianRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianRoute_jobId_key" ON "TechnicianRoute"("jobId");

-- AddForeignKey
ALTER TABLE "LocationHistory" ADD CONSTRAINT "LocationHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianRoute" ADD CONSTRAINT "TechnicianRoute_techId_fkey" FOREIGN KEY ("techId") REFERENCES "Technician"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianRoute" ADD CONSTRAINT "TechnicianRoute_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
