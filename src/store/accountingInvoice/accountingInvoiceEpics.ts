/* eslint-disable import/order */
import { accountingInvoice, defaultPagingParams, eStatusRequest, FormatDateAPI } from '@/common/define';
import { getEnvVars } from '@/environment';
import { AccountingInvoiceService, DataType, IAttachmentLinks } from '@/services/AccountingInvoiceService';
import { cxmService } from '@/services/CxmService';
import Utils, { openPdfFromBase64 } from '@/utils';
import { AnyAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { catchError, concat, concatMap, distinctUntilChanged, EMPTY, filter, from, map, mergeMap, Observable, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { accountingInvoiceActions, getDateRange } from '../accountingInvoice';
import { issueActions } from '../issue';
import { startLoading, stopLoading } from '../loading';
import { RootEpic } from '../types';

const { apiUrl } = getEnvVars();

const GetDieuChuyenVatTu$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDieuChuyenVatTu.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { madvcs, tu_ngay, den_ngay, ma_kho } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoiceActions.GetDieuChuyenVatTu.type })],
        AccountingInvoiceService.Post.GetDanhSachDieuChuyenHangHoaVatTu(madvcs, tu_ngay, den_ngay, ma_kho).pipe(
          switchMap(results => {
            return [accountingInvoiceActions.setDieuchuyenvattu(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoiceActions.GetDieuChuyenVatTu.type })],
      );
    }),
  );
};

const CreatePhieuDieuChuyen$: RootEpic = action$ => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreatePhieuDieuChuyen.match),
    switchMap(action => {
      const { data, wh } = action.payload;
      const tu_ngay = dayjs().startOf('month').format(FormatDateAPI);
      const den_ngay = dayjs().endOf('month').format(FormatDateAPI);
      const ma_kho = wh;
      console.log(ma_kho);
      return concat(
        [startLoading({ key: 'CreatePhieuDieuChuyen' })],
        AccountingInvoiceService.Post.CreatePhieuDieuChuyen(data).pipe(
          switchMap(repon => {
            Utils.successNotification('Tạo phiếu thành công');
            return [
              accountingInvoiceActions.CreatePhieuDieuChuyenSuccess(repon),
              accountingInvoiceActions.GetDieuChuyenVatTu({ madvcs: 'THUCHIEN', tu_ngay, den_ngay, ma_kho }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreatePhieuDieuChuyen' })],
      );
    }),
  );
};
// [#20627][nam_do][30/10/2024] Cập nhập tồn kho khi nhập kho xong
const CreatePhieuNhapKho$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreatePhieuNhapKho.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, files, id }: any = action.payload;
      const tu_ngay = dayjs().startOf('month').format(FormatDateAPI);
      const den_ngay = dayjs().endOf('month').format(FormatDateAPI);
      const ma_kho = data.chiTietHangHoa[0]?.ma_kho || '';
      return concat(
        [startLoading({ key: 'CreatePhieuDieuChuyen' })],
        AccountingInvoiceService.Post.CreatePhieuDieuChuyen(data).pipe(
          switchMap(response => {
            Utils.successNotification('Tạo phiếu xuất kho thành công');
            // Biến đổi files
            const updatedFiles = files.map((file: any) => ({
              ...file,
              status: 1,
              attachmentId: response.invoiceId.toString(),
            }));

            return [
              issueActions.updateAdditionAttachment({ itemId: id, files: updatedFiles }),
              accountingInvoiceActions.GetDieuChuyenVatTu({ madvcs: 'THUCHIEN', tu_ngay, den_ngay, ma_kho }),
              accountingInvoiceActions.GetDanhSachDuyetMuaHang({
                params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              }),
              accountingInvoiceActions.GetTonKho({
                data: {
                  madvcs: 'THUCHIEN',
                  danhSachMaHang: [],
                  ngay_kiem_tra: dayjs().format(FormatDateAPI),
                  danhSachMakho: [ma_kho],
                },
                params: {},
              }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreatePhieuDieuChuyen' })],
      );
    }),
  );
};

const CreatePhieuXuatKho$: RootEpic = action$ => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreatePhieuXuatKho.match),
    switchMap(action => {
      const { data }: any = action.payload;
      return concat(
        [startLoading({ key: 'CreatePhieuXuatKho' })],
        AccountingInvoiceService.Post.CreatePhieuDieuChuyen(data).pipe(
          switchMap(response => {
            Utils.successNotification('Tạo phiếu xuất kho thành công');
            return [accountingInvoiceActions.CreatePhieuDieuChuyenSuccess(response)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreatePhieuXuatKho' })],
      );
    }),
  );
};
const CreatePhieuNhapKhodc$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreatePhieuNhapKhodc.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data }: any = action.payload;
      return concat(
        [startLoading({ key: 'CreatePhieuNhapKho' })],
        AccountingInvoiceService.Post.CreatePhieuDieuChuyen(data).pipe(
          switchMap(response => {
            Utils.successNotification('Tạo phiếu nhập kho thành công');
            return [
              accountingInvoiceActions.CreatePhieuDieuChuyenSuccess(response),
              accountingInvoiceActions.GetDanhSachDuyetMuaHang({
                params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              })
            ];
          }), catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreatePhieuNhapKho' })],
      );
    }),
  );
};
const getProductRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetProducts.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.getProducts })],
        AccountingInvoiceService.Get.GetProduct({ search: { ...params } }).pipe(
          mergeMap(results => {


            return [
              accountingInvoiceActions.SetProducts(results),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              accountingInvoiceActions.SetProducts(undefined),
            ];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getProducts })],
      );
    }),
  );
};


const getWareHouse$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetWareHouse.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.getWareHouse })],
        AccountingInvoiceService.Get.GetWareHouse({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.SetWareHouse(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.SetWareHouse(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getWareHouse })],
      );
    }),
  );
};

const getDateFilterOptions$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDateFilterOptions.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { CompanyId } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getDateFilterOptions })],
        AccountingInvoiceService.Get.GetDateFilterOptions(CompanyId).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.SetDateFilterOptions(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.SetDateFilterOptions([])];
          }),
        )
      );
    }),
  );
};

const GetProductUnit$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetProductUnit.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetProductUnit })],
        AccountingInvoiceService.Get.GetProductUnit({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setProductUnits(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setProductUnits(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetProductUnit })],
      );
    }),
  );
};

const GetDanhSachThietBi$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachThietBi.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetDanhSachThietBi })],
        AccountingInvoiceService.Get.GetDanhSachThietBi({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setMachineries(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setMachineries(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetDanhSachThietBi })],
      );
    }),
  );
};

const GetMoneyTypeList$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetMoneyTypeList.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetMoneyTypeList })],
        AccountingInvoiceService.Get.GetMoneyTypeList({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setMoneyTypes(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setMoneyTypes(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetMoneyTypeList })],
      );
    }),
  );
};

//#region PhieuNhapXuatKho
const GetDanhSachDuyetChi$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachDuyetChi.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetDanhSachDuyetChi })],
        AccountingInvoiceService.Get.GetDanhSachDuyetChi({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [
              accountingInvoiceActions.setDanhSachDuyetChi(results),
              accountingInvoiceActions.setQuery_danhSachDuyetChi({ params }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              accountingInvoiceActions.setDanhSachDuyetChi(undefined),
              accountingInvoiceActions.setQuery_danhSachDuyetChi({ params: undefined }),
            ];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetDanhSachDuyetChi })],
      );
    }),
  );
};

