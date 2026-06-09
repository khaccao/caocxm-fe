/* eslint-disable import/order */
import {
  AttributeDimDTO,
  AttributesUpdateDTO,
  eCategoryNumber,
  eCategoryString,
  eNatureOfTheJob,
  IssueMaterialsQuota,
  LaborDimDTO,
  MachineryDimDTO,
  MaterialsDimDTO,
  PagingResponse,
  RelationshipDTO,
  RelationshipUpdateDTO,
  sMilestone,
  TargetDTO,
  TargetTrackerDTO,
  Tracker,
  UploadFile,
} from '@/common/define';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { TeamResponse } from './TeamService';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();
export interface IssueTagListPagingResponse extends PagingResponse {
  results: IssueTagResponse[];
}

export interface IssueTagResponse {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  order: number;
  type: number;
  companyId: number;
}
export interface ContactDTO {
  id: number;
  issueId: number;
  fullname: string;
  phone: string;
  email: string;
  userId: string;
  employeeId: number;
  employeeCode: number;
  status: number;
  issueCreateBys: string[];
  issueAssigneds?: string[];
  issueContacts?: IssueContactDTO[];
  issue?: string;
}
export interface IssueContactDTO {
  issueId: number;
  contactId: number;
  titleType: number;
  contact: ContactDTO;
  issue: string;
}
export interface IssuesPagingResponse extends PagingResponse {
  results: IssuesResponse[];
}
export interface MaterialsPagingResponse extends PagingResponse {
  results: MaterialsDimDTO[];
}
export interface MachineriesPagingResponse extends PagingResponse {
  results: MachineryDimDTO[];
}
export interface IssuesResponse {
  requiredQuantity?: any;
  workdays?: any;
  id: number;
  parentId: number;
  projectId: number;
  categoryId: number;
  createdOn: string;
  subject: string;
  description: string;
  supervisor: {
    id: number;
    fullname: string;
    phone: string;
  };
  actualStartDate: string;
  actualEndDate: string;
  issueTargets: IssueTargetDTO[];
  workPackageId: number;
  areaId: number;
  trackerId: number;
  priority: number;
  stars: number;
  status: string;
  type: number;
  issueOtherQuotaDTOs?: issueOtherResourceQuotas[];
  issueLaborQuotas?: issueLaborQuotas[];
  issueMachineQuotas?: issueMachineQuotas[];
  issueMaterialsQuotas?: issueMaterialsQuotas[];
  estimatedTime: number;
  progress: number;
  startDate: string;
  dueDate: string;
  startTime: string;
  attachmentLinks: [
    {
      id: number;
      issueId: number;
      issue: {
        id: number;
        parentId: number;
        projectId: number;
        categoryId: number;
        createdOn: string;
        subject: string;
        description: string;
        notes: string;
        createdById: number;
        createdBy: {
          id: number;
          issueId: number;
          issue: string;
          fullname: string;
          phone: string;
          userId: string;
        };
        supervisorId: number;
        supervisor: {
          id: number;
          issueId: number;
          issue: string;
          fullname: string;
          phone: string;
          userId: string;
        };
        priority: number;
        stars: number;
        status: number;
        type: number;
        estimatedTime: number;
        startDate: string;
        dueDate: string;
        startTime: string;
        assignedTo: [
          {
            id: number;
            issueId: number;
            issue: string;
            fullname: string;
            phone: string;
            userId: string;
          },
        ];
        attachmentLinks: string[];
        progress: number;
        issue_CheckItems: [
          {
            id: number;
            status: number;
            createdTime: string;
            index: number;
            subject: string;
            estimatedTime: number;
            issueId: number;
            issue: string;
          },
        ];
        issue_OtherResourceQuotas: [
          {
            requiredQuantity: string;
            otherResourcesDimId: number;
            otherResource: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              status: number;
              issue_OtherResourceQuotas: string[];
            };
            issuesId: number;
            issue: string;
          },
        ];
        issueLaborQuotas: [
          {
            requiredHours: string;
            skillLevel: number;
            status: number;
            laborId: number;
            laborDim: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              skillSet: number;
              status: number;
              issueLaborQuotas: string[];
            };
            issuesId: number;
            issue: string;
          },
        ];
        issueMachineQuotas: [
          {
            requiredHours: string;
            status: number;
            description: string;
            machineId: number;
            machineryDim: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              skillSet: number;
              status: number;
              issueMachineQuotas: string[];
            };
            issuesId: number;
            issue: string;
          },
        ];
        issueMaterialsQuotas: [
          {
            requiredQuantity: string;
            unitOfMeasure: string;
            status: number;
            materialId: number;
            material: {
              id: number;
              name: string;
              type: number;
              description: string;
              unitOfMeasure: number;
              status: number;
              issueMaterialsQuotas: string[];
            };
            issuesId: number;
            issue: string;
          },
        ];
      };
      fileName: string;
      url: string;
    },
  ];
  tagVersionId?: string;
  tagVersionName: string;
  notes: string;
  issueContacts: IssueContactDTO[];
  issueContactDTOs: ContactDTO;
  assignedTo: ContactDTO;
  createdBy: ContactDTO;
  attributes: AttributeDimDTO[];
  issueAttributes: AttributeDimDTO[];
  plannedEndDate: string;
  plannedStartDate: string;
  issue_CheckItems: CheckItemsDTO[];
  teamIds?: number[];
  EstimatedAmount?: any;
  plannActualStartDate?: string;
  plannActualEndDate?: string;
}

