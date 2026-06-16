import React, { useState } from 'react';

import { Badge, Button, Drawer, Row, Space, Switch, Typography } from 'antd';

import { ModelUpdateTime } from './ModelUpdateTime';
import { CheckInDetail } from '../CheckInDetail';
import { UpdateTimekeepingModalName } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showModal } from '@/store/modal';
import './style.css';
interface TimeKeepingByDateProps {
  t: (key: string) => string;
  timelineRef: React.RefObject<HTMLDivElement>;
  checkInDetail: any;
  queryParams: any;
  filterParams: any;
  onCloseDetailPanel: () => void;
  openDetailPanel: boolean;
  checkInCount: number; // Nhận dữ liệu tổng số nhân sự chấm công
  showTerminatedEmployees: boolean;
  onShowTerminatedEmployeesChange: (checked: boolean) => void;
  teams: any;
  onChangeTeam: any;
}

export const TimeKeepingByDate: React.FC<TimeKeepingByDateProps> = ({
  t,
  timelineRef,
  checkInDetail,
  queryParams,
  filterParams,
  onCloseDetailPanel,
  openDetailPanel,
  checkInCount, // Sử dụng dữ liệu này
  showTerminatedEmployees,
  onShowTerminatedEmployeesChange,
}) => {
  const dispatch = useAppDispatch();
  const [isShow, setIsShow] = useState<boolean>(false);
  const openModelTimeKeepingByDate = () => {
    setIsShow(true)
    dispatch(showModal({key: UpdateTimekeepingModalName}))
  }
  return (
    <>
      <Row
        align="middle"
        justify="space-between"
        wrap
        style={{ minHeight: 40, margin: '8px 0', gap: 12 }}
      >
        <Space size={18} wrap>
          <Badge color="#ff4d4f" text={t('Late for work')} />
          <Badge color="#1677ff" text={t('Working')} />
          <Badge color="#d89614" text={t('Arrive early')} />
          <Badge color="#389e0d" text={t('Leave late')} />
        </Space>

        <Space size={16} wrap>
          <Typography.Text>
            {t('Total checked-in employees')}: <strong>{checkInCount}</strong>
          </Typography.Text>
          <Space size={6}>
            <Switch
              size="small"
              checked={showTerminatedEmployees}
              onChange={onShowTerminatedEmployeesChange}
            />
            <Typography.Text>Hiển thị đã nghỉ việc</Typography.Text>
          </Space>
          <WithPermission policyKeys={['ChamCong.TrackingByDay']} strategy='disable'>
            <Button
              type="primary"
              htmlType="submit"
              onClick={openModelTimeKeepingByDate}
            >
              {t('Chốt giờ theo ngày')}
            </Button>
          </WithPermission>
        </Space>
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
