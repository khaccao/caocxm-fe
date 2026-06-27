/* eslint-disable import/order */
import dayjs, { Dayjs } from 'dayjs';

import { CategoryCodes, FormatDateAPI, tkNoMap } from '@/common/define';
import { ExtensionDTO, InvoiceDto } from '@/services/AccountingInvoiceService';
import { IGroupRecord } from '../PlanTable';

// ------------------------------------------------

export interface CostItem {
  name: string;
  money: number;
  transfer?: number;
  total_Expenditure?: number;
  hoaDonVAT?: InvoiceDto[];
  list_of_extensions?: ExtensionDTO[];
  maKho?: string;
  projectCode?: string;
  projectId?: string;
  projectName?: string;
  nv_bh?: string;
  createdBy?: string;
  subContractorCode?: string;
  createDate?: string;
  ma_nv_bh?: string;
  debt?: number;
  ma_kh?: string;
  ncc?: string;
  tkNo?: string | null;
  tkCo?: string | null;
  maKM?: string;
  guid?: string;
  sourceProposal?: any;
}

export const pushGroup = (
  code: string,
  title: string,
  date: Dayjs | string,
  items: CostItem[],
  result: IGroupRecord[],
  getStt: () => string,
  incGroupIndex: () => number,
) => {
  if (items.length === 0) return;

  const totals = items.reduce(
    (acc, it) => {
      acc.transfer += it.transfer ?? 0;
      acc.cash += it.total_Expenditure ?? 0;
      acc.debt += it.debt ?? 0;
      return acc;
    },
    { transfer: 0, cash: 0, debt: 0 },
  );
  const totalMoney = totals.transfer + totals.cash + totals.debt;

  const curIndex = incGroupIndex();
  const roman = getStt();
  // group
  result.push({
    key: `group-${code}`,
    STT: roman,
    categoryCode: code,
    name: title,
    isGroup: true,
    money: totalMoney.toLocaleString('en-US'),
    transfer: totals.transfer.toLocaleString('en-US'),
    total_Expenditure: totals.cash.toLocaleString('en-US'),
  });
  // records in group
  items.forEach((it, idx) => {
    result.push({
      ...it,
      guid: it.guid ?? '',
      key: `${code}-item-${idx}`,
      STT: `${curIndex}.${idx + 1}`,
      categoryCode: code,
      name: it.name,
      isGroup: false,
      money: it.money.toLocaleString('en-US'),
      transfer: it.transfer ? it.transfer.toLocaleString('en-US') : '0',
      total_Expenditure: it.total_Expenditure ? it.total_Expenditure.toLocaleString('en-US') : '0',
      unit: 'Vnđ',
      paymentTermDate: typeof date === 'string' ? date : date.format(FormatDateAPI),
      hoaDonVAT: it.hoaDonVAT,
      list_of_extensions: it.list_of_extensions,
      createDate: dayjs(it.createDate).format(FormatDateAPI),
      projectName: it.projectName || '',
      projectId: it.projectId || '',
      projectCode: it.projectCode || '',
      nv_bh: it.nv_bh || '',
      ma_kh: it.ma_kh || '',
      ncc: it.ncc ? it.ncc : '',
      tkNo: it.tkNo || null,
      tkCo: it.tkCo || null,
      maKM: it.maKM || '',
      sourceProposal: it.sourceProposal,
      debt: it.debt ? it.debt.toLocaleString('en-US') : ((it.money ?? 0) - (it.transfer ?? 0) - (it.total_Expenditure ?? 0)).toLocaleString('en-US'),
    });
  });
};

export type TPaymentKind = 'cash' | 'transfer' | 'debt';

export const mapPaymentToInvoiceType = (kind: TPaymentKind) => (kind === 'cash' ? '3' : '5');

export const mapPaymentToTkCo = (kind: TPaymentKind) => (kind === 'cash' ? '1111' : '11211');