export interface IssueTargetDTO {
  issueId: number | null | string;
  targetId: number | null;
  planValue: string;
  actualValue: string;
  costPerValue: number;
  targetDim?: TargetDTO | null;
}

export interface TargetIssue {
  issueId: number | null | string;
  targetId: number | null;
  planValue: string;
  actualValue: string;
  costPerValue: number;
  targetDim?: TargetDTO | null;
}

export interface CreateContactDTO {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  userId: string;
  employeeId: number;
  employeeCode: number;
  titleType: number;
}

export interface BiddingDTO {
  id: number;
  subject: string; // name
  description: string;
  startDate: string;
  dueDate: string; // enddate
  actualStartDate: string;
  actualEndDate: string;
  parentId: number;
  projectId: number;
  isCategory?: boolean;
  supervisor: {
    id: number;
    fullname: string;
    phone: string;
  };
  type: number;
  status: Status;
  progress: number;
  startTime: string;
  attachmentLinks?: [
    {
      id: number;
      issueId: number;
      issue: {
        id: number;
        parentId: number;
        projectId: number;
        categoryId: number;
        createdOn: string;
        subject: string;
        description: string;
        notes: string;
        createdById: number;
        createdBy: {
          id: number;
          issueId: number;
          issue: string;
          fullname: string;
          phone: string;
          userId: string;
        };
        supervisorId: number;
        supervisor: {
          id: number;
          issueId: number;
          issue: string;
          fullname: string;
          phone: string;
          userId: string;
        };
        priority: number;
        stars: number;
        status: number;
        type: number;
        estimatedTime: number;
        startDate: string;
        dueDate: string;
        startTime: string;
        assignedTo: ContactDTO[];
        attachmentLinks: string[];
        progress: number;
        issue_CheckItems: CheckItemsDTO[];
        issue_OtherResourceQuotas: [
          {
            requiredQuantity: string;
            otherResourcesDimId: number;
            otherResource: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              status: number;
              issue_OtherResourceQuotas: string[];
            };
            issuesId: number;
            issue: string;
          },
        ];
        issueLaborQuotas: [
          {
            requiredHours: string;
            skillLevel: number;
            status: number;
            laborId: number;
            laborDim: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              skillSet: number;
              status: number;
              issueLaborQuotas: string[];
            }[];
            issuesId: number;
            issue: string;
          },
        ][];
        issueMachineQuotas: [
          {
            requiredHours: string;
            status: number;
            description: string;
            machineId: number;
            machineryDim: {
              id: number;
              name: string;
              hourlyRate: number;
              description: string;
              skillSet: number;
              status: number;
              issueMachineQuotas: string[];
            }[];
            issuesId: number;
            issue: string;
          },
        ][];
        issueMaterialsQuotas: [
          {
            requiredQuantity: string;
            unitOfMeasure: string;
            status: number;
            materialId: number;
            material: {
              id: number;
              name: string;
              type: number;
              description: string;
              unitOfMeasure: number;
              status: number;
              issueMaterialsQuotas: string[];
            }[];
            issuesId: number;
            issue: string;
          },
        ][];
      };
      fileName: string;
      url: string;
    },
  ][];
  tagVersionId: number;
  tagVersionName: string;
  notes?: string;
  issueContacts: IssueContactDTO[];
  issueContactDTOs?: ContactDTO;
  assignedTo: ContactDTO | null;
  createdBy: ContactDTO | null;
  attributes: AttributeDimDTO[];
  plannedEndDate: string;
  plannedStartDate: string;

  children?: BiddingDTO[];
}
export interface CreateContactDTO extends IssuesResponse {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  userId: string;
  employeeId: number;
  employeeCode: number;
  titleType: number;
}
export interface CreateIssuePayload {
  parentId: number;
  projectId: number;
  categoryId: number;
  trackerId: number;
  subject: string;
  description: string;
  priority: number;
  status: number;
  type: number;
  estimatedTime: number;
  startDate: string;
  dueDate: string;
  progress: number;
  tagVersionId: number;
  tagVersionName: number;
  notes: string;
  createContacts: CreateContactDTO[];
  assignedTo: CreateContactDTO;
  stars: number;
}

