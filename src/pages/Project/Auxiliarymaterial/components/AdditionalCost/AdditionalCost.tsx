import React, { useState } from 'react';

import { CameraOutlined } from '@ant-design/icons';
import { Table, Checkbox, Avatar } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType } from 'antd/es/table';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './AdditionalCost.module.css';

interface DataType {
  key: string;
  id: string;
  tenmay: string;
  donvi: string;
  soluong: string;
  thanhtien: string;
  hinhanh: string;
  nguoichi: string;
  ghichu: string;
  checkbox: boolean;
}

const initialDataSource: DataType[] = [
  {
    key: '1',
    id: 'BT01',
    tenmay: 'Gọi xe cẩu ngoài',
    donvi: 'Lượt',
    soluong: '1',
    thanhtien: '700.000',
    hinhanh: '',
    nguoichi: 'Tú',
    ghichu: 'Abcsasd',
    checkbox: false,
  },
  {
    key: '2',
    id: 'Thai1',
    tenmay: 'Gọi xe chở thải',
    donvi: 'Lượt',
    soluong: '',
    thanhtien: '700.000',
    hinhanh: '',
    nguoichi: '',
    ghichu: '',
    checkbox: false,
  },
];

const AdditionalCost: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>(initialDataSource);
  const { t } = useTranslation('material');

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setDataSource(prevDataSource => {
      const newDataSource = prevDataSource.map(item => ({
        ...item,
        checkbox: checked,
      }));
      return newDataSource;
    });
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setDataSource(prevDataSource => {
      const newDataSource = prevDataSource.map(item => (item.key === key ? { ...item, checkbox: checked } : item));
      return newDataSource;
    });
  };

  const rowClassName = (record: DataType) => classnames({ [styles.selectedRow]: record.checkbox });

  const columns: ColumnType<DataType>[] = [
    {
      title: <Checkbox checked={dataSource.every(x => x.checkbox)} onChange={handleSelectAll} />,
      key: 'checkboxHeader',
      render: (_, record: DataType) => (
        <Checkbox checked={record.checkbox} onChange={e => handleCheckboxChange(record.key, e.target.checked)} />
      ),
      width: 64,
      align: 'center',
    },
    {
      title: t('Cost code'),
      dataIndex: 'id',
      key: 'id',
      width: 122,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thai1'].includes(text) ? styles.underlineText : ''}>{text}</span>
      ),
      align: 'center',
    },
    {
      title: t('Cost name'),
      dataIndex: 'tenmay',
      key: 'tenmay',
      width: 166,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Unit'),
      dataIndex: 'donvi',
      key: 'donvi',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Quantity'),
      dataIndex: 'soluong',
      key: 'soluong',
      width: 112,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Into money'),
      dataIndex: 'thanhtien',
      key: 'thanhtien',
      width: 124,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Image'),
      dataIndex: 'hinhanh',
      key: 'hinhanh',
      width: 112,
      className: styles.tablecell,
      render: (_, record: DataType) => (record.key === '1' ? <Avatar icon={<CameraOutlined />} /> : null),
      align: 'center',
    },
    {
      title: t('People who spend money'),
      dataIndex: 'nguoichi',
      key: 'nguoichi',
      width: 117,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Note'),
      dataIndex: 'ghichu',
      key: 'ghichu',
      width: 230,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  return (
    <div className="AdditionalCost">
      <header className="AdditionalCost-header">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          style={{ maxWidth: '1801px' }}
          rowClassName={rowClassName}
        />
      </header>
    </div>
  );
};

export default AdditionalCost;
