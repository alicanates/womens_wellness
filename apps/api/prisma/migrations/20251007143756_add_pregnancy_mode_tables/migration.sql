-- AlterTable
ALTER TABLE "Pregnancy" ADD COLUMN IF NOT EXISTS "anonymousMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Pregnancy" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Pregnancy" ADD COLUMN IF NOT EXISTS "trimester" INTEGER;
ALTER TABLE "Pregnancy" ALTER COLUMN "doctorNotes" TYPE TEXT;

-- CreateTable
CREATE TABLE "KickCount" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "kickCount" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KickCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contraction" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "intensity" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyAppointment" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "appointmentAt" TIMESTAMP(3) NOT NULL,
    "clinic" TEXT,
    "doctorName" TEXT,
    "notes" TEXT,
    "vitalsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyMedication" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "safetyRating" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthPlan" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "lastExportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalBagItem" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalBagItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyNote" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KickCount_pregnancyId_sessionDate_idx" ON "KickCount"("pregnancyId", "sessionDate");

-- CreateIndex
CREATE INDEX "Contraction_pregnancyId_startTime_idx" ON "Contraction"("pregnancyId", "startTime");

-- CreateIndex
CREATE INDEX "PregnancyAppointment_pregnancyId_appointmentAt_idx" ON "PregnancyAppointment"("pregnancyId", "appointmentAt");

-- CreateIndex
CREATE INDEX "PregnancyMedication_pregnancyId_idx" ON "PregnancyMedication"("pregnancyId");

-- CreateIndex
CREATE UNIQUE INDEX "BirthPlan_pregnancyId_key" ON "BirthPlan"("pregnancyId");

-- CreateIndex
CREATE INDEX "HospitalBagItem_pregnancyId_category_idx" ON "HospitalBagItem"("pregnancyId", "category");

-- CreateIndex
CREATE INDEX "PregnancyNote_pregnancyId_createdAt_idx" ON "PregnancyNote"("pregnancyId", "createdAt");

-- CreateIndex
CREATE INDEX "Pregnancy_userId_idx" ON "Pregnancy"("userId");

-- AddForeignKey
ALTER TABLE "KickCount" ADD CONSTRAINT "KickCount_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contraction" ADD CONSTRAINT "Contraction_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyAppointment" ADD CONSTRAINT "PregnancyAppointment_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyMedication" ADD CONSTRAINT "PregnancyMedication_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthPlan" ADD CONSTRAINT "BirthPlan_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalBagItem" ADD CONSTRAINT "HospitalBagItem_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyNote" ADD CONSTRAINT "PregnancyNote_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "Pregnancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
