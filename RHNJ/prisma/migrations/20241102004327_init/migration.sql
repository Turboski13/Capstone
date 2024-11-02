/*
  Warnings:

  - Added the required column `characterDescription` to the `UserCharacter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCharacter" ADD COLUMN     "characterDescription" TEXT NOT NULL;
