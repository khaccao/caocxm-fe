import { createSlice } from '@reduxjs/toolkit';

import { defaultPagingParams } from '@/common/define';

interface LabelState {
  label: any[];
  queryParams: any;
  documents? : any;
}

const initialState: LabelState = {
  label: [],
  queryParams: defaultPagingParams,
};

const labelSlice = createSlice({
  name: 'label',
  initialState,
  reducers: {
  },
});

export const labelActions = labelSlice.actions;
export const labelReducer = labelSlice.reducer;
