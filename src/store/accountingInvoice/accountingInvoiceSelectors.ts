import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';

const getState = (state: RootState) => state.accountingInvoice;

export function getProducts() {
  return createSelector([getState], state => state.products);
}

export function getWareHouses() {
  return createSelector([getState], state => state.wareHouses);
}

export function getDateFilterOptions() {
  return createSelector([getState], state => state.dateFilterOptions);
}
export function getProductUnits() {
  return createSelector([getState], state => state.productUnits);
}

export function getMayMoc() {
  return createSelector([getState], state => state.machineries);
}

export function getMoneyTypes() {
  return createSelector([getState], state => state.moneyTypes);
}

export function getDanhSachDuyetChi() {
  return createSelector([getState], state => state.danhSachDuyetChi);
}

export function getDanhSachDuyetMuaHang() {
    // console.log('called');
  return createSelector([getState], state => state.danhSachDuyetMuaHang);
}

export function getTonkho() {
  return createSelector([getState], state => state.Tonkho);
}
export function getAccountingMapping() {
  return createSelector([getState], state => state.accountingMapping);
}
export function getKldinhmuc() {
  return createSelector([getState], state => state.KLdinhmuc);
}
export function getTonKhoTheoNgay() {
  return createSelector([getState], state => state.TonKhoTheoNgay);
}

export function getProposalForms() {
  return createSelector([getState], state => state.proposalForms);
}

export function getChiTietHangHoa
() {
  return createSelector([getState], state => state.ChiTietHangHoa
  );
}

export function getProposalFormSelected() {
  return createSelector([getState], state => state.proposalFormSelected);
}

export function getQuery_danhSachDuyetChi() {
  return createSelector([getState], state => state.query_danhSachDuyetChi);
}

export function getQuery_danhSachDuyetMuaHang() {
  return createSelector([getState], state => state.query_danhSachDuyetMuaHang);
}

export function getCapDuyet () {
  return createSelector([getState], state => state.cap_Duyet);
}

export function getDateRange() {
  return createSelector([getState], state => state.dateRanges);
}
export function getDateTransfers() {
  return createSelector([getState], state => state.dateTransfers);
}
export function getStatusRequest() {
  return createSelector([getState], state => state.statusRequest);
}
export function getDieuchuyenvattu() {
  return createSelector([getState], state => state.Dieuchuyenvattu);
}

export function getClearData() {
  return createSelector([getState], state => state.clearData);
}

export function getDanhSachBoPhan() {
  return createSelector([getState], state => state.DanhSachBoPhan);
}

export function getBaoCaoXuatNhapTon() {
  return createSelector([getState], state => state.baoCaoXuatNhapTon);
}

export function getbaoCaoXuatNhapTonSLTonKhoKhoTong() {
  return createSelector([getState], state => state.baoCaoXuatNhapTonSLTonKhoKhoTong || []);
}

export function getCaoXuatNhapTonSLTonKhoCacKhoConLai() {
  return createSelector([getState], state => state.baoCaoXuatNhapTonSLTonKhoCacKhoConLai || []);
}
export function getBaoCaoXuatNhapTonPdf() {
  return createSelector([getState], state => state.baoCaoXuatNhapTonPdf);
}

export function getBaoCaoChiTietCongNo() {
  return createSelector([getState], state => state.baoCaoChiTietCongNo);
}

export function getBaoCaoSoCaiSoQuy() {
  return createSelector([getState], state => state.baoCaoSoCaiSoQuy);
}

 // [15/10/2024][#20413][ngoc_td] add selector lấy giá & ncc
export function getPriceAndNcc() {
  return createSelector([getState], state => state.priceAndNcc);
}

 // [18/10/2024][#20413][ngoc_td] add selector lấy ncc list
export function getNccList() {
  return createSelector([getState], state => state.customers);
}

 // [18/10/2024][#20413][ngoc_td] add selector lấy ncc list
export function getBaoCaoDanhThuChiPhi() {
  return createSelector([getState], state => state.baoCaoDanhThuChiPhi);
}
export function getbaoCaoBangKeThueMuaVaoBanRa() {
  return createSelector([getState], state => state.baoCaoBangKeThueMuaVaoBanRa);
}
export function getDanhSachPhieuXuatKho() {
  return createSelector([getState], state => state.DanhSachPhieuXuatKho);
}
export function getGiaXuatGanNhat() {
  return createSelector([getState], state => state.GiaXuatGanNhat);
}
export function getPhieuNhapKhoTuDeNghiMuaHang() {
  return createSelector([getState], state => state.danhSachNhapKho);
}
export function getBaoCaoBangCanDoiPhatSinhTaiKhoan() {
  return createSelector([getState], state => state.baoCaoBangCanDoiPhatSinhTaiKhoan);
}

export function getAdditionalCostAll() {
  return createSelector([getState], state => state.AdditionalCostAll);
}
export function getUpdateTransfer() {
  return createSelector([getState], state => state.updateTransfer);
}
export function getProposalToken() {
  return createSelector([getState], state => state.getProposalToken);
}

export function getTypeDieuChuyen() {
  return createSelector([getState], state => state.typeDieuChuyen);
}
export function getSelectedProposal() {
  return createSelector([getState], state => state.selectedProposal);
}
export function getSelectedIncidental() {
  return createSelector([getState], state => state.selectedIncidental);
}
// [16/05/2025][#22189][vy_tt]
export const selectCreateAccountingInvoiceData = (
  state: RootState
) => state.accountingInvoice.createAccountingInvoiceData;

export const selectCreateAccountingInvoiceError = (
  state: RootState
) => state.accountingInvoice.createAccountingInvoiceError;

export const getMultipleImage = (
  state: RootState
) => state.accountingInvoice.multipleImage;

// [03/06/2025][#22824][vy_tt]
export const selectCreateInvoiceXData = (
  state: RootState
) => state.accountingInvoice.createInvoiceXData;