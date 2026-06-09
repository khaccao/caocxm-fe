import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { TeamsResponse } from '@/services/CheckInService';
import { EmployeeResponse } from '@/services/EmployeeService';

interface TimekeepingState {
  teams: TeamsResponse[];
  checkIn?: any;
  selectedCheckInDetail?: any;
  selectedCheckInItem?: any;
  checkInPhoto?: any;
  employeeSelected?: any;
  allTimeKeepingFormonth?: any;
  timeKeepingForDay?: any;
  checkInModelData?: any;

  membersByGroupCode?: { [groupCode: string]: EmployeeResponse[] };
}

const initialState: TimekeepingState = {
  teams: [],
};

const timekeepingSlice = createSlice({
  name: 'timekeeping',
  initialState,
  reducers: {
    getTeamsOfOperatorRequest: (state, action) => {},
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    getTimeKeepingOfTeamRequest: (state, action) => {},
    setCheckInData: (state, action) => {
      state.checkIn = action.payload;
    },
    setSelectedCheckInDetail: (state, action) => {
      state.selectedCheckInDetail = action.payload;
    },
    setSelectedCheckInItem: (state, action) => {
      state.selectedCheckInItem = action.payload;
    },
    approvedHoursWorkingRequest: (state, action) => {},
    getCheckInPhoto: (state, action) => {
      state.checkInPhoto = undefined;
    },
    setCheckInPhoto: (state, action) => {
      state.checkInPhoto = action.payload;
    },
    setSlectedUser: (state, action) => {
      state.employeeSelected = action.payload;
    },
    getAllTimeOfOneEmployee: (state, action) => {},
    setAllTimeKeepingForMonth: (state, action) => {
      state.allTimeKeepingFormonth = action.payload;
    },
    approvedTimeKeepingForMonth: (state, action) => {},
    setTimeKeepingForDay: (state, action) => {
      state.timeKeepingForDay = action.payload;
    },
    getAllTimeKeepingsForDay: (state, action) => {},
    setCheckInDataModel: (state, action) => {
      state.checkInModelData = action.payload;
    },
    getMembersByGroupCodeRequest: (
      state,
      action: PayloadAction<{
        groupCode: string;
        callback?: (members?: any) => void;
      }>,
    ) => {},
    setMembersByGroupCode: (state, action: PayloadAction<{ [groupCode: string]: any }>) => {
      state.membersByGroupCode = action.payload;
    },
    addMembersByGroupCode: (state, action: PayloadAction<{ [groupCode: string]: any }>) => {
      state.membersByGroupCode = {
        ...state.membersByGroupCode,
        ...action.payload,
      };
    },
  },
});

export const timekeepingActions = timekeepingSlice.actions;
export const timekeepingReducer = timekeepingSlice.reducer;
