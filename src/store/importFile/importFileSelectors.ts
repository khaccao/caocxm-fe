import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store/types';

const getImportFileState = (state: RootState) => state.importFile;

export const selectImportFileLoading = createSelector(
  [getImportFileState],
  (importFileState) => importFileState.loading
);

export const selectImportFileError = createSelector(
  [getImportFileState],
  (importFileState) => importFileState.error
);

export const selectImportFileResult = createSelector(
  [getImportFileState],
  (importFileState) => importFileState.importResult
);

export const selectImportFileStatus = createSelector(
  [selectImportFileLoading, selectImportFileError, selectImportFileResult],
  (loading, error, result) => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (result && result.length > 0) return 'success';
    return 'idle';
  }
);
