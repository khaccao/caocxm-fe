import { Observable } from 'rxjs';

import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();

export type PayrollTeamType = 'BCH' | 'WORKER' | 'OFFICE' | 'SERVICE' | 'OTHER';

export interface PayrollTeamResponse {
  id: number;
  guid: string;
  companyId: number;
  code: string;
  name: string;
  type: PayrollTeamType;
  parentId?: number | null;
  projectId?: number | null;
  projectName?: string | null;
  maCongNo?: string | null;
  maVuViec?: string | null;
  maKhoanMuc?: string | null;
  maHopDong?: string | null;
  tkNo?: string | null;
  tkCo?: string | null;
  tkNo1?: string | null;
  tkCo1?: string | null;
  tkNo2?: string | null;
  tkCo2?: string | null;
  ghiChu1?: string | null;
  ghiChu2?: string | null;
  ghiChu3?: string | null;
  ghiChu4?: string | null;
  ext1?: string | null;
  ext2?: string | null;
  status: number;
}

export interface PayrollTeamPayload {
  companyId: number;
  code: string;
  name: string;
  type: PayrollTeamType;
  parentId?: number | null;
  projectId?: number | null;
  maCongNo?: string;
  maVuViec?: string;
  maKhoanMuc?: string;
  maHopDong?: string;
  tkNo?: string;
  tkCo?: string;
  tkNo1?: string;
  tkCo1?: string;
  tkNo2?: string;
  tkCo2?: string;
  ghiChu1?: string;
  ghiChu2?: string;
  ghiChu3?: string;
  ghiChu4?: string;
  ext1?: string;
  ext2?: string;
  status: number;
}

export interface PayrollTeamEmployeeResponse {
  id: number;
  payrollTeamId: number;
  employeeId: number;
  employeeCode?: string | null;
  employeeName?: string | null;
  projectId?: number | null;
  projectName?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: number;
}

export interface PayrollTeamEmployeePayload {
  employeeId: number;
  employeeCode?: string | null;
  projectId?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

class PayrollTeamController {
  public Get = {
    getTeams: (
      companyId: number,
      options?: RequestOptions,
    ): Observable<PayrollTeamResponse[]> =>
      HttpClient.get(`${apiUrl}/api/PayrollTeam`, {
        ...options,
        search: {
          ...options?.search,
          companyId,
        },
      }),

    getEmployees: (
      payrollTeamId: number,
      options?: RequestOptions,
    ): Observable<PayrollTeamEmployeeResponse[]> =>
      HttpClient.get(`${apiUrl}/api/PayrollTeam/${payrollTeamId}/employees`, options),
  };

  public Post = {
    createTeam: (input: PayrollTeamPayload, options?: RequestOptions): Observable<PayrollTeamResponse> =>
      HttpClient.post(`${apiUrl}/api/PayrollTeam`, input, options),

    addEmployees: (
      payrollTeamId: number,
      input: PayrollTeamEmployeePayload[],
      options?: RequestOptions,
    ): Observable<PayrollTeamEmployeeResponse[]> =>
      HttpClient.post(`${apiUrl}/api/PayrollTeam/${payrollTeamId}/employees`, input, options),
  };

  public Put = {
    updateTeam: (
      payrollTeamId: number,
      input: PayrollTeamPayload,
      options?: RequestOptions,
    ): Observable<PayrollTeamResponse> =>
      HttpClient.put(`${apiUrl}/api/PayrollTeam/${payrollTeamId}`, input, options),
  };

  public Delete = {
    removeTeam: (payrollTeamId: number, options?: RequestOptions) =>
      HttpClient.delete(`${apiUrl}/api/PayrollTeam/${payrollTeamId}`, options),

    removeEmployee: (
      payrollTeamId: number,
      employeeId: number,
      projectId?: number | null,
      options?: RequestOptions,
    ) =>
      HttpClient.delete(`${apiUrl}/api/PayrollTeam/${payrollTeamId}/employees/${employeeId}`, {
        ...options,
        search: {
          ...options?.search,
          projectId: projectId ?? undefined,
        },
      }),
  };
}

export const PayrollTeamService = new PayrollTeamController();
