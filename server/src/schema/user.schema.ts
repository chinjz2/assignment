import * as z from "zod";
import { User } from "@prisma/client";

type user = Omit<User, "createdAt">;
const userEnum = z.enum([
  "+id",
  "-id",
  "+login",
  "-login",
  "+name",
  "-name",
  "+salary",
  "-salary",
]);

export const getAllUsersSchema = z.object({
  query: z.object({
    minSalary: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    maxSalary: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    offset: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    limit: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    sort: userEnum,
  }),
});
export type GetAllUsersInput = z.TypeOf<typeof getAllUsersSchema>;
