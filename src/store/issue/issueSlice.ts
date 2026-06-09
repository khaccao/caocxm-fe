import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  AttributeDimDTO,
  AttributesUpdateDTO,
  CategoryDTO,
  EmployeeReportDTO,
  RelationshipDTO,
  TagVersion,
  TargetDTO,
  Tracker,
  ViewState,
  defaultPagingParams,
  eDateGanttOption,
  iOptions,
  iQueryParamAccountingManagement,
} from '@/common/define';
import {
  CheckItemsDTO,
  IssueTagListPagingResponse,
  IssueTeamDTO,
  IssuesPagingResponse,
  IssuesResponse,
  MachineriesPagingResponse,
  MaterialsPagingResponse,
  OtherResourcesDimDTO,
  WeeklyAssignmentDTO,
  totalVoLumeData,
} from '@/services/IssueService';
import { RequestOptions } from '@/services/types';
import Utils from '@/utils';

interface BiddingState {
  issues?: IssuesPagingResponse;
  selectedIssue?: IssuesResponse;
  selectedWorkWeekly?: WeeklyAssignmentDTO;
  issueStatus?: IssueTagListPagingResponse;
  issueProgress?: IssueTagListPagingResponse;
  issueByVersion?: IssuesPagingResponse;
  issueTeams?: IssueTeamDTO[];
  issueChecklist?: Map<number, CheckItemsDTO[]>;
  checkItemIds?: number[];
  checklistsTeams?: number[];
  selectedChecklistsTeam?: number[];
  selectedChecklistItem?: CheckItemsDTO;
  issueIds?: number[];
  view: ViewState;
  dateGanttOption: eDateGanttOption;
  queryParams: any;
  queryParamsByTagVersion?: any;
  queryParamsMachinery?: any;
  queryParamsMaterial?: any;
  tagVersionId?: number;
  categorys?: CategoryDTO[];
  targets?: TargetDTO[];
  targetsIssue?: any[];
  tagsVersion?: TagVersion[];
  tracker?: Tracker[];
  attributes?: AttributeDimDTO[];
  otherResources?: OtherResourcesDimDTO[];
  dateFilter?: { startDate: any; endDate: any };
  editIssuePublic?: boolean;
  ParentIssueRelationship?: RelationshipDTO[] | null;
  ChildIssueRelationship?:  RelationshipDTO[] | null;
  AllChildIssueRelationShipFromId?: RelationshipDTO[];
  queryParamsByParentId?: any;
  issuesByParentId?: IssuesPagingResponse;
  listFileAttachmentOfIssue?: any;
  allMembersToGroup?: any;
  dataFileView?: any;
  materials?: MaterialsPagingResponse;
  machineries?: MachineriesPagingResponse;
  setSelectedLabel?: any;
  session: string;
  employeeReportByIssue?: EmployeeReportDTO[];
  totalVolumeAchievedData: totalVoLumeData[];
  dataFilnance?: string;
  // [09/11/2024][#20629][phuong_td] report theo ngày
  reportsByStartEndDate?: EmployeeReportDTO[];
  // [09/11/2024][#20629][phuong_td] payload lấy dữ liệu report theo ngày
  queryReportsByStartEndDate?: { projectId: number, params: iOptions };
  queryParamAccountingManagement?: iQueryParamAccountingManagement;
  issueImageList?: any[];
}

const initialState: BiddingState = {
  totalVolumeAchievedData: [],
  view: 'List',
  dateGanttOption: eDateGanttOption.WEEKS,
  queryParams: defaultPagingParams,
  session: Utils.generateRandomString(3),
};

