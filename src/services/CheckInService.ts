/* eslint-disable import/order */
import dayjs from 'dayjs';

import { getEnvVars } from "@/environment";
import HttpClient from "./HttpClient";
import { RequestOptions } from "./types";

const { checkInUrl } = getEnvVars();

export interface ShiftResponse {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  label?: string;
}

export interface TeamsResponse {
  id: number;
  operator_Id: string;
  name: string;
  status: number;
  leader_Id: string;
  shifts: ShiftResponse[];
}

export interface CheckInPayload {
  team_id: number;
  working_day: dayjs.Dayjs;
}

export interface ApprovedHoursWorkingPayload {
  working_day: dayjs.Dayjs;
  face_Identity_Id: string;
  day_Hours: dayjs.Dayjs;
  approved_Day_Hours: dayjs.Dayjs;
  approved_Note: string;
  team_id: number;
}

export interface ApprovedTimeKeepingForMonth {
  working_day: dayjs.Dayjs;
  face_Identity_Id: string;
  day_Hours: dayjs.Dayjs;
  approved_Day_Hours: dayjs.Dayjs;
  approved_Note: string;
  team_id: number;
}

export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

export interface DataType {
  key: React.Key;
}

export interface TimeKeepingByDateProps {
  tTime: (key: string) => string;
  checkInDetail: any;
  queryParams: any;
  filterParams: any;
  onCloseDetailPanel: () => void;
  openDetailPanel: boolean;
  setOpenDetailPanel: any;
  checkIn: any;
  selectedMonthKeeping: number;
  option?: any;
  term: string;
  saveDatatableTime: boolean;
  setSaveDataTableTime: any;
}

export interface CheckInMealPayload {
  working_Day: dayjs.Dayjs,
  mealList: {
    face_Identity_Id: string;
    information: string;
  }[]
}
class FaceCheckController {
  public Get = {
    fetchTeamsOfOperator: (operatorId: number, options?: RequestOptions) => {
      return HttpClient.get(`${checkInUrl}/api/checkin/operator/${operatorId}/teams`, options);
    },
    fetchTimeKeepingOfTeam: (params: CheckInPayload, options?: RequestOptions) => {
      const { team_id, working_day } = params;
      const wkd = working_day?.format('YYYY-MM-DD');
      return HttpClient.get(`${checkInUrl}/api/checkin/team/${team_id}?working_day=${wkd}`, options);
    },
    fetchTimeKeepingOfTeamV2: (params: CheckInPayload, options?: RequestOptions) => {
      const { team_id, working_day } = params;
      const wkd = working_day.format('YYYY-MM-DD');
      return HttpClient.get(`${checkInUrl}/api/checkin/v2/team/${team_id}?working_day=${wkd}`, options);
    },
    exportExcel: (params: any, options?: RequestOptions) => {
      const { companyId, monthNumber } = params;
      return HttpClient.get(`${checkInUrl}/api/CheckIn/company/${companyId}/report/month/${monthNumber}`, options);
    },
    fetchCheckInPhoto: (checkInId: number, options?: RequestOptions) => {
      const customOptions: RequestOptions = {
        ...options,
        responseType: 'blob',
      }
      return HttpClient.get(`${checkInUrl}/api/checkin/checkin/${checkInId}/image`, customOptions);
    },
    getAllTimeKeepings: (face_identity_id : number,month: number, options?: RequestOptions) => {
        return HttpClient.get(`${checkInUrl}/api/checkin/face/${face_identity_id}/report/month/${month}`, options);
    },
    getAllTimeKeepingsForDay: (team_id : number,working_day: any , options?: RequestOptions) => {
      // const day = working_day.format('YYYY-MM-DD');
      return HttpClient.get(`${checkInUrl}/api/CheckIn/team/${team_id}/report/daily?workingDay=${working_day}`, options);
  },
  updateSalaryAdvance:(companyId: number, startDate: string, endDate: string) => {
    return HttpClient.get(
      `${checkInUrl}/api/CheckIn/attendance/company/external/${companyId}/report/range?FromWorkingDay=${startDate}&ToWorkingDay=${endDate}
      `);
  }
  };

  public Post = {
    approvedHoursWorking: (input: ApprovedHoursWorkingPayload, options?: RequestOptions) => {
      const { working_day, day_Hours, approved_Day_Hours, approved_Note, face_Identity_Id, team_id } = input;
      const data = {
        face_Identity_Id,
        working_Day: working_day.format('YYYY-MM-DD'),
        day_Hours: day_Hours.format("HH:mm:ss"),
        approved_Day_Hours: approved_Day_Hours.format("HH:mm:ss"),
        approved_Note,
        team_id,
      };
      return HttpClient.post(`${checkInUrl}/api/checkin/attendance`, data, options);
    },
    checkInMeal: (input: CheckInMealPayload, options?: RequestOptions) => {
      const data = {
        working_Day: input.working_Day.format("YYYY-MM-DD"),
        mealList: input.mealList,
      };
      return HttpClient.post(`${checkInUrl}/api/checkin/meals`, data, options);
    },
    approvedTimeKeepingForMonth: (input:ApprovedTimeKeepingForMonth , option?: RequestOptions ) => {
      return HttpClient.post(`${checkInUrl}/api/CheckIn/attendance/month`, input, option);
    },
  };
}

export const FaceCheckService = new FaceCheckController();