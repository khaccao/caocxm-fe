import { filter, withLatestFrom, switchMap, concat, mergeMap, catchError, of } from "rxjs";

import { groupActions } from "./groupSlice";
import { startLoading, stopLoading } from "../loading";
import { shiftActions } from "../shift";
import { RootEpic } from "../types";
import { defaultPagingParams } from "@/common/define";
import { IAttachmentLinks } from "@/services/AccountingInvoiceService";
import { GroupService } from "@/services/GroupService";
import Utils from "@/utils";

const getGroupsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.getGroupsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { companyId } = action.payload;
     //console.log(companyId);
      return concat(
        [startLoading({ key: 'getGroupsRequest' })],
        GroupService.Get.getGroup(action.payload).pipe(
          mergeMap(groups => {
            return [groupActions.setGroups(groups.results)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [groupActions.setGroups(undefined)];
          }),
        ),
        [stopLoading({ key: 'getGroupsRequest' })],
      );
    }),
  );
};

const editGroupsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.editGroupRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id, queryParams, inputValues } = action.payload;
      return concat(
        [startLoading({ key: 'editGroupsRequest' })],
        GroupService.Put.editGroup(id, inputValues).pipe(
          mergeMap(groups => {
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),),
        [stopLoading({ key: 'editGroupsRequest' })],
      );
    }),
  );
};
const addMemberToGroupRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.addMemberToGroupRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { groupId, employeeIds, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'addMemberToGroupRequest' })],
        GroupService.Put.addMemberToGroup(groupId, employeeIds).pipe(
          mergeMap(groups => {
            return [
              groupActions.getGroupsRequest(companyId)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),),
        [stopLoading({ key: 'addMemberToGroupRequest' })],
      );
    }),
  );
};
const newGroupsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.createGroupRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { inputValues } = action.payload;
      //console.log('test run new request', inputValues);
      return concat(
        [startLoading({ key: 'newGroupsRequest' })],
        GroupService.Post.addNewGroup(inputValues).pipe(
          mergeMap(groups => {
            Utils.successNotification('Tạo phòng ban mới thành công!')
            return [
              groupActions.setCreateGroups(groups),
              groupActions.getGroupsRequest(inputValues.companyId)
            ];
          }),
          catchError(errors => {
            // [09/12/2024][#21139][phuong_td] Điều chỉnh câu thông báo khi tạo và cập nhật phòng ban
            Utils.errorHandling({
              response: errors.response,
              errorCode: errors.response.StatusCode,
              msg: "The department code has existed!",
              values: {
                code: inputValues.code
              }
            });
            return [];
          }),),
        [stopLoading({ key: 'newGroupsRequest' })],
      );
    }),
  );
};
const deleteGroupRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.removeGroupsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id, companyId } = action.payload;
      //console.log(id, companyId);
      return concat(
        [startLoading({ key: 'deleteGroupRequest' })],
        GroupService.Delete.deleteGroup(id).pipe(
          mergeMap(groups => {
            return [groupActions.getGroupsRequest(companyId)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),),
        [stopLoading({ key: 'deleteGroupRequest' })],
      );
    }),
  );
};
const deleteEmployeeGroupRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.deleteEmployeeGroupRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { employeeId, parentId, companyId } = action.payload;
      //console.log(employeeId, parentId, companyId);
      return concat(
        [startLoading({ key: 'deleteEmployeeGroupRequest' })],
        GroupService.Delete.deleteEmployeeGroup({employeeId: employeeId, parentId: parentId }).pipe(
          mergeMap(groups => {
            return [groupActions.getGroupsRequest(companyId)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),),
        [stopLoading({ key: 'deleteEmployeeGroupRequest' })],
      );
    }),
  );
};

const moveEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.moveEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { employeeId, groupId, companyId, newGroupId } = action.payload;
      const body = {
        employeeId: employeeId,
        groupId: newGroupId
      };
      return concat(
        [startLoading({ key: 'addMemberToGroupRequest' })],
        GroupService.Put.updateEmployeeToGroup(Number(groupId), Number(employeeId), body).pipe(
          mergeMap(groups => {
            return [groupActions.getGroupsRequest(companyId)];
          }),     
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),),
        [stopLoading({ key: 'addMemberToGroupRequest' })],
      );
    }),
  );
};

//[#21002][hoang_nm][29/11/2024] Epic update phòng bạn, payload bao gồm id và request body là dataupdate lấy từ component CompanyGroup
const updateGroup$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(groupActions.updateGroupRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id,dataUpdate } = action.payload; 
      return concat(
        of(startLoading({ key: 'uploadFilePayment' })),
         GroupService.Put.updatePhongbanById(id, dataUpdate).pipe(
          switchMap((response) => {
            Utils.successNotification();
            return [
             // groupActions.setGroups(response)
            ]
          }),
          catchError((error) => {
            Utils.errorNotificationPB();

            return of(
             );
          })
        ),
        of(stopLoading({ key: 'uploadFilePayment' }))
      );
    })
  );
};


export const groupEpics = [
  updateGroup$,
  getGroupsRequest$,
  editGroupsRequest$,
  newGroupsRequest$,
  addMemberToGroupRequest$,
  deleteGroupRequest$,
  moveEmployeeRequest$,
  deleteEmployeeGroupRequest$
];