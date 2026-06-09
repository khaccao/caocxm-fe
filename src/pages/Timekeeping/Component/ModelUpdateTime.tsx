/* eslint-disable import/order */
import { UpdateTimekeepingModalName } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { getModalVisible, hideModal } from '@/store/modal';
import { getChekinTimeForDay, getMembersByGroupCode, getTeams, timekeepingActions } from '@/store/timekeeping';
import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Form, Input, Modal, Row, Select, Space, Table } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ColumnTableForDays from './ColumnTableForDays';
import './style.css';
import { EditableCell, EditableRow } from './TimeKeepingBymonth';
dayjs.extend(utc);
dayjs.extend(timezone);

interface QueryParams {
  team_id?: number;
  working_day: dayjs.Dayjs;
}

export const ModelUpdateTime = ({ filterParams, queryParamsTemp }: any) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const updateModel = useAppSelector(getModalVisible(UpdateTimekeepingModalName));
  const teams = useAppSelector(getTeams());
  const windowSize = useWindowSize();
  const [dataSource, setDataSource] = useState<any>(null);
  const [originalDataSource, setOriginalDataSource] = useState<any[]>(dataSource); // Giữ dữ liệu gốc
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken');
  const checkIn = useAppSelector(getChekinTimeForDay());
  const { t } = useTranslation('timeKeeping');
  const [deboundceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParams>({ working_day: dayjs().startOf('D') });
  const membersOfBCH = useAppSelector(getMembersByGroupCode('BCH'));
  const handleCancel = () => {
    dispatch(timekeepingActions.setSlectedUser(undefined));
    dispatch(hideModal({ key: UpdateTimekeepingModalName }));
  };
  const [fillterEmployee, setFilterEmployee] = useState<any>('');
  const onChangeTeam = (value: number) => {
    const team = teams.find(x => x.id === value);
    if (team) {
      setQueryParams(prev => ({ ...prev, team_id: team.id }));
    }
  };

  const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (queryParams.team_id || queryParams.working_day) {
      const { team_id, working_day } = queryParams;
      dispatch(timekeepingActions.getAllTimeKeepingsForDay({ team_id: team_id ?? queryParamsTemp.team_id , workingDay: working_day.format('YYYY-MM-DD') }));
    } else {
      console.log(getFormattedDate());
      const { team_id, working_day } = queryParamsTemp;
      dispatch(timekeepingActions.getAllTimeKeepingsForDay({ team_id, workingDay: getFormattedDate()}));
    }
    // eslint-disable-next-line
  }, [queryParams, updateModel]);

  const secondsToHHMM = (minutes: number, minMinute: number = 1) => {
    if (isNaN(minutes) || minutes < minMinute) {
      return '';
    }
    const hours = Math.floor(minutes / 60); // Tính số giờ
    const remainingMinutes = minutes % 60; // Tính số phút còn lại
    // Đảm bảo định dạng 2 chữ số (ví dụ: 04 thay vì 4)
    const hh = String(hours).padStart(2, '0');
    const mm = String(remainingMinutes).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  useEffect(() => {
  if (!updateModel) {
    setDataSource(null);
    setOriginalDataSource([]);
    setFilterEmployee('');
  }
}, [updateModel]);
  const onChangeWorkingDate = (value: any) =>{
    setQueryParams(prev => ({ ...prev, working_day: value }));
  }

  useEffect(() => {
    if (checkIn && checkIn.length > 0) {
      // [hao_lt] Implement #21140 Thêm thanh search cho màn hình chốt giờ theo ngày và thêm STT cho danh sách nhân sự ở chốt giờ theo ngày & tháng
      // [thinh_dmp][27/12/2024] Implement #21230: Sắp xếp các nhân sự thuộc phòng ban BCH xuống cuối
      
      const sortedCheckIn = [...checkIn].sort(function (a, b) {
        if (!membersOfBCH.length) {
          return a.employee_Name - b.employee_Name;
        }
        const aFromBCH = membersOfBCH.find(member => member.id === a.employeeId);
        const bFromBCH = membersOfBCH.find(member => member.id === b.employeeId);
        
        if (aFromBCH && !bFromBCH) {
          return 1;
        }
        else if (!aFromBCH && bFromBCH) {
          return -1;
        }
        else {
          return a.employee_Name - b.employee_Name;
        }
      })
      const memberCodes = membersOfBCH?.map((member: any) => member?.employeeCode);
      const listsortedCheckIn = sortedCheckIn?.filter((item) => !memberCodes?.includes(item?.employeeCode));
      const listBCH = sortedCheckIn?.filter((item) => memberCodes?.includes(item?.employeeCode));
      const mapData = listsortedCheckIn?.map((item: any, index: any) => {
        if (item?.approvedExtra !== null) {
          const { ApprovedShiftTime } = JSON.parse(item.approvedExtra);
          return {
            ...item,
            employee: item.employee_Name,
            casang: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[8], 0) || '',
            cachieu: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[9], 0) || '',
            tangca1: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[10], 0) || '',
            tangca2: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[18], 0) || '',
            tangca3: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[19], 0) || '',
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: secondsToHHMM((ApprovedShiftTime[8] || 0) + (ApprovedShiftTime[9] || 0)) || '',
            totalApprovedOTShift: secondsToHHMM(
              [ApprovedShiftTime?.[10] || 0, ApprovedShiftTime?.[18] || 0, ApprovedShiftTime?.[19] || 0].reduce(
                (sum, value) => sum + +value,
                0,
              ),
            ),
          };
        } else {
          const approvedHours = item?.approved_Shift_Hours || {};
          return {
            ...item,
            employee: item.employee_Name,
            casang: secondsToHHMM(approvedHours && approvedHours[8]) || '',
            cachieu: secondsToHHMM(approvedHours && approvedHours[9]) || '',
            tangca1: secondsToHHMM(approvedHours && approvedHours[10]) || '',
            tangca2: secondsToHHMM(approvedHours && approvedHours[18]) || '',
            tangca3: secondsToHHMM(approvedHours && approvedHours[19]) || '',
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: secondsToHHMM((approvedHours?.[8] || 0) + (approvedHours?.[9] || 0)) || '',
            totalApprovedOTShift: secondsToHHMM(
              [approvedHours?.[10] || 0, approvedHours?.[18] || 0, approvedHours?.[19] || 0].reduce(
                (sum, value) => sum + +value,
                0,
              ),
            ),
          };
        }
      });

      const listBCHNew = listBCH?.map((item: any, index: any) => {
        if (item?.approvedExtra !== null) {
          const { ApprovedShiftTime } = JSON.parse(item?.approvedExtra);
          return {
            ...item,
            employee: item.employee_Name,
            casang: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[8], 0) || '',
            cachieu: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[9], 0) || '',
            tangca1: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[10], 0) || '',
            tangca2: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[18], 0) || '',
            tangca3: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[19], 0) || '',
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: secondsToHHMM((ApprovedShiftTime[8] || 0) + (ApprovedShiftTime[9] || 0)) || '',
            totalApprovedOTShift: secondsToHHMM(
              [ApprovedShiftTime?.[10] || 0, ApprovedShiftTime?.[18] || 0, ApprovedShiftTime?.[19] || 0].reduce(
                (sum, value) => sum + +value,
                0,
              ),
            ),
          };
        } else {
          const approvedHours = item?.approved_Shift_Hours || {};
          return {
            ...item,
            employee: item.employee_Name,
            casang: approvedHours?.[8] > 0 && approvedHours?.[8] < 240 ? '04:00' : secondsToHHMM(approvedHours?.[8] || 0),
            cachieu: approvedHours?.[9] > 0 && approvedHours?.[9] < 240 ? '04:00' : secondsToHHMM(approvedHours?.[9] || 0),
            tangca1: secondsToHHMM(approvedHours && approvedHours[10]) || '',
            tangca2: secondsToHHMM(approvedHours && approvedHours[18]) || '',
            tangca3: secondsToHHMM(approvedHours && approvedHours[19]) || '',
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: checkTime(approvedHours),
            totalApprovedOTShift: secondsToHHMM(
              [approvedHours?.[10] || 0, approvedHours?.[18] || 0, approvedHours?.[19] || 0].reduce(
                (sum, value) => sum + +value,
                0,
              ),
            ),
          };
        }
      });

      const dataCheckInFinal = [...mapData, ...listBCHNew].map((item, index) => ({
        ...item,
        employee: `${index + 1 < 10 ? `0${index + 1}` : index + 1}. ${item.employee}`,
        key: item.employeeCode || `item-${index}`, 
      }));
      setDataSource(dataCheckInFinal);
      setOriginalDataSource(dataCheckInFinal);
    } else {
      setDataSource([]);
    }
  }, [updateModel, queryParams, checkIn, membersOfBCH]);

  // [hao_lt] Implement #21314 Các nhân sự thuộc BCH tự làm tròn cho đủ công cho các ca chính trong tháng
  const checkTime = (approvedHours: any): string => {
    if (!approvedHours) {
      return ""; // Trả về chuỗi rỗng nếu approvedHours là undefined hoặc null
    }
    const morning = approvedHours[8];
    const afternoon = approvedHours[9];
    if (morning > 0 && afternoon > 0) {
      return "08:00";
    }
    if (morning  && morning > 0) {
      return "04:00";
    }
    if (afternoon && afternoon > 0) {
      return "04:00";
    }
    return "";
  };
  
  const handleSave = (row: any) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row?.employeeCode === item?.employeeCode);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  // [#20647] [hao_lt] tạo column Màn hình chốt giờ cho nhiều nhân sự trong một ngày
  const columns = ColumnTableForDays().map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        };
      },
    };
  });
  
