/* eslint-disable import/order */
import { CreateAcountingInvoiceRequestDTO, eMaterialDocument, PhieuDeNghiMuaHangDTO } from '@/common/define';
import { getEnvVars } from '@/environment';
import { Customer } from '@/pages/MachineryMaterials/components/NewMachineryMaterialList/addNcc/addNcc';
import { Dayjs } from 'dayjs';
import { Observable } from 'rxjs';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { accountingInvoiceURL, accountinginvoiceReportURL } = getEnvVars();
const { apiUrl } = getEnvVars();
export interface ProductDTO {
  id: number;
  madvcs: string;
  cach_tinh_gia: number;
  ma_vt: string;
  ten_vt: string;
  dvt: string;
  tk_vt: string;
  tk_gv: string;
  tk_dt: string;
  tk_tl: string;
  tk_spdd: string;
  in_Lookup: boolean;
  guid: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6
  productType: number;
  productType2: number;
  vendor: string;
  manufacturers: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  picture1: string;
  discount: number;
  dvt1: string;
  dvt_TyLeQuyDoi: number;
  createDate: string; //2024-09-13T14:00:11.492Z
}
export interface ThietBiDTO {
  id: number;
  ma_vt: string;
  ten_vt: string;
  madvcs: string;
  tinh_Kh: boolean;
  ngay_Mua: string; //2024-09-13T15:28:13.059Z
  ngay_Kh: string; //2024-09-13T15:28:13.059Z
  ngay_Thoi_Kh: string; //2024-09-13T15:28:13.059Z
  so_Thang_Kh: number;
  ma_Bo_Phan: string;
  tk_Ts: string;
  in_Lookup: boolean;
  ma_Vt: string;
  congCuDungCu: boolean;
  ccdc_So_Luong: number;
  ccdc_Dvt: string;
  chung_Loai: string;
  guid: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6
  createDate: string; //2024-09-13T15:28:13.059Z
  maLoHang: string;
  ghi_Chu: string;
  dvt: string;
}
export interface WareHouseDTO {
  id: number;
  ma_kho: string;
  ten_kho: string;
  dia_Chi: string;
  dien_Thoai: string;
  fax: string;
  ma_Nv: string;
  dien_Giai: string;
  in_Lookup: boolean;
  guid: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6
  createDate: string; //2024-09-13T14:35:57.950Z
}

export interface DateFilterOptionsDTO {
  id: number;
  name: string;
  code: string;
  startDay: number;
  endDay: number;
  startDate: string;
  endDate: string;
  type?: number;
}
export interface ProductUnitDTO {
  id: number;
  dvt: string;
  ten_Dvt: string;
  dvt_Level: number;
  in_Lookup: boolean;
  guid: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
  createDate: string; //2024-09-13T15:28:13.069Z
}

export interface MoneyTypeDTO {
  id: number;
  ma_nt: string;
  ten_nt: string;
  is_nguyen_te: boolean;
  in_Lookup: boolean;
  guid: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6
  createDate: string; //2024-09-13T15:28:13.061Z
}

export interface PhieuNhapXuatKhoDTO {
  id: number;
  del: boolean;
  madvcs: string;
  recId: number;
  ma_ct: string;
  ngay_ct: string; //2024-09-15T02:15:41.638Z
  so_ct: string;
  loai_tt: number;
  han_tt: string; //2024-09-15T02:15:41.638Z
  ma_kh: string;
  ma_bo_phan: string;
  nguoi_tt: string;
  nv_bh: string;
  dia_chi: string;
  dien_giai: string;
  ma_nt: string;
  ty_gia: number;
  info: string;
  is_local: boolean;
  release: boolean;
  moduleName: string;
  createDate: string; //2024-09-15T02:15:41.638Z
  deposite: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  recIdparent: number;
  nguoiDuyet1: string;
  nguoiDuyet2: string;
  nguoiDuyet3: string;
  recIdrelation: number;
  guid: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
  nguoiDuyet4: string;
  nguoiDuyet5: string;
  guidRelation: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
  chiTietHangHoa: ChiTietHangHoaDTO[];
  isNhapKho: boolean;
  hoaDonVAT: HoaDonVATDTO[];
  list_of_extensions: ExtensionDTO[];
}
export interface ChiTietDeNghiMuaHangDTO {
  key?: any;
  name?: any;
  unit?: any;
  id?: number;
  recID?: number;
  ma_vt: string;
  so_luong_yeu_cau: number;
  so_luong_thuc_te: number;
  ma_kh?: string | JSX.Element | undefined;
  gia?: number;
  gia1?: number;
  gia2?: number;
  gia3?: number;
  dien_giai: string;
  ma_kh1?: string;
  ton_kho: number;
  ma_kho: string;
  tien?: number;
  status?: number;
  createDate?: string; // 2024-09-20T14:04:08.540Z
  gia_gan_nhat?: number;
  guid?: string; //3fa85f64-5717-4562-b3fc-2c963f66afa6,
  nhaCungCap1?: string;
  nhaCungCap2?: string;
  nhaCungCap3?: string;
  so_luong_nhap1?: number;
  so_luong_nhap2?: number;
  so_luong_nhap3?: number;
  so_luong_nhap4?: number;
  so_luong_nhap5?: number;
  madvcs?: string;
  ngay_ct?: string; //9/23/2024 12:00:00 AM,
  so_ct?: string;
  ma_bo_phan?: string;
  nguoi_tt?: string;
  dien_giai_Ex?: string;
  ma_nt?: string; //VND,
  ty_gia?: number; //0,
  info?: string; //9/23/2024 10:24:30 PM-From WebAPI,
  Release?: boolean; //False,
  Deposite?: string; //1.0000,
  NguoiDuyet1?: string;
  NguoiDuyet2?: string;
  NguoiDuyet3?: string;
  NguoiDuyet4?: string;
  NguoiDuyet5?: string;
  giaKeHoach?: any;
  soluongconlai?: number;
  ncc_name?: string;
  min?: string;
  nccMin?: string;
  nearest?: string;
  nccNearest?: string;
  luong_xuat?: number;
  xacNhanHangHoa1?: string;
  xacNhanHangHoa2?: string;
  xacNhanHangHoa3?: string;
  ngayXacNhanHangHoa1: string | null;
  ngayXacNhanHangHoa2: string;
  ngayXacNhanHangHoa3: string;
  vatRate?: any;
  tien_thue?: number;
  gia_gom_vat?: number;
  hinhthuc_tt?: number | 0;
}

