import { prisma } from "../src/utils/db";
import type { UploadStatus } from "@prisma/client";

async function seed() {
  return prisma.uploadStatus.create({
    data: {
      id: "main",
      uploading: false,
      owner: "",
      updatedAt: new Date(),
    },
  });
}
seed();
