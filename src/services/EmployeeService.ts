/* eslint-disable import/order */
import { Observable } from 'rxjs';

import { EmployeeSalaryStatementDTO, ePeriodCode, IEmployeeFee, PagingResponse } from '@/common/define';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl, accountingInvoiceURL, checkInUrl } = getEnvVars();

export interface EmployeesPagingResponse extends PagingResponse {
  results: EmployeeResponse[];
}

export interface IEmployeeGroup {
  id: number;
  employeeId: number;
  groupId: number;
  status: number;
}

export interface EmployeeResponse {
  id: number;
  employeesGroups: IEmployeeGroup[];
  userId: string;
  companyId: number;
  employeeCode: string;
  employIdConnect: string;
  contactDetail: ContactResponse;
  dateOfBirth: string;
  startDate: string;
  endDate: string;
  gender: string;
  firstName: string;
  middleName: string;
  lastName: string;
  homeTown: string;
  identity: string;
  maritalStatus: string;
  nationality: string;
  picture: string;
  status: number;
  mood: string;
  groupCodes?: string[]; // ['BCH', 'BCH1']
}

export interface ContactResponse {
  employeeId: number;
  addressStreet1: string;
  addressStreet2: string;
  city: string;
  country: string;
  homePhone: string;
  mobile: string;
  otherEmail: string;
  workEmail: string;
  workPhone: string;
  zipCode: string;
}

export interface CreateEmployeePayload {
  companyId: number;
  companyGuid: string;
  employeeCode: string;
  dateOfBirth: string;
  startDate: string;
  endDate: string;
  gender: string;
  firstName: string;
  middleName: string;
  lastName: string;
  homeTown: string;
  identity: string;
  maritalStatus: string;
  nationality: string;
  picture: string;
  status: number;
  mood: string;
  contactDetail: {
    addressStreet1: string;
    addressStreet2: string;
    city: string;
    country: string;
    homePhone: string;
    mobile: string;
    otherEmail: string;
    workEmail: string;
    workPhone: string;
    zipCode: string;
  };
}
export interface DanhSachUserResponse {
  del: boolean;
  id: number;
  un: string;
  pw: string | null;
  groupID: number;
  groupIDSign: number;
  isOwner: number;
  email: string;
  guid: string;
  createDate: string;
  capDuyetChi: number;
}
export interface UpdateEmployeePayload extends CreateEmployeePayload {
  id: number;
}

export interface rankData {
  projectId: number;
  companyId: number;
  rankCode: string;
  rankName: string;
  name: string;
  target: number;
  unit: string;
  weightCriteria: number;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  description: string;
  id: number;
  diem: number;
}

export interface EmployeePoint {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  kipCriteriaId: number;
  projectId: number;
  companyId: number;
  confirmBy: number;
  point: number;
  createdDate: string;
  notes: string;
}

