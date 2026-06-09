/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Button, Col, DatePicker, Form, Input, Radio, Row, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { accountingInvoice, eMaterialDocument, eSummaryScreen, IBaoXuatNhapTonData } from '@/common/define';
import { IBaoCaoXuatNhapTonDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getBaoCaoXuatNhapTon, getWareHouses } from '@/store/accountingInvoice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import styles from './SummaryScreen.module.css';

const initialFormValue: IBaoCaoXuatNhapTonDTO = {
  madvcs: 'THUCHIEN',
  tu_ngay: '',
  den_ngay: '',
  ma_kho: '',
  otherFilter: 'Release',
  tk_no: '',
  tk_co: ''
}

// [#20686][dung_lt][31/10/2024] - hàm tính tổng các cột trong table
const calculateTotals = (dataSource: IBaoXuatNhapTonData[]) => {
  let totalTonDau = 0;
  let totalDuDau = 0;
  let totalLuongNhap = 0;
  let totalTienNhap = 0;
  let totalLuongXuat = 0;
  let totalTienXuat = 0;
  let totalTonCuoi = 0;
  let totalDuCuoi = 0;

  dataSource.forEach(item => {
    totalTonDau += parseFloat(item.ton_dau || '0');
    totalDuDau += parseFloat(item.du_dau || '0');
    totalLuongNhap += parseFloat(item.luong_nhap || '0');
    totalTienNhap += parseFloat(item.tien_nhap || '0');
    totalLuongXuat += parseFloat(item.luong_xuat || '0');
    totalTienXuat += parseFloat(item.tien_xuat || '0');
    totalTonCuoi += parseFloat(item.ton_cuoi || '0');
    totalDuCuoi += parseFloat(item.du_cuoi || '0');
  });

  return {
    totalTonDau,
    totalDuDau,
    totalLuongNhap,
    totalTienNhap,
    totalLuongXuat,
    totalTienXuat,
    totalTonCuoi,
    totalDuCuoi,
  };
};
interface ISummaryScreen {
  type: eSummaryScreen;
  allowFilter?: boolean;
}
export default function SummaryScreen({ type, allowFilter = true }: ISummaryScreen) {
  const { t } = useTranslation();
  const tMaterial = useTranslation('material').t;
  const tDepot = useTranslation('depot').t;
  const BaoCaoXuatNhap = useAppSelector(getBaoCaoXuatNhapTon());
  const listWarehouse = useAppSelector(getWareHouses());
  const [totals, setTotals] = useState(calculateTotals([]));
  const isLoading = useAppSelector(getLoading(accountingInvoice.getBaoCaoXuatNhapTon));
  const [form] = Form.useForm(); // Tạo form
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(accountingInvoiceActions.setBaoCaoXuatNhapTon(undefined));
    dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
  }, []);

  useEffect(() => {
    if (BaoCaoXuatNhap) {
      const dataSource = BaoCaoXuatNhap.map((b, index) => ({ key: index, ...b }));
      // Calculate the totals
      setTotals(calculateTotals(dataSource));
    } else {
      setTotals(calculateTotals([]))
    }
  }, [BaoCaoXuatNhap])

  // [implement #21981]
  const formatNumber = (text: string) => {
    if (!text) return '';

    const num = parseFloat(text);

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });

    return formatter.format(num);
  };

  // [#20686][dung_lt][31/10/2024] - định nghĩa các column có trong table
  const columns: ColumnsType<IBaoXuatNhapTonData> = [
    {
      title: <span className={styles['header-bold']}>{tMaterial('Numerical order')}</span>,
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 70,
      className: styles.tablecell,
      render: (index) => <span className={styles.STT}>{index + 1}</span>,
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Warehouse code')}</span>,
      dataIndex: 'ma_kho',
      key: 'maKho',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: (text) => (text ? text : '')
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Material code')}</span>,
      dataIndex: 'ma_vt',
      key: 'maVatTu',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: (text) => (text ? text : '')
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Material name')}</span>,
      dataIndex: 'ten_vt',
      key: 'tenVatTu',
      align: 'center',
      width: 323,
      className: styles.tablecell,
      render: (text) => (text ? text : '')
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Unit of measure1')}</span>,
      dataIndex: 'dvt',
      key: 'dvt',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: (text) => (text ? text : '')
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Beginning Inventory')}</span>,
      dataIndex: 'ton_dau',
      key: 'tonDau',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Opening Balance')}</span>,
      dataIndex: 'du_dau',
      key: 'duDau',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Input Amount')}</span>,
      dataIndex: 'luong_nhap',
      key: 'luongNhap',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Input Cash')}</span>,
      dataIndex: 'tien_nhap',
      key: 'tienNhap',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Output Amount')}</span>,
      dataIndex: 'luong_xuat',
      key: 'luongXuat',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Output Cash')}</span>,
      dataIndex: 'tien_xuat',
      key: 'tienXuat',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Ending Inventory')}</span>,
      dataIndex: 'ton_cuoi',
      key: 'tonCuoi',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
    {
      title: <span className={styles['header-bold']}>{tMaterial('Ending Balance')}</span>,
      dataIndex: 'du_cuoi',
      key: 'duCuoi',
      align: 'center',
      width: 122,
      className: styles.tablecell,
      render: formatNumber
    },
  ];
  // [#20686][dung_lt][31/10/2024] - gửi form nhập trên UI về BE để lấy Báo cáo
  const onFinish = (values: IBaoCaoXuatNhapTonDTO) => {
    const formattedValues: IBaoCaoXuatNhapTonDTO = {
      ...values,
      tu_ngay: values.tu_ngay ? dayjs(values.tu_ngay).toISOString() : '',  // Format to ISO string
      den_ngay: values.den_ngay ? dayjs(values.den_ngay).toISOString() : ''  // Format to ISO string
    };

    dispatch(accountingInvoiceActions.getBaoCaoXuatNhapTon({
      params: {
        data: formattedValues
      }
    }));
  };


  return <>
    <section className={styles.form_depot_wrapper}>
      <Form
        form={form}
        layout="vertical"  // Set layout to vertical to place labels above the inputs
        onFinish={onFinish}
        initialValues={initialFormValue}
        hidden={!allowFilter}
      >
        {/* First row: Four input fields */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label={tDepot("Unit Code")}
              name="madvcs"
              rules={[{ required: true }]} // Validation rule
            >
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label={tDepot("From Date")}
              name="tu_ngay"
              rules={[{ required: true }]} // Validation rule
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label={tDepot("To Date")}
              name="den_ngay"
              rules={[{ required: true }]} // Validation rule
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label={tDepot("Depot Code")}
              name="ma_kho"
              rules={[{ required: true }]} // Validation rule
            >
              <Select showSearch>
                {listWarehouse.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.ma_kho}>
                    {warehouse.ma_kho}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {
          type === eSummaryScreen.TONGHOPVATTU && (
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={tDepot("Debit Account")}
                  name="tk_no"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={tDepot("Credit Account")}
                  name="tk_co"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          )
        }

        {/* Second row: Radio buttons */}
        <Row justify="center">
          <Col>
            <Form.Item name="otherFilter" wrapperCol={{ span: 24 }}>
              <Radio.Group>
                <Radio value={eMaterialDocument.RELEASE} style={{ margin: '0 16px' }}>
                  {tDepot("Data is based on approved (Released) documents.")}
                </Radio>
                <Radio value={eMaterialDocument.UNRELEASE} style={{ margin: '0 16px' }}>
                  {tDepot("Data is based on unapproved (Unreleased) documents.")}
                </Radio>
                <Radio value={eMaterialDocument.ALL} style={{ margin: '0 16px' }}>
                  {tDepot("Data is based on all documents, both approved (Released) and unapproved (Unreleased).")}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row justify='center'>
          <Button key="submit" style={{ width: '150px' }} type="primary" onClick={() => form.submit()}>
            {tDepot('Apply')}
          </Button>
          <Button key="cancel" style={{ width: '150px', marginLeft: '30px' }} onClick={() => form.resetFields()}>
            {tDepot('Cancel')}
          </Button>
        </Row>
      </Form>
    </section>
    <Table
      columns={columns}
      dataSource={BaoCaoXuatNhap?.map((b, index) => ({ key: index, ...b }))}
      className={styles.table}
      loading={isLoading}
      summary={() => (
        <Table.Summary fixed="bottom">
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={5}>
              <strong>{tDepot("Summary")}:</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="center">
              {totals.totalTonDau.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">
              {totals.totalDuDau.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="center">
              {totals.totalLuongNhap.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="center">
              {totals.totalTienNhap.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="center">
              {totals.totalLuongXuat.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="center">
              {totals.totalTienXuat.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="center">
              {totals.totalTonCuoi.toLocaleString('en-US')}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8} align="center">
              {totals.totalDuCuoi.toLocaleString('en-US')}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
      scroll={{ x: 1823, y: '44vh' }}
      size='middle'
      />

  </>;
};
