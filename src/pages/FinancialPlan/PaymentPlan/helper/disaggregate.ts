import { AggregatedPayrollType } from '.';
import { EmployeeSalaryStatementDTO } from '@/common/define';

// ----------------------------------------------------------

export function convertDataViewToEmployeeSalaryDTOSimple(
  dataView: AggregatedPayrollType[],
  originalData: EmployeeSalaryStatementDTO[],
): EmployeeSalaryStatementDTO[] {
  const result: EmployeeSalaryStatementDTO[] = [];

  const seen = new Set<number>();
  const uniqueOriginal = originalData.filter(record => {
    if (seen.has(record.employeeId)) {
      return false;
    }

    seen.add(record.employeeId);
    return true;
  });

  const aggregatedRecordMap = new Map<number, AggregatedPayrollType>();
  dataView.forEach(record => {
    aggregatedRecordMap.set(record.employeeId, record);
  });

  uniqueOriginal.forEach(originalRecord => {
    const aggregatedRecord = aggregatedRecordMap.get(originalRecord.employeeId);

    if (!aggregatedRecord) {
      result.push(originalRecord);
      return;
    }

    const updatedRecord: EmployeeSalaryStatementDTO = {
      ...originalRecord,

      // Cập nhật thông tin chung
      salary: typeof aggregatedRecord.salary === 'number' ? aggregatedRecord.salary : originalRecord.salary,
      salaryAmount:
        typeof aggregatedRecord.salaryAmount === 'number' ? aggregatedRecord.salaryAmount : originalRecord.salaryAmount,
      performanceSalaryAmount:
        typeof aggregatedRecord.performanceSalaryAmount === 'number'
          ? aggregatedRecord.performanceSalaryAmount
          : originalRecord.performanceSalaryAmount,
      supportRepair:
        typeof aggregatedRecord.supportRepair === 'number'
          ? aggregatedRecord.supportRepair
          : originalRecord.supportRepair,
      protectiveGear:
        typeof aggregatedRecord.protectiveGear === 'number'
          ? aggregatedRecord.protectiveGear
          : originalRecord.protectiveGear,
      shiftMainTime:
        typeof aggregatedRecord.shiftMainTime === 'number'
          ? aggregatedRecord.shiftMainTime
          : originalRecord.shiftMainTime,
      shiftOTTime:
        typeof aggregatedRecord.shiftOTTime === 'number' ? aggregatedRecord.shiftOTTime : originalRecord.shiftOTTime,
      salaryOT: typeof aggregatedRecord.salaryOT === 'number' ? aggregatedRecord.salaryOT : originalRecord.salaryOT,
      salaryMain:
        typeof aggregatedRecord.salaryMain === 'number' ? aggregatedRecord.salaryMain : originalRecord.salaryMain,
      salaryPerWorkHour:
        typeof aggregatedRecord.salaryPerWorkHour === 'number'
          ? aggregatedRecord.salaryPerWorkHour
          : originalRecord.salaryPerWorkHour,
      salaryPerWorkLabor:
        typeof aggregatedRecord.salaryPerWorkLabor === 'number'
          ? aggregatedRecord.salaryPerWorkLabor
          : originalRecord.salaryPerWorkLabor,
      kpiValue: typeof aggregatedRecord.kpiValue === 'number' ? aggregatedRecord.kpiValue : originalRecord.kpiValue,
      salaryBalance:
        typeof aggregatedRecord.salaryBalance === 'number'
          ? aggregatedRecord.salaryBalance
          : originalRecord.salaryBalance,
      signed: typeof aggregatedRecord.signed === 'string' ? aggregatedRecord.signed : originalRecord.signed,
      unionFund: typeof aggregatedRecord.unionFund === 'number' ? aggregatedRecord.unionFund : originalRecord.unionFund,
      salaryAdvance_D20:
        typeof aggregatedRecord.salaryAdvance_D20 === 'number'
          ? aggregatedRecord.salaryAdvance_D20
          : originalRecord.salaryAdvance_D20,
      shiftMainTimeDic: aggregatedRecord.shiftMainTimeDic || originalRecord.shiftMainTimeDic,
      shiftOTTimeDic: aggregatedRecord.shiftOTTimeDic || originalRecord.shiftOTTimeDic,

      // Cập nhật employeeProjects
      employeeProjectStatements:
        originalRecord.employeeProjectStatements?.map(project => {
          const projectKey = `project_${project.projectId}` as keyof AggregatedPayrollType;
          const newValue = aggregatedRecord[projectKey];
          return {
            ...project,
            totalShiftTime: typeof newValue === 'number' ? newValue : project.totalShiftTime,
          };
        }) || [],

      // Cập nhật employeeInsurances
      employeeInsurances:
        originalRecord.employeeInsurances?.map(insurance => {
          const newPremium = aggregatedRecord[insurance.insuranceName as keyof AggregatedPayrollType];
          return {
            ...insurance,
            premium: typeof newPremium === 'number' ? newPremium : insurance.premium,
          };
        }) || [],

      // Cập nhật employeeSurcharges
      employeeSurcharges:
        originalRecord.employeeSurcharges?.map(surcharge => {
          const newValue = aggregatedRecord[surcharge.surchargeName as keyof AggregatedPayrollType];
          return {
            ...surcharge,
            surchargeValue: typeof newValue === 'number' ? newValue : surcharge.surchargeValue,
          };
        }) || [],

      // Cập nhật employeeFunds
      employeeFunds:
        originalRecord.employeeFunds?.map(fund => {
          const newContribution = aggregatedRecord[fund.fundName as keyof AggregatedPayrollType];
          return {
            ...fund,
            contribution: typeof newContribution === 'number' ? newContribution : fund.contribution,
          };
        }) || [],

      // Cập nhật employeeSalaryPolicys
      employeeSalaryPolicys:
        originalRecord.employeeSalaryPolicys?.map(policy => {
          const policyKey = `policy_${policy.salaryPolicyId}` as keyof AggregatedPayrollType;
          const newValue = aggregatedRecord[policyKey];
          return {
            ...policy,
            value: typeof newValue === 'number' ? newValue : policy.value,
          };
        }) || [],

      // Cập nhật employeeSalary
      employeeSalary: {
        ...originalRecord.employeeSalary!,
        baseSalary:
          typeof aggregatedRecord.baseSalary === 'number'
            ? aggregatedRecord.baseSalary
            : originalRecord.employeeSalary.baseSalary,
        salaryPerWorkLabor:
          typeof aggregatedRecord.salaryPerWorkLabor === 'number'
            ? aggregatedRecord.salaryPerWorkLabor
            : originalRecord.employeeSalary.salaryPerWorkLabor,
      },
    };

    result.push(updatedRecord);
  });

  return result;
}
