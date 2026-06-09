/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line import/order
import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, InputNumber, Typography, Spin } from 'antd';
import dayjs from 'dayjs';
import { gantt, Task } from 'dhtmlx-gantt';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';

import ColorNoteGantt from './components/ColorNoteGantt';
import ModalPredecessor from './components/ModalPredecessor';
import styles from './Gantt.module.less';
import { 
  CategoryDTO, exportGanttToPDF, FormatDateAPI, formatDateDisplay,
  formatDateGantt, genIssue,
  GettingIssueByVersionList, IDataGantt, IDataLinks,
  IPropsGantt, IssueRelationship, SavingIssue } from '@/common/define';
import { IssuesPagingResponse, IssuesResponse, Status } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCategorys, getIssuesDateGanttOption, issueActions, getIssueByVersion, getIssueQueryParams } from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';


export const Gantt = ({ infoParentComponent }: IPropsGantt) => {
  const { t } = useTranslation('gantt');

  const ganttContainer = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const dateGanttOption = useAppSelector(getIssuesDateGanttOption());
  const baseDataGantt = useAppSelector(getIssueByVersion());
  const params = useAppSelector(getIssueQueryParams());
  const isLoading = useAppSelector(getLoading(GettingIssueByVersionList));
  const isLoadingGetAllChildRelationship = useAppSelector(getLoading(IssueRelationship.getAllChildIssueRelationShipFromId));
  const isLoadingGenIssue = useAppSelector(getLoading(genIssue));
  const isSaving = useAppSelector(getLoading(SavingIssue));
  const isExportPDF = useAppSelector(getLoading(exportGanttToPDF));
  const categorys = useAppSelector(getCategorys());
  const [dataGantt, setDataGantt] = useState<IDataGantt[]>([]);
  const [links, setLinks] = useState<IDataLinks[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [timeoutId, setTimeoutId] = useState<any>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [isTaskDblClickAttached, setIsTaskDblClickAttached] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isInitConfig, setInitConfig] = useState<boolean>(false);
  const [listIdTaskOpen, setListIdTaskOpen] = useState<any[]>([]);

  // [DungLT][#19878][23-10-2024] _ tính estimateTime giữa start date và end date
  const estimateTime = (sDate: string, eDate: string) => {
    // Chuyển đổi chuỗi 'YYYY-MM-DD' thành đối tượng Date
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
     
    // Tính chênh lệch giữa hai ngày (theo milliseconds)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    
    // Chuyển đổi milliseconds thành số ngày
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  const handleUpdateData = (id: any, column: any, value: any) => {
    setIsUpdate(true);
    // Check if id, column, or value is missing
    if (!id || !column || !value) return;
    // Check if baseDataGantt is defined
    if (!baseDataGantt || baseDataGantt?.results.length <= 0) return;
    
    // Find the item in baseDataGantt
    let item = baseDataGantt?.results.find((i) => Number(i.id) === Number(id));
    
    // Check if the item is found
    if (!item) return;
    const curTask = gantt.getTask(id);
    const valueduration = curTask.duration ? curTask.duration : 0;
    let sdate = '';
    let edate = '';
    // Update the item based on the column name
    if (column?.name === 'start_date') {
      sdate = value.format(FormatDateAPI)
      edate = value?.add(valueduration, 'day')?.format(FormatDateAPI);
      // item = { ...item, plannedStartDate: value.format(FormatDateAPI), plannedEndDate: value?.add(valueduration, 'day')?.format(FormatDateAPI), progress: Number(valueProgress*100) };
      // curTask.start_date =gantt.date.str_to_date(formatDateGantt)(value.format(FormatDateToConvertGantt))
      // curTask.end_date = gantt.date.str_to_date(formatDateGantt)(value?.add(valueduration, 'day')?.format(FormatDateToConvertGantt));
    } else if (column?.name === 'end_date') {
      sdate = (dayjs(curTask.start_date)).format(FormatDateAPI);
      edate = value.format(FormatDateAPI);
      // item = { ...item, plannedEndDate: value.format(FormatDateAPI), plannedStartDate: (dayjs(curTask.start_date)).format(FormatDateAPI), progress: Number(valueProgress*100) };
      // curTask.end_date = gantt.date.str_to_date(formatDateGantt)(value.format(FormatDateToConvertGantt));
    } else if (column?.name === 'progressDisplay') {
      item = { ...item, progress: Number(Number(value).toFixed(0)), plannedStartDate: (dayjs(curTask.start_date)).format(FormatDateAPI), plannedEndDate: (dayjs(curTask.end_date)).format(FormatDateAPI)};
      if (item && +item.progress === 100) {
        item = { ...item, status: Utils.convertStatus(Status.Done)};
      }
      dispatch(issueActions.updateIssueRequest({ 
        issueId: id, 
        issue: item, 
        tagVersionId: infoParentComponent.tagVersionId, 
        typeUpdate: infoParentComponent.typeUpdate, 
      }));
      return ;
    } else if (column?.name === 'durationDisplay') {
      sdate = (dayjs(curTask.start_date)).format(FormatDateAPI)
      edate = (dayjs(curTask.start_date)).add(Number(value - 1), 'day')?.format(FormatDateAPI);
    }
    // Check if infoParentComponent is defined
    if (!infoParentComponent) return;
    
      // [DungLT][#19878][23-10-2024] _ update start date
    dispatch(issueActions.updateStartDateIssueRequest({ 
      issueId: id, 
      newStartDate: sdate, 
      esitmateTime: estimateTime(sdate, edate),
      projectId: item.projectId,
      tagVersionId: infoParentComponent.tagVersionId, 
      typeUpdate: infoParentComponent.typeUpdate, 
    }));
    // // Dispatch the update issue request
    // if (column?.name === 'start_date' || column?.name === 'end_date' || column?.name === 'durationDisplay') {
    //   setIsUpdateDate(true);
    //   setIdUpdateDate(id);
    //   dispatch(issueActions.getAllChildIssueRelationShipFromIdRequest({
    //     issueId: id,
    //     param: {},
    //   }))
    // }
    
  }
  const ganttCustomType = (gantt: any) => {
    // #region date custom editor
    gantt.config.editor_types.date_custom_editor = {
      show: function (id: any, column: any, config: any, placeholder: { innerHTML: string; }) {
        const task = gantt.getTask(id);
        if (!task?.isCategory) {
          var html = "<div id='datepicker_container'></div>";
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          if (task?.row_height) {
            html = `<div id='datepicker_container' style='height: ${task?.row_height}px;'></div>`;
          }
          placeholder.innerHTML = html;
          setIsEditing(true);
          this.focus();
        }
      },
      hide: function () {
        setIsEditing(false);
        setIsModalVisible(false);
        gantt.render();
      },
      set_value: function (value: any, id: any, column: any, node: { firstChild: { value: string; }; }) {
        let date = dayjs(value);
        if (!date.isValid()) {
          date = dayjs();
        }
        const container = document.getElementById('datepicker_container');
        if (container) {
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          const task = gantt.getTask(id);
          let isEmpty = false;
          if ((column?.name === 'start_date' && task?.isEmptyStartDate) || (column?.name === 'end_date' && task?.isEmptyEndDate)) {
            isEmpty = true;
          }
          ReactDOM.render(
            <DatePicker
              defaultValue={isEmpty ? null : date}
              format={formatDateDisplay}
              style={{ height: `${task?.row_height}px`}}
              onChange={(date, dateString) => {
                if (typeof dateString === 'string') {
                  node.firstChild.value = dateString;
                  handleUpdateData(id, column, date);
                  gantt.ext?.inlineEditors?.save();
                }
              }}
            />,
            container
          );
        }
      },

      get_value: function (id: any, column: any, node: { firstChild: { value: any; }; }) {
        const task = gantt.getTask(id);
        if (node?.firstChild?.value) {
          task[column.name] = gantt.date.str_to_date(formatDateGantt)(node.firstChild.value);
          if (column.name === "start_date") {
            const startDate = dayjs(task.start_date);
            const duration = task.duration;
            task.end_date = gantt.date.str_to_date(formatDateGantt)(startDate.add(duration, 'day').format(FormatDateAPI));
          }
        }
        return task[column.name];
      },
      
      is_changed: function (value: any, id: any, column: any, node: any) {
        return true;
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        return true;
      },

      save: function (id: any, column: any, node: any) {
        // Custom save logic if necessary
      },
      focus: function (node: any) {
        const container = document.getElementById('datepicker_container');
        if (container) {
          const input = container.querySelector('input'); // Assuming the DatePicker has an input element
          if (input) {
            input.focus();
          }
        }
      }
    };
    // #region progress custom editor
    gantt.config.editor_types.progress_custom_editor = {
      show: function (id: any, column: any, config: any, placeholder: { innerHTML: string; }) {
        const task = gantt.getTask(id);
        if (!task?.isCategory) {
          var html = "<div id='progress_input_container'></div>";
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          if (task?.row_height) {
            html = `<div id='progress_input_container' style='height: ${task?.row_height}px;'></div>`;
          }
          placeholder.innerHTML = html;
          setIsEditing(true);
          this.focus();
        }
      },
      hide: function () {
          setIsEditing(false);
          setIsModalVisible(false);
          gantt.render();
      },
  
      set_value: function (value: any, id: any, column: any, node: { firstChild: { value: string; }; }) {
        const container = document.getElementById('progress_input_container');
        if (container) {
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          const task = gantt.getTask(id);
          ReactDOM.render(
            <InputNumber
              className={styles.inputProgress}
              min={0}
              max={100}
              style={{ height: `${task?.row_height}px`}}
              defaultValue={Number((value * 100).toFixed(0))}
              onChange={(_value) => {
                node.firstChild.value = _value?.toString() || '0';
              }}
            />,
            container
          );
        }
      },
  
      get_value: function (id: any, column: any, node: { firstChild: { value: any; }; }) {
        var task = gantt.getTask(id);
        if (node?.firstChild?.value) {
          const progress = Number(node.firstChild.value).toFixed(0);
          task[column.name] = `${Number(progress)}%`;
          task.progress = node.firstChild.value / 100;
          handleUpdateData(id, column, node.firstChild.value);
        } else {
          task[column.name] = `${Number((task.progress*100).toFixed(0))}%`;
          task.progress = task.progress || 0;
        }
        return task[column.name];
      },
  
      is_changed: function (value: any, id: any, column: any, node: any) {
        return true;
      },
  
      is_valid: function (value: any, id: any, column: any, node: any) {
        return true;
      },
  
      save: function (id: any, column: any, node: any) {
        // Custom save logic if necessary
      },
      focus: function (node: any) {
        const container = document.getElementById('progress_input_container');
        if (container) {
          const input = container.querySelector('input'); // Assuming the DatePicker has an input element
          if (input) {
            input.focus();
          }
        }
      }
    };
    // #region duration custom editor
    gantt.config.editor_types.duration_custom_editor = {
      show: function (id: any, column: any, config: any, placeholder: { innerHTML: string; }) {
        const task = gantt.getTask(id);
        if (!task?.isCategory) {
          var html = "<div id='duration_input_container'></div>";
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          if (task?.row_height) {
            html = `<div id='duration_input_container' style='height: ${task?.row_height}px;'></div>`;
          }
          placeholder.innerHTML = html;
          setIsEditing(true);
          this.focus();
        }
      },
      hide: function () {
        setIsEditing(false);
        setIsModalVisible(false);
        gantt.render();
      },
  
      set_value: function (value: any, id: any, column: any, node: { firstChild: { value: string; }; }) {
        const container = document.getElementById('duration_input_container');
        if (container) {
          // [#19784][dung_lt][27/10/2024] chỉnh height cao bằng cột
          const task = gantt.getTask(id);
          ReactDOM.render(
            <InputNumber
              className={styles.inputDuration}
              min={0}
              style={{ height: `${task?.row_height}px`}}
              defaultValue={Number(value)}
              onChange={(_value) => {
                node.firstChild.value = _value?.toString() || '0';
              }}
            />,
            container
          );
        }
      },
  
      get_value: function (id: any, column: any, node: { firstChild: { value: any; }; }) {
        var task = gantt.getTask(id);
        if (node?.firstChild?.value) {
          task[column.name] = Number(node.firstChild.value);
          handleUpdateData(id, column, node.firstChild.value);
        }
        return task[column.name];
      },
  
      is_changed: function (value: any, id: any, column: any, node: any) {
        return true;
      },
  
      is_valid: function (value: any, id: any, column: any, node: any) {
        return true;
      },
  
      save: function (id: any, column: any, node: any) {
        // Custom save logic if necessary
      },
      focus: function (node: any) {
        const container = document.getElementById('duration_input_container');
        if (container) {
          const input = container.querySelector('input'); // Assuming the DatePicker has an input element
          if (input) {
            input.focus();
          }
        }
      }
    };
  }
  // region init config gantt
  const ganttInitConfig = (gantt: any) => {
    gantt.config.date_format = formatDateGantt;
    gantt.config.details_on_create = false;
    gantt.config.details_on_dblclick = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_progress = false;
    gantt.config.drag_move = false;
    gantt.config.resource_store = "resource";
    gantt.config.resource_property = "owner_id";
    gantt.plugins({
      export_api: true,
      auto_scheduling: true
  });
    ganttCustomType(gantt);
    const dateEditorStart = { type: "date_custom_editor", map_to: "start_date" };
    const dateEditorEnd = { type: "date_custom_editor", map_to: "end_date" };
    // const dateEditorStartAC = { type: "date_custom_editor", map_to: "start_date_ac" };
    // const dateEditorEndAC = { type: "date_custom_editor", map_to: "end_date_ac" };
    const textProgressEditor = { type: "progress_custom_editor", map_to: "progressDisplay" };
    const durationEditor = { type: "duration_custom_editor", map_to: "durationDisplay" };
    // region config columns gantt
    gantt.config.columns = [
      { name: 'text', label: t('Work list'), align: 'left', width: 300, tree: true, resize: true},
      { name: 'durationDisplay', label: t('EXTEND OVER'), align: 'center', width: 80, resize: true, editor: durationEditor, onrender: (item: {
        isEmptyEndDate: any;
        isEmptyStartDate: any;
        isCategory: any; text: any; durationDisplay: any; 
        }, node: any) => {
          // [#19784][dung_lt][27/10/2024] nếu 1 cột start or end date trống thì không hiện duration 
        if (item?.isCategory || item.isEmptyEndDate || item.isEmptyStartDate) {
          node.innerHTML = '<span></span>';
        } else {
          return <Typography.Text className={styles.durationText}>{`${item.durationDisplay} ${t('days')}`}</Typography.Text>
        }
    }},
      { name: 'start_date', label: t('START PLANNING'), align: 'center', width: 90, resize: true, editor: dateEditorStart, onrender: (item: {
        isEmptyStartDate: any;
        isCategory: any;
        start_date: any; text: any; duration: any; 
        }, node: any) => {
        if (item?.isCategory || item.isEmptyStartDate) {
          node.innerHTML = '<span></span>';
        } else {
          const date = new Date(item.start_date);
          if (!isNaN(date.getTime()) && !!item.start_date) {
            const formattedDate = Utils.formatDate(date);
            return <Typography.Text className={styles.dateText}>{formattedDate}</Typography.Text>
          }
          return <CalendarOutlined />
        }
      }},
      { name: 'end_date', label: t('END OF PLAN'), align: 'center', width: 90, resize: true, editor: dateEditorEnd, onrender: (item: {
        isEmptyEndDate: any;
        isCategory: any;
        end_date: any; text: any; duration: any; 
        }, node: any) => {
          if (item?.isCategory || item.isEmptyEndDate) {
            node.innerHTML = '<span></span>';
          } else {
            const date = new Date(item.end_date);
            if (!isNaN(date.getTime())  && !!item.end_date) {
              const formattedDate = Utils.formatDate(date);
              return <Typography.Text className={styles.dateText}>{formattedDate}</Typography.Text>
            }
            return <CalendarOutlined />
          }
      }},
      { name: 'progressDisplay', label: t('%COMPLETE'), align: 'center', width: 60, resize: true, editor: textProgressEditor, onrender: (item: {
        isEmptyEndDate: any;
        isEmptyStartDate: any;
        isCategory: any; progressDisplay: string; 
      }, node: any) => {
          // [#19784][dung_lt][27/10/2024] nếu 1 cột start or end date trống thì không hiện progress 
        if (item?.isCategory || item.isEmptyEndDate || item.isEmptyStartDate) {
          node.innerHTML = '<span></span>';
        } else {
          // const progress = item.progress ? item.progress * 100 : 0;
          return <Typography.Text className={styles.progressText}>{item.progressDisplay}</Typography.Text>
        }
      }},
    ];
    gantt.config.external_render = { 
      // checks the element is a React element
      isElement: (element: {} | null | undefined) => {
          return React.isValidElement(element);
      },
      // renders the React element into the DOM
      renderElement: (element: React.DOMElement<React.DOMAttributes<Element>, Element>, container: Element | DocumentFragment | null) => {
        if (container) {
          const root = createRoot(container);
          root.render(element);
        }
      }
    };
    gantt.templates.grid_header_class = function(columnName: any, column: any){
      return styles.ganttLabel;
    };

    // region custom class in right side and leftside progress bar
    gantt.templates.rightside_text = function(start: any, end: any, task: { end_date: string; }){
      const date = new Date(task.end_date);
      if (!isNaN(date.getTime())  && !!task.end_date) {
        const formattedDate = Utils.formatDate(date);
         return "<div class='gantt-custom-right-text'>" + formattedDate + "</div>";
      }
    };
  
    gantt.templates.leftside_text = function(start: any, end: any, task: { start_date: any; }){
      const date = new Date(task.start_date);
        if (!isNaN(date.getTime())  && !!task.start_date) {
          const formattedDate = Utils.formatDate(date);
          return "<div class='gantt-custom-left-text'>" + formattedDate + "</div>";
        }
    };
   
    gantt.plugins({ tooltip: true }); 
    gantt.templates.tooltip_text = function(start: any,end: string,task: { text: string; start_date: string; end_date: string; duration: string; progress: number; }){
      // const progress = !!task.progress ? "<br><b>" + t('Percent') + ":</b>"+task.progress*100+"%" : "";
      // return "<b>" + t('Work') + ":</b> "+task.text+"<br><b>" + t('Begin') + ":</b>"+Utils.formatDate(new Date(task.start_date))+"<br><b>" + t('End') + ":</b>"+Utils.formatDate(new Date(task.end_date))+"<br/><b>" + t('Lengthen') + ":</b> "+ task.duration + progress;
      return "<b>" + t('Work') + ":</b> "+task.text+"<br><b>";
    };
    gantt.config.tooltip_hide_timeout = 1000;

    // region custom class in timeline
    gantt.templates.task_class = function(start: any, end: any, task: {
      progress: number; isCategory: any; 
    }) {
      const progressClass = 'progress-gantt';
      if (task?.isCategory) {
          return progressClass + " no-progress";
      }
      if (task?.progress && task.progress === 1) {
        return progressClass + ' full-progress';
      }
      return progressClass;
    };
    gantt.templates.grid_row_class = function(start: any, end: any, task: { isCategory: any; text: string; }) {
      if (task.isCategory) {
        return "isCategory";
      }
      return "";
     };
    }
  // region init config date
  const ganttConfigDate = (gantt: any) => {
    const daysStyle = function(date: any) {
      // Convert the day string to a number and check if it is Saturday (6) or Sunday (0)
      const dayNumber = new Date(date).getDay();
      if (dayNumber === 0 || dayNumber === 6) {
          return "weekend";
      }
      return "";
    };
    gantt.ext.zoom.init({
      minColumnWidth: 40,
      levels: [
        {
          name: 'Days',
          scale_height: 44,
          min_column_width: 50,
          scales: [
            {unit: "day", step: 1, format: "%d", css: daysStyle}
          ]
        },
        {
          name: 'Weeks',
          scale_height: 44,
          scales: [
              { unit: 'week', step: 1, format: (d: Date) => Utils.getWeekRange(d) },
              { unit: 'day', step: 1, format: '%d', css: daysStyle }
          ]
        },
        {
          name: 'Months',
          scale_height: 44,
          min_column_width: 150,
          scales: [
              { unit: "month", step: 1, format: '%F' },
              { unit: 'week', step: 1, format: (d: Date) => Utils.getWeekRange(d) },

          ]
        },
        {
          name: 'Years',
          scale_height: 44,
          min_column_width: 150,
          scales: [
              { unit: "year", step: 1, format: '%Y' },
              { unit: "month", step: 1, format: '%F' },
          ]
       }
      ]
    });
  
    gantt.templates.timeline_cell_class = function(task: any, date: { getDay: () => number; toDateString: () => string; }){
      var today = new Date();
      if (date.getDay() === 0 || date.getDay() === 6) {
          return "weekend";
      }
      if (date.toDateString() === today.toDateString()) {
          return "toDay";
      }
      return '';
    };
  }

  // [20/05/2025][#21987][vy_tt] - sort floor level
  const SPECIAL_FLOORS = [
    { keyword: 'lửng', rank: 998 },
    { keyword: 'thượng', rank: 997 },
    { keyword: 'mái', rank: 997 },
    { keyword: 'kỹ thuật', rank: 996 },
  ];

  const isSpecialFloor = (text: string) => 
    SPECIAL_FLOORS.some(sf => text.toLowerCase().includes(sf.keyword));

  const getFloorRank = (label: string): number => {
    const l = label.toLowerCase().trim();

    const basement = l.match(/\b(?:b|c|tầng\s*[bc])\s*-?\s*0*(\d+)/i);
    if (basement) return -parseInt(basement[1], 10);

    const floor = l.match(/tầng\s*0*(\d+)/);
    if (floor) return parseInt(floor[1], 10);

    // if (l.includes('lửng')) return 998;
    // if (l.includes('thượng') || l.includes('mái')) return 997;
    // if (l.includes('kỹ thuật')) return 996;
    for (const sf of SPECIAL_FLOORS) {
      if (l.includes(sf.keyword)) return sf.rank;
    }

    return 999;
  };

  const compareByRule = (a: { text: string }, b: { text: string }) => {
    const ra = getFloorRank(a.text);
    const rb = getFloorRank(b.text);
  
    if (ra === 999 && rb !== 999) return -1;
    if (rb === 999 && ra !== 999) return 1;
  
    return ra - rb;
  };

  const splitLabel = (text: string) => {
    const match = text.match(/([A-Za-z]*)(\d+)$/);
    
    if (!match) {
      return { letter: '', num: 0 };
    }
    
    const letter = match[1] || '';
    const num = parseInt(match[2], 10);
    
    return { letter, num };
  };

  const compareInterleaved = (a: { text: string }, b: { text: string }) => {
    const isASpecial = isSpecialFloor(a.text);
    const isBSpecial = isSpecialFloor(b.text);
    
    if (isASpecial && !isBSpecial) return 1;
    if (!isASpecial && isBSpecial) return -1;
    
    if (isASpecial && isBSpecial) {
      return a.text.localeCompare(b.text);
    }
    
    const pa = splitLabel(a.text);
    const pb = splitLabel(b.text);

    if (pa.num !== pb.num) return pa.num - pb.num;

    if (pa.letter && !pb.letter) return -1;
    if (!pa.letter && pb.letter) return 1;

    return pa.letter.localeCompare(pb.letter);
  };

  const sortAndPackByParent = <T extends { id: any; parent?: any; text: string }>(rows: T[],): T[] => {
    const children = new Map<any, T[]>();

    rows.forEach(r => {
      const p = r.parent ?? null;
      if (!children.has(p)) children.set(p, []);
      children.get(p)!.push(r);
    });

    const SPECIAL_PARENT = 'Phan_Hoan_Thien';
    const specialIds = new Set<any>(
      (children.get(SPECIAL_PARENT) || []).map(child => child.id),
    );
    
    // children.forEach(arr => arr.sort(compareByRule));
    children.forEach((arr, key) => {
      const cmp = specialIds.has(key) ? compareInterleaved : compareByRule;
      arr.sort(cmp);
    });

    const out: T[] = [];

    const walk = (pId: any) => {
      (children.get(pId) || []).forEach(task => {
        out.push(task);
        walk(task.id);
      });
    };

    walk(null);
    return out;
  };

  // region convert base data to datagantt
  const convertDataAndSetDataGantt = (_issues: IssuesPagingResponse) => {
    if (_issues?.results.length <= 0) return;
    const baseData: IssuesResponse[] = _issues.results;
    const dataGantt: IDataGantt[] = [];
    if (infoParentComponent.isApplyCategory) {
      categorys?.forEach((c: CategoryDTO) => {
        const parentId = c?.parentCode ? c.parentCode : null;
        const data: IDataGantt = {
          id: c.code,
          text: c.name,
          start_date: Utils.formatDate(new Date(baseData[0].plannedStartDate)) || "10/06/2024",
          end_date: Utils.formatDate(new Date(baseData[0].plannedStartDate)) || "10/06/2024",
          start_date_ac: Utils.formatDate(new Date(baseData[0].plannedStartDate)) || "10/06/2024",
          end_date_ac: Utils.formatDate(new Date(baseData[0].plannedStartDate)) || "10/06/2024",
          duration: null,
          durationDisplay: 0,
          parent: parentId,
          progress: 0,
          row_height: Math.ceil(c.name.length / 40) * 40,
          progressDisplay: '',
          isCategory: true,
        }
        dataGantt.push(data);
      });
    }


    baseData.forEach((item: IssuesResponse) => {
      const category = infoParentComponent.isApplyCategory ? categorys?.find((c) => c.id === item.categoryId) : null;
      let parentId;
      if (item?.parentId) {
        parentId = checkHaveParentInData(item.parentId) && item.id !== item.parentId ? item.parentId : (category?.code || null);
      } else {
        parentId = category?.code ? category.code : null;
      }
     
      let sDate = dayjs().format(formatDateDisplay);
      let eDate = dayjs().format(formatDateDisplay);
        // [#19784][dung_lt][27/10/2024] biến kiểm tra ngày trống
      let isEmptyStartDate = false;
      let isEmptyEndDate = false;
      if (item.plannedStartDate) {
        sDate = Utils.formatDate(new Date(item.plannedStartDate)) || sDate;
      } else {
        isEmptyStartDate = true;
      }
      if (item.plannedEndDate) {
        eDate = Utils.formatDate(new Date(item.plannedEndDate)) || eDate;
      } else {
        isEmptyEndDate = true;
      }
      const sDateTemp = new Date(sDate.split("/").reverse().join("/"));
      const eDateTemp = new Date(eDate.split("/").reverse().join("/"));
      let duration = 0;
      // Kiểm tra xem cả hai ngày có hợp lệ không
      if (!isNaN(sDateTemp.getTime()) && !isNaN(eDateTemp.getTime())){
        // Tính sự chênh lệch giữa hai ngày (chuyển về mili giây)
        let differenceInTime = eDateTemp.getTime() - sDateTemp.getTime();

        // Tính số ngày từ sự chênh lệch thời gian
        duration = differenceInTime / (1000 * 3600 * 24);

      }
      duration++;
      const data: IDataGantt = {
        id: item.id,
        text: item.subject,
        start_date: sDate,
        end_date: eDate,
        start_date_ac: item.actualStartDate,
        end_date_ac: item.actualEndDate || null,
        duration: null,
        durationDisplay: duration,
        parent: parentId,
        row_height: Math.ceil(item.subject.length / 40) * 40,
        progress: (item.progress / 100),
        progressDisplay: `${Number(item.progress.toFixed(0))}%`,
        isEmptyStartDate,
        isEmptyEndDate
      }
      dataGantt.push(data);
    });
    const newDataGantt = removeCategoryNotHaveChild(dataGantt);

    const sortedDataGantt = sortAndPackByParent(newDataGantt);

    setDataGantt(sortedDataGantt);
    
    const linksData = addLinkIfAdjacent(sortedDataGantt);
    if (isInitConfig) {
      gantt.clearAll();
      const curGanttLinks = gantt.getLinks();
      // Duyệt qua từng liên kết và xóa
      curGanttLinks.forEach(function(link) {
          gantt.deleteLink(link.id);
      });
      gantt.parse({
        data: sortedDataGantt,
        links: linksData
      });
      gantt.sort('start_date', false); // asc
       // Calculate back 4 starting days and add 5 ending days to fully display start_date and end_date
       const range = gantt?.getSubtaskDates();
       const scaleUnit = gantt?.getState()?.scale_unit;
       if(range.start_date && range.end_date && scaleUnit){
         gantt.config.start_date = gantt.calculateEndDate(range.start_date, -4, scaleUnit);
         gantt.config.end_date = gantt.calculateEndDate(range.end_date, 5, scaleUnit);
         gantt.render();
       }
       const tasks = gantt.getTaskByTime();
        tasks.forEach(task => {
          if (task?.id && listIdTaskOpen.includes(task.id)) {
            gantt.open(task.id);
          }
      });
    } else {
      gantt.sort('start_date', false);
    }
  }

  // [#20436][dung_lt][17/10/2024]_ xóa các category không có children
  const removeCategoryNotHaveChild = (data: IDataGantt[]): IDataGantt[] => {
    return Utils.clone(data).map((d: IDataGantt) => {
      if (d.isCategory) {
        const child = countChildren(d, Utils.clone(data));
        if (child?.length === 0) {
          return { ...d, isEmptyChildren: true };
        }
        if (child && child.length > 0) {
          const childCategory = child.filter((c) => c.isCategory);
         if (childCategory.length > 0) {
          const allEmpty = childCategory.every((c) => {
            const childOfChildCategory = countChildren(c, Utils.clone(data));
            return childOfChildCategory?.length === 0;
          });
          if (allEmpty) {
            return { ...d, isEmptyChildren: true };
          }
         }
        }
      }
      return d
    })
  }

  function countChildren(data: IDataGantt, dataList: IDataGantt[]) {
    return dataList.filter(d => d.parent === data.id);
}

  const checkHaveParentInData = (_parentId: number) => {
    const baseData: IssuesResponse[] = baseDataGantt ? baseDataGantt.results : [];
    if (baseData && baseData.length > 0) {
      const parent = baseData.find((b) => b.id === _parentId);
      return !!parent;
    }
    return false;
  }

  const addLinkIfAdjacent = (_data: IDataGantt[]) => {
    if (!_data || _data.length <= 0) return [];
    const links: IDataLinks[] = [];
    let id = 1;
    _data.forEach((d) => {
      if (d.end_date && !d.isCategory) {
        try {
          const endDate = new Date(d.end_date.split('/').reverse().join('-'));
          const nextDate = new Date(endDate);

          nextDate.setDate(endDate.getDate() + 1);
          const value = _data.find((_d) => _d.start_date && nextDate.getTime() === (new Date(_d.start_date.split('/').reverse().join('-'))).getTime());
          if (value && value.id && !value.isCategory) {
            links.push({
              id,
              source:d.id,
              target:value.id,
              type:"0"
            });
            id++;
          }
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
        }
      }
    });
    setLinks(links);
    return links;
  }

  const handleTaskDblClick = (id: string, e: Event | undefined) => {
    if (id) {
      const task = gantt?.getTask(id);
      if (task && !task.isCategory) {
        setTask(task);
        setIsModalVisible(true);
      }
    }
    gantt.detachEvent("onTaskDblClick");
  };


  //  region useEffect set data
  useEffect(() => {
    setDataGantt([]);
    baseDataGantt && convertDataAndSetDataGantt(baseDataGantt);
  }, [baseDataGantt?.results.length, params, isSaving, isLoading, categorys?.length, isLoadingGenIssue]);

  useEffect(() => {
    if (!ganttContainer.current || dataGantt.length <= 0) {
      return;
    }
    if (!isInitConfig) {
      ganttInitConfig(gantt);
      gantt.init(ganttContainer.current);
      setInitConfig(true);
    }
    gantt.clearAll();
    const curGanttLinks = gantt.getLinks();
    // Duyệt qua từng liên kết và xóa
    curGanttLinks.forEach(function(link) {
        gantt.deleteLink(link.id);
    });
    gantt.parse({
      data: dataGantt,
      links 
    });
    // Sort by start_date after parsing the data
    // gantt.sort('start_date', false);
    // Calculate back 4 starting days and add 5 ending days to fully display start_date and end_date
    const range = gantt?.getSubtaskDates();
    const scaleUnit = gantt?.getState()?.scale_unit;
    if(range.start_date && range.end_date && scaleUnit){
      gantt.config.start_date = gantt.calculateEndDate(range.start_date, -4, scaleUnit);
      gantt.config.end_date = gantt.calculateEndDate(range.end_date, 5, scaleUnit);
      gantt.render();
    }
     const tasks = gantt.getTaskByTime();
      tasks.forEach(task => {
        if (task?.id && listIdTaskOpen.includes(task.id)) {
          gantt.open(task.id);
        }
      });
    if (!isTaskDblClickAttached) {
      gantt.attachEvent("onTaskDblClick", function(id, e) {
        handleTaskDblClick(id, e);
        return true;
      });
      setIsTaskDblClickAttached(isTaskDblClickAttached);
    }
  }, [dataGantt.length, ganttContainer.current]);

  // [#20436][dung_lt][17/10/2024]_ Sửa lỗi không detach event
  useEffect(() => {
    const onAfterTaskUpdateId = gantt.attachEvent("onAfterTaskUpdate", function(id, item) {
      setMaxDateAndMinDateOfGantt();
    });
    const onTaskOpenedId = gantt.attachEvent("onTaskOpened", function(taskId) {
      if (taskId && !listIdTaskOpen.includes(taskId)) {
        const newListIdTaskOpen = [...listIdTaskOpen, taskId];
        setListIdTaskOpen(newListIdTaskOpen);
      }
      setMaxDateAndMinDateOfGantt();
    });
    const onTaskClosedId = gantt.attachEvent("onTaskClosed", function(taskId) {
      const newListIdTaskOpen = listIdTaskOpen.filter((id) => id !== taskId);
      setListIdTaskOpen(newListIdTaskOpen);
    });
    const onTaskLoadingId = gantt.attachEvent("onTaskLoading", function(task) {
      // Kiểm tra nếu task là category và không có children
      if (task.isCategory && task.isEmptyChildren) {
          return false; // Ẩn task
      }
      return true; // Hiển thị task
    });
    return () => {
      gantt.detachEvent(onAfterTaskUpdateId);
      gantt.detachEvent(onTaskOpenedId);
      gantt.detachEvent(onTaskClosedId);
      gantt.detachEvent(onTaskLoadingId);
  };
  }, [])

  useEffect(() => {
    if (!ganttContainer.current && !dateGanttOption) {
      return;
    }
    // if (!gantt.ext.zoom._zoom_level) {
    if (!gantt.ext.zoom.getCurrentLevel()) {
      ganttConfigDate(gantt);
    }
    gantt.ext.zoom.setLevel(dateGanttOption);
    }, [dateGanttOption]);
    useEffect(() => {
      const handleDocumentClick = (event: any) => {
        // region logic handle click out side when editot date, progress
        const activeElement = document.activeElement as Element;
        if (activeElement && activeElement.tagName.toLowerCase() !== 'input') {
          gantt.ext?.inlineEditors?.save && gantt.ext?.inlineEditors.save();
        } else if (activeElement && activeElement.tagName.toLowerCase() === 'input') {
          const placeholderValue = activeElement.getAttribute('placeholder');
          if (placeholderValue && (placeholderValue === 'Tìm kiếm' || placeholderValue === 'Search')) {
              gantt.ext?.inlineEditors?.save && gantt.ext?.inlineEditors.save();
          }
        }
      };
  
      document.addEventListener('click', handleDocumentClick);
  
      return () => {
        gantt.ext?.inlineEditors?.save();
        document.removeEventListener('click', handleDocumentClick);
      };
    }, []);
    // region Block loading when updating data
    useEffect(() => {
      // Cleanup function to clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout
      const _timeoutId = setTimeout(() => {
        // Perform actions after delay
        if (isUpdate && !isLoading && !isSaving) {
          setIsUpdate(false);
        }
      }, 1000); // 1000 ms delay

      setTimeoutId(_timeoutId);

      return () => {
        // Cleanup function runs on component unmount or before next useEffect execution
        clearTimeout(timeoutId);
      };
    }, [isLoading, isSaving]);
    
    const setMaxDateAndMinDateOfGantt = () => {
      const scaleUnit = gantt?.getState()?.scale_unit;
      const tasks = gantt.getTaskByTime();
      if (tasks.length === 0) return null;
      let maxDate = tasks[0].end_date;
      let minDate = tasks[0].start_date;
      // Hàm đệ quy để duyệt qua các task mở và các task con của chúng
      function checkTaskDates(task: Task) {
        if (task.$open) {
          // Cập nhật maxDate và minDate cho task hiện tại
          if (task.end_date && (!maxDate || new Date(task.end_date) > new Date(maxDate))) {
            maxDate = task.end_date;
          }
          if (task.start_date && (!minDate || new Date(task.start_date) < new Date(minDate))) {
            minDate = task.start_date;
          }
          // Lặp qua các task con và gọi đệ quy
          gantt.eachTask((childTask) => {
            checkTaskChildDate(childTask);
          }, task.id);
        }
      }

      function checkTaskChildDate(task: Task) {
          if (task.end_date && (!maxDate || new Date(task.end_date) > new Date(maxDate))) {
          maxDate = task.end_date;
        }
        if (task.start_date && (!minDate || new Date(task.start_date) < new Date(minDate))) {
          minDate = task.start_date;
        }
        if (task.$open) {
          // Lặp qua các task con và gọi đệ quy
          gantt.eachTask((childTask) => {
            checkTaskChildDate(childTask);
          }, task.id);
        }
      }

      // Duyệt qua các task gốc
      tasks.forEach(task => {
        checkTaskDates(task);
      });
      // console.log('scaleUnit', scaleUnit);
      if (minDate) gantt.config.start_date = gantt.calculateEndDate(minDate, -7, scaleUnit);
      if (maxDate) gantt.config.end_date = gantt.calculateEndDate(maxDate, 7, scaleUnit);
      gantt.render();
    }
    
    return (
      <section className={styles.ganttWrapper + ' ' + (isExportPDF && styles.exportPDF)}>
        <ColorNoteGantt />
        {isModalVisible && <ModalPredecessor task={task} ganttData={dataGantt} isModalVisible={isModalVisible && !isEditing} setIsModalVisible={setIsModalVisible} infoParentComponent={infoParentComponent}/>}
        {
          (isExportPDF || isLoadingGetAllChildRelationship || isLoading || isUpdate) && <div
          style={{
            position: 'fixed',
            height: 'calc(100vh - 120px)',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            zIndex: '99',
          }}
        >
          <Spin size="large" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}/>
        </div>
        }
        {
          (dataGantt.length > 0 && <div ref={ganttContainer} style={{ width: '100%', height: 'calc(100vh - 120px)' }} ></div>)
        }
      </section>
    );
};