export interface IssueCheckItems {
  id: number;
  status: string;
  createdTime: string;
  index: number;
  subject: string;
  estimatedTime: number;
  issueId: number;
  issue: string;
}

export interface CheckItemsDTO {
  id?: number;
  issueId: number;
  status: number;
  createdTime: string;
  index: number;
  subject: string;
  estimatedTime: number;
  issue?: string;
  teamId?: number;
}

export interface IssueTeamDTO {
  id?: number;
  issueId: number | string;
  teamId: number;
  status: number;
  laborCount?: number;
  progress?: number;
  planeVolumn?: number;
  actualVolumn?: number;
}

export interface Issue_OtherResourceQuota {
  issuesId: number;
  requiredQuantity: string;
  actulaQuantity: string;
  otherResourcesDimId: number;
}

export interface OtherResourcesDimDTO {
  name: string;
  hourlyRate: number;
  description: string;
  status: number;
  id?: number;
}

export interface Issue_OtherResourceQuotaDTO {
  issuesId: number;
  requiredQuantity: string;
  actulaQuantity: string;
  otherResourcesDimId: number;
  name: string;
}

export interface Issue_CheckItemsTeamDTO {
  issue_CheckItemId: number;
  teamId: number;
  status: number;
  id?: number;
}

export interface UpdateCheckItemsPayload {
  status: number;
  subject: string;
}

export enum Status {
  All = -1,
  Pending = 0,
  Approved = 1,
  Processing = 2,
  Done = 3,
  Stop = 4,
}

export enum codeStatus {
  Pending = '"Dang_Cho_Duyet"',
  Approved = '"Da_Duyet"',
  Processing = '"Dang_Thuc_Hien"',
  Done = '"Hoan_Thanh"',
  Stop = '"Tam_Dung"',
  ApprovedSeries = 'Da_Duyet',
}

export enum StatusLabel {
  All = 'Tất cả',
  Pending = 'Đang chờ duyệt',
  Approved = 'Đã duyệt',
  Processing = 'Đang thực hiện',
  Done = 'Hoàn thành',
  Stop = 'Tạm dừng',
}

export enum StatusColor {
  Pending = 'gray',
  Approved = 'orange',
  Processing = 'pink',
  Done = '#14aeea',
  Stop = 'red',
}

/**
 * #18038 Danh sách công việc hợp đồng, KPI đấu thầu
 */
