import { MenuProps } from 'antd';
import { Dayjs } from 'dayjs';
import { TFunction } from 'i18next';
import { JwtPayload } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

import {
  ChiTietDeNghiMuaHangDTO,
  ChiTietHangHoaDTO,
  ExtensionDTO,
  HoaDonVATDTO,
} from '@/services/AccountingInvoiceService';
import { IssuesResponse } from '@/services/IssueService';
import { CreateProjectWarehousePayload } from '@/services/ProjectService';

export type CheckboxValueType = string | number | boolean;

export interface LoginInput {
  username: string;
  password: string;
  captchaId?: string;
  captcha?: string;
  remember: boolean;
}

export interface LoginPayload {
  grant_type: string;
  scope: string;
  username: string;
  password: string;
  client_id: string;
  client_secret?: string;
}

export interface JwtDecoded extends JwtPayload {
  profile: string;
  role: string[];
  orgRoles: string[];
  CompanyId: number;
  OrgId: string;
  Cxm_Permissions: string[];
}

export const NavbarHeight = 70;
export const LeftPanelWidth = 270;

export const formatDateDisplay = 'DD/MM/YYYY';
export const formatDateGantt = '%d-%m-%Y';
export const formatTimeOnly = 'HH:mm:ss';

export interface Project {
  id: number;
  external_id: number;
  title: string;
  address: string;
  status?: ProjectStatus;
  photoUrl?: string;
}

export enum ProjectStatus {
  BIDDING = 'bidding',
  COMPLETED = 'completed',
  EXECUTING = 'executing',
}

export enum eTypeDieuChuyen {
  VatTuChinh = 'VatTuChinh',
  VatTuPhu = 'VatTuPhu',
  MayMoc = 'MayMoc',
}
export const persitConfigKey = 'persitConfig';

export type MenuItem = Required<MenuProps>['items'][number] & {
  auth?: string[];
  children?: MenuItem[];
};

/**
 * copy icon svg vào thu mục icons trong public
 * sau đó thêm enum là tên của icon svg vào đây để sử dụng
 */
enum IconSvgEnum {
  bidding,
  contract,
  prepareConstruction,
}

/**
 * copy icon svg vào thu mục icons trong public
 * sau đó thêm enum là tên của icon svg vào IconSvgEnum trong common/define.ts để sử dụng
 */
export type IconSvgType = keyof typeof IconSvgEnum;

export interface ProjectMemberType {
  key: string;
  name: string;
  role: string[];
}

export interface CheckboxType {
  key: string;
  label: string;
  value: string;
}
export interface ProjectInformationValue {
  projectName: string;
  projectCode: string;
  projectStartDate: Date | null | undefined;
  projectEndDate: Date | null | undefined;
  address: string;
  description: string;
  projectAvatar: UploadFile | null;
  investorName: string;
  investorPhone: string;
  investorEmail: string;
  status: number;
  warehouses: CreateProjectWarehousePayload[];
}

