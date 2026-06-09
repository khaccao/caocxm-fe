import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './MachineDiary.module.css';

interface DataType {
  key: string;
  tenct: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  dot: string;
}

const data: DataType[] = [
  {
    key: '1',
    tenct: 'Công trình Hải An',
    code: '1234',
    name: 'Vận thăng 1 lồng',
    unit: 'Bộ',
    quantity: 1,
    dot: '...',
  },
  {
    key: '2',
    tenct: 'Công trình Hải An',
    code: '1234',
    name: 'Vận thằng hàng',
    unit: 'Bộ',
    quantity: 1,
    dot: '...',
  },
  {
    key: '3',
    tenct: 'Công trình Hải An',
    code: '1234',
    name: 'Máy hàn cơ',
    unit: 'Cái',
    quantity: 3,
    dot: '...',
  },
  {
    key: '4',
    tenct: 'Công trình Hải An',
    code: '1234',
    name: 'Máy khoan bê tông',
    unit: 'Cái',
    quantity: 2,
    dot: '...',
  },
  {
    key: '5',
    tenct: 'Công trình Sơn Trà',
    code: '1234',
    name: 'Cẩu tháp',
    unit: 'Bộ',
    quantity: 1,
    dot: '...',
  },
  {
    key: '6',
    tenct: 'Công trình Sơn Trà',
    code: '1234',
    name: 'Vận thăng 2 lồng',
    unit: 'Bộ',
    quantity: 1,
    dot: '...',
  },
  {
    key: '7',
    tenct: 'Công trình Sơn Trà',
    code: '1234',
    name: 'Máy hàn cơ',
    unit: 'Cái',
    quantity: 3,
    dot: '...',
  },
];

const columns: ColumnsType<DataType> = [
  {
    title: 'Mã',
    dataIndex: 'code',
    key: 'code',
    width: '10%',
    render: (text: string) => <span className={text === '1234' ? styles.underlineText : ''}>{text}</span>,
  },
  {
    title: 'Tên nhật ký',
    dataIndex: 'name',
    key: 'name',
    width: '50%',
  },
  {
    title: 'Đơn vị tính',
    dataIndex: 'unit',
    key: 'unit',
    width: '15%',
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    key: 'quantity',
    width: '15%',
  },
  {
    title: 'Dot',
    dataIndex: 'dot',
    key: 'dot',
    width: '10%',
  },
];

const MachineDiary: React.FC = () => {
  const { t } = useTranslation('material');

  const expandedRowRender = (data: DataType[]) => {
    return <Table columns={columns} dataSource={data} pagination={false} rowKey="key" showHeader={false} />;
  };

  const groupedData = data.reduce((acc, item) => {
    const ctGroup = acc.find(group => group.tenct === item.tenct);
    if (ctGroup) {
      ctGroup.items.push(item);
    } else {
      acc.push({ tenct: item.tenct, items: [item] });
    }
    return acc;
  }, [] as { tenct: string; items: DataType[] }[]);

  const tableData = groupedData.map((group, index) => ({
    key: `group-${index}`,
    tenct: `${group.tenct}`,
    items: group.items,
  }));

  return (
    <div className={styles.tableContainer}>
      <div className={styles.headerContainer}>
        <h3 className={styles.headerCode}>{t('Code')}</h3>
        <h3 className={styles.headerName}>{t('Machinery name')}</h3>
        <h3 className={styles.headerUnit}>{t('Unit of measure')}</h3>
        <h3 className={styles.headerQuantity}>{t('Quantity')}</h3>
        <h3 className={styles.headerDot}> </h3>
      </div>
      {tableData.map(group => (
        <div key={group.key}>
          <h2 className={`${styles.tableHeader} ${styles.tableTenct}`}>{group.tenct}</h2>
          {expandedRowRender(group.items)}
        </div>
      ))}
    </div>
  );
};

export default MachineDiary;
