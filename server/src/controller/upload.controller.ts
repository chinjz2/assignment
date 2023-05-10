import {
  getUploadStatus,
  updateUploadStatus,
  createUploadStatus,
} from "~/service/upload.service";

import type { UploadStatus } from "@prisma/client";

const fileTimeout = 60000;

export async function getUploadLockHandler(id: string) {
  try {
    const uploadStatus = await getUploadStatus("main");
    if (
      uploadStatus &&
      uploadStatus.owner !== "" &&
      uploadStatus.owner !== id &&
      new Date().getTime() - new Date(uploadStatus.updatedAt).getTime() <
        fileTimeout
    )
      return false;

    if (!uploadStatus)
      await createUploadStatus({
        id: "main",
        uploading: true,
        owner: id,
        updatedAt: new Date(),
      });
    else await updateUploadStatus({ id: "main", flag: true, owner: id });

    return true;
  } catch (err) {
    return false;
  }
}
export async function freeUploadLockHandler() {
  try {
    await updateUploadStatus({ id: "main", flag: false, owner: "" });
  } catch (err) {
    console.log(err);
  }
}
export async function createUploadStatusHandler(obj: UploadStatus) {
  try {
    const resp = await createUploadStatus(obj);
    return resp;
  } catch (err) {
    console.log(err);
  }
}
