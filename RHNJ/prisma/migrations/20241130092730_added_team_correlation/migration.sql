-- AlterTable
ALTER TABLE "UserCharacter" ADD COLUMN     "teamId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
