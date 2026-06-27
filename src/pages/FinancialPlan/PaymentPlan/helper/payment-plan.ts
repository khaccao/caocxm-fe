/* eslint-disable import/order */
import dayjs, { Dayjs } from 'dayjs';

import { CategoryCodes, FormatDateAPI, tkNoMap } from '@/common/define';
import { ExtensionDTO, InvoiceDto } from '@/services/AccountingInvoiceService';
import { IGroupRecord } from '../views/PaymentCost';

// ------------------------------------------------

export interface CostItem {
  guid?: string;
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
  debt?: number;
  createDate: string;
  ma_nv_bh?: string;
  ma_kh?: string;
  ncc?: string;
  maKM?: string;
  tkNo?: string | null;
  tkCo?: string | null;
  isSalaryItem?: boolean;
  additionalCostGroupMode?: 'date' | 'project';
  sourceProposal?: any;
  id?: number;
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
  if (!items || items.length === 0) return;

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
    debt: totals.debt.toLocaleString('en-US'),
  });

  // records in group
  items.forEach((it, idx) => {
    result.push({
      ...it,
      guid: it.guid,
      key: `${code}-item-${idx}`,
      STT: `${curIndex}.${idx + 1}`,
      categoryCode: code,
      name: it.name,
      isGroup: false,
      money: it.money.toLocaleString('en-US'),
      transfer: it.transfer ? it.transfer.toLocaleString('en-US') : '0',
      total_Expenditure: it.total_Expenditure ? it.total_Expenditure.toLocaleString('en-US') : '0',
      debt: it.debt ? it.debt.toLocaleString('en-US') : ((it.money ?? 0) - (it.transfer ?? 0) - (it.total_Expenditure ?? 0)).toLocaleString('en-US'),
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
      maKM: it.maKM || '',
      tkNo: it.tkNo || '',
      tkCo: it.tkCo || '',
      isSalaryItem: it.isSalaryItem ?? false,
      sourceProposal: it.sourceProposal,
      id: it.id ?? 0,
    });
  });
};

export type TPaymentKind = 'cash' | 'transfer' | 'debt';

export const mapPaymentToInvoiceType = (kind: TPaymentKind) => (kind === 'cash' ? '3' : kind === 'debt' ? '1' : '5');

export const mapPaymentToTkCo = (kind: TPaymentKind) => (kind === 'cash' ? '1111' : '11211');

export const buildTkNo = (item: IGroupRecord) => {
  if (item.tkNo) return item.tkNo;
  return tkNoMap[item.categoryCode] ?? '';

}

export const buildTkCo = (item: IGroupRecord, kind: TPaymentKind) => {
  if (item.tkCo) return item.tkCo;
  return mapPaymentToTkCo(kind);
}

export const groupItemsByCategoryCode = (items: IGroupRecord[]) => {

  return {
    mainMachiery: items.filter(i => i.categoryCode === CategoryCodes.MainMaterial),
    auxiliary: items.filter(i => i.categoryCode === CategoryCodes.AuxiliaryMaterial),
    machinery: items.filter(i => i.categoryCode === CategoryCodes.Machinery),
    incidental: items.filter(i => i.categoryCode === CategoryCodes.Incidental),
  };
};

export const buildCategoryType = (item: IGroupRecord) => {
  const isSubContractor = (item: IGroupRecord) =>
    item.categoryCode === CategoryCodes.subcontractorAdvance && !!item.subContractorCode;
  const UngTien = item?.type === 1;
  switch (item.categoryCode) {
    case CategoryCodes.MainMaterial:
      return 0;
    case CategoryCodes.AuxiliaryMaterial:
      return 1;
    case CategoryCodes.Machinery:
      return 2;
    case CategoryCodes.Incidental:
      return 5;
    case CategoryCodes.subcontractorAdvance:
      if (isSubContractor(item) || !UngTien) {
        return 3;
      } else {
        return 4;
      }
    case CategoryCodes.salariesPayment:
      return 6;
    default:
      return 0;
  }
  }

export const buildGhiChu = (item: IGroupRecord) => {
  switch (item.categoryCode) {
    case CategoryCodes.MainMaterial:
      return [
        'Thanh toán công nợ vật tư chính',
        item.nv_bh,
        `Mã ${item.ma_nv_bh}`,
        item.projectName,
      ].filter(Boolean).join(' - ');
    case CategoryCodes.AuxiliaryMaterial:
      return [
        'Thanh toán chi mua vật tư phụ',
        item.nv_bh,
        `Mã ${item.ma_nv_bh}`,
        item.projectName,
      ].filter(Boolean).join(' - ');
    case CategoryCodes.Machinery:
      return [
        'Thanh toán chi mua máy móc',
        item.nv_bh,
        `Mã ${item.ma_nv_bh}`,
        item.projectName,
      ].filter(Boolean).join(' - ');
    case CategoryCodes.Incidental:
      return [
        'Thanh toán chi phí phát sinh',
        item.createdBy,
        item.createdById,
        item.projectName,
      ].filter(Boolean).join(' - ');
    case CategoryCodes.subcontractorAdvance:
      return [
        'Thanh toán thầu phụ',
        item.name,
        item.subContractorCode ? `Mã ${item.subContractorCode}` : '',
        item.projectCode,
      ].filter(Boolean).join(' - ');
    default:
      return [
        'Thanh toán chi mua khác',
        item.employeeName,
        item.employerCode,
      ].filter(Boolean).join(' - ');
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
      return item.ma_kh || item.ncc || item.subContractorCode || '';
    default:
      return item.employerCode || '';
  }
};

export const buildMaKM = (item: IGroupRecord) => {

  switch (item.categoryCode) {
    case CategoryCodes.MainMaterial:
    case CategoryCodes.AuxiliaryMaterial:
    case CategoryCodes.Machinery:
      return item.projectCode || '';
    case CategoryCodes.Incidental:
      return item.maKM || '';
    case CategoryCodes.subcontractorAdvance:
      return item.maKM || item.projectCode || '';
    default:
      return item.projectCode || '';
  }
}

export function splitByField<T>(array: T[], field: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = String(item[field] || 'null');
    if (!acc[key]) acc[key] = [];

    acc[key].push(item);

    return acc;
  }, {} as Record<string, T[]>);
}
