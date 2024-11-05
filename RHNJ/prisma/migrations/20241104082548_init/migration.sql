-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCharacter" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterName" TEXT NOT NULL,
    "description" TEXT,
    "characterClass" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "image" TEXT,
    "attributes" JSONB NOT NULL,
    "savingThrows" TEXT[],
    "skills" TEXT[],
    "singleUseSkill" TEXT[],
    "statusPoints" INTEGER NOT NULL,
    "attackRoll" TEXT NOT NULL,
    "catchPhrases" TEXT[],
    "abilities" TEXT[],
    "ideals" TEXT,
    "flaws" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
