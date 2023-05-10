import { FC, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface SalarySearchProps {
  onSearchClick: (minSalary: number, maxSalary: number) => void;
}
export const SalarySearch: FC<SalarySearchProps> = ({ onSearchClick }) => {
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(0);

  const error: boolean = minSalary > maxSalary;
  return (
    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
      <TextField
        label="Salary min"
        type="number"
        value={minSalary}
        error={error}
        sx={{ width: 250 }}
        InputProps={{
          inputProps: {
            min: 0,
            max: maxSalary,
          },
        }}
        onChange={(e) => setMinSalary(parseInt(e.target.value))}
      />
      <TextField
        label="Salary max"
        type="number"
        value={maxSalary}
        error={error}
        sx={{ width: 250 }}
        InputProps={{
          inputProps: {
            max: 999999,
            min: minSalary,
          },
        }}
        onChange={(e) => setMaxSalary(parseInt(e.target.value))}
      />
      <Button
        size="medium"
        variant="outlined"
        sx={{ width: 250, minHeight: 56 }}
        onClick={() => onSearchClick(minSalary, maxSalary)}
        disabled={error}
      >
        Search
      </Button>
    </div>
  );
};
