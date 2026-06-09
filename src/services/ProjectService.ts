/* eslint-disable import/order */
import { PagingResponse } from '@/common/define';
import { CreateFolderRootProject, CreateProjectData } from '@/common/project';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl, accountingInvoiceURL } = getEnvVars();

export interface ProjectStatusListPagingResponse extends PagingResponse {
  results: ProjectStatusResponse[];
}

export interface ProjectStatusResponse {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  order: number;
  type: number;
  companyId: number;
}

export interface LableResponse {
  id: string,
  owner?: {
    name: string,
    icon: null,
    id: null,
    email: string
  },
  fileId: string,
  fileCode: string,
  name: string,
  type: string,
  jsonContent: null,
  isPublish: false,
  parentId: string,
}

export interface UpdateProjectPayload {
  name: string;
  code: string;
  startDate: string;
  address: string;
  description: string;
  avatar: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  status: number;
}

export interface ProjectMemberPagingResponse extends PagingResponse {
  results: ProjectMemberResponse[];
}

export interface ProjectMemberResponse {
  id: number;
  projectId: number;
  employeeId: number;
  employeeCode: number;
  name: string;
  code: string;
  role: number;
  roleName: string;
  status: number;
  phone: string;
  email: string;
  note: string;
  // [09/11/2024][#20629][phuong_td] thêm startTime và endTime cho ProjectMember
  startTime: string;// 2024-11-09T13:21:41.654Z,
  endTime: string;// 2024-11-09T13:21:41.654Z,
  // [10/11/2024][phuong_td] bổ xung createTime
  createTime: string;// 2024-11-09T13:21:41.654Z,
  roleReadDTOs: {
    name: string;
    companyId: number;
    type: number;
    description: string;
    status: number;
    id: number;
  }[];
  teamReadDTO: {
    id: number;
    companyId: number;
    projectId: number;
    name: string;
    note: string;
    code: string;
    status: number;
    leader_Id: number;
    referenceFaceCKId: string;
  }[];
}

export interface ProjectRolePagingResponse extends PagingResponse {
  results: ProjectRoleResponse[];
}
export interface ProjectRoleResponse {
  id: number;
  name: string;
  companyId: number;
  type: number;
  description: string;
  status: number;
}

export interface CreateProjectMemberPayload {
  employeeId: number;
  name: string;
  code: string;
  role: number;
  roleName: string;
  status: number;
  note: string;
  projectId: number;
  // [09/11/2024][#20629][phuong_td] thêm startTime và endTime cho ProjectMember
  startTime: string; // "2024-11-09T13:46:56.720Z",
  endTime: string; // "2024-11-09T13:46:56.720Z",
  // [10/11/2024][phuong_td] bổ xung createTime
  createTime: string; // "2024-11-09T13:46:56.720Z",
  roles: number[];
}

export interface UpdateProjectMember {
  employeeId: number;
  name: string;
  code: string;
  role: number;
  roleName: string;
  status: number;
  note: string;
  projectId: number;
  projectRoleIds: number[];
}

export interface UpdateLable {
  name: string,
  color: string,
  type: string,
  labelCode: string
}
export interface CreateWarehousePayload {
  ma_Kho: string;
  ten_Kho: string;
  dia_Chi: string;
  dien_Thoai: string;
  fax: string;
  ma_Nv: string;
  dien_Giai: string;
  in_Lookup: boolean;
  createDate: string;
}

