import React, { useEffect, useState } from 'react'

import { Empty, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './StatisticBonus.module.less';
import StatisticBonusContent from './StatisticBonusContent';
import { StatisticBonusHeader } from './StatisticBonusHeader';
import { FormatDate, FormatDateAPI, sMilestone } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { issueActions } from '@/store/issue';
import { getSelectedProject, projectActions } from '@/store/project';
import { teamActions } from '@/store/team';

const StatisticBonus = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const { t } = useTranslation('statistic');
  const selectedProject = useAppSelector(getSelectedProject());
  const [searchStr, setSearchStr] = useState('');
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (selectedProject && startDate && endDate) {
      dispatch(
        projectActions.getDinhMucThuongsRequest({
          projectId: selectedProject.id,
          teamId: -1,
          startDate: startDate.format(FormatDateAPI),
          endDate: endDate.format(FormatDateAPI),
        }),
      );
    }
  }, [startDate, endDate]);

  useEffect(() => {
    selectedProject && dispatch(teamActions.getTeamsRequest({ projectId: selectedProject.id, queryParams: {} }));
    company &&
      dispatch(
        issueActions.getCategoryByCompanyIdRequest({
          companyId: company.id,
          tagVersionCode: sMilestone.SetupInitialProgress,
        }),
      );
  }, [company, selectedProject]);
  
  // [#20693][dung_lt][10/11/2024] xử lý khi select ngày lọc
  const handleSelectDates = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };
  return (
    <>
      <StatisticBonusHeader onSelectDates={handleSelectDates} searchStr={searchStr} setSearchStr={setSearchStr}/>
      <div
        className={styles.wrapperStatisticBonus}
      >
        {
          !startDate && !endDate && (
            <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 150px)',
              backgroundColor: 'white',
              margin: 10,
            }}
          >
            <Empty
              description={
                <>
                  <Typography.Title level={4}>{t('No data available.')}</Typography.Title>
                  {
                    !startDate && !endDate && (
                      <Typography.Text>{t('Please select a date filter!')}</Typography.Text>
                    )
                  }
                </>
              }
            />
          </div>
          )
        }
        {
          startDate && endDate && (
            <div style={{ padding: 5 }}>
              <div style={{width:"100%", background:'white', height: 'calc(100vh - 150px)', padding:"10px"}}>
              <Typography.Text
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'text',
                }}
              >
                {`${startDate.format(FormatDate)} - ${endDate.format(FormatDate)}`}
              </Typography.Text>
                <StatisticBonusContent startDate={startDate} endDate={startDate} search={searchStr} />
              </div>
            </div>
          )
        }
         {/* */}
      </div>
    </>
  )
}
export default StatisticBonus;
