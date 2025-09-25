-- CreateTable
CREATE TABLE "public"."SessionEditLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "beforeIn" TIMESTAMP(3),
    "beforeOut" TIMESTAMP(3),
    "afterIn" TIMESTAMP(3),
    "afterOut" TIMESTAMP(3),
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "SessionEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settings" (
    "key" TEXT NOT NULL,
    "valueInt" INTEGER,
    "valueStr" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "SessionEditLog_sessionId_at_idx" ON "public"."SessionEditLog"("sessionId", "at");

-- CreateIndex
CREATE INDEX "SessionEditLog_editorId_at_idx" ON "public"."SessionEditLog"("editorId", "at");

-- AddForeignKey
ALTER TABLE "public"."SessionEditLog" ADD CONSTRAINT "SessionEditLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionEditLog" ADD CONSTRAINT "SessionEditLog_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "public"."Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
