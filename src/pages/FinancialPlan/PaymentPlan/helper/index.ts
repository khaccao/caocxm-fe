import { EFinancialPlan, EmployeeSalaryStatementDTO } from '@/common/define';
import { ProjectResponse } from '@/common/project';

// ------------------------------------------------------------

export const MINUTE_PER_WORK = 480;
export interface Employee {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface PayrollStructureAnalysis {
  projects: ProjectInfo[];
  insurances: InsuranceInfo[];
  surcharges: SurchargeInfo[];
  funds: FundInfo[];
  policies: PolicyInfo[];
}

export interface ProjectInfo {
  projectId?: number;
  projectCode?: string;
  soCong?: any;
  operatorId: string;
  projectName: string;
}

export interface InsuranceInfo {
  insuranceId: number;
  insuranceName: string;
}

export interface SurchargeInfo {
  surchargeId: number;
  surchargeName: string;
}

export interface FundInfo {
  fundId: number;
  fundName: string;
}

export interface PolicyInfo {
  salaryPolicyId: number;
  policyName?: string;
  unit: string;
}

export interface AggregatedPayrollType {
  stt: number;
  key: string;
  id: string;
  employeeId: number;
  employeeCode: string;
  name: string;
  dvt: string;
  protectiveGear: number;
  salaryBalance: number;
  signed: string;

  projects: string[];
  periods: string[];
  salaryAdvance_D20: number;  // Cho anh Tú nhập
  salaryAdvance_D12: number;  // Ứng lương lần 1
  salaryAdvance_D27: number;  // Ứng lương lần 2
  salaryBalance_D12: number; // Âm dương phát lương 12
  salaryBalance_D27: number; // Âm dương phát lương 27
  totalWork: number;
  totalMoneyWork: number;
  advanceAndUnion: number; // Tiền ứng + công đoàn
  unionFund: number; // Quỹ công đoàn

  shiftMainTime: number;
  shiftMainTimeDic: {
    Ky1: number;
    Ky2: number;
  };
  shiftOTTime: number; // Tăng ca
  shiftOTTimeDic: {
    Ky1: number;
    Ky2: number;
  };

  locked?: boolean;