export interface IssueContactAndKPIDTO {
  id: number;
  name: string; // subject
  parentId: number;
  subject: string; // name
  contactId: number;
  titleType: number;
  description: string;
  contact: ContactDTO;
  startDate: string;
  dueDate: string; // enddate
  actualStartDate: string;
  actualEndDate: string;
  assignedTo: ContactDTO;
  status: Status;
  supervisor: {
    id: number;
    fullname: string;
    phone: string;
  };
  attachmentLinks: any; // file đính kèm
  progress: number;
  note: string;
  tagVersionId?: number; // Giai đoạn của Issue
  nature?: number; // Tính chất công việc
  children: IssueContactAndKPIDTO[];
}

/**
 * // #17019 Các công việc trước khi thi công
 */
export interface PrepareConstructionDTO {
  id: number;
  subject: string; // name
  description: string;
  supervisor: {
    id: number;
    fullname: string;
    phone: string;
  };
  assignedTo: ContactDTO;
  parentId: number;
  tagVersionId: number; // Giai đoạn
  type: number;
  tagVersionName: string;
  priority: number;
  startDate: string;
  dueDate: string; // enddate
  status: Status;
  progress: number;
  notes: string;
  attachmentLinks?: any;
  children?: PrepareConstructionDTO[];
}

/**
 * #17012 Màn hình lập tiến độ ban đầu
 */
export interface SetupInitialProgressDTO {
  id: number;
  parentId: number; // Thuộc hạng mục
  projectId: number;
  workPackageId: number;
  areaId: number;
  categoryId: number | null;
  trackerId: number;
  dailyReview: boolean; // add Đánh giá hàng ngày
  subject: string; // name
  type: number;
  estimateWorkdays?: number; // add số công dự tính
  workdaysSaved?: number; // add số công tiết kiệm
  progress: number; // % HT
  parentProgress: number; // % HT
  startDate: string;
  attributes?: AttributeDimDTO[];
  issueOtherQuotaDTOs?: issueOtherResourceQuotas[];
  issueLaborQuotas?: issueLaborQuotas[];
  issueMachineQuotas?: issueMachineQuotas[];
  issueMaterialsQuotas?: issueMaterialsQuotas[];
  issueTargets?: IssueTargetDTO[];
  dueDate: string; // enddate
  actualStartDate: string;
  actualEndDate: string;
  expectedStartDate: string; // ngày bắt đầu dự kiến
  expectedEndDate: string; // ngày kết thúc dự kiến
  responsibleTeams: TeamResponse[]; // Tổ đội
  status: number;
  description: string;
  note?: string;
  children?: SetupInitialProgressDTO[];
  isCategory?: boolean;
  workdays: number; // add số công
  EstimatedAmount: number; // số công ước tính
  salaryDetermination: number; // add định mức lương
  plannedStartDate?: string; // ngày bắt đầu KH
  plannedEndDate?: string; // ngày kết thúc KH
}

export interface UpdateIssuePayload {
  name: string;
  description: string;
  price: number;
}

export interface WeeklyAssignmentDTO {
  id: number;
  parentId: number | null;
  projectId: number;
  workPackageId: number;
  areaId: number;
  categoryId: eCategoryNumber | eCategoryString | null;
  trackerId: number;
  tagVersionId: string | null;
  subject: string;
  assignedTo: ContactDTO | null;
  notes: string;
  description: string;
  status: string; // ct chuan bi
  responsibleTeams: TeamResponse[]; // add tổ thực hiện add workdays
  progress: number; // % HT
  unit: number | string; // add đơn vị tính
  material: string;
  deliveredQuantity: number; // add khối lượng giao
  unitPrice: number; // add đơn giá
  salaryDetermination: number; // add định mức lương
  workdays: number; // add số công
  startDate: string;
  dueDate: string; // enddate
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate: string;
  actualStartDate: string;
  attachmentLinks: any[];
  type?: eNatureOfTheJob;
  issueOtherQuotaDTOs?: issueOtherResourceQuotas[];
  issueLaborQuotas?: issueLaborQuotas[];
  issueMachineQuotas?: issueMachineQuotas[];
  issueMaterialsQuotas?: issueMaterialsQuotas[];
  issueTargets?: IssueTargetDTO[];
  attributes?: AttributeDimDTO[];
  issueAttributes?: AttributeDimDTO[]; // trường này để update data khi put
  children?: WeeklyAssignmentDTO[] | null;
  preparationWorks?: Preparation[];
  issue_CheckItems?: CheckItemsDTO[];
  teamIds?: number[];
  totalAmount?: number; // tổng cộng
  isSummery?: boolean;
  isTask?: boolean;
  isComplete?: boolean;
  isAssign?: boolean;
  isCategory?: boolean;
  level?: number;
  remainingwork?: number;
}

