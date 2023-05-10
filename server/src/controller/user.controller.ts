import { RequestHandler } from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  createUsers,
  deleteUser,
} from "~/service/user.service";
import {
  getUploadLockHandler,
  freeUploadLockHandler,
} from "~/controller/upload.controller";
import { Request, Response } from "express";
import type { User } from "@prisma/client";
import {
  GetAllUsersInput,
  uploadUsersFromFileInput,
  uploadUserFileInput,
} from "~/schema/user.schema";

import fs from "fs";
import md5 from "md5";

export const uploadUserFileHandler: RequestHandler<
  {},
  {},
  {},
  uploadUserFileInput["query"]
> = async (req, res) => {
  try {
    const { name, currentChunkIndex, totalChunks, id } = req.query;
    const ext = name!.split(".").pop();
    if (ext !== "csv") return res.sendStatus(400);
    const uploadStatus = await getUploadLockHandler(id);
    if (!uploadStatus) return res.sendStatus(403);

    const firstChunk = parseInt(currentChunkIndex) === 0;
    const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;

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
      await freeUploadLockHandler();
      res.status(200).json({ name: finalFilename });
    } else {
      res.json("ok");
    }
  } catch (err) {
    console.log(err);
  }
};
export async function uploadUsersFromFileHandler(
  req: Request<{}, {}, uploadUsersFromFileInput["body"]>,
  res: Response
) {
  try {
    const { fileName, time } = req.body;
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
export const getAllUsersHandler: RequestHandler<
  {},
  {},
  {},
  GetAllUsersInput["query"]
> = async (req, res) => {
  try {
    const { minSalary, maxSalary, offset, limit, sort } = req.query;

    let whereQuery = {};
    let sortQuery = {};
    if (parseInt(minSalary) <= parseInt(maxSalary)) {
      whereQuery = {
        salary: {
          lte: parseInt(maxSalary),
          gte: parseInt(minSalary),
        },
      };
    }
    if (sort.length > 0) {
      const order = sort[0] === "+" ? "asc" : "desc";
      sortQuery = {
        [`${sort.substring(1)}`]: order,
      };
    }
    const resp = await getAllUsers(
      parseInt(offset),
      parseInt(limit),
      whereQuery,
      sortQuery
    );
    res.status(200).json({ count: resp[0], data: resp[1] });
  } catch (err) {
    console.log("err", err);
    return res.sendStatus(400);
  }
};
