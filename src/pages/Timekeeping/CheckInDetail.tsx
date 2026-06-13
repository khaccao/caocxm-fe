import React, { useEffect } from 'react';

import { FileImageOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Divider, Form, Input, Row, TimePicker, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import mapIcon from '@/image/icon/map.png';
import { ShiftResponse } from '@/services/CheckInService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getActiveLoading } from '@/store/loading';
import { showModal } from '@/store/modal';
import { getSelectedCheckInDetail, timekeepingActions } from '@/store/timekeeping';
import Utils from '@/utils';

interface CheckInDetailProps {
  shifts: ShiftResponse[];
  team_id: number;
  working_day: dayjs.Dayjs;
}

export const CheckInDetail = ({ shifts, team_id, working_day }: CheckInDetailProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['common', 'faceck']);
  const chkInDtl = useAppSelector(getSelectedCheckInDetail());
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken');
  const confirmLoading = useAppSelector(getActiveLoading('approvedHoursWorkingRequest'));
  const detailWorkday = chkInDtl?.date_Key
    ? dayjs(Utils.convertDate(chkInDtl.date_Key.toString()))
    : working_day;
  const crossDayCheckIns = (chkInDtl?.checkIn_List || [])
    .map((item: any) => ({
      ...item,
      localTime: dayjs(Utils.convertISODateToLocalTime(item.timeStamp)),
    }))
    .filter((item: any) => !item.localTime.isSame(detailWorkday, 'day'))
    .sort((a: any, b: any) => a.localTime.valueOf() - b.localTime.valueOf());
  const displayShifts = shifts
    .filter(shift => shift.id)
    .sort((a, b) => {
      const aIsContinuation = a.startTime < '07:00:00';
      const bIsContinuation = b.startTime < '07:00:00';
      if (aIsContinuation !== bIsContinuation) {
        return aIsContinuation ? 1 : -1;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  useEffect(() => {
    if (chkInDtl) {
      const { day_Hours, approved_Day_Hours, approved_Note, notes } = chkInDtl;
      const dateOnly = working_day.format('YYYY-MM-DD');
      let workingHours = day_Hours
        ? Utils.normalizeShiftBoundaryTime(dayjs(`${dateOnly}T${day_Hours}`))
        : dayjs(dateOnly);
      // workingHours = dayjs(`${dateOnly}T7:30:00`);
      let approvedHours =
        !approved_Day_Hours || approved_Day_Hours === '00:00:00'
          ? workingHours
          : dayjs(`${dateOnly}T${approved_Day_Hours}`);
      approvedHours = Utils.roundTime(approvedHours);
      let meal = 0;
      if (chkInDtl.meals?.length > 0) {
        chkInDtl.meals.forEach((x: any) => {
          if (dayjs(x.timeStamp).format('YYYY-MM-DD') === dateOnly) {
            const mealInfo = JSON.parse(x.information);
            meal += mealInfo.meal1 + mealInfo.meal2;
          }
        });
      }
      form.setFieldsValue({
        day_Hours: workingHours,
        approved_Day_Hours: approvedHours,
        approved_Note: approved_Note,
        note: notes && notes[0]?.content ? notes[0].content : '',
        meal,
      });
    }
    // eslint-disable-next-line
  }, [chkInDtl, working_day]);


  const showLocationImgCheckIn = (chkIn: any) => {
    dispatch(timekeepingActions.setSelectedCheckInItem(chkIn));
    dispatch(showModal({ key: 'showLocationImgCheckIn' }));
  };
  const onSubmitApprovedHoursWorking = (value: any) => {
    const { day_Hours, approved_Day_Hours, approved_Note, meal } = value;
    const approvedData = {
      face_Identity_Id: chkInDtl?.id || chkInDtl?.face_Identity_Id,
      working_day: chkInDtl?.face_Identity_Id ? dayjs(Utils.convertDate(chkInDtl.date_Key.toString())) : working_day,
      day_Hours,
      approved_Day_Hours,
      approved_Note: approved_Note ?? '',
      team_id,
      meal,
    };
    dispatch(timekeepingActions.approvedHoursWorkingRequest({ approvedData, accessToken }));
  };

  const renderCheckInTime = (shift: ShiftResponse, index: number) => {
    const chkInList = chkInDtl?.checkIn_List?.filter((x: any) => x.shift_Id === shift.id);
    const workday = detailWorkday;
    const dateOnly = workday.format('YYYY-MM-DD');
    const goToWork = dayjs(`${dateOnly}T${shift?.startTime || ''}`);
    const getOffWork = dayjs(`${dateOnly}T${shift?.endTime || ''}`);
    const isNightContinuation = shift.startTime < '07:00:00';
    const timeSuffix = goToWork.isAfter(getOffWork) ? ` ${t('Hôm sau')}` : '';

    return (
      <React.Fragment key={shift.id}>
        <Row style={{ paddingBottom: 10, marginLeft: -10, marginTop: -10 }}>
          <Typography.Link style={{ fontWeight: 600, cursor: 'default', marginRight: 10 }}>
            {shift.name}
          </Typography.Link>
          <Typography.Text type="secondary">
            {`(${goToWork.format('HH:mm')} - ${getOffWork.format('HH:mm')}${timeSuffix})`}
          </Typography.Text>
          {isNightContinuation && (
            <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
              Ngày hôm sau, tính vào ngày công {workday.format('DD/MM/YYYY')}
            </Typography.Text>
          )}
        </Row>
        {chkInList?.map((chkIn: any, idx: number) => {
          const ckInTime = Utils.convertISODateToLocalTime(chkIn.timeStamp);
          const checkInDay = dayjs(ckInTime);
          const belongsToPreviousWorkday = !checkInDay.isSame(workday, 'day');
          const checkInTimeLabel = belongsToPreviousWorkday
            ? `${checkInDay.format('DD/MM HH:mm')} (tính vào ${workday.format('DD/MM')})`
            : checkInDay.format('HH:mm');
          const position = Utils.parseCheckInLocation(chkIn.location);
          const formatedAddress =
            position?.address || (position ? `Lat: ${position.latitude} - Long: ${position.longitude}` : '');
          return (
            <Row key={chkIn.id} align="stretch">
              <Typography.Text
                style={{ fontWeight: 600, minWidth: belongsToPreviousWorkday ? 210 : 70, padding: 5 }}
              >
                {`${idx + 1}. ${checkInTimeLabel}`}
              </Typography.Text>
              <Button
                ghost
                shape="circle"
                onClick={() => showLocationImgCheckIn(chkIn)}
                icon={
                  <i>
                    <img src={mapIcon} alt="map-icon" width={18} height={19} />
                  </i>
                }
              ></Button>
              <Button
                ghost
                shape="circle"
                onClick={() => showLocationImgCheckIn(chkIn)}
                icon={<FileImageOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
              ></Button>
              <div className="check-in-location" title={formatedAddress}>
                {formatedAddress}
              </div>
            </Row>
          );
        })}
        {index < shifts.length - 2 && <Divider style={{ margin: `5px -15px 15px -10px` }} />}
      </React.Fragment>
    );
  };

  return (
    <div>
      <Row align="stretch">
        <Typography.Text style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>{t('History check-in')}</Typography.Text>
        <Typography.Text style={{ paddingTop: 4 }}>
          Ngày công:{' '}
          <b>
            {chkInDtl?.face_Identity_Id
              ? Utils.convertDate(chkInDtl.date_Key.toString(), true)
              : working_day.format('DD/MM/YYYY')}
          </b>
        </Typography.Text>
      </Row>
      <Row style={{ marginTop: 10 }}>
        {crossDayCheckIns.length > 0 && (
          <Alert
            type="info"
            showIcon
            style={{ width: '100%', marginBottom: 10 }}
            message="Ca đêm liên ngày"
            description={
              <div>
                <div>
                  Ngày công: <b>{detailWorkday.format('DD/MM/YYYY')}</b>
                </div>
                <div>
                  Lượt sau nửa đêm:{' '}
                  <b>{crossDayCheckIns.map((item: any) => item.localTime.format('DD/MM HH:mm')).join(', ')}</b>
                </div>
                <div>
                  Toàn bộ thời gian sau nửa đêm được gộp và tính vào ngày công{' '}
                  <b>{detailWorkday.format('DD/MM/YYYY')}</b>.
                </div>
              </div>
            }
          />
        )}
        <Card style={{ width: '100%' }}>
          {displayShifts.map((shift, idx) => renderCheckInTime(shift, idx))}
        </Card>
      </Row>
      <Row style={{ marginTop: 15 }}>
        <Form
          form={form}
          autoComplete="off"
          layout="horizontal"
          labelCol={{ span: 6 }}
          style={{ width: '100%' }}
          onFinish={onSubmitApprovedHoursWorking}
          requiredMark={false}
        >
          <Form.Item
            labelAlign="left"
            label={t('Số giờ làm')}
            name="day_Hours"
            style={{ marginBottom: 5, width: '100%' }}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" disabled />
          </Form.Item>
          {/* <Form.Item
            labelAlign="left"
            label={t('Chốt giờ')}
            name="approved_Day_Hours"
            style={{ marginBottom: 5 }}
            rules={[{ required: true, message: t('ThisFieldIsRequired') }]}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item> */}
          {/* <Form.Item
            labelAlign="left"
            label={t('Chấm cơm')}
            name="meal"
            style={{ marginBottom: 5, width: '100%' }}
            rules={[{ required: true, message: t('ThisFieldIsRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={2} precision={0} />
          </Form.Item> */}
          <Row>
            <Typography.Text>{t('Ghi chú điểm danh:')}</Typography.Text>
          </Row>
          <Form.Item name="note">
            <Input.TextArea rows={2} style={{ width: '100%' }} readOnly={true}/>
          </Form.Item>
          {/* <Row>
            <Typography.Text>{t('Ghi chú chốt giờ:')}</Typography.Text>
          </Row>
          <Form.Item name="approved_Note" rules={[{ required: true, message: t('ThisFieldIsRequired') }]} >
            <Input.TextArea rows={2} style={{ width: '100%' }}/>
          </Form.Item> */}
          {/* <div style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading}>
              {t('Lưu thay đổi')}
            </Button>
          </div> */}
        </Form>
      </Row>
    </div>
  );
};
