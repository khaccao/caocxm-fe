import { useRef } from 'react';

import { Dayjs } from 'dayjs';

import { handleExportSalaryAdvance } from './utils';
import { DocumentsTableSalary } from '../../Components/Document';
import { DocumentsTableSalaryRef, eKyLuong, eSalaryType } from '@/common/define';
import { ProjectDocumentsHeader } from '@/pages/Components/Document/ProjectDocumentHeader';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { getDocumentQueryParams } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getThangNam, salaryActions } from '@/store/salary';
import Utils from '@/utils';

// ----------------------------------------------------------------

export const FirstSalaryAdvance = () => {
  const dispatch = useAppDispatch();
  const company = useAppSelector(getCurrentCompany());
  const activeMenu = useAppSelector(getActiveMenu());
  const params = useAppSelector(getDocumentQueryParams());
  const ThangNam = useAppSelector(getThangNam());

  const handleSearchChange = (search: string) => {
    dispatch(salaryActions.setSearchStr(search));
  };
  const handleDateChange = (date: Dayjs) => {
    dispatch(salaryActions.setThangNam(date));
  };

  const handleSave = () => {
    dispatch(salaryActions.setOnSave(Utils.generateRandomString(3)));
  };

  const tableRef = useRef<DocumentsTableSalaryRef>(null);

  const handleExport = () => {
    const rows = tableRef.current?.getRows() ?? [];
    handleExportSalaryAdvance({
      rows,
      activeMenu,
      company,
      ThangNam,
      dispatch,
      salaryActions,
    });
  };

  return (
    <>
      <ProjectDocumentsHeader
        title={activeMenu?.label}
        pass={activeMenu}
        initialSearch={params.search}
        onSearchChange={handleSearchChange}
        onDateChange={handleDateChange}
        onSave={handleSave}
        onExport={handleExport}
      />

      <DocumentsTableSalary
        KyLuong={eKyLuong.Ky1}
        policies={{
          create: ['KPI.UngLuong_1.Create'],
          delete: ['KPI.UngLuong_1.Delete'],
        }}
        Type={eSalaryType.SalaryAdvance}
        ref={tableRef}
      />
    </>
  );
};
