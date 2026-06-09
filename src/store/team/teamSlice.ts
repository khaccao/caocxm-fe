import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { defaultPagingParams } from '@/common/define';
import { HistoryReport, TeamByUser, TeamResponse } from '@/services/TeamService';

interface TeamState {
  teams: TeamResponse[];
  selectedTeam: any | null;
  selectedTeamDetails?: TeamResponse;
  queryParams: any;
  createUpdateTeamModalTab?: string;
  historyReport?: HistoryReport[];
  TeamByUser?:TeamByUser[];
  teamsByIds?:any;
}

const initialState: TeamState = {
  teams: [],
  selectedTeam: null,
  queryParams: defaultPagingParams,
  historyReport: [],
  TeamByUser: [],
  teamsByIds: [],
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<any | null>) => {
      state.selectedTeam = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    getTeamsRequest: (state, action) => {},
    getTeamDetailsRequest: (state, action) => {},
    setSelectedTeamDetails: (state, action: PayloadAction<TeamResponse|undefined>) => {
      state.selectedTeamDetails = action.payload;
    },
    createTeamRequest: (state, action) => {},
    updateTeamRequest: (state, action) => {},
    removeTeamRequest: (state, action) => {},
    updateTeamShiftRequest: (state, action) => {},
    createManyTeamMembersRequest: (state, action) => {},
    createMemberRequest: (state, action) => {},
    removeMemberFromTeamRequest: (state, action) => {},
    updateTeamLeadRequest: (state, action) => {},
    setCreateUpdateTeamModalTab: (state, action: PayloadAction<'team_info' | 'team_members' | 'team_shifts'>) => {
      state.createUpdateTeamModalTab = action.payload;
    },
    getHistoryReportRequest: (state, action: PayloadAction<{projectId: number, teamId?: number, startDate?: string, endDate?: string}>) => {},
    setHistoryReport: (state, action) => {
      state.historyReport = action.payload;
    },
    getTeamByUserRequest: (state, action: PayloadAction<{ phone:string; email:string ;}>) => {},
    setTeamByUser: (state, action) => {
      state.TeamByUser = action.payload;
    },
    getTeamsByIdsRequest: (state, action: PayloadAction<{teamIds: number[]}>) => {},
    setTeamsByIds: (state, action) => {
      state.teamsByIds = action.payload;
    },
  },
});

export const teamActions = teamSlice.actions;
export const teamReducer = teamSlice.reducer;
