import React, { useEffect, useState } from 'react';

import { Table, Input, Checkbox, Pagination } from 'antd';
import { PaginationProps } from 'antd/lib';
import { useTranslation } from 'react-i18next';

import styles from '././DepartmentKPIs.module.less';
import { DepartmentKPIsHeader } from './DepartmentKPIsHeader';
import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

export interface iDepartmentKPIs {
  stt: string;
  ma: string;
  tieuchi: string;
  muctieu: number;
  donvitinh: string;
  trongso: number;
  num1: string;
  num2: string;
  num3: string;
  num4: string;
  diem: number;
  tongDiem: number;
  BGDDuyet: boolean;
  notes: string;
  employeeId: number;
  confirmBy: number;
}

export const DepartmentKPIs: React.FC = () => {
  const tTable = useTranslation('table').t;
  const [Data, setData] = useState<iDepartmentKPIs[]>([]);
  const windowSize = useWindowSize();
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const rankDataByID = useAppSelector(state => state.employee.rankDataByID);
  const getEmployeeId = useAppSelector(state => state.employee.getEmployeeId);

  useEffect(() => {
    const _data: iDepartmentKPIs[] = rankDataByID.map((item, index) => {
      const trongso = Utils.getNumber(item.weightCriteria, 'float') || Utils.getNumber('4', 'float');
      const diem = 0;

      const employeeData = getEmployeeId.find(emp => emp.kipCriteriaId === item.id);

      const employeeDiem = employeeData ? employeeData.point : diem;
      const employeeConfirmBy = employeeData ? employeeData.confirmBy : 0;
      const employeeBGDDuyet = employeeData ? (employeeData.confirmBy === 1 ? true : false) : false;
      const employeeNotes = employeeData ? employeeData.notes : '';

      return {
        stt: `${index + 1}`,
        ma: `code${index}`,
        tieuchi: item.name || '',
        muctieu: item.target || 0,
        donvitinh: item.unit || '',
        trongso: trongso,
        num1: item.level1 || '',
        num2: item.level2 || '',
        num3: item.level3 || '',
        num4: item.level4 || '',
        diem: employeeDiem,
        tongDiem: employeeDiem * trongso || 0,
        BGDDuyet: employeeBGDDuyet,
        notes: employeeNotes,
        employeeId: item.id,
        confirmBy: employeeConfirmBy,
      };
    });

    setData(_data);
  }, [rankDataByID, getEmployeeId]);

  const handleDataChange = (value: iDepartmentKPIs, type: string) => {
    const updatedData = [...Data];
    const index = updatedData.findIndex(item => item.ma === value.ma);

    if (index !== -1) {
      if (type === 'diem') {
        const diem = isNaN(Number(value.diem)) ? 0 : Number(value.diem);
        updatedData[index] = {
          ...updatedData[index],
          diem,
          tongDiem: diem * updatedData[index].trongso,
        };
      } else if (type === 'BGDDuyet') {
        const newBGDDuyet = !value.BGDDuyet;
        updatedData[index] = {
          ...updatedData[index],
          BGDDuyet: newBGDDuyet,
          confirmBy: newBGDDuyet ? 1 : 0,
        };
      } else if (type === 'notes') {
        updatedData[index] = {
          ...updatedData[index],
          notes: value.notes,
        };
      }
    }
    setData(updatedData);
  };

  const columns = [
    {
      title: <div className={styles.centerTitle}>{tTable('TT')}</div>,
      dataIndex: 'stt',
      width: 50,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Criterion')}</div>,
      dataIndex: 'tieuchi',
      width: 400,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Target')}</div>,
      dataIndex: 'muctieu',
      width: 60,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Unit')}</div>,
      dataIndex: 'donvitinh',
      width: 50,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Weight')}</div>,
      dataIndex: 'trongso',
      width: 40,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('1')}</div>,
      dataIndex: 'num1',
      width: 40,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('2')}</div>,
      dataIndex: 'num2',
      width: 40,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('3')}</div>,
      dataIndex: 'num3',
      width: 40,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('4')}</div>,
      dataIndex: 'num4',
      width: 40,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Point')}</div>,
      dataIndex: 'diem',
      width: 90,
      className: styles.nopaddingtitle,
      render: (text: any, record: iDepartmentKPIs) => (
        <Input
          value={record.diem.toString()}
          onChange={e => handleDataChange({ ...record, diem: Number(e.target.value) }, 'diem')}
        />
      ),
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Total point')}</div>,
      dataIndex: 'tongDiem',
      width: 50,
      className: styles.nopaddingtitle,
    },
    {
      title: <div className={styles.centerTitle}>{tTable('The Board of Directors Approve')}</div>,
      dataIndex: 'BGDDuyet',
      width: 40,
      className: styles.nopaddingtitle,
      render: (text: any, record: iDepartmentKPIs) => (
        <Checkbox checked={record.confirmBy === 1} onChange={() => handleDataChange(record, 'BGDDuyet')} />
      ),
    },
    {
      title: <div className={styles.centerTitle}>{tTable('Note')}</div>,
      dataIndex: 'notes',
      width: 250,
      className: styles.nopaddingtitle,
      render: (text: any, record: iDepartmentKPIs) => (
        <Input.TextArea
          value={record.notes}
          onChange={e => handleDataChange({ ...record, notes: e.target.value }, 'notes')}
          rows={2}
          style={{ resize: 'vertical' }}
        />
      ),
    },
  ];

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    tTable('pagingTotal', { range1: range[0], range2: range[1], total });

  const paginatedData = Data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <DepartmentKPIsHeader newData={Data} />
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="ma"
        pagination={false}
        bordered
        className={styles.tableCellPadding}
        scroll={{
          x: 1450,
          y: windowSize[1] - 270,
        }}
      />
      <div style={{ padding: 5, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={Data.length}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize || 20);
          }}
          showTotal={showTotal}
          showSizeChanger
        />
      </div>
    </>
  );
};

export default DepartmentKPIs;
