import { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './StatisticBonus.module.less';
import { getActiveMenu } from '@/store/app';
import { useAppSelector } from '@/store/hooks';


export const StatisticBonusHeader = ({ onSelectDates, searchStr, setSearchStr  }: any) => {
  const tCommon = useTranslation('common').t;
  const activeMenu = useAppSelector(getActiveMenu());
  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs().subtract(7, 'day'), dayjs()]);

  // [#20693][dung_lt][10/11/2024]] Tìm theo tên
  const onSearchChange = (e: any) => {
    setSearchStr(e.target.value);
  };

  // [#20693][dung_lt][10/11/2024] Áp dụng bộ lọc ngày
  const ApplyFilterDay = () => {
    if (selectedDates) {
      onSelectDates(selectedDates);
    }
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setSelectedDates(dates);
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
            suffix={searchStr ? null : <SearchOutlined />}
            style={{ borderRadius: 20, width: 200 }}
            placeholder={tCommon('Search')}
          />
        </div>
      </div>
      <Space>
      <DatePicker.RangePicker
          defaultValue={selectedDates?? undefined}
          onChange={handleRangeChange}
          className="date-picker"
        />
        <Button type="primary" size="small" style={{ padding: `0 7px` }} onClick={() => ApplyFilterDay()}>
          {tCommon('Apply')}
        </Button>
      </Space>
    </div>
  );
};
