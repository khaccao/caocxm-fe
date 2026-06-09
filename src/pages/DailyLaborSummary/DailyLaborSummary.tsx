/* eslint-disable import/order */
import React, { useEffect, useMemo, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { DatePicker, Input, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { EmployeeReportDTO, FormatDate, FormatDateAPI } from '@/common/define';
import { useDebounce } from '@/hooks';
import { ProjectMemberPagingResponse } from '@/services/ProjectService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getReportsByStartEndDate, issueActions } from '@/store/issue';
import { getProjectMembers, getSelectedProject, projectActions } from '@/store/project';
import { getTeams, teamActions } from '@/store/team';
import { getCheckInData, getMembersByGroupCode, timekeepingActions } from '@/store/timekeeping';
import { DailyLaborSummaryTable } from './components';
import styles from './DailyLaborSummary.module.css';
import { handleEmployeeRows, mapBCHMemberToRow } from './helpers';
import { EmployeeRow } from './types';

// --------------------------------------------------------------

export default function DailyLaborSummary(): React.JSX.Element {
  const { t } = useTranslation(['material']);
  const tEmp = useTranslation('employee').t;
  const tFinance = useTranslation('finance').t;
  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const reportsByStartEndDate: EmployeeReportDTO[] | undefined = useAppSelector(getReportsByStartEndDate());
  const projectMembers: ProjectMemberPagingResponse | undefined = useAppSelector(getProjectMembers());
  const membersOfBCH = useAppSelector(getMembersByGroupCode('BCH'));
  const checkIn = useAppSelector(getCheckInData());
  const teams = useAppSelector(getTeams());

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs().subtract(1, 'day'));
  const [searchStr, setSearchStr] = useState('');
  const debouncedSearch = useDebounce(searchStr, 500);

  useEffect(() => {
    if (selectedProject) {
      dispatch(
        projectActions.getProjectMembersRequest({
          projectId: selectedProject.id,
          queryParams: { paging: false },
        }),
      );
      dispatch(teamActions.getTeamsRequest({ projectId: selectedProject.id, queryParams: {} }));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      const startDate = selectedDate?.format(FormatDateAPI);
      dispatch(
        issueActions.getReportsByStartEndDateRequest({
          projectId: selectedProject.id,
          params: {
            startDate,
            endDate: startDate,
            search: debouncedSearch,
          },
        }),
      );
      // const allTeam = teams.find(team => team.name === 'Tất cả');
      dispatch(timekeepingActions.getTimeKeepingOfTeamRequest({ team_id: -1, working_day: selectedDate }));
    }
  }, [dispatch, selectedProject, selectedDate, debouncedSearch, teams]);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const onSearchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStr(evt.target.value);
  };

  const dataSource = useMemo<EmployeeRow[]>(() => {
    if (!reportsByStartEndDate?.length) return [];

    return handleEmployeeRows(reportsByStartEndDate, projectMembers);
  }, [reportsByStartEndDate, projectMembers]);

  useEffect(() => {
    dispatch(timekeepingActions.getMembersByGroupCodeRequest({ groupCode: 'BCH' }));
  }, [dispatch]);

  const isBeforeToday = selectedDate ? selectedDate.isBefore(dayjs(), 'day') : false;

  const boardRows = useMemo<EmployeeRow[]>(() => {
    if (!membersOfBCH?.length || !isBeforeToday) return [];
    return membersOfBCH.map(mapBCHMemberToRow);
  }, [membersOfBCH, isBeforeToday]);

  const filteredBoardRows = useMemo<EmployeeRow[]>(() => {
    if (!debouncedSearch?.trim()) return boardRows;

    const q = debouncedSearch.toLowerCase().trim();

    return boardRows.filter(r => {
      const fullName = (r.tenNV ?? '').toLowerCase();

      return fullName.includes(q);
    });
  }, [boardRows, debouncedSearch]);

  const mergedRows = useMemo<EmployeeRow[]>(() => {
    const ids = new Set(dataSource.map(r => r.key));
    const checkInEmployees = (checkIn?.inSide_Team || []).concat(checkIn?.outSide_Team || []);
    const hasCheckInEmployees: any[] = checkInEmployees.filter(
      (data: any) => (data?.checkIn_List?.length || data?.approvedExtra) && data?.projectIds?.includes(selectedProject?.id)
    );

    // Lấy BCH có checkin trong dự án này 
    const filteredBCHRows = filteredBoardRows
      .filter(r =>
        hasCheckInEmployees.find(checkInEmployee => checkInEmployee.employeeCode === r.maNV)
      );

    // Lấy các nhân viên thường (không phải BCH) từ dataSource
    const normalRows = dataSource.filter(employee =>
      hasCheckInEmployees.find(checkInEmployee => checkInEmployee.employeeCode === employee.maNV)
    );
    // Tạo Set chứa mã nhân viên trong normalRows (ưu tiên)
    const normalMaNVs = new Set(normalRows.map(e => e.maNV));

    // Lọc lại BCH, chỉ giữ những người không có trong dataSource
    const uniqueBCHRows = filteredBCHRows.filter(bch => !normalMaNVs.has(bch.maNV));

    return [...uniqueBCHRows, ...normalRows];
  }, [filteredBoardRows, dataSource, checkIn, selectedProject?.id]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          {tFinance('Project')} {selectedProject?.name}
        </Typography.Title>

        <div className={styles.filterBar}>
          <Input
            placeholder={tEmp('companyEmployee.findEmployee')}
            allowClear
            value={searchStr}
            onChange={onSearchChange}
            className={styles.searchInput}
            suffix={searchStr ? null : <SearchOutlined />}
          />

          <DatePicker
            className={styles.datePicker}
            placeholder={t('Select date')}
            value={selectedDate}
            onChange={handleDateChange}
            format={FormatDate}
            allowClear={false}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <DailyLaborSummaryTable dataSource={mergedRows} />
      </div>
    </div>
  );
}
