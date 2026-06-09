import dayjs from 'dayjs';

import { FormatDateAPI, iSalary, SalaryAdvanceRowDTO } from '@/common/define';

// --------------------------------------------------------------

export function mapSalaryToDTO(
  row: iSalary,
  opts: { companyId: number; period: number; dateTime: string },
): SalaryAdvanceRowDTO {
  return {
    stt: row.STT.toString(),
    employeeCode: row.MaNV,
    employeeName: row.TenNV,
    laborCount: row.totalShifts ?? 0,
    companyId: opts.companyId,
    period: opts.period,
    money: row.TienUngNgay,
    total: row.TongCong,
    salaryBalance: row.ADPhatLuong,
    signature: row.KyNhan,
    dateTime: opts.dateTime,
    paymentType: row.paymentType,
    status: 0,
  };
}

interface HandleExportParams {
  rows: any[];
  activeMenu: any;
  company: any;
  ThangNam: any;
  dispatch: any;
  salaryActions: any;
}

export function handleExportSalaryAdvance({
  rows,
  activeMenu,
  company,
  ThangNam,
  dispatch,
  salaryActions,
}: HandleExportParams) {
  const filteredRows = rows.filter(item => !(item.TienUngNgay === 0 && item.TongCong === 0 && item.totalShifts === 0));

  let period: number;
  if (activeMenu?.label === 'Ứng lương lần 1') {
    period = 1;
  } else if (activeMenu?.label === 'Ứng lương lần 2') {
    period = 2;
  } else {
    period = 3;
  }
  const companyId = company.id;
  const dateTime = dayjs(ThangNam).startOf('month').format(FormatDateAPI);

  const payload: SalaryAdvanceRowDTO[] = filteredRows.map(r => mapSalaryToDTO(r, { companyId, period, dateTime }));

  dispatch(
    salaryActions.exportSalariesRequest({
      companyId,
      period,
      dateTime,
      rows: payload,
    }),
  );
}
