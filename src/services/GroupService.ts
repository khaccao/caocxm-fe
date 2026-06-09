import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';

const { apiUrl } = getEnvVars();

export interface GroupDTO
    {
        id?: number,
        employees?: any[],
        companyId: number,
        parentId: number | null,
        name: string,
        managerId?: number,
        code?: string,
        type?: number,
        status?: number
      }
export interface GroupUpdate {
  companyId: number;
  parentId: number;
  name: string;
  managerId: number;
  code: string;
  type: number;
  status: number;
}

class GroupController {
  public Get = {
    getGroup: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Group/company/${companyId}`, options);
    },
  };
  public Post = {
    addNewGroup: (inputValues: GroupDTO, options?: RequestOptions) => {
      console.log(inputValues, 'inputValues');
      return HttpClient.post(`${apiUrl}/Group`, inputValues, options);
    },
  };
  public Put = {
    moveEmployee: (employeeId: number, groupId: number, options?: RequestOptions) => {
      return HttpClient.put(
        `${apiUrl}/EmployeesGroup?id=${employeeId}`,
        { employeeId: employeeId, groupId: groupId, status: 0 },
        options,
      );
    },
    editGroup: (inputValues: GroupDTO, id: any, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Group/${id}`, inputValues, options);
    },
    addMemberToGroup: (groupId: any, employeeIds: number, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Group/addMemberToGroup/${groupId}`, employeeIds, options);
    },
    updateEmployeeToGroup: (groupId: number, employeeId: number, body: any, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/EmployeesGroup/updateEmployeeToGroup/${groupId}/${employeeId}`, body, options);
    },

    //[#21002][hoang_nm][29/11/2024] Thêm service update phòng ban theo id
    updatePhongbanById: (id: number, dataUpdate: GroupUpdate, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Group/${id}`, dataUpdate, options);
    },
  };
  public Delete = {
    deleteGroup: (groupId: number, options?: RequestOptions) => {
      console.log(groupId);
      return HttpClient.delete(`${apiUrl}/Group/${groupId}`, options);
    },
    deleteEmployeeGroup: (
      { employeeId, parentId }: { employeeId: number; parentId: number },
      options?: RequestOptions,
    ) => {
      console.log(employeeId, parentId);
      return HttpClient.delete(`${apiUrl}/EmployeesGroup/deleteEmployGroup/${employeeId}/${parentId}`, options);
    },
  };
}

export const GroupService = new GroupController();