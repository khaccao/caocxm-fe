/* eslint-disable import/order */
import { EmployeeSalaryStatementDTO } from '@/common/define';
import { AggregatedPayrollType, FundInfo, InsuranceInfo, PolicyInfo, SurchargeInfo } from '.';
import { ColumnMeta } from '../components/data';

// ------------------------------------------------------------
export const SPECIAL_CODES = new Set(['NVH02', 'DKT', 'BT', 'NVH01']);
export const SPECIAL_CAN_EDIT = new Set(['salaryAdvance_D20', 'signed']);
export const VISIBLE_FIELDS_SPECIAL = new Set([
  'stt',
  'key',
  'id',
  'employeeId',
  'employeeCode',
  'name',
  'baseSalary', // Tổng lương
  'salaryBalance', // Âm dương phát lương
  'salaryAdvance_D1227', // Ứng lương
  'salaryAdvance_D20', // Tiền ứng ngày 20/3
  'advanceAndUnion', // Tiền ứng (công đoàn + ứng)
  'netSalary', // Thực nhận
  'signed', // Ghi chú
]);

export interface Employee {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface PayrollStructureAnalysis {
  insurances: InsuranceInfo[];
  surcharges: SurchargeInfo[];
  funds: FundInfo[];
  policies: PolicyInfo[];
}

// get fullname of employee
export function buildEmployeeNameMap(employees: any): Record<number, string> {
  const map: Record<number, string> = {};
  employees.forEach((e: any) => {
    map[e?.id] = [e.lastName, e.middleName, e.firstName].filter(Boolean).join(' ').trim();
  });

  return map;
}

// Hàm group và aggregate dữ liệu theo employeeId
export function aggregateBCHPayrollData(data: EmployeeSalaryStatementDTO[], nameMap: any): AggregatedPayrollType[] {
  if (!data?.length) {
    return [];
  }

  const grouped = data.reduce((acc, record) => {
    const key = record.employeeId.toString();
    (acc[key] ??= []).push(record);
    return acc;
  }, {} as Record<string, EmployeeSalaryStatementDTO[]>);

  const aggregated: AggregatedPayrollType[] = Object.values(grouped).map(records =>
    applySpecialMask(aggregateBCHEmployeeRecords(records, nameMap)),
  );

  const normalRows: AggregatedPayrollType[] = [];
  const specialRows: AggregatedPayrollType[] = [];

  aggregated.forEach(row => {
    (SPECIAL_CODES.has(row.employeeCode!) ? specialRows : normalRows).push(row);
  });

  const resultRows = [...normalRows, ...specialRows].map((row, idx) => ({
    ...row,
    // stt: idx + 1,
  }));

  return resultRows;

  // return Object.values(grouped).map((records, idx) => {
  //   const aggregated = aggregateBCHEmployeeRecords(records, nameMap);
  //   return { ...aggregated, stt: idx + 1 };
  // });
}

// Hàm aggregate tất cả records của một employee
function aggregateBCHEmployeeRecords(records: EmployeeSalaryStatementDTO[], nameMap: any): AggregatedPayrollType {
  const firstRecord = records[0];

  const fullName = nameMap[firstRecord.employeeId] || '';

  const result: any = {
    key: firstRecord.employeeId.toString(),
    id: firstRecord.employeeId.toString(),
    employeeId: firstRecord.employeeId,
    employeeCode: firstRecord.employeeCode,
    signed: firstRecord.signed || '',
    name: fullName,
    dvt: 'VNĐ',
    kpiValue: firstRecord.kpiValue || 0,
    shiftOTTimeDic: firstRecord.shiftOTTimeDic,
    shiftMainTimeDic: firstRecord.shiftMainTimeDic,
    salaryOT: firstRecord.salaryOT || 0,
    salary: firstRecord.salary || 0,
    salaryAmount: firstRecord.salaryAmount || 0,
    performanceSalaryAmount: firstRecord.performanceSalaryAmount || 0,
    salaryMain: firstRecord.salaryMain || 0,
    salaryPerWorkHour: firstRecord.salaryPerWorkHour || 0,
    salaryPerWorkLabor: firstRecord.salaryPerWorkLabor || 0,
    baseSalary: firstRecord.employeeSalary.baseSalary || 0,
    fixedSalaryAmount: firstRecord.employeeSalary.fixedSalaryAmount || 0,
    unionFund: firstRecord.unionFund || 0,
    shiftMainTime: firstRecord.shiftMainTime || 0, // Công làm
    shiftOTTime: firstRecord.shiftOTTime || 0, // Tăng ca
    salaryAdvance_D20: firstRecord.salaryAdvance_D20 || 0, // Tiền ứng ngày 20
    salaryAdvance_D12: firstRecord.salaryAdvance_D12 || 0, // Ứng lương lần 1
    salaryAdvance_D27: firstRecord.salaryAdvance_D27 || 0, // Ứng lương lần 2
    salaryBalance_D12: firstRecord.salaryBalance_D12 || 0, // Âm dương phát lương 12
    salaryBalance_D27: firstRecord.salaryBalance_D27 || 0, // Âm dương phát lương 27
    protectiveGear: firstRecord.protectiveGear || 0, // Đồ bảo hộ

    locked: false,
  };

  const insuranceMap = new Map<string, number>();
  const surchargeMap = new Map<string, number>();
  const fundMap = new Map<string, number>();
  const policyMap = new Map<string, number>();

  // Duyệt qua tất cả records của employee này
  records.forEach(record => {
    // Aggregate insurances
    record.employeeInsurances?.forEach(insurance => {
      const key = insurance.insuranceName;
      result[key] = insurance.premium;
      insuranceMap.set(key, insurance.premium);
    });

    // Aggregate surcharges
    record.employeeSurcharges?.forEach(surcharge => {
      const key = surcharge.surchargeName;
      result[key] = surcharge.surchargeValue;
      surchargeMap.set(key, surcharge.surchargeValue);
    });

    // Aggregate funds
    record.employeeFunds?.forEach(fund => {
      const key = fund.fundName;
      result[key] = fund.contribution;
      fundMap.set(key, fund.contribution);
    });

    // Aggregate policies
    record.employeeSalaryPolicys?.forEach(policy => {
      const key = `policy${policy.salaryPolicyId}`;
      result[key] = policy.value;
      policyMap.set(key, policy.value);
    });
  });

  insuranceMap.forEach((value, key) => {
    result[key] = value;
  });

  surchargeMap.forEach((value, key) => {
    result[key] = value;
  });

  fundMap.forEach((value, key) => {
    result[key] = value;
  });

  policyMap.forEach((value, key) => {
    result[key] = value;
  });

  // Công làm trong tháng theo kỳ
  result.shiftMainTimeDic_Ky1 = Number((result.shiftMainTimeDic?.Ky1 || 0).toFixed(2));
  result.shiftMainTimeDic_Ky2 = Number((result.shiftMainTimeDic?.Ky2 || 0).toFixed(2));

  result.shiftOTTimeDic_Ky1 = Number(((result.shiftOTTimeDic?.Ky1InMinute /60 || 0)).toFixed(2));
  result.shiftOTTimeDic_Ky2 = Number(((result.shiftOTTimeDic?.Ky2InMinute /60 || 0)).toFixed(2));

  // BE trả về thời gian tăng ca theo phút, nên cần chia lại
  var OTTime_Ky1 = Number((result.shiftOTTimeDic?.Ky1 || 0).toFixed(2));
  var OTTime_Ky2 = Number((result.shiftOTTimeDic?.Ky2 || 0).toFixed(2));
  
  // Tổng công + tăng ca
  result.totalWorkAndOT = Number((
    (result.shiftMainTimeDic?.Ky1 || 0) +
    (result.shiftMainTimeDic?.Ky2 || 0) +
    (OTTime_Ky1 || 0) +
    (OTTime_Ky2 || 0)
  ).toFixed(2));

  // Mức lương/1 ngày
  if (result.employeeCode === 'BCH11') {
    result.salaryPerDay = Number(result.baseSalary / 30 || 0);
  } else {
    result.salaryPerDay = Number(result.baseSalary / 26 || 0);
  }

  // Lương cơ bản (60%)
  result.basicSalary = Number(Number(result.salaryPerDay) * result.totalWorkAndOT * 0.6) || 0;

  // Lương hiệu quả công việc (40%)
  result.performanceSalary =
    Number(((result.totalWorkAndOT * result.kpiValue * Number(result.salaryPerDay)) / 10).toFixed(0)) || 0;

  // Âm dương phát lương
  result.salaryBalance = result.salaryBalance_D12 + result.salaryBalance_D27;

  // Tiền ứng 12 vs 27
  result.salaryAdvance_D1227 = result.salaryAdvance_D12 + result.salaryAdvance_D27 || 0;

  // Tiền ứng (công đoàn + ứng)
  if (result.employeeCode === 'NVH02' || result.employeeCode === 'DKT' || result.employeeCode === 'BT' || result.employeeCode === 'NVH01') {
    result.advanceAndUnion = result.salaryAdvance_D1227 + result.salaryBalance + result.salaryAdvance_D20;
  } else {
    result.advanceAndUnion = result.unionFund + result.salaryAdvance_D1227 + result.salaryBalance + result.salaryAdvance_D20;
  }
  // Tổng lương = lương cơ bản + hiệu quả công việc
  result.totalMoney = result.basicSalary + result.performanceSalary;

  // Thực nhận
  const hoTro = Number(result['Hỗ trợ'] ?? 0);
  const truBHXH = Number(result['Trừ BHXH'] ?? 0);

  if (result.employeeCode === 'NVH02' || result.employeeCode === 'DKT' || result.employeeCode === 'BT'|| result.employeeCode === 'NVH01') {
    result.netSalary = result.baseSalary - result.advanceAndUnion;
  } else {
    result.netSalary = result.totalMoney - result.advanceAndUnion - result.protectiveGear - truBHXH + hoTro;
  }

  const skipRound = (key: string) =>
    key.includes('Time') || key === 'totalWorkAndOT' || key === 'kpiValue';

  Object.keys(result).forEach(key => {
    const v = result[key];
    if (typeof v === 'number' && !skipRound(key)) {
      result[key] = Math.round(v);
    }
  });

  return result;
}

// Phân tích structure cho dữ liệu đã aggregate
export function analyzeAggregatedStructure(data: EmployeeSalaryStatementDTO[]): PayrollStructureAnalysis {
  if (!data?.length) {
    return {
      insurances: [],
      surcharges: [],
      funds: [],
      policies: [],
    };
  }

  const insurances = new Map<number, InsuranceInfo>();
  const surcharges = new Map<number, SurchargeInfo>();
  const funds = new Map<number, FundInfo>();
  const policies = new Map<number, PolicyInfo>();

  data.forEach(record => {
    // insurances
    record.employeeInsurances?.forEach(insurance => {
      if (!insurances.has(insurance.insuranceId)) {
        insurances.set(insurance.insuranceId, {
          insuranceId: insurance.insuranceId,
          insuranceName: insurance.insuranceName,
        });
      }
    });

    // surcharges
    record.employeeSurcharges?.forEach(surcharge => {
      if (!surcharges.has(surcharge.surchargeId)) {
        surcharges.set(surcharge.surchargeId, {
          surchargeId: surcharge.surchargeId,
          surchargeName: surcharge.surchargeName,
        });
      }
    });

    // funds
    record.employeeFunds?.forEach(fund => {
      if (!funds.has(fund.fundId)) {
        funds.set(fund.fundId, {
          fundId: fund.fundId,
          fundName: fund.fundName,
        });
      }
    });

    // policies
    record.employeeSalaryPolicys?.forEach(policy => {
      if (!policies.has(policy.salaryPolicyId)) {
        policies.set(policy.salaryPolicyId, {
          salaryPolicyId: policy.salaryPolicyId,
          policyName: `Policy_${policy.salaryPolicyId}`,
          unit: policy.unit,
        });
      }
    });
  });

  return {
    insurances: Array.from(insurances.values()),
    surcharges: Array.from(surcharges.values()),
    funds: Array.from(funds.values()),
    policies: Array.from(policies.values()),
  };
}

// Tạo table columns cho dữ liệu aggregated
export function generateAggregatedBCHTableColumns(analysis: PayrollStructureAnalysis) {
  const columns: ColumnMeta[] = [
    { key: 'stt', title: 'STT', width: 60, editable: false, fixed: 'left' },
    { key: 'employeeCode', title: 'Mã NV', width: 100, editable: false, fixed: 'left' },
    { key: 'name', title: 'Tên nhân viên', width: 150, editable: false, fixed: 'left', align: 'left' },
    { key: 'baseSalary', title: 'Tổng lương', width: 84, type: 'currency', editable: true },
    { key: 'basicSalary', title: 'Lương cơ bản (60%)', width: 84, type: 'currency', editable: false },
    { key: 'performanceSalary', title: 'Hiệu quả công việc (40%)', width: 84, type: 'currency', editable: false },
    { key: 'salaryPerDay', title: 'Mức lương/1 ngày', width: 84, type: 'currency', editable: false },
    { key: 'kpiValue', title: 'Hệ số KPI', width: 70, type: 'number', editable: true },
  ];

  columns.push(
    {
      key: 'shiftOTTimeDic_Ky1',
      title: 'Tăng ca - kỳ 1',
      width: 84,
      type: 'number',
      editable: false,
    },
    {
      key: 'shiftMainTimeDic_Ky1',
      title: 'Công - kỳ 1',
      width: 84,
      type: 'number',
      editable: false,
    },
    {
      key: 'shiftOTTimeDic_Ky2',
      title: 'Tăng ca - kỳ 2',
      width: 84,
      type: 'number',
      editable: false,
    },
    {
      key: 'shiftMainTimeDic_Ky2',
      title: 'Công - kỳ 2',
      width: 84,
      type: 'number',
      editable: false,
    },
  );

  columns.push(
    { key: 'totalWorkAndOT', title: 'Tổng công + tăng ca', width: 84, type: 'number', editable: false },
    { key: 'totalMoney', title: 'Tổng lương', width: 84, type: 'currency', editable: false },
  );

  // Thêm columns cho bảo hiểm
  analysis.insurances.forEach(insurance => {
    columns.push({
      key: insurance.insuranceName,
      title: insurance.insuranceName,
      width: 84,
      type: 'currency',
      editable: true,
    });
  });

  // Thêm columns cho phụ cấp
  analysis.surcharges.forEach(surcharge => {
    columns.push({
      key: surcharge.surchargeName,
      title: surcharge.surchargeName,
      width: 84,
      type: 'currency',
      editable: true,
    });
  });

  // Thêm columns cho quỹ
  analysis.funds.forEach(fund => {
    columns.push({
      key: fund.fundName,
      title: fund.fundName,
      width: 84,
      type: 'currency',
      editable: false,
    });
  });

  columns.push(
    { key: 'unionFund', title: 'Công đoàn', width: 84, type: 'currency', editable: false },
    { key: 'salaryBalance', title: 'Âm dương phát lương', width: 84, type: 'currency', editable: false },
    { key: 'salaryAdvance_D20', title: 'Tiền ứng ngày 20', width: 84, type: 'currency', editable: true },
    { key: 'salaryAdvance_D1227', title: 'Tiền ứng ngày 12 và ngày 27', width: 84, type: 'currency', editable: false },
    { key: 'advanceAndUnion', title: 'Tiền ứng (công đoàn + ứng)', width: 84, type: 'currency', editable: false },
    { key: 'netSalary', title: 'Lương thực nhận', width: 84, type: 'currency', editable: false },
    { key: 'signed', title: 'Ký nhận', width: 84, editable: true },
  );

  return columns;
}

function applySpecialMask(row: AggregatedPayrollType) {
  if (!SPECIAL_CODES.has(row.employeeCode!)) return row;

  Object.keys(row).forEach(key => {
    if (!VISIBLE_FIELDS_SPECIAL.has(key)) {
      (row as any)[key] = '';
    }
  });

  return row;
}