const GetDanhSachDuyetMuaHang$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachDuyetMuaHang.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetDanhSachDuyetMuaHang })],
        AccountingInvoiceService.Get.GetDanhSachDuyetMuaHang({ search: { ...params } }).pipe(
          mergeMap((results: any) => {

            return [
              accountingInvoiceActions.setDanhSachDuyetMuaHang(results),
              accountingInvoiceActions.setQuery_danhSachDuyetMuaHang({ params }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              accountingInvoiceActions.setDanhSachDuyetMuaHang(undefined),
              accountingInvoiceActions.setQuery_danhSachDuyetMuaHang({ params }),
            ];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetDanhSachDuyetMuaHang })],
      );
    }),
  );
};

const GetAccountingMapping$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetAccountingMapping.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const type = params?.type || 5;
      return concat(
        [startLoading({ key: accountingInvoice.GetAccountingMapping })],
        AccountingInvoiceService.Get.GetAccountingMapping(type).pipe(
          mergeMap(results => {
            if (results && results.length > 0) {
              return [accountingInvoiceActions.setAccountingMapping(results)];
            } else {
              return [accountingInvoiceActions.setAccountingMapping([])];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setAccountingMapping([])];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetAccountingMapping })],
      );
    }),
  );
};

const DuyetChi$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DuyetChi.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.DuyetChi })],
        AccountingInvoiceService.Post.DuyetChi(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            return [
              accountingInvoiceActions.GetDanhSachDuyetChi({ params: state.accountingInvoice.query_danhSachDuyetChi }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.DuyetChi })],
      );
    }),
  );
};

const HuyDuyetChi$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.HuyDuyetChi.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.HuyDuyetChi })],
        AccountingInvoiceService.Post.HuyDuyetChi(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            return [
              accountingInvoiceActions.GetDanhSachDuyetChi({ params: state.accountingInvoice.query_danhSachDuyetChi }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.HuyDuyetChi })],
      );
    }),
  );
};

const CreatePhieuNhapXuatKho$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreatePhieuNhapXuatKho.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.CreatePhieuNhapXuatKho })],
        AccountingInvoiceService.Post.CreatePhieuNhapXuatKho(data).pipe(
          switchMap(d => {
            Utils.successNotification();
            return [
              accountingInvoiceActions.GetDanhSachDuyetChi({ params: state.accountingInvoice.query_danhSachDuyetChi }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.CreatePhieuNhapXuatKho })],
      );
    }),
  );
};
const DeletePhieuNhapXuatKho$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DeletePhieuNhapXuatKho.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { ids, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: accountingInvoice.DeletePhieuNhapXuatKho })],
        AccountingInvoiceService.Post.DeletePhieuNhapXuatKho(ids).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [
              accountingInvoiceActions.GetDanhSachDuyetChi({ params: state.accountingInvoice.query_danhSachDuyetChi }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.DeletePhieuNhapXuatKho })],
      );
    }),
  );
};
//#region Tồn kho
const GetTonKho$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetTonKho.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params, TonKhoTheoNgay } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetTonKho })],
        AccountingInvoiceService.Post.GetTonKho(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            if (TonKhoTheoNgay) {
              return [accountingInvoiceActions.setTonKhoTheoNgay(results)];
            } else {
              return [accountingInvoiceActions.setTonkho(results)];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            if (TonKhoTheoNgay) {
              return [accountingInvoiceActions.setTonKhoTheoNgay(undefined)];
            } else {
              return [accountingInvoiceActions.setTonkho(undefined)];
            }
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetTonKho })],
      );
    }),
  );
};
const GetTonKhoByProduct$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetTonKhoByProduct.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.GetTonKho })],
        AccountingInvoiceService.Post.GetTonKho(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setTonkhoByProduct(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setTonkhoByProduct(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetTonKho })],
      );
    }),
  );
};
//[20563] [nam_do] lấy KL theo định mức
const GetKLdinhmuc$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getKldinhmuc.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetTonKho })],
        AccountingInvoiceService.Post.GetTonKho(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setKLdinhmuc(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetTonKho })],
      );
    }),
  );
};
// [15/10/2024][#20413][ngoc_td] add epic lấy giá & ncc
const GetGiaVaNhaCungCap$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetGiaVaNhaCungCap.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetGiaVaNhaCungCap })],
        AccountingInvoiceService.Post.GetGiaVaNhaCungCap(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            var data = results
              .replaceAll('\\"', '"') // Replace escaped double quotes
              .replaceAll(/"\[|\]"/g, (match: string) => match.replace(/"/g, '')) // Remove quotes before/after brackets
              .replaceAll(/\n/g, '') // Remove both newline and carriage return characters
              .replaceAll(/\r/g, ''); // Remove both newline and carriage return characters
            const jsonParse = JSON.parse(data);
            return [accountingInvoiceActions.setPriceAndNcc(jsonParse)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setPriceAndNcc(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetGiaVaNhaCungCap })],
      );
    }),
  );
};
//[20433] [ngoc_td] add getCustomers, newCustomers api to redux
const GetNcc$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getCustomers.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return concat(
        [startLoading({ key: accountingInvoice.getCustomers })],
        AccountingInvoiceService.Get.getCustomer().pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setCustomers(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setCustomers(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getCustomers })],
      );
    }),

  );
};
// [22/10] [ngoc_td] add notification when success
const NewNcc$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.newCustomers.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetGiaVaNhaCungCap })],
        AccountingInvoiceService.Post.newCustomer(data, { search: { ...params } }).pipe(
          mergeMap(results => {
            if (results.isSuccess) {
              Utils.successNotification();
              return [accountingInvoiceActions.getCustomers()];
            } else {
              Utils.errorHandling(results.errorMessage);
              return [accountingInvoiceActions.getCustomers()];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.getCustomers()];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetGiaVaNhaCungCap })],
      );
    }),
  );
};
// [#20755] [hao_lt] call api báo cáo thu doanh thu chi phí
const BaoCaoDanhThu$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoDanhThuChiPhi.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const {params} = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        // [02012024][#21173][phuong_td] điều chỉnh param cho api
        AccountingInvoiceService.Get.BaoCaoDanhThu(params.data).pipe(
          mergeMap((results: any) => {
            if (results) {
              const url = openPdfFromBase64(results);
              return [accountingInvoiceActions.setBaoCaoDanhThuChiPhi(url)];
            }
            return [];
          }),
          catchError((error: any) => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setBaoCaoDanhThuChiPhi(null)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};

// [#20755] [hao_lt] call api báo cáo thu doanh thu chi phí
const BaoCaoBangKeThueMuaVaoBanRa$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.BaoCaoBangKeThueMuaVaoBanRa.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        // [02012024][#21173][phuong_td] điều chỉnh param cho api
        AccountingInvoiceService.Get.BaoCaoBangKeThueMuaVaoBanRa(params.data).pipe(
          mergeMap((results: any) => {
            if (results) {
              const url = openPdfFromBase64(results)
              return [accountingInvoiceActions.setBaoCaoBangKeThueMuaVaoBanRa(url)]
            }
            return []
            // if (results) {
            //   return [accountingInvoiceActions.setBaoCaoBangKeThueMuaVaoBanRa(results)];
            // }
            // return [];
          }),
          catchError((error: any) => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setBaoCaoBangKeThueMuaVaoBanRa(null)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};

//#region ProposalForm
const GetProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetProposalForm })],
        AccountingInvoiceService.Get.GetProposalForm({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.setProposalForms(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setProposalForms(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetProposalForm })],
      );
    }),
  );
};

const GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa })],
        AccountingInvoiceService.Get.GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa({ search: { ...params } }).pipe(
          mergeMap(results => {
            var data = results
              .replaceAll('\\"', '"') // Replace escaped double quotes
              .replaceAll(/"\[|\]"/g, (match: string) => match.replace(/"/g, '')) // Remove quotes before/after brackets
              .replaceAll(/\n/g, '') // Remove both newline and carriage return characters
              .replaceAll(/\r/g, ''); // Remove both newline and carriage return characters
            const jsonParse = JSON.parse(data);
            return [accountingInvoiceActions.setChiTietHangHoa(jsonParse)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setChiTietHangHoa(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa })],
      );
    }),
  );
};
const ConfirmProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.ConfirmProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.ConfirmProposalForm })],
        AccountingInvoiceService.Post.CreateProposalForm(data, { search: { ...params } }).pipe(
          switchMap(d => {
            Utils.successNotification();
            return [
              // accountingInvoiceActions.GetProposalForm({
              //   params: {
              //     madvcs: 'KEHOACH',
              //     ngay_de_nghi_tu_ngay: '2024-09-23',
              //     ngay_de_nghi_den_ngay: '2024-09-23',
              //     ma_kho: 'TONG'
              //   },
              // }),
              accountingInvoiceActions.GetDanhSachDuyetMuaHang({
                params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.ConfirmProposalForm })],
      );
    }),
  );
};
const UpdatePayProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.UpdatePayProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.ConfirmProposalForm })],
        AccountingInvoiceService.Post.CreateProposalForm(data, { search: { ...params } }).pipe(
          switchMap(d => {
            Utils.successNotification();
            return [
              // accountingInvoiceActions.GetProposalForm({
              //   params: {
              //     madvcs: 'KEHOACH',
              //     ngay_de_nghi_tu_ngay: '2024-09-23',
              //     ngay_de_nghi_den_ngay: '2024-09-23',
              //     ma_kho: 'TONG'
              //   },
              // }),
              // accountingInvoiceActions.GetDanhSachDuyetMuaHang({
              //   params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              // }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.ConfirmProposalForm })],
      );
    }),
  );
};
const CreateProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreateProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { data, params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.CreateProposalForm })],
        AccountingInvoiceService.Post.CreateProposalForm(data, { search: { ...params } }).pipe(
          switchMap(d => {
            Utils.successNotification();
            const p = state.accountingInvoice.query_danhSachDuyetMuaHang?.params;
            if (p) {
              return [
                accountingInvoiceActions.setStatusRequest({
                  api: accountingInvoice.CreateProposalForm,
                  status: eStatusRequest.success,
                }),
                accountingInvoiceActions.GetDanhSachDuyetMuaHang({ params: p }),
              ];
            }
            return [
              accountingInvoiceActions.setStatusRequest({
                api: accountingInvoice.CreateProposalForm,
                status: eStatusRequest.success,
              }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [
              accountingInvoiceActions.setStatusRequest({
                api: accountingInvoice.CreateProposalForm,
                status: eStatusRequest.error,
              }),
            ];
          }),
        ),
        [stopLoading({ key: accountingInvoice.CreateProposalForm })],
      );
    }),
  );
};
const UpdateProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.UpdateProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, data } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.UpdateProposalForm })],
        AccountingInvoiceService.Put.UpdateProposalForm(id, data, {}).pipe(
          switchMap(() => {
            return [
              // accountingInvoiceActions.GetProposalForm({
              //   params: {
              //     madvcs: '',
              //     ngay_de_nghi_tu_ngay: '',
              //     ngay_de_nghi_den_ngay: '',
              //     ma_kho: ''
              //   },
              // }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.UpdateProposalForm })],
      );
    }),
  );
};
const DeleteProposalForm$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DeleteProposalForm.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { ids, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: accountingInvoice.DeleteProposalForm })],
        AccountingInvoiceService.Post.DeleteProposalForm(ids, {}).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [
              // accountingInvoiceActions.GetProposalForm({
              //   params: {
              //     madvcs: '',
              //     ngay_de_nghi_tu_ngay: '',
              //     ngay_de_nghi_den_ngay: '',
              //     ma_kho: ''
              //   },
              // }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.DeleteProposalForm })],
      );
    }),
  );
};

const splitDeNghiMuaHangTheoNhaCungCap$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.splitDeNghiMuaHangTheoNhaCungCap.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      return concat(
        [startLoading({ key: accountingInvoice.SplitDeNghiMuaHangTheoNhaCungCap })],
        AccountingInvoiceService.Post.SplitDeNghiMuaHangTheoNhaCungCap(params.guid).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [
              // accountingInvoiceActions.GetProposalForm({
              //   params: {
              //     madvcs: '',
              //     ngay_de_nghi_tu_ngay: '',
              //     ngay_de_nghi_den_ngay: '',
              //     ma_kho: ''
              //   },
              // }),
              accountingInvoiceActions.GetDanhSachDuyetMuaHang({
                params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.SplitDeNghiMuaHangTheoNhaCungCap })],
      );
    }),
  );
};

const DeletePhieuDeNghiMuaHang$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DeletePhieuDeNghiMuaHang.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { ids, params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, page: 1 };
      const dateRange = getDateRange();
      // console.log('Deleted');
      return concat(
        [startLoading({ key: accountingInvoice.DeleteDanhSachDuyetMuaHang })],
        AccountingInvoiceService.Post.DeletePhieuDeNghiMuaHang(ids, {}).pipe(
          switchMap(() => {
            Utils.successNotification();
            return [
              accountingInvoiceActions.GetDanhSachDuyetMuaHang({
                params: state.accountingInvoice.query_danhSachDuyetMuaHang.params,
              }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.DeleteDanhSachDuyetMuaHang })],
      );
    }),
  );
};
const getDanhSachBoPhanRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachBoPhan.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      const search = { ...defaultPagingParams, ...state.issue.queryParams, ...params };
      return concat(
        [startLoading({ key: accountingInvoice.GetDanhSachBoPhan })],
        AccountingInvoiceService.Get.GetDanhSachBoPhan({ search: { ...params } }).pipe(
          mergeMap(results => {
            return [accountingInvoiceActions.SetDanhSachBoPhan(results)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.SetDanhSachBoPhan(undefined)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.GetDanhSachBoPhan })],
      );
    }),
  );
};

const getBaoCaoXuatNhapTon$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoXuatNhapTon.match),
    withLatestFrom(state$),
    concatMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTon })],
        AccountingInvoiceService.Post.getBaoCaoXuatNhapTon(params.data).pipe(
          switchMap(results => {
            try {
              if (results !== "") {
                const parsedData = JSON.parse(results);
                if (params?.data?.keyStore === 'slTonKhoKhoTong') {
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMoc(parsedData)];
                }
                if (params?.data?.keyStore === 'slTonKhoCacKhoConLai') {
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMocCacKhoConLai(parsedData)]
                }
                return [accountingInvoiceActions.setBaoCaoXuatNhapTon(parsedData)];
              }
              if (results === "") {
                const dataReturn = [
                  {
                    ma_vt: params.data.otherFilter.slice(1, -1),
                    ton_cuoi: "0.0000",
                  }
                ]
                if (params?.data?.keyStore === 'slTonKhoKhoTong') {
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMoc(dataReturn)]
                } else if (params.data.keyStore === 'slTonKhoCacKhoConLai') {
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMocCacKhoConLai(dataReturn)];
                }
                return [accountingInvoiceActions.setBaoCaoXuatNhapTon(undefined)]
              }
              return []
            } catch (error) {
              console.error("JSON parse error:", error);
              // Fallback if parse fails
              switch (params?.data?.keyStore) {
                case 'slTonKhoKhoTong':
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMoc([])];
                case 'slTonKhoCacKhoConLai':
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTonDeXuatMayMocCacKhoConLai([])];
                default:
                  return [accountingInvoiceActions.setBaoCaoXuatNhapTon(undefined)];
              }
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTon })],
      );
    }),
  );
};

