import {
  getAllUsers,
  getUser,
  createUser,
  createUsers,
  deleteUser,
} from "~/service/user.service";
import {
  getUploadStatus,
  updateUploadStatus,
} from "~/service/uploadStatus.service";
import { Request, Response } from "express";
import type { User } from "@prisma/client";
import { GetAllUsersInput } from "~/schema/user.schema";

import fs from "fs";
import md5 from "md5";

interface uploadQueryProps {
  name: string;
  currentChunkIndex: string;
  totalChunks: string;
  id: string;
}
const fileTimeout = 60000;

export async function uploadUsersHandler(
  req: Request<{}, {}, {}, uploadQueryProps>,
  res: Response
) {
  try {
    const { name, currentChunkIndex, totalChunks, id }: uploadQueryProps =
      req.query;
    const ext = name.split(".").pop();
    if (ext !== "csv") return res.sendStatus(400);
    const uploadStatus = await getUploadStatus();
    if (
      !uploadStatus ||
      (uploadStatus[0].owner !== "" &&
        uploadStatus[0].owner !== id &&
        new Date().getTime() - new Date(uploadStatus[0].updatedAt).getTime() <
          fileTimeout)
    )
      return res.sendStatus(403);

    if (uploadStatus[0].owner === "")
      await updateUploadStatus({ flag: true, owner: id });

    const firstChunk = parseInt(currentChunkIndex as string) === 0;
    const lastChunk =
      parseInt(currentChunkIndex as string) === parseInt(totalChunks) - 1;

    const data = req.body.toString().split(",")[1];
    const buffer = Buffer.from(data, "base64");

    const tmpFilename = "tmp_" + md5(name + req.ip) + "." + ext;
    if (firstChunk && fs.existsSync("./uploads/" + tmpFilename)) {
      fs.unlinkSync("./uploads/" + tmpFilename);
    }
    fs.appendFileSync("./uploads/" + tmpFilename, buffer);
    if (lastChunk) {
      const finalFilename =
        md5(Date.now().toString()).substring(0, 6) + "." + ext;
      fs.renameSync("./uploads/" + tmpFilename, "./uploads/" + finalFilename);
      await updateUploadStatus({ flag: false, owner: "" });
      res.status(200).json({ name: finalFilename });
    } else {
      res.json("ok");
    }
  } catch (err) {
    console.log(err);
  }
}
export async function createUsersHandler(req: Request, res: Response) {
  try {
    const { fileName, time }: { fileName: string; time: Date } = req.body;
    const resp: number = await createUsers(fileName, time);
    res.sendStatus(resp);
  } catch (err) {
    return res.sendStatus(400);
  }
}
export async function getOneUserHandler(
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) {
  try {
    const { id }: { id: string } = req.params;
    const resp = await getUser(id);
    res.status(200).json(resp);
  } catch (err) {
    console.log("err", err);
    return res.sendStatus(400);
  }
}
export async function createUserHandler(req: Request, res: Response) {
  try {
    const { user }: { user: User } = req.body;
    const resp = await createUser(user);
    res.status(200).json(resp);
  } catch (err) {
    console.log("err", err);
    return res.sendStatus(400);
  }
}
export async function updateUserHandler(req: Request, res: Response) {}

export async function deleteUserHandler(
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) {
  try {
    const { id }: { id: string } = req.params;
    await deleteUser(id);
    res.sendStatus(200);
  } catch (err) {
    console.log("err", err);
    return res.sendStatus(400);
  }
}
export async function getAllUsersHandler(
  req: Request<GetAllUsersInput["query"]>,
  res: Response
) {
  try {
    const { minSalary, maxSalary, offset, limit, sort } = req.query;
    const minSalaryStr: string = minSalary as string;
    const maxSalaryStr: string = maxSalary as string;
    const offsetStr: string = offset as string;
    const limitStr: string = limit as string;
    const sortStr: string = sort as string;

    let whereQuery = {};
    let sortQuery = {};
    if (parseInt(minSalaryStr) <= parseInt(maxSalaryStr)) {
      whereQuery = {
        salary: {
          lte: parseInt(maxSalaryStr),
          gte: parseInt(minSalaryStr),
        },
      };
    }
    if (sortStr.length > 0) {
      const order = sortStr[0] === "+" ? "asc" : "desc";
      sortQuery = {
        [`${sortStr.substring(1)}`]: order,
      };
    }
    const resp = await getAllUsers(
      parseInt(offsetStr),
      parseInt(limitStr),
      whereQuery,
      sortQuery
    );
    res.status(200).json({ count: resp[0], data: resp[1] });
  } catch (err) {
    console.log("err", err);
    return res.sendStatus(400);
  }
}
