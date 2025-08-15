-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "userType" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."PasswordReset" (
    "Id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpireDate" TEXT,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("Id")
);