const getBaoCaoXuatNhapTonPdf$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoXuatNhapTonPdf.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        AccountingInvoiceService.Get.getBaoCaoXuatNhapTonPdf(params.data).pipe(
          switchMap(results => {
            if (results) {
              const url = openPdfFromBase64(results);;
              return [accountingInvoiceActions.setBaoCaoXuatNhapTonPdf(url)];
            } else {

              return [accountingInvoiceActions.setBaoCaoXuatNhapTonPdf(undefined)];
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};

// [#21175][dung_lt][18/12/2024] lấy báo cáo chi tiết công nợ 
const getBaoCaoChiTietCongNo$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoChiTietCongNo.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        AccountingInvoiceService.Get.getBaoCaoChiTietCongNo(params.data).pipe(
          switchMap(results => {
            const url = openPdfFromBase64(results);
            if (url) {
              return [accountingInvoiceActions.setBaoCaoChiTietCongNo(url)];
            }
            return [accountingInvoiceActions.setBaoCaoChiTietCongNo(null)];
            // try {
            //   let report: IBaoCaoCongNoVaSoCaiSoQuyData = {
            //     soLieuDauKyChoTungTK: undefined,
            //     ChiTietTungKhoanHachToanChungTu: undefined
            //   };
            //   report.soLieuDauKyChoTungTK = JSON.parse(results[0]);
            //   report.ChiTietTungKhoanHachToanChungTu = JSON.parse(results[1]);
            //   return [accountingInvoiceActions.setBaoCaoChiTietCongNo(report)];
            // } catch (error) {
            //   return [accountingInvoiceActions.setBaoCaoChiTietCongNo(undefined)];
            // }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};

// [#21241][dung_lt][04/01/2025] lấy báo cáo sổ cái sổ quý
const getBaoCaoSoCaiSoQuy$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoSoCaiSoQuy.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        AccountingInvoiceService.Get.GetBaoCaoSoCaiSoQuyNew(params.data).pipe(
          switchMap(results => {
            const url = openPdfFromBase64(results);
            if (url) {
              return [accountingInvoiceActions.setBaoCaoSoCaiSoQuy(url)]
            } else {
              return [accountingInvoiceActions.setBaoCaoSoCaiSoQuy(undefined)]
            }
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};

const getAdditionalCosts$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getAdditionalCosts.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { projectId, companyId } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getAdditionalCosts })],
        cxmService.Get.getAdditionalCosts(projectId).pipe(
          mergeMap(results => {
            // console.log('getAdditionalCosts ', results);
            const { projectList } = state.project;
            // console.log('projectList ', projectList);
            try {
              let listEmployeeEvaluation: DataType[] = [];
              const getImageActions: any[] = [];
              if (results && results.length > 0) {
                results.forEach((x: any) => {
                  const project = projectList.find((p) => p.id === x.projectId);
                  const item: DataType = {
                    ...x,
                    checkbox: false,
                    key: x.id,
                    hinhanh: '', // urlImage
                    projectCode: x.projectCode || project?.code || '',
                    projectName: x.projectName || project?.name || '',
                    imgs: [],
                  };
                  if (x.attachmentLinks && x.attachmentLinks.length > 0) {
                    // [22/01/2025][#21317][phuong_td] tạo danh sách url cho imgs
                    item.imgs = x.attachmentLinks.map((i: { drawingId: any; }) => (`${apiUrl}/Document/downloadFile/${i.drawingId}?companyId=${companyId}`));
                    getImageActions.push(
                      accountingInvoiceActions.getImageAdditionalCosts({
                        drawingId: x.attachmentLinks[0].drawingId,
                        companyId,
                        id: x.id,
                      }),
                    );
                  }
                  // [21/01/2025][#21369][phuong_td] lọc chi phí theo công ty, nếu ko có công ty thì show luôn
                  if (item.companyId === undefined || `${item.companyId}` === `${companyId}`) {
                    listEmployeeEvaluation.push(item);
                  }
                });
              }

              return [accountingInvoiceActions.setAdditionalCosts(listEmployeeEvaluation), ...getImageActions];
            } catch (error) {
              return [accountingInvoiceActions.setAdditionalCosts([])];
            }
          }),
          catchError(error => {
            // console.log('doing');
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getAdditionalCosts })],
      );
    }),
  );
};

const getAdditionalCostsByDate$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getAdditionalCostsByDate.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { dateTime, companyId } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getAdditionalCostsByDate })],
        cxmService.Get.getAdditionalCostsByDate(dateTime).pipe(
          mergeMap(results => {
            // console.log('getAdditionalCosts ', results);
            const { projectList } = state.project;
            // console.log('projectList ', projectList);
            try {
              let listEmployeeEvaluation: DataType[] = [];
              const getImageActions: any[] = [];
              if (results && results.length > 0) {
                results.forEach((x: any) => {
                  const project = projectList.find((p) => p.id === x.projectId);
                  const item: DataType = {
                    ...x,
                    checkbox: false,
                    key: x.id,
                    hinhanh: '', // urlImage
                    projectCode: x.projectCode || project?.code || '',
                    projectName: x.projectName || project?.name || '',
                    imgs: [],
                  };
                  // [21/01/2025][#21369][phuong_td] lọc chi phí theo công ty, nếu ko có công ty thì show luôn
                  if (item.companyId === undefined || `${item.companyId}` === `${companyId}`) {
                    listEmployeeEvaluation.push(item);
                  }
                });
              }

              return [accountingInvoiceActions.setAdditionalCostsByDate(listEmployeeEvaluation), ...getImageActions];
            } catch (error) {
              return [accountingInvoiceActions.setAdditionalCostsByDate([])];
            }
          }),
          catchError(error => {
            // console.log('doing');
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getAdditionalCostsByDate })],
      );
    }),
  );
};

const getAdditionalCostsByRangeDate$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getAdditionalCostsByRangeDate.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { startDate, endDate } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getAdditionalCostsByRangeDate })],
        cxmService.Get.getAdditionalCostsByRangeDate(startDate, endDate).pipe(
          map(data => accountingInvoiceActions.getAdditionalCostsByRangeDateSuccess(data)),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getAdditionalCostsByRangeDate })],
      );
    }),
  );
};

