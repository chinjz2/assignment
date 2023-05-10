export type User = {
  id: string;
  login: string;
  name: string;
  salary: number;
  createdAt: DateTime;
};
export type EmployeeData = {
  count: number;
  data: User[];
};
