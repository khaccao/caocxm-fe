import { SetStateAction, useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from '././PersonnelTransfer.module.less';
import { FormatDateAPI, formatDateDisplay } from '@/common/define';
import { getActiveMenu } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  issueActions,
  getQueryReportsByStartEndDate,
} from '@/store/issue';
import { getSelectedProject } from '@/store/project';
const { RangePicker } = DatePicker;

export const PersonnelTransferHeader = () => {
  const tCommon = useTranslation('common').t;
  const activeMenu = useAppSelector(getActiveMenu());
  const query = useAppSelector(getQueryReportsByStartEndDate());
  const [searchStr, setSearchStr] = useState('');
  const selectedProject = useAppSelector(getSelectedProject());
  const [timer, setTimer] = useState<any>(null);
  // const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const dispatch = useAppDispatch();
  const startOfWeek = dayjs().startOf('week');
  const endOfWeek = dayjs().endOf('week');
  const [rangeDate, setRangeDate] = useState<[Dayjs, Dayjs]>([startOfWeek, endOfWeek]);

  // [09/11/2024][#20629][phuong_td] lấy dữ liệu report theo ngày và search string
  useEffect(() => {
    if (selectedProject) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedProject, searchStr]);
  // [09/11/2024][#20629][phuong_td] lấy dữ liệu report theo ngày và search string
  const getData = () => {
    if (selectedProject) {
      let start = dayjs().startOf('week');
      let end = dayjs().endOf('week');
      if (rangeDate) {
        if (rangeDate[0]) start = rangeDate[0];
        if (rangeDate[1]) end = rangeDate[1];
      }
      dispatch(
        issueActions.getReportsByStartEndDateRequest({
          projectId: selectedProject.id,
          params: {
            ...query?.params,
            paging: false,
            search: searchStr,
            startDate: start.format(FormatDateAPI),
            endDate: end.format(FormatDateAPI),
          },
        }),
      );
    }
  };

  // [#20692][phuong_td][31/10/2024] Tìm theo tên
  const onSearchChange = (evt: any) => {
    const value = evt.target.value;
    setSearchStr(value); 
  };

  // [#20692][phuong_td][31/10/2024] Áp dụng bộ lọc ngày
  const ApplyFilterDay = () => {
    if (selectedProject) {
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {
        getData()
      }, 500);
      setTimer(timeoutId);
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
          <Input
            allowClear
            value={searchStr}
            onChange={onSearchChange}
            onBlur={() => setSearchStr('')}
            suffix={searchStr ? null : <SearchOutlined />}
            style={{ borderRadius: 20, width: 200 }}
            placeholder={tCommon('Search')}
          />
        </div>
      </div>
      <Space>
        {/* <DatePicker
          format={formatDateDisplay}
          value={selectedDate}
          onChange={dates => setSelectedDate(dates)}
          allowClear={false}
        /> */}
        <RangePicker
          format={formatDateDisplay}
          defaultValue={[startOfWeek, endOfWeek]}
          value={rangeDate}
          onChange={(dates: any) => setRangeDate(dates)}
          allowClear={false}
        />
        <Button type="primary" size="small" style={{ padding: `0 7px` }} onClick={() => ApplyFilterDay()}>
          {tCommon('Apply')}
        </Button>
      </Space>
    </div>
  );
};
