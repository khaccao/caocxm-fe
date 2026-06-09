import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './MaterialTable.module.css';
interface DataType {
  key: string;
  date: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  dot: string;
}
const data: DataType[] = [
  {
    key: '1',
    date: '01/01/2023',
    code: '1234',
    name: 'Sắt hộp 5x5 (0,5m - 1m)',
    unit: 'Cây',
    quantity: 20,
    dot: '...',
  },
  {
    key: '2',
    date: '01/01/2023',
    code: '1234',
    name: 'Ống thép Φ60 x 1,7m',
    unit: 'Thanh',
    quantity: 10,
    dot: '...',
  },
  {
    key: '3',
    date: '01/01/2023',
    code: '1234',
    name: 'Ống thép Φ49 0.6x1m',
    unit: 'Thanh',
    quantity: 5,
    dot: '...',
  },
  {
    key: '4',
    date: '01/01/2023',
    code: '1234',
    name: 'Kích đầu + chân',
    unit: 'Cái',
    quantity: 100,
    dot: '...',
  },
  {
    key: '5',
    date: '02/01/2023',
    code: '1234',
    name: 'Sắt hộp 5x5 (0,5m - 1m)',
    unit: 'Cây',
    quantity: 20,
    dot: '...',
  },
  {
    key: '6',
    date: '02/01/2023',
    code: '1234',
    name: 'Ống thép Φ60 x 1,7m',
    unit: 'Thanh',
    quantity: 10,
    dot: '...',
  },
  {
    key: '7',
    date: '02/01/2023',
    code: '1234',
    name: 'Ống thép Φ49 0.6x1m',
    unit: 'Thanh',
    quantity: 5,
    dot: '...',
  },
  {
    key: '8',
    date: '02/01/2023',
    code: '1234',
    name: 'Kích đầu + chân',
    unit: 'Cái',
    quantity: 100,
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
const MaterialTable: React.FC = () => {
  const { t } = useTranslation('material');
  const expandedRowRender = (data: DataType[]) => {
    return <Table columns={columns} dataSource={data} pagination={false} rowKey="key" showHeader={false} />;
  };
  const groupedData = data.reduce((acc, item) => {
    const dateGroup = acc.find(group => group.date === item.date);
    if (dateGroup) {
      dateGroup.items.push(item);
    } else {
      acc.push({ date: item.date, items: [item] });
    }
    return acc;
  }, [] as { date: string; items: DataType[] }[]);
  const tableData = groupedData.map((group, index) => ({
    key: `group-${index}`,
    date: `${t('Day')} ${group.date}`,
    items: group.items,
  }));
  return (
    <div className={styles.tableContainer}>
      <div className={styles.headerContainer}>
        <h3 className={styles.headerCode}>{t('Code')}</h3>
        <h3 className={styles.headerName}>{t('Log name')}</h3>
        <h3 className={styles.headerUnit}>{t('Unit of measure')}</h3>
        <h3 className={styles.headerQuantity}>{t('Quantity')}</h3>
        <h3 className={styles.headerDot}> </h3>
      </div>
      {tableData.map(group => (
        <div key={group.key}>
          <h2 className={`${styles.tableHeader} ${styles.tableDate}`}>{group.date}</h2>
          {expandedRowRender(group.items)}
        </div>
      ))}
    </div>
  );
};
export default MaterialTable;