// file: invoice.dto.ts

export interface ChiTietHangHoaVATDto {
  id: number;
  guid: string;
  parentGuid: string;
  createDate: string;
  recId: number;
  ma_Kho: string;
  ma_Vt: string;
  ten_Vt: string;
  dvt: string;
  ten_Vt1: string;
  dvt1: string;
  don_Gia: number;
  so_Luong: number;
  tien_Dt: number;
  tien_Dt_Nt: number;
  ma_Thue: string;
  phan_Tram_Thue: number;
  tien: number;
  tien_Nt: number;
  note: string;
  phan_Tram_Phi_Dich_Vu: number;
  tien_Phi_Dich_Vu: number;
  phan_Tram_Thue_Ttdb: number;
  tien_Thue_Ttdb: number;
  phan_Tram_Thue_Nhap_Khau: number;
  tien_Thue_Nhap_Khau: number;
  tong_Tien_Truoc_Thue: number;
  tien_Thue: number;
  don_Gia_Nt: number;
  tien_Thue_Nt: number;
  guidRelation: string;
}

export interface InvoiceDto {
  id: number;
  recId: number;
  del: boolean;
  mau_So: string;
  so_Serial: string;
  so_Hd: string;
  ngay_Hd: string;
  ma_Kh: string;
  tk_No: string;
  tk_Co: string;
  tien_Dt: number;
  tien_Dt_Nt: number;
  pt_Thue: string;
  tien: number;
  tien_Nt: number;
  dien_Giai: string;
  so_Hopdong: string;
  ma_Km: string;
  ma_Vv: string;
  ten_Kh1: string;
  ms_Thue1: string;
  dia_Chi1: string;
  hinh_Thuc_Thanh_Toan: string;
  tai_Khoan_Thanh_Toan: string;
  kyHieuMauHoaDon: string;
  createDate: string;
  guid: string;
  folioNo: string;
  roomNo: string;
  guestQuantity: number;
  arrival: string;
  departure: string;
  email1: string;
  nguoi_Giao_Dich: string;
  ngan_Hang1: string;
  so_Tk1: string;
  exchangeDes: string;
  exchangeStatus: string;
  guidRelation: string;
  chiTietHangHoaVAT: ChiTietHangHoaVATDto[];
}


export interface ChiTietHangHoaDTO {
  id?: number;
  recId?: number;
  ma_vt: string;
  ma_kho: string;
  so_luong: number;
  gia?: number;
  tien?: number;
  gia_nt?: number;
  tien_nt?: number;
  dien_giai: string;
  tk_no: string;
  tk_co: string;
  so_hopdong?: string;
  ma_Vv: string;
  ma_Km?: string;
  ma_kho1?: string;
  tinh_gia_von_truc_tiep?: boolean;
  createDate: string; //2024-09-15T02:15:41.638Z
  guid?: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
  guidRelation?: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
}

export interface HoaDonVATDTO {
  folioID: string; // 3fa85f64-5717-4562-b3fc-2c963f66afa6
  so_hoa_don: string;
  mau_hoa_don: string;
  ngay_phat_hanh_hoa_don: string; //2024-09-15T02:15:41.638Z
  ma_doi_tuong: string;
  ma_vu_viec: string;
  tk_VAT_no: string;
  tk_VAT_co: string;
  tien_truoc_thue: number;
  ty_le_thue: number;
  tien_thue: number;
  ghi_chu: string;
}

export interface ExtensionDTO {
  extName: string;
  extValue: string;
  extDescription: string;
}

export interface GetTonKhoDTO {
  madvcs: string;
  danhSachMaHang: string[];
  ngay_kiem_tra: string; // 2024-09-15T02:45:48.186Z
  danhSachMakho: string[];
}

export interface TonKhoDTO {
  ma_vt: string;
  ma_kho: string;
  luong_nhap: number;
  luong_xuat: number;
  luong_ton: number;
}

export interface ProposalFormDTO {
  ma_phieu: string;
  dien_giai: string;
  hang_muc: string;
  ngay_tao: string;
  ngay_hoa_don: string;
  capDuyet: number;
  vat_tu_may_moc: VatTuMayMocDeXuatDTO[];
}

