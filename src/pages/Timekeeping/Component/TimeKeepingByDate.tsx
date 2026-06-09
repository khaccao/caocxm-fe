import React, { useState } from 'react';

import { Button, Drawer, Row, Typography } from 'antd';

import { ModelUpdateTime } from './ModelUpdateTime';
import { CheckInDetail } from '../CheckInDetail';
import { UpdateTimekeepingModalName } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showModal } from '@/store/modal';
import './style.css';
interface TimeKeepingByDateProps {
  language: string;
  t: (key: string) => string;
  timelineRef: React.RefObject<HTMLDivElement>;
  checkInDetail: any;
  queryParams: any;
  filterParams: any;
  onCloseDetailPanel: () => void;
  openDetailPanel: boolean;
  checkInCount: number; // Nhận dữ liệu tổng số nhân sự chấm công
  teams: any;
  onChangeTeam: any;
}

export const TimeKeepingByDate: React.FC<TimeKeepingByDateProps> = ({
  language,
  t,
  timelineRef,
  checkInDetail,
  queryParams,
  filterParams,
  onCloseDetailPanel,
  openDetailPanel,
  checkInCount, // Sử dụng dữ liệu này
}) => {
  const dispatch = useAppDispatch();
  const [isShow, setIsShow] = useState<boolean>(false);
  const openModelTimeKeepingByDate = () => {
    setIsShow(true)
    dispatch(showModal({key: UpdateTimekeepingModalName}))
  }
  return (
    <>
      <Row style={{ height: 30, marginBottom: 10, marginTop: 10 }}>
        <div className="mem" style={{ display: 'flex', justifyContent: 'column' }}>
          <div className="vis-item vis-point" style={{ transform: 'translateX(10px)' }}>
            <div className="vis-item-content" style={{ marginLeft: 6 }}>
              {t('Late for work')}
            </div>
            <div className="vis-item vis-dot late-for-work" style={{ top: 12, transform: 'translateX(-2px)' }}></div>
          </div>
          <div
            className="vis-item vis-point"
            style={{ transform: language === 'vi' ? 'translateX(110px)' : 'translateX(120px)' }}
          >
            <div className="vis-item-content" style={{ marginLeft: 6 }}>
              {t('Working')}
            </div>
            <div className="vis-item vis-dot working" style={{ top: 12, transform: 'translateX(-2px)' }}></div>
          </div>
          <div className="vis-item vis-point" style={{ transform: 'translateX(210px)' }}>
            <div className="vis-item-content" style={{ marginLeft: 6 }}>
              {t('Arrive early')}
            </div>
            <div className="vis-item vis-dot arrive-early" style={{ top: 12, transform: 'translateX(-2px)' }}></div>
          </div>
          <div className="vis-item vis-point" style={{ transform: 'translateX(310px)' }}>
            <div className="vis-item-content" style={{ marginLeft: 6 }}>
              {t('Leave late')}
            </div>
            <div className="vis-item vis-dot leave-late" style={{ top: 12, transform: 'translateX(-2px)' }}></div>
          </div>
          <div className="vis-item vis-point" style={{ transform: 'translateX(400px)' }}>
            <div className="vis-item-content" style={{ marginLeft: 6 }}>
              {t('Total checked-in employees')}: <span style={{ fontWeight: 'bold' }}>{checkInCount}</span>
            </div>
          </div>
          <div style={{ transform: 'translateX(690px)' }}>
            <div className="vis-item-content">
              <WithPermission policyKeys={['ChamCong.TrackingByDay']} strategy='disable'>
                <Button 
                type="primary"
                htmlType="submit"
                onClick={openModelTimeKeepingByDate}
                >
                  {t('Chốt giờ theo ngày')}
                </Button>
              </WithPermission>
            </div>
          </div>
        </div>
      </Row>
      <div ref={timelineRef}></div>
      <Drawer
        title={
          <Row align="stretch">
            <Typography.Link style={{ flex: 1, fontWeight: 600, fontSize: 18, cursor: 'default' }}>
              {checkInDetail?.name}
            </Typography.Link>
            <Typography.Text style={{ paddingTop: 4 }} type="secondary">
              {checkInDetail?.jobTitle}
            </Typography.Text>
          </Row>
        }
        placement="right"
        onClose={onCloseDetailPanel}
        open={openDetailPanel}
        width={500}
      >
        <CheckInDetail
          working_day={queryParams.working_day}
          shifts={filterParams.shifts}
          team_id={queryParams.team_id!}
        />
      </Drawer>
      {isShow && 
      <ModelUpdateTime
        filterParams={filterParams}
        queryParamsTemp={queryParams}
      />}
    </>
  );
};
