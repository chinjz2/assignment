import { prisma } from "../src/utils/db";
import type { UploadStatus } from "@prisma/client";

async function seed() {
  return prisma.uploadStatus.upsert({
    where: {
      id: "main",
    },
    create: {
      id: "main",
      uploading: false,
      owner: "",
      updatedAt: new Date(),
    },
    update: {
      uploading: false,
      owner: "",
    },
  });
}
seed();