export interface MenuInfo {
  key: string;
  keyPath: string[];
  /** @deprecated This will not support in future. You should avoid to use this */
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

export type ViewState = 'List' | 'Gantt' | 'Kanban';

export enum FormType {
  CREATE = 'create',
  UPDATE = 'update',
}

export interface ITeamInformation {
  teamName: string;
  description: string;
  note: string;
}

export interface PagingResponse {
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
  // results: any[];
}

export const defaultPagingParams = {
  paging: true,
  page: 1,
  pageSize: 20,
};

// [09/11/2024][#20629][phuong_td] interface params
export interface iOptions {
  filter?: string;
  expand?: string;
  select?: string;
  search?: string;
  paging?: boolean;
  orderBy?: string;
  ascending?: boolean;
  // SortBy.Key?: string,
  // SortBy.Value?: string,
  page?: number;
  pageSize?: number;
  offset?: number;
  take?: number;
  typeSearch?: number;
  startDate?: string;
  endDate?: string;
  baseDate?: string;
}

export const largePagingParams = {
  paging: true,
  page: 1,
  pageSize: 2000,
};

export enum BCHcode {
  BCHcode = 'BCH',
}
export enum sMilestone {
  Bid = 'DuThau',
  ContractBiddingKPIs = 'HopDongKPI',
  PrepareForConstruction = 'ChuanBiTC',
  SetupInitialProgress = 'ThiCong',
  WaitingForApproval = 'Dang_Cho_Duyet',
  Approved = 'Da_Duyet',
  Processing = 'Dang_Thuc_Hien',
  Complete = 'Hoan_Thanh',
  Pause = 'Tam_Dung',
  SalaryKpi = 'LuongKPI',
  SalaryPaymentOne = 'ThanhToanLan1',
  SalaryAdvanceTwo = 'UngLuongLan2',
  SalaryPaymentTwo = 'ThanhToanLan2',
  WeeklyWork = 'Cong_Viec_Hang_Tuan',
}

export enum eTypeUpdate {
  Checklist = 0,
  WeeklyAssignment = 1,
  AssignWork = 2,
  SetupInitialProgress = 3,
}

export enum eAttribute {
  IsoNo = 'IsoNo',
  SpoolNo = 'SpoolNo',
  LineNo = 'LineNo',
  EquipmentNo = 'EquipmentNo',
  EnlNo = 'EnlNo',
  StructureNo = 'StructureNo',
  CivilNo = 'CivilNo',
  TestType = 'TestType',
  WeldingCompleteDate = 'WeldingCompleteDate',
  PunchAClearDate = 'PunchAClearDate',
  ReadyForTestDate = 'ReadyForTestDate',
  SelectionSetName = 'SelectionSetName',
  DailyCapacity = 'DailyCapacity',
  WelderMP = 'WelderMP',
  Dinh_Muc_Luong = 'Dinh_Muc_Luong',
  So_Cong = 'So_Cong',
  So_Cong_Con_Lai = 'So_Cong_Con_Lai',
  Khoi_Luong_Con_Lai = 'Khoi_Luong_Con_Lai',
  Khoi_Luong = 'Khoi_Luong',
  So_Cong_Hoan_Thanh = 'So_Cong_Hoan_Thanh',
  KL_Giao = 'KL_Giao',
}

export enum MilestoneLabel {
  Bid = 'Dự thầu',
  ContractBiddingKPIs = 'Hợp đồng. KPI đấu thầu',
  PrepareForConstruction = 'Chuẩn bị thi công',
  SetupInitialProgress = 'Thi Công',
}

// [07/11/2024][#20719][phuong_td] AttributesUpdateDTO
export interface AttributesUpdateDTO {
  attributeId: number;
  issuesId: number;
  dateTimeValue: string; // '2024-11-06T13:11:05.535Z';
  value: string;
  valueType: number;
  code: string;
}

// [07/11/2024][#20719][phuong_td] EmployeeReportDTO
export interface EmployeeReportDTO {
  employeeId: number;
  employeeCode: string;
  issueId: number | null;
  teamId?: number;
  projectId?: number;
  id?: number;
  employeePhone: string;
  employeeEmail: string;
  employeeName: string;
  trackerId: number;
  note: string;
  startTime: string;
  endTime: string;
  employReportAttributes: EmployeeReportAttributesDTO[];
  createTime: string;
  // [08/11/2024][phuong_td][#20692] EmployeeType cho report
  employeeType: eEmployeeType; // (0 là nhân sự thường, 1 là nhân sự bổ sung)
  costPerValue?: number;
  companyId?: number;
  teamName?: string;
  ChucVu?: string;
}

//[#22092][18/04/2025]
export interface EmployeeReportEfficiencyByStartEndDateDTO extends EmployeeReportDTO {
  dinhMucLuong?: string,
  unitVolume?: string,
  issueName?: string,
}

export enum eEmployeeType {
  ThongThuong = 0,
  BoXung = 1,
}

// [07/11/2024][#20719][phuong_td] EmployeeReportAttributesDTO
export interface EmployeeReportAttributesDTO {
  employeeReportId: number;
  attributeId: number;
  value: string;
  valueType: number;
  note: string;
  attributeCode: string;
}

export interface TagVersion {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  order: number;
  type: number;
  companyId: number;
  projectId: number;
  creatTime: string;
}

export interface Tracker {
  id?: number;
  name: string;
  code: string;
  type: number;
  projectId: number;
  companyId: number;
  targetIds: number[];
  materialIds: number[];
  otherResourcesIds: number[];
  laborsIds: number[];
  machineryIds: number[];
  attributeIds: number[];
}

export interface TargetTrackerDTO {
  targetId: 0;
  tracker: 0;
  category: 0;
  id?: number;
}

export interface TargetDTO {
  id: number;
  description: string;
  name: string;
  actualDisplayName: string;
  code: string;
  status: number;
  tracker: number;
  categoryId: number;
  projectId: number;
  unitVolume: string;
  unitCategory: string;
}

export interface RelationshipDTO {
  issueFirstId: number;
  issueSecondId: number;
  type: number;
  dayRelationship: number;
  issueSecond?: IssuesResponse;
  issueFirst?: IssuesResponse;
  relationshipCode: string;
  relationshipId: number;
  durationRelationship: number;
}

export interface RelationshipUpdateDTO {
  type: number;
  dayRelationship: number;
  relationshipCode: string | null;
  relationshipId: number;
  durationRelationship: number;
}

export interface UploadFile {
  issueId: number;
}

export interface IssueMaterialsQuota {
  issuesId: number;
  materialId: number;
  requiredQuantity: string;
  actualQuantity: string;
  unitOfMeasure: number;
  status: number;
  name: string;
}

export interface MaterialsDimDTO {
  id: number;
  name: string;
  type: number;
  description: string;
  unitOfMeasure: string;
  status: number;
  code: string;
}

export interface MachineryDimDTO {
  name: string;
  hourlyRate: number;
  description: string;
  status: number;
  id: number;
  type: number;
  code: string;
}

export interface AttributeDimDTO {
  name: string;
  code: string;
  valueType: number;
  status: number;
  notes: string;
  defaultValue: string;
  companyId: number;
  id?: number;
  AttributeId: number;
  issuesId?: number;
  value?: string;
  dateTimeValue?: string;
  type?: number;
}

export interface LaborDimDTO {
  name: string;
  hourlyRate: number;
  description: string;
  skillSet: number;
  status: number;
}

export enum targetType {
  Issuse = 'Issuse',
  Category = 'Category',
}

export enum eOrderResourceName {
  NhanCong = 'Nhân Công',
}

export interface IssueMaterialsQuota {
  issuesId: number;
  materialId: number;
  requiredQuantity: string;
  actualQuantity: string;
  unitOfMeasure: number;
  status: number;
  name: string;
}

export enum StatusLabel {
  All = 'Tất cả',
  Pending = 'Đang chờ duyệt',
  Approved = 'Đã duyệt',
  Processing = 'Đang thực hiện',
  Done = 'Hoàn thành',
}

export enum StatusColor {
  Pending = 'gray',
  Approved = 'orange',
  Processing = 'pink',
  Done = 'green',
}

export enum eNatureOfTheJob {
  DailyRepetitiveWork = 0,
  DetailedArisingWork = 1,
  UnexpectedWork = 2,
}

export enum eCategoryString {
  Foundation = 'Phan_Mong',
  BodyPart = 'Phan_Than',
  FinishingSection = 'Phan_Hoan_Thien',
  BuildTheWall = 'Xay_Tuong',
  InternalWallPlastering = 'Trat_Tuong_Trong',
  PlasteringExteriorWalls = 'Trat_Tuong_Ngoai',
  WallTiling = 'Op_Lat_Tuong_Nen',
  Cleaning_AcceptanceAndHandover = 'VS_Nghiem_Thu_Ban_Giao',
  Summary = 'Summary',
}

export enum eTrackerCode {
  PipingTask = 'PipingTask',
  EquipmentTask = 'EquipmentTask',
  EAndITask = 'E&ITask',
  StructureTask = 'StructureTask',
  CivilTask = 'CivilTask',
  PipingTestPackage = 'PipingTestPackage',
  PipingAreaWorkload = 'PipingAreaWorkload',
  CongViecHangTuan = 'CongViecHangTuan',
  GiaoViecTheoNgay = 'GiaoViecTheoNgay',
}

export enum eCategoryNumber {
  Foundation = 0,
  BodyPart = 1,
  FinishingSection = 2,
  BuildTheWall = 3,
  InternalWallPlastering = 4,
  PlasteringExteriorWalls = 5,
  WallTiling = 6,
  Cleaning_AcceptanceAndHandover = 7,
  Summary = 8,
}

export enum FileStatusConstant {
  repairing = 'repairing',
  uploading = 'uploading',
  success = 'success',
  error = 'error',
}

export interface FileStatus {
  percent: number;
  status: FileStatusConstant;
  file?: FormData;
  fileId: string;
  documentId?: string;
  name?: string;
  error?: string;
}

export interface IBudgetEstimateByProjectResult {
  categoryCode: string;
  companyId: number;
  id: number;
  money: string;
  name: string;
  note: string | null;
  paymentTerm: number;
  paymentTermDate: string;
  projectCode: string | null;
  subContractorCode: string | null;
  subContractorId: number;
  titleCategory: string;
  transfer: string | null;
  unit: string | null;
  type: number;
  total_Expenditure: number;
  paymentType: number;
}

export const NatureOfWorks = () => {
  const { t } = useTranslation('status');

  return [
    {
      label: t('DetailedArisingWork'),
      value: eNatureOfTheJob.DetailedArisingWork,
    },
    {
      label: t('DailyRepetitiveWork'),
      value: eNatureOfTheJob.DailyRepetitiveWork,
    },
    {
      label: t('UnexpectedWork'),
      value: eNatureOfTheJob.UnexpectedWork,
    },
  ];
};

export const WorkingProgress = [
  {
    label: '0%',
    value: 0,
  },
  {
    label: '10%',
    value: 10,
  },
  {
    label: '20%',
    value: 20,
  },
  {
    label: '30%',
    value: 30,
  },
  {
    label: '40%',
    value: 40,
  },
  {
    label: '50%',
    value: 50,
  },
  {
    label: '60%',
    value: 60,
  },
  {
    label: '70%',
    value: 70,
  },
  {
    label: '80%',
    value: 80,
  },
  {
    label: '90%',
    value: 90,
  },
  {
    label: '100%',
    value: 100,
  },
];

export interface CategoryDTO {
  id: number;
  name: string;
  code: eCategoryString;
  parentCode?: eCategoryString;
  CompanyId: number;
}

export const Category = (categorys: CategoryDTO[] | undefined, t: any) => {
  const category: {
    value: number | undefined;
    id: number;
    label: string;
    code: eCategoryString;
  }[] = [];
  if (categorys) {
    categorys?.forEach(c => {
      category.push({
        value: c.id,
        label: t(c.code),
        id: c.id,
        code: c.code,
      });
    });
  }
  return category;
};

export enum eDateGanttOption {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
  YEARS = 'Years',
}

export class TabItems {
  t: TFunction<string, undefined>;
  items: IItemDataGanttOption[];
  constructor(t: TFunction<string, undefined>) {
    this.t = t;
    this.items = [
      { label: this.t('Date'), key: eDateGanttOption.DAYS },
      { label: this.t('Week'), key: eDateGanttOption.WEEKS },
      { label: this.t('Month'), key: eDateGanttOption.MONTHS },
      { label: this.t('Year'), key: eDateGanttOption.YEARS },
    ];
  }
  getItems() {
    return this.items;
  }
}

export class ItemColorNotes {
  t: TFunction<string, undefined>;
  styles: any;
  items: IItemColorNote[];
  constructor(t: TFunction<string, undefined>, styles: any) {
    this.t = t;
    this.styles = styles;
    this.items = [
      { label: this.t('Plan'), className: this.styles.Plan },
      { label: this.t('Ahead of Schedule'), className: this.styles.AheadOfSchedule },
      { label: this.t('Behind Schedule'), className: this.styles.BehindSchedule },
      { label: this.t('In Progress'), className: this.styles.InProgress },
      { label: this.t('Completed'), className: this.styles.Completed },
    ];
  }

