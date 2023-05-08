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
): Promise<csvRowProps[]> => {
  return new Promise((resolve, reject) => {
    const dataFull: csvRowProps[] = [];
    const fileStream = fs.createReadStream(`./uploads/${fileName}`);
    parseStream(fileStream, { headers: true })
      .on("data", async function (data: csvRowProps) {
        if (data.salary < 0.0) return reject("Invalid salary");
        if (data.id[0] != "#") dataFull.push(data);
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve(dataFull);
      });
  });
};
export async function createUsers(fileName: string, time: Date): Promise<void> {
  try {
    const data: csvRowProps[] = await processCSVFile(fileName, time, prisma);
    for (const cData of data) {
      await prisma.user.upsert({
        where: {
          id: cData.id,
        },
        create: {
          id: cData.id,
          login: cData.login,
          name: cData.name,
          salary: +cData.salary,
          createdAt: new Date(time),
        },
        update: {
          login: cData.login,
          name: cData.name,
          salary: +cData.salary,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}
export async function createUser(user: User): Promise<User> {
  return prisma.user.create({
    data: {
      ...user,
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
