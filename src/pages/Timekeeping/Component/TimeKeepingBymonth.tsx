/* eslint-disable import/order */
import React, { useContext, useEffect, useRef, useState } from 'react';

import { Col, Drawer, Empty, Form, FormInstance, Input, InputRef, Row, Space, Table, TableProps, Typography } from 'antd';
import { useDispatch } from 'react-redux';

import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getAllTimeForMonthOfOneEmployee, getMembersByGroupCode, timekeepingActions } from '@/store/timekeeping';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ColumnTimeKeepingForMonth } from './Column';
import './style.css';


import { DataType, EditableCellProps, TimeKeepingByDateProps } from '@/services/CheckInService';
import { useSearchParams } from 'react-router-dom';
import { CheckInDetail } from '../CheckInDetail';

dayjs.extend(customParseFormat)



interface EditableRowProps {
  index: number;
}

type ColumnTypes = Exclude<TableProps<DataType>['columns'], undefined>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};


export const TimeKeepingBymonth = ({
  checkIn,
  queryParams,
  onCloseDetailPanel,
  openDetailPanel,
  filterParams,
  setOpenDetailPanel,
  tTime,
  selectedMonthKeeping,
  option,
  term,
  saveDatatableTime,
  setSaveDataTableTime
}: TimeKeepingByDateProps) => {
  const { Search } = Input;
  const dispatch = useDispatch();
  const windowSize = useWindowSize();
  const [searchParams] = useSearchParams();

  const [selectedKey, setSelectedKey] = useState(null);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [dataTableTime, setDataTableTime] = useState<any>(null);
  const [dataTimeEdit, setDataTimeEdit] = useState<any>(null);
  const [deboundceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [dataFilter, setDataFilter] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = searchParams.get('accessToken');
  const [allTime, setAllTime] = useState<any>({
    tckChotCaChinh: 0,
    tckChotCaTangCa: 0,
  })
  const [fillterEmployee, setFilterEmployee] = useState<string>('');
  
  const allTimeForMonthOfOneEmployee = useAppSelector(getAllTimeForMonthOfOneEmployee());
  const isLoadingSavingEditTime = useAppSelector(getLoading('approvedTimekeepingRequest'));
  const isLoadingGetAllTime = useAppSelector(getLoading('getAllTimeOfOneEmployee'));
  const membersOfBCH = useAppSelector(getMembersByGroupCode('BCH'))
  useEffect(() => {
    // [thinh_dmp] [27/12/2024] [fix: add outSide_Team also as inSide_Team]
    if (checkIn) {
      // [hao_lt] Implement #21140 Thêm thanh search cho màn hình chốt giờ theo ngày và thêm STT cho danh sách nhân sự ở chốt giờ theo ngày & tháng
      const checkInList = (checkIn.inSide_Team || []).concat(checkIn.outSide_Team || []);
      const sortedCheckInList = [...checkInList].sort(function (a, b) {
        if (!membersOfBCH.length) {
          return a.name - b.name;
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
          return a.name - b.name;
        }
      })
      const result = sortedCheckInList.map((t: any, index: any) => {
        return {...t, name:  `${index < 9 ? `0${index + 1}` : index + 1}. ` + t.name };
      });
      setDataSource(result);
    } else {
      setDataSource([]);
    }
  }, [checkIn]);

  useEffect(() => {
      if (dataSource && selectedKey) {
        dispatch(
          timekeepingActions.getAllTimeOfOneEmployee({ face_identity_id: selectedKey, month: selectedMonthKeeping }),
        );
        setAllTime({ 
          tckChotCaChinh: 0,
          tckChotCaTangCa: 0
        })
      } else {
        dispatch(timekeepingActions.setAllTimeKeepingForMonth([]));
      }
  }, [dataSource, selectedKey, selectedMonthKeeping]);

  useEffect(()=> {
    if (queryParams.team_id) {
      dispatch(timekeepingActions.setAllTimeKeepingForMonth([]));
      setSelectedKey(null);
    }
  }, [queryParams.team_id])

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
    if (allTimeForMonthOfOneEmployee && allTimeForMonthOfOneEmployee.length > 0) {
      // [hao_lt] Fix bug handle số kỳ trong 1 tháng
      const half = 15;
      const arr2 = allTimeForMonthOfOneEmployee.slice(half);
      const arr1 = allTimeForMonthOfOneEmployee.slice(0, half);
      const memberCodes = membersOfBCH?.map((member: any) => member?.employeeCode);
      const listChooseOption = (arr1?.length > 0 || arr2?.length > 0) &&  (term === "1" ? arr1 : arr2);

      const arr = listChooseOption?.map((item: any) => {
        if (item?.approvedExtra !== null && !memberCodes.includes(item.employeeCode)) {
          const { ApprovedShiftTime } = JSON.parse(item.approvedExtra);
          return {
            ...item,
            casang: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[8],0) || "",
            cachieu: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[9],0) || "",
            tangca1: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[10],0) || "",
            tangca2: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[18],0) || "",
            tangca3: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[19],0) || "",
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: secondsToHHMM((ApprovedShiftTime[8] || 0) + (ApprovedShiftTime[9] || 0)) || "",
            totalApprovedOTShift: secondsToHHMM(
              [
                ApprovedShiftTime?.[10] || 0,
                ApprovedShiftTime?.[18] || 0,
                ApprovedShiftTime?.[19] || 0
              ].reduce((sum, value) => sum + +value, 0)
            )
          };
        }
        const approvedHours = item?.approved_Shift_Hours || {};
        if (approvedHours && !memberCodes.includes(item.employeeCode)) {
          return {
            ...item,
            casang: secondsToHHMM(approvedHours && approvedHours[8]) || "",
            cachieu: secondsToHHMM(approvedHours && approvedHours[9]) || "",
            tangca1: secondsToHHMM(approvedHours && approvedHours[10]) || "",
            tangca2: secondsToHHMM(approvedHours && approvedHours[18]) || "",
            tangca3: secondsToHHMM(approvedHours && approvedHours[19]) || "",
            checkin_Note: item?.checkin_Note || '',
            totalApprovedMainShift: secondsToHHMM((approvedHours?.[8] || 0) + (approvedHours?.[9] || 0)) || "",
            totalApprovedOTShift: secondsToHHMM(
              [
                approvedHours?.[10] || 0,
                approvedHours?.[18] || 0,
                approvedHours?.[19] || 0
              ].reduce((sum, value) => sum + +value, 0)
            )
          };
        }
        // [hao_lt] Implement #21314 Các nhân sự thuộc BCH tự làm tròn cho đủ công cho các ca chính trong tháng
        if (memberCodes.includes(item.employeeCode) ) {
          if (item?.approvedExtra !== null && item?.approvedExtra !== "") {
            const { ApprovedShiftTime } = JSON.parse(item.approvedExtra);
            return {
              ...item,
              casang: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[8],0) || "",
              cachieu: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[9],0) || "",
              tangca1: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[10],0) || "",
              tangca2: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[18],0) || "",
              tangca3: secondsToHHMM(ApprovedShiftTime && ApprovedShiftTime[19],0) || "",
              checkin_Note: item?.checkin_Note || '',
              totalApprovedMainShift: secondsToHHMM((ApprovedShiftTime[8] || 0) + (ApprovedShiftTime[9] || 0)) || "",
              totalApprovedOTShift: secondsToHHMM(
                [
                  ApprovedShiftTime?.[10] || 0,
                  ApprovedShiftTime?.[18] || 0,
                  ApprovedShiftTime?.[19] || 0
                ].reduce((sum, value) => sum + +value, 0)
              )
            };
          } else {
          const approvedHours = item?.approved_Shift_Hours || {};
          return {
            ...item,
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
        }
      })
      // [hao_lt] Implement #21314 Các nhân sự thuộc BCH tự làm tròn cho đủ công cho các ca chính trong tháng
      const tckChotCaChinh = arr.reduce((sum: number, value: any) => {
        if (value && value?.employeeCode && !memberCodes.includes(value.employeeCode)) {
          if (value.approvedExtra) {
            const {TotalApprovedMainShift} = JSON.parse(value.approvedExtra);
            return sum + TotalApprovedMainShift
          }else {
            const shiftHours = value?.approved_Shift_Hours || []; // Default to an empty array if null or undefined
            const shift8 = shiftHours[8] || 0; // Use 0 if the value doesn't exist
            const shift9 = shiftHours[9] || 0; // Use 0 if the value doesn't exist
            return sum + shift8 + shift9;
          }
        } else {
          if (value?.approvedExtra) {
            const {TotalApprovedMainShift} = JSON.parse(value?.approvedExtra);
            return sum + TotalApprovedMainShift
          }else {
            const shift8 = timeToMinutes(value?.casang) || 0; // Use 0 if the value doesn't exist
            const shift9 = timeToMinutes(value?.cachieu) || 0; // Use 0 if the value doesn't exist
            return sum + shift8 + shift9;
          }
        }
      }, 0);
      const tckChotCaTangCa = arr.reduce((sum: number, value: any) => {
        if (value.approvedExtra) {
          const {TotalApprovedOTShift} = JSON.parse(value.approvedExtra);
          return sum + TotalApprovedOTShift;
        }
        const shiftHours = value?.approved_Shift_Hours || []; // Default to an empty array if null or undefined
        const shift10 = shiftHours[10] || 0; // Use 0 if the value doesn't exist
        const shift18 = shiftHours[18] || 0; // Use 0 if the value doesn't exist
        const shift19 = shiftHours[19] || 0; // Use 0 if the value doesn't exist
        return sum + shift10 + shift18 + shift19;
      }, 0);
      setAllTime({tckChotCaChinh, tckChotCaTangCa})
      setDataTableTime(arr);
    } else {
      setDataTableTime([]);
    }
  }, [allTimeForMonthOfOneEmployee, dataSource, option, term]);

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

