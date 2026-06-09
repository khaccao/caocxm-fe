import React, { useEffect, useState } from 'react';

import { Table, Checkbox, PaginationProps } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType, TablePaginationConfig, TableProps } from 'antd/es/table';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './AuxiliaryMaterialList.module.css';
import { defaultPagingParams, eTrackerCode, MaterialsDim, MaterialsDimDTO } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getMaterials, issueActions, getIssueByVersion, getTagsVersion, getTracker, queryParamsByTagVersion, queryParamsMaterial } from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';


interface DataType {
  key: string | number;
  id: string | number;
  name: string;
  unitOfMeasure: string;
  kldinhmuc: string;
  tongdacap: string;
  dexuat: string;
  tonkho: string;
  checkbox: boolean;
}

const AuxiliaryMaterialList: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();
  const trackers = useAppSelector(getTracker());
  const material = useAppSelector(getMaterials());
  const paramsMaterial = useAppSelector(queryParamsMaterial());
  const isLoading = useAppSelector(getLoading(MaterialsDim.getMaterialsDim));
  const windowSize = useWindowSize();

  useEffect(() => {
    getMaterialsData();
  }, [trackers]);

    //#region material
    useEffect(() => {
      // console.log('material ', material);
      const data: DataType[] = [];
      if (material && material.results) {
        material.results.forEach((m: MaterialsDimDTO) => {
          if (m.type === 0) {
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
      title: t('Material code'),
      dataIndex: 'id',
      key: 'id',
      width: 116,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thep1', 'Thep2', 'Thep10'].includes(text) ? styles.underlineText : ''}>{text}</span>
      ),
      align: 'center',
    },
    {
      title: t('Name of auxiliary material'),
      dataIndex: 'name',
      key: 'name',
      width: 163,
      className: styles.tablecell,
      align: 'left',
    },
    {
      title: t('Unit'),
      dataIndex: 'UnitOfMeasure',
      key: 'UnitOfMeasure',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Standard Volume'),
      dataIndex: 'kldinhmuc',
      key: 'kldinhmuc',
      width: 175,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Total issued'),
      dataIndex: 'tongdacap',
      key: 'tongdacap',
      width: 137,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Also recommended'),
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 175,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Actual inventory'),
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 160,
      className: styles.tablecell,
      align: 'center',
    },
  ];
  
  const getMaterialsData = (search?: any) => {
    if (trackers) {
      let trackerId = Utils.getTrackerID(trackers, eTrackerCode.GiaoViecTheoNgay);
      trackerId >= 0 && dispatch(issueActions.getMaterialsDimByTracker({trackerId, params: {...search, type: 0, pageSize: 50, paging: false}}))
    }
  }

  const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...paramsMaterial, page: current};
    getMaterialsData(search);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  return (
    <div className="AuxiliaryMaterialList">
      <header className="AuxiliaryMaterialList-header">
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

export default AuxiliaryMaterialList;