export const buildTkNo = (_kind: TPaymentKind, item: IGroupRecord) => {
  if (item.tkNo) return item.tkNo;
  return tkNoMap[item.categoryCode] ?? (item.employeeName ? '3341' : '3315');
};

export const groupItemsByCategoryCode = (items: IGroupRecord[]) => {
  const isSubContractor = (item: IGroupRecord) =>
    !!item.subContractorCode || !!item.isNTP || !!item.ncc;

  // Lọc CHÍNH XÁC chỉ items thuộc "subcontractor-advance" category
  const planItems = items.filter(
    i => i.categoryCode === 'subcontractor-advance' // ✅ Thay vì loại trừ
  );

  const subContractorAdvance = planItems.filter(isSubContractor);
  const salaryAdvance = planItems.filter(i => !isSubContractor(i));

  return {
    main: items.filter(i => i.categoryCode === CategoryCodes.MainMaterial),
    auxiliary: items.filter(i => i.categoryCode === CategoryCodes.AuxiliaryMaterial),
    machinery: items.filter(i => i.categoryCode === CategoryCodes.Machinery),
    incidental: items.filter(i => i.categoryCode === CategoryCodes.Incidental),
    subContractorAdvance,
    salaryAdvance,
  };
};

export const buildGhiChu = (item: IGroupRecord, subContractor?: any) => {
  switch (item.categoryCode) {
    case CategoryCodes.MainMaterial:
      return ['Tạm ứng mua vật tư chính', item.nv_bh, `Mã ${item.ma_nv_bh}`, item.projectName]
        .filter(Boolean)
        .join(' - ');
    case CategoryCodes.AuxiliaryMaterial:
      return ['Tạm ứng mua vật tư phụ', item.nv_bh, `Mã ${item.ma_nv_bh}`, item.projectName]
        .filter(Boolean)
        .join(' - ');
    case CategoryCodes.Machinery:
      return ['Tạm ứng mua máy móc', item.nv_bh, `Mã ${item.ma_nv_bh}`, item.projectName].filter(Boolean).join(' - ');
    case CategoryCodes.Incidental:
      return ['Tạm ứng chi phí phát sinh', item.createdBy, item.createdById, item.projectName]
        .filter(Boolean)
        .join(' - ');
    case 'Normal':
      if (item.subContractorCode) {
        return ['Tạm ứng nhà thầu phụ', subContractor.name, `Mã ${item.subContractorCode}`, item.projectName]
          .filter(Boolean)
          .join(' - ');
      } else {
        return ['Tạm ứng lương', item.employeeName, item.employerCode, item.projectName].filter(Boolean).join(' - ');
      }
    default:
      return ['Tạm ứng khác', item.employeeName, item.employerCode, item.projectName].filter(Boolean).join(' - ');
  }
};

export const buildMaDoiTuong = (item: IGroupRecord) => {
  switch (item.categoryCode) {
    case CategoryCodes.MainMaterial:
      return item.ma_kh || '';
    case CategoryCodes.AuxiliaryMaterial:
      return item.ma_kh || '';
    case CategoryCodes.Machinery:
      return item.ma_kh || '';
    case CategoryCodes.Incidental:
      return item.ncc || '';
    case CategoryCodes.subcontractorAdvance:
      if (item.isNTP || item.subContractorCode || item.ncc) {
        return item.ma_kh || item.subContractorCode || '';
      }
      return item.employerCode || '';
    default:
      return item.employerCode || '';
  }
};

export const buildMaKM = (item: IGroupRecord) => {

  switch (item.categoryCode) {
    case CategoryCodes.AuxiliaryMaterial:
    case CategoryCodes.Machinery:
      return item.projectCode || '';
    case CategoryCodes.Incidental:
      return item.maKM || '';
    case CategoryCodes.subcontractorAdvance:
      return item.projectCode || '';
    default:
      return item.projectCode || '';
  }
};

export function splitByField<T>(array: T[], field: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = String(item[field] || 'null');
    if (!acc[key]) acc[key] = [];

    acc[key].push(item);

    return acc;
  }, {} as Record<string, T[]>);
}