export interface VatTuMayMocDeXuatDTO {
  guid?: string;
  ma: string;
  ten: string;
  dvt: string;
  kl_theo_ke_hoach: string;
  ton_kho_thuc_te: number;
  kl_con_lai: string;
  de_xuat_lan_nay: number;
  ngay_yeu_cau_nhap_ve?: string;
  slTonKhoKhoTong?: string;
  slTonKhoCacKhoConLai?: string;
  ghi_chu: string;
  maKho: string;
  tenKho: string;
  Mavv: string;
  DienGiai: string;
  gia1: string;
  gia2: string;
  gia3: string;
  nhaCungCap1: string;
  nhaCungCap2: string;
  nhaCungCap3: string;
  min?: string;
  nearest?: string;
  nccMin?: string;
  nccNearest?: string;
  hinhthuc_tt?: number;
}
export interface PhieuDieuChuyenDTO {
  madvcs: string;
  ma_ct: string;
  ngay_ct: string; // Định dạng ngày ISO như "2024-09-15T02:15:41.638Z"
  so_ct: string;
  ma_kh: string;
  nguoi_tt: string;
  dien_giai: string;
  ma_nt: string;
  chiTietHangHoa: ChiTietHangHoaDieuChuyenDTO[];
  hoaDonVAT: any[]; // Có thể cần thêm chi tiết nếu cần
  list_of_extensions: any[]; // Có thể cần thêm chi tiết nếu cần
  chiTietDeNghiMuaHang: any[]; // Có thể cần thêm chi tiết nếu cần
  guidRelation?: string;
  ngay_duyet1?: string;
  xuatKhoNgaySauKhiNhapKho?: boolean;
}

export interface DanhSachBoPhanDTO {
  id: number;
  madvcs: string;
  ma_bo_phan: string;
  ten_bo_phan: string;
  guid: string; // '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  createDate: string; // '2024-10-04T16:40:23.599Z';
  in_Lookup: boolean;
}

export interface ChiTietHangHoaDieuChuyenDTO {
  ma_vt: string;
  ma_kho: string;
  so_luong: number;
  gia?: number;
  tien?: number;
  gia_nt?: number;
  tien_nt?: number;
  dien_giai: string;
  ma_kho1: string;
}
export interface DieuchuyenvattuDTO {
  madvcs: string;
  tu_ngay?: string;
  den_ngay?: string; // 2024-09-15T02:45:48.186Z
  ma_kho: string;
}

export interface IBaoCaoXuatNhapTonDTO {
  madvcs: string;
  tu_ngay?: string;
  den_ngay: string; // 2024-09-15T02:45:48.186Z
  ma_kho?: string;
  otherFilter: string;
  tk_no?: string;
  tk_co?: string;
  keyStore?: string;
}

export interface IBaoCaoXuatNhapTonPdfDTO {
  tu_ngay: string;
  den_ngay: string; // 2024-09-15T02:45:48.186Z
  madvcs: string;
  ma_vat_tu?: string;
  ma_kho?: string;
  ma_khoan_muc?: string;
  ma_vu_viec?: string;
  ma_khach_hang?: string;
  otherFilter?: string;
  ReportTemplateRecID?: number;
  tk_no?: string;
  tk_co?: string;
}

export interface IBaoCaoChiTietCongNoDTO {
  ma_tai_khoan: string;
  tu_ngay: string;
  den_ngay: string; // 2024-09-15T02:45:48.186Z
  madvcs: string;
  ma_cong_trinh?: string;
  ma_vu_viec?: string;
  ma_khach_hang?: string;
}

export interface IBaoCaoSoCaiSoQuyDTO {
  tu_ngay: string;
  den_ngay: string; // 2024-09-15T02:45:48.186Z
  madvcs: string;
  ma_tai_khoan?: string;
  ma_cong_trinh?: string;
  ma_vu_viec?: string;
  ma_khach_hang?: string;
  otherFilter?: any;
  ReportTemplateRecID?: number
}

export interface IHoaDonRaVaoDTO {
  GetVATMuaVao?: boolean;
  BaoGomChiTietHangHoa?: boolean;
  ma_tai_khoan?: string;
  tu_ngay: string;
  den_ngay: string; // 2024-09-15T02:45:48.186Z
  madvcs: string;
  ma_cong_trinh?: string;
  ma_vu_viec?: string;
  ma_khach_hang?: string;
}

export interface iBaoCaoBangCanDoiPhatSinhTaiKhoan {
  tu_ngay?: string,
  den_ngay?: string,
  madvcs?: string,
  ma_tai_khoan?: string,
  ma_khoan_muc?: string,
  ma_vu_viec?: string,
  ma_khach_hang?: string,
  otherFilter?: string,
}

export interface iBaoCaoDoanhThuChiPhi {
  madvcs?: string,
  tu_ngay?: string,
  den_ngay?: string,
  dau_ky_truoc?: string;
  cuoi_ky_truoc?: string;
  ma_km?: string,
  ma_vu_viec?: string,
  otherFilter?: string,
}



export interface IAttachmentLinks {
  id: number;
  drawingId: string;
  itemId: number;
  fileName: string;
  selected: boolean;
  imageUrl: string;
}