export interface issueOtherResourceQuotas {
  name: string;
  actulaQuantity: string; // số công thực tế
  requiredQuantity: string; // số công yêu cầu
  otherResourcesDimId: number;
  otherResource: {
    id: number;
    name: string;
    hourlyRate: number;
    description: string;
    status: number;
    issue_OtherResourceQuotas: string[];
  };
  issuesId: number;
  issue: string;
}

export interface issueLaborQuotas {
  requiredHours: string;
  skillLevel: number;
  status: number;
  laborId: number;
  laborDim: {
    id: number;
    name: string;
    hourlyRate: number;
    description: string;
    skillSet: number;
    status: number;
    issueLaborQuotas: string[];
  };
  issuesId: number;
  issue: string;
}
export interface issueMachineQuotas {
  requiredHours: string;
  status: number;
  description: string;
  machineId: number;
  machineryDim: {
    id: number;
    name: string;
    hourlyRate: number;
    description: string;
    skillSet: number;
    status: number;
    issueMachineQuotas: string[];
  };
  issuesId: number;
  issue: string;
}
export interface issueMaterialsQuotas {
  requiredQuantity: string;
  unitOfMeasure: string;
  status: number;
  materialId: number;
  material: {
    id: number;
    name: string;
    type: number;
    description: string;
    unitOfMeasure: number;
    status: number;
    issueMaterialsQuotas: string[];
  };
  issuesId: number;
  issue: string;
}
export interface Preparation {
  id: number;
  name: string;
  works?: WeeklyAssignmentDTO[];
  checkItems: CheckItemsDTO[];
}
export interface Work {
  id: number;
  subject: string;
  attachmentLinks: any[];
  status: number;
  assignedTo: ContactDTO | undefined;
}

export interface LinkImage {
  id: number;
  date: string;
  url: string;
}

export interface ListTeams {
  issueId: number;
  teamIds: number[];
}

