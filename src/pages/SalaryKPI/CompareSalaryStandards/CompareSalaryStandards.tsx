/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { DownOutlined } from '@ant-design/icons';
import { DatePicker, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { EmployeeReportEfficiencyByStartEndDateDTO, FormatDate, FormatDateAPI } from '@/common/define';
import { useDebounce } from '@/hooks/useDebounce';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeReportEfficiencyByStartEndDate, getEmployees } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from './CompareSalaryStandards.module.css';
import { CompareSalaryStandardsTable } from './components';
import { buildCompareRows } from './utils';

// -------------------------------------------------------------------

const { RangePicker } = DatePicker;

export default function CompareSalaryStandards(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['layout']);
  const tFinance = useTranslation('finance').t;

  const projectList = useAppSelector(state => state.project.projectList);
  const company = useAppSelector(getCurrentCompany());
  const employees = useAppSelector(getEmployees());
  const reportsEfficiencyByStartEndDate: EmployeeReportEfficiencyByStartEndDateDTO[] | undefined = useAppSelector(
    getEmployeeReportEfficiencyByStartEndDate(),
  );
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: dayjs().subtract(1, 'day').format(FormatDateAPI),
    endDate: dayjs().subtract(1, 'day').format(FormatDateAPI),
  });
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchStr, setSearchStr] = useState('');
  const debouncedSearch = useDebounce(searchStr, 500);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [tagCount, setTagCount] = useState<number>(3);

  useEffect(() => {
    if (company.id) {
      dispatch(
        employeeActions.getEmployeesRequest({
          companyId: company.id,
          params: { page: 1, pageSize: 10000 },
        }),
      );
    }
  }, [dispatch, company.id]);

  const employeeIds = employees?.results.map(e => e.id) || [];

  useEffect(() => {
    if (!company.id) return;

    const startDate = dateRange.startDate ?? dayjs().subtract(1, 'day').format(FormatDateAPI);
    const endDate = dateRange.endDate ?? startDate;

    dispatch(
      employeeActions.getEmployeeReportEfficiencyByStartEndDateRequest({
        companyId: company.id,
        body: employeeIds,
        params: {
          startDate,
          endDate,
          search: debouncedSearch,
        },
      }),
    );
  }, [dispatch, company.id, debouncedSearch, dateRange, selectedProject, selectedEmployees]);

  // Lấy hết employee trong công ty
  const employeeOptions =
    employees?.results.map(employee => ({
      value: String(employee.id),
      label: `${employee.lastName} ${employee.middleName} ${employee.firstName}`,
    })) || [];

  // Chỉ giữ những employee có id nằm trong reportsEfficiencyByStartEndDate
  // const employeeOptions = React.useMemo(() => {
  //   if (!employees?.results) return [];

  //   const reportIds = new Set((reportsEfficiencyByStartEndDate ?? []).map(r => r.employeeId));

  //   return employees.results
  //     .filter(emp => reportIds.has(emp.id))
  //     .map(emp => ({
  //       value: String(emp.id),
  //       label: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
  //     }));
  // }, [employees, reportsEfficiencyByStartEndDate]);

  const handleEmployeeSelect = (values: string[]) => {
    setSelectedEmployees(values);
    setSearchStr('');
  };

  const handleSearch = (value: string) => {
    setSearchStr(value);
  };

  const projectOptions = React.useMemo(() => {
    const allOption = { value: 'all', label: 'Tất cả' };
    if (!projectList) return [allOption];
    const mapped = projectList.map(p => ({
      value: String(p.id),
      label: p.name,
    }));
    return [allOption, ...mapped];
  }, [projectList]);

  // filteredProjects
  const filteredReportsByProject = React.useMemo(() => {
    if (selectedProject === 'all') {
      return reportsEfficiencyByStartEndDate ?? [];
    }
    const pid = Number(selectedProject);
    return (reportsEfficiencyByStartEndDate ?? []).filter(r => r.projectId === pid);
  }, [reportsEfficiencyByStartEndDate, selectedProject]);

  // filteredEmployees
  const filteredReports = React.useMemo(() => {
    if (selectedEmployees.length === 0) {
      return filteredReportsByProject;
    }
    const empIds = selectedEmployees.map(id => Number(id));
    return filteredReportsByProject.filter(r => empIds.includes(r.employeeId));
  }, [filteredReportsByProject, selectedEmployees]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
  };
  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
    setDateRange({
      startDate: dates[0] ? dates[0].format(FormatDateAPI) : null,
      endDate: dates[1] ? dates[1].format(FormatDateAPI) : null,
    });

    // Reset các filter khác
    setSelectedProject('all');
    setSelectedEmployees([]);
    setSearchStr('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          {t('Compare salary standards')}
        </Typography.Title>

        <div className={styles.filterBar}>
          <Select
            options={projectOptions}
            placeholder={tFinance('Select project')}
            value={selectedProject}
            onChange={handleProjectChange}
            className={styles.selectProject}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Select
              mode="multiple"
              showSearch
              allowClear
              className={styles.searchBar}
              placeholder="Tìm kiếm nhân viên"
              value={selectedEmployees}
              onChange={handleEmployeeSelect}
              onSearch={handleSearch}
              searchValue={searchStr}
              optionFilterProp="label"
              filterOption={(input, option) => {
                if (!option?.label) return false;
                return (option.label as string).toLowerCase().includes(input.toLowerCase());
              }}
              options={employeeOptions}
              notFoundContent={searchStr ? 'Không tìm thấy' : 'Không có dữ liệu'}
              suffixIcon={<DownOutlined />}
              loading={!employees || employees.results.length === 0}
              maxTagCount={tagCount}
              maxTagPlaceholder={omittedValues => `+${omittedValues.length} ...`}
              onDropdownVisibleChange={open => {
                if (open) setTagCount(Infinity);
                else setTagCount(3);
              }}
            />
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              format={FormatDate}
              value={
                dateRange.startDate && dateRange.endDate
                  ? [dayjs(dateRange.startDate, FormatDateAPI), dayjs(dateRange.endDate, FormatDateAPI)]
                  : null
              }
              onChange={dates => {
                if (dates) {
                  handleDateChange([dates[0], dates[1]]);
                } else {
                  handleDateChange([null, null]);
                }
              }}
              className={styles.rangePicker}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <CompareSalaryStandardsTable
          projectList={projectList}
          dataSource={buildCompareRows(filteredReports, { showProjectCol: true, selectedEmployees })}
        />
      </div>
    </div>
  );
}