const timeToMinutes = (timeStr: string): number => {
    const trimmed = timeStr.trim().toLowerCase();

    if (trimmed.length === 0 || trimmed === '0') {
        return 0;
    }

    // Xử lý dạng '4h30' hoặc '4h' hoặc '30p'
    const hMatch = trimmed.match(/(\d+)h/);
    const pMatch = trimmed.match(/(\d+)p/);

    if (hMatch || pMatch) {
        const hours = hMatch ? Number(hMatch[1]) : 0;
        const minutes = pMatch ? Number(pMatch[1]) : (trimmed.includes('h') ? Number(trimmed.split('h')[1] || '0') : 0);
        return (hours * 60) + minutes;
    }

    // Xử lý dạng giờ:phút
    if (trimmed.includes(':')) {
        const [hoursStr, minutesStr] = trimmed.split(':');
        const hours = Number(hoursStr) || 0;
        const minutes = Number(minutesStr) || 0;
        return (hours * 60) + minutes;
    }

    // Xử lý dạng số nguyên, tự tách giờ phút nếu cần
    const digits = trimmed.replace(/\D/g, ''); // Chỉ lấy số
    if (digits.length <= 2) {
        return Number(digits);
    }

    const minutes = Number(digits.slice(-2));
    const hours = Number(digits.slice(0, -2));
    return (hours * 60) + minutes;
};
  const convertDate = (dateString: string) =>  {
    // Kiểm tra định dạng đầu vào
    if (!/^\d{8}$/.test(dateString)) {
        throw new Error("Định dạng ngày không hợp lệ. Sử dụng YYYYMMDD.");
    }
    // Tách năm, tháng, ngày
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    // Định dạng lại ngày
    return `${year}-${month}-${day}`;
}

  const handleOk = () => form.submit();

  const handleSaveValue = () => {
    if (dataSource && dataSource?.length > 0) {
      let approvedData: any =  null;
      approvedData = dataSource?.map((item: any )=> {
        const approvedShiftTime: any = {};
        if (item.casang.length > 0) approvedShiftTime[8] = timeToMinutes(item.casang);
        if (item.cachieu.length > 0) approvedShiftTime[9] = timeToMinutes(item.cachieu);
        if (item.tangca1.length > 0) approvedShiftTime[10] = timeToMinutes(item.tangca1);
        if (item.tangca2.length > 0) approvedShiftTime[18] = timeToMinutes(item.tangca2);
        if (item.tangca3.length > 0) approvedShiftTime[19] = timeToMinutes(item.tangca3);
        return {
          working_Day: convertDate(item?.date_Key?.toString()),
          face_Identity_Id: item.face_Identity_Id,
          day_Hours: item?.day_Hours,
          approved_Day_Hours: item?.approved_Day_Hours,
          approved_Note: item?.approved_Note || "",
          team_Id: queryParams?.team_id ? queryParams?.team_id : queryParamsTemp?.team_id,
          approvedExtra: JSON.stringify({
            ApprovedShiftTime: approvedShiftTime,
            TotalApprovedMainShift: timeToMinutes(item.casang) + timeToMinutes(item.cachieu),
            TotalApprovedOTShift: timeToMinutes(item.tangca1) + timeToMinutes(item.tangca2) + timeToMinutes(item.tangca3),
          })
        }
      })
      const listApprovedFinal = approvedData.filter((item: any)=> {
        const itemJson = JSON.parse(item?.approvedExtra);
        if (Object.keys(itemJson?.ApprovedShiftTime)?.length === 0) {
          return;
        }
        return item;
      } )

      dispatch(timekeepingActions.approvedTimeKeepingForMonth({approvedData: listApprovedFinal, accessToken, month: undefined, team_id: queryParamsTemp.team_id, working_day: queryParamsTemp?.working_day}))
      dispatch(hideModal({ key: UpdateTimekeepingModalName }));
    }
  }
