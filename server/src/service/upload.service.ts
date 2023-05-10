import { prisma } from "../utils/db";
import type { UploadStatus } from "@prisma/client";

export async function getUploadStatus(
  id: string
): Promise<UploadStatus | null> {
  return prisma.uploadStatus.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      uploading: true,
      owner: true,
      updatedAt: true,
    },
  });
}
export async function updateUploadStatus({
  id,
  flag,
  owner,
}: {
  id: string;
  flag: boolean;
  owner: string;
}): Promise<UploadStatus> {
  return prisma.uploadStatus.update({
    where: {
      id: id,
    },
    data: {
      uploading: flag,
      owner: owner,
    },
  });
}
export async function createUploadStatus(
  uS: UploadStatus
): Promise<UploadStatus> {
  return prisma.uploadStatus.upsert({
    where: {
      id: uS.id,
    },
    create: {
      id: uS.id,
      uploading: uS.uploading,
      owner: uS.owner,
      updatedAt: uS.updatedAt,
    },
    update: {
      uploading: uS.uploading,
      owner: uS.owner,
    },
  });
}