const GetALLAdditionalCost$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetALLAdditionalCost.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId } = action.payload;
      const opt = { search: { companyId } };
      return concat(
        [startLoading({ key: accountingInvoice.getAdditionalCosts })],
        cxmService.Get.getAllAdditionalCost().pipe(
          mergeMap(response => {
            // console.log('GetALLAdditionalCost ', response.results);
            const { projectList } = state.project;
            // console.log('projectList ', projectList);
            const { results } = response;
            try {
              let listEmployeeEvaluation: DataType[] = [];
              const getImageActions: any[] = [];
              if (results && results.length > 0) {
                results.forEach((x: any) => {
                  const project = projectList.find((p) => p.id === x.projectId);
                  // console.log('pjName ', x.projectId, project);
                  const item: DataType = {
                    ...x,
                    checkbox: false,
                    key: x.id,
                    hinhanh: '', // urlImage
                    projectCode: x.projectCode || project?.code || '',
                    projectName: x.projectName || project?.name || '',
                    imgs: [],
                    // projectId: x.projectId,
                    // costCode: x.costCode, // costCode
                    // costName: x.costName, // costName
                    // unit: x.unit, // unit
                    // createDate: x.createDate, // createDate
                    // amount: x.amount, // amount
                    // quantity: x.quantity, // quantity
                    // totalAmount: x.totalAmount, // totalAmount
                    // costCode: x.costCode, // costCode
                    // costName: x.costName, // costName
                    // unit: x.unit, // unit
                    // createDate: x.createDate, // createDate
                    // amount: x.amount, // amount
                    // quantity: x.quantity, // quantity
                    // totalAmount: x.totalAmount, // totalAmount
                    // id: x.id, // id
                  };

                  // console.log('attachmentLinks: ', x.attachmentLinks);
                  if (x.attachmentLinks && x.attachmentLinks.length > 0) {
                    // [22/01/2025][#21317][phuong_td] tạo danh sách url cho imgs
                    item.imgs = x.attachmentLinks.map((i: { drawingId: any; }) => (`${apiUrl}/Document/downloadFile/${i.drawingId}?companyId=${companyId}`));
                    getImageActions.push(
                      accountingInvoiceActions.getImageAdditionalCosts({
                        drawingId: x.attachmentLinks[0].drawingId,
                        companyId,
                        id: x.id,
                      }),
                    );
                  }
                  // [21/01/2025][#21369][phuong_td] lọc chi phí theo công ty, nếu ko có công ty thì show luôn
                  if (item.companyId === undefined || `${item.companyId}` === `${companyId}`) {
                    listEmployeeEvaluation.push(item);
                  }
                });
              }

              return [accountingInvoiceActions.setAdditionalCostAll(listEmployeeEvaluation), ...getImageActions];
            } catch (error) {
              return [accountingInvoiceActions.setAdditionalCostAll([])];
            }
          }),
          catchError(error => {
            // console.log('doing');
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getAdditionalCosts })],
      );
    }),
  );
};
const updateChungTuRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.updateChungTuRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return concat(
        [startLoading({ key: 'CreateAdditionalCost' })],
        AccountingInvoiceService.Post.updateChungTu(action.payload).pipe(
          switchMap(response => {
            console.log(response);
            Utils.successNotification('Cập nhật chứng từ thành công');
            return [accountingInvoiceActions.deleteFileCPPSSuccess(response)];
          }), catchError(error => {
            console.error('Lỗi chứng từ', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateAdditionalCost' })],
      )
    })
  );
};
const CreateAdditionalCost$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreateAdditionalCost.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { dataCreate, files, companyId } = action.payload; //action payload truyền vào để tạo chi phí phát sinh mới bao gồm dữ liệu tạo datacreate và files ảnh

      const data = Array.isArray(dataCreate) ? dataCreate[0] : dataCreate;
      return concat(
        [startLoading({ key: 'CreateAdditionalCost' })],
        AccountingInvoiceService.Post.CreateAdditionalCost(data).pipe(
          switchMap(response => {
            // console.log('response', response);

            Utils.successNotification('Thêm phát sinh chi phí thành công');
            let array: any[] = [];
            if (files && files instanceof FormData) {
              array = [
                accountingInvoiceActions.createAdditionalCostSuccess(response), //lưu lại response
                accountingInvoiceActions.createFileCPPS({
                  //tạo file ảnh bao gồm itemid và id mà api tự sinh ra khi tạo mới dữ liệu và ảnh
                  itemId: response.id,
                  dataImage: files,
                  projectId: response.projectId, companyId: companyId
                }),
              ];
            } else {
              array = [
                accountingInvoiceActions.CreateAdditionalCost(response),
              ];
            }
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            }
            array.push(accountingInvoiceActions.GetALLAdditionalCost({
              companyId: company.id
            }));
            return array;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateAdditionalCost' })],
      );
    }),
  );
};

const createMultipleFileCPPS$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.createMultipleFileCPPS.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { files, itemIds, projectIds, companyId } = action.payload;

      const uploadRequests: Observable<AnyAction>[]  = itemIds.map((itemId: number, index: string | number) => {
        const formData = new FormData();
        (files?.[index] ?? []).forEach((file: any) =>
          formData.append('files', file.originFileObj)
        );
        return AccountingInvoiceService.Post.createFileCPPS(itemId, formData).pipe(
          switchMap((response) => {
            const result: AnyAction[] = [
              accountingInvoiceActions.createFileCPPSSuccess(response),
              accountingInvoiceActions.GetALLAdditionalCost({ companyId }),
            ];

            const { selectedProject } = state.project;
            if (selectedProject) {
              result.push(accountingInvoiceActions.getAdditionalCosts({
                projectId: selectedProject.id,
                companyId,
              }));
            }

            return result;
          }),
          catchError((err) => {
            console.error(`Upload failed for item ${itemId}`, err);
            return EMPTY;
          })
        );
      });

      return uploadRequests.length > 0
        ? concat(...uploadRequests)
        : EMPTY;
    }),
  );
};

// [#22401]
const CreateIncidentalCost$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreateIncidentalCost.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { dataCreate, files, companyId } = action.payload;

      const data = Array.isArray(dataCreate) ? dataCreate : [dataCreate];

      return concat(
        [startLoading({ key: 'CreateIncidentalCost' })],
        AccountingInvoiceService.Post.CreateIncidentalCost(data).pipe(
          switchMap(response => {
            // Utils.successNotification('Thêm chi phí phát sinh thành công');
            let actions: any[] = [accountingInvoiceActions.createIncidentalCostSuccess(response)];
            const itemsForUpload = response.map((_item: any, index: number) => ({
              itemId: _item.id,
              projectId: _item.projectId,
            }));
            
            actions.push(accountingInvoiceActions.createMultipleFileCPPS({
              itemIds: itemsForUpload.map((x: { itemId: any; }) => x.itemId),
              projectIds: itemsForUpload.map((x: { projectId: any; }) => x.projectId),
              files: files,
              companyId,
            }));

            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            if (selectedProject) {
              actions.push(
                accountingInvoiceActions.getAdditionalCosts({
                  projectId: selectedProject.id,
                  companyId,
                }),
              );
            }
            else if (company && !selectedProject) {
              actions.push(
                accountingInvoiceActions.GetALLAdditionalCost({
                  companyId: company.id,
                }),
              );
            }

            return actions;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateIncidentalCost' })],
      );
    }),
  );
};



const createFileCPPS$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.createFileCPPS.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { itemId, dataImage, projectId, companyId } = action.payload; //actionpayload truyền vào bao gồm itemid và dữ liệu ảnh

      return concat(
        [startLoading({ key: 'createFileCPPS' })],
        AccountingInvoiceService.Post.createFileCPPS(itemId, dataImage).pipe(
          switchMap(response => {
            // console.log('Tải file thành công', response);
            let array: any[] = [accountingInvoiceActions.createFileCPPSSuccess(response)]
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            }
            array.push(accountingInvoiceActions.GetALLAdditionalCost({
              companyId: company.id
            }))
            return array;
          }),
          catchError(error => {
            console.error('Lỗi tải file', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'createFileCPPS' })],
      );
    }),
  );
};

