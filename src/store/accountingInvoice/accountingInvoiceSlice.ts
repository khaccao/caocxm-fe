/* eslint-disable import/order */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { CreateAcountingInvoiceRequestDTO, eStatusRequest, eTypeDieuChuyen, IBaoCaoCongNoVaSoCaiSoQuyData, IBaoXuatNhapTonData, PhieuDeNghiMuaHangDTO } from '@/common/define';
import { ImportGood } from '@/pages/MachineryMaterials/components/ImportGoods/ImportGoods';
import { Customer } from '@/pages/MachineryMaterials/components/NewMachineryMaterialList/addNcc/addNcc';
import { ProposalData } from '@/pages/MachineryMaterials/components/ProposalHistory';
import {
  AccountingInvoiceRequestDTO,
  AccountingMappingDTO,
  ChiTietDeNghiMuaHangDTO,
  CostDataCreate,
  DanhSachBoPhanDTO,
  DataType,
  DateFilterOptionsDTO,
  GetTonKhoDTO,
  IAdditionalCostUpdateRequest,
  IAttachmentLinks,
  iBaoCaoBangCanDoiPhatSinhTaiKhoan,
  IBaoCaoChiTietCongNoDTO,
  iBaoCaoDoanhThuChiPhi,
  IBaoCaoSoCaiSoQuyDTO,
  IBaoCaoXuatNhapTonDTO,
  IBaoCaoXuatNhapTonPdfDTO,
  IHoaDonRaVaoDTO,
  IncidentalCostByRangeDate,
  IncidentalCostCreate,
  IncidentalData,
  InvoiceXDTO,
  MoneyTypeDTO,
  PhieuDieuChuyenDTO,
  PhieuNhapXuatKhoDTO,
  ProductDTO,
  ProductUnitDTO,
  ProposalFormDTO,
  ThietBiDTO,
  TonKhoDTO,
  uploadFileCPPS,
  WareHouseDTO,
} from '@/services/AccountingInvoiceService';

interface AccountingInvoiceState {
  products: ProductDTO[];
  wareHouses: WareHouseDTO[];
  dateFilterOptions: DateFilterOptionsDTO[];
  productUnits: ProductUnitDTO[];
  machineries: ThietBiDTO[];
  moneyTypes: MoneyTypeDTO[];
  danhSachDuyetChi: PhieuNhapXuatKhoDTO[];
  danhSachDuyetMuaHang: ProposalData[];
  accountingMapping: AccountingMappingDTO[];
  Tonkho: TonKhoDTO[];
  TonkhobyProduct: TonKhoDTO[];
  KLdinhmuc: TonKhoDTO[];
  TonKhoTheoNgay: TonKhoDTO[];
  proposalForms: PhieuDeNghiMuaHangDTO[];
  ChiTietHangHoa: ChiTietDeNghiMuaHangDTO[];
  proposalFormSelected?: PhieuDeNghiMuaHangDTO;
  DuyetData?: PhieuDeNghiMuaHangDTO;
  query_danhSachDuyetChi?: any;
  query_danhSachDuyetMuaHang?: any;
  cap_Duyet: any;
  dateRanges: { startDate: string | null; endDate: string | null } | null;
  dateTransfers: { startDate: string | null; endDate: string | null } | null;
  statusRequest?: { api: string; status: eStatusRequest };
  phieuChuyenVatTu: PhieuDieuChuyenDTO[];
  selectedProposal: ProposalData | null;
  selectedIncidental: IncidentalData | null;
  Dieuchuyenvattu: any;
  updateTransfer: any[];
  clearData?: string;
  DanhSachBoPhan?: DanhSachBoPhanDTO[];
  baoCaoXuatNhapTon?: IBaoXuatNhapTonData[];
  baoCaoXuatNhapTonSLTonKhoKhoTong?: IBaoXuatNhapTonData[];
  baoCaoXuatNhapTonSLTonKhoCacKhoConLai?: IBaoXuatNhapTonData[];
  baoCaoXuatNhapTonPdf?: any;
  baoCaoChiTietCongNo?: IBaoCaoCongNoVaSoCaiSoQuyData;
  baoCaoSoCaiSoQuy?: IBaoCaoCongNoVaSoCaiSoQuyData;
  priceAndNcc: any[];
  customers: Customer[];
  AdditionalCosts: CostDataCreate[];
  AdditionalCostsByDate: CostDataCreate[];
  AdditionalCostAll: CostDataCreate[];
  createAdditionalCostData: CostDataCreate[];
  createIncidentalCostData: IncidentalCostCreate[];
  dataAttachmentLinks: IAttachmentLinks[]; // chua thong tin IAttachmentLinks, thông tin ImageUrl la chinh
  dataImage?: FormData;
  createFileCPPS: uploadFileCPPS[];
  createAdditionalCostDataLast: {
    dataCreateLast: any | null;
  };
  createIncidentalCostDataLast: {
    dataIncidentalCostCreateLast: any | null;
  };
  baoCaoDanhThuChiPhi?: any | null;
  baoCaoBangKeThueMuaVaoBanRa?: any | null;
  createImage: any;
  GiaXuatGanNhat: any;
  DanhSachPhieuXuatKho: any;
  danhSachNhapKho: any[];
  baoCaoBangCanDoiPhatSinhTaiKhoan: any[];
  getProposalToken: boolean;
  typeDieuChuyen: eTypeDieuChuyen;
  pdfDataUriNhapXuat: string;
  createAccountingInvoiceData?: any;
  createAccountingInvoiceError?: string;
  multipleImage: any[];
  AdditionalCostsByRangeDate: IncidentalCostByRangeDate[];
  createInvoiceXData: InvoiceXDTO;
  createInvoiceXError?: string;
  invoiceXError?: string;
  invoiceList: any;
  currentInvoiceX?: InvoiceXDTO;
  invoiceError?: string;
  deleteInvoiceXError?: string;
}

