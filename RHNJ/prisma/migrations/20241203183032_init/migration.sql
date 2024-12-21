/*
  Warnings:

  - You are about to drop the column `assets` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "assets";

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "properties" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