const DeleteImage$: RootEpic = action$ => {
  return action$.pipe(
    filter(accountingInvoiceActions.deleteFileCPPSRequest.match),
    switchMap(action => {
      const { itemId, drawingIds } = action.payload; //dữ liệu truyeennm vào để xóa ảnh bằng itemid và drawingid của ảnh
      return concat(
        [startLoading({ key: 'deleteFileCPPS' })],
        AccountingInvoiceService.Delete.DeleteImage(itemId, drawingIds).pipe(
          switchMap(response => {
            Utils.successNotification('Xóa ảnh thành công');

            return [accountingInvoiceActions.deleteFileCPPSSuccess(response)];
          }),
          catchError(error => {
            console.error('Lỗi xóa file', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'deleteFileCPPS' })],
      );
    }),
  );
};
const DeleteImageProposal$: RootEpic = action$ => {
  return action$.pipe(
    filter(accountingInvoiceActions.deleteImageProposal.match),
    switchMap(action => {
      const { itemId, drawingIds } = action.payload; //dữ liệu truyeennm vào để xóa ảnh bằng itemid và drawingid của ảnh
      return concat(
        [startLoading({ key: 'deleteFileCPPS' })],
        AccountingInvoiceService.Delete.DeleteImage(itemId, drawingIds).pipe(
          switchMap(response => {
            Utils.successNotification('Xóa ảnh thành công');

            return [accountingInvoiceActions.deleteFileCPPSSuccess(response),
            issueActions.getAttachmentFileRequest({ issueId: itemId })
            ];
          }),
          catchError(error => {
            console.error('Lỗi xóa file', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'deleteFileCPPS' })],
      );
    }),
  );
};
const UpdateAdditionalCost$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.UpdateAdditionalCost.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, dataCreate, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'UpdateAdditionalCost' })],
        AccountingInvoiceService.Put.UpdateAdditionalCost(id, dataCreate).pipe(
          switchMap(response => {
            Utils.successNotification('Cập nhật phát sinh chi phí thành công');
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            const array: any[] = [];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }))
            }
            return array;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'UpdateAdditionalCost' })],
      );
    }),
  );
};

const UpdateAdditionalCosts$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.UpdateAdditionalCosts.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { dataCreates, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'UpdateAdditionalCosts' })],
        AccountingInvoiceService.Put.UpdateAdditionalCosts(dataCreates).pipe(
          switchMap(response => {
            // Utils.successNotification('Cập nhật phát sinh chi phí thành công');
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            const array: any[] = [];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }))
            }
            return array;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'UpdateAdditionalCosts' })],
      );
    }),
  );
};

const UpdateBeforeAccouttings$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.updateBeforeAccouttings.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { dataCreates, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'updateBeforeAccouttings' })],
        AccountingInvoiceService.Put.UpdateBeforeAccouttings(dataCreates).pipe(
          switchMap(response => {
            // Utils.successNotification('Cập nhật phát sinh chi phí thành công');
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            const array: any[] = [];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }))
            }
            return array;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'updateBeforeAccouttings' })],
      );
    }),
  );
};

const DeleteAdditionalCost$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DeleteAdditionalCostRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { id, projectId, companyId } = action.payload; //truyền id để xóa chi phí phát sinh
      return concat(
        [startLoading({ key: 'DeleteAdditionalCost' })],
        AccountingInvoiceService.Delete.DeleteAdditionalCost(id).pipe(
          switchMap(response => {
            // console.log('Xóa phát sinh chi phí thành công', response);
            // Utils.successNotification('Xóa phát sinh chi phí thành công');
            const company = state.app.auth?.company;
            // [20/01/2025][#21321][phuong_td] Điều chỉnh việc lấy chi phí phát sinh khi xóa
            const { selectedProject } = state.project;
            const array = [];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }));
            }
            return array;
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'DeleteAdditionalCost' })],
      );
    }),
  );
};

const getImageAdditionalCosts$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getImageAdditionalCosts.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingId, companyId, id } = action.payload;
      const dataAttachmentLinks = [...state.accountingInvoice.dataAttachmentLinks];
      const listData = dataAttachmentLinks.filter(x => x.drawingId === drawingId && x.imageUrl !== '');
      if (listData && listData.length > 0) {
        // image đã download roi ==> bo qua
        return [];
      }
      return concat(
        cxmService.Get.downloadFile(drawingId, companyId).pipe(
          mergeMap(imageData => {
            const url = window.URL.createObjectURL(imageData);
            // console.log(`ImageAdditionalCosts: drawingId: ${drawingId}, companyId: ${companyId}, id: ${id}`, url);
            const { selectedProject } = state.project;
            return [
              accountingInvoiceActions.updateImageAdditionalCosts({
                imageUrl: url,
                drawingId,
                id,
                type: selectedProject ? 'project' : 'all',
              }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return []; // Trả về EMPTY nếu có lỗi
          }),
        ),
      );
    }),
  );
};

const getAttachmentLinks$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getImageUrlAttachmentLinks.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingId, companyId, itemId, fileName } = action.payload;
      return concat(
        cxmService.Get.downloadFile(drawingId, companyId).pipe(
          mergeMap((imageData: any) => {
            return Utils.convertBlobToBase64(imageData).pipe(
              map(base64Image => {
                // IAttachmentLinks
                return accountingInvoiceActions.updateImageUrlAttachmentLinks({
                  drawingId,
                  fileName,
                  itemId,
                  selected: false,
                  imageUrl: base64Image,
                });
              }),
            );
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return []; // Trả về EMPTY nếu có lỗi
          }),
        ),
      );
    }),
  );
};

const downloadImg$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.downloadImg.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingId, companyId, itemId, fileName } = action.payload;
      return concat(
        cxmService.Get.downloadFile(drawingId, companyId).pipe(
          mergeMap((imageData: any) => {
            return Utils.convertBlobToBase64(imageData).pipe(
              map(base64Image => {
                // IAttachmentLinks
                return accountingInvoiceActions.setMultipleImage({
                  imgs: [{
                    drawingId,
                    fileName,
                    itemId,
                    selected: false,
                    imageUrl: base64Image,
                  }],
                  isReset: false
                });
              }),
            );
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return []; // Trả về EMPTY nếu có lỗi
          }),
        ),
      );
    }),
  );
};

const downloadMultipleImage$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.downloadMultipleImage.match),
    distinctUntilChanged((prev, curr) =>
      JSON.stringify(prev.payload.keyDownload) ===
      JSON.stringify(curr.payload.keyDownload)
    ),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { attachmentLinks, companyId, keyDownload } = action.payload;
      const actions = attachmentLinks.map((link: { drawingId: any; itemId: any; fileName: any; }) => {
        const { drawingId, itemId, fileName } = link;
        return accountingInvoiceActions.downloadImg({ drawingId, companyId, itemId, fileName });
      });

      // ✅ fix: combine các stream lại bằng merge
      return [...actions];
    })
  );
};

const deleteAttachmentLinks$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.deleteAttachmentLinks.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingIds, itemId, id, projectId, companyId } = action.payload;
      // console.log(`deleteAttachmentLinks: itemId: ${itemId}, drawingIds: ${drawingIds}`);
      return concat(
        [startLoading({ key: accountingInvoice.deleteAttachmentLinks })],
        cxmService.delete.deleteAttachmentFiles(itemId, drawingIds).pipe(
          switchMap(() => {
            // console.log(`deleteAttachmentLinks: itemId: ${itemId}, drawingId: ${drawingIds}`);
            Utils.successNotification();
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            const array: any[] = [];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }))
            }
            return array;
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.deleteAttachmentLinks })],
      );
    }),
  );
};

