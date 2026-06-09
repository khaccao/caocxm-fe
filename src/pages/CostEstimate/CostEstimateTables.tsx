import React, { useState } from 'react';

import { Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './CostEstimate.module.css';

interface DataType {
  key: string;
  id: string;
  mavt: number;
  noidung: string;
  donvi: string;
  kldinhmuc: string;
  dongia: string;
  thanhtientheodinhmuc: string;
  thanhtientheohopdong: string;
}

const initialDataSource: DataType[] = [
  {
    key: '1',
    id: '1',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1000',
    dongia: '700',
    thanhtientheodinhmuc: '300',
    thanhtientheohopdong: '700',
  },
  {
    key: '2',
    id: '2',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '',
    dongia: '',
    thanhtientheodinhmuc: '',
    thanhtientheohopdong: '',
  },
  {
    key: '3',
    id: '3',
    mavt: 1,
    noidung: '',
    donvi: 'Cái',
    kldinhmuc: '1200',
    dongia: '800',
    thanhtientheodinhmuc: '400',
    thanhtientheohopdong: '800',
  },
  {
    key: '4',
    id: '4',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1500',
    dongia: '1000',
    thanhtientheodinhmuc: '500',
    thanhtientheohopdong: '1000',
  },
  {
    key: '5',
    id: '5',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1500',
    dongia: '1000',
    thanhtientheodinhmuc: '500',
    thanhtientheohopdong: '1000',
  },
  {
    key: '6',
    id: '6',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1500',
    dongia: '1000',
    thanhtientheodinhmuc: '500',
    thanhtientheohopdong: '1000',
  },
  {
    key: '7',
    id: '7',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1500',
    dongia: '1000',
    thanhtientheodinhmuc: '500',
    thanhtientheohopdong: '1000',
  },
  {
    key: '8',
    id: '8',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '1500',
    dongia: '1000',
    thanhtientheodinhmuc: '500',
    thanhtientheohopdong: '1000',
  },
  {
    key: '9',
    id: '9',
    mavt: 1,
    noidung: '',
    donvi: 'Kg',
    kldinhmuc: '',
    dongia: '',
    thanhtientheodinhmuc: '',
    thanhtientheohopdong: '',
  },
];

export const CostEstimate: React.FC = () => {
  const [dataSource] = useState<DataType[]>(initialDataSource);
  const { t } = useTranslation('material');

  const rowClassName = (record: DataType) => classnames({ [styles.selectedRow]: false });

  const columns: ColumnType<DataType>[] = [
    {
      title: <span className={styles.tableHeader}>{t('Numerical order')}</span>,
      dataIndex: 'id',
      key: 'id',
      width: 116,
      className: styles.tablecell,

      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>{t('Material code')}</span>,
      dataIndex: 'mavt',
      key: 'mavt',
      width: 116,
      className: styles.tablecell,
      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>{t('interpretation content')}</span>,
      dataIndex: 'noidung',
      key: 'noidung',
      width: 163,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit of measure')}</span>,
      dataIndex: 'donvi',
      key: 'donvi',
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
      title: <span className={styles.tableHeader}>{t('unit price')}</span>,
      dataIndex: 'dongia',
      key: 'dongia',
      width: 137,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('amount according to the standard')}</span>,
      dataIndex: 'thanhtientheodinhmuc',
      key: 'thanhtientheodinhmuc',
      width: 175,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('amount according to the contract')}</span>,
      dataIndex: 'thanhtientheohopdong',
      key: 'thanhtientheohopdong',
      width: 160,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  return (
    <div className={styles.CostEstimate}>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered
        size="middle"
        style={{ maxWidth: '1801px' }}
        rowClassName={rowClassName}
      />
    </div>
  );
};

export default CostEstimate;
