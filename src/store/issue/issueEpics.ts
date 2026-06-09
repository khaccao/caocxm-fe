/* eslint-disable import/order */
import { catchError, concat, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import {
  AttributeDim,
  createIssueTeamRequest,
  CreateUpdateIssueModalName,
  defaultPagingParams,
  EmployeeReport,
  eTypeUpdate,
  getCategoryByCompanyIdRequest,
  getIssueChecklistByIssueIds,
  getIssueChecklistsByTeamId,
  getIssueChecklistsTeamByCheckitemIds,
  getIssueTeamsByIssueRequest,
  getTagByCompanyIdRequest,
  getTeamIdsByIssueRequest,
  GettingIssueByVersionList,
  GettingIssueList,
  GettingIssueProgressList,
  GettingIssueStatusList,
  Issue,
  IssueCheckItemsTeam,
  IssueRelationship,
  LaborDim,
  MachinerysDim,
  MaterialsDim,
  OtherResourcesDim,
  Quota,
  RemovingIssue,
  RemovingIssueTeam,
  SavingIssue,
  sMilestone,
  Target,
  TargetTracker,
  targetType,
  TrackerDim,
  updateCheckItems,
  updateIssueTeams,
  UpdateStatusIssue
} from '@/common/define';
import { DocumentService } from '@/services/DocumentService';
import { CheckItemsDTO, Issue_CheckItemsTeamDTO, IssueService } from '@/services/IssueService';
import { ProjectService } from '@/services/ProjectService';
import Utils from '@/utils';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { projectActions } from '../project';
import { RootEpic } from '../types';
import { issueActions } from './issueSlice';

const getIssuesRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssuesRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: GettingIssueList })],
        IssueService.Get.getIssues(projectId, { search }).pipe(
          mergeMap(issues => {
            return [issueActions.setQueryParams(search), issueActions.setIssues(issues)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [issueActions.setIssues(undefined)];
          }),
        ),
        [stopLoading({ key: GettingIssueList })],
      );
    }),
  );
};

const getIssuesByMilestone = (state: any) => {
  return [
    issueActions.getIssuesByMilestoneRequest({
      projectId: state?.project?.selectedProject?.id,
      params: state.issue.queryParamsByTagVersion,
    }),
  ];
};

const updateAssignTeamsForIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateAssignTeamsForIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, listId, projectId } = action.payload;
      const dataTeams = {
        issueId: issueId.id || issueId,
        teamIds: listId,
      };
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Put.updateAssignTeamsForIssue(dataTeams, {}).pipe(
          switchMap(() => {
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const uploadAdditionAttachment$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.uploadAdditionAttachment.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { itemId, files } = action.payload;
      return concat(
        [startLoading({ key: "uploadAdditionAttachment" })],
        IssueService.Post.uploadAdditionAttachmentFile(files, itemId).pipe(
          switchMap((res) => {
            return [issueActions.getAttachmentFileRequest({ issueId: itemId })];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: "uploadAdditionAttachment" })],
      );
    }),
  );
};
const updateAdditionAttachment$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateAdditionAttachment.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { itemId, files } = action.payload;
      console.log(itemId);
      return concat(
        [startLoading({ key: "updateAdditionAttachment" })],
        IssueService.Put.updateAttachmentFile(files, itemId).pipe(
          switchMap((res) => {

            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: "updateAdditionAttachment" })],
      );
    }),
  );
};
const getAttachmentFile$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getAttachmentFileRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId } = action.payload;
      return concat(
        [startLoading({ key: "getAttachmentFile" })],
        IssueService.Get.getAttachmentFile(issueId).pipe(
          switchMap((res) => {
            return [issueActions.setIssueImageList(res)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: "getAttachmentFile" })],
      );
    }),
  );
};

const upLoadFileAttachment$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.upLoadFileAttachment.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, files } = action.payload;
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Post.uploadAttachmentFile(issueId, files).pipe(
          switchMap(() => {
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const getFinance$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getFinance.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // [18/12/2024][#21174][phuong_td] thêm mã templateCode truyền vào thay vì đặt cố định
      const { data, templateCode } = action.payload;
      return concat(
        [startLoading({ key: 'GetFinance' })],
        IssueService.Put.getFinance(data, templateCode).pipe(
          switchMap((res) => {
            if (res) {
              // [18/12/2024][#21174][phuong_td] bỏ ký tự " khỏi id
              return [issueActions.setFinance(res.replace(/"/g, ''))];
            }
            return []
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'GetFinance' })],
      );
    }),
  );
};



const getFileAttachmenForIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getFileAttachmenForIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, isKPI } = action.payload;
      return concat(
        [startLoading({ key: 'getFileAttachment' })],
        IssueService.Get.getFileAttachmenForIssue(issueId).pipe(
          switchMap(data => {
            if (isKPI) {
              return [
                issueActions.downloadFileAttachmentOfIssue({ id: data[0]?.drawingId, fileName: data[0]?.fileName }),
              ];
            }
            return [issueActions.setFileAttachmentForIssue(data)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getFileAttachment' })],
      );
    }),
  );
};

const downloadFileAttachmentOfIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.downloadFileAttachmentOfIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, fileName, isView } = action.payload;
      return concat(
        [startLoading({ key: 'getFileAttachment' })],
        DocumentService.Get.downloadFile(id).pipe(
          switchMap(data => {
            const url = window.URL.createObjectURL(data);
            if (isView) {
              // [#20497][dung_lt][26/10/2024] set thông tin file để view
              return [issueActions.setDataFileView({ url })]
            }
            // Tạo một liên kết ẩn và kích hoạt tải file
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Đặt tên file mong muốn
            document.body.appendChild(a);
            a.click();
            // Sau khi tải, loại bỏ liên kết và URL blob
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getFileAttachment' })],
      );
    }),
  );
};

const removeFileOfIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeFileOfIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, fileId, drawingId } = action.payload;
      return concat(
        [startLoading({ key: 'removeFileForIssueId' })],
        IssueService.Delete.removeFileOfIssue(issueId, fileId, drawingId, {}).pipe(
          switchMap(data => {
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'removeFileForIssueId' })],
      );
    }),
  );
};

const removeFileFolder$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeFileFolder.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { documentIds } = action.payload;
      return concat(
        [startLoading({ key: 'removeFileFolder' })],
        DocumentService.Delete.deleteDocuments(documentIds, {}).pipe(
          switchMap(data => {
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'removeFileFolder' })],
      );
    }),
  );
};

const createIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issue, tagVersionId, typeUpdate, listId, files } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Post.createIssue(issue).pipe(
          switchMap(result => {
            switch (typeUpdate) {
              case eTypeUpdate.WeeklyAssignment: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                if (files) {
                  return [
                    ...getIssuesByMilestone(state),
                    issueActions.updateAssignTeamsForIssue({ issueId: result.id, listId }),
                    issueActions.upLoadFileAttachment({ issueId: result.id, files }),
                  ];
                } else {
                  return [
                    ...getIssuesByMilestone(state),
                    issueActions.updateAssignTeamsForIssue({ issueId: result.id, listId }),
                  ];
                }
              }
              default:
                return IssueService.Get.getIssueByVersion(issue.projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification();
                    if (files !== null) {
                      return [
                        issueActions.upLoadFileAttachment({ issueId: result.id, files }),
                        issueActions.setIssues(issues),
                        issueActions.setSelectedIssue(undefined),
                        hideModal({ key: CreateUpdateIssueModalName }),
                      ];
                    }
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(error => {
                    Utils.errorHandling(error);
                    return [issueActions.setIssues([])];
                  }),
                );
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const uploadFileForFolder$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.uploadFileForFolder.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, labelid, files, parentId, isUpdate } = action.payload;
      return concat(
        [startLoading({ key: 'uploadFileForFolder' })],
        DocumentService.Post.uploadFileFolder(companyId, labelid, files, {}).pipe(
          switchMap(() => {
            if (isUpdate) {
              return [];
            } else {
              Utils.successNotification();
              return [projectActions.getLabel({ id: parentId })];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'uploadFileForFolder' })],
      );
    }),
  );
};

//#region updateIssueRequest
const updateIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, issue, tagVersionId, typeUpdate, resources, listId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Put.updateIssue(issueId, issue, {}).pipe(
          switchMap(result => {
            switch (typeUpdate) {
              case eTypeUpdate.WeeklyAssignment:
              case eTypeUpdate.AssignWork: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                // return getIssueByVersion(issue.projectId, state.issue.queryParamsWeeklyAssignment);
                return [
                  ...getIssuesByMilestone(state),
                  issueActions.updateAssignTeamsForIssue({ issueId: result.id, listId }),
                ];
              }
              default: {
                return IssueService.Get.getIssueByVersion(issue.projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification();
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(error => {
                    Utils.errorHandling(error);
                    return [issueActions.setIssues([])];
                  }),
                );
              }
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const updateStartDateIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateStartDateIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, newStartDate, tagVersionId, typeUpdate, projectId, listId, esitmateTime } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      console.log('updateStartDateIssueRequest');
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Put.updateStartDateIssue(issueId, newStartDate, esitmateTime).pipe(
          switchMap(result => {
            switch (typeUpdate) {
              case eTypeUpdate.WeeklyAssignment:
              case eTypeUpdate.AssignWork: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                // return getIssueByVersion(issue.projectId, state.issue.queryParamsWeeklyAssignment);
                return [
                  ...getIssuesByMilestone(state),
                  issueActions.updateAssignTeamsForIssue({ issueId: result.id, listId }),
                ];
              }
              default: {
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification();
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(error => {
                    Utils.errorHandling(error);
                    return [issueActions.setIssues([])];
                  }),
                );
              }
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const updateMultiIssueDateRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateMultiIssueDateRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data } = action.payload;
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Put.updateMultiIssueDate(data, {}).pipe(
          switchMap(result => {
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const removeIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: RemovingIssue })],
        IssueService.Delete.removeIssue(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingIssue })],
      );
    }),
  );
};

const getIssueStatusListRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(issueActions.getStatusListRequest.match),
    switchMap(action => {
      const { projectId, params } = action.payload;
      return concat(
        [startLoading({ key: GettingIssueStatusList })],
        IssueService.Get.getIssueStatusList(projectId, { search: params }).pipe(
          map(statuses => issueActions.setIssueStatuses(statuses)),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [issueActions.setIssueStatuses(undefined)];
          }),
        ),
        [stopLoading({ key: GettingIssueStatusList })],
      );
    }),
  );
};

const getIssueProgressListRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(issueActions.getProgressListRequest.match),
    switchMap(action => {
      const { projectId, params } = action.payload;
      return concat(
        [startLoading({ key: GettingIssueProgressList })],
        IssueService.Get.getIssueProgressList(projectId, { search: params }).pipe(
          map(statuses => issueActions.setIssueProgress(statuses)),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [issueActions.setIssueProgress(undefined)];
          }),
        ),
        [stopLoading({ key: GettingIssueProgressList })],
      );
    }),
  );
};

//#region getIssueByParentId$
const getIssueByParentId$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssueByParentIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { parentId, params } = action.payload;
      return concat(
        [startLoading({ key: Issue.getIssueByParentId })],
        IssueService.Get.getIssueByParentId(parentId, { search: params }).pipe(
          mergeMap(issues => {
            return [issueActions.setQueryParamsByParentId({}), issueActions.setIssuesByParentId(issues)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [issueActions.setIssuesByParentId(undefined)];
          }),
        ),
        [stopLoading({ key: Issue.getIssueByParentId })],
      );
    }),
  );
};

//#region getIssueByVersion
const getIssueByVersion$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssuesByMilestoneRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      const { pageSize, startDate, endDate, status } = search;
      if (pageSize !== null && pageSize !== undefined && pageSize !== 20) {
        // delete search.pageSize;
        search.pageSize = 10000;
      }
      if (startDate === '') delete search.startDate;
      if (endDate === '') delete search.endDate;
      if (status === '') delete search.status;
      // if (search.pageSize === 1000) search.paging = false;
      search.paging = false;

      return concat(
        [startLoading({ key: GettingIssueByVersionList })],
        IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
          mergeMap(issues => {
            return [issueActions.setQueryParamsByTagVersion(search), issueActions.setIssueByVersion(issues)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [issueActions.setIssueByVersion(undefined)];
          }),
        ),
        [stopLoading({ key: GettingIssueByVersionList })],
      );
    }),
  );
};