const uploadAttachmentLinks$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.uploadAttachmentLinks.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { dataImage, itemId, id, companyId, projectId } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.uploadAttachmentLinks })],
        cxmService.Post.uploadAttachmentFiles(itemId, dataImage).pipe(
          switchMap(results => {
            let attachmentLinks: IAttachmentLinks[] = [];
            let imageAttachmentLinks: any = [];
            if (results && results.length > 0) {
              results.forEach((x: any) => {
                const item: IAttachmentLinks = {
                  id: x.id,
                  drawingId: x.drawingId,
                  itemId: x.itemId,
                  fileName: x.fileName,
                  selected: false,
                  imageUrl: '',
                };
                attachmentLinks.push(item);
                imageAttachmentLinks.push(
                  accountingInvoiceActions.getImageUrlAttachmentLinks({
                    drawingId: x.drawingId,
                    fileName: x.fileName,
                    companyId,
                    itemId: x.itemId,
                  }),
                );
              });
            }
            Utils.successNotification();
            const { selectedProject } = state.project;
            const company = state.app.auth?.company;
            const array: any[] = [accountingInvoiceActions.updateAttachementImageUrl({ attachmentLinks, id, isdelete: false })];
            if (selectedProject) {
              array.push(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject.id, companyId: companyId }));
            } else {
              array.push(accountingInvoiceActions.GetALLAdditionalCost({
                companyId: company.id
              }))
            }
            return [...array, ...imageAttachmentLinks];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.uploadAttachmentLinks })],
      );
    }),
  );
};
const getGiaXuatGanNhat$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getGiaXuatGanNhat.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { data } = action.payload;

      return concat(
        AccountingInvoiceService.Post.getGiaXuatGanNhat(data).pipe(
          mergeMap((results: string) => {
            try {
              // Ensure we safely clean up the string without corrupting the JSON format
              const cleanedData = results
                .replace(/\\\\"/g, '"') // Replace escaped double quotes (if any)
                .replace(/(?:\r\n|\r|\n)/g, ''); // Remove newline characters


              // Parse JSON safely
              const jsonParsed = JSON.parse(cleanedData);

              return [accountingInvoiceActions.setGiaXuatGanNhat(jsonParsed)];
            } catch (parseError) {
              console.error("JSON Parse Error:", parseError);
              return [accountingInvoiceActions.setGiaXuatGanNhat(undefined)];
            }
          }),
          catchError(error => {
            console.error("API Error:", error);
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setGiaXuatGanNhat(undefined)];
          })
        )
      );
    })
  );
};

const GetDanhSachPhieuXuatKhoRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetDanhSachPhieuXuatKhoRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { data } = action.payload;
      console.log("Payload Data:", data);

      return concat(
        AccountingInvoiceService.Get.GetDanhSachPhieuXuatKho(data).pipe(
          mergeMap((results: string) => {
            try {
              // Ensure we safely clean up the string without corrupting the JSON format
              const cleanedData = results
                .replace(/\\\\"/g, '"') // Replace escaped double quotes (if any)
                .replace(/(?:\r\n|\r|\n)/g, ''); // Remove newline characters

              console.log("Cleaned Data:", cleanedData);

              // Parse JSON safely
              const jsonParsed = JSON.parse(cleanedData);

              return [accountingInvoiceActions.GetDanhSachPhieuXuatKhoSuccess(jsonParsed)];
            } catch (parseError) {
              console.error("JSON Parse Error:", parseError);
              return [accountingInvoiceActions.GetDanhSachPhieuXuatKhoSuccess(undefined)];
            }
          }),
          catchError(error => {
            console.error("API Error:", error);
            Utils.errorHandling(error);
            return [accountingInvoiceActions.GetDanhSachPhieuXuatKhoSuccess(undefined)];
          })
        )
      );
    })
  );
};

const getPhieuNhapKhoTuDeNghiMuaHang$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getPhieuNhapKhoTuDeNghiMuaHang.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { guid } = action.payload;
      return concat(
        AccountingInvoiceService.Get.getPhieuNhapKhoTuDeNghiMuaHang(guid).pipe(
          mergeMap(results => {
            return [
              accountingInvoiceActions.setPhieuNhapKhoTuDeNghiMuaHang(results),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setPhieuNhapKhoTuDeNghiMuaHang([])]; // Trả về EMPTY nếu có lỗi
          }),
        ),
      );
    }),
  );
};

// [12/01/2024][#21278][phuong_td] lấy dữ liệu cân đối kế toán
const BaoCaoBangCanDoiPhatSinhTaiKhoan$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoBangCanDoiPhatSinhTaiKhoan.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
        AccountingInvoiceService.Get.BaoCaoBangCanDoiPhatSinhTaiKhoan(params.data).pipe(
          mergeMap((results: any) => {
            const url = openPdfFromBase64(results);
            if (url) {

             
              return [accountingInvoiceActions.setBaoCaoBangCanDoiPhatSinhTaiKhoan(url)];
            }
            return [];
          }),
          catchError((error: any) => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.setBaoCaoBangCanDoiPhatSinhTaiKhoan(null)];
          }),
        ),
        [stopLoading({ key: accountingInvoice.getBaoCaoXuatNhapTonPdf })],
      );
    }),
  );
};
// [12/01/2024][#21278][phuong_td] lấy dữ liệu cân đối kế toán
const DongBoChiPhiPhatSinh$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DongBoChiPhiPhatSinh.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { businessDate, companyId } = action.payload;
      return concat(
        [startLoading({ key: accountingInvoice.DongBoChiPhiPhatSinh })],
        AccountingInvoiceService.Post.DongBoChiPhiPhatSinh(companyId, { search: { businessDate } }).pipe(
          mergeMap((results: any) => {
            Utils.successNotification('Successful synchronization');
            return [accountingInvoiceActions.GetALLAdditionalCost({ companyId })];
          }),
          catchError((error: any) => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: accountingInvoice.DongBoChiPhiPhatSinh })],
      );
    }),
  );
};
const getBaoCaoChiTietNhapXuatVatTuRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.getBaoCaoChiTietNhapXuatVatTuRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { params } = action.payload;
      return concat(
        [startLoading({ key: 'BaoCaoChiTietNhapXuatVatTuRequest' })],
        AccountingInvoiceService.Get.GetBaoCaoChiTietNhapXuatVatTu({ search: params, }).pipe(
          mergeMap((results: any) => {
            Utils.successNotification('Lấy thông tin thành công');
            const base64String = results;

            return [accountingInvoiceActions.setPdfDataUriNhapXuat(base64String)];
          }),
          catchError((error: any) => {
            // Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'BaoCaoChiTietNhapXuatVatTuRequest' })],
      );
    }),
  );
};

// [16/05/2025][#22189][vy_tt]
const CreateAccountingInvoiceEpic$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreateAccountingInvoice.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { data } = action.payload;

      return concat(
        [startLoading({ key: 'CreateAccountingInvoice' })],
        AccountingInvoiceService.Post.CreateAccountingInvoice(data).pipe(
          switchMap((response: any) => {
            return [accountingInvoiceActions.CreateAccountingInvoiceSuccess(response)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [accountingInvoiceActions.CreateAccountingInvoiceFailure(error?.message ?? 'Có lỗi xảy ra!')];
          }),
        ),
        [stopLoading({ key: 'CreateAccountingInvoice' })],
      );
    }),
  );
};

