/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { accountingInvoice, FormatDateAPI, madvcs } from '@/common/define';
import { maKhoTongMM, maKhoTongVT } from '@/environment';
import { ChiTietHangHoaDieuChuyenDTO, PhieuDieuChuyenDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getProducts, getTypeDieuChuyen, getWareHouses } from '@/store/accountingInvoice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import { DeleteOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Col, DatePicker, Form, Input, message, Row, Select, Table, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styles from './NewTranMaterials.module.less';

const { Option } = Select;
const { Title } = Typography;

interface NewTranMaterialsProps {
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  wh: string;
}

const NewTranMaterials: React.FC<NewTranMaterialsProps> = ({ setIsModalVisible, wh }) => {

  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();
  const DanhSachVatTu = useAppSelector(getProducts());
  const wareHouses = useAppSelector(getWareHouses());
  const DanhSachMayMoc = DanhSachVatTu.filter(vt => vt.productType === 2);
  const DanhSachVatTuChinh = DanhSachVatTu.filter(vt => vt.productType === 1);
  const DanhSachVatTuPhu = DanhSachVatTu.filter(vt => vt.productType === 0);
  const typeDieuChuyen = useAppSelector(getTypeDieuChuyen());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const employee = useAppSelector((state: RootState) => state.app.selectedEmployeeDetails);
  const selectedProject = useAppSelector(getSelectedProject());
  const currentWarehouseCode = (selectedProject && projectwareHouses && projectwareHouses.length > 0)
    ? projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode || maKhoTongMM
    : maKhoTongVT;
  const currentUserName = employee ? `${employee.lastName} ${employee.middleName} ${employee.firstName}` : '';
  const Tonkho = useAppSelector((state: RootState) => state.accountingInvoice.Tonkho);
  const isLoading = useAppSelector(getLoading(accountingInvoice.GetTonKho));
  const TonkhoByProduct = useAppSelector((state: RootState) => state.accountingInvoice.TonkhobyProduct);
  const [codeList, setCodeList] = useState<string[]>([])
  // Thêm state mới để lưu trữ giá trị của người thực hiện
  const [nguoiThucHien, setNguoiThucHien] = useState(currentUserName);
  const [dataSource, setDataSource] = useState<any[]>([
    {
      key: '1', // Đảm bảo rằng hàng đầu tiên có key
      code: '',
      name: '',
      dvt: '',
      unit: '',
      ma_kho: '',
      dien_giai: ''
    }
  ]);

  const [dataModifying, setDataModifying] = useState<any>({});
  const [ngayCt, setNgayCt] = useState(dayjs());
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [TonKhoByGroup, setTonKhoByGroup] = useState<any[]>([]);
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    ma_kh: currentWarehouseCode,
    nguoi_tt: currentUserName,
    dien_giai: '',
    chiTietHangHoa: [
      {
        ma_vt: '',
        so_luong: '',
        dien_giai: '',
        ma_kho1: ''
      }
    ],
    hoaDonVAT: [],
    list_of_extensions: [],
    chiTietDeNghiMuaHang: []
  });

  const validateForm = () => {
    const isValid = formData.nguoi_tt && formData.dien_giai && dataSource.every(item => item.code);
    setIsSubmitDisabled(!isValid);
  };


  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, dataSource]);

  useEffect(() => {
    setCodeList(dataSource.map(item => item.code));
  }, [dataSource]);

  useEffect(() => {
    GetTonKho(codeList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeList]);

  useEffect(() => {
    if (Array.isArray(TonkhoByProduct)) {
      const groupedData = Object.values(
        TonkhoByProduct.reduce((acc, item) => {
          if (!acc[item.ma_vt]) {
            acc[item.ma_vt] = [];
          }
          acc[item.ma_vt].push(item);
          return acc;
        }, {} as Record<string, any[]>)
      );
      setTonKhoByGroup(groupedData);
    } else {
      setTonKhoByGroup([]);
    }
  }, [TonkhoByProduct]);

  const GetTonKho = (_codes: string[]) => {
    const codes = [..._codes];

    dispatch(
      accountingInvoiceActions.GetTonKhoByProduct({
        data: {
          madvcs: madvcs.THUCHIEN,
          danhSachMaHang: codes,
          ngay_kiem_tra: dayjs().format(FormatDateAPI),
          danhSachMakho: [],
        },
        params: {},
      }),
    );
  };
  useEffect(() => {
    setFormData({
      ma_kh: '',
      nguoi_tt: currentUserName,
      dien_giai: '',
      chiTietHangHoa: [{ ma_vt: '', so_luong: '', dien_giai: '', ma_kho1: '' }],
      hoaDonVAT: [],
      list_of_extensions: [],
      chiTietDeNghiMuaHang: []
    });
    setDataSource([{
      key: '1',
      code: '',
      name: '',
      dvt: '',
      unit: '',
      ma_kho: '',
      dien_giai: ''
    }]);

    setNgayCt(dayjs());
  }, [typeDieuChuyen]);

  const getOptionsByType = () => {
    switch (typeDieuChuyen) {
      case 'VatTuChinh':
        return DanhSachVatTuChinh;
      case 'VatTuPhu':
        return DanhSachVatTuPhu;
      case 'MayMoc':
        return DanhSachMayMoc;
      default:
        return [];
    }
  };
  const renderEditableCell = (text: any, record: any, field: string) => {

    if (field === 'code') {
      const options = getOptionsByType().map(m => ({
        value: m.ma_vt,     // Dữ liệu trả về (ma_vt)
        label: `${m.ma_vt} / ${m.ten_vt}`,    // Hiển thị trong danh sách (ten_vt)
      }));

      return (
        <AutoComplete
          options={options}
          value={text}
          popupMatchSelectWidth={false}
          onSelect={(ma_vt) => {
            const selectedProduct = getOptionsByType().find(v => v.ma_vt === ma_vt);
            if (selectedProduct) {
              record.name = selectedProduct.ten_vt;
              record.dvt = selectedProduct.dvt;
            } else {
              record.name = '';
              record.dvt = '';
            }
            record[field] = ma_vt;
            setDataSource([...dataSource]);
            validateForm();
          }}
          onChange={(value) => {
            if (!value) {
              record.name = '';
              record.dvt = '';
            }
            record[field] = value;
            setDataSource([...dataSource]);
            validateForm();
          }}
          filterOption={(inputValue, option) => {
            // Tìm theo mã vật tư (ma_vt)
            const item = getOptionsByType().find(v => v.ma_vt === option?.value);
            return item?.ma_vt.toLowerCase().includes(inputValue.toLowerCase()) 
            ||option!.label.toLowerCase().includes(inputValue.toLowerCase())
            || false;
          }}
          style={{ width: '100%' }}
        />
      );
    }
    if (field === 'name') {
      const options = getOptionsByType().map(m => ({ value: m.ma_vt, label: `${m.ma_vt} / ${m.ten_vt}` }));
      
      return (
        <AutoComplete
          options={options}
          value={text}
          popupMatchSelectWidth={false}
          onSelect={(value) => {
            const selectedProduct = getOptionsByType().find(v => v.ma_vt === value);
            if (selectedProduct) {
              record.code = selectedProduct.ma_vt;
              record.name = selectedProduct.ten_vt;
              record.dvt = selectedProduct.dvt;
            } else {
              record.code = '';
              record.name = '';
              record.dvt = '';
            }
            record[field] = record.name || value;
            setDataSource([...dataSource]);
            validateForm();
          }}
          onChange={(value) => {
            if (!value) {
              record.code = '';
              record.dvt = '';
            }
            record[field] = value;
            setDataSource([...dataSource]);
            validateForm();
          }}
          filterOption={(inputValue, option) => {

            const item = getOptionsByType().find(v => v.ma_vt === option?.value);
            return item?.ten_vt.toLowerCase().includes(inputValue.toLowerCase()) 
                  ||option!.label.toLowerCase().includes(inputValue.toLowerCase())
                  || false;
          }
          }
          style={{ width: '100%' }}
        />
      );
    }
    if (field === 'makho1') {
      const filteredWarehouses = typeDieuChuyen === 'MayMoc'
        ? wareHouses.filter(k => k.ma_kho.includes('CCDC'))
        : wareHouses.filter(k => !k.ma_kho.includes('CCDC'));
      const matchedGroup = TonKhoByGroup.find(group =>
        group.length > 0 && group[0].ma_vt === record.code
      ) || [];

      const options = filteredWarehouses.map(warehouse => ({
        value: warehouse.ma_kho,
        label: `${warehouse.ten_kho}`,
      }));
      // console.log(options);
      return (
        <AutoComplete
          options={options}
          popupMatchSelectWidth={false}
          defaultValue={text}
          onSelect={(value) => {
            record.tonkho = matchedGroup.find((item: any) => item.ma_kho === value)?.luong_ton || 0;
            record[field] = value;
            setDataSource([...dataSource]); // Cập nhật lại dataSource để re-render
            validateForm(); // Kiểm tra dữ liệu sau khi thay đổi
          }}
          onChange={(value) => {
            if (!value) {
              record.tonkho = 0; // Xóa tồn kho khi mã kho bị xóa
            }
            record[field] = value;
            setDataSource([...dataSource]); // Cập nhật lại dataSource để re-render
            validateForm(); // Kiểm tra dữ liệu sau khi thay đổi
          }}
          filterOption={(inputValue, option) => {
            return typeof option?.label === 'string' && option.label.toLowerCase().includes(inputValue.toLowerCase())
          }
          }

          style={{ width: '100%' }}
        />
      );
    }
    if (field === 'unit') {
      return (
        <>
          <Input
            type="number"
            min={0}
            value={record[field] !== undefined && record[field] !== null ? record[field] : ''}  // Hiển thị số hoặc rỗng
            onChange={(e) => {
              const value = e.target.value;
              const maxQuantity = record.tonkho || 0;
              // Xử lý khi input bị xóa hết giá trị
              if (value === '') {
                record[field] = undefined;  // Đặt giá trị của record về undefined khi xóa
                setDataSource([...dataSource]);  // Cập nhật lại dataSource
                validateForm();  // Kiểm tra dữ liệu sau khi thay đổi
                return;
              }

              const parsedValue = parseFloat(value);
              if (!isNaN(parsedValue)) {
                // if (parsedValue > maxQuantity) {
                //   record[field] = maxQuantity;  // Đặt lại giá trị về lượng tồn tối đa
                //   setErrorMessages(prev => ({ ...prev, [record.key]: 'Số lượng vượt quá số lượng tồn kho' })); // Thêm thông báo lỗi
                // } else {
                record[field] = parsedValue;  // Cập nhật giá trị hợp lệ
                setErrorMessages(prev => ({ ...prev, [record.key]: '' })); // Xóa thông báo lỗi
                // }
                // const groupedItems = dataSource.reduce((acc, item) => {
                //   const key = `${item.code}-${item.makho1}`; // Tạo key dựa trên mã vật tư và mã kho
                //   if (!acc[key]) {
                //     acc[key] = { totalQuantity: 0, tonkho: item.tonkho };
                //   }
                //   acc[key].totalQuantity += item.unit || 0; // Cộng dồn số lượng nhập
                //   return acc;
                // }, {} as Record<string, { totalQuantity: number; tonkho: number }>);

                // for (const key in groupedItems) {
                //   const { totalQuantity, tonkho } = groupedItems[key];
                //   if (totalQuantity > tonkho) {
                //     setErrorMessages(prev => ({ ...prev, [record.key]: `Tổng số lượng vượt nhập quá số lượng tồn kho.` }));;
                //   }
                // }

                setDataSource([...dataSource]);  // Cập nhật lại dataSource để re-render
                validateForm();  // Kiểm tra dữ liệu sau khi thay đổi
              }
            }}

          />
          {errorMessages[record.key] && (
            <div style={{ color: 'red' }}>{errorMessages[record.key]}</div>
          )}
        </>
      );
    }
    return (
      <Input
        defaultValue={text}
        onChange={(e) => {
          record[field] = e.target.value;
          setDataSource([...dataSource]); // Cập nhật lại dataSource để re-render
          validateForm(); // Kiểm tra dữ liệu sau khi thay đổi
        }}
      />
    );
  };
  const columns: ColumnType<(typeof dataSource)[0]>[] = [
    {
      title: <span>{t('Material code')}</span>,
      dataIndex: 'code',
      key: 'code',
      width: 200, // Tăng độ rộng của ô mã vật tư
      render: (text, record) => renderEditableCell(text, record, 'code'),
      align: 'center',
    },
    {
      title: <span>{t('Material name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 200,
      align: 'center',
      render: (text, record) => renderEditableCell(text, record, 'name'),
    },
    {
      title: <span>{t('dvt')}</span>,
      dataIndex: 'dvt',
      key: 'dvt',
      width: 93,
      align: 'center',
      render: (text, record) => <span>{record.dvt}</span>,
    },
    {
      title: <span>{t('Công trình điều chuyển')}</span>,
      dataIndex: 'makho1',
      key: 'makho1',
      width: 200, // Tăng độ rộng của ô mã vật tư
      render: (text, record) => renderEditableCell(text, record, 'makho1'),
      align: 'center',
    },
    {
      title: <span>{t('Tồn kho')}</span>,
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 90, // Tăng độ rộng của ô mã vật tư
      render: (text, record) => <span>{record.tonkho}</span>,
      align: 'center',
    },
    {
      title: <span>{t('unit')}</span>,
      dataIndex: 'unit',
      key: 'unit',
      width: 157,
      render: (text, record) => renderEditableCell(text, record, 'unit'),
      align: 'center',
    },
    {
      title: <span>{t('Project received transfer')}</span>,
      dataIndex: 'ma_kho',
      key: 'ma_kho',
      width: 250,
      render: (text, record) => {
        const filteredWarehouses = typeDieuChuyen === 'MayMoc'
          ? wareHouses.filter(k => k.ma_kho.includes('CCDC'))
          : wareHouses.filter(k => !k.ma_kho.includes('CCDC'));

        const options = filteredWarehouses.map(warehouse => ({
          value: warehouse.ma_kho,
          label: `${warehouse.ten_kho}`,
        }));

        const handleChange = (value: string) => {
          const selectedWarehouse = filteredWarehouses.find(warehouse => warehouse.ten_kho === value);
          const newMaKho = selectedWarehouse?.ma_kho || '';

          if (record.makho1 && newMaKho === record.makho1) {
            // message.warning('Công trình điều chuyển và công trình nhận điều chuyển không được trùng nhau');
            record.ma_kho = '';
            record.ten_kho = '';
          } else {
            record.ma_kho = newMaKho;
            record.ten_kho = value;
          }
          setDataSource([...dataSource]);
          validateForm();
        };

        const handleSelect = (value: string, option: any) => {
          if (record.makho1 && value === record.makho1) {
            message.warning('Công trình điều chuyển và công trình nhận điều chuyển không được trùng nhau');
            record.ma_kho = '';
            record.ten_kho = '';
          } else {
            record.ma_kho = value;
            record.ten_kho = option.label;
          }
          setDataSource([...dataSource]);
          validateForm();
        };

        return (
          <AutoComplete
            options={options}
            popupMatchSelectWidth={false}
            value={record.ten_kho}
            onSelect={handleSelect}
            onChange={handleChange}
            filterOption={(inputValue, option) =>
              option!.label.toUpperCase().includes(inputValue.toUpperCase())
            }
            style={{ width: '100%' }}
          />
        );
      },
      align: 'center',
    },
    {
      title: <span>{t('interpretation')}</span>,
      dataIndex: 'dien_giai',
      key: 'dien_giai',
      width: 157,
      render: (text, record) => renderEditableCell(text, record, 'dien_giai'),
      align: 'center',
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: any) => {
        const showDelete = record.key && record.key !== 'summary'; // Loại bỏ điều kiện startsWith
        return (
          showDelete ? (
            <DeleteOutlined
              onClick={() => {
                removeItem(record.key);
              }}
              style={{ fontSize: '18px', color: '#FF0000', border: 'none' }}
            />
          ) : null
        );
      },
    },
  ];

  const removeItem = (key: string) => {
    setDataSource((prevDataSource: any[]) => {
      const newDataModifying = { ...dataModifying };
      delete newDataModifying[key];
      setDataModifying(newDataModifying); // Cập nhật state dataModifying
      return prevDataSource.filter((i) => i.key !== key);
    });
  };

  const addNewRow = () => {
    const newRow: any = {
      key: (dataSource.length + 1).toString(), // Đảm bảo key là duy nhất
      code: '',
      name: '',
      dvt: '',
      unit: '',
      ma_kho: '',
      dien_giai: ''
    };
    setDataSource([...dataSource, newRow]);
  };

  const handleSubmit = () => {
    let error: string | null = null;
    dataSource.forEach((item, idx) => {
      if (!item.makho1) {
        error = `Vui lòng nhập Công trình điều chuyển cho dòng ${idx + 1}`;
      } else if (!item.unit && item.unit !== 0) {
        error = `Vui lòng nhập Số lượng cho dòng ${idx + 1}`;
      } else if (!item.ma_kho) {
        error = `Vui lòng nhập Công trình nhận điều chuyển cho dòng ${idx + 1}`;
      }
    });

    if (error) {
      setErrorMessages(prev => ({ ...prev, form: error || '' }));
      return;
    } else {
      setErrorMessages(prev => ({ ...prev, form: '' }));
    }

    // [24/10/2024][phuong_td] bỏ số lượng vật tư trong phiếu điều chuyển kho để tránh việc trừ gấp đôi số lượng vật tư
    const chiTietHangHoa_DC: ChiTietHangHoaDieuChuyenDTO[] = [];
    // [24/10/2024][phuong_td] thêm lại số lượng vật tư cho phiếu điều chuyển
    // const chiTietHangHoaNhapXuat: ChiTietHangHoaDieuChuyenDTO[] = [];
    dataSource.forEach(item => {
      const temp = {
        ma_vt: item.code,
        ma_kho: item.makho1,
        so_luong: item.unit,
        gia: 0,
        tien: 0,
        gia_nt: 0,
        tien_nt: 0,
        ma_kho1: item.ma_kho,
        dien_giai: item.dien_giai,
        createDate: dayjs().toISOString(),
      }
      chiTietHangHoa_DC.push({ ...temp });
      // chiTietHangHoaNhapXuat.push({...temp, so_luong: item.unit});
    });

    const commonData = {
      madvcs: 'THUCHIEN',
      ngay_ct: ngayCt.format('YYYY-MM-DD'),
      ma_kh: '',
      so_ct: 'Test',
      ma_nt: 'VND',
      chiTietHangHoa: [],
      hoaDonVAT: [],
      list_of_extensions: [],
      chiTietDeNghiMuaHang: [],
    };
    // Tạo phiếu điều chuyển
    const dieuChuyenData: PhieuDieuChuyenDTO = {
      ...commonData, chiTietHangHoa: chiTietHangHoa_DC,
      ma_ct: 'PXDC',
      nguoi_tt: nguoiThucHien,
      dien_giai: formData.dien_giai,
    };
    dispatch(accountingInvoiceActions.CreatePhieuDieuChuyen({ data: dieuChuyenData, wh: wh }));
    setIsModalVisible(false); // hide modal
    // Reset form và data
    setFormData({
      ma_kh: '',
      nguoi_tt: currentUserName,
      dien_giai: '',
      chiTietHangHoa: [{ ma_vt: '', so_luong: '', dien_giai: '', ma_kho1: '' }],
      hoaDonVAT: [],
      list_of_extensions: [],
      chiTietDeNghiMuaHang: []
    });
    setDataSource([{
      key: '1',
      code: '',
      name: '',
      dvt: '',
      unit: '',
      ma_kho: '',
      dien_giai: ''
    }]);
    dispatch(accountingInvoiceActions.setTonkhoByProduct(undefined));
    setErrorMessages({ form: '' });
    setNgayCt(dayjs());
  };

  return (
    <div>
      <div id="div1">
        <Row>
          <Col span={24}>
            <Title level={3}>{t('Transfer material')}</Title>
          </Col>
        </Row>
        <Form>
          <Row gutter={16}>
            <Col span={8} className={styles.formItemCol}>
              <Form.Item label={t('Date of creation of ticket')} className={styles.formItem}>
                <DatePicker
                  format="DD/MM/YYYY"
                  className={styles.inputDate01}
                  defaultValue={ngayCt}
                  onChange={(date) => {
                    setNgayCt(date || dayjs());
                    validateForm();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8} className={styles.formItemCol}>
              <Form.Item label={t('People who perform')} className={styles.formItem}>
                <Input
                  className={styles.inputCod}
                  defaultValue={currentUserName}
                  value={nguoiThucHien}
                  onChange={(e) => {
                    setNguoiThucHien(e.target.value);
                    validateForm();
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={
              <span>
                {t('interpretation')} <span style={{ color: 'red' }}>*</span>
              </span>
            }
            className={styles.formItem}
            rules={[{ required: true, message: t('interpretation is required') }]} // Thêm rules để bắt buộc nhập
          >
            <Input
              className={styles.inputCod}
              value={formData.dien_giai}
              onChange={(e) => {
                setFormData({ ...formData, dien_giai: e.target.value });
                validateForm();
              }}
            />
          </Form.Item>
        </Form>

        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: 700 }}
        />
        {errorMessages.form && (
          <div style={{ color: 'red', marginTop: 8 }}>{errorMessages.form}</div>
        )}
      </div>
      <div style={{ display: 'flex', paddingTop: '10px', paddingLeft: '18px' }}>
        <Button onClick={addNewRow} style={{ width: '100px' }}>+</Button>
      </div>
      <div style={{ paddingTop: '20px', justifyContent: 'flex-end', display: 'flex' }}>
        <Button
          className={styles.buttonGuidexuat}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{ backgroundColor: isSubmitDisabled ? undefined : 'green', color: isSubmitDisabled ? undefined : 'white' }} // Thay đổi màu sắc khi nút không bị disable
        >
          {t('Lưu')}
        </Button>
      </div>
    </div>
  );
};

export default NewTranMaterials;