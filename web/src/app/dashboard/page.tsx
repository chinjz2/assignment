"use client";
import React, { useEffect, useState, useCallback } from "react";
import { MUISortOptions } from "mui-datatables";
import { DataTableWrapper } from "~/src/components/dataTableWrapper";
import { SalarySearch } from "~/src/components/salarySearch";
import { EmployeeData } from "~/types";

export const metadata = {
  title: "Dashboard",
  description: "Employee Dashboard",
};
type SalaryRange = {
  minSalary: number;
  maxSalary: number;
};
const limit = 30;

const getDirSymbol = (dir: string) => (dir === "asc" ? "%2B" : "-");
export default function UploadPage() {
  const [salaryRange, setSalaryRange] = useState<SalaryRange>({
    minSalary: -1,
    maxSalary: -1,
  });
  const [sortInfo, setSortInfo] = useState<MUISortOptions>({
    name: "id",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [data, setData] = useState<EmployeeData>({ count: 0, data: [] });
  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then((resp) => resp.json())
      .then((data) => setData(data));
  }, []);
  const onSearchClick = (minSalary: number, maxSalary: number) => {
    setSalaryRange({ minSalary: minSalary, maxSalary: maxSalary });

    fetch(
      `http://localhost:3001/users?minSalary=${minSalary}&maxSalary=${maxSalary}&offset=${
        currentPage * limit
      }&limit=${limit}&sort=${getDirSymbol(sortInfo.direction)}${sortInfo.name}`
    )
      .then((resp) => resp.json())
      .then((data) => setData(data));
  };
  const onColumnsClick = (sortOpt: MUISortOptions) => {
    setSortInfo(sortOpt);
    fetch(
      `http://localhost:3001/users?minSalary=${
        salaryRange.minSalary
      }&maxSalary=${salaryRange.maxSalary}&offset=${
        currentPage * limit
      }&limit=${limit}&sort=${getDirSymbol(sortOpt.direction)}${sortOpt.name}`
    )
      .then((resp) => resp.json())
      .then((data) => setData(data));
  };
  const onPageClick = (page: number) => {
    setCurrentPage(page);
    fetch(
      `http://localhost:3001/users?minSalary=${
        salaryRange.minSalary
      }&maxSalary=${salaryRange.maxSalary}&offset=${
        page * limit
      }&limit=${limit}&sort=${getDirSymbol(sortInfo.direction)}${sortInfo.name}`
    )
      .then((resp) => resp.json())
      .then((data) => setData(data));
  };
  const salaryRangeText: string =
    salaryRange.minSalary < 0
      ? ""
      : `Salary from ${salaryRange.minSalary} - ${salaryRange.maxSalary}`;
  return (
    <main className="flex justify-center items-center bg-slate-50 min-h-screen">
      <div className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <SalarySearch onSearchClick={onSearchClick} />
        <DataTableWrapper
          data={data}
          onColumnClick={onColumnsClick}
          onPageClick={onPageClick}
          title={`Employee ${salaryRangeText}`}
          sortOrder={sortInfo}
        />
      </div>
    </main>
  );
}
