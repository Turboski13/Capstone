-- AlterTable
ALTER TABLE "UserCharacter" ADD COLUMN     "items" TEXT[];

-- AlterTable
ALTER TABLE "_UserTeams" ADD CONSTRAINT "_UserTeams_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserTeams_AB_unique";
