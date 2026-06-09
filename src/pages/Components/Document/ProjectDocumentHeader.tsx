import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, DatePickerProps, Form, Input, Modal, Radio, Row, Select, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { eAccoutingKey, eMaterialDocument, madvcs } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import AutoCompleteCustom from '@/pages/MachineryMaterials/components/AutoCompleteCustom';
import { iBaoCaoBangCanDoiPhatSinhTaiKhoan, IBaoCaoChiTietCongNoDTO, IBaoCaoSoCaiSoQuyDTO, IBaoCaoXuatNhapTonPdfDTO, IHoaDonRaVaoDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getNccList, getProducts, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getQueryParamAccountingManagement, issueActions } from '@/store/issue';
import { projectActions } from '@/store/project';
import { getThangNam } from '@/store/salary';
import Utils from '@/utils';
const { Option } = Select;

// ----------------------------------------------------------------------------------
interface ActiveMenu {
  title: string;
  pass?: number;
  initialSearch?: string | any;
  onSearchChange?: (search: string) => void;
  onDateChange?: (date: Dayjs) => void;
  onSave?: () => void;
  AccoutingKey?: number;
  hideSaveChange?: boolean;
  onExport?: () => void;
}

export const ProjectDocumentsHeader = ({ title, pass, initialSearch = '', onSearchChange, onDateChange, onSave, AccoutingKey, hideSaveChange = false, onExport }: ActiveMenu) => {
  const { t } = useTranslation('document');
  // [02012024][#21173][phuong_td] thêm đa ngôn ngữ cho tài chính
  const tFinance = useTranslation('finance').t;
  const tCommon = useTranslation('common').t;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const company = useAppSelector(getCurrentCompany());
  const [form] = Form.useForm();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchStr, setSearchStr] = useState();
  const ThangNam = useAppSelector(getThangNam());
  const [Date, setDate] = useState(ThangNam);
  const [timer, setTimer] = useState<any>(null);
  // [18/12/2024][#21174][phuong_td] Key để ép AutoComplete cập nhật giá trị hiển thị
  const [keyAutoComplete, setKeyAutoComplete] = useState<string>('111');
  const queryParamAccountingManagement = useAppSelector(getQueryParamAccountingManagement());
  // [18/12/2024][#21174][phuong_td] Danh sách kho và kho được chọn
  const listWarehouse = useAppSelector(getWareHouses());
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>();
  // [#21174][phuong_td][18/12/2024] Lấy danh sách kho hàng
  const nccList = useAppSelector(getNccList());
  const productList = useAppSelector(getProducts());
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    if (AccoutingKey) {
      setIsModalVisible(true);
      dispatch(accountingInvoiceActions.getCustomers());
    }
    switch (AccoutingKey) {
      case eAccoutingKey.TongHopXuatNhapTon:
        dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
        dispatch(accountingInvoiceActions.GetProducts({ params: {} }));
        break;
      default:
        break;
    }
    // [02012024][#21173][phuong_td] bỏ projet khi thay đổi màn hình
    setSelectedProject('');
    form.setFieldsValue({ projectCode: '' });
    // eslint-disable-next-line
  }, [AccoutingKey]);

  useEffect(() => {
    setSearchStr(initialSearch);
    if (onSearchChange) {
      onSearchChange(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    dispatch(projectActions.getProjectsByCompanyIdRequest(company.id));
  }, [company]);

  const projectList = useAppSelector(state => state.project.projectList);

  const handleModalTheoDoiDongTien = () => {
    form.setFieldsValue({
      fromDate: dayjs().subtract(3, 'month'),
      toDate: dayjs(),
      beginningPreviousPeriod: dayjs().subtract(3, 'month'),
      endPreviousPeriod: dayjs(),
    });
    setIsModalVisible(true);
  };

  // [18/12/2024][#21174][phuong_td] chuyển đổi dataOption => eMaterialDocument
  const getOtherFilter = (dataOption: 'release' | 'unrelease' | 'all') => {
    switch (dataOption) {
      case 'release':
        return eMaterialDocument.RELEASE;
      case 'unrelease':
        return eMaterialDocument.UNRELEASE;
      default:
        return eMaterialDocument.ALL;
    }
  }

  // [18/12/2024][#21174][phuong_td] xử lý lấy giá trị xuất nhập tồn
  const handleTraCuuNhapXuatTon = () => {
    const values = form.getFieldsValue();
    const { caseCode, projectCode, unitCode, fromDate, toDate, dataOption, customerCode } = values;
    const formattedValues: IBaoCaoXuatNhapTonPdfDTO = {
      madvcs: unitCode ?? madvcs.THUCHIEN,
      tu_ngay: fromDate ? dayjs(fromDate).toISOString() : '', // Format to ISO string
      den_ngay: toDate ? dayjs(toDate).toISOString() : '',
      ma_vat_tu: selectedProduct,
      ma_khoan_muc: projectCode,
      ma_vu_viec: caseCode,
      ma_khach_hang: customerCode,
      ma_kho: selectedWarehouse ?? '',
      otherFilter: getOtherFilter(dataOption),
    };
    // [04/01/2025][#21174][phuong_td] set tham số cho api getFinance vào redux
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        madvcs: formattedValues.madvcs,
        tu_ngay: formattedValues.tu_ngay, // Format to ISO string
        den_ngay: formattedValues.den_ngay,
        ma_kho: formattedValues.ma_kho || '',
        tk_no: formattedValues.tk_no || '',
        tk_co: formattedValues.tk_co || '',
        Release:
          formattedValues.otherFilter === eMaterialDocument.RELEASE
            ? '&Release=1'
            : formattedValues.otherFilter === eMaterialDocument.UNRELEASE
              ? '&Release=0'
              : '',
      }),
    );
    dispatch(
      accountingInvoiceActions.getBaoCaoXuatNhapTonPdf({
        params: {
          data: formattedValues,
        },
      }),
    );
    setIsModalVisible(false);
  };

  // [18/12/2024][#21174][phuong_td] xử lý lấy giá trị báo cáo doanh thu chi
  const handleBaoCaoDanhThuChiPhi = () => {
    const values = form.getFieldsValue();
    const tuNgay = values.fromDate;
    const denNgay = values.toDate;
    const dau_ky_truoc = values?.beginningPreviousPeriod;
    const cuoi_ky_truoc = values?.endPreviousPeriod;
    // [02012024][#21173][phuong_td] thêm các param cho api getBaoCaoDanhThuChiPhi
    const ma_cong_trinh = selectedProject;
    const ma_vu_viec = values.caseCode;
    const ma_khach_hang = values.customerCode;
    const unitCode = values.unitCode;
    const projectCode = values.projectCode;
    const opt: any = {
      tu_ngay: dayjs(tuNgay).format('YYYY-MM-DD'),
      den_ngay: dayjs(denNgay).format('YYYY-MM-DD'),
      madvcs: unitCode ?? madvcs.THUCHIEN,
      dau_ky_truoc: dayjs(dau_ky_truoc).format('YYYY-MM-DD'),
      cuoi_ky_truoc: dayjs(cuoi_ky_truoc).format('YYYY-MM-DD'),
      ma_km: projectCode,
      ma_cong_trinh,
      ma_vu_viec,
      ma_khach_hang,
    };
    // [04/01/2025][#21174][phuong_td] set tham số cho api getFinance vào redux
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        tu_ngay: opt.tu_ngay, // Format to ISO string
        den_ngay: opt.den_ngay,
        dau_ky_truoc: opt.dau_ky_truoc,
        cuoi_ky_truoc: opt.cuoi_ky_truoc,
        ma_cong_trinh: opt.ma_cong_trinh,
        ma_vu_viec: opt.ma_vu_viec,
        ma_khach_hang: opt.ma_khach_hang,
      }),
    );
    dispatch(accountingInvoiceActions.getBaoCaoDanhThuChiPhi({
      params: {
        data: opt
      }
    }));

    setIsModalVisible(false);
  };

  // [18/12/2024][#21174][phuong_td] xử lý lấy giá trị báo cáo cân đối tài khoản
  const handleCanDoiKeToan = () => {
    const values = form.getFieldsValue();
    // [02012024][#21173][phuong_td] thêm các param cho api getBaoCaoBangCanDoiPhatSinhTaiKhoan
    // const ma_cong_trinh = selectedProject;
    const { Account, DebtAccount, unitCode, fromDate, toDate, dataOption } = values;
    const tuNgay = fromDate;
    const denNgay = toDate;
    const ma_vu_viec = values.caseCode;
    const ma_khach_hang = values.customerCode;
    const Release = getOtherFilter(dataOption);
    const opt: iBaoCaoBangCanDoiPhatSinhTaiKhoan = {
      tu_ngay: dayjs(tuNgay).format('YYYY-MM-DD'),
      den_ngay: dayjs(denNgay).format('YYYY-MM-DD'),
      madvcs: unitCode,
      ma_tai_khoan: Account,
      // ma_khoan_muc: '',
      ma_vu_viec,
      ma_khach_hang,
      otherFilter:
        Release === eMaterialDocument.RELEASE
          ? '&Release=1'
          : Release === eMaterialDocument.UNRELEASE
            ? '&Release=0'
            : '',
    };
    // [04/01/2025][#21174][phuong_td] set tham số cho api getFinance vào redux
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        // tu_ngay: opt.tu_ngay, // Format to ISO string
        den_ngay: opt.den_ngay,
        madvcs: opt.den_ngay,
        // ma_tai_khoan: opt.den_ngay,
        // ma_khoan_muc: '',
        // ma_vu_viec: opt.ma_vu_viec,
        // ma_khach_hang: opt.ma_khach_hang,
        otherFilter: opt.otherFilter,
      }),
    );
    dispatch(
      accountingInvoiceActions.getBaoCaoBangCanDoiPhatSinhTaiKhoan({
        params: {
          data: opt,
        },
      }),
    );
    setIsModalVisible(false);
  };

  // [#21175][dung_lt][19/12/2024]- xử lý lấy giá giá trị báo cáo chi tiết công nợ
  const handleBaoCaoChiTietCongNo = () => {
    const values = form.getFieldsValue();
    const { accountCode, unitCode, fromDate, toDate, caseCode, projectCode, customerCode, dataOption } = values;
    const formattedValues: IBaoCaoChiTietCongNoDTO = {
      madvcs: unitCode ?? madvcs.THUCHIEN,
      tu_ngay: fromDate ? dayjs(fromDate).toISOString() : '', // Format to ISO string
      den_ngay: toDate ? dayjs(toDate).toISOString() : '',
      ma_tai_khoan: accountCode,
      ma_cong_trinh: projectCode,
      ma_vu_viec: caseCode,
      ma_khach_hang: customerCode
    };
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        madvcs: formattedValues.madvcs,
        tu_ngay: formattedValues.tu_ngay, // Format to ISO string
        den_ngay: formattedValues.den_ngay,
        ma_tai_khoan: formattedValues.ma_tai_khoan || '',
        ma_cong_trinh: formattedValues.ma_cong_trinh || '',
        ma_vu_viec: formattedValues.ma_vu_viec || '',
        ma_khach_hang: formattedValues.ma_khach_hang || '',
        Release:
          getOtherFilter(dataOption) === eMaterialDocument.RELEASE
            ? '&Release=1'
            : getOtherFilter(dataOption) === eMaterialDocument.UNRELEASE
              ? '&Release=0'
              : '',
      }),
    );

    dispatch(
      accountingInvoiceActions.getBaoCaoChiTietCongNo({
        params: {
          data: formattedValues
        }
      })
    )
    setIsModalVisible(false);
  }

  // [#21241][dung_lt][04/01/2025]- xử lý lấy giá giá trị báo cáo sổ cái sổ quý
  const handleBaoCaoSoCaiSoQuy = () => {
    const values = form.getFieldsValue();
    const { accountCode, unitCode, fromDate, toDate, caseCode, projectCode, customerCode, dataOption } = values;
    const formattedValues: IBaoCaoSoCaiSoQuyDTO = {
      madvcs: unitCode ?? madvcs.THUCHIEN,
      tu_ngay: fromDate ? dayjs(fromDate).toISOString() : '', // Format to ISO string
      den_ngay: toDate ? dayjs(toDate).toISOString() : '',
      ma_tai_khoan: accountCode,
      ma_cong_trinh: projectCode,
      ma_vu_viec: caseCode,
      ma_khach_hang: customerCode
    };
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        madvcs: formattedValues.madvcs,
        tu_ngay: formattedValues.tu_ngay, // Format to ISO string
        den_ngay: formattedValues.den_ngay,
        ma_tai_khoan: formattedValues.ma_tai_khoan || '',
        ma_cong_trinh: formattedValues.ma_cong_trinh || '',
        ma_vu_viec: formattedValues.ma_vu_viec || '',
        ma_khach_hang: formattedValues.ma_khach_hang || '',
        Release:
          getOtherFilter(dataOption) === eMaterialDocument.RELEASE
            ? '&Release=1'
            : getOtherFilter(dataOption) === eMaterialDocument.UNRELEASE
              ? '&Release=0'
              : '',
      }),
    );
    dispatch(
      accountingInvoiceActions.getBaoCaoSoCaiSoQuy({
        params: {
          data: formattedValues
        }
      })
    )
    setIsModalVisible(false);
  }

  const handleHoaDonRaVao = () => {
    const values = form.getFieldsValue();
    const { accountCode, unitCode, fromDate, toDate, caseCode, projectCode, customerCode } = values;
    const formattedValues: IHoaDonRaVaoDTO = {
      GetVATMuaVao: AccoutingKey !== 9 ? false : true,
      BaoGomChiTietHangHoa: true,
      madvcs: unitCode ?? madvcs.THUCHIEN,
      tu_ngay: fromDate ? dayjs(fromDate).toISOString() : '', // Format to ISO string
      den_ngay: toDate ? dayjs(toDate).toISOString() : '',
      ma_tai_khoan: accountCode,
      ma_khach_hang: customerCode
    };
    // [04/01/2025][#21174][phuong_td] set tham số cho api getFinance vào redux
    dispatch(
      issueActions.setQueryParamAccountingManagement({
        tu_ngay: formattedValues.tu_ngay, // Format to ISO string
        den_ngay: formattedValues.den_ngay,
        ma_cong_trinh: formattedValues.ma_cong_trinh,
        ma_vu_viec: formattedValues.ma_vu_viec,
        ma_khach_hang: formattedValues.ma_khach_hang,
      }),
    );

    dispatch(
      accountingInvoiceActions.BaoCaoBangKeThueMuaVaoBanRa({
        params: {
          data: formattedValues
        }
      }),
    );
    setIsModalVisible(false);
  }

  // [18/12/2024][#21174][phuong_td] xử lý lấy giá trị theo AccoutingKey
  const handleOk = async () => {
    try {
      await form.validateFields();   // [#21175][dung_lt][19/12/2024]- kiểm tra form đã validate chưa
      switch (AccoutingKey) {
        case eAccoutingKey.TongHopXuatNhapTon:
          handleTraCuuNhapXuatTon();
          break;
        case eAccoutingKey.DongTien:
        case eAccoutingKey.TongHopDoanhThu:
        case eAccoutingKey.QuyetToanLaiLoCongTrinh:
          handleBaoCaoDanhThuChiPhi();
          break;
        case eAccoutingKey.CongNoNCC_CDT:
          handleBaoCaoChiTietCongNo();
          break;
        case eAccoutingKey.SoSachKeToan:
          handleBaoCaoSoCaiSoQuy();
          break;
        case eAccoutingKey.HoaDonDauRa:
        case eAccoutingKey.HoaDonDauVao:
          handleHoaDonRaVao();
          break;
        case eAccoutingKey.CanDoiKeToan:
          handleCanDoiKeToan();
          break;
        default:
          // handleBaoCaoDanhThuChiPhi();
          break;
      }
    } catch (err: any) {
      if (err.errorFields) {
        console.error("Validation errors:", err.errorFields); // Log lỗi nếu có
      }
      // Có thể thêm xử lý thông báo lỗi tại đây nếu cần
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeOutId = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(search);
      }
    }, 500);
    setTimer(timeOutId);
  };
  // [02012024][#21173][phuong_td] Danh sách ẩn các trường theo các trang khác nhau
  const hiddenLuaChonDuLieu = [eAccoutingKey.DongTien, eAccoutingKey.QuyetToanLaiLoCongTrinh];
  const hiddenFieldsCode = [eAccoutingKey.TongHopXuatNhapTon, eAccoutingKey.CanDoiKeToan];
  const hiddenMaDV = [eAccoutingKey.DongTien, eAccoutingKey.QuyetToanLaiLoCongTrinh];
  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (onDateChange) onDateChange(date.set('date', 1));
    setDate(date.set('date', 1));
  };
  return (
    <>
      {pass ? (
        <Row style={{ padding: 10, height: 60, backgroundColor: 'white' }}>
          <Space style={{ flex: 1 }}>
            <Typography.Title style={{ margin: 0 }} level={4}>
              {title}
            </Typography.Title>
            {title === 'Ứng lương lần 1' || title === 'Ứng lương lần 2' ? (
              <Button
                type="primary"
                size="large"
                style={{
                  padding: `10px 10px`,
                  fontSize: '14px',
                  height: '30px',
                  // borderRadius: '10px',
                }}
                onClick={() => {
                  onExport && onExport();
                }}
              >
                Export
              </Button>
            ) : (<></>)}

          </Space>
          <Space style={{ flex: 1, flexDirection: 'row-reverse' }}>
            {/* dung_lt - 15/1/2025 - thêm check ẩn nút lưu thay đổi với 1 số page */}
            {
              !hideSaveChange ? (
                <WithPermission strategy="disable" policyKeys={['KPI.UngLuong_1.SaveChanges']}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      padding: `10px 10px`,
                      fontSize: '14px',
                      height: '30px',
                      // borderRadius: '10px',
                    }}
                    onClick={() => {
                      if (onSave) onSave();
                    }}
                  >
                    {tCommon('Save change')}
                  </Button>
                </WithPermission>
              ) : (
                <div
                  style={{
                    display: 'inline-block',
                    padding: `10px 10px`,
                    fontSize: '14px',
                    width: '100px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                  }}
                />
              )
            }
            <Input
              value={searchStr}
              onChange={handleSearchChange}
              allowClear
              placeholder={t('Search')}
              suffix={searchStr ? null : <SearchOutlined />}
              style={{ width: 250 }}
            />
            <DatePicker onChange={onChange} picker="month" value={Date} allowClear={false} />
          </Space>
        </Row>
      ) : (
        <Row style={{ padding: 10, backgroundColor: 'white' }}>
          <Space style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography.Title style={{ margin: 0 }} level={4}>
              {title}
            </Typography.Title>
            <Button type="primary" onClick={handleModalTheoDoiDongTien} style={{ marginTop: 10 }}>
              {tFinance('Search')}
            </Button>
          </Space>
        </Row>
      )}
      {/* // [18/12/2024][#21174][phuong_td] thay đổi tiêu đề Modal */}
      <Modal
        title={title}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        cancelText="Hủy"
        okText="Ok"
      >
        {/* {isLoading && <Loading />} */}
        {/* // [18/12/2024][#21174][phuong_td] thiết lập giá trị mặc định */}
        <Form layout="vertical" form={form} initialValues={{
          dataOption: 'all',
          WarehouseCode: '',
          unitCode: 'THUCHIEN',
          fromDate: queryParamAccountingManagement ? moment(queryParamAccountingManagement.tu_ngay, 'YYYY-MM-DD') : dayjs().subtract(3, 'months'),
          toDate: queryParamAccountingManagement ? moment(queryParamAccountingManagement.den_ngay, 'YYYY-MM-DD') : dayjs(),
          beginningPreviousPeriod: queryParamAccountingManagement ? moment(queryParamAccountingManagement.tu_ngay, 'YYYY-MM-DD') : dayjs().subtract(3, 'months'),
          endPreviousPeriod: queryParamAccountingManagement ? moment(queryParamAccountingManagement.den_ngay, 'YYYY-MM-DD') : dayjs(),
        }}>
          {
            AccoutingKey === eAccoutingKey.CongNoNCC_CDT && (
              <Form.Item label={t("Account Code")} name="accountCode" rules={[{ required: true, message: t("Please input the Account Code") }]}>
                <Input placeholder={t("Enter the Account Code")} />
              </Form.Item>
            )
          }
          {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
          {AccoutingKey && !hiddenMaDV.includes(AccoutingKey) && (
            <Form.Item label={tFinance('Unit code')} name="unitCode" rules={[{ required: true }]}>
              <Input placeholder={tFinance('Enter the unit code')} />
            </Form.Item>
          )}

          <Row gutter={16}>
            {AccoutingKey && <Col span={12}>
              {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
              <Form.Item label={tFinance('From date')} name="fromDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>}
            <Col span={12}>
              {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
              <Form.Item label={tFinance('To date')} name="toDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {(AccoutingKey === eAccoutingKey.ChenhLechHoaDon || AccoutingKey === eAccoutingKey.DongTien || AccoutingKey === eAccoutingKey.TongHopDoanhThu || AccoutingKey === eAccoutingKey.QuyetToanLaiLoCongTrinh) && (
            <Row gutter={16}>
              {AccoutingKey && (
                <Col span={12}>
                  {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
                  <Form.Item label={tFinance('Đầu kỳ trước')} name="beginningPreviousPeriod" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              )}
              <Col span={12}>
                {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
                <Form.Item label={tFinance('Cuối kỳ trước')} name="endPreviousPeriod" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          )}
          {(AccoutingKey === eAccoutingKey.SoSachKeToan || AccoutingKey === eAccoutingKey.HoaDonDauRa || AccoutingKey === eAccoutingKey.HoaDonDauVao) && (
            <Form.Item
              label={t('Account Code')}
              name="accountCode"
            // rules={[{ required: true, message: t('Please input the Account Code') }]}
            >
              <Input placeholder={t('Enter the Account Code')} />
            </Form.Item>
          )
          }

          {/*[18/12/2024][#21174][phuong_td] Hiển thị các trường cho màn hình khác TongHopXuatNhapTon*/}
          {AccoutingKey && !hiddenFieldsCode.includes(AccoutingKey) && (
            <>
              {AccoutingKey === eAccoutingKey.HoaDonDauRa || AccoutingKey === eAccoutingKey.HoaDonDauVao ? "" : (
                <Form.Item label={tFinance('Project')} name="projectCode">
                  <AutoCompleteCustom
                    id=""
                    keyElement={keyAutoComplete}
                    value={selectedProject} // selectedProject là code của project
                    optionsList={projectList.map((w) => ({
                      label: `${w.code || w.id} / ${w.name}`,
                      value: `${w.code || w.id}`, // đảm bảo value là code
                      item: {
                        name: w.name,
                        code: `${w.code || w.id}`,
                      },
                    }))}
                    onChange={(id, data) => {
                      form.setFieldsValue({ projectCode: data }); // set code vào form
                    }}
                    onSelect={(id, data, label, item) => {
                      setSelectedProject(item.code); // cập nhật selectedProject là code
                      setKeyAutoComplete(Utils.generateRandomString(3));
                      form.setFieldsValue({ projectCode: item.code }); // dùng code, KHÔNG dùng item.name
                    }}
                    onBlur={(id, data) => {
                      // Tìm theo cả code hoặc name
                      const project = projectList.find(
                        (w) => w.name === data || `${w.code}` === data
                      );
                      if (project) {
                        const code = `${project.code || project.id}`;
                        if (code !== selectedProject) {
                          setSelectedProject(code);
                        }
                        form.setFieldsValue({ projectCode: code }); // set code
                      } else {
                        setSelectedProject('');
                        form.setFieldsValue({ projectCode: '' });
                      }
                    }}
                    className=""
                    placeholder={tFinance('Select the project code')}
                    warning=""
                  />
                </Form.Item>
              )}
              {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
              {AccoutingKey !== eAccoutingKey.HoaDonDauRa && AccoutingKey !== eAccoutingKey.HoaDonDauVao &&
                <Form.Item label={tFinance('Case code')} name="caseCode">
                  <Input placeholder={tFinance('Enter the code')} />
                </Form.Item>
              }
              {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
              {(AccoutingKey !== eAccoutingKey.DongTien && AccoutingKey !== eAccoutingKey.QuyetToanLaiLoCongTrinh && AccoutingKey !== eAccoutingKey.TongHopDoanhThu) &&
                <Form.Item label={tFinance('Customer code')} name="customerCode">
                  <AutoCompleteCustom
                    id=""
                    keyElement={keyAutoComplete}
                    value={selectedCustomer}
                    optionsList={nccList.map((item) => ({
                      label: `${item.ten_kh} / ${item.ma_kh}`,
                      value: item.ma_kh,
                      item: {
                        name: item.ten_kh,
                        code: item.ma_kh,
                      },
                    }))}
                    onChange={(id, data) => {
                      console.log(data);
                      form.setFieldsValue({ customerCode: data });
                    }}
                    onSelect={(id, data, label, item) => {
                      setSelectedCustomer(item.code);
                      setKeyAutoComplete(Utils.generateRandomString(3));
                      form.setFieldsValue({ customerCode: item.code });
                    }}
                    onBlur={(id, data) => {
                      form.setFieldsValue({ customerCode: data });
                      const customer = nccList.find(w => w.ma_kh === data);
                      if (customer) {
                        if (customer.ma_kh !== selectedCustomer) {
                          setSelectedCustomer(customer.ma_kh);
                        }
                      } else {
                        setSelectedCustomer('');
                      }
                    }}
                    className=""
                    placeholder={tFinance('Chọn mã khách hàng')}
                    warning=""
                  />
                </Form.Item>
              }
            </>
          )}
          {/*[18/12/2024][#21174][phuong_td] Hiển thị các trường cho màn hình TongHopXuatNhapTon*/}
          {AccoutingKey === eAccoutingKey.TongHopXuatNhapTon && (
            <>
              <Form.Item label={t('Depot Code')} name="WarehouseCode">
                <AutoCompleteCustom
                  id={''}
                  keyElement={keyAutoComplete}
                  value={selectedWarehouse}
                  optionsList={listWarehouse.map(w => ({
                    label: `${w.ma_kho} / ${w.ten_kho}`,
                    value: w.ma_kho,
                    item: {
                      name: w.ten_kho,
                      code: w.ma_kho,
                    },
                  }))}
                  onChange={function (id: string, data: string): void {
                    form.setFieldsValue({ WarehouseCode: data });
                  }}
                  onSelect={function (id: string, data: string, label: string, item: any): void {
                    setSelectedWarehouse(item.code);
                    setKeyAutoComplete(Utils.generateRandomString(3));
                    form.setFieldsValue({ WarehouseCode: item.name });
                  }}
                  className={''}
                  placeholder={t('Select warehouse code')}
                  onBlur={function (id: string, data: string): void {
                    // throw new Error('Function not implemented.');
                    form.setFieldsValue({ WarehouseCode: data });
                    const kho = listWarehouse.find(w => w.ten_kho === data);
                    if (kho) {
                      if (kho.ma_kho !== selectedWarehouse) setSelectedWarehouse(kho.ma_kho);
                    } else {
                      setSelectedWarehouse('');
                    }
                  }}
                  warning={''}
                ></AutoCompleteCustom>
              </Form.Item>

              <Form.Item label={tFinance('Mã vật tư')} name="productCode">
                <AutoCompleteCustom
                  id=""
                  keyElement={keyAutoComplete}
                  value={selectedProduct}
                  optionsList={productList.map((item) => ({
                    label: `${item.ten_vt} / ${item.ma_vt}`,
                    value: item.ma_vt,
                    item: {
                      name: item.ma_vt, // không có tên riêng nên dùng ma_vt làm cả name/code
                      code: item.ma_vt,
                    },
                  }))}
                  onChange={(id, data) => {
                    form.setFieldsValue({ productCode: data });
                  }}
                  onSelect={(id, data, label, item) => {
                    setSelectedProduct(item.code);
                    setKeyAutoComplete(Utils.generateRandomString(3));
                    form.setFieldsValue({ productCode: item.name });
                  }}
                  onBlur={(id, data) => {
                    form.setFieldsValue({ productCode: data });
                    const product = productList.find(w => w.ma_vt === data);
                    if (product) {
                      if (product.ma_vt !== selectedProduct) {
                        setSelectedProduct(product.ma_vt);
                      }
                    } else {
                      setSelectedProduct('');
                    }
                  }}
                  className=""
                  placeholder={tFinance('Chọn mã vật tư')}
                  warning=""
                />
              </Form.Item>

              <Form.Item label={tFinance('Project')} name="projectCode">
                <AutoCompleteCustom
                  id=""
                  keyElement={keyAutoComplete}
                  value={selectedProject} // selectedProject là code của project
                  optionsList={projectList.map((w) => ({
                    label: `${w.code || w.id} / ${w.name}`,
                    value: `${w.code || w.id}`, // đảm bảo value là code
                    item: {
                      name: w.name,
                      code: `${w.code || w.id}`,
                    },
                  }))}
                  onChange={(id, data) => {
                    form.setFieldsValue({ projectCode: data }); // set code vào form
                  }}
                  onSelect={(id, data, label, item) => {
                    setSelectedProject(item.code); // cập nhật selectedProject là code
                    setKeyAutoComplete(Utils.generateRandomString(3));
                    form.setFieldsValue({ projectCode: item.code }); // dùng code, KHÔNG dùng item.name
                  }}
                  onBlur={(id, data) => {
                    // Tìm theo cả code hoặc name
                    const project = projectList.find(
                      (w) => w.name === data || `${w.code}` === data
                    );
                    if (project) {
                      const code = `${project.code || project.id}`;
                      if (code !== selectedProject) {
                        setSelectedProject(code);
                      }
                      form.setFieldsValue({ projectCode: code }); // set code
                    } else {
                      setSelectedProject('');
                      form.setFieldsValue({ projectCode: '' });
                    }
                  }}
                  className=""
                  placeholder={tFinance('Select the project code')}
                  warning=""
                />
              </Form.Item>
              <Form.Item label={tFinance('Case code')} name="caseCode">
                <Input placeholder={tFinance('Enter the code')} />
              </Form.Item>
              <Form.Item label={tFinance('Customer code')} name="customerCode">
                <AutoCompleteCustom
                  id=""
                  keyElement={keyAutoComplete}
                  value={selectedCustomer}
                  optionsList={nccList.map((item) => ({
                    label: `${item.ten_kh} / ${item.ma_kh}`,
                    value: item.ma_kh,
                    item: {
                      name: item.ten_kh,
                      code: item.ma_kh,
                    },
                  }))}
                  onChange={(id, data) => {
                    form.setFieldsValue({ customerCode: data });
                  }}
                  onSelect={(id, data, label, item) => {
                    setSelectedCustomer(item.code);
                    setKeyAutoComplete(Utils.generateRandomString(3));
                    form.setFieldsValue({ customerCode: item.code });
                  }}
                  onBlur={(id, data) => {
                    form.setFieldsValue({ customerCode: data });
                    const customer = nccList.find(w => w.ten_kh === data);
                    if (customer) {
                      if (customer.ma_kh !== selectedCustomer) {
                        setSelectedCustomer(customer.ma_kh);
                      }
                    } else {
                      setSelectedCustomer('');
                    }
                  }}
                  className=""
                  placeholder={tFinance('Chọn mã khách hàng')}
                  warning=""
                />
              </Form.Item>
            </>
          )}
          {/* [02012024][#21173][phuong_td] Điều chỉnh đa ngôn ngữ */}
          {AccoutingKey && !hiddenLuaChonDuLieu.includes(AccoutingKey) && (
            <Form.Item label={tFinance('Select data')} name="dataOption">
              <Radio.Group>
                <Radio value="release">{tFinance('The data taken on the approved vouchers (Release)')}</Radio>
                <Radio value="unrelease">
                  {tFinance('The data taken on the vouchers has not been approved (Unrelease)')}
                </Radio>
                <Radio value="all">
                  {tFinance('The data taken on all documents has been or has not been approved (All)')}
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};