const initialState: AccountingInvoiceState = {
  dateFilterOptions: [],
  createIncidentalCostDataLast: {
    dataIncidentalCostCreateLast: null,
  },
  createAdditionalCostDataLast: {
    dataCreateLast: null,
  },
  createImage: undefined,
  createFileCPPS: [],
  dataImage: undefined,
  products: [],
  wareHouses: [],
  productUnits: [],
  machineries: [],
  moneyTypes: [],
  phieuChuyenVatTu: [],
  Dieuchuyenvattu: {},
  danhSachDuyetChi: [],
  danhSachDuyetMuaHang: [],
  Tonkho: [],
  KLdinhmuc: [],
  TonKhoTheoNgay: [],
  updateTransfer: [],
  query_danhSachDuyetChi: undefined,
  query_danhSachDuyetMuaHang: undefined,
  cap_Duyet: 2,
  proposalForms: [],
  dateRanges: { startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD') },
  dateTransfers: { startDate: dayjs().startOf('month').format('YYYY-MM-DD'), endDate: dayjs().endOf('month').format('YYYY-MM-DD') },
  ChiTietHangHoa: [],
  DuyetData: undefined,
  priceAndNcc: [],
  customers: [],
  AdditionalCosts: [],
  AdditionalCostsByDate: [],
  AdditionalCostAll: [],
  createAdditionalCostData: [],
  createIncidentalCostData: [],
  dataAttachmentLinks: [],
  selectedProposal: null,
  selectedIncidental: null,
  GiaXuatGanNhat: undefined,
  DanhSachPhieuXuatKho: undefined,
  danhSachNhapKho: [],
  baoCaoBangCanDoiPhatSinhTaiKhoan: [],
  getProposalToken: false,
  TonkhobyProduct: [],
  typeDieuChuyen: eTypeDieuChuyen.VatTuChinh,
  pdfDataUriNhapXuat: '',
  createAccountingInvoiceData: undefined,
  createAccountingInvoiceError: undefined,
  multipleImage: [],
  AdditionalCostsByRangeDate: [],
  createInvoiceXData: {} as InvoiceXDTO,
  createInvoiceXError: undefined,
  invoiceXError: undefined,
  invoiceList: undefined,
  currentInvoiceX: {} as InvoiceXDTO,
  invoiceError: undefined,
  deleteInvoiceXError: undefined,
  accountingMapping: [],
};
const accountingInvoiceSlice = createSlice({
  name: 'accountingInvoice',
  initialState,
  reducers: {
    // Set
    CreatePhieuDieuChuyen: (state: AccountingInvoiceState, action: PayloadAction<{ data: PhieuDieuChuyenDTO, wh: string }>) => { },
    CreatePhieuNhapKho: (state: AccountingInvoiceState, action: PayloadAction<{ data: ImportGood, files: any[], id: any }>) => { },
    CreatePhieuXuatKho: (state: AccountingInvoiceState, action: PayloadAction<{ data: PhieuDieuChuyenDTO }>) => { },
    CreatePhieuNhapKhodc: (state: AccountingInvoiceState, action: PayloadAction<{ data: PhieuDieuChuyenDTO }>) => { },
    CreatePhieuDieuChuyenSuccess: (state: AccountingInvoiceState, action) => {
      state.phieuChuyenVatTu = action.payload;
    },
    setTypeDieuChuyen: (state: AccountingInvoiceState, action: PayloadAction<eTypeDieuChuyen>) => {
      state.typeDieuChuyen = action.payload;
    },
    setUpdateTransfer: (state: AccountingInvoiceState, action: PayloadAction<any[]>) => {
      state.updateTransfer = action.payload;
    },
    GetDieuChuyenVatTu: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ madvcs: string; tu_ngay: string; den_ngay: string; ma_kho: string }>,
    ) => { },
    setDieuchuyenvattu: (state: AccountingInvoiceState, action: any) => {
      state.Dieuchuyenvattu = action.payload;
    },
    setClearData: (state: AccountingInvoiceState, action: PayloadAction<string>) => {
      state.clearData = action.payload;
    },
    SetProducts: (state: AccountingInvoiceState, action: any) => {
      state.products = action.payload;
    },
    // [19/10/2024][#20433][ngoc_td] add redux lấy setCustomers
    setCustomers: (state: AccountingInvoiceState, action: any) => {
      state.customers = action.payload;
    },
    SetDanhSachBoPhan: (state: AccountingInvoiceState, action: any) => {
      state.DanhSachBoPhan = action.payload;
    },
    SetWareHouse: (state: AccountingInvoiceState, action: any) => {
      state.wareHouses = action.payload;
    },
    SetDateFilterOptions: (state: AccountingInvoiceState, action: PayloadAction<DateFilterOptionsDTO[]>) => {
      state.dateFilterOptions = action.payload;
    },
    setProductUnits: (state: AccountingInvoiceState, action: any) => {
      state.productUnits = action.payload;
    },
    setMachineries: (state: AccountingInvoiceState, action: any) => {
      state.machineries = action.payload;
    },
    setMoneyTypes: (state: AccountingInvoiceState, action: any) => {
      state.moneyTypes = action.payload;
    },
    setDanhSachDuyetChi: (state: AccountingInvoiceState, action: any) => {
      state.danhSachDuyetChi = action.payload;
    },
    setDanhSachDuyetMuaHang: (state: AccountingInvoiceState, action: any) => {

      state.danhSachDuyetMuaHang = action.payload;
    },
    setAccountingMapping: (state: AccountingInvoiceState, action: PayloadAction<AccountingMappingDTO[]>) => {
      state.accountingMapping = action.payload;
    },
    setDuyetMuaHang: (state: AccountingInvoiceState, action: any) => {
      state.DuyetData = action.payload;
    },
    setTonkho: (state: AccountingInvoiceState, action: any) => {
      state.Tonkho = action.payload;
    },
    setTonkhoByProduct: (state: AccountingInvoiceState, action: any) => {
      state.TonkhobyProduct = action.payload;
    },
    setKLdinhmuc: (state: AccountingInvoiceState, action: any) => {
      state.KLdinhmuc = action.payload;
    },
    setTonKhoTheoNgay: (state: AccountingInvoiceState, action: any) => {
      state.TonKhoTheoNgay = action.payload;
    },
    setProposalForms: (state: AccountingInvoiceState, action: any) => {
      state.proposalForms = action.payload;
    },
    setChiTietHangHoa: (state: AccountingInvoiceState, action: any) => {
      state.ChiTietHangHoa = action.payload;
    },
    setProposalFormSelected: (state: AccountingInvoiceState, action: any) => {
      state.proposalFormSelected = action.payload;
    },
    // [15/10/2024][#20413][ngoc_td] add redux lấy giá & ncc
    setPriceAndNcc: (state: AccountingInvoiceState, action: any) => {
      state.priceAndNcc = action.payload;
    },
    // Get
    GetProducts: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { productCode?: string; productName?: string } }>,
    ) => { },
    GetDanhSachBoPhan: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { productCode?: string; productName?: string } }>,
    ) => { },
    GetWareHouse: (state: AccountingInvoiceState, action: PayloadAction<{ params: any }>) => { },
    GetDateFilterOptions: (state: AccountingInvoiceState, action: PayloadAction<{ CompanyId: number }>) => { },
    GetProductUnit: (state: AccountingInvoiceState, action: PayloadAction<{ params: any }>) => { },
    GetDanhSachThietBi: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { ma_vt?: string; ten_vt?: string; otherFilter?: string } }>,
    ) => { },
    GetMoneyTypeList: (state: AccountingInvoiceState, action: PayloadAction<{ params: any }>) => { },
    GetProposalForm: (
      state: AccountingInvoiceState,
      action: PayloadAction<{
        params: { madvcs: string; ngay_de_nghi_tu_ngay: string; ngay_de_nghi_den_ngay: string; ma_kho: string };
      }>,
    ) => { },
    // [19/10/2024][#20433][ngoc_td] add redux newCustomers, getCustomers
    newCustomers: (state: AccountingInvoiceState, action: PayloadAction<{ data: Customer[]; params: any }>) => { },
    getCustomers: (state: AccountingInvoiceState) => { },
    GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa: (
      state: AccountingInvoiceState,
      action: PayloadAction<{
        params: { recId: number };
      }>,
    ) => { },
    GetDanhSachDuyetChi: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { CapDuyet: string; madvcs: string; tu_ngay: string; den_ngay: string } }>,
    ) => { },
    GetDanhSachDuyetMuaHang: (
      state: AccountingInvoiceState,
      action: PayloadAction<{
        params: { madvcs: string; ngay_de_nghi_tu_ngay: string; ngay_de_nghi_den_ngay: string; ma_kho?: string };
      }>,
    ) => { },
    GetAccountingMapping: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { type?: number | undefined } }>,
    ) => { },
    GetTonKho: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: GetTonKhoDTO; params: any; TonKhoTheoNgay?: boolean }>,
    ) => { },
    GetTonKhoByProduct: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: GetTonKhoDTO; params: any }>,
    ) => { },
    getKldinhmuc: (state: AccountingInvoiceState, action: PayloadAction<{ data: GetTonKhoDTO; params: any }>) => { },
    GetGiaVaNhaCungCap: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: GetTonKhoDTO; params: any }>,
    ) => { },
    DuyetChi: (state: AccountingInvoiceState, action: PayloadAction<{ data: number[]; params: any }>) => { },
    HuyDuyetChi: (state: AccountingInvoiceState, action: PayloadAction<{ data: number[]; params: any }>) => { },
    // Create
    CreatePhieuNhapXuatKho: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: PhieuNhapXuatKhoDTO; params: any }>,
    ) => { },
    ConfirmProposalForm: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: PhieuDeNghiMuaHangDTO; params: any }>,
    ) => { },

    UpdatePayProposalForm: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: PhieuDeNghiMuaHangDTO; params: any }>,
    ) => { },
    CreateProposalForm: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: PhieuDeNghiMuaHangDTO; params: any }>,
    ) => { },
    // Delete
    DeletePhieuNhapXuatKho: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ ids: number[]; params: any }>,
    ) => { },
    DeleteProposalForm: (state: AccountingInvoiceState, action: PayloadAction<{ ids: string[]; params: any }>) => { },
    DeletePhieuDeNghiMuaHang: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ ids: string[]; params: any }>,
    ) => { },
    // Update
    UpdateProposalForm: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ id: number; data: ProposalFormDTO; params: any }>,
    ) => { },
    // Query
    setQuery_danhSachDuyetChi: (
      state: AccountingInvoiceState,
      action: PayloadAction<{
        params: { CapDuyet: string; madvcs: string; tu_ngay: string; den_ngay: string } | undefined;
      }>,
    ) => {
      state.query_danhSachDuyetChi = action.payload;
    },
    setQuery_danhSachDuyetMuaHang: (
      state: AccountingInvoiceState,
      action: PayloadAction<{
        params: { madvcs: string; ngay_de_nghi_tu_ngay: string; ngay_de_nghi_den_ngay: string } | undefined;
      }>,
    ) => {
      state.query_danhSachDuyetMuaHang = action.payload;
    },
    setCapDuyet: (state: AccountingInvoiceState, action: PayloadAction<{ params: any }>) => {
      state.cap_Duyet = action.payload;
    },
    setDateRange: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.dateRanges = action.payload;
    },
    setDateTransfers: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.dateTransfers = action.payload;
    },
    setStatusRequest: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.statusRequest = action.payload;
    },
    getBaoCaoXuatNhapTon: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { data: IBaoCaoXuatNhapTonDTO } }>,
    ) => { },
    getBaoCaoXuatNhapTonPdf: (state: AccountingInvoiceState,
      action: PayloadAction<{ params: { data: IBaoCaoXuatNhapTonPdfDTO } }>,
    ) => { },
    getBaoCaoChiTietCongNo: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { data: IBaoCaoChiTietCongNoDTO } }>,
    ) => { },
    getBaoCaoSoCaiSoQuy: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { data: IBaoCaoSoCaiSoQuyDTO } }>,
    ) => { },
    getHoaDonVaoRa: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { data: IHoaDonRaVaoDTO } }>,
    ) => { },
    setBaoCaoXuatNhapTon: (state: AccountingInvoiceState, action: any) => {
      state.baoCaoXuatNhapTon = action.payload;
    },
    setBaoCaoXuatNhapTonDeXuatMayMoc: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.baoCaoXuatNhapTonSLTonKhoKhoTong = action.payload;
    },
    setBaoCaoXuatNhapTonDeXuatMayMocCacKhoConLai: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.baoCaoXuatNhapTonSLTonKhoCacKhoConLai = action.payload;
    },
    setBaoCaoXuatNhapTonPdf: (state: AccountingInvoiceState, action: any) => {
      state.baoCaoXuatNhapTonPdf = action.payload;
    },
    setBaoCaoChiTietCongNo: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.baoCaoChiTietCongNo = action.payload;
    },
    setBaoCaoSoCaiSoQuy: (state: AccountingInvoiceState, action: PayloadAction<any>) => {
      state.baoCaoSoCaiSoQuy = action.payload;
    },
    getAdditionalCosts: (state, action: PayloadAction<{ projectId: number, companyId: number }>) => { },
    setAdditionalCosts: (state, action) => {
      state.AdditionalCosts = action.payload;
    },
    setAdditionalCostsByDate: (state, action) => {
      state.AdditionalCostsByDate = action.payload;
    },
    setAdditionalCostAll: (state, action) => {
      state.AdditionalCostAll = action.payload;
    },
    setProposal: (state, action) => {
      state.selectedProposal = action.payload;
    },
    setIncidental: (state, action) => {
      state.selectedIncidental = action.payload;
    },
    getImageAdditionalCosts: (state, action) => { },
    /**
     * update 1 truong 'hinhanh' cho AdditionalCosts (DataType)
     * @param state 
     * @param action 
     */
    updateImageAdditionalCosts: (state, action: PayloadAction<{ imageUrl: string, id: string | undefined, type: 'all' | 'project', drawingId: string }>) => {
      let hasChange = false;
      if (action.payload) {
        const { imageUrl, id, type } = action.payload;
        const additionalCosts = [];
        if (type === 'all') {
          additionalCosts.push(...state.AdditionalCostAll);
        } else {
          additionalCosts.push(...state.AdditionalCosts);
        }
        additionalCosts.forEach(x => {
          if (x.id === id && x.hinhanh !== imageUrl) {
            x.hinhanh = imageUrl;
            hasChange = true;
          }
        });
        if (hasChange) {
          if (type === 'all') {
            state.AdditionalCostAll = additionalCosts;
          } else {
            state.AdditionalCosts = additionalCosts;
          }
        }
      }
    },
    /**
     * them/xoa image trong attachmentLinks
     * @param state 
     * @param action 
     */
    updateAttachementImageUrl: (state, action) => {
      let hasChange = false;
      if (action.payload) {
        const { id, isdelete } = action.payload;
        // isdelete: true = xoa, false: them
        const additionalCosts = [...state.AdditionalCosts];
        additionalCosts.forEach((x: DataType) => {
          if (x.id === id) {
            if (isdelete) {
              const drawingIds = action.payload.drawingIds;
              x.attachmentLinks = x.attachmentLinks.filter(xy => !drawingIds.includes(xy.drawingId));
              hasChange = true;
            } else {
              const attachmentLinks = action.payload.attachmentLinks;
              x.attachmentLinks = [...x.attachmentLinks, ...attachmentLinks];
            }
          }
        })
        if (hasChange) {
          state.AdditionalCosts = additionalCosts;
        }
      }
    },
    updateChungTuRequest: (state, action) => { },
    setSataAttachmentLinks: (state, action) => {
      state.dataAttachmentLinks = action.payload;
    },
    getImageUrlAttachmentLinks: (state, action) => { },
    downloadImg: (state, action) => { },
    downloadMultipleImage: (state, action) => { },

    /**
     * update imageUrl cho AttachmentLinks
     * @param state 
     * @param action 
     */
    updateImageUrlAttachmentLinks: (state, action) => { // one attachment
      let isPush = false;
      const attachs = [];
      const attachmentLinks = [...state.dataAttachmentLinks];
      attachmentLinks.forEach(x => {
        if (x.drawingId === action.payload.drawingId) {
          x.imageUrl = action.payload.imageUrl; // update 1 field nay thoi
          isPush = true;
        }
        attachs.push(x);
      });
      if (!isPush) attachs.push(action.payload);
      state.dataAttachmentLinks = attachs;
    },
    deleteAttachmentLinks: (state, action) => { },
    uploadAttachmentLinks: (state, action) => { },
    splitDeNghiMuaHangTheoNhaCungCap: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ params: { guid: string } }>,
    ) => { },

    // [#22401]
    CreateIncidentalCost: (state: AccountingInvoiceState, action: PayloadAction<{ files?: any; dataCreate: IncidentalCostCreate[], companyId: number }>) => { },

    createIncidentalCostSuccess: (state, action: PayloadAction<any>) => {
      state.createIncidentalCostDataLast.dataIncidentalCostCreateLast = action.payload;
    },

    CreateAdditionalCost: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ files?: FormData; dataCreate: CostDataCreate[], companyId: number }>,
    ) => { },

    createAdditionalCostSuccess: (state, action: PayloadAction<any>) => {
      state.createAdditionalCostDataLast.dataCreateLast = action.payload; // trong này bao gồm id và datacreate được lưu lại vào dataCreateLast
    },

    UpdateAdditionalCost: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ id: number; dataCreate: CostDataCreate, companyId: number }>,
    ) => { },
    UpdateAdditionalCosts: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ dataCreates: CostDataCreate[], companyId: number }>,
    ) => { },
    updateBeforeAccouttings: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ dataCreates: IAdditionalCostUpdateRequest[], companyId: number }>,
    ) => { },
    GetALLAdditionalCost: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ companyId: number }>,
    ) => { },
    getAdditionalCostsByDate: (state, action: PayloadAction<{ dateTime: string, companyId: number }>) => { },
    getAdditionalCostsByRangeDate: (state, action: PayloadAction<{ startDate: string, endDate: string }>) => { },
    getAdditionalCostsByRangeDateSuccess: (state, action: PayloadAction<IncidentalCostByRangeDate[]>) => {
      state.AdditionalCostsByRangeDate = action.payload;
    },
    DeleteAdditionalCostRequest: (state: AccountingInvoiceState, action: PayloadAction<{ id: number, projectId: any, companyId: any }>) => { },
    setProposalToken: (state: AccountingInvoiceState, action: PayloadAction<boolean>) => { state.getProposalToken = action.payload },
    getGiaXuatGanNhat: (state, action) => { },
    setGiaXuatGanNhat: (state, action) => { state.GiaXuatGanNhat = action.payload },
    GetDanhSachPhieuXuatKhoRequest: (state, action) => { },
    GetDanhSachPhieuXuatKhoSuccess: (state, action) => { state.DanhSachPhieuXuatKho = action.payload },
    createFileCPPS: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ itemId: number; dataImage: FormData, projectId: any, companyId: any }>,
    ) => { },
    createMultipleFileCPPS: (state: AccountingInvoiceState, action: PayloadAction<any>) => { },
    createFileCPPSSuccess: (state: AccountingInvoiceState, action: PayloadAction<any>) => { },
    emoveFileOfIssue: (state, action) => { },
    deleteFileCPPSRequest: (state, action) => { },
    deleteImageProposal: (state, action) => { },
    deleteFileCPPSSuccess: (state: AccountingInvoiceState, action: PayloadAction<any>) => { },
    // [02012024][#21173][phuong_td] Khai báo dataType cho Payload
    getBaoCaoDanhThuChiPhi: (state, action: PayloadAction<{ params: { data: iBaoCaoDoanhThuChiPhi } }>) => { },
    setBaoCaoDanhThuChiPhi: (state, action) => {
      state.baoCaoDanhThuChiPhi = action.payload;
    },
    BaoCaoBangKeThueMuaVaoBanRa: (state, action: PayloadAction<{
      params: {
        data: IHoaDonRaVaoDTO
      }
    }>) => { },
    setBaoCaoBangKeThueMuaVaoBanRa: (state, action) => {
      state.baoCaoBangKeThueMuaVaoBanRa = action.payload;
    },
    getPhieuNhapKhoTuDeNghiMuaHang: (state, action) => { },
    setPhieuNhapKhoTuDeNghiMuaHang: (state, action) => {
      state.danhSachNhapKho = action.payload;
    },
    getBaoCaoBangCanDoiPhatSinhTaiKhoan: (state, action: PayloadAction<{ params: { data: iBaoCaoBangCanDoiPhatSinhTaiKhoan } }>) => { },
    setBaoCaoBangCanDoiPhatSinhTaiKhoan: (state, action) => {
      state.baoCaoBangCanDoiPhatSinhTaiKhoan = action.payload;
    },
    DongBoChiPhiPhatSinh: (state, action: PayloadAction<{ businessDate: string, companyId: number }>) => { },
    getBaoCaoChiTietNhapXuatVatTuRequest: (state, action: PayloadAction<{ params: any }>) => { },
    setPdfDataUriNhapXuat: (state, action: PayloadAction<string>) => { state.pdfDataUriNhapXuat = action.payload; },

    // [16/05/2025][#22189][vy_tt]
    CreateAccountingInvoice: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ data: AccountingInvoiceRequestDTO }>
    ) => { },

    CreateAccountingInvoiceSuccess: (
      state: AccountingInvoiceState,
      action: PayloadAction<any>
    ) => {
      state.createAccountingInvoiceData = action.payload;
    },
    setMultipleImage: (state, action) => {
      const { imgs, isReset } = action.payload;
      if (isReset) {
        state.multipleImage = [...imgs]
      } else {
        const allImages = [...state.multipleImage, ...imgs];

        // Lọc trùng theo drawingId
        const uniqueImages = Array.from(
          new Map(allImages.map(img => [img.drawingId, img])).values()
        );

        state.multipleImage = uniqueImages;
              }
    },

    CreateAccountingInvoiceFailure: (
      state: AccountingInvoiceState,
      action: PayloadAction<string>
    ) => {
      state.statusRequest = { api: 'CreateAccountingInvoice', status: eStatusRequest.error };
      state.createAccountingInvoiceError = action.payload;
    },

    // [03/06/2025][#22824][vy_tt]
    CreateInvoiceX: (state: AccountingInvoiceState, action: PayloadAction<{ data: InvoiceXDTO }>) => {},

    CreateInvoiceXSuccess: (state, action: PayloadAction<InvoiceXDTO>) => {
      state.createInvoiceXData = action.payload;
      state.statusRequest = { api: 'CreateInvoiceX', status: eStatusRequest.success };
    },

    CreateInvoiceXFailure: (state, action: PayloadAction<string>) => {
      state.statusRequest = { api: 'CreateInvoiceX', status: eStatusRequest.error };
      state.createInvoiceXError = action.payload;
    },

    UpdateInvoiceX: (state, _action: PayloadAction<{ id: number; data: InvoiceXDTO }>) => {},

    UpdateInvoiceXSuccess: (state, action: PayloadAction<InvoiceXDTO>) => {
      state.createInvoiceXData = action.payload;
      state.statusRequest = { api: 'UpdateInvoiceX', status: eStatusRequest.success };
    },

    UpdateInvoiceXFailure: (state, action: PayloadAction<string>) => {
      state.statusRequest = { api: 'UpdateInvoiceX', status: eStatusRequest.error };
      state.createInvoiceXError = action.payload;
    },

    GetInvoicesX: (
      state: AccountingInvoiceState,
      action: PayloadAction,
    ) => { },

    GetInvoicesSuccess: (state, action) => {
      state.invoiceList = action.payload;
    },

    GetInvoicesXFailure: (state, action: PayloadAction<string>) => {
      state.invoiceXError = action.payload;
    },  

    GetInvoiceXById: (
      state: AccountingInvoiceState,
      action: PayloadAction<{ id: number }>,
    ) => { },

    GetInvoiceByIdSuccess: (state, action: PayloadAction<InvoiceXDTO>) => {
      state.currentInvoiceX = action.payload;
    },

    GetInvoiceByIdFailure: (state, action: PayloadAction<string>) => {
      state.invoiceError = action.payload;
    },
    createAcountingInvoiceRequest: (state, action: PayloadAction<{ data: CreateAcountingInvoiceRequestDTO[] }>) => { },

    DeleteInvoiceX: (
      _,
      _action: PayloadAction<{ body: number[] }>
    ) => {},

    DeleteInvoiceXSuccess: (state, action: PayloadAction<number[]>) => {
      state.statusRequest = { api: 'DeleteInvoiceX', status: eStatusRequest.success };
    },

    DeleteInvoiceXFailure: (state, action: PayloadAction<string>) => {
      state.statusRequest = { api: 'DeleteInvoiceX', status: eStatusRequest.error };
      state.deleteInvoiceXError = action.payload;
    },
  },
});

export const accountingInvoiceActions = accountingInvoiceSlice.actions;
export const accountingInvoiceReducer = accountingInvoiceSlice.reducer;
