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
      .on("data-invalid", () => {
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
    const resp = await prisma.$transaction(
      async (prisma) => {
        try {
          const res = await processCSVFile(fileName, time, prisma);
          return res;
        } catch (err) {
          await prisma.$queryRaw`ROLLBACK`;
          return err;
        }
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 20000, // default: 5000
      }
    );
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
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: {
      id,
    },
  });
}
export async function getAllUsers(
  offset: number,
  limit: number,
  whereQuery: {},
  sortQuery: {}
) {
  return prisma.$transaction([
    prisma.user.count({
      where: {
        ...whereQuery,
      },
    }),
    prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        ...sortQuery,
      },
      where: {
        ...whereQuery,
      },
      select: {
        id: true,
        login: true,
        name: true,
        salary: true,
      },
    }),
  ]);
}
