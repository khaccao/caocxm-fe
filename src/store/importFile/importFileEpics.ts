import { concat, of } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { importFileActions } from './importFileSlice';
import { issueActions } from '../issue';
import { startLoading, stopLoading } from '../loading';
import { RootEpic } from '../types';
import { genIssue } from '@/common/define';
import { DocumentService } from '@/services/DocumentService';
import { ImportFileService } from '@/services/ImportfileService';
import Utils from '@/utils';

const importFileEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(importFileActions.importFileRequest.match),
    switchMap(action => {
      const { file } = action.payload;
      const selectedProject = state$.value.project.selectedProject;

      if (!selectedProject) {
        return [];
      }

      return concat(
        [startLoading({ key: 'importFile' })],
        ImportFileService.post.importFile(file, selectedProject.id).pipe(
          mergeMap(response => [
            importFileActions.importFileSuccess(response),
            stopLoading({ key: 'importFile' }),
          ]),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              importFileActions.importFileFailure(error),
              stopLoading({ key: 'importFile' }),
            ];
          })
        )
      );
    })
  );

  const importFileIssueTemplateEpic: RootEpic = (action$, state$) =>
    action$.pipe(
      filter(importFileActions.importFileTemplateRequest.match),
      switchMap((action: ReturnType<typeof importFileActions.importFileTemplateRequest>) => {
        if (!action.payload) {
          return of(importFileActions.importFileTemplateFailure('Action payload is undefined'));
        }
  
        const { companyId, file } = action.payload;
        const companyIdNumber = Number(companyId);
        return concat(
          of(startLoading({ key: 'importFileIssueTemplate' })),
          ImportFileService.post.importFileIssueTemplate(companyIdNumber, file).pipe(
            mergeMap(response => [
              importFileActions.importFileTemplateSuccess(response),
              stopLoading({ key: 'importFileIssueTemplate' }),
            ]),
            catchError(error => {
              Utils.errorHandling(error);
              return of(
                importFileActions.importFileTemplateFailure(error.message),
                stopLoading({ key: 'importFileIssueTemplate' })
              );
            })
          )
        );
      })
    );

  const genIssueEpic: RootEpic = (action$, state$) =>
    action$.pipe(
      filter(importFileActions.genIssueRequest.match),
      switchMap((action: ReturnType<typeof importFileActions.genIssueRequest>) => {
        if (!action.payload) {
          return of(importFileActions.genIssueFailure('Action payload is undefined'));
        }
  
        const { companyId, tagVersionCode, body } = action.payload;
        const selectedProject = state$.value.project.selectedProject;
  
        if (!selectedProject) {
          return of(importFileActions.genIssueFailure('Không tìm thấy dự án được chọn'));
        }
  
        return concat(
          of(startLoading({ key: genIssue })),
          ImportFileService.post.genIssue(companyId, selectedProject.id, tagVersionCode, body).pipe(
            mergeMap(response => [
              issueActions.getIssuesByMilestoneRequest({
                projectId: selectedProject.id, 
                params: state$.value.issue.queryParamsByTagVersion
              }),
              importFileActions.genIssueSuccess(response),
              stopLoading({ key: genIssue }),
            ]),
            catchError(error => {
              Utils.errorHandling(error);
              return of(
                importFileActions.genIssueFailure(error.message),
                stopLoading({ key: genIssue })
              );
            })
          )
        );
      })
    );

    const deleteDocument$: RootEpic = (action$, state$) => {
      return action$.pipe(
        filter(importFileActions.deleteDocument.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
          const { documentId } = action.payload;
          return concat(
            [startLoading({key: 'deleteDocument'})],
            DocumentService.Delete.deleteDocument(documentId, {}).pipe(
              switchMap((data)=> {
                return [
                  // projectActions.getLabel({id: id, isbiding: true})
                ]
              }),
              catchError(error => {
                Utils.errorHandling(error);
                return [];
              })
            ),
            [stopLoading({key: 'deleteDocument'})]
          )
        })
      )
    }

export const importFileEpics = [importFileEpic, genIssueEpic, importFileIssueTemplateEpic, deleteDocument$];