const removeCheckitemsTeam$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeCheckitemsTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { teamId, checkitemIds, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: IssueCheckItemsTeam.removeCheckitemsTeamRequest })],
        IssueService.Delete.removeCheckitemsTeam(teamId, checkitemIds, {}).pipe(
          switchMap(r => {
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: IssueCheckItemsTeam.removeCheckitemsTeamRequest })],
      );
    }),
  );
};

const getMembersToGroup$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getMembersToGroup.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { code } = action.payload;
      return concat(
        [startLoading({ key: 'getListMembers' })],
        IssueService.Get.getMembersToGroup(code, {}).pipe(
          switchMap(result => {
            return [issueActions.setMembersToGroup(result)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getListMembers' })],
      );
    }),
  );
};

const updateChecklistRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateChecklistRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issue, team, teamOld, ids, issueId, IssueCheckItemsTeamId } = action.payload;

      return concat(
        [startLoading({ key: updateCheckItems })],
        IssueService.Put.updateCheckItems(issueId, issue, {}).pipe(
          switchMap(checkitem => {
            Utils.successNotification();
            if (team) {
              // xóa team cũ

              const checkItemTeam = {
                issue_CheckItemId: checkitem.id,
                teamId: team.id,
                status: 0,
              };
              if (teamOld) {
                return [
                  issueActions.removeCheckitemsTeamRequest({
                    teamId: teamOld.id,
                    checkitemIds: [checkitem.id],
                    showNoti: false,
                  }),
                  issueActions.createIssueCheckItemsTeamRequest({ checkItemTeam, showNoti: false }),
                  issueActions.getIssueChecklistByIssueIdsRequest({ ids }),
                ];
              }
              return [
                issueActions.createIssueCheckItemsTeamRequest({ checkItemTeam, showNoti: false }),
                issueActions.getIssueChecklistByIssueIdsRequest({ ids }),
              ];
            } else {
              return [issueActions.getIssueChecklistByIssueIdsRequest({ ids })];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: updateCheckItems })],
      );
    }),
  );
};

const createChecklist$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createChecklistRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issue, team, ids } = action.payload;

      // const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: SavingIssue })],
        IssueService.Post.createCheckItems(issue).pipe(
          switchMap(checkitem => {
            Utils.successNotification();
            if (team) {
              const checkItemTeam: Issue_CheckItemsTeamDTO = {
                issue_CheckItemId: checkitem.id,
                teamId: team.id,
                status: 0,
              };
              return [
                issueActions.createIssueCheckItemsTeamRequest({ checkItemTeam }),
                issueActions.getIssueChecklistByIssueIdsRequest({ ids }),
              ];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: SavingIssue })],
      );
    }),
  );
};

const getIssueChecklistByIssueIds$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssueChecklistByIssueIdsRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { ids } = action.payload;
      return concat(
        [startLoading({ key: getIssueChecklistByIssueIds })], // Ensure type is defined
        IssueService.Put.getIssueChecklistByIssueId(ids, {}).pipe(
          switchMap((checkItem: any) => {
            const mapWithIssueId: Map<number, CheckItemsDTO[]> = new Map<number, CheckItemsDTO[]>();
            const CheckitemIds: number[] = [];
            checkItem.results.forEach((c: CheckItemsDTO) => {
              c && c.id !== undefined && c.id !== null && CheckitemIds.push(c.id);
              const arrayCheckitem = mapWithIssueId.get(c.issueId);
              if (arrayCheckitem) {
                arrayCheckitem.push(c);
              } else {
                mapWithIssueId.set(c.issueId, [c]);
              }
            });
            return [issueActions.setIssueChecklist(mapWithIssueId), issueActions.setCheckItemIds(CheckitemIds)]; // Ensure type is defined
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return []; // Ensure type is defined
          }),
        ),
        [stopLoading({ key: getIssueChecklistByIssueIds })], // Ensure type is defined
      );
    }),
  );
};

const getIssueChecklistsTeamByCheckitemIds$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssueChecklistsTeamByCheckitemIds.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { ids } = action.payload;
      return concat(
        [startLoading({ key: getIssueChecklistsTeamByCheckitemIds })], // Ensure type is defined
        IssueService.Put.getIssueChecklistsTeamByCheckitemIds(ids, {}).pipe(
          switchMap((checklistsTeams: any) => {
            return [issueActions.setChecklistsTeams(checklistsTeams)]; // Ensure type is defined
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return []; // Ensure type is defined
          }),
        ),
        [stopLoading({ key: getIssueChecklistsTeamByCheckitemIds })], // Ensure type is defined
      );
    }),
  );
};

const getTeamsIdsByCheckItemIdRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTeamsIdsByCheckItemIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;

      return concat(
        [startLoading({ key: IssueCheckItemsTeam.getTeamsIdsByCheckItemIdRequest })], // Ensure type is defined
        IssueService.Get.getTeamsIdsByCheckItemId(id, {}).pipe(
          switchMap((checklistsTeams: any) => {
            return [issueActions.setSelectedChecklistsTeam(checklistsTeams)]; // Ensure type is defined
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return []; // Ensure type is defined
          }),
        ),
        [stopLoading({ key: IssueCheckItemsTeam.getTeamsIdsByCheckItemIdRequest })], // Ensure type is defined
      );
    }),
  );
};

//#region getIssueChecklistsByTeamId$
const getIssueChecklistsByTeamId$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssueChecklistsByTeamId.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { teamId } = action.payload;

      return concat(
        [startLoading({ key: getIssueChecklistsByTeamId })], // Ensure type is defined
        IssueService.Get.getIssueChecklistsByTeamId(teamId, {}).pipe(
          switchMap((checklists: any) => {
            return []; // Ensure type is defined
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return []; // Ensure type is defined
          }),
        ),
        [stopLoading({ key: getIssueChecklistsByTeamId })], // Ensure type is defined
      );
    }),
  );
};

const createIssueCheckItemsTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createIssueCheckItemsTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { checkItemTeam, showNoti } = action.payload;
      return concat(
        [startLoading({ key: IssueCheckItemsTeam.createIssueCheckItemsTeamRequest })],
        IssueService.Post.createIssueCheckItemsTeam(checkItemTeam).pipe(
          switchMap(d => {
            showNoti && Utils.successNotification();

            // return [issueActions.getIssueChecklistByIssueIdsRequest({
            //   ids,
            //   tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
            //   showNotice: false,
            // })]
            return [];
          }),
          catchError(error => {
            showNoti && Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: IssueCheckItemsTeam.createIssueCheckItemsTeamRequest })],
      );
    }),
  );
};

const getTeamIdsByIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTeamIdsByIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId } = action.payload;

      return concat(
        [startLoading({ key: getTeamIdsByIssueRequest })],
        IssueService.Get.getTeamIdsByIssue(issueId, {}).pipe(
          mergeMap(issueTeams => {
            return [issueActions.setIssueTeam(issueTeams)];
          }),
          catchError(() => {
            return [];
          }),
        ),
        [stopLoading({ key: getTeamIdsByIssueRequest })],
      );
    }),
  );
};

const createIssueTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createIssueTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueTeam } = action.payload;
      return concat(
        [startLoading({ key: createIssueTeamRequest })],
        IssueService.Post.createIssueTeam(issueTeam).pipe(
          switchMap(results => {
            Utils.successNotification();

            return [issueActions.getTeamIdsByIssueRequest({ id: issueTeam.issueId }), ...getIssuesByMilestone(state)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: createIssueTeamRequest })],
      );
    }),
  );
};

const removeIssueTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeIssueTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, teamId } = action.payload;
      return concat(
        [startLoading({ key: RemovingIssueTeam })],
        IssueService.Delete.removeIssueTeam(teamId, issueId).pipe(
          switchMap(results => {
            Utils.successNotification();
            return [
              issueActions.getIssueTeamsByIssueRequest({
                issueId: issueId,
                params: {},
              }),
              ...getIssuesByMilestone(state),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingIssueTeam })],
      );
    }),
  );
};

const updateIssueTeamsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateIssueTeamsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { teamDatas } = action.payload;
      return concat(
        [startLoading({ key: updateIssueTeams })],
        IssueService.Put.updateIssueTeams(teamDatas, {}).pipe(
          switchMap(() => {
            return [...getIssuesByMilestone(state)];
          }),
        ),
        [stopLoading({ key: updateIssueTeams })],
      );
    }),
  );
};

const getIssueTeamsByIssueRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getIssueTeamsByIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId } = action.payload;

      return concat(
        [startLoading({ key: getIssueTeamsByIssueRequest })],
        IssueService.Get.getIssueTeamsByIssueRequest(issueId, {}).pipe(
          mergeMap(issueTeams => {
            return [issueActions.setIssueTeam(issueTeams)];
          }),
          catchError(() => {
            return [];
          }),
        ),
        [stopLoading({ key: getIssueTeamsByIssueRequest })],
      );
    }),
  );
};

const updateStatusIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateStatusIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, code, projectId, issue } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: UpdateStatusIssue })],
        IssueService.Put.updateStatusIssues(id, code, {}).pipe(
          switchMap(result => {
            const dataPut = {
              ...issue,
              progress: 100,
            };
            return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
              mergeMap(issues => {
                if (result.status === 'Hoan_Thanh') {
                  return [
                    issueActions.setQueryParams(search),
                    issueActions.setIssueByVersion(issues),
                    issueActions.updateIssueRequest({
                      issueId: result.id,
                      issue: dataPut,
                      tagVersionId: result.tagVersionId,
                    }),
                  ];
                }
                return [issueActions.setQueryParams(search), issueActions.setIssueByVersion(issues)];
              }),
              catchError(error => {
                Utils.errorHandling(error);
                return [];
              }),
            );
          }),
        ),
        [stopLoading({ key: UpdateStatusIssue })],
      );
    }),
  );
};

const updateMultiStatusIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateMultiStatusIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, code, projectId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: UpdateStatusIssue })],
        IssueService.Put.updateMultiStatusIssues(code, id, {}).pipe(
          switchMap(() => {
            return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
              mergeMap(issues => {
                return [issueActions.setQueryParams(search), issueActions.setIssueByVersion(issues)];
              }),
              catchError(error => {
                Utils.errorHandling(error);
                return [];
              }),
            );
          }),
        ),
        [stopLoading({ key: UpdateStatusIssue })],
      );
    }),
  );
};

//#region Category
const getCategoryByCompanyIdRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getCategoryByCompanyIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { companyId, tagVersionCode } = action.payload;
      return concat(
        [startLoading({ key: getCategoryByCompanyIdRequest })],
        IssueService.Get.getCategoryByCompanyId(companyId, tagVersionCode, {}).pipe(
          mergeMap(category => {
            // Utils.successNotification();

            return [issueActions.setCategory(category.results)];
            // return []
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: getCategoryByCompanyIdRequest })],
      );
    }),
  );
};

//#region AttributeDim
const createAttributeDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createAttributeDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: AttributeDim.createAttributeDim })],
        IssueService.Post.createAttributeDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: AttributeDim.createAttributeDim })],
      );
    }),
  );
};

const updateAttributeDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateAttributeDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: AttributeDim.updateAttributeDim })],
        IssueService.Put.updateAttributeDim(issueId, data, {}).pipe(
          switchMap(otherResources => {
            return [];
          }),
        ),
        [stopLoading({ key: AttributeDim.updateAttributeDim })],
      );
    }),
  );
};

const getAttributeDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getAttributeDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: AttributeDim.getAttributeDim })],
        IssueService.Get.getAttributeDim(id, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setTracker(data.results)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: AttributeDim.getAttributeDim })],
      );
    }),
  );
};

const getAttributeDimByTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getAttributeDimByTracker.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { trackerId } = action.payload;
      return concat(
        [startLoading({ key: AttributeDim.getAttributeDimByTracker })],
        IssueService.Get.getAttributeDimByTracker(trackerId, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setAttributes(data.results)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: AttributeDim.getAttributeDimByTracker })],
      );
    }),
  );
};

const removeAttributeDimRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeAttributeDimRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: AttributeDim.removeAttributeDim })],
        IssueService.Delete.removeTrackerDim(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: AttributeDim.removeAttributeDim })],
      );
    }),
  );
};

//#region LaborDim
const createLaborDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createLaborDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: LaborDim.createLaborDim })],
        IssueService.Post.createLaborDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: LaborDim.createLaborDim })],
      );
    }),
  );
};

const updateLaborDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateLaborDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: LaborDim.updateLaborDim })],
        IssueService.Put.updateLaborDim(issueId, data, {}).pipe(
          switchMap(otherResources => {
            // return IssueService.Get.getLaborDim(projectId, {search}).pipe(
            //   mergeMap(issues => {
            //     return [
            //       issueActions.setQueryParams(search),
            //       issueActions.setIssueByVersion(issues)
            //     ];
            //   }),
            //   catchError(error => {
            //     Utils.errorHandling(error);
            //     return [];
            //   }),
            // )
            return [];
          }),
        ),
        [stopLoading({ key: LaborDim.updateLaborDim })],
      );
    }),
  );
};

const getLaborDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getLaborDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: LaborDim.getLaborDim })],
        IssueService.Get.getLaborDim(id, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setTracker(data.results)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: LaborDim.getLaborDim })],
      );
    }),
  );
};

const getLaborDimByTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getLaborDimByTracker.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { trackerId } = action.payload;
      return concat(
        [startLoading({ key: LaborDim.getLaborDimByTracker })],
        IssueService.Get.getLaborDimByTracker(trackerId, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setTracker(data.results)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: LaborDim.getLaborDimByTracker })],
      );
    }),
  );
};

const removeLaborDimRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeLaborDimRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: LaborDim.removeLaborDim })],
        IssueService.Delete.removeTrackerDim(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: LaborDim.removeLaborDim })],
      );
    }),
  );
};

//#region Tag
const getTagByCompanyIdRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTagByCompanyIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { companyId } = action.payload;
      return concat(
        [startLoading({ key: getTagByCompanyIdRequest })],
        IssueService.Get.getTagByCompanyId(companyId, {}).pipe(
          mergeMap(tags => {
            // Utils.successNotification();

            return [issueActions.setTagsVersion(tags.results)];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: getTagByCompanyIdRequest })],
      );
    }),
  );
};
//#region TargetTracker
const createTargetTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createTargetTracker.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: TargetTracker.createTargetTracker })],
        IssueService.Post.createTargetTracker(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: TargetTracker.createTargetTracker })],
      );
    }),
  );
};

const updateTargetTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateTargetTracker.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: TargetTracker.updateTargetTracker })],
        IssueService.Put.updateTargetTracker(issueId, data, {}).pipe(
          switchMap(Tracker => {
            console.log('Tracker ', Tracker);
            // return IssueService.Get.getTargetTracker(projectId, {search}).pipe(
            //   mergeMap(issues => {
            //     return [
            //       issueActions.setQueryParams(search),
            //       issueActions.setIssueByVersion(issues)
            //     ];
            //   }),
            //   catchError(error => {
            //     Utils.errorHandling(error);
            //     return [];
            //   }),
            // )
            return [];
          }),
        ),
        [stopLoading({ key: TargetTracker.updateTargetTracker })],
      );
    }),
  );
};

//#region Tracker
const getTrackerByProject$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTrackerByProject.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: TrackerDim.getTrackerByProject })],
        IssueService.Get.getTrackerByProject(id, {}).pipe(
          mergeMap(tracker => {
            // Utils.successNotification();

            return [issueActions.setTracker(tracker.results)];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: TrackerDim.getTrackerByProject })],
      );
    }),
  );
};

const getTrackerByCompany$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTrackerByCompany.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: TrackerDim.getTrackerByCompany })],
        IssueService.Get.getTrackerByCompany(id, {}).pipe(
          mergeMap(tracker => {
            // Utils.successNotification();
            // console.log('getTrackerByCompany ', tracker);

            return [issueActions.setTracker(tracker.results)];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: TrackerDim.getTrackerByCompany })],
      );
    }),
  );
};

const createTrackerDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createTrackerDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: TrackerDim.createTrackerDim })],
        IssueService.Post.createTrackerDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: TrackerDim.createTrackerDim })],
      );
    }),
  );
};

const updateTrackerDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateTrackerDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: TrackerDim.updateTrackerDim })],
        IssueService.Put.updateTrackerDim(issueId, data, {}).pipe(
          switchMap(Tracker => {
            // return IssueService.Get.getTrackerDim(projectId, {search}).pipe(
            //   mergeMap(issues => {
            //     return [
            //       issueActions.setQueryParams(search),
            //       issueActions.setIssueByVersion(issues)
            //     ];
            //   }),
            //   catchError(error => {
            //     Utils.errorHandling(error);
            //     return [];
            //   }),
            // )
            return [];
          }),
        ),
        [stopLoading({ key: TrackerDim.updateTrackerDim })],
      );
    }),
  );
};

const removeTrackerDimRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeTrackerDimRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: TrackerDim.removeTrackerDim })],
        IssueService.Delete.removeTrackerDim(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: TrackerDim.removeTrackerDim })],
      );
    }),
  );
};

//#region OtherResourcesDim
const createOtherResourcesDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createOtherResourcesDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: OtherResourcesDim.createOtherResourcesDim })],
        IssueService.Post.createOtherResourcesDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [
                issueActions.addOtherResourcesDimToIssue({
                  issueId: issue.id,
                  data: results,
                  projectId: issue.projectId,
                }),
              ];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.createOtherResourcesDim })],
      );
    }),
  );
};

const addOtherResourcesDimToIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.addOtherResourcesDimToIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, data } = action.payload;
      const projectId = state?.project?.selectedProject?.id;
      return concat(
        [startLoading({ key: OtherResourcesDim.addOtherResourcesDimToIssue })],
        IssueService.Put.addOtherResourcesDimToIssue(id, data, {}).pipe(
          switchMap(results => {
            return [...getIssuesByMilestone(state)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.addOtherResourcesDimToIssue })],
      );
    }),
  );
};

const updateOtherResourcesDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateOtherResourcesDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: OtherResourcesDim.updateOtherResourcesDim })],
        IssueService.Put.updateOtherResourcesDim(issueId, data, {}).pipe(
          switchMap(otherResources => {
            // return IssueService.Get.getOtherResourcesDim(projectId, {search}).pipe(
            //   mergeMap(issues => {
            //     return [
            //       issueActions.setQueryParams(search),
            //       issueActions.setIssueByVersion(issues)
            //     ];
            //   }),
            //   catchError(error => {
            //     Utils.errorHandling(error);
            //     return [];
            //   }),
            // )
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.updateOtherResourcesDim })],
      );
    }),
  );
};

const getOtherResourcesDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getOtherResourcesDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: OtherResourcesDim.getOtherResourcesDim })],
        IssueService.Get.getOtherResourcesDim(id, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setTracker(data.results)];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.getOtherResourcesDim })],
      );
    }),
  );
};

const getOtherResourcesDimByTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getOtherResourcesDimByTracker.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { trackerId } = action.payload;

      return concat(
        [startLoading({ key: OtherResourcesDim.getOtherResourcesDimByTracker })],
        IssueService.Get.getOtherResourcesDimByTracker(trackerId, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setOtherResources(data.results)];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.getOtherResourcesDimByTracker })],
      );
    }),
  );
};

const removeOtherResourcesDimRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeOtherResourcesDimRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: OtherResourcesDim.removeOtherResourcesDim })],
        IssueService.Delete.removeTrackerDim(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: OtherResourcesDim.removeOtherResourcesDim })],
      );
    }),
  );
};

//#region IssueMaterialsQuota
const createIssueMaterialsQuota$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createIssueMaterialsQuota.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: Quota.createIssueMaterialsQuota })],
        IssueService.Post.createIssueMaterialsQuota(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: Quota.createIssueMaterialsQuota })],
      );
    }),
  );
};

//#region IssueMaterialsQuota
const createIssue_OtherResourceQuota$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createIssue_OtherResourceQuota.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: Quota.createIssue_OtherResourceQuota })],
        IssueService.Post.createIssue_OtherResourceQuota(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: Quota.createIssue_OtherResourceQuota })],
      );
    }),
  );
};

//#region MaterialsDim

const addMaterialsDimToIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.addMaterialsDimToIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data, projectId } = action.payload;
      return concat(
        [startLoading({ key: MaterialsDim.addMaterialsDimToIssue })],
        IssueService.Put.addMaterialsDimToIssue(issueId, [data], {}).pipe(
          switchMap(results => {
            return [...getIssuesByMilestone(state)];
          }),
        ),
        [stopLoading({ key: MaterialsDim.addMaterialsDimToIssue })],
      );
    }),
  );
};

const createMaterialsDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createMaterialsDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: MaterialsDim.createMaterialsDim })],
        IssueService.Post.createMaterialsDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [
                issueActions.addMaterialsDimToIssue({ issueId: issue.id, data: results, projectId: issue.projectId }),
              ];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: MaterialsDim.createMaterialsDim })],
      );
    }),
  );
};

const updateMaterialsDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateMaterialsDim.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, data } = action.payload;
      return concat(
        [startLoading({ key: MaterialsDim.updateMaterialsDim })],
        IssueService.Put.updateMaterialsDim(issueId, data, {}).pipe(
          switchMap(otherResources => {
            // return IssueService.Get.getMaterialsDim(projectId, {search}).pipe(
            //   mergeMap(issues => {
            //     return [
            //       issueActions.setQueryParams(search),
            //       issueActions.setIssueByVersion(issues)
            //     ];
            //   }),
            //   catchError(error => {
            //     Utils.errorHandling(error);
            //     return [];
            //   }),
            // )
            return [];
          }),
        ),
        [stopLoading({ key: MaterialsDim.updateMaterialsDim })],
      );
    }),
  );
};

const getMaterialsDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getMaterialsDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { id } = action.payload;
      return concat(
        [startLoading({ key: MaterialsDim.getMaterialsDim })],
        IssueService.Get.getMaterialsDim(id, {}).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setTracker(data.results)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: MaterialsDim.getMaterialsDim })],
      );
    }),
  );
};

const getMaterialsDimByTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getMaterialsDimByTracker.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { trackerId, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParamsMaterial, ...params };
      return concat(
        [startLoading({ key: MaterialsDim.getMaterialsDimByTracker })],
        IssueService.Get.getMaterialsDimByTracker(trackerId, { search }).pipe(
          mergeMap(data => {
            // Utils.successNotification();
            return [issueActions.setMaterials(data), issueActions.setQueryParamsMaterial(search)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [issueActions.setMaterials(undefined)];
          }),
        ),
        [stopLoading({ key: MaterialsDim.getMaterialsDimByTracker })],
      );
    }),
  );
};

const removeMaterialsDimRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeMaterialsDimRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, projectId, tagVersionId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: MaterialsDim.removeMaterialsDim })],
        IssueService.Delete.removeTrackerDim(issueId).pipe(
          switchMap(() => {
            switch (tagVersionId) {
              case sMilestone.SetupInitialProgress: {
                Utils.successNotification();
                search.tagVersionId = tagVersionId;
                return [...getIssuesByMilestone(state)];
              }
              default:
                return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
                  mergeMap(issues => {
                    Utils.successNotification('Removed successfully');
                    return [
                      issueActions.setIssues(issues),
                      issueActions.setSelectedIssue(undefined),
                      issueActions.setQueryParams(search),
                      hideModal({ key: CreateUpdateIssueModalName }),
                    ];
                  }),
                  catchError(errors => {
                    Utils.errorHandling(errors);
                    return [issueActions.setIssues(undefined)];
                  }),
                );
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: MaterialsDim.removeMaterialsDim })],
      );
    }),
  );
};

const deleteMultiIssues$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.deleteMultiIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { listIdIssue, projectId } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: RemovingIssue })],
        IssueService.Post.delete_multiIssue(listIdIssue).pipe(
          switchMap(() => {
            return IssueService.Get.getIssueByVersion(projectId, { search }).pipe(
              mergeMap(issues => {
                Utils.successNotification('Removed successfully');
                return [
                  issueActions.setIssues(issues),
                  issueActions.setSelectedIssue(undefined),
                  issueActions.setQueryParams(search),
                  hideModal({ key: CreateUpdateIssueModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [issueActions.setIssues(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingIssue })],
      );
    }),
  );
};

//#region target
const getTargetByCondition$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getTargetByConditionRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { trackerId, projectId, type } = action.payload;
      const search = { trackerId, projectId };
      return concat(
        [startLoading({ key: Target.getTargetByCondition })],
        IssueService.Get.getTargetByCondition({ search }).pipe(
          switchMap(target => {
            switch (type) {
              case targetType.Issuse:
                return [issueActions.setTargetsIssue(target.results)];
              default:
                return [issueActions.setTarget(target.results)];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: Target.getTargetByCondition })],
      );
    }),
  );
};

const createTargetDim$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createTargetDim.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data, issue } = action.payload;
      return concat(
        [startLoading({ key: Target.createTargetDim })],
        IssueService.Post.createTargetDim(data).pipe(
          switchMap(results => {
            // Utils.successNotification();
            if (issue) {
              return [issueActions.addTargetToIssue({ issueId: issue.id, data: results, projectId: issue.projectId })];
            }
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: Target.createTargetDim })],
      );
    }),
  );
};

const updateTargetToIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateTargetToIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, data, projectId } = action.payload;
      return concat(
        [startLoading({ key: Target.updateTargetToIssue })],
        IssueService.Put.updateTargetToIssue(id, data, {}).pipe(
          switchMap(() => {
            return [...getIssuesByMilestone(state)];
          }),
        ),
        [stopLoading({ key: Target.updateTargetToIssue })],
      );
    }),
  );
};

const addTargetToIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.addTargetToIssue.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, data, projectId } = action.payload;

      const search = { ...defaultPagingParams, ...state.issue.queryParams };
      return concat(
        [startLoading({ key: Target.addTargetToIssue })],
        IssueService.Put.addTargetToIssue(id, data, {}).pipe(
          switchMap(() => {
            return [...getIssuesByMilestone(state)];
          }),
        ),
        [stopLoading({ key: Target.addTargetToIssue })],
      );
    }),
  );
};

const createRealtionship$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.createRealtionship.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { data } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.createRealtionship })],
        IssueService.Post.createRealtionship(data).pipe(
          switchMap(results => {
            Utils.successNotification();
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: IssueRelationship.createRealtionship })],
      );
    }),
  );
};

const getParentIssueRelationshipByIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getParentIssueRelationshipByIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.getParentIssueRelationshipByIssue })],
        IssueService.Get.getParentIssueRelationShipById(issueId, {}).pipe(
          mergeMap(IssueRelationship => {
            return [issueActions.setIssueRelationshipParent(IssueRelationship)];
          }),
          catchError(errors => {
            return [issueActions.setIssueRelationshipParent([])];
          }),
        ),
        [stopLoading({ key: IssueRelationship.getParentIssueRelationshipByIssue })],
      );
    }),
  );
};

const getChildIssueRelationshipByIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getChildIssueRelationshipByIssueRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.getChildIssueRelationshipByIssue })],
        IssueService.Get.getChildIssueRelationShipById(issueId, {}).pipe(
          mergeMap(IssueRelationship => {
            return [issueActions.setIssueRelationshipChild(IssueRelationship)];
          }),
          catchError(errors => {
            return [issueActions.setIssueRelationshipChild([])];
          }),
        ),
        [stopLoading({ key: IssueRelationship.getChildIssueRelationshipByIssue })],
      );
    }),
  );
};

const getAllChildIssueRelationShipFromId$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getAllChildIssueRelationShipFromIdRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.getAllChildIssueRelationShipFromId })],
        IssueService.Get.getAllChildIssueRelationShipFromId(issueId, {}).pipe(
          mergeMap(IssueRelationship => {
            return [issueActions.setAllChildIssueRelationShipFromId(IssueRelationship)];
          }),
          catchError(errors => {
            return [issueActions.setAllChildIssueRelationShipFromId([])];
          }),
        ),
        [stopLoading({ key: IssueRelationship.getAllChildIssueRelationShipFromId })],
      );
    }),
  );
};

const removeIssueRelationship$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.removeIssueRelationship.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueFirstId, issueSecondId } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.removeIssueRelationship })],
        IssueService.Delete.removeIssueRelationship(issueFirstId, issueSecondId).pipe(
          switchMap(() => {
            // Utils.successNotification("Relationship removed successfully");
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: IssueRelationship.removeIssueRelationship })],
      );
    }),
  );
};

const updateIssueRelationship$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateRealtionship.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueFirstId, issueSecondId, issueRelationship } = action.payload;
      return concat(
        [startLoading({ key: IssueRelationship.updateRealtionship })],
        IssueService.Put.updateIssueRelationship(issueFirstId, issueSecondId, issueRelationship, {}).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: IssueRelationship.updateRealtionship })],
      );
    }),
  );
};

const getMachinerysDimByTracker$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getMachinerysDimByTracker.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { trackerId, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParamsMaterial, ...params };
      return concat(
        [startLoading({ key: MachinerysDim.getMachinerysDimByTracker })],
        IssueService.Get.getMachinerysDimByTracker(trackerId, { search }).pipe(
          mergeMap(data => {
            // Utils.successNotification();

            return [issueActions.setQueryParamsMachinery(search), issueActions.setMachineries(data)];
          }),
          catchError(() => {
            // Utils.errorHandling(error);
            return [issueActions.setQueryParamsMachinery(search), issueActions.setMachineries(undefined)];
          }),
        ),
        [stopLoading({ key: MachinerysDim.getMachinerysDimByTracker })],
      );
    }),
  );
};

//#region getEmployeeReportByIssue
/**
 * //#region [19/10/2024][#20489][phuong_td] Lấy dữ liệu EmployeeReport theo Issue
 * @param action$
 * @param state$
 * @returns
 */
const getEmployeeReportByIssue$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getEmployeeReportByIssue.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { issueId, resolve } = action.payload;
      return concat(
        [startLoading({ key: EmployeeReport.getEmployeeReportByIssue })],
        IssueService.Get.getEmployeeReportByIssue(issueId, {}).pipe(
          mergeMap(employeeReport => {
            // Utils.successNotification();
            if (resolve) {
              resolve(employeeReport);
            }
            return [issueActions.setEmployeeReportByIssue(employeeReport)];
            // return []
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [issueActions.setEmployeeReportByIssue(undefined)];
          }),
        ),
        [stopLoading({ key: EmployeeReport.getEmployeeReportByIssue })],
      );
    }),
  );
};

// [06/11/2024][phuong_td] updateIssueAttributeRequest
const updateIssueAttributeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.updateIssueAttributeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { issueId, attributes, hiddenNotification, resolve } = action.payload;
      return concat(
        IssueService.Put.updateIssueAttribute(issueId, attributes).pipe(
          switchMap(result => {
            // [13/11/2024][#20793][phuong_td] ẩn thông báo khi lưu tự động giá trị tính được
            !hiddenNotification && Utils.successNotification();
            if (resolve) {
              resolve(result);
            }
            return [...getIssuesByMilestone(state)];
          }),
          catchError(error => {
            !hiddenNotification && Utils.errorHandling(error);
            return [];
          }),
        ),
      );
    }),
  );
};
const getTotalVolume$: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(issueActions.getTotalVolumeRequest.match), // Bắt hành động yêu cầu getTotalVolumeRequest
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { projectId, options } = action.payload; // Lấy projectId và options từ payload của action ở slice
      return IssueService.Get.getTotalVolume(projectId, options).pipe(
        map((response: { issueId: number; totalVolumeAchieved: number, totalLaborCountAchieved: number }[]) => {
          // Gửi action getTotalVolumeSuccess với dữ liệu trả về từ API
          return issueActions.getTotalVolumeSuccess({
            projectId,
            options,
            totalVolumeAchievedData: response, // Trả về dữ liệu nhận được từ API và lưu vào totalVolumeAchievedData
          });
        }),
        catchError(error => {
          console.error('Error từ getTotalVolume:', error); // In ra lỗi nếu có
          return of(issueActions.getTotalVolumeFailure(error.message)); // Trả về action thất bại
        }),
      );
    }),
  );

