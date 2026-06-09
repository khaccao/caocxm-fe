import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';

import { SalaryAdvanceRowDTO, SalaryPayload } from '@/common/define';

interface salaryState {
  salarys: SalaryPayload[],
  salary?: SalaryPayload,
  salarysParams?: any,
  salaryByIdParams?: any,
  ThangNam: Dayjs, 
  SearchStr: string,
  onSave?: string, 
}

const initialState: salaryState = {
  salarys: [],
  ThangNam: dayjs(),
  SearchStr: '',
};

const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {
    createSalaryRequest: (state, action: PayloadAction<{data: SalaryPayload}>) => {},
    updateSalaryRequest: (state, action: PayloadAction<{data: SalaryPayload, id: number}>) => {},
    updateSalarysRequest: (state, action: PayloadAction<{companyId: number, dateTime: string, data: SalaryPayload[]}>) => {},
    deleteSalarysRequest: (state, action: PayloadAction<{id: number}>) => {},
    getSalarysRequest: (state, action: PayloadAction<{dateTime?: string, period?: number}>) => {},
    getSalaryByIdRequest: (state, action: PayloadAction<{id: number}>) => {},
    setSalarys: (state, action) => {
      state.salarys = action.payload;
    },
    setThangNam: (state, action) => {
      state.ThangNam = action.payload;
    },
    setSearchStr: (state, action) => {
      state.SearchStr = action.payload;
    },
    setOnSave: (state, action) => {
      state.onSave = action.payload;
    },
    setSalarysParams: (state, action) => {
      state.salarysParams = action.payload;
    },
    setSalaryById: (state, action) => {
      state.salary = action.payload;
    },
    setSalarysByIdParams: (state, action) => {
      state.salaryByIdParams = action.payload;
    },
    exportSalariesRequest: (state, action: PayloadAction<{companyId: number, dateTime: string, period: number, rows: SalaryAdvanceRowDTO[]}>) => {
      console.log(action.payload.period, action.payload.dateTime, action.payload.companyId)
    },
  },
});

export const salaryActions = salarySlice.actions;
export const salaryReducer = salarySlice.reducer;