  getItems() {
    return this.items;
  }
}
export interface IDataLinks {
  id: number;
  source: string | number;
  target: string | number;
  type: string;
}

export interface IDataPredecessor {
  key: string;
  id: string;
  taskName: string;
  type: EPredecessorType;
  lag: number;
}

export interface IDataGantt {
  id: number | string;
  text: string;
  start_date: string | null;
  end_date: string | null;
  start_date_ac: string | null;
  end_date_ac: string | null;
  duration: number | null;
  durationDisplay: number;
  parent: number | string | null;
  progress: number;
  progressDisplay: string;
  row_height: number;
  open?: boolean;
  isCategory?: boolean;
  isEmptyChildren?: boolean;
  isEmptyStartDate?: boolean;
  isEmptyEndDate?: boolean;
}
export interface IPropsGantt {
  infoParentComponent: IInforParenComponent;
}

export interface IInforParenComponent {
  isApplyCategory?: boolean;
  tagVersionId: number;
  typeUpdate: eTypeUpdate | sMilestone;
  pageSize: number;
  ascending?: boolean;
}

export interface IItemDataGanttOption {
  label: string;
  key: eDateGanttOption;
}

export interface IItemColorNote {
  label: string;
  className: string;
}

export enum EPredecessorType {
  FinishToStart = 'FinishToStart', // 1
  StartToStart = 'StartToStart', // 2
  StartToFinish = 'StartToFinish', // 3
  FinishToFinish = 'FinishToFinish', // 4
}

export interface IMultiIssueUpdateDate {
  id: number;
  planeStart: string;
  planeEnd: string;
}

export enum Resources {
  NhanCong = 'NhanCong',
  KhoiLuongGiao = 'KhoiLuongGiao',
  DonViTinh = 'DonViTinh',
  Loai = 'Loai',
  DonGia = 'DonGia',
}

export enum eTypeVatTuMayMoc {
  VatTuChinh = 'VatTuChinh',
  VatTuPhu = 'VatTuPhu',
  MayMoc = 'MayMoc',
}
export enum Paythesubcontractor {
  ThanhToan12 = 'ThanhToan12',
  ThanhToan27 = 'ThanhToan27',
}
export enum EFinancialPlan {
  KeHoachTamUng12 = 'kehoachtamung12',
  KeHoachTamUng27 = 'kehoachtamung27',
  KeHoachThanhToan05 = 'kehoachthanhtoan05',
  KeHoachThanhToan20 = 'kehoachthanhtoan20',
}

export enum EFinancialPlanCode {
  KeHoachTamUng12 = 'Ky01',
  KeHoachThanhToan20 = 'Ky02',
  KeHoachTamUng27 = 'Ky03',
  KeHoachThanhToan05 = 'Ky04',
}

export enum EFinancialPlanNumber {
  KeHoachTamUng12 = 12,
  KeHoachThanhToan20 = 20,
  KeHoachTamUng27 = 27,
  KeHoachThanhToan05 = 5,
}

export enum EButtonState {
  KeHoachTamUng12 = 'KeHoachTamUng12',
  KeHoachTamUng27 = 'KeHoachTamUng27',
  KeHoachThanhToan05 = 'KeHoachThanhToan05',
  KeHoachThanhToan20 = 'KeHoachThanhToan20',
}

export enum eTypeVatTu {
  VatTuChinh = 1,
  VatTuPhu = 0,
}

export interface VatTuMayMocDTO {
  key: string | number;
  id: number;
  ma: string;
  name: string;
  unitOfMeasure: string;
  kldinhmuc?: string;
  tongdacap?: string;
  dexuat?: string;
  tonkho?: string;
  checkbox?: boolean;
  soluonghienco?: string;
  vitri?: string;
}

export interface ProposalType {
  key: string;
  ma: string | JSX.Element;
  ten: string | JSX.Element;
  donvi: string | JSX.Element;
  klkehoach: string | JSX.Element;
  tonkho: string | JSX.Element;
  klconlai: string | JSX.Element;
  dexuat: string | JSX.Element;
  ngaynhap?: string | JSX.Element;
  ghichu: string | JSX.Element;
  maKho: string | JSX.Element;
  tenKho: string | JSX.Element;
  Mavv: string | JSX.Element;
  DienGiai: string | JSX.Element;
  isRowFuction?: boolean;
  capDuyet?: number;
  gia1?: string | JSX.Element;
  ncc1?: string | JSX.Element;
  gia2?: string | JSX.Element;
  ncc2?: string | JSX.Element;
  gia3?: string | JSX.Element;
  ncc3?: string | JSX.Element;
  min?: string | JSX.Element;
  nearest?: string | JSX.Element;
  nccMin?: string | JSX.Element;
  nccNearest?: string | JSX.Element;
  tt1?: string | JSX.Element;
  tt2?: string | JSX.Element;
  tt3?: string | JSX.Element;
  ttMin?: string | JSX.Element;
  ttNearest?: string | JSX.Element;
  Tooltip?: any[];
  hinhthuc_tt?: number;
}

export interface PhieuDeNghiMuaHangDTO {
  id?: number;
  del?: boolean;
  madvcs: string; // mã đv cs
  recId?: number;
  RecID?: number;
  ma_ct?: string; // mã chứng từ
  ngay_ct?: string; // 2024-09-20T14:04:08.540Z ngày chứng từ
  so_ct?: string; // số chứng từ
  ngay_hoa_don?: string;
  loai_tt?: number;
  han_tt?: string; // 2024-09-20T14:04:08.540Z
  ma_kh?: string;
  ma_bo_phan?: string;
  nguoi_tt?: string;
  nv_bh?: string;
  dia_chi?: string;
  dien_giai: string;
  ma_nt?: string;
  ty_gia?: number;
  info?: string;
  is_local?: boolean;
  release?: boolean;
  moduleName?: string;
  createDate: string; // 2024-09-20T14:04:08.540Z
  CreateDate?: string; // 2024-09-20T14:04:08.540Z
  capDuyet?: number;
  capDuyetHienTai?: number;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  recIdparent?: number;
  nguoiDuyet1?: string;
  nguoiDuyet2?: string;
  nguoiDuyet3?: string;
  recIdrelation?: number;
  ma_nv_bh?: string;
  guid?: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6,
  nguoiDuyet4?: string;
  nguoiDuyet5?: string;
  guidRelation?: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6,
  chiTietHangHoa: ChiTietHangHoaDTO[];
  hoaDonVAT?: HoaDonVATDTO[];
  list_of_extensions?: ExtensionDTO[];
  chiTietDeNghiMuaHang?: ChiTietDeNghiMuaHangDTO[];
  daChiTien?: number;
}

export interface IBaoCaoCongNoVaSoCaiSoQuyData {
  soLieuDauKyChoTungTK: any;
  ChiTietTungKhoanHachToanChungTu: any;
}

export interface IBaoXuatNhapTonData {
  ma_vt?: string; // Mã vật tư
  ma_kho?: string; // Mã kho
  ton_dau?: string; // Tồn đầu kỳ (đơn vị vật tư)
  du_dau?: string; // Dư đầu kỳ (giá trị tiền)
  du_dau_nt?: string; // Dư đầu kỳ (giá trị ngoại tệ)
  luong_nhap?: string; // Lượng nhập
  tien_nhap?: string; // Tiền nhập
  tien_nhap_nt?: string; // Tiền nhập (ngoại tệ)
  luong_xuat?: string; // Lượng xuất
  tien_xuat?: string; // Tiền xuất
  tien_xuat_nt?: string; // Tiền xuất (ngoại tệ)
  ton_cuoi?: string; // Tồn cuối kỳ
  du_cuoi?: string; // Dư cuối kỳ (giá trị tiền)
  du_cuoi_nt?: string; // Dư cuối kỳ (giá trị ngoại tệ)
  ten_vt?: string; // Tên vật tư
  ShortDescription?: string; // Mô tả ngắn
  dvt?: string; // Đơn vị tính
  tk_vt?: string; // Tài khoản vật tư
  cach_tinh_gia?: string; // Cách tính giá
  ParentID?: string; // ID cha (nếu có)
  ma_nhom?: string; // Mã nhóm
  ten_nhom?: string; // Tên nhóm
}
export interface AutoCompleteOptions {
  key?: string;
  id?: string;
  label: string;
  value: string;
  item: {
    name: string;
    code: string;
    // [16/01/2025][#23123] [phuong_td] thêm data gửi kèm nếu cần
    data?: any;
  };
}

export enum eReviewTypeUpdate {
  SET_COMMENTS = 'SET_COMMENTS',
  SET_LIKES = 'SET_LIKES',
  ADD_COMMENT = 'ADD_COMMENT',
  SET_VIEWS = 'SET_VIEWS',
  ATTACHMENT_LINKS = 'ATTACHMENT_LINKS',
  ATTACHMENT_LINKS_IMAGE = 'ATTACHMENT_LINKS_IMAGE',
  REMOVE_ATTACHMENT_LINKS_IMAGE = 'REMOVE_ATTACHMENT_LINKS_IMAGE',
  ADD_MESSAGE = 'ADD_MESSAGE',
  EDIT_MESSAGE = 'EDIT_MESSAGE',
  DELETE_MESSAGE = 'DELETE_MESSAGE',
}

export interface IReviewMessages {
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
  results: IReviewItem[];
}

export interface IReviewItem {
  id: number;
  categoryId: number;
  senderId: string;
  senderName: string;
  subject: string;
  companyId: number;
  categoryCode: string;
  content: string;
  createdDate: string;
  toIdList: '[]';
  status: number;
  comments: IReviewComment[];
  attachmentLinkReadDTOs: IReviewDrawing[];
  selected: boolean; // added
  countLike: number; // added
  countView: number; // added
}
export interface IReviewDrawing {
  itemId: number;
  drawingId: string;
  fileName: string;
  status: number;
  id: number;
  url?: string;
}

export interface IReviewComment {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  createdDate: string;
  messageId: number;
  parentId: number;
}

// [09/11/2024][#20629][phuong_td] interface ProjectEmployeeDTO
export interface ProjectEmployeeDTO {
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
  projectId: number;
  roles: number[];
  startTime: string; // 2024-11-09T13:46:56.720Z;
  endTime: string; // 2024-11-09T13:46:56.720Z;
  projectName?: string;
}

export enum eStatusRequest {
  success = 'success',
  error = 'error',
}

export enum madvcs {
  THUCHIEN = 'THUCHIEN',
  KEHOACH = 'KEHOACH',
}

export enum eMaterialDocument {
  ALL = 'All',
  RELEASE = 'Release',
  UNRELEASE = 'Unrelease',
}

export enum eSummaryScreen {
  TONGKHO = 'TONGKHO',
  TONGHOPVATTU = 'TONGHOPVATTU',
}

export enum eTypeReview {
  ProjectManagementSuppliers = 'QLDA_NCC',
  SupervisionConsultantsSupplier = 'TVGS_NCC',
  InvestorsProjectManagement = 'CDT_BQLDA',
  InvestorsSupervisionConsultants = 'CDT_TVGS',
  Other = 'OTHER',
}

export interface IEmployeeFee {
  companyId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  amountOrigin?: number;
  amount: number;
  id?: number;
  index?: number;

