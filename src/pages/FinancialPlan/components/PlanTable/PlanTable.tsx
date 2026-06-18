/* eslint-disable import/order */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { Input, InputNumber, Table, TableProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useTranslation } from 'react-i18next';

import {
  CategoryCodes,
  CreateAcountingInvoiceRequestDTO,
  EFinancialPlan,
  EFinancialPlanCode,
  EFinancialPlanNumber,
  EPaymentMethod,
  eTypeVatTuMayMoc,
  FormatDateAPI,
  formatDateDisplay,
  IBudgetEstimateByProjectResult,
} from '@/common/define';
import { ProposalData, useColoredProposals } from '@/hooks';
import {
  AccountingInvoiceService,
  AccountingInvoiceRequestDTO,
  ChiTietDeNghiMuaHangDTO,
  ChiTietHachToanDTO,
  DateFilterOptionsDTO,
  ExtensionDTO,
  IAdditionalCostUpdateRequest,
  IncidentalCostByRangeDate,
  InvoiceDto,
} from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import { accountingInvoiceActions, getDateFilterOptions, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { documentActions, getBudgetEstimateByProject } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { projectActions } from '@/store/project';
import Utils from '@/utils';
import { firstValueFrom } from 'rxjs';
import {
  buildGhiChu,
  buildMaDoiTuong,
  buildMaKM,
  buildTkNo,
  CostItem,
  groupItemsByCategoryCode,
  mapPaymentToInvoiceType,
  mapPaymentToTkCo,
  pushGroup,
  splitByField,
  TPaymentKind,
} from './helper';
import { getProjectIdByWarehouse, toNumber } from './utils';
import { buildCategoryType } from '../../PaymentPlan/helper/payment-plan';

dayjs.extend(isBetween);

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

const buildStableGuid = (input: string): string => {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x01000193;

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    hash1 ^= code;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 ^= code + i;
    hash2 = Math.imul(hash2, 0x811c9dc5);
  }

  const hex = [
    hash1 >>> 0,
    hash2 >>> 0,
    Math.imul(hash1 ^ hash2, 0x45d9f3b) >>> 0,
    Math.imul(hash2 ^ input.length, 0x45d9f3b) >>> 0,
  ].map(value => value.toString(16).padStart(8, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
};

const normalizeGuid = (value?: string | null): string => {
  if (value && value !== ZERO_GUID) return value;
  return '';
};

// ----------------------------------------------------------------
export const getConfirmLevel = (incidental: IncidentalCostByRangeDate) => {
  if (!incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 0;
  } else if (incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 1;
  } else if (incidental.isConfirmByRank2) {
    return 2;
  } else {
    return 3;
  }
};
interface IProps {
  typeEFinancialPlan: string;
  selectMonth: Dayjs | null;
  policies?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
  onUpdateButtonState?: () => void;
}
export interface IGroupRecord {
  guid?: string;
  key: string;
  STT: any;
  categoryCode: string;
  name: any;
  isGroup: boolean;
  companyId?: number;
  id?: number;
  money?: string;
  note?: string | null;
  paymentTerm?: number;
  paymentTermDate?: string;
  projectCode?: string | null;
  subContractorCode?: string | null;
  subContractorId?: number;
  titleCategory?: string;
  transfer?: string | null;
  unit?: string | null;
  type?: number;
  total_Expenditure?: number | string | null;
  paymentType?: number;
  hoaDonVAT?: InvoiceDto[];
  list_of_extensions?: ExtensionDTO[];
  maKho?: string;
  projectId?: string;
  projectName?: string;
  ng_tt?: string;
  nv_bh?: string;
  createdBy?: string;
  employerCode?: string;
  employeeName?: string;
  createdById?: string;
  maKM?: string;
  chiTietDeNghiMuaHang?: ChiTietDeNghiMuaHangDTO[];
  createDate?: string;
  ma_nv_bh?: string;
  debt?: string | number | null;
  ma_kh?: string;
  ncc?: string;
  contentCode?: any;
  isNTP?: boolean;
  sourceProposal?: ProposalData;
}
const PlanTable = forwardRef(function PlanTable(
  { typeEFinancialPlan, selectMonth, policies, onUpdateButtonState }: IProps,
  ref,
): React.JSX.Element {
  const dispatch = useAppDispatch();
  const tTable = useTranslation(['table']).t;

  const company = useAppSelector(getCurrentCompany());
  const loading = useAppSelector(getLoading('budgetEstimate'));

  const budgetEstimateByProjectDate = useAppSelector(getBudgetEstimateByProject());
  const additionalCost = useAppSelector(state => state.accountingInvoice.AdditionalCostsByRangeDate) ?? [];
  const wareHousesList = useAppSelector(getWareHouses());
  const projectCache: { [key: string]: { id: string; name: string; code: string } } = {};
  const subContractor = useAppSelector(state => state.project.SubContractor);
  const dateFilterOptions = useAppSelector(getDateFilterOptions());

  const [dataSource, setDataSource] = useState<IGroupRecord[]>([]);

  useImperativeHandle(ref, () => ({
    handleSave,
  }));

  // Map period code với typeEFinancialPlan
  const getPeriodCodeByType = (type: string): string => {
    switch (type) {
      case EFinancialPlan.KeHoachTamUng12:
        return EFinancialPlanCode.KeHoachTamUng12;
      case EFinancialPlan.KeHoachThanhToan20:
        return EFinancialPlanCode.KeHoachThanhToan20;
      case EFinancialPlan.KeHoachTamUng27:
        return EFinancialPlanCode.KeHoachTamUng27;
      case EFinancialPlan.KeHoachThanhToan05:
        return EFinancialPlanCode.KeHoachThanhToan05;
      default:
        return '';
    }
  };

  // Lấy period config từ DB
  const currentPeriod = useMemo(() => {
    const periodCode = getPeriodCodeByType(typeEFinancialPlan);
    const curPeriod = dateFilterOptions.find(option => option.code === periodCode);
    if (!curPeriod) {
      const startDay = typeEFinancialPlan === EFinancialPlan.KeHoachTamUng12 ? 5 : 20;
      const endDay = typeEFinancialPlan === EFinancialPlan.KeHoachTamUng12 ? 11 : 26;
      const defaultPeriod: DateFilterOptionsDTO = {
        id: 0,
        name: '',
        code: periodCode,
        startDay,
        endDay,
        startDate: '',
        endDate: '',
        type: 0,
      };
      return defaultPeriod;
    }
    return curPeriod;
  }, [dateFilterOptions, typeEFinancialPlan]);

  // Tính dateRange từ period config
  const dateRange = useMemo(() => {
    if (!selectMonth || !currentPeriod) return null;
    let start = selectMonth.clone().date(currentPeriod.startDay).startOf('day');
    let end = selectMonth.clone().date(currentPeriod.endDay).endOf('day');

    // Xử lý trường hợp endDay < startDay (vượt qua tháng)
    if (currentPeriod.endDay < currentPeriod.startDay) {
      end = end.add(1, 'month');
    }

    return {
      startDate: start,
      endDate: end,
    };
  }, [selectMonth, currentPeriod]);

  // Tính paymentTermDate từ period config
  const paymentTermDate = useMemo(() => {
    if (!selectMonth || !currentPeriod) return '';
    
    // Lấy ngày thanh toán từ period config
    // Ky01 -> ngày 12, Ky02 -> ngày 20, Ky03 -> ngày 27, Ky04 -> ngày 5
    let paymentDay: number;
    switch (currentPeriod.code) {
      case EFinancialPlanCode.KeHoachTamUng12:
        paymentDay = EFinancialPlanNumber.KeHoachTamUng12;
        break;
      case EFinancialPlanCode.KeHoachThanhToan20:
        paymentDay = EFinancialPlanNumber.KeHoachThanhToan20;
        break;
      case EFinancialPlanCode.KeHoachTamUng27:
        paymentDay = EFinancialPlanNumber.KeHoachTamUng27;
        break;
      case EFinancialPlanCode.KeHoachThanhToan05:
        paymentDay = EFinancialPlanNumber.KeHoachThanhToan05;
        break;
      default:
        paymentDay = EFinancialPlanNumber.KeHoachTamUng12;
    }

    return selectMonth.date(paymentDay).format(FormatDateAPI);
  }, [selectMonth, currentPeriod]);

  // Tính VTPMMDateRange từ period config (dùng cùng period với dateRange)
  const VTPMMDateRange = useMemo(() => {
    if (!selectMonth || !currentPeriod) return null;
    
    const baseDate = selectMonth;
    let start = baseDate.date(currentPeriod.startDay).startOf('day');
    let end = baseDate.date(currentPeriod.endDay).endOf('day');

    // Xử lý trường hợp endDay < startDay (vượt qua tháng)
    if (currentPeriod.endDay < currentPeriod.startDay) {
      end = end.add(1, 'month');
    }

    return {
      startDate: start,
      endDate: end,
    };
  }, [selectMonth, currentPeriod]);

  // Lấy periods từ DB khi component mount hoặc company thay đổi
  useEffect(() => {
    if (company?.id) {
      dispatch(accountingInvoiceActions.GetDateFilterOptions({ CompanyId: company.id }));
    }
  }, [company]);

  useEffect(() => {
    dispatch(
      accountingInvoiceActions.getAdditionalCostsByRangeDate({
        startDate: VTPMMDateRange?.startDate.format(FormatDateAPI) || '',
        endDate: VTPMMDateRange?.endDate.format(FormatDateAPI) || '',
      }),
    );
  }, [VTPMMDateRange]);

  const optsMayMoc = dateRange ? { dateRange } : {};
  const optsVatTuPhu = dateRange ? { dateRange } : {};
  const optsVatTuChinh = dateRange ? { dateRange } : {};

  const { coloredData: mayMocData } = useColoredProposals(eTypeVatTuMayMoc.MayMoc, optsMayMoc);
  const { coloredData: vatTuPhuData } = useColoredProposals(eTypeVatTuMayMoc.VatTuPhu, optsVatTuPhu);
  const { coloredData: vatTuChinhData } = useColoredProposals(eTypeVatTuMayMoc.VatTuChinh, optsVatTuChinh);

  const mapProposalToCostItem = async (p: ProposalData): Promise<CostItem | null> => {
    // Chỉ return khi daChiTien === 1 hoặc so_ct có dấu .
    if (!(p.so_ct.includes('.') || p.daChiTien === 1)) {
      return null;
    }

    const total = { cash: 0, transfer: 0, debt: 0 };

    p.chiTietDeNghiMuaHang.forEach((i: ChiTietDeNghiMuaHangDTO) => {
      const amount = (i.so_luong_nhap1 ?? 0) * (i.gia ?? 0)
        * ((i.vatRate === -1 ? 0 : i.vatRate) / 100 + 1);
      switch (i.hinhthuc_tt) {
        case EPaymentMethod.Cash:
          total.cash += amount;
          break;
        case EPaymentMethod.BankTransfer:
          total.transfer += amount;
          break;
        case EPaymentMethod.Debt:
          total.debt += amount;
          break;
      }
    });

    const maKho = p.chiTietDeNghiMuaHang[0]?.ma_kho;
    let projectId;
    let projectName = '';
    let projectIdRequest = '';
    let projectCode = '';
    if (maKho) {
      projectId = await getProjectIdByWarehouse(maKho, wareHousesList);
      projectIdRequest = projectId ? String(projectId) : '';
      if (projectCache[projectIdRequest]) {
        projectId = projectCache[projectIdRequest].id;
        projectName = projectCache[projectIdRequest].name;
        projectCode = projectCache[projectIdRequest].code;
      } else {
        try {
          const project = await firstValueFrom(ProjectService.Get.getProjectById(projectIdRequest));

          projectCode = project.code || '';
          projectName = project.name || '';
        } catch (err) {
          console.error('Lỗi khi fetch project trực tiếp:', err);
        }
      }
    }

    return {
      guid: p.guid,
      name: p.dien_giai?.trim() ? p.dien_giai : `Số chứng từ: ${p.so_ct}`,
      money: total.cash + total.transfer + total.debt,
      transfer: p.da_thanh_toan_chuyen_khoan ? p.da_thanh_toan_chuyen_khoan : total.transfer,
      total_Expenditure: p.da_thanh_toan_tien_mat ? p.da_thanh_toan_tien_mat : total.cash,
      debt: total.debt, // Thêm trường này
      hoaDonVAT: p.hoaDonVAT,
      list_of_extensions: p.list_of_extensions,
      maKho,
      projectId: projectIdRequest,
      projectName,
      projectCode,
      nv_bh: p.nv_bh || '',
      ma_nv_bh: p.ma_nv_bh || '',
      createDate: p.createDate || '',
      ma_kh: p.ma_kh || '',
      sourceProposal: p,
    };
  };
  const rawVatTuChinhProposals = useMemo(() => {
    return vatTuChinhData.length > 0 ? vatTuChinhData.flatMap(d => d.proposals) : [];
  }, [vatTuChinhData]);

  const rawVatTuPhuProposals = useMemo(() => {
    return vatTuPhuData.length > 0 ? vatTuPhuData.flatMap(d => d.proposals) : [];
  }, [vatTuPhuData]);

  const rawMayMocProposals = useMemo(() => {
    return mayMocData.length > 0 ? mayMocData.flatMap(m => m.proposals) : [];
  }, [mayMocData]);

  // Bước 2: State để lưu kết quả
  const [vatTuChinhItems, setVatTuChinhItems] = useState<CostItem[]>([]);
  const [vatTuPhuItems, setVatTuPhuItems] = useState<CostItem[]>([]);
  const [mayMocItems, setMayMocItems] = useState<CostItem[]>([]);

  // Bước 3: useEffect xử lý async cho Vật tư chính
  useEffect(() => {
    if (rawVatTuChinhProposals.length === 0) {
      setVatTuChinhItems([]);
      return;
    }

    let isCancelled = false;

    const process = async () => {
      const filteredVtc = rawVatTuChinhProposals.filter(vtc => { return vtc.so_ct.includes('.') || vtc.daChiTien === 1 })
      const items = await Promise.all(filteredVtc.map(mapProposalToCostItem));
      const filteredItems = items.filter((item): item is CostItem => item !== null);
      if (!isCancelled) {
        setVatTuChinhItems(filteredItems);
      }
    };

    process();

    return () => {
      isCancelled = true;
    };
  }, [rawVatTuChinhProposals, wareHousesList]);

  // Bước 4: useEffect xử lý async cho Vật tư phụ
  useEffect(() => {
    if (rawVatTuPhuProposals.length === 0) {
      setVatTuPhuItems([]);
      return;
    }

    let isCancelled = false;

    const process = async () => {
      const filteredVtp = rawVatTuPhuProposals.filter(vtp => { return vtp.so_ct.includes('.') || vtp.daChiTien === 1 })
      const items = await Promise.all(filteredVtp.map(mapProposalToCostItem));
      const filteredItems = items.filter((item): item is CostItem => item !== null);
      if (!isCancelled) {
        setVatTuPhuItems(filteredItems);
      }
    };

    process();

    return () => {
      isCancelled = true;
    };
  }, [rawVatTuPhuProposals, wareHousesList]);

  // Bước 5: useEffect xử lý async cho Máy móc
  useEffect(() => {
    if (rawMayMocProposals.length === 0) {
      setMayMocItems([]);
      return;
    }

    let isCancelled = false;

    const process = async () => {
      const filteredMm = rawMayMocProposals.filter(mm => { return mm.so_ct.includes('.') || mm.daChiTien === 1 })

      const items = await Promise.all(filteredMm.map(mapProposalToCostItem));
      const filteredItems = items.filter((item): item is CostItem => item !== null);
      if (!isCancelled) {
        setMayMocItems(filteredItems);
      }
    };

    process();

    return () => {
      isCancelled = true;
    };
  }, [rawMayMocProposals, wareHousesList]);

  useEffect(() => {
    if (typeEFinancialPlan && selectMonth && currentPeriod) {
      // Lấy ngày thanh toán từ period config
      let paymentDay: number;
      switch (currentPeriod.code) {
        case EFinancialPlanCode.KeHoachTamUng12:
          paymentDay = EFinancialPlanNumber.KeHoachTamUng12;
          break;
        case EFinancialPlanCode.KeHoachThanhToan20:
          paymentDay = EFinancialPlanNumber.KeHoachThanhToan20;
          break;
        case EFinancialPlanCode.KeHoachTamUng27:
          paymentDay = EFinancialPlanNumber.KeHoachTamUng27;
          break;
        case EFinancialPlanCode.KeHoachThanhToan05:
          paymentDay = EFinancialPlanNumber.KeHoachThanhToan05;
          break;
        default:
          paymentDay = EFinancialPlanNumber.KeHoachTamUng12;
      }
      const date = paymentDay;
      const paymentTerm = currentPeriod.code === EFinancialPlanCode.KeHoachTamUng27 ? 1 : 0;

      dispatch(
        documentActions.getBudgetEstimateByProjectRequest({
          companyId: 1,
          projectId: -1,
          paymentTerm,
          baseDate: `${selectMonth?.year()}-${selectMonth?.month() + 1}-${date}`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeEFinancialPlan, selectMonth, currentPeriod]);

  // ------------------------ Additional Cost ---------------------------

  const filteredCosts = useMemo(() => {
    if (!additionalCost.length || !dateRange) return [];
    // Đảm bảo endDate là cuối ngày
    const start = dayjs(dateRange.startDate).startOf('day');
    const end = dayjs(dateRange.endDate).endOf('day');
    return additionalCost.filter(cost => {
      if (getConfirmLevel(cost) !== 2) return false;
      const created = dayjs(cost.createDate);
      return created.isBetween(start, end, undefined, '[]');
    });
  }, [additionalCost, dateRange]);

  // ------------------------ End Additional Cost ---------------------------

  const updateTotalValues = (data: IGroupRecord[]) => {
    const groupAgg = data.reduce((acc, row) => {
      if (!row.isGroup) {
        const code = row.categoryCode;
        if (!acc[code]) acc[code] = { transfer: 0, cash: 0, debt: 0 };
        acc[code].transfer += toNumber(row.transfer);
        acc[code].cash += toNumber(row.total_Expenditure);
        acc[code].debt += toNumber(row.debt);
      }
      return acc;
    }, {} as Record<string, { transfer: number; cash: number; debt: number }>);

    const grand = Object.values(groupAgg).reduce(
      (g, t) => ({
        transfer: g.transfer + t.transfer,
        cash: g.cash + t.cash,
        debt: g.debt + t.debt,
      }),
      { transfer: 0, cash: 0, debt: 0 },
    );

    return data.map(r => {
      if (r.isGroup && groupAgg[r.categoryCode]) {
        const g = groupAgg[r.categoryCode];
        const money = g.transfer + g.cash + g.debt;
        return {
          ...r,
          transfer: g.transfer.toLocaleString('en-US'),
          total_Expenditure: g.cash.toLocaleString('en-US'),
          debt: g.debt.toLocaleString('en-US'),
          money: money.toLocaleString('en-US'),
        };
      }

      if (r.categoryCode === 'sumary-transfer') {
        return { ...r, transfer: grand.transfer.toLocaleString('en-US') };
      }
      if (r.categoryCode === 'sumary-debt') {
        return { ...r, debt: grand.debt.toLocaleString('en-US') };
      }
      if (r.categoryCode === 'sumary-money') {
        const money = grand.transfer + grand.cash + grand.debt;
        return {
          ...r,
          money: money.toLocaleString('en-US'),
          total_Expenditure: grand.cash.toLocaleString('en-US'),
        };
      }

      return r;
    });
  };

  useEffect(() => {
    if (dataSource.length > 0) {
      setDataSource(prevData => {
        const updatedData = prevData.map(item => {
          if (item.categoryCode === 'sumary-transfer') {
            const totalTransfer = prevData.reduce((sum, dataItem) => {
              if (dataItem.key !== 'group-total' && dataItem.key !== 'group-transfer' && dataItem.transfer) {
                return sum + toNumber(dataItem.transfer);
              }
              return sum;
            }, 0);
            return { ...item, transfer: totalTransfer.toLocaleString('en-US') };
          }
          if (item.categoryCode === 'sumary-debt') {
            const totalDebt = prevData.reduce((sum, dataItem) => {
              if (dataItem.key !== 'group-total' && dataItem.key !== 'group-transfer' && dataItem.debt) {
                return sum + toNumber(dataItem.debt);
              }
              return sum;
            }, 0);
            return { ...item, debt: totalDebt.toLocaleString('en-US') };
          }
          if (item.categoryCode === 'sumary-money') {
            const totalMoney = prevData.reduce((sum, dataItem) => {
              if (dataItem.key !== 'group-total' && dataItem.key !== 'group-transfer' && dataItem.money) {
                return sum + toNumber(dataItem.money);
              }
              return sum;
            }, 0);
            const totalExpenditure = prevData.reduce((sum, dataItem) => {
              if (dataItem.key !== 'group-total' && dataItem.key !== 'group-transfer' && dataItem.total_Expenditure) {
                return sum + toNumber(dataItem.total_Expenditure);
              }
              return sum;
            }, 0);

            return {
              ...item,
              money: totalMoney.toLocaleString('en-US'),
              total_Expenditure: totalExpenditure.toLocaleString('en-US'),
            };
          }
          return item;
        });

        return JSON.stringify(updatedData) !== JSON.stringify(prevData) ? updatedData : prevData;
      });
    }
  }, [filteredCosts, budgetEstimateByProjectDate]);

  const romanize = (num: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num - 1] || num.toString();
  };

  const addSTT = (data: IBudgetEstimateByProjectResult[]) => {
    const grouped = data.reduce((result, item) => {
      const key = item.categoryCode || 'Undefined';
      if (!result[key]) {
        result[key] = {
          titleCategory: item.titleCategory,
          items: [],
        };
      }
      result[key].items.push(item);
      return result;
    }, {} as Record<string, { titleCategory: string | null; items: IBudgetEstimateByProjectResult[] }>);

    let groupIndex = 0;
    const result: IGroupRecord[] = [];

    const incGroupIndex = () => ++groupIndex;
    const getRoman = () => romanize(groupIndex);

    Object.entries(grouped).forEach(([categoryCode, group]) => {
      if (group.items.length === 0) {
        return;
      }

      incGroupIndex();

      result.push({
        key: `group-subcontractor-advance`,
        STT: getRoman(),
        categoryCode: 'subcontractor-advance',
        name: group.titleCategory,
        isGroup: true,
      });

      group.items.forEach((item: any, idx) => {
        if (item.subContractorId) {
          dispatch(
            projectActions.getSubContractorRequest({
              subContractorId: item.subContractorId,
              options: {},
            }),
          );
        }

        const existingFolioId = normalizeGuid(item.folioID);
        const stableFolioId = existingFolioId || buildStableGuid([
          typeEFinancialPlan,
          paymentTermDate,
          item.categoryCode,
          item.employerCode,
          item.employeeName,
          item.projectCode,
          item.projectId,
        ].filter(value => value !== undefined && value !== null).join('|'));

        result.push({
          ...item,
          key: `${categoryCode}-item-${idx}`,
          STT: `${groupIndex}.${idx + 1}`,
          categoryCode: 'subcontractor-advance',
          name: item.name,
          isGroup: false,
          money: item?.money ? item?.money?.toLocaleString('en-US') : '0',
          transfer: item.transfer || '0',
          total_Expenditure: Number(item.money).toLocaleString('en-US') || '0',
          unit: 'Vnđ',
          paymentTermDate: item.paymentTermDate,
          note: buildGhiChu(item, subContractor),
          createDate: item.createDate || paymentTermDate,
          guid: stableFolioId,
          contentCode: item.subContractorCode ?? '',
          isNTP: true,
        });
      });
    });

    pushGroup(
      CategoryCodes.MainMaterial,
      'Chi phí công nợ vật tư chính',
      paymentTermDate,
      vatTuChinhItems,
      result,
      getRoman,
      incGroupIndex,
    );

    pushGroup(
      CategoryCodes.AuxiliaryMaterial,
      'Chi phí vật tư phụ',
      paymentTermDate,
      vatTuPhuItems,
      result,
      getRoman,
      incGroupIndex,
    );

    pushGroup(CategoryCodes.Machinery, 'Chi phí máy móc - CCDC', paymentTermDate, mayMocItems, result, getRoman, incGroupIndex);

    filteredCosts.sort((a, b) => {
      const dateA = dayjs(a.createDate);
      const dateB = dayjs(b.createDate);
      return dateB.isAfter(dateA) ? 1 : -1;
    });

    const incidentalItems: any = filteredCosts.map((c: any) => ({
      guid: c.folioID,
      name: c.payer,
      money: c.totalAmount,
      transfer: c.da_thanh_toan_chuyen_khoan ? c.da_thanh_toan_chuyen_khoan : c.transfer,
      total_Expenditure: c.da_thanh_toan_tien_mat ? c.da_thanh_toan_tien_mat : c.amount,
      createdBy: String(c.createdBy),
      createDate: c.createDate,
      projectName: c.projectName,
      projectCode: c.projectCode,
      ncc: c.ncc,
      maKM: c.maKM,
      projectId: c.projectId,
      note: buildGhiChu({
        categoryCode: CategoryCodes.Incidental,
        key: '',
        STT: undefined,
        name: c.payer,
        isGroup: false,
        projectName: c.projectName,
        projectCode: c.projectCode,
        projectId: c.projectId,
        createdBy: c.createdBy,
        createdById: c.createdById,
      }),
      contentCode: c.costCode ?? '',
      id: c.id ?? 0,
    }));

    pushGroup(
      CategoryCodes.Incidental,
      'Chi phí phát sinh ngoài',
      paymentTermDate,
      incidentalItems,
      result,
      getRoman,
      incGroupIndex,
    );

    const grand = result.reduce(
      (acc, r) => {
        if (r.isGroup) return acc;

        acc.money += toNumber(r.money);
        acc.transfer += toNumber(r.transfer);
        acc.cash += toNumber(r.total_Expenditure);
        return acc;
      },
      { money: 0, transfer: 0, cash: 0 },
    );

    // incGroupIndex();
    // const totalTransfer = {
    //   key: `group-transfer`,
    //   STT: getRoman(),
    //   categoryCode: 'sumary-transfer',
    //   name: 'Tổng chi chuyển khoản',
    //   isGroup: true,
    //   unit: 'Vnđ',
    //   transfer: grand.transfer.toLocaleString('en-US'),
    //   note: `${genNoteTotal(groupIndex)}`,
    // };
    // result.push(totalTransfer);

    // incGroupIndex();
    // const total = {
    //   key: `group-total`,
    //   STT: getRoman(),
    //   categoryCode: 'sumary-money',
    //   name: tTable('Total'),
    //   isGroup: true,
    //   unit: 'Vnđ',
    //   money: grand.money.toLocaleString('en-US'),
    //   note: `${genNoteTotal(groupIndex)}`,
    //   total_Expenditure: grand.cash.toLocaleString('en-US'),
    // };
    // result.push(total);

    const finalResult = result.map(item => {
      if (!item.isGroup && (item.note === null || item.note === undefined)) {
        return { ...item, note: buildGhiChu(item) };
      }
      return item;
    });

    return updateTotalValues(finalResult);
  };

  const genNoteTotal = (groupIndex: number) => {
    if (groupIndex > 0) {
      let index = 1;
      let res = `${romanize(groupIndex)} = ${romanize(index)}`;
      for (let i = index + 1; i < groupIndex; i++) {
        res += `+${romanize(i)}`;
      }
      return res;
    }
    return '';
  };

  const renderInputNumber = (_text: any, record: any, key: any) => {
    let inputSource: 'keyboard' | 'paste' | null = null;

    return (
      <InputNumber<number>
        type="n"
        style={{ textAlign: 'center', width: '100%' }}
        formatter={value => {
          if (!value) return '';
          const numValue = Number(value.toString().replace(/,/g, ''));
          return `${numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        }}
        value={_text === null || _text === undefined || _text === '' ? null : _text}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (/^\d$/.test(event.key)) {
            inputSource = 'keyboard';
          }
          
          // Handle "=" key press for auto-calculation
          if (event.key === '=' && (key === 'transfer' || key === 'total_Expenditure')) {
            const inputElement = event.currentTarget;
            const currentValue = toNumber(record[key] ?? 0);
            const isSelected = inputElement.selectionStart === 0 && inputElement.selectionEnd === inputElement.value.length;
            
            // Chỉ tính khi: giá trị = 0 hoặc rỗng hoặc đang select all
            if (currentValue === 0 || record[key] === null || record[key] === undefined || record[key] === '' || isSelected) {
              event.preventDefault();
              
              const totalMoney = toNumber(record.money);
              const transferValue = toNumber(record.transfer || 0);
              const cashValue = toNumber(record.total_Expenditure || 0);
              
              let calculatedValue = 0;
              if (key === 'transfer') {
                // Chuyển khoản = Tổng tiền - Tiền mặt
                calculatedValue = totalMoney - cashValue;
              } else if (key === 'total_Expenditure') {
                // Tiền mặt = Tổng tiền - Chuyển khoản
                calculatedValue = totalMoney - transferValue;
              }
              
              // Đảm bảo không âm
              calculatedValue = Math.max(0, calculatedValue);
              
              const updatedRecord = { ...record };
              updatedRecord[key] = calculatedValue.toString();
              
              // Tính lại công nợ
              const newTransferValue = key === 'transfer' ? calculatedValue : transferValue;
              const newCashValue = key === 'total_Expenditure' ? calculatedValue : cashValue;
              const calculatedDebt = totalMoney - newTransferValue - newCashValue;
              updatedRecord.debt = calculatedDebt.toString();
              
              setDataSource(prevData => {
                const newData = prevData.map(row => (row.key === record.key ? updatedRecord : row));
                return updateTotalValues(newData);
              });
              
              onUpdateButtonState?.();
            }
          }
        }}
        onChange={(v: number | null) => {
          const updatedRecord = { ...record };
          let newValue = v;
          if (Number(updatedRecord[key]) === 0 && inputSource === 'keyboard' && v && v !== 0) {
            newValue = Number(v.toString().replace("0", ""));
          }
          updatedRecord[key] = newValue !== null && newValue !== undefined ? newValue.toString() : null;

          // Tính lại công nợ: Công nợ = Tổng tiền - Chuyển khoản - Tiền mặt
          if (key === 'transfer' || key === 'total_Expenditure') {
            const newValue = v !== null && v !== undefined ? v : 0;
            const totalMoney = toNumber(record.money);
            const transferValue = key === 'transfer' ? newValue : toNumber(record.transfer || 0);
            const cashValue = key === 'total_Expenditure' ? newValue : toNumber(record.total_Expenditure || 0);
            const calculatedDebt = totalMoney - transferValue - cashValue;
            updatedRecord.debt = calculatedDebt.toString();
          }

          setDataSource(prevData => {
            const newData = prevData.map(row => (row.key === record.key ? updatedRecord : row));
            return updateTotalValues(newData);
          });
          
          // Enable button khi thay đổi transfer hoặc cash
          if ((key === 'transfer' || key === 'total_Expenditure')) {
            onUpdateButtonState?.();
          }
        }}
        onBlur={() => {
          const currentValue = record[key];
          const updatedRecord = { ...record };
          if (currentValue === null || currentValue === undefined || currentValue === '') {
            updatedRecord[key] = 0;
            setDataSource(prevData => {
              const newData = prevData.map(row => (row.key === record.key ? updatedRecord : row));
              return updateTotalValues(newData);
            });
          }
        }}
      />
    );
  };

  const renderTextArea = (_text: any, record: any, key: any) => {
    return (
      <Input.TextArea
        style={{ textAlign: 'center', width: '100%' }}
        value={record[key] ?? ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const updatedRecord = { ...record };
          updatedRecord[key] = e.target.value;

          setDataSource(prevData => {
            const newData = prevData.map(row => (row.key === record.key ? updatedRecord : row));
            return newData;
          });
        }}
        autoSize={{ minRows: 1, maxRows: 3 }}
      />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [Colums, setColums] = useState<TableProps<IGroupRecord>['columns']>([
    {
      dataIndex: 'STT',
      title: tTable('STT'),
      key: 'STT',
      width: 35,
      align: 'center',
      render: (value: any, record: any) => {
        return <span style={{ fontWeight: record.isGroup ? 'bold' : 'normal' }}>{value}</span>;
      },
    },
    {
      dataIndex: 'createDate',
      title: tTable('Plan.DisbursementDate'),
      key: 'createDate',
      width: 50,
      align: 'center',
      render: (value, record) => {
        const day = dayjs(value);
        return (
          <span style={{ fontWeight: record.isGroup ? 'bold' : 'normal' }}>
            {value ? day.format(formatDateDisplay) : ''}
          </span>
        );
      },
    },
    {
      dataIndex: 'name',
      title: tTable('Plan.WorkDescription'),
      key: 'name',
      width: 150,
      align: 'center',
      render: (value, record) => {
        return (
          <span
            style={{
              fontWeight: record.isGroup ? 'bold' : 'normal',
              textTransform: record.isGroup ? 'uppercase' : 'none',
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      dataIndex: 'unit',
      title: tTable('Plan.UnitOfMeasure'),
      key: 'unit',
      width: 50,
      align: 'center',
      render: value => {
        return <strong style={{ textTransform: 'uppercase' }}>{value}</strong>;
      },
    },
    {
      dataIndex: 'money',
      title: tTable('Plan.TotalMoney'),
      key: 'money',
      width: 120,
      align: 'center',
      render: (value, record) => {
        if (record.isGroup) {
          return <strong>{Math.round(toNumber(value)).toLocaleString('en-US')}</strong>;
        } else {
          // Tổng tiền không thay đổi, hiển thị giá trị gốc
          const originalMoney = toNumber(record.money || 0);
          return Math.round(originalMoney).toLocaleString('en-US');
        }
      },
    },
    {
      dataIndex: 'transfer',
      title: tTable('Plan.BankTransfer'),
      key: 'transfer',
      width: 120,
      align: 'center',
      render: (value, record) => {
        const isNTP = record.isNTP;
        if (record.isGroup || (record.categoryCode === 'subcontractor-advance' && isNTP)) {
          return <span style={{ fontWeight: record.isGroup ? 'bold' : 'normal' }}>{Math.round(toNumber(value)).toLocaleString('en-US')}</span>;
        } else {
          const numValue = value === null || value === undefined || value === '' ? null : Math.round(toNumber(value));
          return renderInputNumber(numValue, record, 'transfer');
        }
      },
    },
    {
      dataIndex: 'total_Expenditure', // Tiền mặt
      title: tTable('Plan.Cash'),
      key: 'total_Expenditure',
      width: 120,
      align: 'center',
      render: (value, record) => {
        const isNTP = record.isNTP;
        if (record.isGroup || (record.categoryCode === 'subcontractor-advance' && isNTP)) {
          return <span style={{ fontWeight: record.isGroup ? 'bold' : 'normal' }}>{Math.round(toNumber(value)).toLocaleString('en-US')}</span>;
        } else {
          const numValue = value === null || value === undefined || value === '' ? null : Math.round(toNumber(value));
          return renderInputNumber(numValue, record, 'total_Expenditure');
        }
      },
    },
    {
      dataIndex: 'debt', // Công nợ
      title: tTable('Plan.Debt'),
      key: 'debt',
      width: 120,
      align: 'center',
      render: (value, record) => {
        if (record.isGroup) {
          const formattedValue =
            typeof value === 'number'
              ? Math.round(value).toLocaleString('en-US')
              : Math.round(toNumber(value)).toLocaleString('en-US') || 0;
          return <strong>{formattedValue}</strong>;
        } else {
          // Hiển thị công nợ đã được tính: Tổng tiền - Chuyển khoản - Tiền mặt
          const totalMoney = toNumber(record.money || 0);
          const transferValue = toNumber(record.transfer || 0);
          const cashValue = toNumber(record.total_Expenditure || 0);
          const calculatedDebt = totalMoney - transferValue - cashValue;
          const roundedDebt = Math.round(calculatedDebt);
          const normalizedDebt = roundedDebt === 0 ? 0 : roundedDebt;
          return (
            <span style={{ fontWeight: record.isGroup ? 'bold' : 'normal' }}>
              {normalizedDebt.toLocaleString('en-US')}
            </span>
          );
        }
      },
    },

    {
      dataIndex: 'note',
      title: tTable('Plan.Notes'),
      key: 'note',
      width: 120,
      align: 'center',
      render: (value, record) => {
        if (record.isGroup) {
          return <strong>{value}</strong>;
        } else {
          return renderTextArea(value, record, 'note');
        }
      },
    },
  ]);

  useEffect(() => {
    if (budgetEstimateByProjectDate && budgetEstimateByProjectDate.length > 0) {
      setDataSource(addSTT(budgetEstimateByProjectDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetEstimateByProjectDate, filteredCosts, mayMocItems, vatTuPhuItems, vatTuChinhItems]);

  const prepareChiTietHachToan = (items: IGroupRecord[], kind: TPaymentKind): ChiTietHachToanDTO[] => {
    return items.map(item => {
      const ma_doi_tuong = buildMaDoiTuong(item);
      const ma_khoan_muc = buildMaKM(item);
      const tk_no = buildTkNo(kind, item);
      const tk_co = mapPaymentToTkCo(kind);
      const soTien = Math.round(
        kind === 'cash'
          ? toNumber(item.total_Expenditure)
          : kind === 'debt'
            ? toNumber(item.debt)
            : toNumber(item.transfer),
      );
      const ghi_chu = item.note ?? buildGhiChu(item);


      return {
        folioID: item.guid ?? '',
        ma_doi_tuong,
        ma_vu_viec: '',
        ma_khoan_muc,
        tk_no,
        tk_co,
        so_tien: soTien,
        so_tien_ngoai_te: 0,
        ghi_chu,
      };
    });
  };

  const prepareHoaDonVAT = (items: IGroupRecord[]): InvoiceDto[] => {
    // Lấy tất cả hóa đơn VAT từ các items 
    const all = items.flatMap(i => i.hoaDonVAT ?? []);

    const seen = new Set<string>();
    return all.filter(inv => {
      const key = inv.guid || `${inv.mau_So}-${inv.so_Serial}-${inv.so_Hd}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const prepareExtensions = (items: IGroupRecord[]): ExtensionDTO[] => {
    // Lấy tất cả các extension từ các items
    const allExt: ExtensionDTO[] = items.flatMap(i => i.list_of_extensions ?? []);

    const unique = new Map<string, ExtensionDTO>();

    allExt.forEach(ext => {
      const key = `${ext.extName}|${ext.extValue}`;
      if (!unique.has(key)) {
        unique.set(key, ext);
      }
    });

    return Array.from(unique.values());
  };

  const buildInvoiceBodyRequest = (kind: TPaymentKind, items: IGroupRecord[]): AccountingInvoiceRequestDTO => {
    const ngay_lap_chung_tu_date = items[0].createDate ? items[0].createDate : paymentTermDate;

    // Lấy ngày thanh toán từ period config
    let paymentDay: number = EFinancialPlanNumber.KeHoachTamUng12;
    if (currentPeriod) {
      switch (currentPeriod.code) {
        case EFinancialPlanCode.KeHoachTamUng12:
          paymentDay = EFinancialPlanNumber.KeHoachTamUng12;
          break;
        case EFinancialPlanCode.KeHoachThanhToan20:
          paymentDay = EFinancialPlanNumber.KeHoachThanhToan20;
          break;
        case EFinancialPlanCode.KeHoachTamUng27:
          paymentDay = EFinancialPlanNumber.KeHoachTamUng27;
          break;
        case EFinancialPlanCode.KeHoachThanhToan05:
          paymentDay = EFinancialPlanNumber.KeHoachThanhToan05;
          break;
      }
    }
    const base = selectMonth!;
    const ngayLapCT = dayjs(base.date(paymentDay)).format(formatDateDisplay);

    const codes = Array.from(new Set(items.map(i => i.projectCode).filter(Boolean)));
    const names = Array.from(new Set(items.map(i => i.projectName).filter(Boolean)));

    const projectCode = codes[0] || '';
    const projectName = names[0] || '';

    const dien_giai = `Tạm ứng ngày ${ngayLapCT}${projectCode ? ' - ' + projectCode : ''}${projectName ? ' - ' + projectName : ''
      }`;

    return {
      madvcs: 'THUCHIEN',
      ngay_thuc_hien: dayjs().format(FormatDateAPI),
      ngay_lap_chung_tu: dayjs(ngay_lap_chung_tu_date).format(FormatDateAPI),
      invoiceAPIType: mapPaymentToInvoiceType(kind),
      ma_ngoai_te: 'VND',
      dien_giai,

      chiTietHachToan: prepareChiTietHachToan(items, kind),
      hoaDonVAT: prepareHoaDonVAT(items),
      list_of_extensions: [
        {
          extName: 'FinancialPlanType',
          extValue: typeEFinancialPlan,
          extDescription: 'Kế hoạch tạm ứng',
        },
        ...prepareExtensions(items),
      ],
    };
  };

  const hasAccountingAmount = (item: IGroupRecord) => {
    const money = toNumber(item.money) ?? 0;
    const cash = toNumber(item.total_Expenditure) ?? 0;
    const transfer = toNumber(item.transfer) ?? 0;
    const debt = toNumber(item.debt) ?? 0;
    return money > 0 || cash > 0 || transfer > 0 || debt > 0;
  };

  const persistProposalPaymentValues = async (items: IGroupRecord[]) => {
    const materialCodes = new Set([CategoryCodes.MainMaterial, CategoryCodes.AuxiliaryMaterial, CategoryCodes.Machinery]);
    const updates = items
      .filter(item => materialCodes.has(item.categoryCode) && item.sourceProposal?.guid)
      .map(item => {
        const source = item.sourceProposal!;
        return AccountingInvoiceService.Post.CreateProposalForm({
          ...source,
          da_thanh_toan_tien_mat: toNumber(item.total_Expenditure),
          da_thanh_toan_chuyen_khoan: toNumber(item.transfer),
          hoaDonVAT: source.hoaDonVAT ?? [],
          list_of_extensions: source.list_of_extensions ?? [],
          chiTietHangHoa: source.chiTietHangHoa ?? [],
        } as any);
      });

    if (updates.length) {
      await Promise.all(updates.map(request => firstValueFrom(request)));
    }
  };

  const persistAdditionalCostPaymentValues = async (items: IGroupRecord[]) => {
    const incidental = groupItemsByCategoryCode(items).incidental;
    if (!incidental.length) return;

    const listRequest: IAdditionalCostUpdateRequest[] = [];
    incidental.forEach(i => {
      const findItem = filteredCosts.find(c => c.id === i.id);
      if (findItem) {
        const amount = toNumber(i.total_Expenditure) ?? 0;
        const transfer = toNumber(i.transfer) ?? 0;
        listRequest.push({
          ...findItem,
          amount,
          transfer,
          totalAmount: toNumber(i.money) ?? 0,
          paymentType: -1,
          id: i.id ?? findItem?.id ?? 0,
          isSynchronized: (amount > 0 || transfer > 0) ? 1 : 0,
        });
      }
    });

    if (listRequest.length) {
      await firstValueFrom(AccountingInvoiceService.Put.UpdateBeforeAccouttings(listRequest));
    }
  };

  const handleSave = async (): Promise<boolean> => {
    const raw = dataSource
      .filter(item => item.key !== 'group-total' && item.key !== 'group-transfer' && !item.isGroup)
      .filter(hasAccountingAmount);

    if (!raw.length) {
      Utils.errorNotification('Không có dữ liệu để tạo chứng từ.');
      return false;
    }

    // list request để gửi kế toán
    const listRequest: CreateAcountingInvoiceRequestDTO[] = [];

      raw.forEach(item => {
        const itemRequest: CreateAcountingInvoiceRequestDTO = {
          guid: item.guid ?? '',
          id: item.id ?? 0,
          createDate: item.createDate ?? '',
          paymentTermDate: item.paymentTermDate ?? '',
          categoryType: buildCategoryType(item),
          name: item.name ?? '',
          companyId: 0,
          projectCode: item.projectCode ?? '',
          projectId: String(item.projectId ?? ''),
          projectName: item.projectName ?? '',
          maKM: buildMaKM(item),
          money: toNumber(item.money) ?? 0,
          cash: toNumber(item.total_Expenditure) ?? 0,
          transfer: toNumber(item.transfer) ?? 0,
          debt: toNumber(item.debt) ?? 0,
          subContractorCode: item.subContractorCode ?? '',
          subContractorId: item.subContractorId ?? 0,
          unit: item.unit ?? '',
          createdBy: item.createdBy ?? '',
          employerCode: item.employerCode ?? '',
          employeeName: item.employeeName ?? '',
          createdById: item.createdById ?? '',
          maDT: buildMaDoiTuong(item),
          note: item.note ?? '',
          contentCode: item.contentCode ?? '',
        };
        listRequest.push(itemRequest);
      });
      if (listRequest.length) {
        try {
          const response = await firstValueFrom(AccountingInvoiceService.Post.CreateAcountingInvoice(listRequest));
          if (!response) {
            Utils.errorNotification('Luu hach toan that bai.');
            return false;
          }
        } catch (error) {
          console.error(error);
          Utils.errorNotification('Luu hach toan that bai.');
          return false;
        }
      }

    try {
      await Promise.all([
        persistProposalPaymentValues(raw),
        persistAdditionalCostPaymentValues(raw),
      ]);
    } catch (error) {
      console.error(error);
      Utils.errorNotification('Da hach toan nhung luu so tien ve bang nguon that bai.');
      return false;
    }
    return true;
    // const splitByDate = (items: IGroupRecord[]) => {
    //   return items.reduce((acc, item) => {
    //     const dateKey = item.createDate ? item.createDate : item.paymentTermDate || dayjs().format(FormatDateAPI);
    //     if (!acc[dateKey]) {
    //       acc[dateKey] = [];
    //     }
    //     acc[dateKey].push(item);
    //     return acc;
    //   }, {} as Record<string, IGroupRecord[]>);
    // };

    // if (salaryAdvance.length) {
    //   const byEmployer = splitByField(salaryAdvance, 'employerCode');

    //   Object.entries(byEmployer).forEach(([employerCode, items]) => {
    //     const cashItems = items.filter(i => toNumber(i.total_Expenditure) > 0);
    //     const transferItems = items.filter(i => toNumber(i.transfer) > 0);
    //     if (cashItems.length) {
    //       const bodyCash = buildInvoiceBodyRequest('cash', cashItems);
    //       dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash }));
    //     }
    //     if (transferItems.length) {
    //       const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);

    //       dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer }));
    //     }
    //   });
    // }

    // if (auxiliary.length) {
    //   const byMa_kh = splitByField(auxiliary, 'ma_kh');

    //   Object.entries(byMa_kh).forEach(([ma_kh, ma_khItems]) => {
    //     const byDate = splitByDate(ma_khItems);
    //     Object.entries(byDate).forEach(([date, dateItems]) => {
    //       const cashItems = dateItems.filter(item => toNumber(item.total_Expenditure) > 0);
    //       const transferItems = dateItems.filter(item => toNumber(item.transfer) > 0);

    //       const invoicePromises = [];

    //       if (cashItems.length) {
    //         const bodyCash = buildInvoiceBodyRequest('cash', cashItems);
    //         invoicePromises.push(dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash })));
    //       }

    //       if (transferItems.length) {
    //         const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);
    //         invoicePromises.push(dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer })));
    //       }
    //     });
    //   });
    // }

    // if (main.length) {
    //   const byMa_kh = splitByField(main, 'ma_kh');

    //   Object.entries(byMa_kh).forEach(([ma_kh, ma_khItems]) => {
    //     const byDate = splitByDate(ma_khItems);
    //     Object.entries(byDate).forEach(([date, dateItems]) => {
    //       const cashItems = dateItems.filter(item => toNumber(item.total_Expenditure) > 0);
    //       const transferItems = dateItems.filter(item => toNumber(item.transfer) > 0);

    //       const invoicePromises = [];

    //       if (cashItems.length) {
    //         const bodyCash = buildInvoiceBodyRequest('cash', cashItems);
    //         invoicePromises.push(dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash })));
    //       }

    //       if (transferItems.length) {
    //         const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);
    //         invoicePromises.push(dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer })));
    //       }
    //     });
    //   });
    // }
    // if (machinery.length) {
    //   const byMa_kh = splitByField(machinery, 'ma_kh');

    //   Object.entries(byMa_kh).forEach(([ma_kh, items]) => {
    //     const byDate = splitByDate(items);
    //     Object.entries(byDate).forEach(([date, items]) => {
    //       const cashItems = items.filter(i => toNumber(i.total_Expenditure) > 0);
    //       const transferItems = items.filter(i => toNumber(i.transfer) > 0);
    //       if (cashItems.length) {
    //         const bodyCash = buildInvoiceBodyRequest('cash', cashItems);

    //         dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash }));
    //       }
    //       if (transferItems.length) {
    //         const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);

    //         dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer }));
    //       }
    //     });
    //   });
    // }

    // if (incidental.length) {

    //   const byNcc = splitByField(incidental, 'ncc');

    //   Object.entries(byNcc).forEach(([ncc, items]) => {
    //     const byDate = splitByDate(items);
    //     Object.entries(byDate).forEach(([date, items]) => {
    //       const cashItems = items.filter(i => toNumber(i.total_Expenditure) > 0);
    //       const transferItems = items.filter(i => toNumber(i.transfer) > 0);
    //       if (cashItems.length) {
    //         const bodyCash = buildInvoiceBodyRequest('cash', cashItems);

    //         dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash }));
    //       }
    //       if (transferItems.length) {
    //         const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);

    //         dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer }));
    //       }
    //     });
    //   });
    // }

    // if (subContractorAdvance.length) {
    //   const bySubContractor = splitByField(subContractorAdvance, 'subContractorCode');

    //   Object.entries(bySubContractor).forEach(([subContractorCode, items]) => {
    //     const cashItems = items.filter(i => toNumber(i.total_Expenditure) > 0);
    //     const transferItems = items.filter(i => toNumber(i.transfer) > 0);
    //     if (cashItems.length) {
    //       const bodyCash = buildInvoiceBodyRequest('cash', cashItems);

    //       dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyCash }));
    //     }
    //     if (transferItems.length) {
    //       const bodyTransfer = buildInvoiceBodyRequest('transfer', transferItems);

    //       dispatch(accountingInvoiceActions.CreateAccountingInvoice({ data: bodyTransfer }));
    //     }
    //   });
    // }
  };

  const renderSummary: TableProps<IGroupRecord>['summary'] = pageData => {
    let transfer = 0;
    let cash = 0;
    let debt = 0;
    pageData.forEach(r => {
      if (!r.isGroup) {
        transfer += toNumber(r.transfer);
        cash += toNumber(r.total_Expenditure);
        debt += toNumber(r.debt);
      }
    });
    const grand = transfer + cash + debt;

    return (
      <Table.Summary fixed="bottom">
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={4} align="center">
            <strong>TỔNG CHI CHUYỂN KHOẢN</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} align="center">
            <strong>{Math.round(transfer).toLocaleString('en-US')}</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={6} align="center" />
          <Table.Summary.Cell index={7} />
          <Table.Summary.Cell index={8} />
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={4} align="center">
            <strong>TỔNG CÔNG NỢ</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} align="center" />
          <Table.Summary.Cell index={6} align="center" />

          <Table.Summary.Cell index={7} align="center" />

          <Table.Summary.Cell index={8} align="center">
            <strong>{Math.round(debt).toLocaleString('en-US')}</strong>
          </Table.Summary.Cell>

          <Table.Summary.Cell index={9} />
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={4} align="center">
            <strong>TỔNG CỘNG</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} align="center">
            <strong>{Math.round(grand).toLocaleString('en-US')}</strong>
          </Table.Summary.Cell>

          <Table.Summary.Cell index={6} />

          <Table.Summary.Cell index={7} align="center" colSpan={1}>
            <strong>{Math.round(cash).toLocaleString('en-US')}</strong>
          </Table.Summary.Cell>

          <Table.Summary.Cell index={8} colSpan={2} />
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  return (
    <div>
      <Table
        loading={loading}
        summary={renderSummary}
        dataSource={dataSource}
        columns={Colums}
        scroll={{ x: 800, y: 'calc(100vh - 275px)' }}
        expandable={{
          showExpandColumn: false,
        }}
        pagination={false}
      />
    </div>
  );
});

export default PlanTable;
PlanTable.displayName = 'PlanTable';
