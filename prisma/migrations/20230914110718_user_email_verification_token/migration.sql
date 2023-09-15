-- CreateTable
CREATE TABLE "UserEmailVerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailVerificationToken_identifier_key" ON "UserEmailVerificationToken"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailVerificationToken_token_key" ON "UserEmailVerificationToken"("token");

-- AddForeignKey
ALTER TABLE "UserEmailVerificationToken" ADD CONSTRAINT "UserEmailVerificationToken_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
