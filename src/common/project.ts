import { CreateProjectWarehousePayload } from '@/services/ProjectService';

export interface GetProjectByIdPayload {
  id: string;
}
export interface GetEmployeesByCompanyIdPayLoad {
  companyId: number;
}
export interface GetRolesByCompanyIdPayload {
  companyId: number;
}
export interface CreateProjectData {
  companyId: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  address: string;
  description: string;
  avatar: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  project_Employees: ProjectEmployeeWithRoles[];
  status: number;
}
export interface PreCreateProjectData {
  data: CreateProjectData;
  warehouses: CreateProjectWarehousePayload[];
}

export interface CreateFolderRootProject {
  name: string;
  color?: string;
  type: string;
  labelCode?: string;
  children?: {
    idChildren: string;
    type: string;
  }[];
  parentId?: string;
}

export interface UpdateProjectData {
  id: string;
  companyId: number;
  name: string;
  code: string;
  startDate: string;
  address: string;
  description: string;
  avatar: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  projectEmployee_Roles: ProjectEmployeeWithRoles[];
  status: number;
}

export interface EmployeeContactDetail {
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
export interface ProjectsByCompanyId {
  id: number;
  parentId?: number;
  projectGuid: string;
  companyId: number;
  name: string;
  startDate: string;
  address: string;
  description: string;
  avatar: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  managerName: string;
  managerId: number;
}
export interface ProjectResponse {
  id: number;
  code: string;
  parentId?: number;
  projectGuid: string;
  companyId: number;
  name: string;
  startDate: string;
  endDate: string;
  address: string;
  description: string;
  avatar: string;
  managerName: string;
  managerId: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  status: number;
  maKho: string[];
}

export interface EmployeesByCompanyId {
  id: number;
  userId: string;
  companyId: number;
  employeeCode: string;
  employIdConnect?: string;
  contactDetail: EmployeeContactDetail;
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
  Firstname?: string;
  Lastname?: string;
}

export interface EmployeesByCompanyIdResponse {
  results: EmployeesByCompanyId[];
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
}
export interface RolesByCompanyId {
  name: string;
  companyId: number;
  type: number;
  description: string;
  status: number;
  id: number;
}

export interface RolesByCompanyIdResponse {
  results: RolesByCompanyId[];
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
}

// [09/11/2024][#20629][phuong_td] bổ xung startTime và endTime cho ProjectEmployee
export interface ProjectEmployeeWithRoles {
  employeeId: number;
  name: string;
  code: string;
  role: number;
  status: number;
  startTime: string; // "2024-11-09T13:46:56.720Z",
  endTime: string; // "2024-11-09T13:46:56.720Z",
  // [10/11/2024][phuong_td] bổ xung createTime
  createTime: string; // "2024-11-09T13:46:56.720Z",
  roles: number[];
}
