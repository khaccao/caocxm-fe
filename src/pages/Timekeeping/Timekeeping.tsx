/* eslint-disable import/order */
import React, { useEffect, useRef, useState } from 'react';

import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  DatePickerProps,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { DataSet, Timeline, TimelineOptions } from 'vis-timeline/standalone';

import { GlobalState } from '@/common/global';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useWindowSize } from '@/hooks';
import { FaceCheckService, ShiftResponse, TeamsResponse } from '@/services/CheckInService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getProjectList, getSelectedProject, projectActions } from '@/store/project';
import { getCheckInData, getMembersByGroupCode, getSelectedCheckInDetail, getTeams, timekeepingActions } from '@/store/timekeeping';
import Utils from '@/utils';
import { TimeKeepingByDate } from './Component/TimeKeepingByDate';
import { TimeKeepingBymonth } from './Component/TimeKeepingBymonth';
import { ImgWithLocationCheckIn } from './ImgWithLocationCheckIn';
import './Timekeeping.css';

interface QueryParams {
  team_id?: number;
  working_day: dayjs.Dayjs;
}

interface FilterParams {
  selectedTeam?: TeamsResponse;
  shifts: ShiftResponse[];
  shift_id?: number;
  filterString?: string;
}

export const TimelineSection = () => {
  const { t } = useTranslation(['common', 'faceck']);
  const tTime = useTranslation('timeKeeping').t;
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const language = searchParams.get('language') || 'vi';
  const accessToken = searchParams.get('accessToken');
  const windowSize = useWindowSize();

  const [timelineData, setTimelineData] = useState<any>();
  const [queryParams, setQueryParams] = useState<QueryParams>({ working_day: dayjs().startOf('D') });
  const [pramMonth, setPramsMonth] = useState<any>({ working_day: dayjs().startOf('month') })
  const [filterParams, setFilterParams] = useState<FilterParams>({ shifts: [] });
  const [openDetailPanel, setOpenDetailPanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [option, setOption] = useState<string>('days');
  const [selectedMonthKeeping, setSelectedMonthKeeping] = useState<number>(new Date().getMonth() + 1);
  const [checkInCount, setCheckInCount] = useState<number>(0);
  const [term, setTerm] = useState<string>('1');
  const [saveDatatableTime, setSaveDataTableTime] = useState(false);

  const teams = useAppSelector(getTeams());
  const checkIn = useAppSelector(getCheckInData());
  const isLoading = useAppSelector(getLoading());
  const checkInDetail = useAppSelector(getSelectedCheckInDetail());
  const locationCheckInVisible = useAppSelector(getModalVisible('showLocationImgCheckIn'));
  const selectedProject = useAppSelector(getSelectedProject());
  const selectedCompany = useAppSelector(getCurrentCompany());
  const membersOfBCH = useAppSelector(getMembersByGroupCode('BCH'));
  const [projectSelected, setProjectSelected] = useState<number>(-1);
  const projectList = useAppSelector(getProjectList());

  const timelineRef = useRef<HTMLDivElement>(null);
  const terms = [
    {
      value: '1',
      label: 'Kỳ 1'
    },
    {
      value: '2',
      label: 'Kỳ 2'
    }
  ];

  useEffect(() => {
    if (projectList && projectList.length === 0) {
      dispatch(projectActions.getProjectsByCompanyIdRequest(selectedCompany?.id));
    }
  }, [projectList]);

  useEffect(() => {
    if (timelineRef?.current) {
      GlobalState.timeline = new Timeline(timelineRef.current, []);
    }
    return () => {
      if (GlobalState.timeline) {
        dispatch(timekeepingActions.setTeams([]));
        // dispatch(timekeepingActions.setCheckInData(undefined)); // cần kiểm tra lại sau
        if (option !== 'month') {
          GlobalState.timeline.destroy();
        }
      }
    };
    // eslint-disable-next-line
  }, [timelineRef, option]);

  useEffect(() => {
    // Lấy giá trị mặt định ở trung tâm SG operatorId = 2
    const operatorId = selectedProject?.id ? selectedProject?.id : (projectSelected || 0);
    dispatch(timekeepingActions.getTeamsOfOperatorRequest({ operatorId, accessToken }));
    dispatch(timekeepingActions.getMembersByGroupCodeRequest({ groupCode: 'BCH' }))
    // eslint-disable-next-line
  }, [selectedProject, projectSelected, option]);

  useEffect(() => {
    if (teams.length > 0) {
      const tatCaTeam = teams.find(item => item.name === "Tất cả");
      if (tatCaTeam) {
        onChangeTeam(tatCaTeam.id);
      } else if (teams.length === 1) {
        onChangeTeam(teams[0].id);
      }
    } else {
      onChangeTeam(null);
    }
    // eslint-disable-next-line
  }, [teams]);

  useEffect(() => {
    if (queryParams.team_id && queryParams.working_day && projectSelected) {
      const { team_id, working_day } = queryParams;
      dispatch(timekeepingActions.getTimeKeepingOfTeamRequest({ team_id:  projectSelected === -1 ? -1 : team_id , working_day, accessToken }));
    }
    // eslint-disable-next-line
  }, [queryParams, projectSelected]);

  const generateDataGroup = (emp: any, index: any, groups: DataSet<any>, items: DataSet<any>) => {
    const dataGroup = { content: emp.name, id: emp.id, value: emp, index: index < 9 ? `0${index + 1}` : index + 1, className: '' };
    if (filterParams.filterString) {
      if (emp.name.toLocaleLowerCase().includes(filterParams.filterString.toLocaleLowerCase())) {
        groups.add(dataGroup);
      }
    } else {
      groups.add(dataGroup);
    }
    emp.checkIn_List
      .filter((chkIn: any) => chkIn.shift_Id === filterParams.shift_id || filterParams.shift_id === 0)
      .forEach((chkIn: any, idx: number) => {
        const shift = filterParams.shifts?.find(x => x.id === chkIn.shift_Id);
        const dateOnly = queryParams?.working_day?.format('YYYY-MM-DD');
        const goToWork = new Date(`${dateOnly}T${shift?.startTime || '00:00:00'}`);
        const getOffWork = new Date(`${dateOnly}T${shift?.endTime || '00:00:00'}`);
        if (goToWork.getTime() > getOffWork.getTime()) {
          getOffWork.setDate(getOffWork.getDate() + 1);
        }
        const checkInTime = Utils.convertISODateToLocalTime(chkIn.timeStamp);
        let checkInState = 'working';
        if (idx === 0) {
          if (checkInTime.getTime() <= goToWork.getTime()) {
            checkInState = 'arrive-early';
          }
          if (checkInTime.getTime() > goToWork.getTime()) {
            checkInState = 'late-for-work';
          }
        }
        if (idx > 0 && idx === emp?.checkIn_List.length - 1) {
          if (checkInTime.getTime() > getOffWork.getTime()) {
            checkInState = 'leave-late';
          }
        }
        const item = {
          id: chkIn.id,
          content: dayjs(checkInTime).format('HH:mm'),
          title: dayjs(checkInTime).format('HH:mm'),
          value: chkIn,
          dataGroup: emp,
          group: emp.id,
          start: checkInTime,
          end: checkInTime,
          className: 'check-in ' + checkInState,
          type: 'point',
        };
        items.add(item);
      });
  }

  useEffect(() => {
    if (checkIn) {
      const groups = new DataSet();
      const items = new DataSet();

      // Lọc và gán danh sách check-in
      const checkInList = [...checkIn.inSide_Team, ...checkIn.outSide_Team.map((x: any) => ({ ...x, outSite: true }))];
      // Tính tổng số nhân sự có dữ liệu chấm công
      const checkInCount = checkInList.filter(emp => emp.checkIn_List.length > 0).length;
      setCheckInCount(checkInCount); // Cập nhật số lượng nhân sự có dữ liệu chấm công

      [...checkInList].sort(function (a, b) {
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
      }).forEach((emp: any, idx: any) => generateDataGroup(emp, idx, groups, items));

      setTimelineData({ groups, items });
    }
    if (!checkIn) {
      setTimelineData({ groups: [], items: [] });
    }

    // eslint-disable-next-line
  }, [checkIn, filterParams, option, membersOfBCH]);

  useEffect(() => {
    renderTimeline();
    // eslint-disable-next-line
  }, [timelineData, timelineRef, language, windowSize, option]);

  const minutesToHHMM = (minutes: number) => {
    if (isNaN(minutes) || minutes < 1) {
      return '';
    }
    const hours = Math.floor(minutes / 60); // Tính số giờ
    const remainingMinutes = minutes % 60; // Tính số phút còn lại
    // Đảm bảo định dạng 2 chữ số (ví dụ: 04 thay vì 4)
    const hh = String(hours).padStart(2, '0');
    const mm = String(remainingMinutes).padStart(2, '0');

    return `${hh}:${mm}`;
  }

  const renderTimeline = () => {
    if (!timelineData || !timelineRef?.current) {
      return;
    }
    const options: TimelineOptions = {
      stack: false,
      // horizontalScroll: true,
      verticalScroll: true,
      zoomKey: 'ctrlKey',
      maxHeight: windowSize[1] - 210,
      margin: {
        item: 10, // minimal margin between items
        axis: 5, // minimal margin between items and the axis
      },
      showCurrentTime: false,
      locale: language,
      moment: function (date: any) {
        // Local Time zone
        const offset = -new Date().getTimezoneOffset() / 60;
        return moment(date).utcOffset(offset);
      },
      // option groupOrder can be a property name or a sort function
      // the sort function must compare two groups and return a value
      //     > 0 when a > b
      //     < 0 when a < b
      //       0 when a == b
      // groupOrder: function (a, b) {
      //   if (!membersOfBCH.length) {
      //     return a.content - b.content;
      //   }
      //   const aFromBCH = membersOfBCH.find(member => member.id === a.value.employeeId);
      //   const bFromBCH = membersOfBCH.find(member => member.id === b.value.employeeId);

      //   if (aFromBCH && !bFromBCH) {
      //     return 1;
      //   }
      //   else if (!aFromBCH && bFromBCH) {
      //     return -1;
      //   }
      //   else {
      //     return a.content - b.content;
      //   }
      // },
      groupOrderSwap: function (a, b, groups) {
        var v = a.value;
        a.value = b.value;
        b.value = v;
      },
      groupTemplate: function (group) {
        if (!group) {
          return '';
        }
        const allowApprove = Utils.checkAllowApproveHour(group.value);
        const { day_Hours, approved_Day_Hours, approvedExtra } = group.value;
        const dateOnly = queryParams?.working_day?.format('YYYY-MM-DD');
        const hoursWorked = Utils.normalizeShiftBoundaryTime(dayjs(dateOnly + 'T' + day_Hours));
        let approvedWork = null;
        if (approvedExtra) {
          const { TotalApprovedMainShift, TotalApprovedOTShift } = JSON.parse(approvedExtra);
          const total = TotalApprovedMainShift + TotalApprovedOTShift;
          approvedWork = minutesToHHMM(total);
        }
        //  else {
        //   approvedWorkDefault =
        //     !approved_Day_Hours || approved_Day_Hours === '00:00:00'
        //       ? hoursWorked
        //       : dayjs(dateOnly + 'T' + approved_Day_Hours);
        // }
        const container = document.createElement('div');
        container.className = 'group-content-container';

        const groupSttLabel = document.createElement('div');
        groupSttLabel.innerHTML = `${group.index}`;
        groupSttLabel.className = 'group-stt-label';
        groupSttLabel.style.padding = '0';
        container.appendChild(groupSttLabel);

        const groupContentLabel = document.createElement(allowApprove ? 'a' : 'div');
        groupContentLabel.innerHTML = group.content;
        groupContentLabel.className = 'group-name-label';
        groupContentLabel.style.textAlign = 'start';
        // groupContentLabel.style.padding = '0';
        container.appendChild(groupContentLabel);

        const groupHoursWorkedLabel = document.createElement('div');
        groupHoursWorkedLabel.innerHTML = hoursWorked?.format('HH:mm');
        groupHoursWorkedLabel.className = 'group-working-hours-label';
        container.appendChild(groupHoursWorkedLabel);

        const groupApprovedWorkLabel = document.createElement('div');
        groupApprovedWorkLabel.innerHTML = `${approvedWork ? approvedWork : "00:00"}`;
        groupApprovedWorkLabel.className = 'group-working-hours-label';
        container.appendChild(groupApprovedWorkLabel);

        // let meal = 0;
        // if (group.value?.meals?.length > 0) {
        //   group.value.meals.forEach((x: any) => {
        //     if (dayjs(x.timeStamp).format('YYYY-MM-DD') === queryParams.working_day.format('YYYY-MM-DD')) {
        //       const mealInfo = JSON.parse(x.information);
        //       meal += mealInfo.meal1 + mealInfo.meal2;
        //     }
        //   });
        // }
        // const groupMealLabel = document.createElement('div');
        // groupMealLabel.innerHTML = meal > 0 ? meal.toString() : '';
        // groupMealLabel.className = 'group-meal-label';
        // container.appendChild(groupMealLabel);

        if (allowApprove) {
          container.style.cursor = 'pointer';
          container.style.width = '100%';
          if (group?.value?.outSite) {
            container.className = 'group-content-container group-out-site';
            container.style.width = 'calc(100% + 10px)';
          }
          container.addEventListener('click', function () {
            dispatch(timekeepingActions.setSelectedCheckInDetail(group.value));
            showDetailPanel();
          });
        }

        return container;
      },
      tooltip: {
        template: (item: any) => {
          if (!item) {
            return '';
          }
          const { dataGroup, value } = item;
          const position = Utils.parseCheckInLocation(value?.location);
          return `<div style="width: 100px">
            <div style="color: #1677ff;"><b>${dataGroup.name}</b></div>
            <div>Điểm danh lúc: <b>${item.title}</b></div>
            ${position?.address ? position.address : ''}
          </div>`;
        },
      },
      orientation: 'top',
      start: queryParams.working_day.clone().toDate(),
      end: queryParams.working_day.clone().add(1, 'd').toDate(),
      min: queryParams.working_day.clone().toDate(),
      max: queryParams.working_day.clone().add(2, 'd').toDate(),
      // zoomMin: 1000 * 60 * 60 * 24, // one day in milliseconds
    };
    const { groups, items } = timelineData;
    if (GlobalState.timeline) {
      GlobalState.timeline.setOptions(options);
      GlobalState.timeline.setData({ groups, items });
    } else {
      GlobalState.timeline = new Timeline(timelineRef.current, items, groups, options);
    }
    if (GlobalState.timeline) {
      GlobalState.timeline.setOptions(options);
      GlobalState.timeline.setData({ groups, items });
    } else {
      GlobalState.timeline = new Timeline(timelineRef.current, items, groups, options);
    }
    GlobalState.timeline.off('click'); // remove the click event
    GlobalState.timeline.on('click', function (properties: any) {
      if (!properties.group || !properties.item) {
        return;
      }
      const clickedItem = items.get(properties.item);
      dispatch(timekeepingActions.setSelectedCheckInDetail(clickedItem.dataGroup));
      dispatch(timekeepingActions.setSelectedCheckInItem(clickedItem.value));
      dispatch(showModal({ key: 'showLocationImgCheckIn' }));
    });

    const timelineContainer = timelineRef.current.getElementsByClassName('vis-timeline')[0];
    const leftContainer = timelineRef.current.getElementsByClassName('vis-left')[0];
    const groupContainers = timelineRef.current.getElementsByClassName('group-label-container');
    if (groupContainers.length > 0) {
      setTimeout(() => {
        (groupContainers[0] as HTMLDivElement).style.width = leftContainer.clientWidth + 'px';
        if (groups.length === 0) {
          groupContainers[0].remove();
        }
      }, 1);
    } else if (groups.length > 0) {
      const groupContainer = document.createElement('div');
      groupContainer.className = 'group-label-container';

      const groupIndexLabel = document.createElement('div');
      groupIndexLabel.innerHTML = t('STT');
      groupIndexLabel.className = 'group-stt-label';

      groupContainer.appendChild(groupIndexLabel);

      const groupNameLabel = document.createElement('div');
      groupNameLabel.innerHTML = t('Employee');
      groupNameLabel.className = 'group-name-label';
      groupContainer.appendChild(groupNameLabel);

      const groupHoursWorkedLabel = document.createElement('div');
      groupHoursWorkedLabel.innerHTML = t('Hours worked');
      groupHoursWorkedLabel.className = 'group-working-hours-label';
      groupContainer.appendChild(groupHoursWorkedLabel);

      const groupApprovedWorkLabel = document.createElement('div');
      groupApprovedWorkLabel.innerHTML = t('Approved work');
      groupApprovedWorkLabel.className = 'group-working-hours-label';
      groupContainer.appendChild(groupApprovedWorkLabel);

      // const groupMealLabel = document.createElement('div');
      // groupMealLabel.innerHTML = t('Meal');
      // groupMealLabel.className = 'group-meal-label';
      // groupContainer.appendChild(groupMealLabel);

      setTimeout(() => {
        groupContainer.style.width = leftContainer.clientWidth + 'px';
      }, 1);
      timelineContainer?.insertAdjacentElement('afterbegin', groupContainer);
    }
  };

  const showDetailPanel = () => {
    setOpenDetailPanel(true);
  };

  const onCloseDetailPanel = () => {
    dispatch(timekeepingActions.setSelectedCheckInDetail(undefined));
    setOpenDetailPanel(false);
  };

  const onChangeWorkingDate: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setQueryParams(prev => ({ ...prev, working_day: date.startOf('D') }));
    }
  };

  const onChangeWorkingMonth: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setPramsMonth((prev: any) => ({ ...prev, working_day: date.startOf('month') }))
      setSelectedMonthKeeping(+date.format('MM'))
    }
  }

  const onSearchString = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFilterParams(prev => ({ ...prev, filterString: value }));
  };

  const onChangeTeam = (value: number | null) => {
    if (!value) {
      setQueryParams(prev => ({ ...prev, team_id: undefined }));
      return;
    }
    const team = teams.find(x => x.id === value);
    if (team) {
      setQueryParams(prev => ({ ...prev, team_id: projectSelected === -1 ? -1 : team.id }));
      const shifts: ShiftResponse[] = [
        { id: 0, name: `Cả ngày (${team.shifts?.length || 0} ca)`, startTime: '', endTime: '' },
        ...Utils.deepClone(team.shifts),
      ];
      const dateOnly = queryParams.working_day.format('YYYY-MM-DD');
      shifts.forEach(x => {
        const goToWork = dayjs(`${dateOnly}T${x.startTime}`);
        const getOffWork = dayjs(`${dateOnly}T${x.endTime}`);
        const timeSuffix = goToWork.isAfter(getOffWork) ? ` ${t('Hôm sau')}` : '';
        if (x.id === 0) {
          x.label = x.name;
        } else {
          x.label = `${x.name} (${goToWork.format('HH:mm')} - ${getOffWork.format('HH:mm')}${timeSuffix})`;
        }
      });
      setFilterParams(prev => ({ ...prev, selectedTeam: team, shifts, shift_id: 0 }));
    }
  };

  const onChangeterm = (value: string) => {
    setTerm(value);
  }

  const onChangeShift = (value: number) => {
    setFilterParams(prev => ({ ...prev, shift_id: value }));
  };
  const getFilenameFromContentDisposition = (contentDisposition?: string) => {
    const match = contentDisposition?.match(/filename="([^"]+)"/);
    if (match) {
      return match[1];
    } else {
      return null;
    }
  };
  const handleOk = () => {
    FaceCheckService.Get.exportExcel(
      { companyId: selectedCompany.orgId, monthNumber: selectedMonth, headers: { isFull: true } },
      { responseType: 'blob', isReturnHeader: true },
    ).subscribe(
      resp => {
        const url = window.URL.createObjectURL(resp.response);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        console.log('Header:', resp.xhr.getAllResponseHeaders());
        // Xử lý phản hồi từ máy chủ ở đây
        const contentDisposition = resp.responseHeaders['Content-Disposition'];
        const filename = getFilenameFromContentDisposition(contentDisposition);

        // the filename you want
        a.download = filename ?? 'báo cáo.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setShowExport(false);
      },
      err => {
        console.log(err);
      },
    );
  };
  const onChangeProjectSelected = (value: number) => {
    setProjectSelected(value);
  };
  useEffect(() => {
    if (selectedProject) {
      setProjectSelected(selectedProject.id);
    }
  }, [selectedProject]);

  return (
    <>
      <div style={{ width: '100%', height: 'calc(100vh - 50px)', backgroundColor: 'white' }}>
        {locationCheckInVisible && <ImgWithLocationCheckIn />}
        <div style={{ margin: '0px 15px 15px 15px', paddingTop: 10 }}>
          <Row align="stretch">
            <Typography.Title style={{ flex: 1, minWidth: 180, marginTop: 10 }} level={4}>
              {t('Check-in time')}
            </Typography.Title>
            <div style={{ paddingTop: 4 }}>
              {!selectedProject && (
                <Select
                  style={{ width: 150, marginLeft: 4, marginTop: 4, marginRight: 5 }}
                  onChange={onChangeProjectSelected}
                  options={[
                    { label: `${tTime('All')} (${projectList?.length || 0} ${tTime('Project')})`, value: -1 },
                    ...(projectList?.map(project => ({ label: project.name, value: Number(project.id) })) || [])
                  ]}
                  value={projectSelected || undefined}
                />
              )}
              <Radio.Group
                value={option}
                onChange={e => setOption(e.target.value)}
                style={{ flex: 0, alignItems: 'start', justifyContent: 'start', marginRight: '5px' }}
              >
                <Radio.Button value="days">{tTime('days')}</Radio.Button>
                <Radio.Button value="month">{tTime('month')}</Radio.Button>
              </Radio.Group>
              {option === 'days' ? (
                <DatePicker
                  allowClear={false}
                  onChange={onChangeWorkingDate}
                  value={queryParams.working_day}
                  format={'DD/MM/YYYY'}
                  style={{ marginTop: 4 }}
                />
              ) : (
                <>
                  <DatePicker
                    allowClear={false}
                    onChange={onChangeWorkingMonth}
                    value={pramMonth.working_day}
                    format={'MM/YYYY'}
                    style={{ marginTop: 4 }}
                    picker={'month'}
                  />
                  <Select
                    style={{ width: 180, marginLeft: 4, marginTop: 4 }}
                    onChange={onChangeterm}
                    options={terms.map(t => ({ label: t.label, value: t.value }))}
                    value={term}
                  />
                </>
              )}

              <Select
                style={{ width: 180, marginLeft: 4, marginTop: 4, marginRight: option === 'days' ? 0 : 5 }}
                onChange={onChangeTeam}
                options={teams.map(t => ({ label: t.name, value: t.id }))}
                value={projectSelected === -1 ? -1 : queryParams.team_id}
                disabled={!projectSelected || projectSelected === -1}
              />

              {option === 'days' ? (
                <>
                  <Select
                    style={{ width: 250, marginLeft: 4, marginTop: option === 'days' ? 4 : 0, marginRight: option === 'days' ? 0 : 10 }}
                    onChange={onChangeShift}
                    options={filterParams.shifts?.map(t => ({ label: t.label || t.name, value: t.id }))}
                    value={filterParams.shift_id}
                  />
                  <Input
                    placeholder={t('Search employee')}
                    allowClear
                    onChange={onSearchString}
                    suffix={filterParams.filterString ? null : <SearchOutlined />}
                    style={{ width: 304, marginLeft: 4, marginTop: 4, marginRight: 10 }}
                  />
                  <WithPermission policyKeys={['ChamCong.Report']} strategy='disable'>
                    <Button
                      onClick={() => {
                        setShowExport(true);
                      }}
                      icon={<ExportOutlined />}
                    >
                      {t('Export')}
                    </Button>
                  </WithPermission>
                </>
              ) : (
                <WithPermission policyKeys={['ChamCong.TrackingByMonth']} strategy='disable'>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSaveDataTableTime(true);
                    }}
                    disabled={!projectSelected || projectSelected === -1}
                  >
                    {t('Lưu')}
                  </Button>
                </WithPermission>
              )}
            </div>
          </Row>
          {option === 'days' ? (
            <Spin spinning={isLoading} size="large">
              <TimeKeepingByDate
                language={language}
                t={t}
                timelineRef={timelineRef}
                checkInDetail={checkInDetail}
                queryParams={queryParams}
                filterParams={filterParams}
                onCloseDetailPanel={onCloseDetailPanel}
                openDetailPanel={openDetailPanel}
                checkInCount={checkInCount} // Truyền checkInCount vào
                teams={teams}
                onChangeTeam={onChangeTeam}
              />
            </Spin>
          ) : (
            <TimeKeepingBymonth
              tTime={tTime}
              checkInDetail={checkInDetail}
              queryParams={queryParams}
              filterParams={filterParams}
              onCloseDetailPanel={onCloseDetailPanel}
              openDetailPanel={openDetailPanel}
              setOpenDetailPanel={setOpenDetailPanel}
              checkIn={checkIn}
              option={option}
              selectedMonthKeeping={selectedMonthKeeping}
              term={term}
              saveDatatableTime={saveDatatableTime}
              setSaveDataTableTime={setSaveDataTableTime}
            />
          )}
        </div>
      </div>
      <Modal
        title={t('Export')}
        centered
        open={showExport}
        onOk={handleOk}
        onCancel={() => {
          setShowExport(false);
        }}
      >
        <Select
          allowClear
          value={selectedMonth}
          options={Array.from({ length: 12 }, (_, index) => index + 1).map(x => ({ label: 'Tháng ' + x, value: x }))}
          onSelect={value => {
            setSelectedMonth(value);
          }}
        ></Select>
      </Modal>
    </>
  );
};

export default TimelineSection;