export interface DataType {
  checkbox: boolean;
  id?: number; // id
  key: string;
  costCode: string; // costCode
  costName: string; // costName
  unit: string; // unit
  createDate: string; // createDate
  amount: string; // amount
  quantity: string; // quantity
  totalAmount: string; // totalAmount
  hinhanh?: string; // urlImage
  payer: string; // payer
  notes: string; // notes
  attachmentLinks: IAttachmentLinks[]; // list urlImage, su dung voi muc dich chua dữ liệu ImageUrl
  projectCode: string,
  projectId: number,
  projectName: string,
  isConfirmByRank1?: boolean,
  userIdRank1?: string,
  userNameRank1?: string,
  dateConfirmByRank1?: string,
  isConfirmByRank2?: boolean,
  userIdRank2?: string,
  userNameRank2?: string,
  dateConfirmByRank2?: string,
  createdById: number,
  createdBy: string,
  payerId: number,
  tkCo: number, // Tài khoản có
  tkNo: number, // Tài khoản nợ
  madvcs: string, // Mã DVCS
  maKM: string, // Mã Khoản mục
  ma_nv?: string, // M
  ncc: string, // Nhà Cung Cấp
  mavc: string, // Mã Vụ Việc
  companyId: number, // mã công ty
  imgs?: string[];
  paymentType?: number,
  groupId?: string,
  folioID?: string,
  isSynchronized?: number,
}

export interface IAdditionalCostUpdateRequest {
  id: number;

  projectId: number;
  companyId: number;
  groupId: string;          // UUID

  projectName: string;
  projectCode: string;

  costName: string;
  costCode: string;
  unit: string;

  amount: number;
  quantity: number;
  transfer: number;
  totalAmount: number;

  payer: string;
  payerId: number;
  notes: string;

  createdById: number;
  createdBy: string;
  createDate: string;       // ISO Date

  // Rank 1 approval
  isConfirmByRank1: boolean;
  userIdRank1: string;
  userNameRank1: string;
  dateConfirmByRank1: string | null;

  // Rank 2 approval
  isConfirmByRank2: boolean;
  userIdRank2: string;
  userNameRank2: string;
  dateConfirmByRank2: string | null;

  // Accounting / ERP fields
  folioID: string;          // UUID
  tkCo: number;
  tkNo: number;
  madvcs: string;
  maKM: string;
  ncc: string;
  mavc: string;

  paymentType: number;
  isSynchronized: number;  // 0 | 1
  errorMess: string;
}

export interface CostDataCreate extends DataType { }

export interface IncidentalData extends DataType { 
  items?: DataType[];
}

export interface IncidentalCostCreate extends DataType {
  // groupId?: string;
}

export interface IncidentalCostByRangeDate {
  projectId: number;
  companyId: number;
  groupId: string;
  projectName: string;
  projectCode: string;
  costName: string;
  costCode: string;
  unit: string;
  createdById: number;
  createdBy: string;
  createDate: string;
  amount: number;
  transfer: number;
  quantity: number;
  totalAmount: number;
  payer: string;
  payerId: number;
  notes: string;
  isConfirmByRank1: true;
  userIdRank1: string;
  userNameRank1: string;
  dateConfirmByRank1: string;
  isConfirmByRank2: true;
  userIdRank2: string;
  userNameRank2: string;
  dateConfirmByRank2: string;
  folioID: string;
  tkCo: number;
  tkNo: number;
  madvcs: string;
  maKM: string;
  ncc: string;
  mavc: string;
  isSynchronized: number;
  errorMess: string;
  paymentType: number;
  id: number;
  attachmentLinks: [];
  da_thanh_toan_chuyen_khoan?: number;
  da_thanh_toan_tien_mat?: number;
}

export interface uploadFileCPPS {
  id: number;
  itemId: number;
  fileName: string;
  drawingId: string;
}

export interface AccountingMappingDTO {
  businessContent: string;
  businessType: number;
  businessContentDetail: string;
  businessContentDetailCode: string;
  accountingDescription: string;
  cashDebitAccount: string;
  cashCreditAccount: string;
  bankDebitAccount: string;
  bankCreditAccount: string;
  stockDebitAccount: string;
  stockCreditAccount: string;
  stockVatDebitAccount: string;
  stockVatCreditAccount: string;
  serviceInvoiceDebitAccount: string;
  serviceInvoiceCreditAccount: string;
  serviceInvoiceVatDebitAccount: string;
  serviceInvoiceVatCreditAccount: string;
  supplierObjectType: string;
  projectCodeType: string;
  sortOrder: number;
  isActive: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
  id: number;
}

export interface AccountingInvoiceRequestDTO {
  // request: {
    madvcs: string;
    ngay_thuc_hien: string;
    ngay_lap_chung_tu: string;
    invoiceAPIType: string;
    ma_ngoai_te: string;
    dien_giai: string;
    chiTietHachToan: ChiTietHachToanDTO[];
    hoaDonVAT: InvoiceDto[];
    list_of_extensions: ExtensionDTO[];
  // }
}

export interface ChiTietHachToanDTO {
  folioID: string;
  ma_doi_tuong: string;
  ma_vu_viec: string;
  ma_khoan_muc: string;
  tk_no: string;
  tk_co: string;
  so_tien: number;
  so_tien_ngoai_te?: number;
  ghi_chu: string;
}