const issueSlice = createSlice({
  name: 'bidding',
  initialState,
  reducers: {
    //lẤY KHỐI lượng hoàn thành
    getTotalVolumeSuccess: (
      state,
      action: PayloadAction<{ projectId: number; options: RequestOptions; totalVolumeAchievedData: totalVoLumeData[] }>,
    ) => {
      state.totalVolumeAchievedData = action.payload.totalVolumeAchievedData; //cập nhât state với dữ liệu mới từ action payload
    },
    getTotalVolumeRequest: (state, action) => {},
    getTotalVolumeFailure: (state, action: PayloadAction<totalVoLumeData[]>) => {},
    setIssues: (state, action) => {
      Utils.formatStartAndEndDate(action.payload);
      state.issues = action.payload;
    },
    setSelectedIssue: (state, action) => {
      state.selectedIssue = action.payload;
    },
    setSelectedLabel: (state, action) => {
      state.setSelectedLabel = action.payload;
    },
    setEditIssuePublics: (state, action) => {
      state.editIssuePublic = action.payload;
    },
    setSelectedWorkWeekly: (state, action) => {
      state.selectedWorkWeekly = action.payload;
    },
    setSelectedChecklistItem: (state, action) => {
      state.selectedChecklistItem = action.payload;
    },
    setSelectedChecklistsTeam: (state, action) => {
      state.selectedChecklistsTeam = action.payload;
    },
    setIssueStatuses: (state, action) => {
      state.issueStatus = action.payload;
    },
    setIssueProgress: (state, action) => {
      state.issueProgress = action.payload;
    },
    setIssueByVersion: (state, action) => {
      Utils.formatStartAndEndDate(action.payload);
      state.issueByVersion = action.payload;
    },
    setIssueTeam: (state, action) => {
      state.issueTeams = action.payload;
    },
    setIssueRelationshipParent: (state, action) => {
      state.ParentIssueRelationship = action.payload;
    },
    setAllChildIssueRelationShipFromId: (state, action) => {
      state.AllChildIssueRelationShipFromId = action.payload;
    },
    setIssueRelationshipChild: (state, action) => {
      state.ChildIssueRelationship = action.payload;
    },
    setIssueChecklist: (state, action) => {
      state.issueChecklist = action.payload;
    },
    setCheckItemIds: (state, action) => {
      state.checkItemIds = action.payload;
    },
    setTarget: (state, action) => {
      state.targets = action.payload;
    },
    setTargetsIssue: (state, action) => {
      state.targetsIssue = action.payload;
    },
    setChecklistsTeams: (state, action) => {
      state.checklistsTeams = action.payload;
    },
    setIssueIds: (state, action) => {
      state.issueIds = action.payload;
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    setDateGanttOption: (state, action) => {
      state.dateGanttOption = action.payload;
    },
    setQueryParams: (state, action) => {
      state.queryParams = action.payload;
    },
    setQueryParamsByTagVersion: (state, action) => {
      state.queryParamsByTagVersion = action.payload;
    },
    setQueryParamsMachinery: (state, action) => {
      state.queryParamsMachinery = action.payload;
    },
    setQueryParamsMaterial: (state, action) => {
      state.queryParamsMaterial = action.payload;
    },
    setTagVersionId: (state, action) => {
      state.tagVersionId = action.payload;
    },
    setCategory: (state, action) => {
      state.categorys = action.payload;
    },
    setTagsVersion: (state, action) => {
      state.tagsVersion = action.payload;
    },
    setTracker: (state, action) => {
      state.tracker = action.payload;
    },
    setMaterials: (state, action) => {
      state.materials = action.payload;
    },
    setMachineries: (state, action) => {
      state.machineries = action.payload;
    },
    setAttributes: (state, action) => {
      state.attributes = action.payload;
    },
    setOtherResources: (state, action) => {
      state.otherResources = action.payload;
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    setQueryParamsByParentId: (state, action) => {
      state.queryParamsByParentId = action.payload;
    },
    setIssuesByParentId: (state, action) => {
      state.issuesByParentId = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
    },
    getIssuesRequest: (state, action) => {},
    createIssueRequest: (state, action) => {},
    updateIssueRequest: (state, action) => {},
    updateStartDateIssueRequest: (state, action) => {},
    getMembersToGroup: (state, action) => {},
    setMembersToGroup: (state, action) => {
      state.allMembersToGroup = action.payload;
    },
    updateMultiIssueRequest: (state, action) => {},
    updateMultiIssueDateRequest: (state, action) => {},
    removeIssueRequest: (state, action) => {},
    removeFileFolder: (state, action) => {},
    getStatusListRequest: (state, action) => {},
    getProgressListRequest: (state, action) => {},
    getIssuesByMilestoneRequest: (state, action) => {},
    getIssueChecklistRequest: (state, action) => {},
    getIssueChecklistByIssueIdsRequest: (state, action) => {},
    getIssueChecklistsTeamByCheckitemIds: (state, action) => {},
    getIssueChecklistsByTeamId: (state, action) => {},
    createIssueCheckItemsTeamRequest: (state, action) => {},
    createChecklistRequest: (state, action) => {},
    updateChecklistRequest: (state, action) => {},
    getCategoryByCompanyIdRequest: (stage, action) => {},
    getTagByCompanyIdRequest: (stage, action) => {},
    getTeamIdsByIssueRequest: (stage, action) => {},
    getIssueTeamsByIssueRequest: (stage, action) => {},
    createIssueTeamRequest: (stage, action) => {},
    removeIssueTeamRequest: (state, action) => {},
    updateStatusIssue: (state, action) => {},
    updateMultiStatusIssue: (state, action) => {},
    removeCheckitemsTeamRequest: (state, action) => {},
    getTrackerByProject: (state, action) => {},
    getTrackerByCompany: (state, action) => {},
    createTrackerDim: (state, action) => {},
    updateTrackerDim: (state, action) => {},
    removeTrackerDimRequest: (state, action) => {},
    createTargetTracker: (state, action) => {},
    updateTargetTracker: (state, action) => {},
    createOtherResourcesDim: (state, action) => {},
    updateOtherResourcesDim: (state, action) => {},
    getOtherResourcesDim: (state, action) => {},
    getOtherResourcesDimByTracker: (state, action) => {},
    addOtherResourcesDimToIssue: (state, action) => {},
    removeOtherResourcesDimRequest: (state, action) => {},
    createMaterialsDim: (state, action) => {},
    updateMaterialsDim: (state, action) => {},
    getMaterialsDim: (state, action) => {},
    getMaterialsDimByTracker: (state, action) => {},
    addMaterialsDimToIssue: (state, action) => {},
    removeMaterialsDimRequest: (state, action) => {},
    createIssueMaterialsQuota: (state, action) => {},
    createIssue_OtherResourceQuota: (state, action) => {},
    createAttributeDim: (state, action) => {},
    updateAttributeDim: (state, action) => {},
    getAttributeDim: (state, action) => {},
    getAttributeDimByTracker: (state, action) => {},
    removeAttributeDimRequest: (state, action) => {},
    deleteMultiIssue: (state, action) => {},
    updateAssignTeamsForIssue: (state, action) => {},
    upLoadFileAttachment: (state, action) => {},
    uploadAdditionAttachment: (state, action) => {},
    updateAdditionAttachment: (state, action) => {},
    uploadFileForFolder: (state, action) => {},
    getFileAttachmenForIssue: (state, action) => {},
    setFileAttachmentForIssue: (state, action) => {
      state.listFileAttachmentOfIssue = action.payload;
    },
    setDataFileView: (state, action) => {
      state.dataFileView = action.payload;
    },

    removeFileOfIssue: (state, action) => {},
    downloadFileAttachmentOfIssue: (state, action) => {},
    createLaborDim: (state, action) => {},
    updateLaborDim: (state, action) => {},
    getLaborDim: (state, action) => {},
    getLaborDimByTracker: (state, action) => {},
    removeLaborDimRequest: (state, action) => {},
    getTargetByConditionRequest: (stage, action) => {},
    updateTargetToIssue: (stage, action) => {},
    addTargetToIssue: (stage, action) => {},
    getTeamsIdsByCheckItemIdRequest: (stage, action) => {},
    createTargetDim: (stage, action) => {},
    createRealtionship: (stage, action) => {},
    updateRealtionship: (stage, action) => {},
    getParentIssueRelationshipByIssueRequest: (stage, action) => {},
    getChildIssueRelationshipByIssueRequest: (stage, action) => {},
    removeIssueRelationship: (stage, action) => {},
    getAllChildIssueRelationShipFromIdRequest: (stage, action) => {},
    updateIssueTeamsRequest: (state, action) => {},
    getIssueByParentIdRequest: (state, action: PayloadAction<{ parentId: number; params: any }>) => {},
    getMachinerysDimByTracker: (state, action) => {},
    getEmployeeReportByIssue: (
      state,
      action: PayloadAction<{
        issueId: number;
        resolve?: (result: EmployeeReportDTO[]) => void;
      }>,
    ) => {},
    setEmployeeReportByIssue: (state, action) => {
      state.employeeReportByIssue = action.payload;
    },
    // [06/11/2024][phuong_td] updateIssueAttributeRequest
    updateIssueAttributeRequest: (
      state,
      action: PayloadAction<{
        issueId: number;
        attributes: AttributesUpdateDTO[];
        // [13/11/2024][#20793][phuong_td] biến để xác định có ẩn thông báo không
        hiddenNotification: boolean;
        resolve?: (result: any) => void;
        reject?: (error: any) => void;
      }>,
    ) => {},
    // [18/12/2024][#21174][phuong_td] thêm payload Type thay vì để any
    getFinance: (state, action: PayloadAction<{
      templateCode: string, 
      data: any
    }>) => {},
    setFinance: (state, action) => {
      state.dataFilnance = action.payload},
    getReportsByStartEndDateRequest: (state, action: PayloadAction<{
      projectId: number, 
      params: iOptions
    }>) => {},
    getAttachmentFileRequest:(state, action: PayloadAction<{issueId: number}>) => {},
    setIssueImageList: (state, action: PayloadAction<any[]>) => {state.issueImageList = action.payload},
    setReportsByStartEndDate: (state, action) => {
      state.reportsByStartEndDate = action.payload;
    },
    setQueryReportsByStartEndDate: (state, action) => {
      state.queryReportsByStartEndDate = action.payload;
    },
    setQueryParamAccountingManagement: (state, action: PayloadAction<iQueryParamAccountingManagement>) => {
      state.queryParamAccountingManagement = action.payload;
    },
    exportProposalPDFRequest: (state, action) => {},
    exportInventoryReceiptPDFRequest: (state, action) => {},
  },
});

export const issueActions = issueSlice.actions;
export const issueReducer = issueSlice.reducer;
