import React, { useEffect, useState } from 'react';

import { Table, Checkbox, PaginationProps } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType, TableProps } from 'antd/es/table';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './MachineList.module.css';
import { defaultPagingParams, eTrackerCode, MachineryDimDTO, MachinerysDim } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getMachineries,
  getMaterials,
  queryParamsMachinery,
  issueActions,
  getIssueByVersion,
  getTagsVersion,
  getTracker,
  queryParamsByTagVersion,
} from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

interface DataType {
  key: string | number;
  id: string | number;
  name: string;
  unitOfMeasure: string;
  soluonghienco: string;
  vitri: string;
  checkbox: boolean;
}

const MachineList: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const { t } = useTranslation('material');

  const machinery = useAppSelector(getMachineries());

  const dispatch = useAppDispatch();
  const trackers = useAppSelector(getTracker());

  const paramsMachinery = useAppSelector(queryParamsMachinery());
  const isLoading = useAppSelector(getLoading(MachinerysDim.getMachinerysDim));
  const windowSize = useWindowSize();
  const getMachinerysData = (search?: any) => {
    if (trackers) {
      let trackerId = Utils.getTrackerID(trackers, eTrackerCode.GiaoViecTheoNgay);
      trackerId >= 0 &&
        dispatch(issueActions.getMachinerysDimByTracker({ trackerId, params: { ...search, type: 1, pageSize: 50} }));
    }
  };

  useEffect(() => {
    getMachinerysData();
  }, [trackers]);

  //#region machinery
  useEffect(() => {
    // console.log(machinery);
    const data: DataType[] = [];
    if (machinery) {
      machinery.results.forEach((m: MachineryDimDTO) => {
        data.push({
          key: m.id,
          id: m.id,
          name: m.name,
          unitOfMeasure: '',
          soluonghienco: '',
          vitri: '',
          checkbox: false,
        });
      });
    }
    setDataSource(data);
  }, [machinery]);

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
      title: t('Material code'),
      dataIndex: 'id',
      key: 'id',
      width: 142,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thep1', 'Thep2', 'Thep10', 'Thep12'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
    },
    {
      title: t('Machine name'),
      dataIndex: 'name',
      key: 'name',
      width: 520,
      className: styles.tablecell,
    },
    {
      title: t('Unit'),
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Quantity available'),
      dataIndex: 'soluonghienco',
      key: 'soluonghienco',
      width: 168,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Current position'),
      dataIndex: 'vitri',
      key: 'vitri',
      width: 155,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...paramsMachinery, page: current };
    getMachinerysData(search);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  return (
    <div className="MachineList">
      <header className="MachineList-header">
        <Table
          dataSource={dataSource}
          columns={columns}
          bordered
          size="middle"
          style={{ width: '100%', height: '75vh' }}
          rowClassName={rowClassName}
          scroll={{ x: 1000, y: windowSize[1] - 220 }}
          // pagination={false}
          pagination={{
            current: paramsMachinery?.page || defaultPagingParams.page,
            pageSize: paramsMachinery?.pageSize > 9999 ? defaultPagingParams.pageSize : paramsMachinery?.pageSize,
            total: machinery?.queryCount || 0,
            responsive: true,
            showTotal,
            showSizeChanger: true,
          }}
          loading={isLoading}
          onChange={handleTableChange}
        />
      </header>
    </div>
  );
};

export default MachineList;
