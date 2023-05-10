import * as z from "zod";
import { User } from "@prisma/client";

/**
 * @openapi
 * components:
 *   schema:
 *     Users:
 *       type: object
 *       required:
 *        - id
 *        - login
 *        - name
 *        - salary
 *       properties:
 *         id:
 *           type: string
 *         login:
 *           type: string
 *         name:
 *           type: string
 *         salary:
 *           type: number
 */

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

export const uploadUserFileSchema = z.object({
  query: z.object({
    name: z.string(),
    currentChunkIndex: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    totalChunks: z
      .string()
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "invalid number",
      }),
    id: z.string(),
  }),
});
export const uploadUsersFromFileSchema = z.object({
  body: z.object({
    fileName: z.string(),
    time: z.coerce.date(),
  }),
});

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
export type uploadUserFileInput = z.TypeOf<typeof uploadUserFileSchema>;
export type uploadUsersFromFileInput = z.TypeOf<
  typeof uploadUsersFromFileSchema
>;
export type GetAllUsersInput = z.TypeOf<typeof getAllUsersSchema>;