// [hao_lt] Implement #21140 Thêm thanh search cho màn hình chốt giờ theo ngày và thêm STT cho danh sách nhân sự ở chốt giờ theo ngày & tháng
  useEffect(() => {
    if (deboundceTimer) {
      clearTimeout(deboundceTimer);
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (checkIn && fillterEmployee.trim() !== '') {
        const result = originalDataSource.filter((t: any) => {
          return t.employee_Name.toLowerCase().includes(fillterEmployee?.toLowerCase());
        });
        setDataSource(result);
      } else {
        setDataSource(originalDataSource);
      }
      setIsLoading(false);
    }, 400);
    setDebounceTimer(timer);
    return () => {
      if (deboundceTimer) {
        clearTimeout(deboundceTimer)
      }
    }
  },[fillterEmployee, originalDataSource])



  const onSearchString = (e: any) => {
    setFilterEmployee(e.target.value);
  }


  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <>
      <Modal
        open={updateModel}
        centered
        okText={'Lưu'}
        width={'1000px'}
        destroyOnClose
        className="modal-timekeeping"
        onCancel={handleCancel}
        onOk={handleOk}
        style={{ width: '300px', ...{ important: 'true' } }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Row style={{ margin: 0, display: 'flex', justifyContent: 'end' }} align="stretch">
            <Space>
            <Button key="remove" type="primary"  onClick={() => handleSaveValue()}>
              {t('Lưu')}
            </Button>
            </Space>
          </Row>
        )}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{t('Chốt giờ cho nhân sự theo ngày')}</div>
          <div>
          <Input
            placeholder={t('Tìm nhân sự')}
            allowClear
            onChange={onSearchString}
            suffix={filterParams.filterString ? null : <SearchOutlined />}
            style={{ width: 200, marginLeft: 4, marginTop: 4, marginRight: 10 }}
          />
            <Select
              style={{ width: 200, marginRight: 25, marginBottom: '5px' }}
              onChange={onChangeTeam}
              options={teams.map((t: any) => ({ label: t.name, value: t.id }))}
              value={queryParams.team_id || queryParamsTemp.team_id}
            />
            <DatePicker
              allowClear={false}
              onChange={onChangeWorkingDate}
              value={queryParams.working_day}
              format={'DD/MM/YYYY'}
              style={{ marginRight: '25px'}}
            />
          </div>
        </div>
        <Table
          className='wrapperTable' 
          rowHoverable={false}
          loading={isLoading}
          rowKey={record => record.employeeCode}
          components={components}
          columns={columns as any}
          rowClassName={() => 'editable-row'}
          dataSource={dataSource || []}
          bordered
          size="small"
          scroll={{ x: 1000, y: windowSize[1] - 300 }}
          locale={{
            emptyText: <Empty description={t('No data timekeeping')}></Empty>,
          }}
          pagination={false}
        />
      </Modal>
    </>
  );
};
