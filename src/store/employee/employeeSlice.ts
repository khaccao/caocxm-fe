import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ColumnVisibilityState, defaultPagingParams, EmployeeReportEfficiencyByStartEndDateDTO, EmployeeSalary, EmployeeSalaryStatementDTO, EmployeeSalaryStatementSummaryDTO, ePeriodCode, IEmployeeFee, IEmployeeSalariesPayDTO, iOptions, SetColumnVisibilityPayload, ToggleColumnPayload } from '@/common/define';
import {
  DanhSachUserResponse,
  EmployeePoint,
  EmployeeResponse,
  EmployeesPagingResponse,
  rankData,
} from '@/services/EmployeeService';
import { RequestOptions } from '@/services/types';

interface EmployeeState {
  DanhSachUser: DanhSachUserResponse[];
  employees?: EmployeesPagingResponse;
  selectedEmployee?: EmployeeResponse;
  selectedEmployeeDetails?: any;
  queryParams: any;
  queryFeeParams: any;
  FeeTableEmployee?: IEmployeeFee[];
  employeeSalariesPays?: IEmployeeSalariesPayDTO[];
  rankData: rankData[];
  rankDataByID: rankData[];
  getEmployeeId: EmployeePoint[];
  updateEmployee: EmployeePoint[];
  employeeReportEfficiencyByStartEndDate?: EmployeeReportEfficiencyByStartEndDateDTO[];
  queryEmployeeReportEfficiencyByStartEndDate?: { companyId: number, params: iOptions };
  employeeSalaryStatement?: EmployeeSalaryStatementDTO[];
  nvSalaryStatements?: EmployeeSalaryStatementDTO[];
  bchSalaryStatements?: EmployeeSalaryStatementDTO[];
  nvSalaryStatementsSummary?: EmployeeSalaryStatementSummaryDTO[];
  bchSalaryStatementsSummary?: EmployeeSalaryStatementSummaryDTO[];
  columnVisibility: ColumnVisibilityState;
  columnWidths: Record<string, Record<string, number>>;
}

