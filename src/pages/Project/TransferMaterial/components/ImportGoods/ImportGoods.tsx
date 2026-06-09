/* eslint-disable import/order */
import { ChiTietHangHoaDieuChuyenDTO, PhieuDieuChuyenDTO } from '@/services/AccountingInvoiceService';
import { getProducts } from '@/store/accountingInvoice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImportGoods.module.css';

const { Title } = Typography;

interface ImportGoodsProps {
  dieuchuyen: PhieuDieuChuyenDTO;
  onClose: () => void; // Thêm định nghĩa cho onClose
}

const ImportGoods: React.FC<ImportGoodsProps> = ({ dieuchuyen, onClose }) => {
  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();
  const data = dieuchuyen.chiTietHangHoa;
  const productList = useAppSelector(getProducts());
  const [form] = Form.useForm(); // Sử dụng Form.useForm để quản lý form

  const [chiTietHangHoa, setChiTietHangHoa] = useState<ChiTietHangHoaDieuChuyenDTO[]>([]);
  const [soluongnhanValues, setSoluongnhanValues] = useState<{ [key: string]: string }>({});
  const [ktxacnhanStatus, setKtxacnhanStatus] = useState<{ [key: string]: boolean }>({});
  const [chtxacnhanStatus, setChtxacnhanStatus] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    const updatedData = data.map((item: any) => {
      const product = productList.find((p) => p.ma_vt === item.ma_vt);
      return {
        ...item,
        name: product?.ten_vt || '',
        unit: product?.dvt || '',
        soluong:item.so_luong,
        id:item.ma_vt,
        key: item.ma_vt,
      };
    });
    setChiTietHangHoa(updatedData);
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, productList]);


  const handleSoluongnhanChange = (key: string, value: string) => {
    setSoluongnhanValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const toggleKtxacnhan = (key: string) => {
    setKtxacnhanStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };

  const toggleChtxacnhan = (key: string) => {
    setChtxacnhanStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };

  const columns: ColumnsType<ChiTietHangHoaDieuChuyenDTO> = [
    {
      title: <span>{t('Material code')}</span>,
      dataIndex: 'ma_vt',
      key: 'mavattu',
      width: 150,
      align: 'center',
    },
    {
      title: <span>{t('Material name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 250,
      align: 'center',
    },
    {
      title: <span>{t('Unit')}</span>,
      dataIndex: 'unit',
      key: 'unit',
      width: 93,
      align: 'center',
    },
    {
      title: <span>{t('unit')}</span>,
      dataIndex: 'soluong',
      key: 'soluong',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Total quantity received')}</span>,
      dataIndex: 'tongsoluong',
      key: 'tongsoluong',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Quantity received this time')}</span>,
      dataIndex: 'soluongnhan',
      key: 'soluongnhan',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => (
        <Input
          value={soluongnhanValues[record.key] || ''}
          onChange={(e) => handleSoluongnhanChange(record.key, e.target.value)}
        />
      ),
    },
    {
      title: <span>{t('Quantity remaining')}</span>,
      dataIndex: 'soluongconlai',
      key: 'soluongconlai',
      width: 100,
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
      render: (_: any, record: any) => (
        <Button
          icon={
            chtxacnhanStatus[record.key] ? (
              <CheckOutlined style={{ color: 'green' }} />
            ) : (
              <CloseOutlined style={{ color: 'red' }} />
            )
          }
          onClick={() => toggleChtxacnhan(record.key)}
        />
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
      render: (_: any, record: any) => (
        <Button
          icon={
            ktxacnhanStatus[record.key] ? (
              <CheckOutlined style={{ color: 'green' }} />
            ) : (
              <CloseOutlined style={{ color: 'red' }} />
            )
          }
          onClick={() => toggleKtxacnhan(record.key)}
        />
      ),
      fixed: 'right',
      align: 'center',
    },
  ];

  const handleSave = () => {
    form.validateFields().then(values => {
      const formData = {
        madvcs: 'THUCHIEN',
        ma_kh: dieuchuyen.ma_kh,
        ma_ct: 'PNKTP',
        so_ct: '',
        ma_nt: 'VND',
        nguoi_tt: dieuchuyen.nguoi_tt, 
        guidRelation: '',
        dien_giai: values.dien_giai, // Lấy giá trị từ form
        ngay_ct: values.ngay_ct ? values.ngay_ct.format('YYYY-MM-DDTHH:mm:ss') : '',// Lấy giá trị từ form
        chiTietHangHoa: chiTietHangHoa.map(item => ({
          ma_vt: item.ma_vt,
          ma_kho: item.ma_kho,
          so_luong: item.so_luong,
          ma_kho1: '',
          dien_giai: item.dien_giai,
          createDate: dayjs().toISOString(),
          guidRelation: '',
        })),
        list_of_extensions: [],
        chiTietDeNghiMuaHang: [],
        hoaDonVAT: [],
      };
    
      // Gọi API để lưu thông tin
      console.log('Form Data:', formData);

      // dispatch(accountingInvoiceActions.CreatePhieuDieuChuyen({ data: formData}));
      onClose(); // Gọi hàm onClose để tắt modal
    }).catch(errorInfo => {
      console.log('Validate Failed:', errorInfo);
    });
  };

  return (
    <div>
      <div id="div1">
        <Row>
          <Col span={24}>
            <Title level={3}>{t('Import warehouse goods')}</Title>
          </Col>
        </Row>
        <Form form={form}> {/* Sử dụng form instance */}
          <Row gutter={50}>
            <Col span={24} md={5}>
              <Form.Item label={t('Mã phiếu nhập kho')} name="ma_ct" className={styles.formItem}>
                <Input defaultValue="PNKTP" readOnly/>
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item label={t('Diễn giải')} name="dien_giai" className={styles.formItem}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} md={7}>
              <Form.Item label={t('Input day')} name="ngay_ct" className={styles.formItem}>
                <DatePicker format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table dataSource={chiTietHangHoa} columns={columns} pagination={false} scroll={{ x: 'max-content', y: '45vh' }} />
      </div>
      <Row gutter={24} style={{ marginTop: 16 }}  >
        <Col span={24} md={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>  
          <Button style={{  background: 'rgba(24, 144, 255, 1)', color: 'white' }} onClick={handleSave}>
            {t('Save warehouse receipt')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ImportGoods;