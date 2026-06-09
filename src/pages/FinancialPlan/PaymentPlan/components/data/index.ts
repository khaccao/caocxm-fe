export interface ColumnMeta {
  key: string;
  title: string;
  editable?: boolean;
  type?: 'number' | 'text' | 'currency' | 'date' | 'group';
  width?: number;
  children?: ColumnMeta[];
  render?: (value: any, record: any) => any;
  fixed?: 'left' | 'right';
  align?: 'left' | 'right' | 'center';
}

export interface PayrollType {
  key: string;
  stt: number;
  id: string;
  name: string;
  dvt: string;
  salary: number;
  net: number;
  warehouseWork?: number; // Tổng số công kho
  constructionWork?: number; // Tổng số công công trình
  advancePayment?: number; // Tiền ứng + công đoàn
  signature?: string; // Ký nhận
  advance20?: number; // Tiền ứng ngày 20
  locked?: boolean;
  totalMoneyWork?: number; // Tổng tiền công
  salaryAmount?: number;
  salaryPerWorkLabor?: number; // tiền công
  advanceAndUnion?: number; // Tiền ứng + công đoàn
  protectiveGear?: number; // Bảo hộ
  'Hỗ trợ'  ?: number;
  'Trừ BHXH'?: number;
}

// --------------------------------------------------BCH Salary------------------------------------------------
export interface BCHPayrollType {
  key: number;
  stt: number;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  name: string;
  totalSalary26Days: number;
  basicSalary: number;
  workPerformance: number;
  dailySalary: number;
  kpiCoefficient: number;
  period1: number;    // Công làm kỳ 1
  period2: number;    // Công làm kỳ 2
  totalHours: number;
  totalSalary: number;
  socialInsurance: number;
  allowance: number;
  unionFee: number;
  salaryAdjustment: number;
  advance20: number;
  advance12And27: number;
  advanceUnion: number;
  net: number;
  signature: string;
  totalMoneyWork?: number; // Tổng tiền công
  salaryAmount?: number; // tiền công
  salaryPerWorkLabor?: number; // tiền công
  advanceAndUnion?: number; // Tiền ứng + công đoàn
  protectiveGear?: number; // Bảo hộ
  'Hỗ trợ'  ?: number;
  'Trừ BHXH'?: number;
  baseSalary?: number; // Tổng lương
  shiftMainTime?: number; // Số công
  shiftOTTime?: number; // Số công tăng ca
  kpiValue?: number; // KPI
  fixedSalaryAmount?: number; // Lương cố định
  salaryPerDay?: number; // Lương ngày
  unionFund?: number; // Quỹ công đoàn
  salaryAdvance_D12?: number; // Tiền ứng ngày 12
  salaryAdvance_D20?: number; // Tiền ứng ngày 20
  salaryAdvance_D27?: number; // Tiền ứng ngày 27
  salaryBalance_D12?: number; // Âm dương phát lương ngày 12
  salaryBalance_D27?: number; // Âm dương phát lương ngày 27
  signed?: string;
  totalWorkAndOT?: number; // Tổng công + tăng ca
  performanceSalary?: number; // Lương hiệu quả
  salaryBalance?: number; // Âm dương phát lương
}