const initialState: EmployeeState = {
  updateEmployee: [],
  getEmployeeId: [],
  rankDataByID: [],
  rankData: [],
  DanhSachUser: [],
  queryParams: defaultPagingParams,
  queryFeeParams: defaultPagingParams,
  employeeSalaryStatement: [],
  nvSalaryStatements: [],
  bchSalaryStatements: [],
  nvSalaryStatementsSummary: [],
  bchSalaryStatementsSummary: [],
  columnVisibility: {},
  columnWidths: {},
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setDanhSachUser: (state, action: PayloadAction<DanhSachUserResponse[]>) => {
      state.DanhSachUser = action.payload;
    },
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    setQueryFeeParams: (state, action) => {
      state.queryFeeParams = action.payload;
    },
    setFeeTableEmployee: (state, action) => {
      state.FeeTableEmployee = action.payload;
    },
    setEmployeeSalariesPays: (state, action) => {
      state.employeeSalariesPays = action.payload;
    },
    getDanhSachUserRequest: (state, action: PayloadAction<{ options: RequestOptions }>) => {},
    getEmployeesRequest: (state, action) => {},
    getFeeTableEmployeeRequest: (state, action) => {},
    getEmployeeSalariesPaysRequest: (state, action) => {},
    updateEmployeeSalariesPaysRequest: (state, action) => {},
    createFeeTableEmployeeRequest: (state, action) => {},
    updateFeeTableEmployeeRequest: (state, action) => {},

    //[#20938][hoang_nm][25/11/2024] thêm slice update theo tháng
    updateFeeEmployeeByMonthRequest: (state, action) => {},

    createEmployeeRequest: (state, action) => {},
    updateEmployeeRequest: (state, action) => {},
    removeEmployeeRequest: (state, action) => {},
    getRanksRequest: (state, action) => {},
    getRanksSuccess: (state, action) => {
      ('');
      state.rankData = action.payload;
    },
    getRankByIdRequest: (state, action) => {},
    getRankByIdSuccess: (state, action) => {
      state.rankDataByID = action.payload;
    },
    updategetByEmployeeIdRequest: (state, action) => {},
    updategetByEmployeeIdSuccess: (state, action) => {
      state.getEmployeeId = action.payload;
    },
    updateEmployeeIdRequest: (state, action) => {},
    updateEmployeeIdSuccess: (state, action) => {
      state.updateEmployee = action.payload;
    },

    getEmployeeReportEfficiencyByStartEndDateRequest: (
      state,
      action: PayloadAction<{
        companyId: number;
        body: number[];
        params: iOptions;
      }>,
    ) => {},
    setEmployeeReportEfficiencyByStartEndDate: (state, action) => {
      state.employeeReportEfficiencyByStartEndDate = action.payload;
    },
    setQueryEmployeeReportEfficiencyByStartEndDate: (state, action) => {
      state.queryEmployeeReportEfficiencyByStartEndDate = action.payload;
    },

    // [19/05/2025][#21983][vy_tt]
    getEmployeeSalaryStatementRequest: (state, action) => {},

    setEmployeeSalaryStatement(state, action) {
      const { data, group } = action.payload;
      if (group === 'NV') {
        state.nvSalaryStatements = data;
      } else {
        state.bchSalaryStatements = data;
      }
    },

    updateEmployeeSalaryStatementRequest: (state, action) => {
      state.employeeSalaryStatement = action.payload;
    },
    updateEmployeeSalaryStatementSuccess: (state, action) => {
      state.employeeSalaryStatement = action.payload;
    },

    //[24/05/2025][#22614][vy_tt] lấy tổng hợp lương
    getEmployeeSalaryStatementSummaryRequest: (state, action) => {},

    setEmployeeSalaryStatementSummary(state, action) {
      const { data, group } = action.payload;
      if (group === 'NV') {
        state.nvSalaryStatementsSummary = data;
      } else {
        state.bchSalaryStatementsSummary = data;
      }
    },

    setColumnVisibility: (state, action: PayloadAction<SetColumnVisibilityPayload>) => {
      const { tableKey, visibility } = action.payload;

      if (!state.columnVisibility) {
        state.columnVisibility = {};
      }

      state.columnVisibility[tableKey] = { ...visibility };
    },

    toggleColumnVisibility: (state, action: PayloadAction<ToggleColumnPayload>) => {
      const { tableKey, columnKey, visible } = action.payload;

      if (!state.columnVisibility) {
        state.columnVisibility = {};
      }
      if (!state.columnVisibility[tableKey]) {
        state.columnVisibility[tableKey] = {};
      }

      state.columnVisibility[tableKey][columnKey] = visible;
    },

    resetColumnVisibility: (state, action: PayloadAction<string>) => {
      const tableKey = action.payload;
      if (state.columnVisibility && state.columnVisibility[tableKey]) {
        delete state.columnVisibility[tableKey];
      }
    },

    clearAllColumnVisibility: state => {
      state.columnVisibility = {};
    },

    setColumnWidths(state, action: PayloadAction<{ tableKey: string; widths: Record<string, number> }>) {
      const { tableKey, widths } = action.payload;
      state.columnWidths[tableKey] = widths;
    },

    updateColumnWidth(state, action: PayloadAction<{ tableKey: string; columnKey: string; width: number }>) {
      const { tableKey, columnKey, width } = action.payload;
      state.columnWidths[tableKey] ||= {};
      state.columnWidths[tableKey]![columnKey] = width;
    },
    updatePerSalary(state, action: PayloadAction<{companyId: string, periodCode: ePeriodCode, body: number[], workingDay: string}>) {

    }
  },
});

export const employeeActions = employeeSlice.actions;
export const employeeReducer = employeeSlice.reducer;
