import React, { useCallback, useEffect } from 'react';

import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, DatePicker, Button, InputNumber, Divider, Row, Col, Typography, Table } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { mapFormToDto } from '../helpers';
import { FormatDateAPI, formatDateDisplay } from '@/common/define';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

// ---------------------------------------------------------

const { Title, Text } = Typography;

export interface Item {
  nature?: string;
  code?: string;
  name?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
  lineTotal?: number;
}

export interface InvoiceFormValues {
  seller: {
    templateNo?: string;
    invoiceNo: string;
    symbol: string;
    createdDate: Dayjs;
    publishDate?: Dayjs;
    sellerName?: string;
    taxCode: string;
    address?: string;
    bankAccount?: string;
    bankName?: string;
  };
  buyer: {
    buyerInfo?: string;
    buyerName?: string;
    buyerTaxCode?: string;
    buyerAddress?: string;
    identityCard?: string;
    email?: string;
    buyerPaymentMethod?: string;
    buyerTaxAuthorityCode?: string;
  };
  items: Item[];
  totalWithoutTax?: number;
  totalVat?: number;
  totalFee?: number;
  totalDiscount?: number;
  grandTotal?: number;
}

export default function EditInvoiceX(): React.JSX.Element {
  const { t } = useTranslation('finance');
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<InvoiceFormValues>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const invoiceId = Utils.ParseNumber(searchParams.get('id'));
  const currentInvoiceX = useAppSelector(s => s.accountingInvoice.currentInvoiceX);
  const isEdit = invoiceId > 0;

  useEffect(() => {
    if (isEdit) {
      dispatch(accountingInvoiceActions.GetInvoiceXById({ id: invoiceId }));
    }
  }, [dispatch, invoiceId]);

  const parseDate = (dateValue: any) => {
    if (!dateValue) return undefined;

    if (dayjs.isDayjs(dateValue)) return dateValue;

    if (dateValue instanceof Date) return dayjs(dateValue);

    if (typeof dateValue === 'string') {
      return dayjs(dateValue, FormatDateAPI);
    }

    return undefined;
  };

  useEffect(() => {
    if (isEdit && currentInvoiceX) {
      form.setFieldsValue({
        seller: {
          templateNo: currentInvoiceX.ban_MauSo,
          invoiceNo: currentInvoiceX.ban_SoHoaDon,
          symbol: currentInvoiceX.ban_KyHieu,
          createdDate: parseDate(currentInvoiceX.ban_NgayLap),
          publishDate: parseDate(currentInvoiceX.ban_NgayKyPhatHanh),
          sellerName: currentInvoiceX.ban_TenNguoiBan,
          taxCode: currentInvoiceX.ban_MaSoThue,
          address: currentInvoiceX.ban_DiaChiCongTy,
          bankAccount: currentInvoiceX.ban_TaiKhoan,
          bankName: currentInvoiceX.ban_NganHang,
        },
        buyer: {
          buyerInfo: currentInvoiceX.mua_NguoiMuaHang,
          buyerName: currentInvoiceX.mua_TenNguoiMua,
          buyerTaxCode: currentInvoiceX.mua_MaSoThue,
          buyerAddress: currentInvoiceX.mua_DiaChi,
          identityCard: currentInvoiceX.mua_CCCD,
          email: currentInvoiceX.mua_Email,
          buyerPaymentMethod: currentInvoiceX.hinhThucThanhToan,
          buyerTaxAuthorityCode: currentInvoiceX.maCoQuanThue,
        },
        items: currentInvoiceX.vatInvoiceDetails
          ? currentInvoiceX.vatInvoiceDetails.map(d => ({
              nature: d.tinhChat,
              code: d.maHangHoaDichVu,
              name: d.tenHangHoaDichVu,
              unit: d.donViTinh,
              quantity: d.soLuong,
              unitPrice: d.donGia,
              discount: d.chietKhau,
              taxRate: d.thueSuat,
              lineTotal: d.thanhTienChuaThueGTGT,
            }))
          : [],
        totalWithoutTax: currentInvoiceX.tongTienChuaThue,
        totalVat: currentInvoiceX.tongTienThueGTGT,
        totalFee: currentInvoiceX.tongTienPhi,
        totalDiscount: currentInvoiceX.tongTienChietKhau,
        grandTotal: currentInvoiceX.tongTienThanhToan,
      });
    } else {
      form.resetFields();
    }

  }, [currentInvoiceX, form, isEdit]);

  const recalcTotals = useCallback(
    (allValues: InvoiceFormValues) => {
      const items = (allValues.items || []).map(item => {
        const quantity = item.quantity ?? 0;
        const unitPrice = item.unitPrice ?? 0;
        const discount = item.discount ?? 0;
        const lineTotal = quantity * unitPrice - discount;
        return { ...item, lineTotal };
      });

      const totalWithoutTax = items.reduce((sum, it) => sum + (it.lineTotal ?? 0), 0);
      const totalDiscount = items.reduce((sum, it) => sum + (it.discount ?? 0), 0);
      const totalVat = items.reduce((sum, it) => {
        const rate = it.taxRate ?? 0;
        return sum + ((it.lineTotal ?? 0) * rate) / 100;
      }, 0);

      const totalFee = allValues.totalFee ?? 0;
      const grandTotal = totalWithoutTax + totalVat + totalFee;

      form.setFieldsValue({
        items,
        totalWithoutTax,
        totalDiscount,
        totalVat,
        grandTotal,
      });
    },
    [form],
  );

  const handleSubmit = useCallback(
    (values: InvoiceFormValues) => {
      const dto = mapFormToDto(values, invoiceId ?? 0);

      if (invoiceId && invoiceId > 0) {
        dispatch(accountingInvoiceActions.UpdateInvoiceX({ id: invoiceId, data: dto }));
      } else {
        dispatch(accountingInvoiceActions.CreateInvoiceX({ data: dto }));
      }
    },
    [dispatch, invoiceId],
  );

  return (
    <div style={{ backgroundColor: '#fff', padding: '8px 16px' }}>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: '100%', margin: '0 auto' }}
        initialValues={{
          seller: {
            ...(!isEdit && { createdDate: dayjs() }),
          },
          buyer: {
            buyerName: 'Công ty Cổ phần Xây dựng Thương mại Nam Việt Hùng',
            buyerTaxCode: '0401342554',
            buyerAddress: 'K30/09 Trường Sơn, phường Hòa Thọ Tây, quận Cẩm Lệ, Tp.Đà Nẵng',
          },
          items: [{}],
          totalFee: 0,
        }}
        onValuesChange={(_, allValues) => recalcTotals(allValues as InvoiceFormValues)}
        onFinish={handleSubmit}
        onFinishFailed={info => {
        }}
      >
        <Button
          style={{ padding: 0, margin: 0 }}
          type="link"
          icon={<LeftOutlined />}
          onClick={() => navigate('/management-accounting/invoice-x')}
        >
          {t('Back')}
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={4} style={{ margin: 0, padding: 0 }}>
            {invoiceId && invoiceId > 0 ? `${t('Edit invoice')}` : `${t('Create new invoice')}`}
          </Title>

          <Button type="primary" htmlType="submit">
            {t('Save')}
          </Button>
        </div>

        <Divider style={{ margin: 16 }} />

        {/* Seller */}
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item label="Mẫu số" name={['seller', 'templateNo']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Số hoá đơn"
              name={['seller', 'invoiceNo']}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ký hiệu" name={['seller', 'symbol']} rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ngày lập" name={['seller', 'createdDate']}>
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ngày hoá đơn" name={['seller', 'publishDate']} rules={[{ required: true, message: 'Bắt buộc' }]}>
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={4}>
            <Form.Item label="Tên người bán" name={['seller', 'sellerName']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Mã số thuế người bán"
              name={['seller', 'taxCode']}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Tài khoản" name={['seller', 'bankAccount']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ngân hàng" name={['seller', 'bankName']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Địa chỉ" name={['seller', 'address']}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Buyer */}
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item label="Người mua hàng" name={['buyer', 'buyerInfo']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Tên người mua" name={['buyer', 'buyerName']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Mã số thuế" name={['buyer', 'buyerTaxCode']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="CCCD" name={['buyer', 'identityCard']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Email" name={['buyer', 'email']}>
              <Input type="email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Form.Item label="Địa chỉ người mua" name={['buyer', 'buyerAddress']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Hình thức thanh toán" name={['buyer', 'buyerPaymentMethod']}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Mã cơ quan thuế" name={['buyer', 'buyerTaxAuthorityCode']}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng hoá */}
        <Form.List name="items">
          {(fields, { add, remove }) => {
            const itemColumns = [
              {
                title: 'Tính chất',
                dataIndex: 'nature',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item name={[field.name, 'nature']} style={{ marginBottom: 0 }}>
                    <Input />
                  </Form.Item>
                ),
              },
              {
                title: 'Mã hàng hoá',
                dataIndex: 'code',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item name={[field.name, 'code']} style={{ marginBottom: 0 }}>
                    <Input />
                  </Form.Item>
                ),
              },
              {
                title: (
                  <>
                    <span style={{ color: 'red' }}>*</span>&nbsp;Tên hàng hoá
                  </>
                ),
                dataIndex: 'name',
                width: 200,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, 'name']}
                    rules={[{ required: true, message: 'Bắt buộc' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input />
                  </Form.Item>
                ),
              },
              {
                title: (
                  <>
                    <span style={{ color: 'red' }}>*</span>&nbsp;ĐVT
                  </>
                ),
                dataIndex: 'unit',
                width: 100,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, 'unit']}
                    rules={[{ required: true, message: 'Bắt buộc' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input />
                  </Form.Item>
                ),
              },
              {
                title: (
                  <>
                    <span style={{ color: 'red' }}>*</span>&nbsp;Số lượng
                  </>
                ),
                dataIndex: 'quantity',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, 'quantity']}
                    rules={[{ required: true, message: 'Bắt buộc' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber<number>
                      style={{ width: '100%' }}
                      formatter={v => (v == null ? '' : Number(v).toLocaleString('en-US'))}
                      parser={v => (v == null || v === '' ? 0 : Number(v.replace(/,/g, '')))}
                    />
                  </Form.Item>
                ),
              },
              {
                title: (
                  <>
                    <span style={{ color: 'red' }}>*</span>&nbsp;Đơn giá
                  </>
                ),
                dataIndex: 'unitPrice',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, 'unitPrice']}
                    rules={[{ required: true, message: 'Bắt buộc' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber<number>
                      style={{ width: '100%' }}
                      formatter={v => (v == null ? '' : Number(v).toLocaleString('en-US'))}
                      parser={v => (v == null || v === '' ? 0 : Number(v.replace(/,/g, '')))}
                    />
                  </Form.Item>
                ),
              },
              {
                title: 'Chiết khấu',
                dataIndex: 'discount',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item name={[field.name, 'discount']} style={{ marginBottom: 0 }}>
                    <InputNumber<number>
                      style={{ width: '100%' }}
                      formatter={v => (v == null ? '' : Number(v).toLocaleString('en-US'))}
                      parser={v => (v == null || v === '' ? 0 : Number(v.replace(/,/g, '')))}
                    />
                  </Form.Item>
                ),
              },
              {
                title: (
                  <>
                    <span style={{ color: 'red' }}>*</span>&nbsp;Thuế suất
                  </>
                ),
                dataIndex: 'taxRate',
                width: 120,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, 'taxRate']}
                    rules={[{ required: true, message: 'Bắt buộc' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                ),
              },
              {
                title: 'Thành tiền chưa thuế GTGT',
                dataIndex: 'lineTotal',
                width: 180,
                render: (_: any, field: any) => {
                  const val = form.getFieldValue(['items', field.name, 'lineTotal']);
                  return <Text>{val?.toLocaleString('en-US')}</Text>;
                },
              },
              {
                title: '',
                dataIndex: 'actions',
                fixed: 'right' as const,
                width: 60,
                render: (_: any, field: any) =>
                  fields.length > 1 ? (
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  ) : null,
              },
            ];

            return (
              <>
                <Table
                  dataSource={fields}
                  columns={itemColumns}
                  pagination={false}
                  scroll={{ x: 1250, y: 270 }}
                  bordered
                  rowHoverable={false}
                />

                <Row style={{ marginTop: 16 }}>
                  <Button
                    type="default"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({
                        key: Date.now(),
                        quantity: 0,
                        unitPrice: 0,
                        discount: 0,
                        taxRate: 0,
                      })
                    }
                  >
                    {t('Add new product')}
                  </Button>
                </Row>
              </>
            );
          }}
        </Form.List>

        <Divider style={{ margin: 16 }} />

        {/* Totals */}
        <Row gutter={16}>
          <Col span={5}>
            <Form.Item label={<Typography.Text strong>Tổng tiền chưa thuế</Typography.Text>} name="totalWithoutTax">
              <InputNumber
                disabled
                style={{ width: '100%', fontWeight: 'bold' }}
                formatter={value => {
                  if (value == null || value === '') return '';

                  const num = typeof value === 'string' ? Number(value) : value;
                  return num.toLocaleString('en-US');
                }}
                parser={value => value?.replace(/,/g, '') ?? ''}
                className="bold-input-value"
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label={<Typography.Text strong>Tổng tiền thuế</Typography.Text>} name="totalVat">
              <InputNumber
                disabled
                style={{ width: '100%', fontWeight: 'bold' }}
                formatter={value => {
                  if (value == null || value === '') return '';

                  const num = typeof value === 'string' ? Number(value) : value;
                  return num.toLocaleString('en-US');
                }}
                parser={value => value?.replace(/,/g, '') ?? ''}
                className="bold-input-value"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={<Typography.Text strong>Nhập tổng tiền phí</Typography.Text>} name="totalFee">
              <InputNumber
                min={0}
                style={{ width: '100%', fontWeight: 'bold' }}
                formatter={value => {
                  if (value == null) return '';

                  const num = typeof value === 'string' ? Number(value) : value;
                  return num.toLocaleString('en-US');
                }}
                className="bold-input-value"
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label={<Typography.Text strong>Tổng tiền chiết khấu</Typography.Text>} name="totalDiscount">
              <InputNumber
                disabled
                style={{ width: '100%', fontWeight: 'bold' }}
                formatter={value => {
                  if (value == null || value === '') return '';

                  const num = typeof value === 'string' ? Number(value) : value;
                  return num.toLocaleString('en-US');
                }}
                parser={value => value?.replace(/,/g, '') ?? ''}
                className="bold-input-value"
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label={<Typography.Text strong>Tổng tiền thanh toán</Typography.Text>} name="grandTotal">
              <InputNumber
                disabled
                style={{ width: '100%'}}
                formatter={value => {
                  if (value == null || value === '') return '';

                  const num = typeof value === 'string' ? Number(value) : value;
                  return num.toLocaleString('en-US');
                }}
                parser={value => value?.replace(/,/g, '') ?? ''}
                className="bold-input-value"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
