/*
  Warnings:

  - You are about to drop the column `passwordResetRequest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updateInfoAccess` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "passwordResetRequest",
DROP COLUMN "updateInfoAccess",
DROP COLUMN "userId";
