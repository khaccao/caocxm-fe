/* eslint-disable import/order */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { Input, InputNumber, Table, TableProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import {
  accountingInvoice,
  CategoryCodes,
  CreateAcountingInvoiceRequestDTO,
  EFinancialPlan,
  EFinancialPlanCode,
  EFinancialPlanNumber,
  EPaymentMethod,
  ePeriodCode,
  eTypeVatTuMayMoc,
  FormatDateAPI,
  formatDateDisplay,
  IEmployeeSalariesPayDTO,
} from '@/common/define';
import { DayDataType, ProposalData, useColoredProposals } from '@/hooks';
import {
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';
import { firstValueFrom } from 'rxjs';
import { getProjectIdByWarehouse, toNumber } from '../../components/PlanTable/utils';
import {
  buildCategoryType,
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
} from '../helper/payment-plan';
import { getSelectedProject } from '@/store/project';
import { employeeActions, getEmployees, getEmployeeSalariesPays } from '@/store/employee';

dayjs.extend(isBetween);

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
  nv_bh?: string;
  createdBy?: string;
  employerCode?: string;
  employeeName?: string;
  createdById?: string;
  maKM?: string;
  chiTietDeNghiMuaHang?: ChiTietDeNghiMuaHangDTO[];
  debt?: string | number | null;
  createDate?: string;
  ma_nv_bh?: string;
  ma_kh?: string;
  ncc?: string;
  contentCode?: any;
  isSalaryItem?: boolean;
}

export interface PaymentCostRef {
  handleSave: () => void;
}

const PaymentCost = forwardRef<PaymentCostRef, IProps>(function PlanTable(
  { typeEFinancialPlan, selectMonth, policies, onUpdateButtonState },
  ref,
): React.JSX.Element {
  const dispatch = useAppDispatch();
  const tTable = useTranslation(['table']).t;

  const company = useAppSelector(getCurrentCompany());
  const loading = useAppSelector(getLoading(accountingInvoice.getAdditionalCostsByRangeDate));

  const additionalCost = useAppSelector(state => state.accountingInvoice.AdditionalCostsByRangeDate) ?? [];
  const wareHousesList = useAppSelector(getWareHouses());
  const dateFilterOptions = useAppSelector(getDateFilterOptions());
  const employeeSalariesPays = useAppSelector(getEmployeeSalariesPays());

  const projectCache: { [key: string]: { id: string; name: string; code: string } } = {};

  const [dataSource, setDataSource] = useState<IGroupRecord[]>([]);
  const [vatTuChinhItems, setVatTuChinhItems] = useState<CostItem[]>([]);
  const [vatTuPhuItems, setVatTuPhuItems] = useState<CostItem[]>([]);
  const [mayMocItems, setMayMocItems] = useState<CostItem[]>([]);
  const selectedProject = useAppSelector(getSelectedProject());
  const employees = useAppSelector(getEmployees());

  const BCHemployees = useMemo(
    () => employees?.results.filter(e => e.groupCodes?.includes('BCH')) || [],
    [employees?.results],
  );

  const NVemployees = useMemo(
    () => employees?.results.filter(e => !BCHemployees.some(b => b.id === e.id)) || [],
    [employees?.results, BCHemployees],
  );

  const NVEmployeeIds = useMemo(() => NVemployees.map(e => e.id), [NVemployees]);
  const BCHEmployeeIds = useMemo(() => BCHemployees.map(e => e.id), [BCHemployees]);

  useImperativeHandle(ref, () => ({ handleSave }));

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
      const startDay = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05 ? 27 : 12;
      const endDay = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05 ? 4 : 19;
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

    // Xử lý trường hợp endDay < startDay (vượt qua tháng) - cần lùi về tháng trước cho start
    if (currentPeriod.endDay < currentPeriod.startDay) {
      start = start.subtract(1, 'month');
      end = end; // end đã ở tháng hiện tại
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

  const optsVatTuChinh = useMemo(() => dateRange ? { dateRange, typeEFinancialPlan } : { typeEFinancialPlan }, [dateRange, typeEFinancialPlan]);
  const optsVatTuPhu = useMemo(() => dateRange ? { dateRange, typeEFinancialPlan } : { typeEFinancialPlan }, [dateRange, typeEFinancialPlan]);
  const optsMayMoc = useMemo(() => dateRange ? { dateRange, typeEFinancialPlan } : { typeEFinancialPlan }, [dateRange, typeEFinancialPlan]);

  const { coloredData: vatTuChinhData } = useColoredProposals(eTypeVatTuMayMoc.VatTuChinh, optsVatTuChinh);
  const { coloredData: mayMocData } = useColoredProposals(eTypeVatTuMayMoc.MayMoc, optsMayMoc);
  const { coloredData: vatTuPhuData } = useColoredProposals(eTypeVatTuMayMoc.VatTuPhu, optsVatTuPhu);

  // Tính VTCDateRange từ period config
  const VTCDateRange = useMemo(() => {
    if (!selectMonth || !currentPeriod) return null;
    
    const baseDate = selectMonth;
    let start = baseDate.date(currentPeriod.startDay).startOf('day');
    let end = baseDate.date(currentPeriod.endDay).endOf('day');

    // Xử lý trường hợp endDay < startDay (vượt qua tháng)
    if (currentPeriod.endDay < currentPeriod.startDay) {
      start = start.subtract(1, 'month');
      end = end;
    }

    return {
      startDate: start,
      endDate: end,
    };
  }, [selectMonth, currentPeriod]);

  // Tính VTPMMDateRange từ period config
  const VTPMMDateRange = useMemo(() => {
    if (!selectMonth || !currentPeriod) return null;
    
    const baseDate = selectMonth;
    let start = baseDate.date(currentPeriod.startDay).startOf('day');
    let end = baseDate.date(currentPeriod.endDay).endOf('day');

    // Xử lý trường hợp endDay < startDay (vượt qua tháng)
    if (currentPeriod.endDay < currentPeriod.startDay) {
      start = start.subtract(1, 'month');
      end = end;
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

  const { filteredVTC, filteredVTP, filteredMM } = useMemo(() => {
    let filteredVTC = vatTuChinhData;
    let filteredVTP = vatTuPhuData;
    let filteredMM = mayMocData;
    filteredVTC = vatTuChinhData.filter((item: DayDataType) => {
      const filter = item.proposals.filter(vtc => { return vtc.so_ct.includes('.') || vtc.daChiTien === 1 })
      return filter.some((proposal: ProposalData) => {
        const createDate = dayjs(proposal.createDate);
        return createDate.isBetween(VTPMMDateRange?.startDate, VTPMMDateRange?.endDate, 'day', '[]');
      });
    });
    filteredVTP = vatTuPhuData.filter((item: DayDataType) => {
      const filter = item.proposals.filter(vtp => { return vtp.so_ct.includes('.') || vtp.daChiTien === 1 })
      return filter.some((proposal: ProposalData) => {
        const createDate = dayjs(proposal.createDate);
        return createDate.isBetween(VTPMMDateRange?.startDate, VTPMMDateRange?.endDate, 'day', '[]');
      });
    });

    filteredMM = mayMocData.filter((item: DayDataType) => {
      const filter = item.proposals.filter(mm => { return mm.so_ct.includes('.') || mm.daChiTien === 1 })
      return filter.some((proposal: ProposalData) => {
        const createDate = dayjs(proposal.createDate);
        return createDate.isBetween(VTPMMDateRange?.startDate, VTPMMDateRange?.endDate, 'day', '[]');
      });
    });

    return { filteredVTC, filteredVTP, filteredMM };
  }, [vatTuChinhData, vatTuPhuData, mayMocData, VTCDateRange, VTPMMDateRange, typeEFinancialPlan]);
  // lọc vatTuChinhData có hinhthuc_tt là 2 => công nợ
  // const filteredVatTuChinhData = filteredVTC.filter((item: any) => {
  //   return item.proposals.some((proposal: ProposalData) => {
  //     return proposal.chiTietDeNghiMuaHang.some((detail: ChiTietDeNghiMuaHangDTO) => detail.hinhthuc_tt === 2);
  //   });
  // });

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
      if (projectIdRequest) {
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
    }

    return {
      guid: p.guid,
      name: p.dien_giai?.trim() ? p.dien_giai : `Số chứng từ: ${p.so_ct}`,
      money: total.cash + total.transfer + total.debt,
      transfer: p.da_thanh_toan_chuyen_khoan ? p.da_thanh_toan_chuyen_khoan : total.transfer,
      total_Expenditure: p.da_thanh_toan_tien_mat ? p.da_thanh_toan_tien_mat : total.cash,
      debt: total.debt,
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
    };
  };

  const processVatTuChinhItems = async () => {
    const proposals = filteredVTC.flatMap(d => d.proposals);
    const items = await Promise.all(proposals.map(mapProposalToCostItem));
    const filteredItems = items.filter((item): item is CostItem => item !== null);
    setVatTuChinhItems(filteredItems);
  };

  const processVatTuPhuItems = async () => {
    const proposals = filteredVTP.flatMap(d => d.proposals);
    const items = await Promise.all(proposals.map(mapProposalToCostItem));
    const filteredItems = items.filter((item): item is CostItem => item !== null);
    setVatTuPhuItems(filteredItems);
  };

  const processMayMocItems = async () => {
    const proposals = filteredMM.flatMap(m => m.proposals);
    const items = await Promise.all(proposals.map(mapProposalToCostItem));
    const filteredItems = items.filter((item): item is CostItem => item !== null);
    setMayMocItems(filteredItems);
  };

  useEffect(() => {

    if (filteredVTC.length > 0) {
      processVatTuChinhItems();
    } else {
      setVatTuChinhItems([]);
    }

    if (filteredVTP.length > 0) {
      processVatTuPhuItems();
    } else {
      setVatTuPhuItems([]);
    }

    if (filteredMM.length > 0) {
      processMayMocItems();
    } else {
      setMayMocItems([]);
    }
  }, [filteredVTC, filteredVTP, filteredMM, wareHousesList, typeEFinancialPlan]);

  // ------------------------ Additional Cost ---------------------------

  useEffect(() => {
    dispatch(
      accountingInvoiceActions.getAdditionalCostsByRangeDate({
        startDate: VTPMMDateRange?.startDate.format(FormatDateAPI) || '',
        endDate: VTPMMDateRange?.endDate.format(FormatDateAPI) || '',
      }),
    );
  }, [VTPMMDateRange]);

  useEffect(() => {
    const dayWorking = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05 ? '20' : '05';
    const workingDay = dayWorking === '20' 
      ? selectMonth?.subtract(1, 'month').date(+dayWorking).format('YYYY-MM-DD')
      : selectMonth?.date(+dayWorking).format('YYYY-MM-DD');
    const body = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05
      ? [
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEDAY5,
          type: 0,
          employeeIds: NVEmployeeIds,
        },
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEBCH,
          type: 0,
          employeeIds: BCHEmployeeIds,
        }
      ]
      : [
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEDAY20,
          type: 0,
          employeeIds: NVEmployeeIds,
        }
      ];
    dispatch(
      employeeActions.getEmployeeSalariesPaysRequest({
        companyId: company.orgId,
        body
      }),
    );
  }, [selectMonth,typeEFinancialPlan, company.orgId, NVEmployeeIds, BCHEmployeeIds]);

  const filteredCosts = useMemo(() => {
    if (!additionalCost.length || !VTPMMDateRange) return [];
    const start = dayjs(VTPMMDateRange.startDate).startOf('day');
    const end = dayjs(VTPMMDateRange.endDate).endOf('day');
    return additionalCost.filter(cost => {
      if (getConfirmLevel(cost) !== 2) return false;

      const created = dayjs(cost.createDate);
      return created.isBetween(start, end);
    });
  }, [additionalCost, VTPMMDateRange]);
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
  }, [filteredCosts, vatTuPhuItems, vatTuChinhItems, mayMocItems]);

  const romanize = (num: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num - 1] || num.toString();
  };

  const addSTT = () => {
    let groupIndex = 0;
    const result: IGroupRecord[] = [];

    const incGroupIndex = () => ++groupIndex;
    const getRoman = () => romanize(groupIndex);
    
    const salaryItems: any = employeeSalariesPays?.map((s: IEmployeeSalariesPayDTO) => ({
      guid: s.folioID,
      name: s.contentName,
      money: s.totalAmount,
      transfer: s.transfer,
      total_Expenditure: s.amount,
      createdBy: String(s.createdBy),
      createDate: s.createDate,
      projectId: '',
      projectName: '',
      projectCode: '',
      ncc: '',
      maKM: '',
      note: s.notes,
      contentCode: s.contentCode,
      paymentType: s.paymentType,
      isSalaryItem: true,
    }));

    pushGroup(
      CategoryCodes.salariesPayment,
      'Thanh toán lương',
      paymentTermDate,
      salaryItems,
      result,
      getRoman,
      incGroupIndex,
    );

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

    pushGroup(
      CategoryCodes.Machinery,
      'Chi phí máy móc - CCDC',
      paymentTermDate,
      mayMocItems,
      result,
      getRoman,
      incGroupIndex,
    );

    const incidentalItems: any = filteredCosts.map((c: IncidentalCostByRangeDate) => ({
      guid: c.folioID,
      name: c.payer,
      money: c.totalAmount,
      transfer: c.da_thanh_toan_chuyen_khoan ? c.da_thanh_toan_chuyen_khoan : c.transfer,
      total_Expenditure: c.da_thanh_toan_tien_mat ? c.da_thanh_toan_tien_mat : c.amount,
      createdBy: String(c.createdBy),
      createDate: c.createDate,
      projectId: c.projectId,
      projectName: c.projectName,
      projectCode: c.projectCode,
      ncc: c.ncc,
      maKM: c.maKM,
      note: buildGhiChu({
        categoryCode: CategoryCodes.Incidental,
        key: '',
        STT: undefined,
        name: c.createdBy,
        isGroup: false,
        projectName: c.projectName,
        projectCode: c.projectCode,
        projectId: c.projectId.toString(),
        createdBy: c.createdBy,
        createdById: c.projectId.toString(),
      }),
      contentCode: c.costCode ?? '',
      id: c.id,
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
        acc.debt += toNumber(r.debt);
        return acc;
      },
      { money: 0, transfer: 0, cash: 0, debt: 0 },
    );


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
        if (record.isGroup) {
          return <strong>{Math.round(toNumber(value)).toLocaleString('en-US')}</strong>;
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
        if (record.isGroup) {
          return <strong>{Math.round(toNumber(value)).toLocaleString('en-US')}</strong>;
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
          return <strong>{Math.round(toNumber(value)).toLocaleString('en-US')}</strong>;
        } else {
          // Hiển thị công nợ đã được tính: Tổng tiền - Chuyển khoản - Tiền mặt
          const totalMoney = toNumber(record.money || 0);
          const transferValue = toNumber(record.transfer || 0);
          const cashValue = toNumber(record.total_Expenditure || 0);
          const calculatedDebt = totalMoney - transferValue - cashValue;
          const roundedDebt = Math.round(calculatedDebt);
          const normalizedDebt = roundedDebt === 0 ? 0 : roundedDebt;
          return <span>{normalizedDebt.toLocaleString('en-US')}</span>;
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
    setDataSource(addSTT());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCosts, vatTuPhuItems, vatTuChinhItems, mayMocItems, employeeSalariesPays]);

  const prepareChiTietHachToan = (items: IGroupRecord[], kind: TPaymentKind): ChiTietHachToanDTO[] => {
    return items.map(item => {
      const ma_doi_tuong = buildMaDoiTuong(item);
      const ma_khoan_muc = buildMaKM(item);
      const tk_no = buildTkNo(item);
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
    const ngay_lap_chung_tu_date = items[0]?.createDate ? dayjs(items[0].createDate) : paymentTermDate;

    // Lấy ngày thanh toán từ period config
    let dayOfMonth: number = 5;
    if (currentPeriod) {
      switch (currentPeriod.code) {
        case EFinancialPlanCode.KeHoachTamUng12:
          dayOfMonth = EFinancialPlanNumber.KeHoachTamUng12;
          break;
        case EFinancialPlanCode.KeHoachThanhToan20:
          dayOfMonth = EFinancialPlanNumber.KeHoachThanhToan20;
          break;
        case EFinancialPlanCode.KeHoachTamUng27:
          dayOfMonth = EFinancialPlanNumber.KeHoachTamUng27;
          break;
        case EFinancialPlanCode.KeHoachThanhToan05:
          dayOfMonth = EFinancialPlanNumber.KeHoachThanhToan05;
          break;
      }
    }
    const base = selectMonth!;
    const ngayLapCT = dayjs(base.date(dayOfMonth)).format(formatDateDisplay);

    const codes = Array.from(new Set(items.map(i => i.projectCode).filter(Boolean)));
    const names = Array.from(new Set(items.map(i => i.projectName).filter(Boolean)));

    const projectCode = codes[0] || '';
    const projectName = names[0] || '';

    const dien_giai = `Thanh toán ngày ${ngayLapCT}${projectCode ? ' - ' + projectCode : ''}${projectName ? ' - ' + projectName : ''
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
          extName: 'PaymentPlan',
          extValue: typeEFinancialPlan,
          extDescription: 'Kế hoạch thanh toán',
        },
        ...prepareExtensions(items),
      ],
    };
  };

    const handleSave = () => {
      const raw = dataSource.filter(item => item.key !== 'group-total' && item.key !== 'group-transfer' && !item.isGroup);

      if (!raw.length) {
        Utils.errorNotification('Không có dữ liệu để tạo chứng từ.');
        return;
      }

      // list request để gửi kế toán
      const listRequest: CreateAcountingInvoiceRequestDTO[] = [];
      raw.forEach(item => {
        const categoryType = buildCategoryType(item);
        const itemRequest: CreateAcountingInvoiceRequestDTO = {
          guid: item.guid ?? '',
          id: item.id ?? 0,
          createDate: item.createDate ?? '',
          paymentTermDate: item.paymentTermDate ?? '',
          categoryType,
          name: item.name ?? '',
          companyId: 0,
          projectCode: item.projectCode ?? '',
          projectId:  String(item.projectId ?? ''),
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

      const salaryUpdateItems = raw.map(item => {
          if (item.isSalaryItem) {
            const findItem = employeeSalariesPays?.find(s => s.folioID === item.guid);
            const temp: IEmployeeSalariesPayDTO = {
              companyId: findItem?.companyId ?? 0,
              contentName: findItem?.contentName ?? '',
              contentCode: findItem?.contentCode ?? '',
              unit: findItem?.unit ?? '',
              createdBy: findItem?.createdBy ?? '',
              notes: findItem?.notes ?? '',
              createdById: findItem?.createdById ?? 0,
              createDate: findItem?.createDate ?? '',
              amount: toNumber(item.total_Expenditure) ?? 0,
              transfer: toNumber(item.transfer) ?? 0,
              quantity: findItem?.quantity ?? 0,
              totalAmount: toNumber(item.money) ?? 0,
              folioID: findItem?.folioID ?? '',
              paymentType: findItem?.paymentType ?? 0,
              periodCode: findItem?.periodCode ?? '',
              type: findItem?.type ?? 0,
              startDate: findItem?.startDate ?? '',
              endDate: findItem?.endDate ?? '',
            };
            return temp;
          }
          return null;
        })
        .filter((item): item is IEmployeeSalariesPayDTO => item !== null);
      if (salaryUpdateItems?.length) {
        const dayWorking = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05 ? '20' : '05';
        const workingDay = dayWorking === '20' 
          ? selectMonth?.subtract(1, 'month').date(+dayWorking).format('YYYY-MM-DD')
          : selectMonth?.date(+dayWorking).format('YYYY-MM-DD');
        const bodyGet = typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05
      ? [
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEDAY5,
          type: 0,
          employeeIds: NVEmployeeIds,
        },
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEBCH,
          type: 0,
          employeeIds: BCHEmployeeIds,
        }
      ]
      : [
        {
          workingDay,
          periodCode: ePeriodCode.PERIODCODEDAY20,
          type: 0,
          employeeIds: NVEmployeeIds,
        }
      ];
        dispatch(employeeActions.updateEmployeeSalariesPaysRequest({ companyId: company.orgId, body: salaryUpdateItems, bodyGet }));
      }
      if (listRequest.length) {
        dispatch(accountingInvoiceActions.createAcountingInvoiceRequest({ data: listRequest }));
      }

      // old logic
      const { incidental } = groupItemsByCategoryCode(raw);
      if (incidental.length) {
        const listRequest: any[] = [];
        incidental.forEach(i => {
          const findItem = filteredCosts.find(c => c.id === i.id);
          if (findItem) {
            const amount = toNumber(i.total_Expenditure) ?? 0;
            const transfer = toNumber(i.transfer) ?? 0;
            const item: IAdditionalCostUpdateRequest = {
              ...findItem,
              amount,
              transfer,
              totalAmount: toNumber(i.money) ?? 0,
              paymentType: -1,
              id: i.id ?? findItem?.id ?? 0,
              isSynchronized: (amount > 0 || transfer > 0) ? 1 : 0,
            };
            listRequest.push(item);
          }
        });
        if (listRequest.length) {
          dispatch(accountingInvoiceActions.updateBeforeAccouttings({ dataCreates: listRequest, companyId: company.id }));
        }
      }
      //   const findItems = incidental.filter(i => i.id ===);
      //   console.log('findItems', findItems);
      // }
      // const splitByDate = (items: IGroupRecord[]) => {
      //   return items.reduce((acc, item) => {
      //     const dateKey = item.createDate || item.paymentTermDate || paymentTermDate;
      //     if (!acc[dateKey]) {
      //       acc[dateKey] = [];
      //     }
      //     acc[dateKey].push(item);
      //     return acc;
      //   }, {} as Record<string, IGroupRecord[]>);
      // };

      // if (mainMachiery.length) {
      //   const byMa_kh = splitByField(mainMachiery, 'ma_kh');

      //   Object.entries(byMa_kh).forEach(([ma_kh, items]) => {
      //     const byDate = splitByDate(items);
      //     Object.entries(byDate).forEach(([date, items]) => {
      //       const transferItems = items.filter(i => toNumber(i.transfer) > 0);
      //       const cashItems = items.filter(i => toNumber(i.total_Expenditure) > 0);
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

      // if (auxiliary.length) {
      //   const byMa_kh = splitByField(auxiliary, 'ma_kh');

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
    const grand = transfer + cash;

    return (
      <Table.Summary fixed="bottom">
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={4} align="center">
            <strong>TỔNG CHI CHUYỂN KHOẢN</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} align="center" />

          <Table.Summary.Cell index={6} align="center">
            <strong>{Math.round(transfer).toLocaleString('en-US')}</strong>
          </Table.Summary.Cell>

          <Table.Summary.Cell index={7} colSpan={3} />
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
          <Table.Summary.Cell index={6} align="center" />

          <Table.Summary.Cell index={7} align="center">
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
        summary={renderSummary}
        loading={loading}
        dataSource={dataSource}
        columns={Colums}
        scroll={{ x: 800, y: 'calc(100vh - 345px)' }}
        expandable={{
          showExpandColumn: false,
        }}
        pagination={false}
      />
    </div>
  );
});

export default PaymentCost;
PaymentCost.displayName = 'PaymentCost';
