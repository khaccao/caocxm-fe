import { catchError, concat, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs';

import { teamActions } from './teamSlice';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { RootEpic } from '../types';
import {
  AddMemberToTeamModalName,
  CreateUpdateTeamModalName,
  GettingTeamDetails,
  GettingTeams,
  RemovingMemberFromTeam,
  RemovingTeam,
  SavingTeam,
  SavingTeamMembers,
} from '@/common/define';
import { TeamService } from '@/services/TeamService';
import Utils from '@/utils';

const getTeamsRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(teamActions.getTeamsRequest.match),
    switchMap(action => {
      const { projectId, queryParams } = action.payload;
      return concat(
        [startLoading({ key: GettingTeams })],
        TeamService.Get.getTeams(projectId, { search: queryParams }).pipe(
          mergeMap(teams => {
            return [teamActions.setQueryParams(queryParams), teamActions.setTeams(teams)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [teamActions.setTeams(undefined)];
          }),
        ),
        [stopLoading({ key: GettingTeams })],
      );
    }),
  );
};

const createTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.createTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, team } = action.payload;
      const search = state.team.queryParams || {};
      return concat(
        [startLoading({ key: SavingTeam })],
        TeamService.Post.createTeam(team).pipe(
          mergeMap(createdTeam => {
            return TeamService.Get.getTeams(projectId, { search }).pipe(
              mergeMap(teams => {
                Utils.successNotification();
                return [
                  teamActions.setTeams(teams),
                  teamActions.setSelectedTeam(createdTeam),
                  teamActions.setCreateUpdateTeamModalTab('team_members'),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingTeam })],
      );
    }),
  );
};

const updateTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.updateTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, teamId, team } = action.payload;
      const search = state.team.queryParams || {};
      return concat(
        [startLoading({ key: SavingTeam })],
        TeamService.Put.updateTeam(teamId, team).pipe(
          mergeMap(() => {
            return TeamService.Get.getTeams(projectId, { search }).pipe(
              mergeMap(teams => {
                Utils.successNotification();
                const selectedTeam = teams?.find((x: any) => x.id === teamId);
                return [
                  teamActions.setTeams(teams),
                  teamActions.setSelectedTeam(selectedTeam),
                  teamActions.setCreateUpdateTeamModalTab('team_members'),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingTeam })],
      );
    }),
  );
};

const removeTeamRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.removeTeamRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, teamId } = action.payload;
      const search = state.team.queryParams || {};
      return concat(
        [startLoading({ key: RemovingTeam })],
        TeamService.delete.removeTeam(teamId).pipe(
          mergeMap(() => {
            return TeamService.Get.getTeams(projectId, { search: { ...search, page: 1 } }).pipe(
              mergeMap(teams => {
                Utils.successNotification('Removed successfully');
                return [
                  teamActions.setTeams(teams),
                  teamActions.setQueryParams({ ...search, page: 1 }),
                  hideModal({ key: CreateUpdateTeamModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingTeam })],
      );
    }),
  );
};

const getTeamDetailsRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(teamActions.getTeamDetailsRequest.match),
    switchMap(action => {
      const { teamId } = action.payload;
      return concat(
        [startLoading({ key: GettingTeamDetails })],
        TeamService.Get.getTeamDetails(teamId).pipe(
          map(team => {
            return teamActions.setSelectedTeamDetails(team);
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [teamActions.setSelectedTeamDetails(undefined)];
          }),
        ),
        [stopLoading({ key: GettingTeamDetails })],
      );
    }),
  );
};

const updateTeamShiftRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.updateTeamShiftRequest.match),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const { teamId, shifts } = action.payload;
      return concat(
        [startLoading({ key: SavingTeam })],
        TeamService.Put.updateTeamShift(teamId, shifts).pipe(
          mergeMap(() => {
            return TeamService.Get.getTeamDetails(teamId).pipe(
              mergeMap(team => {
                Utils.successNotification();
                return [
                  teamActions.setSelectedTeam(undefined),
                  teamActions.setSelectedTeamDetails(undefined),
                  teamActions.setCreateUpdateTeamModalTab('team_info'),
                  hideModal({ key: CreateUpdateTeamModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [teamActions.setSelectedTeamDetails(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingTeam })],
      );
    }),
  );
};

const createManyTeamMembersRequest$: RootEpic = actions$ => {
  return actions$.pipe(
    filter(teamActions.createManyTeamMembersRequest.match),
    switchMap(action => {
      const { teamId, employeeList } = action.payload;
      return concat(
        [startLoading({ key: SavingTeamMembers })],
        TeamService.Post.createManyTeamMembers(employeeList).pipe(
          switchMap(() => {
            return TeamService.Get.getTeamDetails(teamId).pipe(
              mergeMap(team => {
                Utils.successNotification();
                return [teamActions.setSelectedTeamDetails(team), hideModal({ key: AddMemberToTeamModalName })];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [teamActions.setSelectedTeamDetails(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingTeamMembers })],
      );
    }),
  );
};

const removeMemberFromTeamRequest$: RootEpic = actions$ => {
  return actions$.pipe(
    filter(teamActions.removeMemberFromTeamRequest.match),
    switchMap(action => {
      const { teamId, member } = action.payload;
      return concat(
        [startLoading({ key: RemovingMemberFromTeam })],
        TeamService.delete.removeMember(member).pipe(
          switchMap(() => {
            return TeamService.Get.getTeamDetails(teamId).pipe(
              mergeMap(team => {
                Utils.successNotification('Removed successfully');
                return [teamActions.setSelectedTeamDetails(team)];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [teamActions.setSelectedTeamDetails(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingMemberFromTeam })],
      );
    }),
  );
};

const updateTeamLeadRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.updateTeamLeadRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, teamId, team } = action.payload;
      const search = state.team.queryParams || {};
      return concat(
        [startLoading({ key: SavingTeam })],
        TeamService.Put.updateTeam(teamId, team).pipe(
          mergeMap(() => {
            return TeamService.Get.getTeams(projectId, { search }).pipe(
              mergeMap(teams => {
                const selectedTeam = teams?.find((x: any) => x.id === teamId);
                Utils.successNotification();
                return [teamActions.setTeams(teams), teamActions.setSelectedTeam(selectedTeam)];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingTeam })],
      );
    }),
  );
};
 //[20503] [nam_do] Gắn API menu nhật ký thi công và ATLD & VSMT
const getHistoryReport$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.getHistoryReportRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, teamId,startDate,endDate } = action.payload;
      return concat(
        [startLoading({ key: 'getHistoryReport' })],
        TeamService.Put.getHistoryReport(projectId, teamId,startDate,endDate).pipe(
          mergeMap(repon => {
            return [teamActions.setHistoryReport(repon)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getHistoryReport' })],
      );
    }),
  );
};
const getTeamByUser$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.getTeamByUserRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { phone, email } = action.payload;
      return concat(
        [startLoading({ key: 'getTeamByUser' })],
        TeamService.Get.getTeamByUser(phone, email).pipe(
          mergeMap(repon => {
            return [teamActions.setTeamByUser(repon)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getTeamByUser' })],
      );
    }),
  );
};
const getTeamsByIds$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(teamActions.getTeamsByIdsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { teamIds } = action.payload;
      return concat(
        [startLoading({ key: 'getTeamsByIds' })],
        TeamService.Put.getTeamsByIds(teamIds).pipe(
          mergeMap(repon => {
            return [teamActions.setTeamsByIds(repon)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getTeamsByIds' })],
      );
    }),
  );
};
export const teamEpics = [
  getTeamsRequest$,
  createTeamRequest$,
  updateTeamRequest$,
  removeTeamRequest$,
  updateTeamShiftRequest$,
  getTeamDetailsRequest$,
  createManyTeamMembersRequest$,
  removeMemberFromTeamRequest$,
  updateTeamLeadRequest$,
  getHistoryReport$,
  getTeamByUser$,
  getTeamsByIds$,
];
