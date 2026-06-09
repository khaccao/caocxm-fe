import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';

interface ImportFileState {
  loading: boolean;
  error: string | null;
  importResult: any;
}

const initialState: ImportFileState = {
  loading: false,
  error: null,
  importResult: null,
};

const importFileSlice = createSlice({
  name: 'importFile',
  initialState,
  reducers: {
    importFileRequest: (state, action: PayloadAction<{ file: FormData }>) => {
      state.loading = true;
      state.error = null;
    },
    importFileSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.importResult = action.payload;
      message.success('Import file thành công');
    },
    importFileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      message.error('Import file không thành công');
    },
    importFileTemplateRequest: (state, action: PayloadAction<{ companyId: number; file: FormData }>) => {
      state.loading = true;
      state.error = null;
    },
    importFileTemplateSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.importResult = action.payload;
      message.success('Import file template thành công');
    },
    importFileTemplateFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      message.error('Import file template không thành công');
    },
    genIssueRequest: (state, action: PayloadAction<{ companyId: number; tagVersionCode: string,  body: any }>) => {
      state.loading = true;
      state.error = null;
    },
    genIssueSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.importResult = action.payload;
      message.success('Nhập số tầng thành công');
    },
    genIssueFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      message.error('Nhập số tầng  không thành công');
    },
    deleteDocument: (state, action) => {}
  },
});

export const importFileActions = importFileSlice.actions;
export const importFileReducer=importFileSlice.reducer;
