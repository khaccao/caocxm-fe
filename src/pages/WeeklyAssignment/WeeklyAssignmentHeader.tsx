import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Typography, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from '././WeeklyAssignment.module.less';
import { eTrackerCode, FormatDateAPI, formatDateDisplay, sMilestone } from '@/common/define';
import { getActiveMenu } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, issueActions, getTagsVersion, getTracker } from '@/store/issue';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

const { RangePicker } = DatePicker;

export const WeeklyAssignmentHeader = () => {
  const tCommon = useTranslation('common').t;

  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const activeMenu = useAppSelector(getActiveMenu());
  const params = useAppSelector(getIssueQueryParams());

  const [timer, setTimer] = useState<any>(null);
  const [searchStr, setSearchStr] = useState(params?.search);
  const startOfWeek = dayjs().startOf('week');
  const endOfWeek = dayjs().endOf('week');
  const [rangeDate, setRangeDate] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([startOfWeek, endOfWeek]);
  const tags = useAppSelector(getTagsVersion());
  const trackers = useAppSelector(getTracker());
  const getTrackerID = () => {
    let trackerId = 20;
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
      if (tracker && tracker.id) {
        trackerId = tracker.id;
      }
    }
    return trackerId;
  }

  const handleWeek = (action: 'next' | 'prior') => {
    let newStartOfWeek = dayjs().startOf('week');
    let newEndOfWeek = dayjs().endOf('week');
    if (rangeDate) {
      let _endOfWeek: Dayjs | null = null;
      if (rangeDate[1]) {
        _endOfWeek = rangeDate[1];
      } else if (rangeDate[0]) {
        _endOfWeek = rangeDate[0];
      }

      let _startOfWeek: Dayjs | null = null;
      if (rangeDate[0]) {
        _startOfWeek = rangeDate[0];
      } else if (rangeDate[1]) {
        _startOfWeek = rangeDate[1];
      }
      switch (action) {
        case 'next': {
          if (_endOfWeek) {
            newStartOfWeek = _endOfWeek.add(1, 'day');
            newEndOfWeek = _endOfWeek.add(7, 'day');
          }
          break;
        }
        case 'prior': {
          if (_startOfWeek) {
            newEndOfWeek = _startOfWeek?.subtract(1, 'day');
            newStartOfWeek = _startOfWeek?.subtract(7, 'day');
          }
          break;
        }
      }
    }

    setRangeDate([newStartOfWeek, newEndOfWeek]);
  };

  useEffect(() => {
    setSearchStr(params?.search);
  }, [params]);

  const onSearchChange = (evt: any) => {
    if (selectedProject) {
      const search = evt.target.value;
      setSearchStr(search);
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {
        let trackerId = getTrackerID();
        dispatch(
          issueActions.getIssuesByMilestoneRequest({
            projectId: selectedProject.id,
            params: {
              ...params,
              page: 1,
              search,
              timeoutId,
            },
          }),
        );
      }, 500);
      setTimer(timeoutId);
    }
  };

  const ApplyFilterDay = () => {
    if (selectedProject) {
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {
        let start = null;
        let end = null;
        if (rangeDate) {
          if (rangeDate[0]) start = rangeDate[0];
          if (rangeDate[1]) end = rangeDate[1];
        }
        const status= ""; // sMilestone.Processing
        const startDate= start ? start : "";
        const endDate= end ? end : "";
        dispatch(issueActions.setDateFilter({ startDate, endDate }));
        // dispatch(
        //   issueActions.getIssuesByMilestoneRequest({
        //     projectId: selectedProject.id,
        //     params: {
        //       ...params,
        //       page: 1,
        //       status,
        //       startDate,
        //       endDate,
        //       tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
        //     },
        //   }),
        // );
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
          {/* <Button type="primary" shape="circle" icon={<PlusOutlined />} size="small" onClick={createIssue} /> */}
        </div>
        <div className={styles.searchContainer}>
          <Input
            allowClear
            value={searchStr}
            onChange={onSearchChange}
            suffix={searchStr ? null : <SearchOutlined />}
            style={{ borderRadius: 20, width: 200 }}
            placeholder={tCommon('Search')}
          />
          {/* <Button type="primary" shape="circle" icon={<FilterOutlined />} size="small" /> */}
          {/* <Button type="link" size="small" style={{ padding: 0 }}>
            {t('Clear')}
          </Button> */}
        </div>
      </div>
      <Space>
        <Button onClick={() => handleWeek('prior')}>{tCommon('Prior week')}</Button>
        <Button onClick={() => handleWeek('next')}>{tCommon('Next week')}</Button>
        <RangePicker
          format={formatDateDisplay}
          defaultValue={[startOfWeek, endOfWeek]}
          value={rangeDate}
          onChange={dates => setRangeDate(dates)}
          allowClear={false}
        />
        <Button type="primary" size="small" style={{ padding: `0 7px` }} onClick={() => ApplyFilterDay()}>
          {tCommon('Apply')}
        </Button>
        {/* <Button type={'default'} icon={<DownloadOutlined />} size="small" /> */}
        {/* <Button type={'default'} icon={<EllipsisOutlined />} size="small" /> */}
      </Space>
    </div>
  );
};
