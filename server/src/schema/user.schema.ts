import { object, number, string, TypeOf } from "zod";

export const getAllUsersSchema = object({
  query: object({
    minSalary: string().optional().default("-1"),
    maxSalary: string().optional().default("-1"),
    offset: string().optional().default("0"),
    limit: string().optional().default("30"),
    sort: string().optional().default(""),
  }),
});
export type GetAllUsersInput = TypeOf<typeof getAllUsersSchema>;
