/*
  Warnings:

  - Made the column `tokenExpireDate` on table `PasswordReset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."PasswordReset" ALTER COLUMN "tokenExpireDate" SET NOT NULL;
