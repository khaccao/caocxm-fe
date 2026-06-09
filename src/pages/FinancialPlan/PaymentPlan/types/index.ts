import { ColumnsType } from "antd/es/table";

import { BCHPayrollType, PayrollType } from "../components/data";
import { MergedCell } from "../utils";

// -------------------------------------------------

export interface PayrollTableHandle {
  getExportData(): {
    dataView: PayrollType[];
    originalData: PayrollType[] | null;
    mergedCells: MergedCell[];
    visibleColumns: ColumnsType<PayrollType>;
  };

  exportFile(): void;
  getBodyContainer?(): HTMLDivElement | null;
}

export interface BCHPayrollTableHandle {
  getExportData(): {
    dataView: BCHPayrollType[];
    mergedCells: MergedCell[];
    visibleColumns: ColumnsType<BCHPayrollType>;
  };

  exportFile(): void;
}