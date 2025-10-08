-- CreateTable
CREATE TABLE "DailySteps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySteps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'breath',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeditationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sleepDate" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "quality" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepsGoal" INTEGER NOT NULL DEFAULT 7000,
    "meditationGoalMin" INTEGER NOT NULL DEFAULT 10,
    "sleepGoalHours" DOUBLE PRECISION NOT NULL DEFAULT 7.0,
    "tilesEnabled" JSONB NOT NULL DEFAULT '{"steps":true,"meditation":true,"sleep":true,"water":true}',
    "notificationsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySteps_userId_date_idx" ON "DailySteps"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySteps_userId_date_key" ON "DailySteps"("userId", "date");

-- CreateIndex
CREATE INDEX "MeditationSession_userId_date_idx" ON "MeditationSession"("userId", "date");

-- CreateIndex
CREATE INDEX "SleepLog_userId_sleepDate_idx" ON "SleepLog"("userId", "sleepDate");

-- CreateIndex
CREATE UNIQUE INDEX "SleepLog_userId_sleepDate_key" ON "SleepLog"("userId", "sleepDate");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessPreferences_userId_key" ON "WellnessPreferences"("userId");

-- CreateIndex
CREATE INDEX "WellnessPreferences_userId_idx" ON "WellnessPreferences"("userId");

-- AddForeignKey
ALTER TABLE "DailySteps" ADD CONSTRAINT "DailySteps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationSession" ADD CONSTRAINT "MeditationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessPreferences" ADD CONSTRAINT "WellnessPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
