/* eslint-disable import/order */
import saveAs from 'file-saver';
import { catchError, concat, filter, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import {
  defaultPagingParams,
  documentProject,
  FileStatus,
  FileStatusConstant,
  FileUpLoadName,
  labelProject,
} from '@/common/define';
import { DocumentService } from '@/services/DocumentService';
import { LabelService } from '@/services/LabelService';
import { documentActions } from '@/store/documents';
import Utils from '@/utils';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { RootEpic } from '../types';
import { ConstantStatic } from './documentSlice';

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - get document
const getDocumentsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.getDocumentsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.employee.queryParams, ...params };
      return concat(
        [startLoading({ key: documentProject.GettingDocumentList })],
        DocumentService.Get.getDocumentsByProjectId(projectId, { search }).pipe(
          mergeMap(documents => {
            return [
              documentActions.setQueryParams(search),
              documentActions.setDocuments({ reuslts: documents }),
              documentActions.setDocumentPath([]),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [documentActions.setDocuments(undefined)];
          }),
        ),
        [stopLoading({ key: documentProject.GettingDocumentList })],
      );
    }),
  );
};
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - get lable
const getLabelRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.getLabelRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { documentId, params } = action.payload;
      console.log("documentId 1", action.payload)
      const search = { ...defaultPagingParams, ...state.document.queryParams, ...params };
      return concat(
        [startLoading({ key: documentProject.GettingDocumentList })],
        LabelService.Get.getLabelByDocumentId(documentId, { search }).pipe(
          mergeMap(documents => {
            //console.log('getLabelByDocumentId', documents);
            return [
              //[#20917][hoang_nm][02/12/2024] Bỏ lưu search các màn hình
              //documentActions.setQueryParams(search),
              documentActions.setDocuments(documents),
              documentActions.setSelectedRowKeys([]),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [documentActions.setDocuments(undefined)];
          }),
        ),
        [stopLoading({ key: documentProject.GettingDocumentList })],
      );
    }),
  );
};

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - tạo folder
const getFolderRootIdRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.getFolderRootIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId } = action.payload;
      return concat(
        DocumentService.Get.getFolderRootId(projectId).pipe(
          mergeMap(id => {
            return [documentActions.setFolderRootId(id)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [documentActions.setFolderRootId(undefined)];
          }),
        ),
      );
    }),
  );
};

// [#21333][dung_lt][13.01/2024]_ lấy budget estimate
const getBudgetEstimateByProjectRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.getBudgetEstimateByProjectRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, projectId, paymentTerm, baseDate } = action.payload;
      return concat(
        of(startLoading({ key: 'budgetEstimate' })),
        DocumentService.Get.getBudgetEstimateByProject(companyId, projectId, paymentTerm, baseDate).pipe(
          mergeMap(res => {
            return [documentActions.setBudgetEstimateByProject(res.results)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        of(stopLoading({ key: 'budgetEstimate' })),
      );
    }),
  );
};

// [#21333][dung_lt][16/01/2024]_ update budget estimate
const updateBudgetEstimateRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.updateBudgetEstimateRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, projectId, paymentTerm, baseDate, dataUpdate } = action.payload;
      return concat(
        of(startLoading({ key: 'budgetEstimate' })),
        DocumentService.Put.updateBudgetEstimate(dataUpdate).pipe(
          mergeMap(res => {
            return [
              documentActions.getBudgetEstimateByProjectRequest({ companyId, projectId, paymentTerm, baseDate }),
              documentActions.setPlanTableUpdate([]),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        of(stopLoading({ key: 'budgetEstimate' })),
      );
    }),
  );
};

const uploadFiles$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.uploadFiles.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { body, params } = action.payload ?? {};
      const documentPath = state.document.documentPath;
      const folderRootId = state.document.folderRootId;
      let files: FileStatus[] = ConstantStatic.FileDatas?.map(x => ({
        fileId: x.fileId,
        file: x.file,
        documentId: x.documentId,
        name: x.name,
        status: x.status,
        percent: x.percent,
      })).filter(x => x.file?.get('iFiles'));
      // const documentId = !documentPath?.length && folderRootId ? folderRootId : documentPath[(documentPath?.length || 1) - 1]?.id;
      let newFile: FileStatus[] = [];
      for (const file of body ?? []) {
        let tem = files.find(x => x.fileId === file.fileId);
        if (tem != null) {
          tem = file;
        } else {
          newFile.push(file);
        }
      }
      files = newFile.concat(files);
      var fileForm = files.find(x => x.status === FileStatusConstant.repairing);
      if (fileForm) {
        fileForm.status = FileStatusConstant.uploading;
        //console.log('uploadingFile new ', fileForm);
      }
      ConstantStatic.FileDatas = files;
      return concat(
        [startLoading({ key: 'uploadFileDocument' })],
        [documentActions.setListFilesUpload(files.map(x => ({ ...x })))],
        [stopLoading({ key: 'uploadFileDocument' })],
      );
    }),
  );
};

