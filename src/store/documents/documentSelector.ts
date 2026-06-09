import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';
import { defaultPagingParams } from '@/common/define';

const getDocumentState = (state: RootState) => state.document;

// export function getSelectedTeam() {
//   return createSelector([getDocumentState], state => state.selectedTeam);
// }

export function getPathDocument() {
  return createSelector([getDocumentState], state => state.documentPath)
}

export function getDocuments() {
  return createSelector([getDocumentState], state => state.documents)
}

export function getFolderRootId() {
  return createSelector([getDocumentState], state => state.folderRootId);
}

export function getListFileUpload() {
  return createSelector([getDocumentState], state => state.listFileUpload)
}

export function getDocumentQueryParams() {
  return createSelector([getDocumentState], state => state.queryParams || defaultPagingParams);
}

export function getSelectedRowKeys() {
  return createSelector([getDocumentState], state => state.selectedRowKeys)
}
export function getFileData(){
  return createSelector([getDocumentState], state => state.fileData) 
 }
export function getBudgetEstimateByProject(){
return createSelector([getDocumentState], state => state.budgetEstimateByProject) 
}
export function getPlanTableUpdate(){
return createSelector([getDocumentState], state => state.planTableUpdate) 
}