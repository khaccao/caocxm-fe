import { useEffect } from 'react';

import dayjs from 'dayjs';

import { ePeriodCode } from '@/common/define';
import { employeeActions, getNVEmployeeSalaryStatement, getBCHEmployeeSalaryStatement } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';

// -------------------------------------------------------

interface UseSalaryParams {
  orgId: number;
  group: 'NV' | 'BCH';
  month: dayjs.Dayjs;
  periodCode: string;
  body: number[];
  type?: string;
}

export function useSalaryData({ orgId, group, month, periodCode, body }: UseSalaryParams) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(getLoading('getEmployeeSalaryStatement'));
  const data = useAppSelector(state =>
    group === 'NV' ? getNVEmployeeSalaryStatement()(state) : getBCHEmployeeSalaryStatement()(state),
  );

  useEffect(() => {
    if (!orgId) return;
    const dayWorking = periodCode === ePeriodCode.PERIODCODEDAY5 ? '20' : '05';
    const workingDay = month.date(+dayWorking).format('YYYY-MM-DD');
    const type = group === 'BCH' ? 1 : 0;

    dispatch(
      employeeActions.getEmployeeSalaryStatementRequest({
        companyId: orgId,
        body,
        params: { workingDay, periodCode, type },
        group: group === 'NV' ? 'NV' : 'BCH',
      }),
    );
  }, [dispatch, orgId, group, month, periodCode, body]);

  return { loading, data };
}
