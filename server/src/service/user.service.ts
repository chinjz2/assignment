import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../utils/db";
import type { User } from "@prisma/client";

import fs from "fs";
import { parseStream } from "fast-csv";

export async function getUser(
  id: string
): Promise<Omit<User, "createdAt"> | null> {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      login: true,
      name: true,
      salary: true,
    },
  });
}
export async function getAllUsers({
  limit,
  offset,
  minSalary,
  maxSalary,
  col,
  order,
}: {
  limit: number;
  offset: number;
  minSalary: number;
  maxSalary: number;
  col: string;
  order: string;
}): Promise<User[]> {
  return prisma.user.findMany({
    skip: offset,
    take: limit,
    orderBy: {
      [col]: order,
    },
    where: {
      salary: {
        lte: maxSalary,
        gte: minSalary,
      },
    },
  });
}
type csvRowProps = { id: string; login: string; name: string; salary: number };
const processCSVFile = async (
  fileName: string,
  time: Date,
  prisma: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const promiseTracker = new Set();
    const fileStream = fs.createReadStream(`./uploads/${fileName}`);
    parseStream(fileStream, { headers: true, strictColumnHandling: true })
      .on("data", async function (data: csvRowProps) {
        try {
          if (data.salary < 0.0) throw new Error("Invalid salary");
          if (data.id[0] !== "#") {
            promiseTracker.add(data.id);
            await prisma.user.upsert({
              where: {
                id: data.id,
              },
              create: {
                id: data.id,
                login: data.login,
                name: data.name,
                salary: +data.salary,
                createdAt: new Date(time),
              },
              update: {
                login: data.login,
                name: data.name,
                salary: +data.salary,
              },
            });
            promiseTracker.delete(data.id);
          }
        } catch (err) {
          await prisma.$queryRaw`ROLLBACK`;
          reject("Invalid Entry");
        }
      })
      .on("data-invalid", (row, rowNumber) => {
        reject("Invalid columns");
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        let interval: NodeJS.Timeout | undefined = undefined;
        const checkPromisesCompleted = () => {
          if (promiseTracker.size === 0) {
            if (interval) clearInterval(interval);
            resolve("Success");
            return;
          }
        };
        checkPromisesCompleted();
        setInterval(checkPromisesCompleted, 200);
        setTimeout(() => {
          if (interval) clearInterval(interval);
          reject("Timeout");
        }, 5000);
      });
  });
};
export async function createUsers(
  fileName: string,
  time: Date
): Promise<number> {
  try {
    const resp = await prisma.$transaction(async (prisma) => {
      try {
        const res = await processCSVFile(fileName, time, prisma);
        return res;
      } catch (err) {
        await prisma.$queryRaw`ROLLBACK`;
        return err;
      }
    });
    if (resp !== "Success") return 400;
    return 200;
  } catch (err) {
    throw err;
  }
}
export async function createUser(user: User): Promise<User> {
  return prisma.user.create({
    data: {
      id: user.id,
      login: user.login,
      name: user.name,
      salary: +user.salary,
      createdAt: user.createdAt,
    },
  });
}
export async function updateUser({
  id,
  fields,
}: {
  id: string;
  fields: [];
}): Promise<User> {
  return prisma.user.update({
    where: {
      id,
    },
    data: {},
  });
}
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: {
      id,
    },
  });
}
