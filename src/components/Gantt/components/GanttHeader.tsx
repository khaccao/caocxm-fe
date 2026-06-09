import React from 'react';

import { FilePdfOutlined } from '@ant-design/icons';
import { Button, Space, Tabs, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { gantt } from 'dhtmlx-gantt';
import { useTranslation } from 'react-i18next';

import { stylesEpxort } from './exportPdfStyles';
import styles from './GanttHeader.module.less';
import { eDateGanttOption, exportGanttToPDF, TabItems } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssuesDateGanttOption, issueActions } from '@/store/issue';
import { startLoading, stopLoading } from '@/store/loading';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';
interface IGanttHeader {
  namePage: string
}
const GanttHeader = ({ namePage }: IGanttHeader) => {
  const { t } = useTranslation('gantt');
  const dispatch = useAppDispatch();
  const dateGanttOption = useAppSelector(getIssuesDateGanttOption());
  const selectedProject = useAppSelector(getSelectedProject());

 
  const handleChangeDateGanttOption = (v: any) => {
    dispatch(issueActions.setDateGanttOption(v));
  };
  const getTextWidth = (text: string, font = '16px Arial') => {
    if (!text) return 0;
    // Tạo một phần tử canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (context) {
      // Đặt font cho context
      context.font = font;
      
      // Tính chiều rộng của văn bản
      const textWidth = context.measureText(text).width;
      return textWidth;
    }
    return 0;
    
  }

  const exportPDF = async () => {
    gantt.unselectTask();
    const currentLevel = gantt.ext.zoom.getCurrentLevel();
    let maxWidth = 300;
    const tasks = gantt.getTaskByTime();
    tasks.forEach((task) => {
      if (maxWidth <= getTextWidth(task.text)) {
        maxWidth = getTextWidth(task.text) + 20;
      }
    })
    gantt.ext.zoom.setLevel(eDateGanttOption.MONTHS);
    handleChangeDateGanttOption(eDateGanttOption.MONTHS);
    try {
      console.time("ExportPDF Time");
      dispatch(startLoading({ key: exportGanttToPDF }));
      // Fetch styles from the document
      const selector = document.querySelector("#styles")?.innerHTML;
//       const newStylesExport = stylesEpxort + `.gantt_row .gantt_cell:first-child, .gantt_grid_scale .gantt_grid_head_cell:first-child {
//     width: ${maxWidth}px !important;
// }`;
    const newStylesExport = stylesEpxort;

      const combinedStyles = `
        ${newStylesExport}
        ${selector}
      `;
      const formatDatePDF = 'HH-mm DD-MM-YYYY';

      // Get the current date and time, formatted according to the specified format
      const toDay = dayjs().format(formatDatePDF);
      Utils.delay(2000);
      const headerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold;">${t('CONSTRUCTION PROGRESS')}</h1>
        <p style="font-size: 18px; margin: 5px 0;">${t('PROJECT')} : ${selectedProject?.name}</p>
        <p style="font-size: 18px; margin: 5px 0;">${t('CATEGORY')} : ${namePage}</p>
      </div>
    `;
    const footerHTML = `
    <div style="text-align: center; margin-top: 20px; display: flex; justify-content: space-around;">
        <p style="font-size: 18px; font-weight: bold; height: 100px">${t('REPRESENTATIVE')} CĐT</p>
        <p style="font-size: 18px; font-weight: bold; height: 100px">${t('REPRESENTATIVE')} BQL&TVGS</p>
        <p style="font-size: 18px; font-weight: bold; height: 100px">${t('REPRESENTATIVE OF THE CONTRACTOR')} </p>
    </div>
`;
      // Perform the export
      gantt.exportToPDF({
        name: `${namePage} ${toDay}.pdf`,
        raw: true,
        header: `<style>${combinedStyles}</style> ${headerHTML}`,
        footer: `${footerHTML}`,
        callback: function(res: { url: any; }){
          dispatch(stopLoading({ key: exportGanttToPDF }));
          window.open(res.url, '_blank');
          console.timeEnd("ExportPDF Time");
      }
      });
      handleChangeDateGanttOption(currentLevel);
      gantt.render();
    } catch (error) {
      dispatch(stopLoading({ key: exportGanttToPDF }));
      handleChangeDateGanttOption(currentLevel);
      // Display a user-friendly message or take other actions as needed
      console.error("Error exporting Gantt chart to PDF:", error);
    }
  };
  const tabItems = new TabItems(t);
  return (
    <Space>
      <Tooltip title={t('Export PDF')}>
        <Button icon={<FilePdfOutlined />} onClick={() => exportPDF()} />
      </Tooltip>
      <Tabs
      defaultActiveKey={dateGanttOption}
      centered
      tabBarGutter={10}
      className={styles.tabs}
      onChange={handleChangeDateGanttOption}
      items={tabItems.getItems()}
      />
    </Space>
  );
};

export default GanttHeader;
