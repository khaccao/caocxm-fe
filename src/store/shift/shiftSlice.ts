import { createSlice } from "@reduxjs/toolkit";

import { defaultPagingParams } from "@/common/define";
import { ShiftResponse } from "@/services/ShiftService";

interface ShiftState {
  shifts?: any;
  selectedShift?: ShiftResponse;
  queryParams: any;
}
const initialState: ShiftState = {
  queryParams: defaultPagingParams
};

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    setShifts: (state, action) => {
      state.shifts = action.payload;
    },
    setSelectedShift: (state, action) => {
      state.selectedShift = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    getShiftsRequest: (state, action) => {}, 
    createShiftRequest: (state, action) => {},
    updateShiftRequest: (state, action) => {},
    removeShiftsRequest: (state, action) => {}
  }
});

export const shiftActions = shiftSlice.actions;
export const shiftReducer = shiftSlice.reducer;