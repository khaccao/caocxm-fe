import React, { useEffect, useState } from 'react';

import { Table, Checkbox, PaginationProps } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType, TableProps } from 'antd/es/table';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './MaterialList.module.css';
import { defaultPagingParams, eTrackerCode, MachineryDimDTO, MaterialsDim, MaterialsDimDTO } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getMachineries, getMaterials, issueActions, getIssueByVersion, getTagsVersion, getTracker, queryParamsByTagVersion, queryParamsMaterial } from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

interface DataType {
  key: string | number;
  id: number;
  name: string;
  unitOfMeasure: string;
  kldinhmuc: string;
  tongdacap: string;
  dexuat: string;
  tonkho: string;
  checkbox: boolean;
}

const MaterialList: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();
  const trackers = useAppSelector(getTracker());
  const material = useAppSelector(getMaterials());
  const paramsMaterial = useAppSelector(queryParamsMaterial());
  const isLoading = useAppSelector(getLoading(MaterialsDim.getMaterialsDim));
  const windowSize = useWindowSize();

  const getMaterialsData = (search?: any) => {
    if (trackers) {
      let trackerId = Utils.getTrackerID(trackers, eTrackerCode.GiaoViecTheoNgay);
      trackerId >= 0 && dispatch(issueActions.getMaterialsDimByTracker({trackerId, params: {...search, type: 1, pageSize: 50, paging: false}}))
    }
  }

  useEffect(() => {
    getMaterialsData();
  }, [trackers]);

  //#region material
  useEffect(() => {
    // console.log('material ', material);
    const data: DataType[] = [];
    if (material && material.results) {
      material.results.forEach((m: MaterialsDimDTO) => {
        if (m.type === 1) {
          data.push({
            key: m.id,
            id: m.id,
            name: m.name,
            unitOfMeasure: m.unitOfMeasure,
            kldinhmuc: '',
            tongdacap: '',
            dexuat: '',
            tonkho: '',
            checkbox: false
          });
        }
      });
      setDataSource(data);
    }
  }, [material]);

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setDataSource(prevDataSource => {
      const newDataSource = [...prevDataSource];
      for (let i = 0; i < newDataSource.length; i++) {
        newDataSource[i].checkbox = checked;
      }
      return newDataSource;
    });
  };

  const handleCheckboxChange = (key: string | number, checked: boolean) => {
    setDataSource(prevDataSource => {
      const newDataSource = [...prevDataSource];
      for (let i = 0; i < newDataSource.length; i++) {
        if (newDataSource[i].key === key) {
          newDataSource[i].checkbox = checked;
        }
      }
      setDataSource(newDataSource);
      return newDataSource;
    });
  };

  const rowClassName = (record: DataType) => classnames({ [styles.selectedRow]: record.checkbox });

  const columns: ColumnType<DataType>[] = [
    {
      title: <Checkbox checked={dataSource.filter(x => !x.checkbox).length === 0} onChange={handleSelectAll} />,
      key: 'checkboxHeader',
      render: (_, record: DataType) => (
        <Checkbox checked={record.checkbox} onChange={e => handleCheckboxChange(record.key, e.target.checked)} />
      ),
      width: 64,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Material code')}</span>,
      dataIndex: 'id',
      key: 'id',
      width: 116,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thep1', 'Thep2', 'Thep10', 'Thep12'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Main material name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 163,
      className: styles.tablecell,
      align: 'start',
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit')}</span>,
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Standard Volume')}</span>,
      dataIndex: 'kldinhmuc',
      key: 'kldinhmuc',
      width: 175,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Total issued')}</span>,
      dataIndex: 'tongdacap',
      key: 'tongdacap',
      width: 137,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Also recommended')}</span>,
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 175,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Actual inventory')}</span>,
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 160,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...paramsMaterial, page: current};
    getMaterialsData(search);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });
  return (
    <div className="MaterialList">
      <header className="MaterialList-header">
        <Table
          dataSource={dataSource}
          columns={columns}
          bordered
          size="middle"
          style={{ width: '100%', height: '75vh' }}
          rowClassName={rowClassName}
          // scroll={{ x: 1000, y: windowSize[1] - 220 }}
          scroll={{ x: 1000, y: windowSize[1] - 170 }}
          pagination={false}
          // pagination={{
          //   current: paramsMaterial?.page || defaultPagingParams.page,
          //   pageSize: paramsMaterial?.pageSize > 9999 ? defaultPagingParams.pageSize : paramsMaterial?.pageSize,
          //   total: material?.queryCount || 0,
          //   responsive: true,
          //   showTotal,
          //   showSizeChanger: true,
          // }}
          loading={isLoading}
          onChange={handleTableChange}
        />
      </header>
    </div>
  );
};

export default MaterialList;
