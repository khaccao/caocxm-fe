import React from 'react';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Table, Input, Button, DatePicker, Form, Typography, Row, Col } from 'antd';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './ImportGoods.module.css';

const { Title } = Typography;

interface DataType {
  key: string;
  mavattu: string;
  tenvattu: string;
  donvi: string;
  soluongduocduyet: number;
  tongsoluong: string;
  soluongnhan: number;
  soluongconlai: string;
  danhgia: string;
  ghichu: string;
  chtxacnhan: string;
  ktxacnhan: string;
  hinhanh: string;
}

const ImportGoods: React.FC = () => {
  const dataSource: DataType[] = [
    {
      key: '1',
      mavattu: 'Thep2',
      tenvattu: 'Thép 2',
      donvi: 'Kg',
      soluongduocduyet: 25,
      tongsoluong: '0',
      soluongnhan: 25,
      soluongconlai: '0',
      danhgia: 'Đạt',
      ghichu: '',
      chtxacnhan: 'approved',
      ktxacnhan: 'approved',
      hinhanh: '',
    },
    {
      key: '2',
      mavattu: 'Kem',
      tenvattu: 'Kẽm',
      donvi: 'Kg',
      soluongduocduyet: 100,
      tongsoluong: '50',
      soluongnhan: 50,
      soluongconlai: '50',
      danhgia: 'Không đạt',
      ghichu: '',
      chtxacnhan: 'rejected',
      ktxacnhan: 'rejected',
      hinhanh: '',
    },
  ];

  const { t } = useTranslation('material');

  const columns: ColumnsType<DataType> = [
    {
      title: <span>{t('Material code')}</span>,
      dataIndex: 'mavattu',
      key: 'mavattu',
      width: 150,
      render: (text: string) => (
        <span className={['Thep2', 'Thep10', 'Kem'].includes(text) ? styles.underlineText : ''}>{text}</span>
      ),
      align: 'center',
    },
    {
      title: <span>{t('Material name')}</span>,
      dataIndex: 'tenvattu',
      key: 'tenvattu',
      width: 120,
      align: 'center',
    },
    {
      title: <span>{t('Unit')}</span>,
      dataIndex: 'donvi',
      key: 'donvi',
      width: 93,
      align: 'center',
    },
    {
      title: <span>{t('Approved quantity')}</span>,
      dataIndex: 'soluongduocduyet',
      key: 'soluongduocduyet',
      width: 197,
      align: 'center',
    },
    {
      title: <span>{t('Total quantity received')}</span>,
      dataIndex: 'tongsoluong',
      key: 'tongsoluong',
      width: 212,
      align: 'center',
    },
    {
      title: <span>{t('Quantity received this time')}</span>,
      dataIndex: 'soluongnhan',
      key: 'soluongnhan',
      width: 206,
      align: 'center',
    },
    {
      title: <span>{t('Quantity remaining')}</span>,
      dataIndex: 'soluongconlai',
      key: 'soluongconlai',
      width: 163,
      align: 'center',
    },
    {
      title: <span>{t('Quality Assessment (Warehouse Keeper)')}</span>,
      dataIndex: 'danhgia',
      key: 'danhgia',
      width: 265,
      align: 'center',
    },
    {
      title: <span>{t('Note')}</span>,
      dataIndex: 'ghichu',
      key: 'ghichu',
      width: 115,
      align: 'center',
    },
    {
      title: <span>{t('Commander confirmed')}</span>,
      dataIndex: 'chtxacnhan',
      key: 'chtxacnhan',
      render: (status: string) =>
        status === 'approved' ? (
          <CheckOutlined style={{ color: 'green' }} />
        ) : (
          <CloseOutlined style={{ color: 'red' }} />
        ),
      width: 148,
      fixed: 'right',
      align: 'center',
    },
    {
      title: <span>{t('Confirmation technique')}</span>,
      dataIndex: 'ktxacnhan',
      key: 'ktxacnhan',
      width: 176,
      render: (status: string) =>
        status === 'approved' ? (
          <CheckOutlined style={{ color: 'green' }} />
        ) : (
          <CloseOutlined style={{ color: 'red' }} />
        ),
      fixed: 'right',
      align: 'center',
    },
    {
      title: <span>{t('Image')}</span>,
      dataIndex: 'hinhanh',
      key: 'hinhanh',
      width: 112,
      fixed: 'right',
      align: 'center',
    },
  ];

  return (
    <div>
      <div id="div1">
        <Row>
          <Col span={24}>
            <Title level={3}>{t('Import warehouse goods')}</Title>
          </Col>
        </Row>
        <Form
          initialValues={{
            mavattu: 'DX2509_1',
            requestDate: moment('2023-08-24'),
          }}
        >
          <div className={styles.formContainer}>
            <Form.Item label={t('Material proposal code')} name="mavattu" className={styles.formItem}>
              <Input defaultValue="DX2509_1" />
            </Form.Item>
            <Form.Item label={t('Input day')} name="requestDate" className={styles.formItem}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </div>
        </Form>

        <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ x: 'max-content' }} />
      </div>

      <div id="div2" style={{ marginTop: 16 }}>
        <Button style={{ marginLeft: 1043, background: 'rgba(24, 144, 255, 1)', color: 'white' }}>
          {t('Save warehouse receipt')}
        </Button>
      </div>
    </div>
  );
};

export default ImportGoods;
