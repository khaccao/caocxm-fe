import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './paythesubcontractorList.module.css';
import { Paythesubcontractor } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';

interface DataType {
  key: string;
  code: string;
  date: string;
  name: string;
  contractValue: number;
  cumulativeValue: number;
  remainingValue: number;
}
export interface PaymentTerm {
  code: string;
  accountingCustomerCode?: string;
  contractorTypeCode?: string;
  contractorTypeName?: string;
  name: string;
  nguoiDaiDien: string;
  giaTriTheoHopDong: number;
  giaTriTheoHopDong_Code: string;
  giaTriUngTruoc: number;
  giaTriUngTruoc_Code: string;
  giaTriLuyKeThucHienDotNay: number;
  giaTriKeHoachThucHienDotNay_Code: string;
  giaTriThanhToanKeHoach: number;
  giaTriThanhToanKeHoach_Code: string;
  giaTriTTLanNay: number;
  giaTriTTLanNay_Code: string;
  giaTriConLai: number;
  giaTriConLai_Code: string;
  projectId: number;
  paymentTermDate: string;
  paymentTerm: number;
  id: number;
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

interface PaythesubcontractorListProps {
  type: Paythesubcontractor;
}

const PaythesubcontractorList: React.FC<PaythesubcontractorListProps> = ({ type }) => {
  const { t } = useTranslation('subcontractor');
  const paymentByProject = useAppSelector((state: RootState) => state.project.paymentByProject || []);
  const windowSize = useWindowSize();
  //[20510] [nam_do] view dữu liệu cho màn hình thanh toán ngày 12 và ngày 27
  const columns: ColumnsType<PaymentTerm> = [
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('datepay')}</span>,
      dataIndex: 'paymentTermDate',
      align: 'center',
      key: 'paymentTermDate',
      width: 150,
      render: (text: string) => {
        return text ? dayjs(text).format('DD/MM/YYYY') : '-';
      },
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorCode')}</span>,
      dataIndex: 'code',
      align: 'center',
      key: 'code',
      width: 120,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>Mã KH</span>,
      dataIndex: 'accountingCustomerCode',
      align: 'center',
      key: 'accountingCustomerCode',
      width: 120,
      render: value => value || '-',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>Loại nhà thầu</span>,
      dataIndex: 'contractorTypeCode',
      align: 'center',
      key: 'contractorTypeCode',
      width: 140,
      render: (_value, record) => record.contractorTypeCode || record.contractorTypeName || '-',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorName')}</span>,
      dataIndex: 'nguoiDaiDien',
      align: 'center',
      key: 'nguoiDaiDien',
      width: 150,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractValue')}</span>,
      dataIndex: 'giaTriTheoHopDong',
      align: 'center',
      key: 'giaTriTheoHopDong',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('cumulativeValue')}</span>,
      dataIndex: 'giaTriLuyKeThucHienDotNay',
      align: 'center',
      key: 'giaTriLuyKeThucHienDotNay',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('currentValue')}</span>,
      dataIndex: 'giaTriTTLanNay',
      align: 'center',
      key: 'giaTriTTLanNay',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('remainingValue')}</span>,
      dataIndex: 'giaTriConLai',
      align: 'center',
      key: 'giaTriConLai',
      width: 100,
      render: value => value.toLocaleString() || 0,
    },
    // {
    //   title: '',
    //   key: 'action',
    //   align: 'center',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <p style={{ color: 'blue', textDecoration: 'underline' }}>{t('viewDetails')}</p>
    //       <EllipsisOutlined style={{ fontSize: '20px' }} />
    //     </Space>
    //   ),
    // },
  ];

  const totalContractValue = paymentByProject.reduce((sum, item) => sum + item.giaTriTheoHopDong, 0);
  const totalCumulativeValue = paymentByProject.reduce((sum, item) => sum + item.giaTriLuyKeThucHienDotNay, 0);
  const totalCurrentValue = paymentByProject.reduce((sum, item) => sum + item.giaTriTTLanNay, 0);
  const totalRemainingValue = paymentByProject.reduce((sum, item) => sum + item.giaTriConLai, 0);

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        dataSource={paymentByProject}
        pagination={false}
        scroll={{ x: 'max-content', y: windowSize[1] - 255 }}
        summary={() => (
          <Table.Summary.Row style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            <Table.Summary.Cell index={0}>{t('total')}</Table.Summary.Cell>
            <Table.Summary.Cell index={1}></Table.Summary.Cell>
            <Table.Summary.Cell index={2}></Table.Summary.Cell>
            <Table.Summary.Cell index={3}></Table.Summary.Cell>
            <Table.Summary.Cell index={4}></Table.Summary.Cell>
            <Table.Summary.Cell index={5}>{totalContractValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={6}>{totalCumulativeValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={7}>{totalCurrentValue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={8}>{totalRemainingValue.toLocaleString()}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default PaythesubcontractorList;