export interface InvoiceXDTO {
  id: number;
  ban_MauSo: string;
  ban_SoHoaDon: string;
  ban_KyHieu: string;
  ban_NgayLap: Dayjs;
  ban_NgayKyPhatHanh: Dayjs;
  ban_TenNguoiBan: string;
  ban_MaSoThue: string;
  ban_DiaChiCongTy: string;
  ban_TaiKhoan: string;
  ban_NganHang: string;
  mua_NguoiMuaHang: string;
  mua_TenNguoiMua: string;
  mua_MaSoThue: string;
  mua_DiaChi: string;
  mua_CCCD: string;
  mua_Email: string;
  hinhThucThanhToan: string;
  maCoQuanThue: string;
  tongTienChuaThue: number;
  tongTienThueGTGT: number;
  tongTienPhi: number;
  tongTienChietKhau: number;
  tongTienThanhToan: number;
  vatInvoiceDetails: InvoiceXDetailDTO[];
}

export interface InvoiceXDetailDTO {
  id: number;
  tinhChat: string;
  maHangHoaDichVu: string;
  tenHangHoaDichVu: string;
  donViTinh: string;
  soLuong: number;
  donGia: number;
  chietKhau: number;
  thueSuat: number;
  thanhTienChuaThueGTGT: number;
}