  [key: `${string}Work`]: number;
  [key: string]: number | string | boolean | undefined | string[] | Record<string, number>;
}

export interface PayrollCalculationOptions {
  typeEFinancialPlan: EFinancialPlan;
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
export function aggregatePayrollData(data: EmployeeSalaryStatementDTO[], nameMap: any, options?: PayrollCalculationOptions): AggregatedPayrollType[] {
  if (!data?.length) {
    return [];
  }

  const uniqueRecords = Object.values(
    data.reduce((acc, record) => {
      acc[record.employeeId] = record;
      return acc;
    }, {} as Record<number, EmployeeSalaryStatementDTO>)
  );

  return uniqueRecords.map((record, idx) => {
    const aggregated = aggregateEmployeeRecords([record], nameMap, options);
    return {
      ...aggregated,
    };
  });
}

// Hàm aggregate tất cả records của một employee
function aggregateEmployeeRecords(records: EmployeeSalaryStatementDTO[], nameMap: any, options?: PayrollCalculationOptions): AggregatedPayrollType {
  const firstRecord = records[0];
  const fullName = nameMap[firstRecord.employeeId] || '';

  const result: any = {
    key: firstRecord.employeeId.toString(),
    id: firstRecord.employeeId.toString(),
    employeeId: firstRecord.employeeId,
    employeeCode: firstRecord.employeeCode,
    name: fullName,
    dvt: 'Công',
    signed: firstRecord.signed || '',
    protectiveGear: firstRecord.protectiveGear,
    shiftMainTime: firstRecord.shiftMainTime,
    shiftMainTimeDic: {
      Ky1: firstRecord.shiftMainTimeDic?.Ky1,
      Ky2: firstRecord.shiftMainTimeDic?.Ky2,
    },
    shiftOTTime: firstRecord.shiftOTTime,
    shiftOTTimeDic: {
      Ky1: firstRecord.shiftOTTimeDic?.Ky1,
      Ky2: firstRecord.shiftOTTimeDic?.Ky2,
    },
    salary: firstRecord.salary,
    salaryAmount: firstRecord.salaryAmount,
    performanceSalaryAmount: firstRecord.performanceSalaryAmount,
    salaryOT: firstRecord.salaryOT,
    salaryMain: firstRecord.salaryMain,
    salaryPerWorkHour: firstRecord.salaryPerWorkHour,
    salaryPerWorkLabor: firstRecord.employeeSalary.salaryPerWorkLabor,
    fixedSalaryAmount: firstRecord.employeeSalary.fixedSalaryAmount,
    unionFund: firstRecord.unionFund,
    salaryAdvance_D20: firstRecord.salaryAdvance_D20 || 0,  // Tiền ứng ngày 20
    salaryAdvance_D12: firstRecord.salaryAdvance_D12 || 0, // Ứng lương lần 1
    salaryAdvance_D27: firstRecord.salaryAdvance_D27 || 0, // Ứng lương lần 2
    salaryBalance_D12: firstRecord.salaryBalance_D12 || 0, // Âm dương phát lương 12
    salaryBalance_D27: firstRecord.salaryBalance_D27 || 0, // Âm dương phát lương 27

    locked: false,
  };

  let totalWork = 0;

  const projectsMap = new Map<string, string>();
  const insuranceMap = new Map<string, number>();
  const surchargeMap = new Map<string, number>();
  const fundMap = new Map<string, number>();
  const policyMap = new Map<string, number>();

  records.forEach(record => {

    // Tổng công công trình
    record.employeeProjectStatements?.forEach(project => {
      const key = project.operatorId;
      const currentValue = projectsMap.get(key);
      const totalShiftTime = ((project.shiftMainTime + project.shiftOTTime).toFixed(2)) || '0.00';
      const newValue = (Number(currentValue) || 0) + Number(totalShiftTime);
      projectsMap.set(key, newValue.toFixed(2) || '0.00');

      totalWork += (Number((project.shiftMainTime + project.shiftOTTime).toFixed(2))) || 0;
    });

    // Aggregate projects
    record.employeeProjectStatements?.forEach(project => {
      const key = `project_${project.operatorId}`;
      result[key] = (project.shiftMainTime + project.shiftOTTime).toFixed(2) || '0.00';
      projectsMap.set(key, (project.shiftMainTime + project.shiftOTTime).toFixed(2) || '0.00');
    });

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

  result.totalWork = totalWork.toFixed(2) || '0.00';

  projectsMap.forEach((value, key) => {
    result[key] = value || '0.00';
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
  if (result.salaryPerWorkLabor && result.totalWork) {
    result.totalMoneyWork = Number((result.salaryPerWorkLabor * result.totalWork).toFixed(4));
  } else {
    result.totalMoneyWork = 0;
  }

  // Tính tiền ứng dựa trên typeEFinancialPlan
  let totalSalaryAdvance = 0;
  let totalSalaryBalance = 0;

  if (options?.typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05) {
    totalSalaryAdvance = result.salaryAdvance_D27;
    totalSalaryBalance = result.salaryBalance_D27;
  } else if (options?.typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan20) {
    totalSalaryAdvance = result.salaryAdvance_D12;
    totalSalaryBalance = result.salaryBalance_D12;
  } else {
    totalSalaryAdvance = result.salaryAdvance_D20 + result.salaryAdvance_D12 + result.salaryAdvance_D27;
    totalSalaryBalance = result.salaryBalance_D12 + result.salaryBalance_D27;
  }

  // Tiền ứng + công đoàn = công đoàn + ứng lương + âm dương
  result.advanceAndUnion = result.unionFund + totalSalaryAdvance + totalSalaryBalance;

  // lương thực nhận = Tổng tiền công - (tiền ứng + công đoàn) - đồ bảo hộ - bảo hiểm + Hỗ trợ
  result.netSalary = result.totalMoneyWork - result.advanceAndUnion - result.protectiveGear - (insuranceMap.get('Trừ BHXH') || 0) + (surchargeMap.get('Hỗ trợ') || 0);

  const projectKeys = Array.from(projectsMap.keys());
  const skipRound = (key: string) =>
    key === 'totalWork'
    || projectKeys.includes(key);

  Object.keys(result).forEach(key => {
    const v = result[key];
    if (typeof v === 'number' && !skipRound(key)) {
      result[key] = Math.round(v);
    }
  });

  return result;
}

// Phân tích structure
export function analyzeAggregatedStructure(data?: EmployeeSalaryStatementDTO[], projectList?: ProjectResponse[]): PayrollStructureAnalysis {
  if (!data?.length) {
    return {
      projects: [],
      insurances: [],
      surcharges: [],
      funds: [],
      policies: [],
    };
  }

  const projects = new Map<string, ProjectInfo>();
  const insurances = new Map<number, InsuranceInfo>();
  const surcharges = new Map<number, SurchargeInfo>();
  const funds = new Map<number, FundInfo>();
  const policies = new Map<number, PolicyInfo>();
  data.forEach(record => {
    // projects
    (record.employeeProjectStatements || []).forEach(project => {
      const projectCode = projectList?.find(p => p.projectGuid === project.operatorId)?.code || `Project_${project.operatorId}`;
      if (!projects.has(project.operatorId)) {
        projects.set(project.operatorId, {
          operatorId: `project_${project.operatorId}`,
          projectName: project.projectName,
          projectCode: projectCode,
          soCong: (project.shiftMainTime + project.shiftOTTime).toFixed(2) || '0.00',
        });
      }
    });
    // insurances
    (record.employeeInsurances || []).forEach(insurance => {
      if (!insurances.has(insurance.insuranceId)) {
        insurances.set(insurance.insuranceId, {
          insuranceId: insurance.insuranceId,
          insuranceName: insurance.insuranceName,
        });
      }
    });

    // surcharges
    (record.employeeSurcharges || []).forEach(surcharge => {
      if (!surcharges.has(surcharge.surchargeId)) {
        surcharges.set(surcharge.surchargeId, {
          surchargeId: surcharge.surchargeId,
          surchargeName: surcharge.surchargeName,
        });
      }
    });

    // funds
    (record.employeeFunds || []).forEach(fund => {
      if (!funds.has(fund.fundId)) {
        funds.set(fund.fundId, {
          fundId: fund.fundId,
          fundName: fund.fundName,
        });
      }
    });

    // policies
    (record.employeeSalaryPolicys || []).forEach(policy => {
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
    projects: Array.from(projects.values()),
    insurances: Array.from(insurances.values()),
    surcharges: Array.from(surcharges.values()),
    funds: Array.from(funds.values()),
    policies: Array.from(policies.values()),
  };
}

// Tạo table columns cho dữ liệu aggregated
export function generateAggregatedTableColumns(analysis: PayrollStructureAnalysis) {
  const columns = [
    { key: 'stt', title: 'STT', width: 60, editable: false, fixed: 'left' },
    { key: 'employeeCode', title: 'Mã NV', width: 100, editable: false, fixed: 'left' },
    { key: 'name', title: 'Tên nhân viên', width: 150, editable: false, fixed: 'left', align: 'left' },
    { key: 'dvt', title: 'ĐVT', width: 84, editable: false, fixed: 'left' },
    { key: 'salaryPerWorkLabor', title: 'Tiền công', width: 84, type: 'currency', editable: true },
  ];
  // Thêm columns cho công việc từng dự án
  analysis.projects.forEach(project => {
    columns.push({
      key: project.operatorId,
      title: `∑ công ${project.projectCode}`,
      width: 84,
      type: 'number',
      editable: false,
    });
  });

  columns.push(
    { key: 'totalWork', title: '∑ công công trình', width: 84, type: 'number', editable: false },
    { key: 'totalMoneyWork', title: 'Tổng tiền công', width: 84, type: 'currency', editable: false },
    { key: 'advanceAndUnion', title: 'Tiền ứng + công đoàn', width: 84, type: 'currency', editable: false },
  );
  
  columns.push({ key: 'protectiveGear', title: 'Đồ bảo hộ', width: 84, type: 'currency', editable: true });

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
    { key: 'netSalary', title: 'Lương thực nhận', width: 84, type: 'currency', editable: false },
    { key: 'signed', title: 'Ký nhận', type: 'text', width: 60, editable: true },
  );

  return columns;
}
