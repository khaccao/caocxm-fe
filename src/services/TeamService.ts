import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';

const { apiUrl } = getEnvVars();
interface Memnber {
  code: string;
  email: string;
  employeeCode: string;
  employeeId: number;
  name: string;
  note: string;
  phone: string;
  role: number;
  roleName: string;
  status: number;
}
export interface TeamResponse {
  id: number;
  companyId: number;
  projectId: number;
  name: string;
  code: string;
  status: number;
  leader_Id: number;
  shifts: number[];
  members: Memnber[];
  workdays: number; // add workday
  progress?: number; // add progress
  planeVolumn?: number; // add planeVolumn
  actualVolumn?: number; // add achievements
  isBlank?:boolean;
  tempId?: string;
}

export interface CreateTeamPayload {
  companyId: number;
  projectId: number;
  name: string;
  code: string;
  status: number;
  leader_Id: number;
}

export interface UpdateTeamPayload {
  name: string;
  code: string;
  status: number;
  leader_Id: number;
}

export interface CreateTeamMemberPayload {
  employeeId: number;
  name: string;
  code: string;
  role: number;
  roleName: string;
  status: number;
  note: string;
  teamId: number;
}

export interface RemoveTeamMemberPayload {
  employeeId: number;
  teamId: number;
}
export interface Members {
  employeeId: number;
  employeeCode: number;
  name: string;
  code: string;
  role: number;
  roleName: string;
  status: number;
  note: string;
  phone: string;
  email: string;
}

export interface TeamByUser {
  id: number;
  companyId: number;
  projectId: number;
  name: string;
  note: string;
  code: string;
  status: number;
  leader_Id: number;
  referenceFaceCKId: string;
  members: Members[]; 
  shifts: number[]; 
  phone: string;
  email: string;
  isLeader: boolean;
}
export interface HistoryReport {
  date: string;          
  teamId: number;          
  id: number;              
  subject: string;        
  categoryId: number;      
  safetyScore: string;     
  environmentScore: string;
  laborCount: string;      
  volume: string;          
  weather: string | null;  
  temperature: number;    
  note?: string; 
}
class TeamController {
  public Get = {
    getTeams: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Team/project/${projectId}`, options);
    },
    getTeamDetails: (teamId: number, options?: RequestOptions): Observable<TeamResponse> => {
      return HttpClient.get(`${apiUrl}/api/Team/${teamId}/details`, options);
    },
    getTeamByUser: (phone: string, email: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Team/getTeamByUser?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`, options);
    },
  };

  public Post = {
    createTeam: (input: CreateTeamPayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Team`, input, options);
    },
    createMember: (input: CreateTeamMemberPayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Team_Employee`, input, options);
    },
    createManyTeamMembers: (input: CreateTeamMemberPayload[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Team_Employee/many`, input, options);
    },
  };

  public Put = {
    updateTeam: (teamId: number, input: UpdateTeamPayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Team/${teamId}`, input, options);
    },
    updateTeamShift: (teamId: number, input: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Team_Shift/team/${teamId}`, input, options);
    },
    getTeamsByIds: (teamIds: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Team/getTeamsByIds`, teamIds, options);
    },
    getHistoryReport: (projectId: number, teamId?: number, startDate?: string, endDate?: string, options?: RequestOptions): Observable<HistoryReport[]> => {
      const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
      return HttpClient.put(`${apiUrl}/api/Cxm/getHistoryReport/${projectId}?teamId=-1&startDate=${formattedStartDate}&endDate=${formattedEndDate}`, options);
    },
  };

  public delete = {
    removeTeam: (teamId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/api/Team/${teamId}`, options);
    },
    removeMember: (input: RemoveTeamMemberPayload, options?: RequestOptions) => {
      const customOptions: RequestOptions = { ...options, body: input };
      return HttpClient.delete(`${apiUrl}/Team_Employee/team/${input.teamId}/employee/${input.employeeId}`, customOptions);
    },
  };
}

export const TeamService = new TeamController();