export interface CreateProjectWarehousePayload {
  projectId: number;
  warehouseCode: string;
  warehouseId: number;
  type: number;
  status: number;
  note: string;
  createTime: Date;
  ma_nv: string;
}
export interface PaymentTerm {
  isUpdate: boolean;
  code: string;
  name: string;
  nguoiDaiDien: string;
  giaTriTheoHopDong: number;
  giaTriTheoHopDong_Code: string;
  giaTriUngTruoc: number;
  giaTriUngTruoc_Code: string;
  giaTriLuyKeThucHienDotNay: number;
  giaTriKeHoachThucHienDotNay_Code: string;
  giaTriThanhToanKeHoach: number;
  giaTriThanhToanKeHoach_Code: string;
  giaTriTTLanNay: number;
  giaTriTTLanNay_Code: string;
  giaTriConLai: number;
  giaTriConLai_Code: string;
  khoiLuong: number;
  projectId: number;
  paymentTermDate: string;
  paymentTerm: number;
  id: number;
}
class ProjectController {
  public Get = {
    getProjects: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Project`, options);
    },
    getProjectById: (id: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Project/${id}`, options);
    },
    getProjectsByCompanyId: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Project/company/${companyId}`, options);
    },
    getEmployeesByCompanyId: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Employee/company/${companyId}`, options);
    },
    getRolesByCompanyId: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/ProjectRole/roleofCompany/${companyId}`, options);
    },
    getProjectStatusList: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Tag`, options);
    },
    getProjectMembers: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Project_Employee/${projectId}/member`, options);
    },
    getProjectRoles: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/ProjectRole`, options);
    },
    getFolderRootId: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/getFolderRootId/${projectId}`, options);
    },
    getLabel: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Label/${id}?deep=1`, options);
    },
    getFileRoots: (rootFolderId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/fileRoots/${rootFolderId}`, options)
    },
    getProjectWarehouses: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/ProjectWarehouse/getProjectWarehouseByProjectId/${projectId}`, options);
    },
    getpaymentByProject: (projectId: number, paymentTerm?: number, startDate?: string, endDate?: string, options?: RequestOptions) => {
      const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
      return HttpClient.get(`${apiUrl}/SubContractor/getpaymentByProject/${projectId}?paymentTerm=${paymentTerm}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`, options);
    },
    getDinhMucThuongs: (projectId: number, teamId?: number, startDate?: string, endDate?: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Cxm/getDinhMucThuongs/${projectId}?teamId=${teamId}&startDate=${startDate}&endDate=${endDate}`, options);
    },
    getProjectWarehousesbyId: (wareHouseId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/ProjectWarehouse/getProjectWarehouseByWareHosueId/${wareHouseId}`, options);
    },
    // [22/05/2025][#22653][vy_tt]
    getSubContractorById: (subContractorId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/SubContractor/${subContractorId}`, options);
    }
  };
  public Post = {
    createProject: (inputValues: CreateProjectData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Project`, inputValues, options);
    },
    createManyProjectMembers: (input: CreateProjectMemberPayload[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Project_Employee/members`, input, options);
    },
    CreateFolderRootProject: (projectId: number, input: CreateFolderRootProject, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Label/createFolderRootProject?projectId=${projectId}`, input, options);
    },
    CreateLabel: (projectId: number, input: CreateFolderRootProject, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Label/${projectId}`, input, options)
    },
    createWarehouse: (input: CreateWarehousePayload[], options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreditWareHouse`, input, options);
    },
    createWarehouseProject: (projectId: number, input: CreateProjectWarehousePayload[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/ProjectWarehouse/creates/${projectId}`, input, options);
    },

    createProjectWarehouse: (input: CreateProjectWarehousePayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/ProjectWarehouse`, input, options);
    },
    copyProject: (oldProjectId: number, newProjectId: number) => {
      return HttpClient.post(`${apiUrl}/api/Cxm/copyProject/${oldProjectId}/${newProjectId}`);
    },
    // [09/11/2024][#20629][phuong_td] lấy project cho danh sách nhân viên
    getEmployeeProjects: (ids: number[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Project_Employee/getEmployeeProjects`, ids, options);
    },
    exportProposalPDF: (input: any, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/MaterialsDim/exportProposalPDF`, input, {
        responseType: 'blob',
        ...options,
      },
    );
    },
    exportInventoryReceiptPDF: (input: any, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/MaterialsDim/exportInventoryReceiptPDF`, input, {
          responseType: 'blob',
          ...options,
        },
      );
    },

  };
  public Put = {
    updateProject: (id: string, inputValues: UpdateProjectPayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Project/${id}`, inputValues, options);
    },
    updateProjectMember: (projectId: number, employeeId: number, input: UpdateProjectMember, options?: RequestOptions) => {
      const customOptions: RequestOptions = {
        ...options,
        search: { ...options?.search, employeeId },
      };
      return HttpClient.put(`${apiUrl}/Project_Employee/${projectId}`, input, customOptions);
    },
    updateLabel: (id: number, input: UpdateLable, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Label/${id}`, input, options);
    },
    // getpaymentByProject: (projectId: number, paymentTerm?: number, startDate?: string, endDate?: string, options?: RequestOptions) => {
    //   const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
    //   const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
    //   return HttpClient.put(`${apiUrl}/SubContractor/getpaymentByProject/${projectId}?paymentTerm=${paymentTerm}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`, options);
    // }
  };

  public Delete = {
    removeProjectMember: (projectId: number, employeeId: number, options?: RequestOptions) => {
      const customOptions: RequestOptions = {
        ...options,
        search: { ...options?.search, employeeId },
      };
      return HttpClient.delete(`${apiUrl}/Project_Employee/${projectId}`, customOptions);
    },
    removeProjectWarehouse: (warehouseId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/ProjectWarehouse/${warehouseId}`, options);
    },
    // [27/11/2024] Implement #20972 Gắn Api xóa dự án
    removeProject: (projectId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/api/Project/${projectId}`, options);
    }
  };
}

export const ProjectService = new ProjectController();
