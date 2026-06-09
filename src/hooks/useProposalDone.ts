import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { eTypeVatTu, eTypeVatTuMayMoc, FormatDateAPI, formatDateDisplay } from '@/common/define';
import { AccountingInvoiceService, ChiTietDeNghiMuaHangDTO } from '@/services/AccountingInvoiceService';
import {
  accountingInvoiceActions,
  getDanhSachDuyetMuaHang,
  getProducts
} from '@/store/accountingInvoice';
import { getgetUserIIS } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';

// ----------------------------------------------------------------------------

export interface ProposalData {
  id: number;
  del: boolean;
  madvcs: string;
  recId: number;
  ma_ct: string;
  ngay_ct: string;
  so_ct: string;
  loai_tt: number;
  han_tt: string;
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
  createDate: string;
  capDuyet: number;
  capDuyetHienTai?: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  recIdparent: number;
  nguoiDuyet1: string;
  nguoiDuyet2: string;
  nguoiDuyet3: string;
  recIdrelation: number;
  guid: string;
  nguoiDuyet4: string;
  nguoiDuyet5: string;
  guidRelation: string;
  chiTietHangHoa: any; // Assuming null can later be replaced with specific type
  hoaDonVAT: any; // Assuming null can later be replaced with specific type
  list_of_extensions: any; // Assuming null can later be replaced with specific type
  chiTietDeNghiMuaHang: ChiTietDeNghiMuaHangDTO[];
  color?: string;
  importFull?: boolean;
  imported?: boolean;
  daChiTien?: number;
  ma_nv_bh?: string;
  da_thanh_toan_chuyen_khoan?: number;
  da_thanh_toan_tien_mat?: number;
}

export interface DayDataType {
  date: string;
  proposals: ProposalData[];
  badgeCount?: any;
  totalDayMoney?: any;
}

interface Opts {
  dateRange?: { startDate: Dayjs; endDate: Dayjs };
}

const calculateCapDuyet = (proposal: ProposalData): number => {
  return proposal.nguoiDuyet1 === ''
    ? 0
    : proposal.nguoiDuyet2 === ''
      ? 1
      : proposal.nguoiDuyet3 === ''
        ? 2
        : proposal.nguoiDuyet4 === ''
          ? 3
          : proposal.nguoiDuyet5 === ''
            ? 4
            : 5;
};

const groupByDate = (data: ProposalData[]): DayDataType[] => {
  const groupedData = data.reduce((acc, item) => {
    const date = dayjs(item.createDate).format(formatDateDisplay);

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);

    return acc;
  }, {} as Record<string, ProposalData[]>);

  const sortedData = Object.keys(groupedData)
    .map(date => ({
      date,
      proposals: groupedData[date].sort((a, b) => dayjs(b.createDate).diff(dayjs(a.createDate))), // Sắp xếp mỗi ngày theo phút
    }))
    .sort((a, b) => dayjs(a.date, formatDateDisplay).unix() - dayjs(b.date, 'DD/MM/YYYY').unix());

  return sortedData;
};

