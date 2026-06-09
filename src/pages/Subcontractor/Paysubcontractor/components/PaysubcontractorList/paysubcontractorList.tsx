import React from 'react';

import { EllipsisOutlined } from '@ant-design/icons';
import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './paysubcontractorList.module.css';

interface DataType {
  key: string;
  code: string;
  date: string;
  name: string;
  contractValue: number;
  cumulativeValue: number;
  remainingValue: number;
}

const data: DataType[] = [
  {
    key: '1',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '2',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '3',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
];

const PaysubcontractorList: React.FC = () => {
  const { t } = useTranslation('subcontractor');

  const columns: ColumnsType<DataType> = [
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorCode')}</span>,
      dataIndex: 'code',
      align: 'center',
      key: 'code',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorName')}</span>,
      dataIndex: 'date',
      align: 'center',
      key: 'date',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractValue')}</span>,
      dataIndex: 'name',
      align: 'center',
      key: 'name',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('cumulativeValue')}</span>,
      dataIndex: 'contractValue',
      align: 'center',
      key: 'contractValue',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('currentValue')}</span>,
      dataIndex: 'cumulativeValue',
      align: 'center',
      key: 'cumulativeValue',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('remainingValue')}</span>,
      dataIndex: 'remainingValue',
      align: 'center',
      key: 'remainingValue',
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <p style={{ color: 'blue', textDecoration: 'underline' }}>{t('viewDetails')}</p>
          <EllipsisOutlined style={{ fontSize: '20px' }} />
        </Space>
      ),
    },
  ];


  const totalContractValue = data.reduce((sum, item) => sum + item.contractValue, 0);
  const totalCumulativeValue = data.reduce((sum, item) => sum + item.cumulativeValue, 0);
  const totalRemainingValue = data.reduce((sum, item) => sum + item.remainingValue, 0);

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        summary={() => (
          <Table.Summary.Row style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
            <Table.Summary.Cell index={0} colSpan={1}>{t('total')}</Table.Summary.Cell>
            <Table.Summary.Cell index={1}></Table.Summary.Cell>
            <Table.Summary.Cell index={2}></Table.Summary.Cell>
            <Table.Summary.Cell index={3}>{totalContractValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={4}>{totalCumulativeValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={5}>{totalRemainingValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={6}></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default PaysubcontractorList;
