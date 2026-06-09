import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { defaultPagingParams, FileStatus, IBudgetEstimateByProjectResult } from '@/common/define';
import { DocumentResponse } from '@/services/DocumentService';
import { CreateLabelData } from '@/services/LabelService';
import { PaymentTerm } from '@/services/ProjectService';

interface DocumentState {
  queryParams: any;
  documentPath: DocumentResponse[];
  selectedRowKeys: React.Key[];
  documents?: any;
  documentsByID?: any;
  folderRootId?: string;
  listFileUpload?: FileStatus[];
  fileData: PaymentTerm[];
  budgetEstimateByProject: IBudgetEstimateByProjectResult[];
  planTableUpdate?: any[];
  saveNameFolderSuccess: CreateLabelData | null,
}
export class ConstantStatic
{
  static FileDatas: FileStatus[] = [];
}

const initialState: DocumentState = {
  documentPath: [],
  queryParams: defaultPagingParams,
  selectedRowKeys: [],
  fileData: [],
  budgetEstimateByProject: [],
  saveNameFolderSuccess:null

};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocuments: (state, action) => {
      if (action?.payload?.results === undefined) {
        state.documents = {
          labelid: undefined,
        };
      } else {
        state.documents = action.payload;
        //console.log('setDocuments New', action.payload);
      }
    },

    getDocumentsRequest: (state, action) => {},
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    setPlanTableUpdate: (state, action) => {
      state.planTableUpdate = action.payload;
    },
    getLabelRequest: (state, action) => {},
    getFolderRootIdRequest: (state, action) => {},
    getBudgetEstimateByProjectRequest: (state, action) => {},
    updateBudgetEstimateRequest: (state, action) => {},
     
    //[21320][hoang_nm][13/01/2025] Chỉnh lại logic tải file và tên folder màn hình TTTP 12,27
    setFileData: (state, action) => {
      state.fileData = action.payload;
    },
    setFolderRootId: (state, action) => {
      state.folderRootId = action.payload;
    },
    setBudgetEstimateByProject: (state, action) => {
      state.budgetEstimateByProject = action.payload;
    },
    setDocumentPath: (state, action) => {
      state.documentPath = action.payload || [];
    },
    setListFilesUpload: (state, action: PayloadAction<FileStatus[]>) => {
      state.listFileUpload = action.payload;
    },

    deleteFileTPRequest: (state, action) => {},
    deleFileTPSuccess: (state, action) => {},

    //[#20992][hoang_nm][27/11/2024] Tách làm 2 action để sử dụng, createLabelRequest cho hdtp,createLabelTPRequest cho màn hình tttp12,27
    createLabelRequest: (_state, _action: PayloadAction<{ label: CreateLabelData; projectId: number }>) => {},
    createLabelTPRequest: (
      _state,
      _action: PayloadAction<{
        label: CreateLabelData;
        projectId: number;
        projectCode: any;
        isThauPhu?: any;
        file?: any;
        paymentTerm?: any;
        paymentTermDate?: any;
        parentId?: any;
        selectedMonth?: string
      }>,
    ) => {},

    createLabelFinanceRequest: (_state, _action: PayloadAction<{ companyId: number, label: CreateLabelData; projectId: number, file?: any, financeTerm?:any,financeTermDate?:any,parentId?:any }>) => {},    
    removeLabelRequest: (state, action: PayloadAction<{ labelId: string; parentId: string | undefined }>) => {},
    removeLabelsRequest: (state, action: PayloadAction<{ labelIds: string[]; parentId: string | undefined }>) => {},
    removeDocumentRequest: (state, action: PayloadAction<{ documentId: string; parentId: string | undefined }>) => {},
    removeDocumentsRequest: (
      state,
      action: PayloadAction<{ documentIds: string[]; parentId: string | undefined }>,
    ) => {},
    uploadFiles: (state, action: PayloadAction<{ body?: FileStatus[]; params?: any } | null>) => {},
    uploadFilePayment: (state, action) => {},
    uploadFileFinance: (state, action: PayloadAction<{ companyId: number, financeTerm: number, financeTermDate: string, labelid: string, file: any, parentId: string, ReloadPath?: boolean }>) => {},
    downloadFile: (state, action) => {},
    setSelectedRowKeys: (state, action) => {
      state.selectedRowKeys = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<FileStatus>) => {
      let temp = ConstantStatic.FileDatas.map(x => x) || [];
      let currentFile = temp.find(x => x.fileId === action.payload.fileId);

      if (currentFile) {
        currentFile.percent = action.payload.percent;
        currentFile.status = action.payload.status;
        currentFile.error = action.payload.error;
      }
      ConstantStatic.FileDatas = temp;
      let tempFiles = temp.map(x => ({
        ...x,
      }));
      state.listFileUpload = tempFiles;
    },
    updateFolderRequest: (state, action) => {},
    setUpdateSuccess: (state, action) => {
      state.saveNameFolderSuccess = action.payload;
    },
    updateFileRequest: (state, action) => {},
  },
});

export const documentActions = documentSlice.actions;
export const documentReducer = documentSlice.reducer;