// [#20508][dung_lt][24/10/2024] - API upload file thanh toán
const uploadFilePayment$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.uploadFilePayment.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, projectCode, paymentTerm, paymentTermDate, file, labelid, parentId, selectedMonth } =
        action.payload;
      console.log("action.payload", action.payload)
      return concat(
        of(startLoading({ key: 'uploadFilePayment' })),
        DocumentService.Put.uploadFilePayment(
          projectId,
          projectCode,
          paymentTerm,
          paymentTermDate,
          labelid,
          file,
          {},
        ).pipe(
          switchMap(response => {
            console.log('response', response);
            const currentYear = new Date().getFullYear();

            const input = {
              name: `${FileUpLoadName.ThanhToanThauPhu}_[${response[0].name}]_${selectedMonth}${currentYear}`,
              code: null,
              type: 'folder',
              labelCode: null,
            };

            Utils.successNotification();
            return of(
              documentActions.setFileData(response),
              //truyền data bị sai khi gọi updateFolderRequest 
              documentActions.updateFolderRequest({ idLabel: labelid, inputData: input, parentId: parentId }),
              documentActions.setDocumentPath([]),
            );
          }),
          catchError(error => {
            Utils.errorNotification();

            return of(documentActions.removeLabelRequest({ labelId: labelid, parentId: parentId }));
          }),
        ),
        of(stopLoading({ key: 'uploadFilePayment' })),
      );
    }),
  );
};

// [#20508][dung_lt][24/10/2024] - API upload file thanh toán
const uploadFileFinance$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.uploadFileFinance.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, financeTerm, financeTermDate, labelid, file, parentId, ReloadPath = true } = action.payload;
      return concat(
        of(startLoading({ key: 'uploadFileFinance' })),
        DocumentService.Put.uploadFileFinance(companyId, financeTerm, financeTermDate, labelid, file, {}).pipe(
          switchMap(response => {
            Utils.successNotification();
            if (ReloadPath) {
              return [
                documentActions.getLabelRequest({ documentId: labelid, params: defaultPagingParams }),
                documentActions.setDocumentPath([]),
              ];
            }
            return [documentActions.getLabelRequest({ documentId: labelid, params: defaultPagingParams })];
          }),
          catchError(error => {
            Utils.errorNotification();

            return of(documentActions.removeLabelRequest({ labelId: labelid, parentId: parentId }));
          }),
        ),
        of(stopLoading({ key: 'uploadFileFinance' })),
      );
    }),
  );
};

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - download file
const downloadFile$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.downloadFile.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { document, search } = action.payload;
      return concat(
        [startLoading({ key: documentProject.DownloadingDocument })],
        DocumentService.Get.downloadFile(document.id, { search }).pipe(
          mergeMap((documentBlob: any) => {
            if (documentBlob) {
              saveAs(documentBlob, document.name);
            }
            Utils.successNotification();
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: documentProject.DownloadingDocument })],
      );
    }),
  );
};

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - tạo label
const createLabelRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    //[#20992][hoang_nm][27/11/2024] Epic cho hdtp với action createLabelRequest
    filter(documentActions.createLabelRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { label, projectId } = action.payload;
      const { documentPath, folderRootId } = state$.value.document;
      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: labelProject.SavingLabel })],
        LabelService.Post.createLabel(
          projectId,
          {
            ...label,
            children: undefined,
          },
          {},
        ).pipe(
          mergeMap(() => {
            if (!!documentPath?.length) {
              const lastPath = documentPath[(documentPath?.length || 1) - 1];

              if (lastPath) {
                console.log("documentId 2", lastPath)

                return LabelService.Get.getLabelByDocumentId(lastPath.id, { search }).pipe(
                  mergeMap(documents => {
                    Utils.successNotification('Create successfully');
                    return [
                      documentActions.setQueryParams(search),
                      documentActions.setDocuments(documents),
                      hideModal({ key: documentProject.CreateUpdateFolderModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [documentActions.setDocuments(undefined)];
                  }),
                );
              }
            }
            if (folderRootId) {
              console.log("documentId 3", folderRootId)

              return LabelService.Get.getLabelByDocumentId(folderRootId, { search }).pipe(
                mergeMap(documents => {
                  return [
                    documentActions.setQueryParams(search),
                    documentActions.setDocuments(documents),
                    hideModal({ key: documentProject.CreateUpdateFolderModalName }),
                  ];
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              );
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: labelProject.SavingLabel })],
      );
    }),
  );
};

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - tạo label
const createLabelTPRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    //[#20992][hoang_nm][27/11/2024] Epic cho tttp12,27 với action createLabelTPRequest
    filter(documentActions.createLabelTPRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const {
        label,
        projectId,
        projectCode,
        isThauPhu = false,
        file,
        paymentTerm,
        paymentTermDate,
        parentId,
        selectedMonth,
      } = action.payload;
      console.log('action.payload', action.payload);
      const { documentPath, folderRootId } = state$.value.document;
      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: labelProject.SavingLabel })],
        LabelService.Post.createLabel(
          projectId,
          {
            ...label,
            children: undefined,
          },
          {},
        ).pipe(
          mergeMap(response => {
            console.log('res', response);
            if (!!documentPath?.length) {
              const lastPath = documentPath[(documentPath?.length || 1) - 1];
              if (lastPath) {
                console.log('lastPath test', lastPath);
                return LabelService.Get.getLabelByDocumentId(lastPath.id, { search }).pipe(
                  mergeMap(documents => {
                    return [
                      documentActions.setQueryParams(search),
                      hideModal({ key: documentProject.CreateUpdateFolderModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [documentActions.setDocuments(undefined)];
                  }),
                );
              }
            }
            if (folderRootId) {
              console.log('folderRootId test', folderRootId);

              return LabelService.Get.getLabelByDocumentId(folderRootId, { search }).pipe(
                mergeMap(documents => {
                  const actions: any[] = [documentActions.setQueryParams(search)];
                  if (isThauPhu) {
                    actions.push(
                      documentActions.uploadFilePayment({
                        projectId,
                        projectCode,
                        paymentTerm,
                        paymentTermDate,
                        labelid: response.id,
                        file,
                        parentId,
                        selectedMonth,
                      }),
                    );
                  }

                  actions.push({
                    type: 'modal/hideModal',
                    payload: { key: documentProject.CreateUpdateFolderModalName },
                  });

                  return actions;
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              );
            }

            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: labelProject.SavingLabel })],
      );
    }),
  );
};

const createLabelFinanceRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.createLabelFinanceRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { companyId, label, projectId, file, financeTerm, financeTermDate, parentId } = action.payload;
      const { documentPath, folderRootId } = state$.value.document;
      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: labelProject.SavingLabel })],
        LabelService.Post.createLabel(
          projectId,
          {
            ...label,
            children: undefined,
          },
          {},
        ).pipe(
          mergeMap(response => {
            if (!!documentPath?.length) {
              const lastPath = documentPath[(documentPath?.length || 1) - 1];
              if (lastPath) {
                console.log("4", lastPath);
                return LabelService.Get.getLabelByDocumentId(lastPath.id, { search }).pipe(
                  mergeMap(documents => {
                    Utils.successNotification('Create successfully');
                    return [
                      documentActions.setQueryParams(search),
                      documentActions.setDocuments(documents),
                      hideModal({ key: documentProject.CreateUpdateFolderModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [documentActions.setDocuments(undefined)];
                  }),
                );
              }
            }
            if (folderRootId) {
              console.log("5", folderRootId);

              return LabelService.Get.getLabelByDocumentId(folderRootId, { search }).pipe(
                mergeMap(documents => {
                  const actions: any[] = [
                    documentActions.setQueryParams(search),
                    documentActions.setDocuments(documents),
                    documentActions.uploadFileFinance({
                      companyId,
                      financeTerm,
                      financeTermDate,
                      labelid: response.id,
                      file,
                      parentId,
                    }),
                    documentActions.setDocuments(documents),
                  ];
                  actions.push({
                    type: 'modal/hideModal',
                    payload: { key: documentProject.CreateUpdateFolderModalName },
                  });

                  return actions;
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              );
            }

            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: labelProject.SavingLabel })],
      );
    }),
  );
};

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa label
const removeLabelRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.removeLabelRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { labelId, parentId } = action.payload;
      console.log("6", action.payload);

      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: documentProject.RemovingDocument })],
        LabelService.Delete.deleteLabel(labelId).pipe(
          switchMap(() => {
            // Utils.successNotification('Removed successfully');
            if (!parentId) return [];
            return concat(
              [startLoading({ key: documentProject.GettingDocumentList })],

              LabelService.Get.getLabelByDocumentId(parentId, { search }).pipe(
                mergeMap(documents => {
                  return [documentActions.setQueryParams(search), documentActions.setDocuments(documents)];
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              ),
              [stopLoading({ key: documentProject.GettingDocumentList })],
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: documentProject.RemovingDocument })],
      );
    }),
  );
};
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa nhiều document
const removeDocumentsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.removeDocumentsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { documentIds, parentId } = action.payload;
      console.log("7", action.payload);

      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: documentProject.RemovingDocuments })],
        DocumentService.Delete.deleteDocuments(documentIds).pipe(
          switchMap(() => {
            Utils.successNotification('Removed successfully');
            if (!parentId) return [];
            return concat(
              [startLoading({ key: documentProject.GettingDocumentList })],
              LabelService.Get.getLabelByDocumentId(parentId, { search }).pipe(
                mergeMap(documents => {
                  return [
                    documentActions.setQueryParams(search),
                    documentActions.setDocuments(documents),
                    documentActions.setSelectedRowKeys([]),
                  ];
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              ),
              [stopLoading({ key: documentProject.GettingDocumentList })],
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: documentProject.RemovingDocuments })],
      );
    }),
  );
};
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa nhiều label
const removeLabelsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.removeLabelsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { labelIds, parentId } = action.payload;
      console.log("8", action.payload);

      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: documentProject.RemovingDocuments })],
        LabelService.Delete.deleteLabels(labelIds).pipe(
          switchMap(() => {
            Utils.successNotification('Removed successfully');
            if (!parentId) return [];
            return concat(
              [startLoading({ key: documentProject.GettingDocumentList })],
              LabelService.Get.getLabelByDocumentId(parentId, { search }).pipe(
                mergeMap(documents => {
                  return [
                    documentActions.setQueryParams(search),
                    documentActions.setDocuments(documents),
                    documentActions.setSelectedRowKeys([]),
                  ];
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              ),
              [stopLoading({ key: documentProject.GettingDocumentList })],
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: documentProject.RemovingDocuments })],
      );
    }),
  );
};
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa 1 document
const removeDocumentRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.removeDocumentRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { documentId, parentId } = action.payload;
      console.log("9", action.payload);

      const search = { ...defaultPagingParams, ...state.document.queryParams, page: 1 };
      return concat(
        [startLoading({ key: documentProject.RemovingDocument })],
        DocumentService.Delete.deleteDocument(documentId).pipe(
          switchMap(() => {
            Utils.successNotification('Removed successfully');
            if (!parentId) return [];
            return concat(
              [startLoading({ key: documentProject.GettingDocumentList })],
              LabelService.Get.getLabelByDocumentId(parentId, { search }).pipe(
                mergeMap(documents => {
                  return [documentActions.setQueryParams(search), documentActions.setDocuments(documents)];
                }),
                catchError(errors => {
                  Utils.errorHandling(errors);
                  return [documentActions.setDocuments(undefined)];
                }),
              ),
              [stopLoading({ key: documentProject.GettingDocumentList })],
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: documentProject.RemovingDocument })],
      );
    }),
  );
};