class AccountingInvoiceController {
  public Get = {
    GetProduct: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetProduct`, options);
    },
    GetWareHouse: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetWareHouse`, options);
    },
    GetDateFilterOptions: (CompanyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/MaterialsDim/getPeridobyCompanyId/${CompanyId}?type=1`, options);
    },
    GetDanhSachPhieuXuatKho: (body?: any) => {
      return HttpClient.get(
        `${accountingInvoiceURL}/api/GetDanhSachPhieuXuatKho?madvcs=${body.madvcs}&tu_ngay=${body.tu_ngay}&den_ngay=${body.den_ngay}&ma_kho=${body.ma_kho}`,
      );
    },
    GetProductUnit: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetProductUnit`, options);
    },
    GetDanhSachThietBi: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachThietBi`, options);
    },
    GetMoneyTypeList: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetMoneyTypeList`, options);
    },
    GetProposalForm: (options?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachPhieuDeNghiMuaHang`, options);
    },
    GetDanhSachDuyetChi: (options?: RequestOptions) => {
      // CapDuyet, madvcs, tu_ngay, den_ngay
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachDuyetChi`, options);
    },
    GetDanhSachDuyetMuaHang: (options?: RequestOptions): Observable<string> => {
      // madvcs, ngay_de_nghi
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachPhieuDeNghiMuaHang`, options);
    },
    GetMaterialApprovalNotifications: (options?: RequestOptions): Observable<any> => {
      return HttpClient.get(`${apiUrl}/api/MaterialApprovalNotification/purchase-proposals`, options);
    },
    GetAccountingMapping: (type: number, options?: RequestOptions): Observable<AccountingMappingDTO[]> => {
      // Lấy danh sách AccountingMapping theo loại nghiệp vụ
      return HttpClient.get(`${apiUrl}/AccountingMapping?type=${type}`, options);
    },
    GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa: (options?: RequestOptions) => {
      // madvcs, ngay_de_nghi
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa`, options);
    },
    GetDanhSachBoPhan: (options?: RequestOptions) => {
      // madvcs, ngay_de_nghi
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachBoPhan`, options);
    },
    getCustomer: (option?: RequestOptions) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetCustomer`, option);
    },
    getPhieuNhapKhoTuDeNghiMuaHang: (guid: string) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/GetPhieuNhapKhoTuDeNghiMuaHang?guid=${guid}`);
    },
    GetDanhSachPhieuNhapKho: (
      options?: RequestOptions,
      p0?: { madvcs: string; tu_ngay: string; den_ngay: string; ma_kho: string },
    ) => {
      return HttpClient.get(`${accountingInvoiceURL}/api/BaoCaoDanhSachPhieuDeNghiMuaHang`, options);
    },
    GetBaoCaoChiTietNhapXuatVatTu: (options?: any) => {
      return HttpClient.get(`${accountinginvoiceReportURL}/BaoCaoChiTietNhapXuatVatTu`, options);
    },
    GetBaoCaoSoCaiSoQuyNew: (data: IBaoCaoSoCaiSoQuyDTO, options?: RequestOptions) => {
      let url = `BaoCaoSoCaiSoQuy?tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_tai_khoan) {
        url += `&ma_tai_khoan=${data.ma_tai_khoan}`;
      }
      if (data?.ma_cong_trinh) {
        url += `&ma_cong_trinh=${data.ma_cong_trinh}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vu_viec=${data.ma_vu_viec}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      url += `&ReportTemplateRecID=515`;
      console.log(url);
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, options);
    },
    BaoCaoBangKeThueMuaVaoBanRa: (data: IHoaDonRaVaoDTO, options?: RequestOptions) => {
      // [#21192][hao_lt][07/01/2025]- API lấy báo cáo bảng kê thuế mua vào bán ra
      let url = `BaoCaoBangKeThueMuaVaoBanRa?GetVATMuaVao=${data.GetVATMuaVao}&BaoGomChiTietHangHoa=${data.BaoGomChiTietHangHoa}&tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_tai_khoan) {
        url += `&ma_tai_khoan=${data?.ma_tai_khoan}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      url += `&ReportTemplateRecID=0`;
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, options);
    },
    getBaoCaoChiTietCongNo: (data: IBaoCaoChiTietCongNoDTO, options?: RequestOptions) => {
      let url = `BaoCaoChiTietCongNo?ma_tai_khoan=${data.ma_tai_khoan}&tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_cong_trinh) {
        url += `&ma_cong_trinh=${data.ma_cong_trinh}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vu_viec=${data.ma_vu_viec}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      url += `&ReportTemplateRecID=360`;
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, options);
    },
    BaoCaoBangCanDoiPhatSinhTaiKhoan: (data: iBaoCaoBangCanDoiPhatSinhTaiKhoan, option?: RequestOptions) => {
      let url = `BaoCaoBangCanDoiPhatSinhTaiKhoan?tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_tai_khoan) {
        url += `&ma_tai_khoan=${data.ma_tai_khoan}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vu_viec=${data.ma_vu_viec}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      url += `&ReportTemplateRecID=132`;
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, option);
    },
    BaoCaoDanhThu: (data: iBaoCaoDoanhThuChiPhi, option?: RequestOptions) => {
      console.log(data, '-------------')
      let url = `BaoCaoDoanhThuChiPhi?tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.dau_ky_truoc) {
        url += `&dau_ky_truoc=${data.dau_ky_truoc}`;
      }
      if (data?.cuoi_ky_truoc) {
        url += `&cuoi_ky_truoc=${data.cuoi_ky_truoc}`;
      }
      if (data?.ma_km) {
        url += `&ma_km=${data.ma_km}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vv=${data.ma_vu_viec}`;
      }
      url += `&ReportTemplateRecID=593`;
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, option);
    },
    getBaoCaoXuatNhapTonPdf: (data: IBaoCaoXuatNhapTonPdfDTO, options?: RequestOptions) => {
      // [#20686][dung_lt][31/10/2024] - sửa lại url khi không nhập tk_no và tk_co
      // sửa lại cách thức truyền lựa chọn chứng từ từ otherFilter = (All, Release, Unrelease)
      // => Release = (0,1) hoặc bỏ qua
      const params: string[] = [];
      if (data.tu_ngay) params.push(`tu_ngay=${data.tu_ngay}`);
      if (data.den_ngay) params.push(`den_ngay=${data.den_ngay}`);
      if (data.madvcs) params.push(`madvcs=${data.madvcs}`);
      if (data.ma_vat_tu) params.push(`ma_vat_tu=${data.ma_vat_tu}`);
      if (data.ma_kho) params.push(`ma_kho=${data.ma_kho}`);
      if (data.ma_khoan_muc) params.push(`ma_khoan_muc=${data.ma_khoan_muc}`);
      if (data.ma_vu_viec) params.push(`ma_vu_viec=${data.ma_vu_viec}`);
      if (data.ma_khach_hang) params.push(`ma_khach_hang=${data.ma_khach_hang}`);
      if (data.otherFilter === eMaterialDocument.RELEASE) params.push('Release=1');
      else if (data.otherFilter === eMaterialDocument.UNRELEASE) params.push('Release=0');
      // luôn cần ReportTemplateRecID
      params.push('ReportTemplateRecID=482');

      const url = `BaoCaoNhapXuatTon?${params.join('&')}`;
      return HttpClient.get(`${accountinginvoiceReportURL}/${url}`, options);
    },

    // [#22824][03/06/2025][vy_tt] - get invoiceX by id
    getInvoiceXById: (id: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/VATInvoice/${id}`, options);
    },

    getInvoicesX: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/VATInvoice`, options);
    }
  };

  public Post = {
    createFileCPPS: (itemId: number, dataImage: FormData, options?: RequestOptions) => {
      //tạo file ảnh upload
      return HttpClient.post(
        `${apiUrl}/AdditionAttachmentLink/uploadAttachmentFile?itemId=${itemId}`,
        dataImage,
        options,
      );
    },
    CreateAdditionalCost: (input: CostDataCreate, options?: RequestOptions) => {
      //tạo chi hpis phát sinh mới
      return HttpClient.post(`${apiUrl}/AdditionalCost`, input, options);
    },
    CreateIncidentalCost: (input: IncidentalCostCreate[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/AdditionalCost/creates`, input, options);
    },
    CreatePhieuNhapXuatKho: (input: PhieuNhapXuatKhoDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreatePhieuNhapXuatKho`, input, options);
    },
    CreateProposalForm: (input: PhieuDeNghiMuaHangDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreditPhieuDeNghiMuaHang`, input, options);
    },
    GetDanhSachDieuChuyenHangHoaVatTu: (
      madvcs: string,
      tu_ngay: string,
      den_ngay: string,
      ma_kho: string,
      options?: RequestOptions,
    ) => {
      return HttpClient.post(
        `${accountingInvoiceURL}/api/GetDanhSachDieuChuyenHangHoaVatTu?madvcs=${madvcs}&tu_ngay=${tu_ngay}&den_ngay=${den_ngay}&ma_kho=${ma_kho}`,
        options,
      );
    },
    CreatePhieuDieuChuyen: (input: PhieuDieuChuyenDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreditPhieu_Nhap_Xuat_DieuChuyenKho`, input, options);
    },
    DuyetChi: (data: number[], options?: RequestOptions) => {
      // number[]
      return HttpClient.post(`${accountingInvoiceURL}/api/DuyetChi`, data, options);
    },
    HuyDuyetChi: (data: number[], options?: RequestOptions) => {
      // number[]
      return HttpClient.post(`${accountingInvoiceURL}/api/HuyDuyetChi`, data, options);
    },
    GetTonKho: (data: GetTonKhoDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/GetTonKho`, data, options);
    },
    GetGiaVaNhaCungCap: (data: GetTonKhoDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/GetGiaMoiNhat_NhaCungCapGanNhat`, data, options);
    },
    DeletePhieuNhapXuatKho: (ids: number[], options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/DeletePhieuNhapXuatKho`, ids, options);
    },
    DeleteProposalForm: (ids: string[], options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/DeletePhieuDeNghiMuaHang`, ids, options);
    },
    DeletePhieuDeNghiMuaHang: (ids: string[], options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/DeletePhieuDeNghiMuaHang`, ids, options);
    },
    SplitDeNghiMuaHangTheoNhaCungCap: (guid: string) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/SplitDeNghiMuaHangTheoNhaCungCap?guid=${guid}`);
    },

    getBaoCaoXuatNhapTon: (data: IBaoCaoXuatNhapTonDTO, options?: RequestOptions) => {
      const queryParams: string[] = [];

      if (data.madvcs) queryParams.push(`madvcs=${data.madvcs}`);
      if (data.tu_ngay) queryParams.push(`tu_ngay=${data.tu_ngay}`);
      if (data.den_ngay) queryParams.push(`den_ngay=${data.den_ngay}`);
      if (data.ma_kho && data.keyStore !== 'slTonKhoCacKhoConLai') queryParams.push(`ma_kho=${data.ma_kho}`);
      if (data.tk_no) queryParams.push(`tk_no=${data.tk_no}`);
      if (data.tk_co) queryParams.push(`tk_co=${data.tk_co}`);

      if (data.otherFilter === eMaterialDocument.RELEASE) {
        queryParams.push(`Release=1`);
      } else if (data.otherFilter === eMaterialDocument.UNRELEASE) {
        queryParams.push(`Release=0`);
      }
      if (data.otherFilter === 'slTonKhoKhoTong') {
        const filter = `and ma_kho not in ('${data?.ma_kho}')`;
        queryParams.push(`otherFilter=${encodeURIComponent(filter)}`);
      }
      if (data?.keyStore === 'slTonKhoKhoTong') {
        const filter = `and ma_vt in (${data.otherFilter})`;
        queryParams.push(`otherFilter=${encodeURIComponent(filter)}`);
      }
      if (data?.keyStore === 'slTonKhoCacKhoConLai') {
        const filter = `and ma_kho not in (${data.ma_kho}) and ma_vt in (${data.otherFilter})`;
        queryParams.push(`otherFilter=${encodeURIComponent(filter)}`);
      }
      const url = `BaoCaoNhapXuatTon?${queryParams.join('&')}`;
      return HttpClient.post(`${accountingInvoiceURL}/api/${url}`, options);
    },
    //[20433] [ngoc_td] redux add new customer
    newCustomer: (input: Customer[], option?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreditCustomer`, input, option);
    },
    updateChungTu: (data: any[], options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/UpdateChungTu`, data, options);
    },
    BaoCaoDanhThu: (
      // tu_ngay: string,
      // den_ngay: string,
      // ma_cong_trinh: string,
      // ma_vu_viec: string,
      // ma_khach_hang: string,
      // &ma_cong_trinh=${ma_cong_trinh}&ma_vu_viec=${ma_vu_viec}&den_ngay=${ma_khach_hang}
      option?: RequestOptions,
    ) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/BaoCaoDoanhThuChiPhi`, undefined, option);
    },
    // [12/01/2024][#21278][phuong_td] Cân đối kế toán
    BaoCaoBangCanDoiPhatSinhTaiKhoan: (
      // tu_ngay?: string,
      // den_ngay?: string,
      // madvcs?: string,
      // ma_tai_khoan?: string,
      // ma_khoan_muc?: string,
      // ma_vu_viec?: string,
      // ma_khach_hang?: string,
      // otherFilter?: string,
      option?: RequestOptions,
    ) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/BaoCaoBangCanDoiPhatSinhTaiKhoan`, undefined, option);
    },
    getGiaXuatGanNhat: (body: any) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/GetGiaXuatGanNhat`, body);
    },
    getBaoCaoChiTietCongNo: (data: IBaoCaoChiTietCongNoDTO, options?: RequestOptions) => {
      // [#21175][dung_lt][19/12/2024]- API lấy báo cáo chi tiết công nợ
      let url = `BaoCaoChiTietCongNo?ma_tai_khoan=${data.ma_tai_khoan}&tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_cong_trinh) {
        url += `&ma_cong_trinh=${data.ma_cong_trinh}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vu_viec=${data.ma_vu_viec}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      return HttpClient.post(`${accountingInvoiceURL}/api/${url}`, options);
    },
    getBaoCaoSoCaiSoQuy: (data: IBaoCaoSoCaiSoQuyDTO, options?: RequestOptions) => {
      // [#21241][dung_lt][04/01/2025]- API lấy báo cáo sổ cái sổ quý
      let url = `BaoCaoSoCaiSoQuy?tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_tai_khoan) {
        url += `&ma_tai_khoan=${data.ma_tai_khoan}`;
      }
      if (data?.ma_cong_trinh) {
        url += `&ma_cong_trinh=${data.ma_cong_trinh}`;
      }
      if (data?.ma_vu_viec) {
        url += `&ma_vu_viec=${data.ma_vu_viec}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      return HttpClient.post(`${accountingInvoiceURL}/api/${url}`, options);
    },
    BaoCaoBangKeThueMuaVaoBanRa: (data: IHoaDonRaVaoDTO, options?: RequestOptions) => {
      // [#21192][hao_lt][07/01/2025]- API lấy báo cáo bảng kê thuế mua vào bán ra
      let url = `BaoCaoBangKeThueMuaVaoBanRa?GetVATMuaVao=${data.GetVATMuaVao}&BaoGomChiTietHangHoa=${data.BaoGomChiTietHangHoa}&tu_ngay=${data.tu_ngay}&den_ngay=${data.den_ngay}&madvcs=${data.madvcs}`;
      if (data?.ma_tai_khoan) {
        url += `&ma_tai_khoan=${data.ma_tai_khoan}`;
      }
      if (data?.ma_khach_hang) {
        url += `&ma_khach_hang=${data.ma_khach_hang}`;
      }
      return HttpClient.post(`${accountingInvoiceURL}/api/${url}`, options);
    },
    DongBoChiPhiPhatSinh: (companyId: number, options?: RequestOptions) => {
      // [21/01/2025][#21369][phuong_td] điều chỉnh tham số khi gọi api đồng bộ
      // https://sit.cxm.hicas.vn/AdditionalCost/synchronizedAction?businessDate=2025-01-01
      return HttpClient.post(`${apiUrl}/AdditionalCost/synchronizedAction/${companyId}`, undefined, options);
    },

    // [#22189][16/05/2025][vy_tt] - API gửi dữ liệu sang kế toán để tạo chứng từ kế toán
    CreateAccountingInvoice: (data: AccountingInvoiceRequestDTO, options?: RequestOptions) => {
      return HttpClient.post(`${accountingInvoiceURL}/api/CreateAcountingInvoice`, data, options);
    },

    // [#22824][03/06/2025][vy_tt] - API tạo mới hoá đơn X
    CreateInvoiceX: (data: InvoiceXDTO, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/VATInvoice`, data, options);
    },
    CreateAcountingInvoice: (data: CreateAcountingInvoiceRequestDTO[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/AccountingMapping/createAcountingInvoice`, data, options);
    },
  };

  public Put = {
    UpdateAdditionalCost: (id: number, input: CostDataCreate, options?: RequestOptions) => {
      //update chi phí phát sinh mới
      return HttpClient.put(`${apiUrl}/AdditionalCost/${id}`, input, options);
    },
    UpdateAdditionalCosts: (input: CostDataCreate[], options?: RequestOptions) => {
      // https://sit.cxm.hicas.vn/AdditionalCost/updates
      // update chi phí phát sinh
      return HttpClient.put(`${apiUrl}/AdditionalCost/updates`, input, options);
    },
    UpdateBeforeAccouttings: (input: IAdditionalCostUpdateRequest[], options?: RequestOptions) => {
      // update chi phí phát sinh trước khi hạch toán
      return HttpClient.put(`${apiUrl}/AdditionalCost/updateBeforeAccouttings`, input, options);
    },
    UpdateProposalForm: (id: number, input: ProposalFormDTO, options?: RequestOptions) => {
      return HttpClient.put(`${accountingInvoiceURL}/api/ProposalForm/${id}`, input, options);
    },

    // [#22824][03/06/2025][vy_tt] - Cập nhật hoá đơn X
    UpdateInvoiceX: (id: number, input: InvoiceXDTO, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/VATInvoice/${id}`, input, options);
    }
  };

  public Delete = {
    DeleteImage: (itemId: number, drawingIds: string[], options?: RequestOptions) => {
      //xóa ảnh
      console.log('drawingIds service', drawingIds);
      return HttpClient.delete(
        `${apiUrl}/AdditionAttachmentLink/deleteAttachmentFiles?itemId=${itemId}`,
        options,
        drawingIds, // truyền drawingIds vào sau body là được
      );
    },
    DeleteAdditionalCost: (id: number, options?: RequestOptions) => {
      //xóa chi phí phát sinh
      return HttpClient.delete(`${apiUrl}/AdditionalCost/${id}`, options);
    },
    // DeleteProposalForm: (id: number[], options?: RequestOptions) => {
    //   return HttpClient.delete(`${accountingInvoiceURL}api/DeletePhieuDeNghiMuaHang${id}`, options);
    // },

    // [#22824][03/06/2025][vy_tt] - Xoá hoá đơn X
    DeleteInvoiceXByIds: (body: number[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/VATInvoice`, options, body);
    }
  };
}

export const AccountingInvoiceService = new AccountingInvoiceController();
