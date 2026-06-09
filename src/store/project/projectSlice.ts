import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { IDinhMucThuong, ProjectEmployeeDTO, ProjectInformationValue, SubContractorDTO, defaultPagingParams } from '@/common/define';
import {
  CreateProjectData,
  EmployeesByCompanyId,
  PreCreateProjectData,
  ProjectEmployeeWithRoles,
  ProjectResponse,
  RolesByCompanyId,
} from '@/common/project';
import {
  CreateProjectWarehousePayload,
  CreateWarehousePayload,
  PaymentTerm,
  ProjectMemberPagingResponse,
  ProjectMemberResponse,
  ProjectRolePagingResponse,
  ProjectStatusListPagingResponse,
} from '@/services/ProjectService';

interface ProjectState {
  projectList: ProjectResponse[];
  projectMemberList: ProjectEmployeeWithRoles[] | [];
  projectMembers?: ProjectMemberPagingResponse;
  selectedProject?: ProjectResponse;
  createProjectCurrentStep: number;
  createProjectInformationValue: ProjectInformationValue | null;
  projectAvatar: string;
  projects: any[] | [];
  projectById: any | null;
  projectByIds: any | null;
  projectsByCompanyId: ProjectResponse[] | [];
  selectedCompanyProject: ProjectResponse | null;
  employeesByCompanyId: EmployeesByCompanyId[] | [];
  rolesByCompanyId: RolesByCompanyId[] | [];
  createProjectData: CreateProjectData | null;
  createProjectResponse: any | null;
  projectStatus?: ProjectStatusListPagingResponse;
  queryParams: any;
  projectRoles?: ProjectRolePagingResponse;
  selectedMember?: ProjectMemberResponse;
  listLableChildren?: any[];
  listDataFileRoots: any;
  listDataFileRootsOutProject?: any;
  isCreated?: boolean;

  listFileRootsEdit?: any[];
  createdWarehouses: CreateWarehousePayload[];
  createdProjectWarehouses: CreateProjectWarehousePayload | {};
  projectwarehouseResponse?: CreateProjectWarehousePayload[];
  coppyProject?: any;
  DinhMucThuongs?: IDinhMucThuong[];
  paymentByProject?: PaymentTerm[];
  EmployeeProjects?: ProjectEmployeeDTO[];
  SubContractor?: SubContractorDTO[];
}