// [09/11/2024][#20629][phuong_td] Lấy report theo ngày
const getReportsByStartEndDate$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.getReportsByStartEndDateRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, params } = action.payload; // Lấy projectId và params từ payload của action ở slice
      return concat(
        IssueService.Get.getReportsByStartEndDate(projectId, { search: { ...params } }).pipe(
          switchMap(result => {
            // Utils.successNotification();
            return [
              issueActions.setReportsByStartEndDate(result),
              issueActions.setQueryReportsByStartEndDate(action.payload)
            ];
          }),
          catchError(error => {
            // Utils.errorHandling(error);
            return [
              issueActions.setReportsByStartEndDate([]),
              issueActions.setQueryReportsByStartEndDate(action.payload)
            ];
          }),
        ),
      );
    }),
  );
};

const exportProposalPDFRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.exportProposalPDFRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { proposalData, so_ct } = action.payload;
      console.log(proposalData, so_ct);
      return concat(
        ProjectService.Post.exportProposalPDF(proposalData).pipe(
          switchMap((result: Blob) => {
            const url = window.URL.createObjectURL(result);

            // Tạo thẻ <a> ẩn và tự động tải file
            const a = document.createElement("a");
            a.href = url;
            a.download = `Phiếu đề xuất - ${so_ct}.pdf`; // Tên file có thể thay đổi
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Utils.successNotification();
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
      );
    }),
  );
};
const exportInventoryReceiptPDFRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(issueActions.exportInventoryReceiptPDFRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { proposalData, so_ct } = action.payload;
      console.log(proposalData);

      return concat(
        ProjectService.Post.exportInventoryReceiptPDF(proposalData).pipe(
          switchMap((result: Blob) => {
            const url = window.URL.createObjectURL(result);

            // Tạo thẻ <a> ẩn và tự động tải file
            const a = document.createElement("a");
            a.href = url;
            a.download = `Phiếu nhập kho - ${so_ct}.pdf`; // Tên file có thể thay đổi
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            Utils.successNotification();
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
      );
    }),
  );
};
export const issueEpics = [
  getTotalVolume$,
  // Issue
  getIssuesRequest$,
  createIssueRequest$,
  updateIssueRequest$,
  updateStartDateIssueRequest$,
  getMembersToGroup$,
  updateMultiIssueDateRequest$,
  removeIssueRequest$,
  getIssueStatusListRequest$,
  getIssueProgressListRequest$,
  getIssueByVersion$,
  deleteMultiIssues$,
  upLoadFileAttachment$,
  uploadFileForFolder$,
  getFileAttachmenForIssue$,
  downloadFileAttachmentOfIssue$,
  getIssueByParentId$,
  removeFileOfIssue$,
  removeFileFolder$,
  updateIssueAttributeRequest$,
  // Checklist
  getIssueChecklistByIssueIds$,
  createChecklist$,
  updateChecklistRequest$,
  getIssueChecklistsTeamByCheckitemIds$,
  getTeamsIdsByCheckItemIdRequest$,
  createIssueCheckItemsTeamRequest$,
  getIssueChecklistsByTeamId$,
  removeCheckitemsTeam$,
  updateAdditionAttachment$,
  // Category
  getCategoryByCompanyIdRequest$,
  // Tag
  getTagByCompanyIdRequest$,
  // Team
  getTeamIdsByIssueRequest$,
  getIssueTeamsByIssueRequest$,
  removeIssueTeamRequest$,
  updateStatusIssue$,
  updateMultiStatusIssue$,
  createIssueTeamRequest$,
  removeIssueTeamRequest$,
  updateIssueTeamsRequest$,
  uploadAdditionAttachment$,
  // Tracker
  getTrackerByProject$,
  getTrackerByCompany$,
  createTrackerDim$,
  updateTrackerDim$,
  removeTrackerDimRequest$,
  // OtherResourcesDim
  createOtherResourcesDim$,
  addOtherResourcesDimToIssue$,
  updateOtherResourcesDim$,
  getOtherResourcesDim$,
  getOtherResourcesDimByTracker$,
  removeOtherResourcesDimRequest$,
  // MaterialsDim
  createMaterialsDim$,
  addMaterialsDimToIssue$,
  updateMaterialsDim$,
  getMaterialsDim$,
  getMaterialsDimByTracker$,
  removeMaterialsDimRequest$,
  // TargetTracker
  updateTargetTracker$,
  createTargetTracker$,
  // AttributeDim
  createAttributeDim$,
  updateAttributeDim$,
  getAttributeDim$,
  getAttributeDimByTracker$,
  removeAttributeDimRequest$,
  // LaborDim
  createLaborDim$,
  updateLaborDim$,
  getLaborDim$,
  getLaborDimByTracker$,
  removeLaborDimRequest$,
  // Quota
  createIssueMaterialsQuota$,
  createIssue_OtherResourceQuota$,
  updateAssignTeamsForIssue$,
  // target
  getTargetByCondition$,
  updateTargetToIssue$,
  addTargetToIssue$,
  createTargetDim$,
  // Relationship
  createRealtionship$,
  getParentIssueRelationshipByIssue$,
  getChildIssueRelationshipByIssue$,
  removeIssueRelationship$,
  getAllChildIssueRelationShipFromId$,
  updateIssueRelationship$,
  // MachinerysDim
  getMachinerysDimByTracker$,
  // EmployeeReport
  getEmployeeReportByIssue$,
  getFinance$,
  getReportsByStartEndDate$,
  exportProposalPDFRequest$,
  exportInventoryReceiptPDFRequest$,
  getAttachmentFile$
];
