import { FC, useState, useCallback } from "react";
import { CircularProgress } from "@mui/material";

import { EmployeeData } from "~/types";
import MUIDataTable, {
  MUIDataTableState,
  MUISortOptions,
} from "mui-datatables";

interface DataTableWrapperProps {
  onColumnClick: (sortOpt: MUISortOptions) => void;
  onPageClick: (page: number) => void;
  data: EmployeeData;
  title: string;
  sortOrder: MUISortOptions;
}
const columns = ["id", "login", "name", "salary"];
export const DataTableWrapper: FC<DataTableWrapperProps> = ({
  onColumnClick,
  onPageClick,
  data,
  title,
  sortOrder,
}) => {
  const onTableChange = useCallback(
    (action: string, tableState: MUIDataTableState) => {
      switch (action) {
        case "changePage":
          onPageClick(tableState.page);
          break;
        case "sort":
          onColumnClick(tableState.sortOrder);
          break;
        default:
          break;
      }
    },
    [onPageClick, onColumnClick]
  );

  const options = {
    selectableRowsHideCheckboxes: true,
    download: false,
    filter: false,
    search: false,
    print: false,
    viewColumns: false,
    serverSide: true,
    count: data.count,
    onTableChange: onTableChange,
    sortOrder: sortOrder,
    rowsPerPage: 30,
    rowsPerPageOptions: [30],
  };
  return (
    <div className="">
      <MUIDataTable
        title={title}
        data={data.data}
        columns={columns}
        options={options}
      />
    </div>
  );
};
