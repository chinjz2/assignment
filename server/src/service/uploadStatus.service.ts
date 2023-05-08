import { prisma } from "../utils/db";
import type { UploadStatus } from "@prisma/client";

export async function getUploadStatus(): Promise<UploadStatus[] | null> {
  return prisma.uploadStatus.findMany({
    take: 1,
    select: {
      uploading: true,
      owner: true,
      updatedAt: true,
    },
  });
}
export async function updateUploadStatus({
  flag,
  owner,
}: {
  flag: boolean;
  owner: string;
}): Promise<UploadStatus> {
  return prisma.uploadStatus.update({
    where: {
      uploading: !flag,
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
  return prisma.uploadStatus.create({
    data: {
      ...uS,
    },
  });
}
