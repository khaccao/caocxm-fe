import { catchError, concat, filter, map, switchMap, withLatestFrom, mergeMap, of, finalize } from 'rxjs';

import { timekeepingActions } from './timekeepingSlice';
import { startLoading, stopLoading } from '../loading';
import { RootEpic } from '../types';
import { FaceCheckService } from '@/services/CheckInService';
import { EmployeeService } from '@/services/EmployeeService';
import { RequestOptions } from '@/services/types';
import Utils from '@/utils';

const getTeamsOfOperatorRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.getTeamsOfOperatorRequest.match),
    switchMap(action => {
      const { operatorId, accessToken } = action.payload;
      const options: RequestOptions = {};
      if (accessToken) {
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return concat(
        [startLoading({ key: 'getTeams' })],
        FaceCheckService.Get.fetchTeamsOfOperator(operatorId, options).pipe(
          map(teams => timekeepingActions.setTeams(teams)),
          catchError(error => {
            Utils.errorHandling(error);
            return [timekeepingActions.setCheckInData(undefined), timekeepingActions.setTeams([])];
          }),
        ),
        [stopLoading({ key: 'getTeams' })],
      );
    }),
  );
};

const getTimeKeepingOfTeamRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.getTimeKeepingOfTeamRequest.match),
    switchMap(action => {
      const { team_id, working_day, accessToken } = action.payload;
      const options: RequestOptions = {};
      if (accessToken) {
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return concat(
        [startLoading({ key: 'getTimeKeepingOfTeamRequest' })],
        FaceCheckService.Get.fetchTimeKeepingOfTeamV2({ team_id, working_day }, options).pipe(
          map((res) => timekeepingActions.setCheckInData(res)),
          catchError(error => {
            Utils.errorHandling(error);
            return [timekeepingActions.setCheckInData(undefined)];
          }),
        ),
        [stopLoading({ key: 'getTimeKeepingOfTeamRequest' })],
      );
    }),
  );
};

const approvedHoursWorkingRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.approvedHoursWorkingRequest.match),
    switchMap(action => {
      const { approvedData, accessToken } = action.payload;
      // eslint-disable-next-line
      const { working_day, team_id, face_Identity_Id, meal } = approvedData;
      // const mealInfo = { meal1: meal > 0 ? 1 : 0, meal2: meal === 2 ? 1 : 0 };
      // const mealData: CheckInMealPayload = {
      //   working_Day: working_day,
      //   mealList: [{ face_Identity_Id, information: JSON.stringify(mealInfo) }],
      // };
      const options: RequestOptions = {};
      if (accessToken) {
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return concat(
        [startLoading({ key: 'approvedHoursWorkingRequest' })],
        // FaceCheckService.Post.checkInMeal(mealData, options).pipe(
        //   switchMap((mealResponse) => {
        //     // todo:
        //     console.log('Lưu cơm thành công: ', mealResponse);
        //     return [];
        //   }),
        //   catchError(error => {
        //     console.log('Lưu cơm thất bại: ', error);
        //     return [];
        //   }),
        // ),
        FaceCheckService.Post.approvedHoursWorking(approvedData, options).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [timekeepingActions.getTimeKeepingOfTeamRequest({ team_id, working_day, accessToken })];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'approvedHoursWorkingRequest' })],
      );
    }),
  );
};

const approvedTimeKeepingForMonth$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.approvedTimeKeepingForMonth.match),
    switchMap(action => {
      const { approvedData, accessToken, month, team_id, working_day } = action.payload;
      // const { face_identity_id} = action.payload;
      const face_identity_id = approvedData && approvedData?.[0]?.face_Identity_Id;
      // eslint-disable-next-line
      const options: RequestOptions = {};
      if (accessToken) {
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return concat(
        [startLoading({ key: 'approvedTimekeepingRequest' })],
        FaceCheckService.Post.approvedTimeKeepingForMonth(approvedData, options).pipe(
          switchMap((data) => {
            Utils.successNotification();
            if (month) {
              return [timekeepingActions.getAllTimeOfOneEmployee({face_identity_id, month })];
            } else {
              return [timekeepingActions.getTimeKeepingOfTeamRequest({team_id, working_day, accessToken})];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'approvedTimekeepingRequest' })],
      );
    }),
  );
};