function groupByGuidMaster(items: any[]): Record<string, any[]> {
  if (items) {
    return items.reduce((acc, item) => {
      if (!acc[item.guid_master]) {
        acc[item.guid_master] = [];
      }
      acc[item.guid_master].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }
  return {};
}

// --------------------main-----------------------

export function useColoredProposals(type: eTypeVatTuMayMoc, opts: Opts = {}) {
  const dispatch = useAppDispatch();
  // const globalDate = useAppSelector(getDateRange());
  const dateRange = opts.dateRange;
  const rawProposals = useAppSelector(getDanhSachDuyetMuaHang());
  const projectWarehouses = useAppSelector((st: RootState) => st.project.projectwarehouseResponse);
  const selectedProject = useAppSelector(getSelectedProject());
  const productList = useAppSelector(getProducts());

  const DanhSachMayMoc = productList.filter(item => item.productType === 2);
  const DanhSachVatTu = productList.filter(item => item.productType !== 2)
  // const machineList = useAppSelector(getMayMoc());
  const userIIS = useAppSelector(getgetUserIIS());

  const [proposals, setProposals] = useState<ProposalData[]>(rawProposals);
  const [nhapKho, setNhapKho] = useState<Record<string, any[]>>();
  const [coloredData, setColoredData] = useState<DayDataType[]>([]);
  const [session, setSession] = useState(Utils.generateRandomString(3));
  const prevDateRange = useRef<{ startDate: string; endDate: string } | null>(null);

  const getMaKhoCurrentProject = useCallback(() => {
    if (!selectedProject) return '';
    if (!projectWarehouses?.length) return '';
    const wh =
      type === eTypeVatTuMayMoc.MayMoc
        ? projectWarehouses.find(w => w.warehouseCode.includes('CCDC'))
        : projectWarehouses.find(w => !w.warehouseCode.includes('CCDC'));
    return wh?.warehouseCode ?? '';
  }, [projectWarehouses, selectedProject, type]);

  const reload = useCallback(() => setSession(Utils.generateRandomString(3)), []);

  // phieu de nghi mua hang --------------
  useEffect(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return;

    const currentRange = {
      startDate: dayjs(dateRange.startDate).format(FormatDateAPI),
      endDate: dayjs(dateRange.endDate).format(FormatDateAPI),
    };

    // Chỉ gọi API khi dateRange thực sự thay đổi
    if (
      !prevDateRange.current ||
      prevDateRange.current.startDate !== currentRange.startDate ||
      prevDateRange.current.endDate !== currentRange.endDate
    ) {
      prevDateRange.current = currentRange;

      dispatch(
        accountingInvoiceActions.GetDanhSachDuyetMuaHang({
          params: {
            madvcs: 'THUCHIEN',
            ngay_de_nghi_tu_ngay: currentRange.startDate,
            ngay_de_nghi_den_ngay: currentRange.endDate,
            ma_kho: getMaKhoCurrentProject(),
          },
        }),
      );
    }
  }, [dispatch, dateRange, getMaKhoCurrentProject]);

  useEffect(() => {
    setProposals(rawProposals);

  }, [rawProposals]);

  // ------ phieu nhap kho -------
  useEffect(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return;
    let isMounted = true;
    const subscription = AccountingInvoiceService.Get.GetDanhSachPhieuNhapKho({
      search: {
        madvcs: 'THUCHIEN',
        ngay_de_nghi_tu_ngay: dayjs(dateRange.startDate).format(FormatDateAPI),
        ngay_de_nghi_den_ngay: dayjs(dateRange.endDate).format(FormatDateAPI),
        ma_kho: getMaKhoCurrentProject(),
      },
    }).subscribe(res => {
      if (isMounted) {
        const parsed = res.map((i: string) => (i ? JSON.parse(i) : []));
        setNhapKho(groupByGuidMaster(parsed[2]));
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dateRange, getMaKhoCurrentProject]);

  //  data
  useEffect(() => {
    if (!Array.isArray(proposals) || proposals.length === 0) {
      setColoredData([]);
      return;
    }
    const mapped: ProposalData[] = proposals.flatMap(p => {
      const ma_vt = p.chiTietDeNghiMuaHang?.[0]?.ma_vt;
      if (!ma_vt) return [];
      const prod = DanhSachVatTu.find(v => v.ma_vt === ma_vt); // vật tư
      const mach = DanhSachMayMoc.find(m => m.ma_vt === ma_vt); // máy móc

      const ok =
        (type === eTypeVatTuMayMoc.MayMoc && !!mach) ||
        (type !== eTypeVatTuMayMoc.MayMoc &&
          !!prod &&
          ((type === eTypeVatTuMayMoc.VatTuChinh && prod.productType === eTypeVatTu.VatTuChinh) ||
            (type === eTypeVatTuMayMoc.VatTuPhu && prod.productType === eTypeVatTu.VatTuPhu)));
      if (!ok) {
        return [];
      }

      // double check nhập kho
      let importFull = false,
        imported = false;
      if (nhapKho) {
        const importSum = Object.values(nhapKho).find(v => v[0].guid_master === p.guid);
        importFull = importSum
          ? p.chiTietDeNghiMuaHang.every(i => {
            const nk = importSum.find(n => n.ma_vt === i.ma_vt);
            return nk && parseFloat(nk.tong_luong_nhap) >= (i.so_luong_nhap1 ?? 0);
          })
          : false;
        imported = importSum?.some(nk => parseFloat(nk.tong_luong_nhap) > 0) ?? false;
      }

      return [{ ...p, key: Utils.generateRandomString(15), importFull, imported }];
    });

    const capDuyetChi = userIIS?.[0]?.capDuyetChi ?? 0;
    const sorted = mapped.sort((a, b) => {
      const ca = calculateCapDuyet(a),
        cb = calculateCapDuyet(b);
      if (ca < capDuyetChi && cb >= capDuyetChi) return -1;
      if (ca >= capDuyetChi && cb < capDuyetChi) return 1;
      return ca - cb;
    });

    const filtered = sorted.filter(p => calculateCapDuyet(p) >= p.capDuyet);

    const grouped = groupByDate(filtered).map(d => ({
      ...d,
      // badgeCount: d.proposals.filter(p => !p.importFull).length,
      totalDayMoney: d.proposals.reduce(
        (s, p) => s + p.chiTietDeNghiMuaHang.reduce((t, i) => t + (i.so_luong_nhap1 ?? 0) * (i.gia ?? 0), 0),
        0,
      ),
    }));


    setColoredData(grouped);
  }, [proposals, nhapKho, productList, type, userIIS]);

  const overallTotal = useMemo(() => coloredData.reduce((s, d) => s + (d.totalDayMoney ?? 0), 0), [coloredData]);
  coloredData.sort((a, b) => dayjs(b.date, formatDateDisplay).unix() - dayjs(a.date, formatDateDisplay).unix());

  return { coloredData, overallTotal, reload, session };
}