export interface totalVoLumeData {
  issueId: number;
  totalVolumeAchieved: number;
  totalLaborCountAchieved: number;

}
class IssueController {
  public Get = {
    getTotalVolume: (projectId: number, options?: RequestOptions) => {
      //service lấy khối lượng hoàn thành
      return HttpClient.get(`${apiUrl}/EmployeeReport/getReportsByStartEndDateGroupIssue/${projectId}`, options);
    },
    // [09/11/2024][#20629][phuong_td] lấy report theo ngày
    getReportsByStartEndDate: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/EmployeeReport/getReportsByStartEndDate/${projectId}`, options);
    },
    getIssues: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Issue/project/${projectId}`, options);
    },
    getIssueByVersion: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Issue/getIssueByVersion/${projectId}`, options);
    },
    getIssueByParentId: (parentId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/api/Issue/getIssueByParentId/${parentId}`, options);
    },
    getIssueStatusList: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/issue/Tag/project/${projectId}`, options);
    },
    getIssueProgressList: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/issue/Tag/project/${projectId}`, options);
    },
    getCategory: (categoryId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/CategoryDim/${categoryId}`, options);
    },
    getCategoryByCompanyId: (companyId: number, tagVersionCode: string, options?: RequestOptions) => {
      return HttpClient.get(
        `${apiUrl}/CategoryDim/getByCompanyId/${companyId}?tagversionCode=${tagVersionCode}`,
        options,
      );
    },
    getTagByCompanyId: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/issue/Tag/company/${companyId}?type=-1`, options);
    },
    getTagByProjectId: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/issue/Tag/project/${projectId}?type=-1`, options);
    },
    getTeamIdsByIssue: (issueId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssueTeam/getTeamIdsByIssue/${issueId}`, options);
    },
    getIssueTeamById: (Id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssueTeam/${Id}`, options);
    },
    getIssueTeamsByIssueRequest: (Id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssueTeam/getTeamIssuesByIssue/${Id}`, options);
    },
    getIssueChecklistsByTeamId: (teamId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Issue_CheckItemsTeam/getChecklistIds/${teamId}`, options);
    },
    getTrackerById: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/TrackerDim/${id}`, options);
    },
    getTrackerByProject: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/TrackerDim/trackerByProject/${projectId}`, options);
    },
    getTrackerByCompany: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/TrackerDim/trackerByCompany/${companyId}`, options);
    },
    getOtherResourcesDim: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/OtherResourcesDim/${id}`, options);
    },
    getOtherResourcesDimByTracker: (trackerId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/OtherResourcesDim/resouceByTrackerId/${trackerId}`, options);
    },
    getMaterialsDim: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/MaterialsDim/${id}`, options);
    },
    getMaterialsDimByTracker: (trackerId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/MaterialsDim/materialByTrackerId/${trackerId}`, options);
    },
    getAttributeDim: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AttributeDim/${id}`, options);
    },
    getAttributeDimByTracker: (trackerId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AttributeDim/attributeByTrackerId/${trackerId}`, options);
    },
    getLaborDim: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/LaborDim/${id}`, options);
    },
    getLaborDimByTracker: (trackerId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/LaborDim/laborByTrackerId/${trackerId}`, options);
    },
    getTargetByCondition: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/TargetDim/getTargetByCondition`, options);
    },
    getTeamsIdsByCheckItemId: (checkItemId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Issue_CheckItemsTeam/getTeamsIds/${checkItemId}`, options);
    },
    getChildIssueRelationShipById: (IssueId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssuesRelationship/getIssueRelSecond/${IssueId}`, options);
    },
    getParentIssueRelationShipById: (IssueId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssuesRelationship/getIssueRel/${IssueId}`, options);
    },
    getAllChildIssueRelationShipFromId: (IssueId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/IssuesRelationship/getAllRelationshipsRecursive/${IssueId}`, options);
    },
    getFileAttachmenForIssue: (IssueId: string, option?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AttachmentLink/getFilesByIssueId/${IssueId}`, option);
    },
    getMembersToGroup: (code: string, option?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Group/getMembersToGroupCode?groupCode=${code}`, option);
    },
    getMachinerysDimByTracker: (trackerId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/MachineryDim/machineryByTrackerId/${trackerId}`, options);
    },
    //#region [19/10/2024][#20489][phuong_td] Lấy dữ liệu EmployeeReport theo Issue
    getEmployeeReportByIssue: (issueId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/EmployeeReport/getByIssueId/${issueId}`, options);
    },
    getAttachmentFile: (issueId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AdditionAttachmentLink/getByItemId/${issueId}`, options);
    },
  };

  public Post = {
    createIssue: (input: CreateIssuePayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Issue`, input, options);
    },
    createCheckItems: (input: CheckItemsDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Issue_CheckItems`, input, options);
    },
    createIssueTeam: (input: IssueTeamDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/IssueTeam`, input, options);
    },
    createIssueCheckItemsTeam: (input: Issue_CheckItemsTeamDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Issue_CheckItemsTeam`, input, options);
    },
    createOtherResourcesDim: (input: OtherResourcesDimDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/OtherResourcesDim`, input, options);
    },
    createTrackerDim: (input: Tracker, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/TrackerDim`, input, options);
    },
    createTargetTracker: (input: TargetTrackerDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/TargetTracker`, input, options);
    },
    createMaterialsDim: (input: MaterialsDimDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/MaterialsDim`, input, options);
    },
    createAttributeDim: (input: AttributeDimDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/AttributeDim`, input, options);
    },
    createLaborDim: (input: LaborDimDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/LaborDim`, input, options);
    },
    createIssueMaterialsQuota: (input: IssueMaterialsQuota, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/MaterialsDim`, input, options);
    },
    createIssue_OtherResourceQuota: (input: Issue_OtherResourceQuota, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Issue_OtherResourceQuota`, input, options);
    },
    delete_multiIssue: (listIdIssue: number[], option?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Issue/deletes`, listIdIssue);
    },
    createTargetDim: (input: TargetDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/TargetDim`, input, options);
    },
    uploadAttachmentFile: (input: UploadFile, body: FormData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/AttachmentLink/uploadAttachmentFile?issueId=${input}`, body, options);
    },
    createRealtionship: (input: RelationshipDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/IssuesRelationship`, input, options);
    },
    uploadAdditionAttachmentFile: (body: FormData, itemId: number, options?: RequestOptions) => {
      console.log(`${apiUrl}/AdditionAttachmentLink/uploadAttachmentFile?issueId=${itemId}`)
      return HttpClient.post(`${apiUrl}/AdditionAttachmentLink/uploadAttachmentFile?itemId=${itemId}`, body, options);
    },
  };

  public Put = {
    updateIssue: (issueId: number, input: UpdateIssuePayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Issue/${issueId}`, input, options);
    },
    updateMultiIssueDate: (input: UpdateIssuePayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Issue/updatePlaneDateIssues`, input, options);
    },
    updateCheckItems: (issueId: number, input: UpdateCheckItemsPayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Issue_CheckItems/${issueId}`, input, options);
    },
    getIssuebyIds: (ids: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Issue_CheckItems/getByIds`, ids, options);
      // return HttpClient.put(`${apiUrl}/Issue_CheckItems/getByIds/`, ids, options);
    },
    getIssueChecklistByIssueId: (issueIds: number, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Issue_CheckItems/getByIssueIds`, issueIds, options);
    },
    getIssueChecklistsTeamByCheckitemIds: (checkitemIds: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Issue_CheckItemsTeam/getTeamsIdsByCheckListIds`, checkitemIds, options);
    },
    updateStatusIssues: (issueId: number, code: string, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Issue/updateStatusIssue/${issueId}`, code, options);
    },
    updateMultiStatusIssues: (code: string, listIssueIds: number[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Issue/updateStatusIssue?statusCode=${code}`, listIssueIds, options);
    },
    addOtherResourcesDimToIssue: (issueId: number, data: any[], options?: RequestOptions) => {
      return HttpClient.put(
        `${apiUrl}/OtherResourcesDim/addResouceToIssue/${issueId}?issueId=${issueId}`,
        data,
        options,
      );
    },
    updateOtherResourcesDim: (id: number, data: OtherResourcesDimDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/OtherResourcesDim/${id}`, data, options);
    },
    updateTrackerDim: (id: number, data: Tracker, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/TrackerDim/${id}`, data, options);
    },
    updateTargetTracker: (id: number, input: TargetTrackerDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/TargetTracker/${id}`, input, options);
    },
    addMaterialsDimToIssue: (issueId: number, data: Issue_OtherResourceQuotaDTO[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/MaterialsDim/addMaterialToIssue/${issueId}?issueId=${issueId}`, data, options);
    },
    updateMaterialsDim: (id: number, data: MaterialsDimDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/MaterialsDim/${id}`, data, options);
    },
    updateAttributeDim: (id: number, data: AttributeDimDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/AttributeDim/${id}`, data, options);
    },
    updateLaborDim: (id: number, data: LaborDimDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/LaborDim/${id}`, data, options);
    },
    updateAssignTeamsForIssue: (listTeams: ListTeams, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/IssueTeam/assignForIssue`, listTeams, options);
    },
    updateTargetToIssue: (id: number, targetIssue: TargetIssue[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/TargetDim/updateTargetToIssue/${id}`, targetIssue, options);
    },
    addTargetToIssue: (id: number, targetIssue: TargetIssue[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/TargetDim/addTargetToIssue/${id}`, targetIssue, options);
    },
    updateIssueRelationship: (
      issueFirstId: number,
      issueSecondId: number,
      issueRelationship: RelationshipUpdateDTO,
      options?: RequestOptions,
    ) => {
      return HttpClient.put(
        `${apiUrl}/IssuesRelationship/updateIssueRel/${issueFirstId}/${issueSecondId}`,
        issueRelationship,
        options,
      );
    },
    updateIssueTeams: (teamDatas: IssueTeamDTO[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/IssueTeam/updateIssueTeams`, teamDatas, options);
    },
    updateStartDateIssue: (id: number, newStartDate: string, esitmateTime: number, options?: RequestOptions) => {
      return HttpClient.put(
        `${apiUrl}/IssuesRelationship/updateStartDateIssue/${id}?newStartDate=${newStartDate}&esitmateTime=${esitmateTime}`,
        options,
      );
    },
    updateIssueAttribute: (id: number, data: AttributesUpdateDTO[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Issue/updateAttributeForIssue/${id}`, data, options);
    },
    // [18/12/2024][#21174][phuong_td] thêm mã templateCode truyền vào thay vì đặt cố định
    getFinance: (data: any, templateCode: string, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/api/Cxm/getFinance?templateCode=${templateCode}`, data, options);
    },
    updateAttachmentFile: (body: any, itemId: number, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/AdditionAttachmentLink/updates`, body, options);
    },
  };

  public Delete = {
    removeIssue: (issueId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/api/Issue/${issueId}`, options);
    },
    removeIssueTeam: (teamid: number, issueid: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/IssueTeam/deleteIssueTeam/${teamid}/${issueid}`, options);
    },
    removeTrackerDim: (id: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/TrackerDim/${id}`, options);
    },
    removeMaterialsDim: (id: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/MaterialsDim/${id}`, options);
    },
    removeOtherResourcesDim: (id: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/OtherResourcesDim/${id}`, options);
    },
    removeCheckitemsTeam: (teamId: number, issueIds: number[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Issue_CheckItemsTeam/deleteToTeam/${teamId}`, options, issueIds);
    },
    removeIssueRelationship: (issueFirstId: number, issueSecondId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/IssuesRelationship/deleteIssueRel/${issueFirstId}/${issueSecondId}`, options);
    },
    removeFileOfIssue: (issueId: number, fileId: number, listId: string[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/AttachmentLink/deleteFiles/${issueId}/${fileId}`, options, listId);
    },
    removeAdditionAttachmentFile: (itemId: number, fileId: number, listId: string[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/AttachmentLink/deleteFiles/${itemId}`, listId,  options);
    },
  };
}

export const IssueService = new IssueController();

class StatusHelper {
  public statusOptions = [
    {
      value: Status.Pending,
      label: StatusLabel.Pending,
      color: StatusColor.Pending,
      code: sMilestone.WaitingForApproval,
    },
    { value: Status.Approved, label: StatusLabel.Approved, color: StatusColor.Approved, code: sMilestone.Approved },
    {
      value: Status.Processing,
      label: StatusLabel.Processing,
      color: StatusColor.Processing,
      code: sMilestone.Processing,
    },
    { value: Status.Done, label: StatusLabel.Done, color: StatusColor.Done, code: sMilestone.Complete },
    { value: Status.Stop, label: StatusLabel.Stop, color: StatusColor.Stop, code: sMilestone.Pause },
  ];

  public statusOptionFilter = [
    { value: Status.All, label: StatusLabel.All },
    { value: Status.Pending, label: StatusLabel.Pending },
    { value: Status.Approved, label: StatusLabel.Approved },
    { value: Status.Processing, label: StatusLabel.Processing },
    { value: Status.Done, label: StatusLabel.Done },
  ];

  public getStatusLabel(status: Status): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : 'Unknown';
  }

  public getStatusColor(status: Status): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'Unknown';
  }

  public getStatusOptions(): { value: Status; label: string; color: string }[] {
    return this.statusOptions;
  }

  getCodeByValue = (value: string) => {
    return this.statusOptions.find(s => s.value.toString() === value)?.code;
  };

  getValue = (value: any) => {
    const temp = parseInt(value);
    if (isNaN(temp)) {
      const status = this.statusOptions.find(s => s.code === value);
      return status ? status.value : value;
    }
    return temp;
  };
}

export const StatusHelperControl = new StatusHelper();
