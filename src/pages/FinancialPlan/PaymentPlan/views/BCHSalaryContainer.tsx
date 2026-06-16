import React, { useMemo } from 'react';

import { Spin } from 'antd';
import dayjs from 'dayjs';

import BCHSalaryTable from './BCHSalaryTable';
import { aggregateBCHPayrollData, analyzeAggregatedStructure, generateAggregatedBCHTableColumns } from '../helper/bch-table';
import { useSalaryData } from '../hooks';

// ---------------------------------------------------------------------------------------

interface Props {
  orgId: number;
  group: 'NV' | 'BCH';
  month: dayjs.Dayjs;
  periodCode: string;
  body: number[];
  nameMap: Record<number, string>;
  excludedEmployeeIds?: ReadonlySet<number>;
  tableRef?: React.RefObject<any>;
}

export default function BCHSalaryContainer({
  orgId,
  group,
  month,
  periodCode,
  body,
  nameMap,
  excludedEmployeeIds,
  tableRef,
}: Props) {
  const { loading, data: statements } = useSalaryData({ orgId, group, month, periodCode, body });

  const visibleStatements = useMemo(
    () => (statements || []).filter(statement => !excludedEmployeeIds?.has(statement.employeeId)),
    [statements, excludedEmployeeIds],
  );
  const analysis = useMemo(() => analyzeAggregatedStructure(visibleStatements), [visibleStatements]);
  const records = useMemo(
    () => aggregateBCHPayrollData(visibleStatements, nameMap),
    [visibleStatements, nameMap],
  );
  const columns = useMemo(() => generateAggregatedBCHTableColumns(analysis), [analysis]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 32, width: '100%', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <BCHSalaryTable key={`BCH-${dayjs()}`} ref={tableRef} month={month.format('YYYY-MM')} rows={records} columns={columns as any} />;
}