const deleteFileTP$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.deleteFileTPRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { documentIds } = action.payload;
      return concat(
        LabelService.Delete.deleteFileTP(documentIds).pipe(
          switchMap(response => {
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      );
    }),
  );
};

const updateFolder$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.updateFolderRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { idLabel, inputData, parentId } = action.payload;
      return concat(
        LabelService.Put.updateLabel(idLabel, inputData).pipe(
          mergeMap(response => {
            return [
              documentActions.getLabelRequest({ documentId: parentId, params: defaultPagingParams })
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              documentActions.setDocuments(undefined)
            ];
          }),
        ),
      );
    }),
  );
};
  // [21675] [ngoc_td] redux đổi tên cho file
const updateFileRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(documentActions.updateFileRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return concat(
        DocumentService.Put.updateDocument(action.payload).pipe(
          mergeMap(response => {
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              documentActions.setDocuments(undefined),
            ];
          })
        ),
      )
    }),
  )
}

export const documentEpics = [
  updateFolder$,
  deleteFileTP$,
  getDocumentsRequest$,
  getLabelRequest$,
  getFolderRootIdRequest$,
  uploadFiles$,
  uploadFilePayment$,
  uploadFileFinance$,
  downloadFile$,
  createLabelRequest$,
  createLabelTPRequest$,
  createLabelFinanceRequest$,
  removeLabelRequest$,
  removeLabelsRequest$,
  removeDocumentsRequest$,
  removeDocumentRequest$,
  getBudgetEstimateByProjectRequest$,
  updateBudgetEstimateRequest$,
  updateFileRequest$,
];
