/*
  Warnings:

  - A unique constraint covering the columns `[login]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_id_login_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