// [03/06/2025][#22824][vy_tt]
const CreateInvoiceXEpic$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.CreateInvoiceX.match),
    map(({ payload }) => payload.data),

    switchMap((data) =>
      concat(
        of(startLoading({ key: 'CreateInvoiceX' })),

        from(AccountingInvoiceService.Post.CreateInvoiceX(data)).pipe(
          map((response) => {
            Utils.successNotification('Tạo hoá đơn X thành công');
            return accountingInvoiceActions.CreateInvoiceXSuccess(response);
          }),

          catchError((error) => {
            Utils.errorHandling(error);
            return of(
              accountingInvoiceActions.CreateInvoiceXFailure(
                error?.message ?? 'Có lỗi xảy ra!',
              ),
            );
          }),
        ),
        of(stopLoading({ key: 'CreateInvoiceX' })),
      ),
    ),
  );
}

const UpdateInvoiceXEpic$: RootEpic = (action$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.UpdateInvoiceX.match),
    switchMap(({ payload }) =>
      concat(
        of(startLoading({ key: 'UpdateInvoiceX' })),
        from(AccountingInvoiceService.Put.UpdateInvoiceX(payload.id, payload.data)).pipe(
          map((res) => {
            Utils.successNotification('Cập nhật hoá đơn X thành công');
            return accountingInvoiceActions.UpdateInvoiceXSuccess(res);
          }),
          catchError((err) =>
            of(
              accountingInvoiceActions.UpdateInvoiceXFailure(
                err?.message ?? 'Có lỗi xảy ra!'
              )
            ).pipe(
              tap(() => Utils.errorHandling(err))
            )
          )
        ),
        of(stopLoading({ key: 'UpdateInvoiceX' }))
      )
    )
  );
}

const getInvoiceByIdEpic$: RootEpic = (action$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetInvoiceXById.match),
    switchMap(({ payload }) =>
      concat(
        of(startLoading({ key: 'GetInvoiceById' })),
        from(AccountingInvoiceService.Get.getInvoiceXById(payload.id)).pipe(
          map((res) => accountingInvoiceActions.GetInvoiceByIdSuccess(res)),
          catchError((err) =>
            of(
              accountingInvoiceActions.GetInvoiceByIdFailure(
                err?.message ?? 'Không tìm thấy hoá đơn'
              )
            )
          )
        ),
        of(stopLoading({ key: 'GetInvoiceById' }))
      )
    )
  );
}

const getInvoicesEpic$: RootEpic = (action$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.GetInvoicesX.match),
    switchMap(({ payload }) =>
      concat(
        of(startLoading({ key: 'GetInvoices' })),
        from(AccountingInvoiceService.Get.getInvoicesX()).pipe(
          map((res) =>
            accountingInvoiceActions.GetInvoicesSuccess(res)
          ),
          catchError((err) =>
            of(
              accountingInvoiceActions.GetInvoicesXFailure(
                err?.message ?? 'Không lấy được danh sách hoá đơn'
              )
            )
          )
        ),
        of(stopLoading({ key: 'GetInvoices' }))
      )
    )
  );
}

const DeleteInvoiceXEpic$: RootEpic = (action$) => {
  return action$.pipe(
    filter(accountingInvoiceActions.DeleteInvoiceX.match),
    switchMap(({ payload }) =>
      concat(
        of(startLoading({ key: 'DeleteInvoiceX' })),
        from(AccountingInvoiceService.Delete.DeleteInvoiceXByIds(payload.body)).pipe(
          map(() => {
            Utils.successNotification('Đã xoá hoá đơn thành công');
            
            return accountingInvoiceActions.DeleteInvoiceXSuccess(payload.body);
          }),
          catchError((err) =>
            of(
              accountingInvoiceActions.DeleteInvoiceXFailure(
                err?.message ?? 'Xoá hoá đơn thất bại'
              )
            ).pipe(tap(() => Utils.errorHandling(err)))
          )
        ),
        of(stopLoading({ key: 'DeleteInvoiceX' }))
      )
    )
  );
}

const CreateAcountingInvoiceRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(accountingInvoiceActions.createAcountingInvoiceRequest.match),
    switchMap(action => {
      const { data } = action.payload;
      return concat(
        [startLoading({ key: 'CreateAcountingInvoiceRequest' })],
        AccountingInvoiceService.Post.CreateAcountingInvoice(data).pipe(
          switchMap(response => {
            console.log(response);
            return [];
          }),
          catchError(error => {
            console.error(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'CreateAcountingInvoiceRequest' })],
      );
    }),
  );
};


export const accountingInvoiceEpics = [
  CreateAcountingInvoiceRequest$,
  downloadImg$,
  downloadMultipleImage$,
  createFileCPPS$,
  createMultipleFileCPPS$,
  DeleteImage$,
  DeleteAdditionalCost$,
  UpdateAdditionalCost$,
  UpdateAdditionalCosts$,
  CreateAdditionalCost$,
  DeleteImageProposal$,
  getProductRequest$,
  getWareHouse$,
  GetMoneyTypeList$,
  GetDanhSachThietBi$,
  GetProductUnit$,
  getDateFilterOptions$,
  GetProposalForm$,
  CreateProposalForm$,
  DeleteProposalForm$,
  UpdateProposalForm$,
  CreatePhieuNhapXuatKho$,
  DeletePhieuNhapXuatKho$,
  GetDanhSachDuyetChi$,
  GetDanhSachDuyetMuaHang$,
  GetTonKho$,
  DuyetChi$,
  DeletePhieuDeNghiMuaHang$,
  HuyDuyetChi$,
  GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa$,
  ConfirmProposalForm$,
  GetDieuChuyenVatTu$,
  CreatePhieuDieuChuyen$,
  CreatePhieuNhapKho$,
  getDanhSachBoPhanRequest$,
  CreatePhieuXuatKho$,
  CreatePhieuNhapKhodc$,
  GetGiaVaNhaCungCap$,
  splitDeNghiMuaHangTheoNhaCungCap$,
  getBaoCaoXuatNhapTon$,
  getBaoCaoXuatNhapTonPdf$,
  getBaoCaoChiTietCongNo$,
  getAdditionalCosts$,
  GetALLAdditionalCost$,
  getImageAdditionalCosts$,
  NewNcc$,
  GetNcc$,
  GetKLdinhmuc$,
  getAttachmentLinks$,
  deleteAttachmentLinks$,
  uploadAttachmentLinks$,
  BaoCaoDanhThu$,
  getGiaXuatGanNhat$,
  getPhieuNhapKhoTuDeNghiMuaHang$,
  getBaoCaoSoCaiSoQuy$,
  BaoCaoBangKeThueMuaVaoBanRa$,
  BaoCaoBangCanDoiPhatSinhTaiKhoan$,
  DongBoChiPhiPhatSinh$,
  GetDanhSachPhieuXuatKhoRequest$,
  updateChungTuRequest$,
  UpdatePayProposalForm$,
  GetTonKhoByProduct$,
  getBaoCaoChiTietNhapXuatVatTuRequest$,
  CreateIncidentalCost$,
  CreateAccountingInvoiceEpic$,
  getAdditionalCostsByDate$,
  getAdditionalCostsByRangeDate$,
  CreateInvoiceXEpic$,
  UpdateInvoiceXEpic$,
  getInvoicesEpic$,
  getInvoiceByIdEpic$,
  DeleteInvoiceXEpic$,
  GetAccountingMapping$,
  UpdateBeforeAccouttings$
];
