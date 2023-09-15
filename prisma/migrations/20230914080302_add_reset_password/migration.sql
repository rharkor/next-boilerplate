-- CreateTable
CREATE TABLE "ResetPassordToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassordToken_identifier_key" ON "ResetPassordToken"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassordToken_token_key" ON "ResetPassordToken"("token");

-- AddForeignKey
ALTER TABLE "ResetPassordToken" ADD CONSTRAINT "ResetPassordToken_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