const getCheckInPhoto$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.getCheckInPhoto.match),
    switchMap(action => {
      const { checkInId, accessToken } = action.payload;
      const options: RequestOptions = {};
      if (accessToken) {
        options.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return concat(
        [startLoading({ key: 'getCheckInPhoto' })],
        FaceCheckService.Get.fetchCheckInPhoto(checkInId, options).pipe(
          switchMap(blob => {
            const objectUrl = URL.createObjectURL(blob);
            return [timekeepingActions.setCheckInPhoto(objectUrl)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [timekeepingActions.setCheckInPhoto(undefined)];
          }),
        ),
        [stopLoading({ key: 'getCheckInPhoto' })],
      );
    }),
  );
};

const getAllTimeKeepings$: RootEpic = action$ => {
    return action$.pipe(
      filter(timekeepingActions.getAllTimeOfOneEmployee.match),
      switchMap(action => {
          const { face_identity_id, month} = action.payload;
          return concat(
            [startLoading({key: 'getAllTimeOfOneEmployee'})],
            FaceCheckService.Get.getAllTimeKeepings(face_identity_id, month).pipe(
              switchMap(data => {
                return [timekeepingActions.setAllTimeKeepingForMonth(data)]
              }),
            catchError(error => {
              Utils.errorHandling(error);
              return [timekeepingActions.setAllTimeKeepingForMonth(undefined)];
            })
            ),
            [stopLoading({key: 'getAllTimeOfOneEmployee'})]
          )
      }),
    )
}

const getAllTimeKeepingsForDay$: RootEpic = action$ => {
  return action$.pipe(
    filter(timekeepingActions.getAllTimeKeepingsForDay.match),
    switchMap(action => {
        const { team_id, workingDay } = action.payload;
        return concat(
          [startLoading({key: 'getAllTimeKeepingsForDay'})],
          FaceCheckService.Get.getAllTimeKeepingsForDay(team_id, workingDay, {}).pipe(
            switchMap(data => {
              return [timekeepingActions.setCheckInDataModel(data)]
            }),
          catchError(error => {
            Utils.errorHandling(error);
            return [timekeepingActions.setCheckInDataModel(undefined)];
          })
          ),
          [stopLoading({key: 'getAllTimeKeepingsForDay'})]
        )
    }),
  )
}

const getMembersByGroupCodeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(timekeepingActions.getMembersByGroupCodeRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { groupCode, callback } = action.payload;
      const membersByGroupCode = state.timekeeping.membersByGroupCode || {};
      if (membersByGroupCode[groupCode]) {
        callback && callback(membersByGroupCode[groupCode]);
        return of();
      }

      let results: any
      return concat(
        EmployeeService.Get.getMembersToGroupCode(groupCode, { search: { paging: false }}).pipe(
          switchMap((res) => {
            if (!res) return of();

            results = res?.results
            return of(
              timekeepingActions.addMembersByGroupCode({
                [groupCode]: results,
              })
            );
          }),
          catchError((error) => {
            Utils.errorHandling(error);
            return of();
          }),
          finalize(() => {
            if (callback) {
              callback(results)
            }
          })
        )
      );
    })
  );
};
export const timekeepingEpics = [
  getTeamsOfOperatorRequest$,
  getTimeKeepingOfTeamRequest$,
  approvedHoursWorkingRequest$,
  getCheckInPhoto$,
  getAllTimeKeepings$,
  approvedTimeKeepingForMonth$,
  getAllTimeKeepingsForDay$,
  getMembersByGroupCodeRequest$
];
