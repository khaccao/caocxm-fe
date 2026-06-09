import React, { useState } from 'react';

import { DownloadOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Table, Button, DatePicker } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './ProjectSettlement.module.css';

interface DataType {
  key: string;
  id: string;
  macn: string;
  noidungcv: string;
  donvitinh: string;
  giatritheohd: string;
  giatrithuchien: string;
  note: string;
}

const initialDataSource: DataType[] = [
  {
    key: '1',
    id: '1',
    macn: '',
    noidungcv: 'Công nợ vật tư chính',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '4,471,708,182',
    note: '',
  },
  {
    key: '2',
    id: '2',
    macn: '',
    noidungcv: 'Công nợ thép',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '2,471,708,182',
    note: '',
  },
  {
    key: '3',
    id: '3',
    macn: '',
    noidungcv: 'Công nợ bê tông',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '1,471,708,182',
    note: '',
  },
  {
    key: '4',
    id: '4',
    macn: '',
    noidungcv: 'Công nợ gạch xây',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '471,708,182',
    note: '',
  },
  {
    key: '5',
    id: '5',
    macn: '',
    noidungcv: 'Công nợ cát + đá',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '94,708,182',
    note: '',
  },
  {
    key: '6',
    id: '6',
    macn: '',
    noidungcv: 'Công nợ xi măng',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '171,708,182',
    note: '',
  },
  {
    key: '7',
    id: '7',
    macn: '',
    noidungcv: 'Công nợ ván phin',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '164,708,182',
    note: '',
  },
  {
    key: '8',
    id: '8',
    macn: '',
    noidungcv: 'Công nợ keo ốp lát',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '1,708,182',
    note: '',
  },
  {
    key: '9',
    id: '9',
    macn: '',
    noidungcv: 'Chi phí vật tư phụ',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '140,708,182',
    note: '',
  },
  {
    key: '10',
    id: '10',
    macn: '',
    noidungcv: 'Chi phí nhân công',
    donvitinh: 'VND',
    giatritheohd: '',
    giatrithuchien: '2,140,708,182',
    note: '',
  },
];
export const ProjectSettlement: React.FC = () => {
  const [dataSource] = useState<DataType[]>(initialDataSource);
  const { t } = useTranslation('material');

  const columns: ColumnType<DataType>[] = [
    {
      title: t('Numerical order'),
      dataIndex: 'id',
      key: 'id',
      width: 78,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Debt code'),
      dataIndex: 'macn',
      key: 'macn',
      width: 133,
      align: 'center',
      className: styles.tablecell,
    },
    {
      title: t('work content'),
      dataIndex: 'noidungcv',
      key: 'noidungcv',
      width: 256,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Unit of measure1'),
      dataIndex: 'donvitinh',
      key: 'donvitinh',
      width: 111,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Contract value'),
      dataIndex: 'giatritheohd',
      key: 'giatritheohd',
      width: 200,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Real Value'),
      dataIndex: 'giatrithuchien',
      key: 'giatrithuchien',
      width: 200,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Note'),
      dataIndex: 'note',
      key: 'note',
      width: 180,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  const onDownload = () => {
    console.log('Download clicked');
  };

  const onEllipOutLine = () => {
    console.log('More clicked');
  };
  const handleApply = () => {};
  return (
    <div className="MachineList">
      <div className={styles.tabheader}>
        <div className={styles.headerContent}>
          <h4>{t('Project Settlement')}</h4>
          <DatePicker style={{ marginLeft: '20px' }} />
        </div>
        <div className="tab-header-diary">
          <Button type="primary" onClick={handleApply} className="apply-button">
            Lưu thay đổi
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload} className="download-button"></Button>
          <Button
            type="default"
            icon={<EllipsisOutlined />}
            onClick={onEllipOutLine}
            className="ellipsis-button"
          ></Button>
        </div>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered
        size="middle"
        style={{ maxWidth: '1801px', margin: '25px' }}
      />
    </div>
  );
};

export default ProjectSettlement;