class EmployeeController {
  public Get = {
    getRank: (companyId: number) => {
      return HttpClient.get(`${apiUrl}/KPICriteria/getRank/${companyId}`);
    },
    getRankById: (companyId: number, rankCode: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/KPICriteria/getbyRank/${companyId}?rankCode=${rankCode}`, options);
    },
    getAllEmployees: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Employee`, options);
    },
    getEmployees: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Employee/company/${companyId}`, options);
    },
    getEmployeeDetails: (employeeId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Employee/${employeeId}`, options);
    },
    getDanhSachUser: (options?: RequestOptions): Observable<DanhSachUserResponse[]> => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachUser`, options);
    },
    getFeeTableEmployee: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/FeeTableEmployee/getByCompanyId/${companyId}`, options);
    },
    getMembersToGroupCode: (groupCode: string, options?: RequestOptions): Observable<EmployeesPagingResponse> => {
      return HttpClient.get(`${apiUrl}/Group/getMembersToGroupCode`, {
        ...options,
        search: {
          ...options?.search,
          groupCode,
        },
      });
    },
  };

  public Post = {
    createEmployee: (input: CreateEmployeePayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Employee/detail`, input, options);
    },
    // [10/12/2024][#21146][phuong_td] bổ xung datetime thay vì lấy ngày hiện tại
    createFeeTableEmployee: (feeTable: IEmployeeFee[], datetime: string, options?: RequestOptions) => {
      console.log(feeTable, 'feeTable');
      return HttpClient.post(`${apiUrl}/FeeTableEmployee/creates?createTime=${datetime}`, feeTable, options);
    },
    getPerSalary: (companyId: string, periodCode: ePeriodCode, body: number[], workingDay: string, options?: RequestOptions): Observable<any> => {
      return HttpClient.post(`${checkInUrl}/api/EmployeeSalaryStatement/updatePerSalary/${companyId}?periodCode=${periodCode}&workingDay=${workingDay}`, body, options);
    }
  };

  public Put = {
    updategetByEmployeeId: (employeeId: number, dateTime: string, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/KPIEmployee/getbyEmployeeId/${employeeId}?dateTime=${dateTime}`, options);
    },
    updateEmployeeId: (companyId: number, employeeId: number, dateTime: string, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/KPIEmployee/updates/${1}/${employeeId}?dateTime=${dateTime}`, options);
    },
    updateEmployee: (employeeId: number, input: any, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Employee/${employeeId}/detail`, input, options);
    },
    updateFeeEmployee: (input: IEmployeeFee, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/FeeTableEmployee/${input.id}`, input, options);
    },
    updateFeeEmployeeByMonth: (
      companyId: number,
      datetime: string,
      feeTableMonth: IEmployeeFee,
      options?: RequestOptions,
    ) => {
      //[#updatetpcd][hoang_nm][25/11/2024] service update dữ liệu theo tháng và companyid
      return HttpClient.put(
        `${apiUrl}/FeeTableEmployee/updates/${companyId}?datetime=${datetime}`,
        feeTableMonth,
        options,
      );
    },

    //[implement #22092] Lấy dữ liệu EmployeeReport theo ngày
    getEmployeeReportEfficiencyByStartEndDate: (companyId: number, body: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/EmployeeReport/getReportsEfficiencyByStartEndDate/${companyId}`, [...body], options);
    },

    // [19/05/2025][#21983][vy_tt] lấy dữ liệu bảng lương
    getEmployeeSalaryStatement: (companyId: any, body: number[], options?: RequestOptions) => {
      return HttpClient.put(`${checkInUrl}/api/EmployeeSalaryStatement/getStatementEmployees/${companyId}`, body, options);
    },

    // [20/05/2025][#21983][vy_tt] update dữ liệu bảng lương
    updateEmployeeSalaryStatement: (body: EmployeeSalaryStatementDTO[], options?: RequestOptions) => {
      return HttpClient.put(`${checkInUrl}/api/EmployeeSalaryStatement/updates`, body, options);
    },

    //[24/05/2025][#22614][vy_tt] lấy tổng hợp lương
    getEmployeeSalaryStatementSummary: (companyId: any, body: number[], options?: RequestOptions) => {
      return HttpClient.put(`${checkInUrl}/api/EmployeeSalaryStatement/getTotalStatement/${companyId}`, body, options);
    },
    getEmployeeSalariesPays: (companyId: number, body: any[], options?: RequestOptions) => {
      return HttpClient.put(`${checkInUrl}/api/EmployeeSalaryStatement/getSalariesPays/${companyId}`, body, options);
    },
    updateEmployeeSalariesPays: (companyId: number, body: any[], options?: RequestOptions) => {
      return HttpClient.put(`${checkInUrl}/api/EmployeeSalaryStatement/updateSalariesPays/${companyId}`, body, options);
    },
  };

  public delete = {
    removeEmployee: (EmployeeId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/api/Employee/${EmployeeId}`, options);
    },
  };
}

export const EmployeeService = new EmployeeController();