const timeToMinutes = (timeStr: string): number => {
    const trimmed = timeStr.trim().toLowerCase();

    if (trimmed.length === 0 || trimmed === '0') {
        return 0;
    }

    //  Xử lý dạng '4h30' hoặc '4h' hoặc '30p'
    const hMatch = trimmed.match(/(\d+)h/);
    const pMatch = trimmed.match(/(\d+)p/);

    if (hMatch || pMatch) {
        const hours = hMatch ? Number(hMatch[1]) : 0;
        const minutes = pMatch ? Number(pMatch[1]) : (trimmed.includes('h') ? Number(trimmed.split('h')[1] || '0') : 0);
        return (hours * 60) + minutes;
    }

    //  Xử lý dạng giờ:phút
    if (trimmed.includes(':')) {
        const [hoursStr, minutesStr] = trimmed.split(':');
        const hours = Number(hoursStr) || 0;
        const minutes = Number(minutesStr) || 0;
        return (hours * 60) + minutes;
    }

    //  Xử lý dạng số nguyên, tự tách giờ phút nếu cần
    const digits = trimmed.replace(/\D/g, ''); // Chỉ lấy số
    if (digits.length <= 2) {
        return Number(digits);
    }

    const minutes = Number(digits.slice(-2));
    const hours = Number(digits.slice(0, -2));
    return (hours * 60) + minutes;
};

  useEffect(()=> {
    if (saveDatatableTime && dataTableTime && dataTableTime?.length > 0) {
      let approvedData: any =  null;
      approvedData = dataTableTime?.map((item: any )=> {
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
          team_Id: queryParams.team_id,
          approvedExtra: JSON.stringify({
            ApprovedShiftTime: approvedShiftTime,
            TotalApprovedMainShift: timeToMinutes(item.casang) + timeToMinutes(item.cachieu),
            TotalApprovedOTShift: timeToMinutes(item.tangca1) + timeToMinutes(item.tangca2) + timeToMinutes(item.tangca3),
          })
        }
      })
      // [hao_lt][24/10/2024]_Fix filter những ngày không chấm công.
      const listApprovedFinal = approvedData.filter((item: any)=> {
        const itemJson = JSON.parse(item?.approvedExtra);
        if (Object.keys(itemJson?.ApprovedShiftTime)?.length === 0) {
          return;
        }
        return item;
      } )
      dispatch(timekeepingActions.approvedTimeKeepingForMonth({approvedData: listApprovedFinal, accessToken, month: selectedMonthKeeping }))
      setSaveDataTableTime(false)
    }
  },[saveDatatableTime])

  const handleClick = (key: any, record: any) => {
    setSelectedKey(record.id);
  };

  useEffect(() => {
    if (deboundceTimer) {
      clearTimeout(deboundceTimer);
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (checkIn && fillterEmployee.trim() !== '') {
        // [hao_lt] Implement #21140 Thêm thanh search cho màn hình chốt giờ theo ngày và thêm STT cho danh sách nhân sự ở chốt giờ theo ngày & tháng
        const result = dataSource.filter((t: any) => {
          return t.name.toLowerCase().includes(fillterEmployee.toLowerCase());
        });
        setDataFilter(result);
      } else {
        setDataFilter([]);
      }
      setIsLoading(false);
    }, 400);
    setDebounceTimer(timer);
    return () => {
      if (deboundceTimer) {
        clearTimeout(deboundceTimer);
      }
    };
  }, [fillterEmployee]);


  const onSearch = (value: any) => {
    setFilterEmployee(value.target.value);
  };
  const headerSearch = () => {
    return (
      <Space style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <Search placeholder="Tìm kiếm nhân viên" onChange={onSearch} />
      </Space>
    );
  };

  const Paginations = () => {
    return <></>;
  };


  
  const rowClassName = (record: any) => {
    return record.employeeId === selectedKey ? 'selected-row' : '';
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };


  const columnsName: any = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (value: any, record: any) => {
        const isSelected = selectedKey === record.id;
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            onClick={() => {
              handleClick(record.employeeId, record);
            }}
            style={{
              color: isSelected ? 'blue' : '',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            className={isSelected ? 'userName' : ''}
          >
            {value}
          </div>
        );
      },
    },
  ];

  const dataSourceTableEmployee = fillterEmployee.trim() !== '' ? dataFilter : dataSource;

  const handleSave = (row: any) => {
    const newData = [...dataTableTime];
    const index = newData.findIndex((item) => row.date_Key === item.date_Key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataTableTime(newData);
  };

  const columns = ColumnTimeKeepingForMonth().map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <>
      <div className="wrapperTimeKeepingMonth" style={{ position: 'relative', width: '100%' }}>
        {dataSource ? (
          <>
              <Drawer
                title={
                  <Row align="stretch">
                    <Typography.Link style={{ flex: 1, fontWeight: 600, fontSize: 18, cursor: 'default' }}>
                      {dataTimeEdit ? dataTimeEdit?.name : ''}
                    </Typography.Link>
                    <Typography.Text style={{ paddingTop: 4 }} type="secondary">
                      {dataTimeEdit ? dataTimeEdit.jobTitle : ''}
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
              <div className='wrapperTable'>
                <Col flex={'15%'}>
                  <div style={{ marginRight: 10, width: `${dataSourceTableEmployee.length === 0 && '200px'}` }}>
                    {dataSource && (
                      <Table
                        rowKey={record => record.id}
                        columns={columnsName}
                        showHeader={false}
                        dataSource={[...dataSourceTableEmployee]}
                        title={() => headerSearch()}
                        footer={() => Paginations()}
                        bordered
                        pagination={false}
                        className="ant-table-container"
                        rowClassName={rowClassName}
                        loading={isLoading}
                        scroll={{x: 0, y: windowSize[1] - 300 }}
                      />
                    )}
                  </div>
                </Col>
                  {checkIn && (
                    <div className="scrollable-table-container" style={{ height: '100%', overflow: 'auto' }}>
                        <Table
                          rowKey={record => record.key}
                          components={components}
                          columns={columns as ColumnTypes}
                          rowClassName={() => 'editable-row'}
                          dataSource={dataTableTime ? dataTableTime : []}
                          bordered
                          size="small"
                          scroll={{ x: 1000, y: windowSize[1] - 300 }}
                          locale={{
                            emptyText: (dataTableTime?.length === 0 && selectedKey == null) ?  <Empty description={tTime('Please select employee')}></Empty> : <Empty description={tTime('Nhân Viên chưa có dữ liệu chấm công')}></Empty>,
                          }}
                          summary={() => (
                            <Table.Summary fixed={'bottom'}>
                              <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={2} >
                                  Tổng cả kỳ
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={7} colSpan={4}>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6}>{secondsToHHMM(allTime.tckChotCaChinh)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={7}>{secondsToHHMM(allTime.tckChotCaTangCa)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={8}></Table.Summary.Cell>
                                <Table.Summary.Cell index={9}></Table.Summary.Cell>
                              </Table.Summary.Row>
                            </Table.Summary>
                          )}
                          pagination={false}
                          loading={isLoadingSavingEditTime || isLoadingGetAllTime}
                        />
                    </div>
                  )}
              </div>
          </>
        ) : (
          <>
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
                    <Typography.Title level={4}>{tTime('No data found based on filtering criteria')}</Typography.Title>
                    {/* <Typography.Text>{t('Try reselecting the filtering criteria to find your data')}</Typography.Text> */}
                  </>
                }
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form?.setFieldsValue({ [dataIndex]: record[dataIndex]});
  };

  const save = async () => {
    try {
      const values = await form?.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
      >
        {/* <TimePicker 
          format={format} 
          onBlur={save} 
          value={record[dataIndex] ? dayjs(record[dataIndex], 'HH:mm') : null} 
        /> */}
        <Input ref={inputRef} onPressEnter={save} onBlur={save} style={{textAlign: 'center'}}/>
      </Form.Item>
    ) : (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};