const initialState: ProjectState = {
  projectList: [],
  projectMemberList: [],
  createProjectCurrentStep: 0,
  createProjectInformationValue: null,
  projectAvatar: '',
  projects: [],
  projectById: null,
  projectByIds: {},
  projectsByCompanyId: [],
  selectedCompanyProject: null,
  employeesByCompanyId: [],
  rolesByCompanyId: [],
  createProjectData: null,
  createProjectResponse: null,
  queryParams: defaultPagingParams,
  listDataFileRoots: [],
  createdWarehouses: [],
  createdProjectWarehouses: {},
  projectwarehouseResponse: [],
  coppyProject: null,
  paymentByProject: [],
  SubContractor: [],
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    getWarehousesRequest: (state, action) => {},
    setprojectwarehouse: (state, action: PayloadAction<CreateProjectWarehousePayload[]>) => {
      state.projectwarehouseResponse = action.payload;
    },
    setProjectList: (state, action) => {
      state.projectList = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<ProjectResponse | undefined>) => {
      state.selectedProject = action.payload;
    },
    setCreateProjectCurrentStep: (state, action: PayloadAction<number>) => {
      state.createProjectCurrentStep = action.payload;
    },
    setCreateProjectInformationValue: (state, action: PayloadAction<ProjectInformationValue | null>) => {
      state.createProjectInformationValue = action.payload;
    },
    setProjectAvatar: (state, action: PayloadAction<string>) => {
      state.projectAvatar = action.payload;
    },
    setProjectMemberList: (state, action: PayloadAction<ProjectEmployeeWithRoles[] | []>) => {
      state.projectMemberList = action.payload;
    },
    setCreateProjectData: (state, action: PayloadAction<CreateProjectData | null>) => {
      state.createProjectData = action.payload;
    },
    getProjectsRequest: (_state, _action) => {},
    setProjectsResponse: (state, action) => {
      state.projects = action.payload;
    },
    getProjectByIdRequest: (_state, _action: PayloadAction<string>) => {},
    setProjectByIdResponse: (state, action) => {
      state.projectById = action.payload;
    },
    getProjectsByCompanyIdRequest: (_state, _action: PayloadAction<number>) => {},
    setProjectsByCompanyIdResponse: (state, action) => {
      state.projectsByCompanyId = action.payload;
    },
    setSelectedCompanyProject: (state, action: PayloadAction<ProjectResponse | null>) => {
      state.selectedCompanyProject = action.payload;
    },
    getEmployeesByCompanyIdRequest: (_state, _action: PayloadAction<number>) => {},
    setEmployeesByCompanyIdResponse: (state, action) => {
      state.employeesByCompanyId = action.payload;
    },
    getRolesByCompanyIdRequest: (_state, _action: PayloadAction<number>) => {},
    setRolesByCompanyIdResponse: (state, action) => {
      state.rolesByCompanyId = action.payload;
      console.log('rolesByCompanyId', action.payload);
    },
    createProjectRequest: (_state, _action: PayloadAction<PreCreateProjectData>) => {},
    setCreateProjectResponse: (state, action) => {
      state.createProjectResponse = action.payload;
    },
    updateProjectRequest: (state, action) => {},
    setProjectStatuses: (state, action) => {
      state.projectStatus = action.payload;
    },
    getStatusListRequest: (state, action) => {},
    getProjectMembersRequest: (state, action) => {},
    setProjectMembers: (state, action) => {
      state.projectMembers = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    getProjectRolesRequest: (state, action) => {},
    setProjectRoles: (state, action) => {
      state.projectRoles = action.payload;
    },
    createManyProjectMemberRequest: (state, action) => {},
    removeProjectMemberRequest: (state, action) => {},
    removeProjectWarehouseRequest: (state, action) => {},
    setSelectedMember: (state, action) => {
      state.selectedMember = action.payload;
    },
    updateProjectMemberRequest: (state, action) => {},
    createFolderRootProject: (state, action) => {},
    createFolderRootOutProject: (state, action) => {},
    setCreateFolderRootProject: (state, action) => {
      // state.CreateFolderRootProject =
    },
    folderisCreated: (state, action) => {
      state.isCreated = action.payload;
    },
    getFolderRootId: (state, action) => {},
    getFolderRootIdOutProject: (state, action) => {},
    CreateLabelsExtra: (state, action) => {},
    CreateLabel: (state, action) => {}, //tạo 1 label {}
    CreateLabels: (state, action) => {}, // tạo nhiều label cùng lúc []
    getLabel: (state, action) => {},
    setLabel: (state, action) => {
      state.listLableChildren = action.payload;
    },
    // get List file Root Ngoài project
    getFileRoots: (state, action) => {},
    setListFileRoots: (state, action) => {
      state.listDataFileRoots = action.payload;
    },
    // get list File root trong project
    getFileRootsOutProject: (state, action) => {},
    setListFileRootsOutproject: (state, action) => {
      state.listDataFileRootsOutProject = action.payload;
    },
    // 
    setListFileRootsEdit: (state, action) => {
      state.listFileRootsEdit = action.payload;
    },
    updateLabel: (state, action) => {},
    createWarehousesRequest: (
      state,
      action: PayloadAction<{ projectId: number; data: CreateProjectWarehousePayload[] }>,
    ) => {},
    createProjectWarehouseRequest: (state, action: PayloadAction<CreateProjectWarehousePayload>) => {},
    setProjectWarehouseResponse: (state, action) => {
      state.createdProjectWarehouses = action.payload;
    },
    copyProject: (state, action: PayloadAction<{ oldProjectId: number; newProjectId: number }>) => {},
    setCoppyproject: (state, action) => {
      state.coppyProject = action.payload;
    },
    getpaymentByProject: (
      state,
      action: PayloadAction<{ projectId: number; paymentTerm?: number; startDate?: string; endDate?: string }>,
    ) => {},
    getDinhMucThuongsRequest: (
      state,
      action: PayloadAction<{ projectId: number; teamId?: number; startDate?: string; endDate?: string }>,
    ) => {},
    setDinhMucThuongs: (state, action) => {
      state.DinhMucThuongs = action.payload;
    },
    setPaymentByProject: (state, action) => {
      state.paymentByProject = action.payload;
    },
    // [09/11/2024][#20629][phuong_td] danh sách dự án theo nhân công
    getEmployeeProjectsRequest: (
      state,
      action: PayloadAction<{
        ids: number[];
        params: {
          startTime: string;
          endTime: string;
        };
      }>,
    ) => {},
    setEmployeeProjects: (state, action) => {
      state.EmployeeProjects = action.payload;
    },
    // [27/11/2024] Implement #20972 Gắn Api xóa dự án
    removeProject: (state, action) => {},

    // [22/05/2025][#22653][vy_tt] thông tin nhà thầu phụ
    getSubContractorRequest: (state, action) => {},
    setSubContractor: (state, action) => {
      state.SubContractor = action.payload;
    },
  },
});

export const projectActions = projectSlice.actions;
export const projectReducer = projectSlice.reducer;