  //[#20938][hoang_nm][25/11/2024] thêm tham số createtime
  createTime: string;
}

export interface IFeeTableResult {
  results: IEmployeeFee[];
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
}

export enum eTypeDinhMucLuong {
  Team = 0,
  Category = 1,
}

export interface IDinhMucThuong {
  date: string; // định dạng "yyyy-MM-ddTHH:mm:ss"
  teamId: number;
  id: number;
  subject: string;
  categoryId: number;
  laborCountIssue: string; // định mức
  laborCountTeam: string; // công giao
  laborCountComplete: string; // thực tế
  arise?: number; // phát sinh
  type?: eTypeDinhMucLuong;
  children?: any[];
}

export enum RoleEnum {
  Director = 'GiamDoc', // Giám đốc
  Deputy_Director = 'PhoGiamDoc', // Phó giám đốc
  Material_Accountant = 'KeToanVatTu', // Kế toán vật tư
  Contractor = 'DauThauHopDong', // Đấu thầu
  Commander = 'ChiHuyTruong', // Chỉ huy trưởng
  Technician = 'KyThuat', // Kỹ thuật
  Leader = 'ToTruong', // Tổ trưởng
  Timekeeping_Attendance = 'ChamCong', // Chấm công
}

// [18/12/2024][#21174][phuong_td] khai báo enum cho AccoutingKey
export enum eAccoutingKey {
  DongTien = 6,
  SoSachKeToan = 7,
  HoaDonDauVao = 8,
  HoaDonDauRa = 9,
  ChenhLechHoaDon = 10,
  HoaDonX = 11,
  DMDT = 12,
  DoiChieuDinhMuc = 13,
  CongNoNCC_CDT = 14,
  QuyetToanLaiLoCongTrinh = 15,
  TongHopXuatNhapTon = 16,
  CanDoiKeToan = 17,
  TongHopDoanhThu = 18,
}

// [04/01/2025][#21174][phuong_td] tham số cho api getFinance
export interface iQueryParamAccountingManagement {
  /// 
  madvcs?: string,
  tu_ngay?: string,
  den_ngay?: string,
  ma_kho?: string,
  tk_no?: string,
  tk_co?: string,
  Release?: string,
  ma_tai_khoan?: string,
  ma_cong_trinh?: string,
  ma_vu_viec?: string,
  ma_khach_hang?: string,
  ma_khoan_muc?: string,
  otherFilter?: string,
  dau_ky_truoc?: string,
  cuoi_ky_truoc?: string,
}

export interface iSalary {
  STT: number,
  MaNV: string,
  TenNV: string,
  ADPhatLuong: number,
  TienUngNgay: number,
  TongCong: number,
  KyNhan: string,
  Ngay?: Dayjs,
  totalShifts?: number,
  paymentType: number,
}

export interface SalaryPayload {
  employeeCode: string,
  employeeName: string,
  companyId: number,
  period: number,
  total: number,
  signature: string,
  dateTime: string,// 2025-01-10T13:29:07.831Z,
  status: number
  money: number,
  salaryBalance: number,
  paymentType: number,
}

export enum eKyLuong {
  Ky1 = 1,
  Ky2 = 2
}

export enum eSalaryType {
  AdditionalCosts = 1,
  SalaryAdvance = 2
}

export const FormatDateAPI = 'YYYY-MM-DD';
export const FormatDateToConvertGantt = 'DD-MM-YYYY';
export const FormatDate = 'DD/MM/YYYY';
export const DateEmptyString = '0001-01-01T00:00:00';

export const CreateUpdateEmployeeModalName = 'CreateUpdateEmployeeModal';
export const GettingEmployeeList = 'GettingEmployeeList';
export const FeeTableEmployee = 'FeeTableEmployee';
export const getEmployeeDetails = 'getEmployeeDetails';
export const SavingEmployee = 'SavingEmployee';
export const RemovingEmployee = 'RemovingEmployee';

export const GettingProjectStatusList = 'GettingProjectStatusList';
export const SavingProject = 'SavingProject';
export const GettingProjectMembers = 'GettingProjectMembers';

export const CreateUpdateTeamModalName = 'CreateUpdateTeamModal';
export const IsUpdateTeamModal = 'IsUpdateTeamModal';
export const GettingTeams = 'GettingTeams';
export const GettingTeamDetails = 'GettingTeamDetails';
export const SavingTeam = 'SavingTeam';
export const RemovingTeam = 'RemovingTeam';

export const AddMemberToTeamModalName = 'AddMemberToTeamModal';
export const SavingTeamMembers = 'SavingTeamMembers';
export const RemovingMemberFromTeam = 'RemovingMemberFromTeam';

export const AddMemberToProjectModalName = 'AddMemberToProjectModalName';
export const GettingProjectRolesLoadingKey = 'GettingProjectRolesKey';
export const CreateManyProjectMemberLoadingKey = 'CreateManyProjectMemberLoadingKey';
export const EditProjectMemberModalName = 'EditProjectMemberModalName';
export const SavingProjectMemberLoadingKey = 'SavingProjectMemberLoadingKey';

export const CreateUpdateIssueModalName = 'CreateUpdateIssueModal';
export const ShowViewFileModal = 'ShowViewFileModal';
export const ControlStatusPreparationModalName = 'ControlStatusPreparationModal';
export const ControlAssignWorkModalName = 'ControlAssignWorkModal';
export const CreateUpdateWorkWeeklyModalName = 'CreateUpdateWorkWeeklyModal';
export const CreateUpdateInitWorkModalName = 'CreateUpdateInitWorkModal';
export const GettingIssueList = 'GettingIssueeList';
export const SavingIssue = 'SavingIssue';
export const RemovingIssue = 'RemovingIssue';
export const RemovingIssueTeam = 'RemovingIssueTeam';
export const GettingIssueStatusList = 'GettingIssueStatusList';
export const GettingIssueProgressList = 'GettingIssueProgressList';
export const GettingIssueByVersionList = 'GettingIssueByVersionList';
export const getIssueChecklist = 'getIssueChecklist';
export const getIssueChecklistByIssueIds = 'getIssueChecklistByIssueIds';
export const getIssueChecklistsTeamByCheckitemIds = 'getIssueChecklistsTeamByCheckitemIds';
export const getIssueChecklistsByTeamId = 'getIssueChecklistsByTeamId';
export const getCategoryByCompanyIdRequest = 'getCategoryByCompanyIdRequest';
export const getTagByCompanyIdRequest = 'getTagByCompanyIdRequest';
export const UpdateTimekeepingModalName = 'UpdateTimeKeepingModal';
export const getTeamIdsByIssue = 'getTeamIdsByIssue';
export const getTeamIdsByIssueRequest = 'getTeamIdsByIssueRequest';
export const getIssueTeamsByIssueRequest = 'getIssueTeamsByIssueRequest';
export const updateCheckItems = 'updateCheckItems';
export const UpdateStatusIssue = 'UpdateStatusIssue';
export const createIssueTeamRequest = 'createIssueTeamRequest';
export const updateIssueTeams = 'updateIssueTeams';
export const genIssue = 'genIssue';
export const exportGanttToPDF = 'exportGanttToPDF';

export const getDinhMucThuongs = 'getDinhMucThuongs';

export const removeProjectWarehouse = 'removeProjectWarehouse';

export const OtherResourcesDim = {
  updateOtherResourcesDim: 'updateOtherResourcesDim',
  getOtherResourcesDim: 'getOtherResourcesDim',
  getOtherResourcesDimByTracker: 'getOtherResourcesDim',
  addOtherResourcesDimToIssue: 'addOtherResourcesDimToIssue',
  createOtherResourcesDim: 'createOtherResourcesDim',
  removeOtherResourcesDim: 'removeOtherResourcesDim',
};

export const MaterialsDim = {
  updateMaterialsDim: 'updateMaterialsDim',
  getMaterialsDim: 'getMaterialsDim',
  getMaterialsDimByTracker: 'getMaterialsDim',
  addMaterialsDimToIssue: 'addMaterialsDimToIssue',
  createMaterialsDim: 'createMaterialsDim',
  removeMaterialsDim: 'removeMaterialsDim',
};

export const TrackerDim = {
  getTrackerByProject: 'getTrackerByProject',
  getTrackerByCompany: 'getTrackerByCompany',
  createTrackerDim: 'createTrackerDim',
  updateTrackerDim: 'updateTrackerDim',
  removeTrackerDim: 'removeTrackerDim',
};

export const TargetTracker = {
  createTargetTracker: 'createTargetTracker',
  updateTargetTracker: 'updateTargetTracker',
};

export const Quota = {
  createIssueMaterialsQuota: 'createIssueMaterialsQuota',
  createIssue_OtherResourceQuota: 'createIssue_OtherResourceQuota',
};

export const AttributeDim = {
  updateAttributeDim: 'updateAttributeDim',
  getAttributeDim: 'getAttributeDim',
  getAttributeDimByTracker: 'getAttributeDim',
  addAttributeDimToIssue: 'addAttributeDimToIssue',
  createAttributeDim: 'createAttributeDim',
  removeAttributeDim: 'removeAttributeDim',
};

export const LaborDim = {
  updateLaborDim: 'updateLaborDim',
  getLaborDim: 'getLaborDim',
  getLaborDimByTracker: 'getLaborDim',
  addLaborDimToIssue: 'addLaborDimToIssue',
  createLaborDim: 'createLaborDim',
  removeLaborDim: 'removeLaborDim',
};

export const Target = {
  getTargetByCondition: 'getTargetByCondition',
  updateTargetToIssue: 'updateTargetToIssue',
  addTargetToIssue: 'addTargetToIssue',
  createTargetDim: 'createTargetDim',
};

export const IssueRelationship = {
  createRealtionship: 'createRealtionship',
  getParentIssueRelationshipByIssue: 'getParentIssueRelationshipByIssue',
  getChildIssueRelationshipByIssue: 'getChildIssueRelationshipByIssue',
  removeIssueRelationship: 'removeIssueRelationship',
  updateRealtionship: 'updateRealtionship',
  getAllChildIssueRelationShipFromId: 'getAllChildIssueRelationShipFromId',
};

export const IssueCheckItemsTeam = {
  createIssueCheckItemsTeamRequest: 'createIssueCheckItemsTeamRequest',
  getTeamsIdsByCheckItemIdRequest: 'getTeamsIdsByCheckItemId',
  removeCheckitemsTeamRequest: 'removeCheckitemsTeamRequest',
};

export const Issue = {
  GettingIssueByVersionList: 'GettingIssueByVersionList',
  getIssueByParentId: 'getIssueByParentId',
  UpdateReasonForLeaveRequest: 'UpdateReasonForLeaveRequest',
  updateIssueRequest: 'updateIssueRequest',
  createIssueRequest: 'createIssueRequest',
  assignRequest: 'assignRequest',
  attachmentFileUploadRequest: 'attachmentFileUploadRequest',
};

export const MachinerysDim = {
  updateMachinerysDim: 'updateMachinerysDim',
  getMachinerysDim: 'getMachinerysDim',
  getMachinerysDimByTracker: 'getMachinerysDim',
  createMachineryToIssue: 'createMachineryToIssue',
  createMachinerysDim: 'createMachinerysDim',
  removeMachinerysDim: 'removeMachinerysDim',
  getSelectedMachinerys: 'getSelectedMachinerys',
};

export const accountingInvoice = {
  getProducts: 'getProducts',
  getWareHouse: 'getWareHouse',
  getDateFilterOptions: 'getDateFilterOptions',
  GetProductUnit: 'GetProductUnit',
  GetDanhSachThietBi: 'GetDanhSachThietBi',
  GetMoneyTypeList: 'GetMoneyTypeList',
  CreatePhieuNhapXuatKho: 'CreatePhieuNhapXuatKho',
  DeletePhieuNhapXuatKho: 'DeletePhieuNhapXuatKho',
  GetProposalForm: 'GetProposalForm',
  CreateProposalForm: 'CreateProposalForm',
  ConfirmProposalForm: 'ConfirmProposalForm',
  UpdateProposalForm: 'UpdateProposalForm',
  DeleteProposalForm: 'DeleteProposalForm',
  GetDanhSachDuyetChi: 'GetDanhSachDuyetChi',
  GetDanhSachDuyetMuaHang: 'GetDanhSachDuyetMuaHang',
  DeleteDanhSachDuyetMuaHang: 'DeletePhieuNhapXuatKho',
  DuyetChi: 'DuyetChi',
  HuyDuyetChi: 'HuyDuyetChi',
  GetTonKho: 'GetTonKho',
  GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa: 'GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa',
  GetDanhSachBoPhan: 'GetDanhSachBoPhan',
  SplitDeNghiMuaHangTheoNhaCungCap: 'SplitDeNghiMuaHangTheoNhaCungCap',
  GetGiaVaNhaCungCap: 'GetGiaVaNhaCungCap',
  getCustomers: 'getCustomers',
  getBaoCaoXuatNhapTon: 'getBaoCaoXuatNhapTon',
  getBaoCaoXuatNhapTonPdf: 'getBaoCaoXuatNhapTonPdf',
  getBaoCaoChiTietCongNo: 'getBaoCaoChiTietCongNo',
  getBaoCaoSoCaiSoQuy: 'getBaoCaoSoCaiSoQuy',
  getHoaDonVaoRa: 'getHoaDonVaoRa',
  getAdditionalCosts: 'getAdditionalCosts',
  deleteAttachmentLinks: 'deleteAttachmentLinks',
  uploadAttachmentLinks: 'uploadAttachmentLinks',
  getBaoCaoDoanhThuChiPhi: 'getBaoCaoDoanhThuChiPhi',
  getBaoCaoBangCanDoiPhatSinhTaiKhoan: 'getBaoCaoBangCanDoiPhatSinhTaiKhoan',
  DongBoChiPhiPhatSinh: 'DongBoChiPhiPhatSinh',
  getAdditionalCostsByDate: 'getAdditionalCostsByDate',
  getAdditionalCostsByRangeDate: 'getAdditionalCostsByRangeDate',
  GetAccountingMapping: 'GetAccountingMapping',
};

export const documentProject = {
  GettingDocumentList: 'GettingDocumentList',
  DownloadingDocument: 'DownloadingDocument',
  CreateUpdateFolderModalName: 'CreateUpdateFolderModalName',
  SavingLabel: 'SavingLabel',
  RemovingDocument: 'RemovingDocument',
  RemovingDocuments: 'RemovingDocuments',
};
export const labelProject = {
  SavingLabel: 'SavingLabel',
};

export const EmployeeReport = {
  updateEmployeeReport: 'updateEmployeeReport',
  updateEmployeeReportByWeek: 'updateEmployeeReportByWeek',
  CreateEmployeeReports: 'CreateEmployeeReports',
  getEmployeeReport: 'getEmployeeReport',
  getEmployeeReportByWeek: 'getEmployeeReportByWeek',
  getEmployeeReportByIssue: 'getEmployeeReportByIssue',
  getReportsByDateTime: 'getReportsByDateTime',
  getTeamEmployeeReport: 'getTeamEmployeeReport',
  getEmployeeReportByTeam: 'getEmployeeReportByTeam',
};

export const ProjectName = {
  getEmployeeProjects: 'getEmployeeProjects',
};

export const SalaryAdvance = {
  getSalarys: 'getSalarys',
  getSalarysById: 'getSalarysById',
  createSalary: 'createSalary',
  updateSalarys: 'updateSalarys',
  deleteSalarys: 'deleteSalarys',
  exportSalarys: 'exportSalarys',
}

export const dateTimeFormat = 'DD/MM/YYYY HH:mm';
export const timeFormat = 'HH:mm';
export const dateFormat = 'DD/MM/YYYY';
export const apiTimeParamsFormat = 'HHmm';
export const apiDateParamsFormat = 'YYYY-MM-DD';
export const apiDateTimeParamsFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
export const invalidDateStrings = ['0001-01-01T00:00:00'];

export const breakpoints = {
  xs: 360,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export const FileUpLoadName = {
  ThanhToanThauPhu: 'Thanh toán thầu phụ',
  hopdongthauphu: '/projects/subcontractors/subcontract',
  thanhtoanthauphu12: '/projects/subcontractors/pay-the-subcontractor-12',
  thanhtoanthauphu27: '/projects/subcontractors/pay-the-subcontractor-27',
};

export interface SalaryAdvanceRowDTO {
  stt: string,
  employeeCode: string,
  employeeName: string,
  laborCount: number,
  companyId: number,
  period: number,
  money: number,          // tiền ứng 
  total: number,          // tổng cộng
  salaryBalance: number,  // âm dương phát lương
  signature: string,
  dateTime: string,
  status: number,
  paymentType: number,
};

export interface DocumentsTableSalaryRef {
  getRows: () => iSalary[];
}

export enum EPaymentMethod {
  //  0 –  tiền mặt
  //  1 – chuyển khoản
  //  2 – công nợ
  Cash = 0,
  BankTransfer = 1,
  Debt = 2,
}
export const CategoryCodes = {
  'MainMaterial': 'main-material-cost',
  'AuxiliaryMaterial': 'auxiliary-material-cost',
  'Machinery': 'machinery-cost',
  'Incidental': 'incidental-cost',
  'subcontractorAdvance': 'subcontractor-advance',
  'salariesPayment': 'salaries-payment',
}
export const tkNoMap: Record<string, string> = {
  'main-material-cost': '3311',
  'auxiliary-material-cost': '3313',
  'machinery-cost': '3312',
  'incidental-cost': '3314',
};

export const paymentOptions = [
  { label: 'Tiền mặt', value: EPaymentMethod.Cash },
  { label: 'Chuyển khoản', value: EPaymentMethod.BankTransfer },
  { label: 'Công nợ', value: EPaymentMethod.Debt },
];

export interface CreateAcountingInvoiceRequestDTO {
  guid: string;
  id: number;
  createDate: string;
  paymentTermDate: string;
  categoryType: number;
  name: string;
  companyId: number;
  projectCode: string;
  projectId: string;
  projectName: string;
  maKM: string;
  money: number;
  cash: number;
  transfer: number;
  debt: number;
  subContractorCode: string;
  subContractorId: number;
  unit: string;
  createdBy: string;
  employerCode: string;
  employeeName: string;
  createdById: string;
  maDT: string;
  note: string;
  contentCode?: any;
}

// [19/05/2025][#21983][vy_tt]
// Mỗi record sẽ là 1 người trong 1 dự án trong 1 kỳ
export interface EmployeeSalaryStatementDTO {
  kpiValue: number;
  employeeId: number;
  employeeCode: string;
  salaryPolicyId: number;
  salary: number; // thực nhận
  salaryAmount: number; // tiền công
  performanceSalaryAmount: number;
  salaryOT: number; // Lương OT
  salaryMain: number; // Tổng tiền công
  salaryPerWorkHour: number;
  salaryPerWorkLabor: number;
  startDate: string;
  endDate: string;
  projectId: number;
  projectCode: string;
  operatorName: string;
  operatorId: string;
  salaryBalance: number,  // Âm dương phát lương
  salaryBalance_D12: number; // Âm dương phát lương 12
  salaryBalance_D27: number; // Âm dương phát lương 27
  salaryAdvance_D20: number; // Ứng lương 20
  salaryAdvance_D12: number; // Ứng lương 12
  salaryAdvance_D27: number; // Ứng lương 27
  companyId: number;
  unionFund: number; // Quỹ công đoàn
  id: number;
  protectiveGear: number, // Đồ bảo hộ
  supportRepair: number,  // Bảo hành sửa chữa
  employeeSurcharges: EmployeeSalarySurchargesDTO[]; // Phụ cấp
  employeeInsurances: EmployeeSalaryInsurancesDTO[]; // Bảo hiểm
  employeeFunds: EmployeeSalaryFundsDTO[]; // Quỹ công đoàn
  employeeSalaryPolicys: EmployeeSalaryPoliciesDTO[]; // Chính sách
  employeeSalary: EmployeeSalary; // chi tiết về lương
  signed: string;
  // Công 1 công trình: shiftMainTime + shiftOTTime = Tổng công + tăng ca
  shiftMainTime: number;
  shiftMainTimeDic: {
    Ky1: number;
    Ky2: number;
  },
  shiftOTTime: number;
  shiftOTTimeDic: {
    Ky1: number;
    Ky2: number;
  },
  employeeProjectStatements?: EmployeeProjectStatements[]; // Danh sách công trình của nhân viên
}

// Phụ cấp (ăn trưa, đi lại,...)
export interface EmployeeSalarySurchargesDTO {
  periodId: number;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  surchargeId: number;
  surchargeName: string;
  surchargeValue: number;
  employeeSalaryReportId: number;
  id: number;
}

// Bảo hiểm
export interface EmployeeSalaryInsurancesDTO {
  periodId: number;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  insuranceId: number;
  insuranceName: string;
  premium: number;
  companyPremium: number;
  employeeSalaryReportId: number;
  id: number;
}

// Quỹ công đoàn
export interface EmployeeSalaryFundsDTO {
  periodId: number;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  fundId: number;
  fundName: string;
  contribution: number;
  employeeSalaryReportId: number;
  id: number;
}

// Chính sách
export interface EmployeeSalaryPoliciesDTO {
  periodId: number;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  salaryPolicyId: number;
  salaryPolicyName?: string;
  employeeSalaryReportId: number;
  value: number;
  unit: string;
  id: number;
}

// Cột define
export interface EmployeeSalary {
  periodId: number;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  oldSalary: number;
  baseSalary: number;         // Tổng lương
  fixedSalaryAmount: number;  // Lương cơ bản
  fixedSalaryBHXH: number;
  fixedSalaryPercent: number;
  performanceSalaryAmount: number;
  performanceSalaryPercent: number;
  salaryPerWorkHour: number;
  salaryPerWorkLabor: number;
  dependentNumber: number;
  effectiveFrom: string;
  effectiveTo: string;
  type: number;
  status: number;
  periodType: SalaryPeriodTypeDTO;
  id: number;
}

export interface IEmployeeSalariesPayDTO {
  companyId: any;
  /** Tên chi phí */
  contentName: string;

  /** Mã chi phí */
  contentCode: string;

  /** Đơn vị */
  unit: string;

  /** Người tạo */
  createdById: number;
  createdBy: string;

  createDate: string; // DateTime → ISO string

  /** Số tiền */
  amount: number;

  /** Số tiền chuyển khoản */
  transfer: number;

  /** Số lượng */
  quantity: number;

  totalAmount: number;

  /** Ghi chú */
  notes: string;

  /** Thông tin đồng bộ kế toán */
  folioID: string; // Guid

  paymentType: number;

  periodCode: string;
  type: number;
  startDate: string; // ISO Date
  endDate: string;   // ISO Date
}

// Kỳ lương
export interface SalaryPeriodTypeDTO {
  code: string;
  salary: number;
  startDate: string;
  endDate: string;
  companyId: number;
  companyGuid: string;
  employeeSalaries: EmployeeSalaries[];
}

export interface EmployeeSalaries {
  periodId: number;
  periodType: string;
  companyId: number;
  companyGuId: string;
  startDate: string;
  endDate: string;
  createTime: string;
  modifyTime: string;
  employeeId: number;
  employeeCode: string;
  oldSalary: number;
  baseSalary: number;
  fixedSalaryAmount: number;
  fixedSalaryBHXH: number;
  fixedSalaryPercent: number;
  performanceSalaryAmount: number;
  performanceSalaryPercent: number;
  salaryPerWorkHour: number;
  salaryPerWorkLabor: number;
  dependentNumber: number;
  effectiveFrom: string;
  effectiveTo: string;
  type: number;
  status: number;
  PeriodType?: string;
}

export interface EmployeeProjectStatements {
  employeeId: number;
  employeeCode: string;
  projectId: number;
  operatorId: string;
  projectName: string;
  projectCode: string;
  shiftMainTime: number;
  shiftOTTime: number;
  totalShiftTime: number;
  salaryMainShift: number;
  salaryOTShift: number;
  salary: number;
  employeeSalaryStatementId: number;
  id: number;
}

export enum ePeriodCode {
  PERIODCODEDAY5 = 'P-DAY5',
  PERIODCODEDAY20 = 'P-DAY20',
  PERIODCODEBCH = 'P-BCH',
}

// [22/05/2025][#22653][vy_tt]
export interface SubContractorDTO {
  code: string;
  name: string;
  nguoiDaiDien: string;
  giaTriTheoHopDong: number;
  giaTriTheoHopDong_Code: string;
  giaTriUngTruoc: number;
  giaTriUngTruoc_Code: string;
  giaTriLuyKeThucHienDotNay: number;
  giaTriLuyKeThucHienDotNay_Code: string;
  giaTriLuyKeThucHienDotTruoc: number;
  giaTriLuyKeThucHienDotTruoc_Code: string;
  giaTriThanhToanLuyKeDotNay: number;
  giaTriThanhToanLuyKeDotNay_Code: string;
  giaTriTTLanNay: number;
  giaTriTTLanNay_Code: string;
  giaTriConLai: number;
  giaTriConLai_Code: string;
  khoiLuongThanhToan: number;
  khoiLuongThanhToan_Code: string;
  documentId: string;
  labelId: string;
  projectId: number;
  projectCode: string;
  description: string;
  companyId: number;
  paymentTermDate: string;
  paymentTerm: number;
  categoryCode: string;
  titleCategory: string;
  id: number;
  isUpdate: boolean;
}

// [22/05/2025][#22614][vy_tt]
export interface EmployeeSalaryStatementSummaryDTO {
  operatorId: string;
  projectName: string;
  totalSalary: number;
}
// [25/05/2025][#22707][vy_tt]
export interface SetColumnVisibilityPayload {
  tableKey: string;
  visibility: { [columnKey: string]: boolean };
}

export interface ColumnVisibilityState {
  [tableKey: string]:
  { [columnKey: string]: boolean };
}

export interface ToggleColumnPayload {
  tableKey: string;
  columnKey: string;
  visible: boolean;
}

export interface InvoiceXDTO {
  id: number;
  form: string;
  invoiceNumber: number;
  series: number;
  invoiceDate: Dayjs;
  sellerName: string;
  sellerTaxCode: string;
  amountExclTax: number;
  taxAmount: number;
  totalPayment: number;
  chiTietHoaDon: InvoiceXDetailDTO[];
}

export interface InvoiceXDetailDTO {
  id: number;
  nature: string; // Tính chất
  productName: string;  // Tên hàng hoá
  productCode: string;  // Mã hàng hoá
  unit: number; // ĐVT
  quantity: number; // Số lượng
  unitPrice: number; // Đơn giá
  discount: number; // Chiết khấu
  taxRate: number;  // Thuế suất
}