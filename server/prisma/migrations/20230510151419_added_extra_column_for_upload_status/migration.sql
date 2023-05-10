/*
  Warnings:

  - The primary key for the `UploadStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `UploadStatus` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UploadStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploading" BOOLEAN NOT NULL,
    "owner" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UploadStatus" ("owner", "updatedAt", "uploading") SELECT "owner", "updatedAt", "uploading" FROM "UploadStatus";
DROP TABLE "UploadStatus";
ALTER TABLE "new_UploadStatus" RENAME TO "UploadStatus";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
