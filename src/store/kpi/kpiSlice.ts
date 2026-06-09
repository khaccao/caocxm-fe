import { createSlice } from '@reduxjs/toolkit';

interface kpiState {
  
}

const initialState: kpiState = {
  
};

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    
  },
});

export const kpiActions = kpiSlice.actions;
export const kpiReducer = kpiSlice.reducer;
