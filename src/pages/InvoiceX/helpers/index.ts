import dayjs from "dayjs";

import { InvoiceFormValues } from "../EditInvoiceX/EditInvoiceX";
import { InvoiceXDTO } from "@/services/AccountingInvoiceService";


// -----------------------------------------------------------------

export const mapFormToDto = (v: InvoiceFormValues, id = 0): InvoiceXDTO => {

  const { seller = {} as any, buyer = {} as any, items = [], totalWithoutTax, totalVat, totalFee, totalDiscount, grandTotal } = v;
    return {
      id,
      // ------- Seller -------
      ban_MauSo: seller.templateNo ?? '',
      ban_SoHoaDon: seller.invoiceNo.trim(),
      ban_KyHieu: seller.symbol.trim(),
      ban_NgayLap: seller.createdDate ? dayjs(seller.createdDate) : dayjs(),
      ban_NgayKyPhatHanh: seller.publishDate ? dayjs(seller.publishDate) : dayjs(),
      ban_TenNguoiBan: seller.sellerName ?? '',
      ban_MaSoThue: seller.taxCode.trim(),
      ban_DiaChiCongTy: seller.address ?? '',
      ban_TaiKhoan: seller.bankAccount ?? '',
      ban_NganHang: seller.bankName ?? '',

      // ------- Buyer -------
      mua_NguoiMuaHang: buyer.buyerInfo ?? '',
      mua_TenNguoiMua: buyer.buyerName ?? '',
      mua_MaSoThue: buyer.buyerTaxCode ?? '',
      mua_DiaChi: buyer.buyerAddress ?? '',
      mua_CCCD: buyer.identityCard ?? '',
      mua_Email: buyer.email ?? '',

      // ------- Misc -------
      hinhThucThanhToan: buyer.buyerPaymentMethod ?? '',
      maCoQuanThue: buyer.buyerTaxAuthorityCode ?? '',

      // ------- Totals -------
      tongTienChuaThue: totalWithoutTax ?? 0,
      tongTienThueGTGT: totalVat ?? 0,
      tongTienPhi: totalFee ?? 0,
      tongTienChietKhau: totalDiscount ?? 0,
      tongTienThanhToan: grandTotal ?? 0,

      // ------- Details -------
      vatInvoiceDetails: (items || []).map((it, idx) => ({
        id: 0,
        tinhChat: it.nature ?? '',
        maHangHoaDichVu: it.code ?? '',
        tenHangHoaDichVu: it.name ?? '',
        donViTinh: it.unit ?? '',
        soLuong: it.quantity ?? 0,
        donGia: it.unitPrice ?? 0,
        chietKhau: it.discount ?? 0,
        thueSuat: it.taxRate ?? 0,
        thanhTienChuaThueGTGT: it.lineTotal ?? 0,
      })),
    };
  };
