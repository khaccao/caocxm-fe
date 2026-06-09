/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Button, DatePicker, DatePickerProps, Select, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { AutoCompleteOptions } from '@/common/define';
import styles from '././DepartmentKPIs.module.less';
// import { iDepartmentKPIs } from '@/pages/KPI/DepartmentKPIs/DepartmentKPIs';
import { WithPermission } from '@/hocs/PermissionHOC';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams, getEmployees } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, getTracker } from '@/store/issue';
import { getRolesByCompanyId, getSelectedProject, projectActions } from '@/store/project';
import Utils from '@/utils';

interface DepartmentKPIsHeaderProps {
  newData: any[];
}

export const DepartmentKPIsHeader: React.FC<DepartmentKPIsHeaderProps> = ({ newData }) => {
  const tCommon = useTranslation('common').t;

  const activeMenu = useAppSelector(getActiveMenu());
  const params = useAppSelector(getIssueQueryParams());

  const company = useAppSelector(getCurrentCompany());
  const companyId = company.id;

  const paramsEmployee = useAppSelector(getEmployeeQueryParams());
  const [searchStr, setSearchStr] = useState(params?.search);
  const trackers = useAppSelector(getTracker());
  const selectedProject = useAppSelector(getSelectedProject());
  const [timer, setTimer] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const dispatch = useAppDispatch();
  const [BoPhanOptions, setBoPhanOptions] = useState<AutoCompleteOptions[]>([]);
  const [CanBoOptions, setCanBoOptions] = useState<AutoCompleteOptions[]>([]);
  const [selectedRankCode, setSelectedRankCode] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string | null>(null);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string | null>(null);

  const members = useAppSelector(getEmployees());
  const roles = useAppSelector(getRolesByCompanyId());
  // [10/11/2024][#20691][phuong_td] Lấy danh sách nhân công công ty

  useEffect(() => {
    dispatch(
      employeeActions.getEmployeesRequest({
        companyId: company.id,
        params: {  page: 1, pageSize: 10000 },
      }),
    );
    // eslint-disable-next-line
  }, [company]);

  useEffect(() => {
    dispatch(
      employeeActions.getRanksRequest({
        companyId,
      }),
    );
    setSelectedRankCode(null);
  }, [dispatch]);

  const rankData = useAppSelector(state => state.employee.rankData);

  useEffect(() => {
    const boPhanOptions = rankData?.map((rank: any) => ({
      label: rank.rankName,
      value: rank.rankCode,
      item: { name: rank.rankName, code: rank.rankCode },
    }));

    setBoPhanOptions(boPhanOptions || []);

    if (boPhanOptions && boPhanOptions.length > 0) {
      setSelectedRankCode(boPhanOptions[0].value); // Select the first rank by default
    }
  }, [rankData]);

  useEffect(() => {
    if (selectedRankCode) {
      dispatch(
        employeeActions.getRankByIdRequest({
          companyId,
          rankCode: selectedRankCode,
        }),
      );
    }
  }, [dispatch, selectedRankCode]);

  useEffect(() => {
    if (selectedDate && selectedEmployeeId) {
      const dateTimes = selectedDate.format('YYYY-MM');
      dispatch(
        employeeActions.updategetByEmployeeIdRequest({
          employeeId: selectedEmployeeId,
          dateTime: dateTimes,
        }),
      );
    }
  }, [selectedDate, selectedEmployeeId]);

  // const handleEmployeeSelect = (id: string, data: string, label: string) => {
  //   setSelectedEmployeeId(data);
  // };

  // [10/11/2024][#20691][phuong_td] lấy danh sách role của company
  useEffect(() => {
    dispatch(projectActions.getRolesByCompanyIdRequest(company.id));
    // eslint-disable-next-line
  }, [company]);

  useEffect(() => {}, [roles]);

  // [10/11/2024][#20691][phuong_td] Tạo danh sách cán bộ
  useEffect(() => {
    if (members && members.results) {
      const canbo: AutoCompleteOptions[] = members?.results.map(m => ({
        label: Utils.getFullName(m),
        value: `${m.id}`,
        item: {
          name: Utils.getFullName(m),
          code: m.employeeCode,
        },
      }));
      setCanBoOptions(canbo);

      if (canbo && canbo.length > 0) {
        setSelectedEmployeeId(canbo[0].value); // Select the first employee by default
        setSelectedEmployeeName(canbo[0].item.name);
        setSelectedEmployeeCode(canbo[0].item.code);
      }
    }
  }, [members]);

  // const getTrackerID = () => {
  //   let trackerId = 20;
  //   if (trackers && trackers.length) {
  //     const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
  //     if (tracker && tracker.id) {
  //       trackerId = tracker.id;
  //     }
  //   }
  //   return trackerId;
  // }

  // [#20692][phuong_td][31/10/2024] Tìm theo tên
  const onSearchChange = (evt: any) => {
    if (selectedProject) {
      const search = evt.target.value;
      setSearchStr(search);
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {
        // let trackerId = Utils.getTrackerID();
        // dispatch(
        //   issueActions.getIssuesByMilestoneRequest({
        //     projectId: selectedProject.id,
        //     params: {
        //       ...params,
        //       page: 1,
        //       search,
        //       timeoutId,
        //     },
        //   }),
        // );
      }, 500);
      setTimer(timeoutId);
    }
  };

  // [#20692][phuong_td][31/10/2024] Áp dụng bộ lọc ngày
  const ApplyFilterDay = () => {
    if (selectedProject) {
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {}, 500);
      setTimer(timeoutId);
    }
  };

  const handleEmployeeSelect = (value: string) => {
    setSelectedEmployeeId(value);
    const selectedEmployee = CanBoOptions.find(option => option.value === value);
    if (selectedEmployee) {
      setSelectedEmployeeName(selectedEmployee.item.name);
      setSelectedEmployeeCode(selectedEmployee.item.code);
    }
  };

  const lastData = newData.map(item => {
    if (selectedEmployeeId && selectedDate) {
      const formattedDate = selectedDate.format('YYYY-MM-DD');

      return {
        kipCriteriaId: item.employeeId,
        confirmBy: item.confirmBy,
        point: item.diem,
        notes: item.notes,
        employeeId: selectedEmployeeId,
        employeeName: selectedEmployeeName,
        employeeCode: selectedEmployeeCode,
        createdDate: formattedDate,
        projectId: 0,
        companyId,
      };
    } else {
      console.warn('Please select both an employee and a date before saving.');
    }
  });

  // [10/11/2024][#20691][phuong_td] Lưu thay đổi
  // In DepartmentKPIsHeader Component
  const handleSave = () => {
    if (selectedEmployeeId && selectedDate) {
      const formattedDate = selectedDate.format('YYYY-MM');
      const payload = {
        companyId,
        employeeId: selectedEmployeeId,
        dateTime: formattedDate,
        data: lastData,
      };
      dispatch(employeeActions.updateEmployeeIdRequest(payload));
    } else {
      console.warn('Please select both an employee and a date before saving.');
    }
  };

  // [10/11/2024][#20691][phuong_td] Thay đổi tháng được chọn
  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM');
      setSelectedDate(dayjs(formattedDate, 'YYYY-MM'));
    }
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerLeft}>
        <div className={styles.titleContainer}>
          <Typography.Title style={{ margin: 0 }} level={4}>
            {activeMenu?.label}
          </Typography.Title>
        </div>
        <div className={styles.searchContainer}>
          {/* Cán bộ thuộc */}
          {tCommon(`Staff's role`)}
          <Space>
            <Select
              style={{ width: 200 }}
              options={BoPhanOptions}
              placeholder={tCommon('Chọn cán bộ thuộc')}
              value={selectedRankCode}
              onChange={value => setSelectedRankCode(value)}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                return option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false;
              }}
            />
          </Space>

          {/* Cán bộ */}
          {tCommon(`Staff`)}
          <Space>
            <Select
              style={{ width: 200 }}
              options={CanBoOptions}
              placeholder={tCommon('Chọn cán bộ')}
              value={selectedEmployeeId}
              onChange={handleEmployeeSelect}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                return option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false;
              }}
            />
          </Space>

          {/* Tháng */}
          {tCommon('Month')}
          <DatePicker onChange={onChange} picker="month" value={selectedDate} />
        </div>
      </div>
      <Space>
        {/* <DatePicker
          format={formatDateDisplay}
          value={selectedDate}
          onChange={dates => setSelectedDate(dates)}
          allowClear={false}
        /> */}
        {/* <Button type="primary" size="small" style={{ padding: `0 7px` }} onClick={() => ApplyFilterDay()}>
          {tCommon('Apply')}
        </Button> */}
        <WithPermission strategy="disable" policyKeys={['KPI.KPIBoPhan.SaveChanges']}>
          <Button
            type="primary"
            size="large"
            style={{
              padding: `10px 10px`,
              fontSize: '14px',
              height: '30px',
              borderRadius: '10px',
            }}
            onClick={() => handleSave()}
          >
            {tCommon('Save change')}
          </Button>
        </WithPermission>
      </Space>
    </div>
  );
};
