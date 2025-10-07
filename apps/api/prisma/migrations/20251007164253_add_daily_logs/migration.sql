-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "flow" TEXT,
    "cramps" INTEGER,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mood" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hadSex" BOOLEAN NOT NULL DEFAULT false,
    "contraception" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sexNotes" TEXT,
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "healthNotes" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyLog_userId_date_idx" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PeriodCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
