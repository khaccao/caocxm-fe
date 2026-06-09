/* eslint-disable import/order */
import { useMemo } from 'react';

import { Spin } from 'antd';
import dayjs from 'dayjs';

import { EFinancialPlan } from '@/common/define';
import { useAppSelector } from '@/store/hooks';
import { getProjectList } from '@/store/project';
import { aggregatePayrollData, analyzeAggregatedStructure, generateAggregatedTableColumns } from '../helper';
import { useSalaryData } from '../hooks';
import PayrollTable from './PayrollTable';

// ---------------------------------------------------------------------------------------

interface Props {
  orgId: number;
  group: 'NV' | 'BCH';
  month: dayjs.Dayjs;
  periodCode: string;
  body: number[];
  nameMap: Record<number, string>;
  typeEFinancialPlan: EFinancialPlan;
  tableRef?: React.RefObject<any>;
}
function normalizeProjectFields(records: any[]) {
  const projectFields = new Set();

  // Bước 1: Tìm tất cả các field dạng "project_{id}"
  records.forEach(record => {
    Object.keys(record).forEach(key => {
      if (key.startsWith("project_")) {
        projectFields.add(key);
      }
    });
  });

  // Bước 2: Gán "0.00" nếu record không có field đó
  records.forEach(record => {
    projectFields.forEach((field: any) => {
      if (!(field in record)) {
        record[field] = "0.00";
      }
    });
  });

  return records;
}

export default function PayrollTableContainer({ orgId, group, month, periodCode, body, nameMap, typeEFinancialPlan, tableRef }: Props) {
  const { loading, data: statements } = useSalaryData({ orgId, group, month, periodCode, body });
  const projectList = useAppSelector(getProjectList());
  const analysis = useMemo(() => analyzeAggregatedStructure(statements || [], projectList), [statements]);
  const records = useMemo(() => aggregatePayrollData(statements || [], nameMap, { typeEFinancialPlan }), [statements, nameMap, typeEFinancialPlan]);
  const normalizedRecords = normalizeProjectFields(records);
  const columns = useMemo(() => generateAggregatedTableColumns(analysis), [analysis]);
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 32, width: '100%', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PayrollTable
      key={`NV-${dayjs()}`}
      ref={tableRef}
      month={month.format('YYYY-MM')}
      activeKey={typeEFinancialPlan}
      rows={normalizedRecords}
      columns={columns as any}
    />
  );
}
