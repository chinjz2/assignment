/*
  Warnings:

  - Added the required column `updatedAt` to the `UploadStatus` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UploadStatus" (
    "uploading" BOOLEAN NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UploadStatus" ("owner", "uploading") SELECT "owner", "uploading" FROM "UploadStatus";
DROP TABLE "UploadStatus";
ALTER TABLE "new_UploadStatus" RENAME TO "UploadStatus";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
