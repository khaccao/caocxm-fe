/* eslint-disable import/order */
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button, Col, Form, Input, InputNumber, Row, Select, Table, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AutoCompleteOptions,
  EPaymentMethod,
  eTypeVatTuMayMoc,
  FormatDateAPI,
  IBaoXuatNhapTonData,
  PhieuDeNghiMuaHangDTO
} from '@/common/define';
import { AccountingInvoiceService, ChiTietDeNghiMuaHangDTO } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import {
  accountingInvoiceActions,
  getBaoCaoXuatNhapTon,
  getGiaXuatGanNhat,
  getNccList,
  getProducts,
  getWareHouses
} from '@/store/accountingInvoice';
import { getCurrentUser, getgetUserIIS } from '@/store/app';
import { usePermission } from '@/hooks/usePermission';
import dayjs from 'dayjs';
import AutoCompleteCustom from '../AutoCompleteCustom';
import { ProposalData } from '../ProposalHistory';
import styles from './MachineryMaterialsConfirm.module.css';

const { Title } = Typography;
const { Option } = Select;

interface MachineryMaterialsFormProps {
  proposal: ProposalData;
  type: eTypeVatTuMayMoc;
  capDuyet: number;
  handleClose: any;
}

let optionsNcc: AutoCompleteOptions[] = [];

export const PAYMENT_OPTIONS = [
  { label: 'Tiền mặt', value: 0 },
  { label: 'Chuyển khoản', value: 1 },
  { label: 'Công nợ', value: 2 },
];

export const PAYMENT_LABEL: Record<number, string> = {
  0: 'Tiền mặt',
  1: 'Chuyển khoản',
  2: 'Công nợ',
};

const MachineryMaterialsConfirm: React.FC<MachineryMaterialsFormProps> = ({ proposal, capDuyet, handleClose, type }) => {
  const userIIS = useAppSelector(getgetUserIIS());
  const baoCao = useAppSelector(getGiaXuatGanNhat());
  const nhapKho = useAppSelector(getBaoCaoXuatNhapTon());
  const data = proposal.chiTietDeNghiMuaHang;
  const dataVAT = proposal?.hoaDonVAT;
  const user = useAppSelector(getCurrentUser());
  const [chiTietHangHoa, setChiTietHangHoa] = useState<ChiTietDeNghiMuaHangDTO[]>([]);
  const [chiTietHangHoaClone, setChiTietHangHoaClone] = useState<ChiTietDeNghiMuaHangDTO[]>([]);
  const projectList = useAppSelector(state => state.project.projectList);
  const [project, setProject] = useState<any>();
  const [dienGiai, setDienGiai] = useState<string>(proposal.dien_giai || '');

  // const employee = useAppSelector((state: RootState) => state.app.selectedEmployeeDetails);
  const productList = useAppSelector(getProducts());
  const wareHouses = useAppSelector(getWareHouses());
  const dispatch = useAppDispatch();
  const { t } = useTranslation('material');
  const [showWarning, setShowWarning] = useState(false);
  const value = (proposal.capDuyetHienTai ?? 0) + 1;
  const [dienGiaiValues, setDienGiaiValues] = useState<{ [key: string]: string }>({});

  // Get permission based on type
  const getApproveOverBudgetPermission = () => {
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
        return 'KhoCongTy.VatTuChinh.ApproveOverBudget';
      case eTypeVatTuMayMoc.VatTuPhu:
        return 'KhoCongTy.VatTuPhu.ApproveOverBudget';
      case eTypeVatTuMayMoc.MayMoc:
        return 'KhoCongTy.MayMoc.ApproveOverBudget';
      default:
        return '';
    }
  };

  const hasApproveOverBudgetPermission = usePermission([getApproveOverBudgetPermission()]);


  const totalThanhTien = chiTietHangHoa.reduce((total, item) => {
    const soLuong = Number(item?.so_luong_nhap1) || 0;
    const gia = Number(item?.gia) || 0;

    // Ép kiểu ty_le_thue về number, nếu không hợp lệ (NaN) thì dùng 0
    const tyLeThue = Number(item?.vatRate);
    const thue = isNaN(tyLeThue) ? 0 : tyLeThue;

    return total + soLuong * gia * (1 + thue / 100);
  }, 0);
  //[22/10] [ngoc_td] them autocomplete cho duyet vat tu, may moc
  const nccList = useAppSelector(getNccList());

  const createOptionsNcc = () => {
    const oName: AutoCompleteOptions[] = [];
    if (nccList && nccList.length) {
      nccList.forEach(ncc => {
        oName.push({
          label: `${ncc.ma_kh} / ${ncc.ten_kh}`, // Adding both code and name
          value: ncc.ma_kh,
          item: {
            name: ncc.ten_kh,
            code: ncc.ma_kh,
          },
        });
      });
    }

    // Assign these options to be used in renderAutocomplete for NCC fields
    optionsNcc = oName; // Use setOptionsNcc to update the state
  };
  async function getProjectId(): Promise<number | undefined> {
    const id = wareHouses.find(w => w.ma_kho === proposal.chiTietDeNghiMuaHang[0].ma_kho)?.id;
    if (!id) return undefined;
    return new Promise((resolve, reject) => {
      ProjectService.Get.getProjectWarehousesbyId(id).subscribe({
        next: res => {
          if (res && Array.isArray(res) && res.length > 0) {
            resolve(res[0].projectId);
          } else if (res?.projectId) {
            resolve(res.projectId);
          } else {
            resolve(undefined);
          }
        },
        error: error => {
          console.error('Error getting projectId:', error);
          reject(error);
        },
      });
    });
  }
  // [02/04] [ngoc_td]: mỗi khi kho thay đổi sẽ get lại project ứng với kho đó

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const projectId = await getProjectId();
        const projectFound = projectList.find(p => p.id === projectId)?.name || 'Tổng';
        setProject(projectFound); // Lưu giá trị projectId vào state
      } catch (error) {
        console.error('Error fetching projectId:', error);
      }
    };
    if (wareHouses.length > 0) {
      fetchProjectId();
    }
  }, [wareHouses]);

  //[10/1/2025][ngoc_td] thêm trường ghi chú cho duyệt đề xuất
  const handleDienGiaiChange = (key: string, value: string) => {
    setDienGiaiValues(prevValues => ({
      ...prevValues,
      [key]: value,
    }));
  };
  useEffect(() => {
    createOptionsNcc();
  }, []);

  const renderAutoComplete = (
    newKey: string,
    options: AutoCompleteOptions[],
    value: string,
    typeHandleSelect: string,
    dropdownStyle?: React.CSSProperties,
    status?: 'error' | 'warning',
  ) => {
    if (typeHandleSelect === 'ma_kh' && value === '') {
      // setChiTietHangHoa((prevDataSource) =>
      //   prevDataSource.map((item) => {
      //     if (item.guid === newKey && !item.ma_kh) {
      //       return { ...item, ma_kh: 'ncc3' };
      //     }
      //     return item;
      //   })
      // );
    }
    return (
      <AutoCompleteCustom
        keyElement={newKey}
        className={styles.newRow}
        style={{ width: 190 }}
        optionsList={options}
        id={newKey}
        status={status}
        onChange={(key: string, data: string) => {
          // No need to update the entire data set in `onChange`
        }}
        warning={'Value does not exist'}
        onBlur={(key: string, data: any) => {
          setChiTietHangHoa(prevDataSource => {
            return prevDataSource.map(item => {
              if (item.guid === newKey) {
                return { ...item, typeHandleSelect: data };
              }
              return item;
            });
          });
        }}
        onSelect={(id: string, data: any) => {
          handleSelect(id, data, typeHandleSelect, newKey);
        }}
        value={value || ''}
        placeholder={'Nhập nhà cung cấp'}
        dropdownStyle={dropdownStyle}
      />
    );
  };

  const handleSelect = (id: string, data: string, type: string, key: string) => {
    const ncc = optionsNcc.find(i => i.item.code === data);
    const nccData = nccList.find(ncc => ncc.ma_kh === data);
    const formatDienGiai = (dien_Thoai?: string, dia_Chi?: string) => {
      const parts = [dien_Thoai, dia_Chi].filter(part => part?.trim()); // Loại bỏ giá trị rỗng
      return parts.join(', '); // Ghép lại bằng dấu phẩy
    };
    const selected = proposal.chiTietDeNghiMuaHang.find(item => item.guid === key);
    if (selected) {
      handleDienGiaiChange(selected.ma_vt, formatDienGiai(nccData?.dien_Thoai, nccData?.dia_Chi));
    }
    setChiTietHangHoa(prevDataSource => {
      return prevDataSource.map(item => {
        if (item.guid === key) {
          switch (type) {
            case 'ma_kh':
              return {
                ...item,
                ma_kh: ncc?.item.code || '', // Update ma_kh with ncc code
                ncc_name: ncc?.item.name || '', // Add ncc name for display
                dien_giai: formatDienGiai(nccData?.dien_Thoai, nccData?.dia_Chi), // Gán giá trị ghi chú
              };
            case 'nhaCungCap1':
              return {
                ...item,
                nhaCungCap1: ncc?.item.code || '', // Update ma_kh with ncc code
              };
            case 'nhaCungCap2':
              return {
                ...item,
                nhaCungCap2: ncc?.item.code || '', // Update ma_kh with ncc code
              };
            case 'nhaCungCap3':
              return {
                ...item,
                nhaCungCap3: ncc?.item.code || '', // Update ma_kh with ncc code
              };
            default:
              return item;
          }
        }
        return item;
      });
    });
  };
  useEffect(() => {
    getGiaandNcc();
  }, [proposal]);
  const getGiaandNcc = async () => {
    const danhSachMakho = data[0].ma_kho;
    const danhSachMaHang = data.map(d => d.ma_vt);

    await AccountingInvoiceService.Post.GetGiaVaNhaCungCap({
      madvcs: 'THUCHIEN',
      danhSachMaHang: danhSachMaHang,
      ngay_kiem_tra: dayjs().format(FormatDateAPI),
      danhSachMakho: [],
    }).subscribe(res => {
      // Check if res is an empty string or invalid JSON
      if (!res || res.trim() === '') {
        GetTheLowestSupplierPrice([]); // Pass an empty array
        GetTheNearestSupplierPrice([]); // Pass an empty array
        return; // Exit early if res is empty
      }

      // Proceed with processing the response if not empty
      let data = res
        .replaceAll('\\"', '"') // Replace escaped double quotes
        .replaceAll(/"\[|\]"/g, (match: string) => match.replace(/"/g, '')) // Remove quotes before/after brackets
        .replaceAll(/\n/g, '') // Remove newline characters
        .replaceAll(/\r/g, ''); // Remove carriage return characters

      try {
        const jsonParse = JSON.parse(data);

        // Process based on type
        GetTheLowestSupplierPrice(jsonParse);
        GetTheNearestSupplierPrice(jsonParse);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        GetTheLowestSupplierPrice([]); // Pass an empty array in case of error
        GetTheNearestSupplierPrice([]); // Pass an empty array in case of error
      }
    });
  };
  // [16/10/2024][#20413][ngoc_td]  add async await for button
  const GetTheLowestSupplierPrice = async (data: any[]) => {
    setChiTietHangHoa(prevData =>
      prevData.map(item => {
        const matchedItem = data.find(d => d.ma_vt === item.ma_vt);
        const min = matchedItem
          ? Number(
            matchedItem.gia_thap_nhat
              .toString()
              .toString()
              .replace(/\.(\d*?)0+$/, '.$1')
              .replace(/\.$/, ''),
          )
          : 0;
        return matchedItem ? { ...item, min: min.toLocaleString('en-US') } : item;
      }),
    );
  };

  const GetTheNearestSupplierPrice = async (data: any[]) => {
    setChiTietHangHoa(prevData =>
      prevData.map(item => {
        const matchedItem = data.find(d => d.ma_vt === item.ma_vt);
        const ncc = matchedItem
          ? optionsNcc.find(i => i.item.code === matchedItem.nha_cung_cap_gan_nhat)
          : { item: { name: '' } };
        const nearest = matchedItem
          ? Number(
            matchedItem.gia_gan_nhat
              .toString()
              .toString()
              .replace(/\.(\d*?)0+$/, '.$1')
              .replace(/\.$/, ''),
          )
          : 0;
        return matchedItem
          ? {
            ...item,
            nearest: nearest.toLocaleString('en-US'),
            nccNearest: ncc ? ncc?.item.name : '',
          }
          : item;
      }),
    );
  };
  useEffect(() => {
    const updatedData = data.map(item => {
      const product = productList.find(p => p.ma_vt === item.ma_vt);
      const report = baoCao?.find((b: { ma_vt: string }) => b.ma_vt === item.ma_vt);
      const imprt = nhapKho?.find((b: IBaoXuatNhapTonData) => b.ma_vt === item.ma_vt);
      const giaKeHoach = report ? report.gia_gan_nhat : 0;
      const soLuongKeHoach = imprt ? Number(imprt.luong_xuat) : 0;
      // const phan_Tram_Thue = dataVAT && dataVAT?.find((d: any) => d?.chiTietHangHoaVAT[0]?.ma_Vt === item?.ma_vt);
      // Gán giá trị nhaCungCap3 nếu ma_kh rỗng
      const maKh = item.ma_kh ? item.ma_kh : item.nhaCungCap3;
      const nccItem = nccList.find(ncc => ncc.ten_kh === maKh);
      const nccName = nccItem ? nccItem.ma_kh : '';
      const hinhthuc_tt = typeof item.hinhthuc_tt === 'number' ? item.hinhthuc_tt : undefined;

      return {
        ...item,
        name: product?.ten_vt || '',
        unit: product?.dvt || '',
        giaKeHoach: giaKeHoach,
        // vatRate: (dataVAT && phan_Tram_Thue?.chiTietHangHoaVAT[0]?.ma_Thue) || 0,
        ma_kh: item.ma_kh ? item.ma_kh : nccName, // Gán giá trị ma_kh đã kiểm tra
        luong_xuat: soLuongKeHoach,
        so_luong_nhap1: capDuyet === 0 ? item.so_luong_yeu_cau : item.so_luong_nhap1,
        gia: item.gia ? item.gia : item.gia3,
        hinhthuc_tt,
      };
    });

    setChiTietHangHoa(updatedData);
    setChiTietHangHoaClone(updatedData);
    const initialDienGiaiValues = data.reduce((acc, item) => {
      acc[item.ma_vt] = item.dien_giai || ''; // Gán giá trị dien_giai nếu tồn tại, ngược lại là ''
      return acc;
    }, {} as { [key: string]: string });

    setDienGiaiValues(initialDienGiaiValues);
  }, [data, productList, baoCao, nccList, capDuyet]);
  //1/11/2024: [ngoc_td] hotfix format number
  const renderEditableCell = (row: ChiTietDeNghiMuaHangDTO, dataIndex: keyof ChiTietDeNghiMuaHangDTO) => {
    const handleInputChange = (value: number | null, key: string) => {
      setChiTietHangHoa(prevData =>
        prevData.map(item => (item.id?.toString() === key ? { ...item, [dataIndex]: value ?? 0 } : item)),
      );
    };

    const isThueField = dataIndex === 'vatRate';

    // Gán giá trị mặc định nếu là cột "gia"
    let value = row[dataIndex] as number;

    // Nếu là cột "gia" và value đang rỗng hoặc = 0, thì gán giá trị từ "gia3"
    if (dataIndex === 'gia' && (!value || value === 0) && row.gia3) {
      value = row.gia3;
      // Cập nhật lại state dữ liệu để lưu giá trị gia3 vào gia
      // setChiTietHangHoa((prevData) =>
      //   prevData.map((item) =>
      //     item.id === row.id ? { ...item, gia: row.gia3 } : item
      //   )
      // );
    }


    if (isThueField) {
      const options = [
        { label: '0', value: 0 },
        { label: '5', value: 5 },
        { label: '8', value: 8 },
        { label: '10', value: 10 },
        { label: 'K', value: -1 },
      ];

      return (
        <Select
          value={row[dataIndex] === -1 ? -1 : row[dataIndex] ?? 0}
          style={{ width: '100%' }}
          onChange={(value) => handleInputChange(value, row.id?.toString() ?? '')}
        >
          {options.map((opt) => (
            <Option key={opt.label} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      );
    }

    return (
      <InputNumber
        value={value}
        min={isThueField ? 0 : undefined}
        max={isThueField ? 100 : undefined}
        formatter={val => (val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
        parser={val => (val ? parseFloat(val.replace(/,/g, '')) : 0)}
        onChange={val => handleInputChange(val as number | null, row.id?.toString() ?? '')}
        style={{ width: '100%' }}
      />
    );
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN'); // Use 'vi-VN' for Vietnamese locale
  };
  // [21/10/2024][#20538][phuong_td] Cố định một số trường dữ liệu trên table
  const columns: ColumnType<(typeof chiTietHangHoa)[0]>[] = [
    {
      title: <span>{t('Material code')}</span>,
      dataIndex: 'ma_vt',
      key: 'ma_vt',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (text, record) => {
        const product = productList.find(p => p.ma_vt === text);
        return <span>{text}</span>;
      },
    },
    {
      title: <span>{t('Material name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      align: 'center',
      fixed: 'left',
    },
    {
      title: <span>{t('Unit')}</span>,
      dataIndex: 'unit',
      key: 'unit',
      width: 93,
      align: 'center',
    },
    {
      title: <span>{t('This time proposal')}</span>,
      dataIndex: 'so_luong_yeu_cau',
      key: 'so_luong_yeu_cau',
      width: 120,
      align: 'center',
    },
    {
      title: <span>{t('Approved by')}</span>,
      dataIndex: 'NguoiDuyet1',
      key: 'NguoiDuyet1',
      width: 136,
      align: 'center',
      render: (text, record) => user.Firstname, // Assign userIIS[0].un to NguoiDuyet1
    },
    {
      title: <span>NCC được duyệt</span>,
      dataIndex: 'ma_kh',
      key: 'ma_kh',
      width: 197,
      render: (text, record) => {
        const nccItem = record.ma_kh ? nccList.find(ncc => ncc.ma_kh === record.ma_kh) : nccList.find(ncc => ncc.ma_kh === record.nhaCungCap3);
        const nccName = nccItem ? nccItem.ten_kh : '';
        let value = nccName || '';
        return renderAutoComplete(record.guid || '', optionsNcc, value.toString(), 'ma_kh', { width: 400 });
      },
      align: 'center',
    },
    {
      title: <span>{t('Approved quantity')}</span>,
      dataIndex: 'so_luong_nhap1',
      key: 'so_luong_nhap1',
      width: 197,
      render: (text, record) => renderEditableCell(record, 'so_luong_nhap1'),
      align: 'center',
    },
    {
      title: <span>Giá kế hoạch</span>,
      dataIndex: 'giaKeHoach',
      key: 'giaKeHoach',
      width: 130,
      align: 'center',
      render: text => Number(text).toLocaleString('en-US') || 0,
    },
    {
      title: <span>Số lượng kế hoạch</span>,
      dataIndex: 'luong_xuat',
      key: 'luong_xuat',
      width: 130,
      align: 'center',
      render: text => Number(text).toLocaleString('en-US') || 0,
    },
    {
      title: <span>{t('Giá được duyệt chưa VAT')}</span>,
      dataIndex: 'gia',
      key: 'gia',
      width: 157,
      render: (text, record) => renderEditableCell(record, 'gia'),
      align: 'center',
    },
    {
      title: <span>{t('% Thuế')}</span>,
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 157,
      render: (text, record) => {
        return renderEditableCell(record, 'vatRate')
      },
      align: 'center',
    },
    {
      title: <span>{t('Tiền thuế')}</span>,
      dataIndex: 'tien_thue',
      key: 'tien_thue',
      width: 157,
      render: (text, record) => {
        const gia = Number(record.gia) || 0;
        const thue = Number(record.vatRate === -1 ? 0 : record.vatRate) || 0;
        const tienthue = gia * (thue / 100) * (record.so_luong_nhap1 || 0);
        return tienthue ? Number(tienthue.toFixed(2)).toLocaleString('en-US') : '0.00';
      },
      align: 'center',
    },
    {
      title: <span>Tổng số tiền chưa VAT</span>,
      dataIndex: 'tien',
      key: 'tien',
      width: 124,
      align: 'center',
      render: (text, record) => {
        const soLuongNhap = record.so_luong_nhap1 || 0;
        const gia = record.gia || 0;
        const thanhTien = soLuongNhap * gia;
        // Format thành tiền với dấu phẩy ngăn cách hàng nghìn
        return thanhTien.toLocaleString('en-US');
      },
    },
    {
      title: <span>{t('Thành tiền gồm VAT')}</span>,
      dataIndex: 'gia_gom_vat',
      key: 'gia_gom_vat',
      width: 157,
      render: (text, record) => {
        const gia = record.gia || 0;
        const thue = record.vatRate && record.vatRate === 'K' ? 0 : +record.vatRate;
        const giaGomVAT = (gia + gia * (thue / 100)) * (record.so_luong_nhap1 || 0);
        return giaGomVAT ? Number(giaGomVAT.toFixed(2)).toLocaleString('en-US') : '0.00';
      },
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Giá thấp nhất</span>,
      dataIndex: 'min',
      key: 'min',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} thấp nhất</span>,
      dataIndex: 'nccMin',
      key: 'nccMin',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Giá gần nhất</span>,
      dataIndex: 'nearest',
      key: 'nearest',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} gần nhất</span>,
      dataIndex: 'nccNearest',
      key: 'nccNearest',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Price')} 1</span>,
      dataIndex: 'gia1',
      key: 'gia1',
      width: 130,
      render: (text, record) => {
        if (capDuyet === 0) {
          return renderEditableCell(record, 'gia1');
        } else {
          return text;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 1</span>,
      dataIndex: 'nhaCungCap1',
      key: 'nhaCungCap1',
      width: 197,
      render: (text: string | JSX.Element, record) => {
        const nccItem = nccList.find(ncc => ncc.ma_kh === record.nhaCungCap1);
        const nccName = nccItem ? nccItem.ten_kh : '';
        let value = nccName || '';
        if (capDuyet === 0) {
          return renderAutoComplete(record.guid || '', optionsNcc, value.toString(), 'nhaCungCap1', { width: 400 });
        } else {
          return value;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Price')} 2</span>,
      dataIndex: 'gia2',
      key: 'gia2',
      width: 130,
      render: (text, record) => {
        if (capDuyet === 0) {
          return renderEditableCell(record, 'gia2');
        } else {
          return text;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 2</span>,
      dataIndex: 'nhaCungCap2',
      key: 'nhaCungCap2',
      width: 197,
      render: (text: string | JSX.Element, record) => {
        const nccItem = nccList.find(ncc => ncc.ma_kh === record.nhaCungCap2);
        const nccName = nccItem ? nccItem.ten_kh : '';
        let value = nccName || '';
        if (capDuyet === 0) {
          return renderAutoComplete(record.guid || '', optionsNcc, value.toString(), 'nhaCungCap2', { width: 400 });
        } else {
          return value;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Price')} 3</span>,
      dataIndex: 'gia3',
      key: 'gia3',
      width: 130,
      render: (text, record) => {
        if (capDuyet === 0) {
          return renderEditableCell(record, 'gia3');
        } else {
          return text;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 3</span>,
      dataIndex: 'nhaCungCap3',
      key: 'nhaCungCap3',
      width: 197,
      render: (text: string | JSX.Element, record) => {
        const nccItem = nccList.find(ncc => ncc.ma_kh === record.nhaCungCap3);
        const nccName = nccItem ? nccItem.ten_kh : '';
        let value = nccName || '';
        if (capDuyet === 0) {
          return renderAutoComplete(record.guid || '', optionsNcc, value.toString(), 'nhaCungCap3', { width: 400 });
        } else {
          return value;
        }
      },
      className: styles.tablecell,
      align: 'center',
    },
    //[10/1/2025][ngoc_td] thêm trường ghi chú cho duyệt đề xuất
    {
      title: <span className={styles.tableHeader}>Ghi chú</span>,
      dataIndex: 'dien_giai',
      key: 'dien_giai',
      width: 300,
      render: (_: any, record: any) => {
        return (
          <Input
            value={dienGiaiValues[record.ma_vt] || ''}
            onChange={e => handleDienGiaiChange(record.ma_vt, e.target.value)}
          />
        );
      },
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: 'Hình thức thanh toán',
      dataIndex: 'hinhthuc_tt',
      key: 'hinhthuc_tt',
      align: 'center',
      width: 200,
      render: (value: number, record) => (
        <Select
          value={value}
          options={PAYMENT_OPTIONS}
          style={{ width: '100%' }}
          onChange={(val: number) => {
            setChiTietHangHoa(prev =>
              prev.map(item => (item.guid === record.guid ? { ...item, hinhthuc_tt: val } : item)),
            );
          }}
        />
      ),
    },
  ];

  const confirmProposal = () => {
    // Destructure to remove color from proposal
    const { color, ...proposalWithoutColor } = proposal;
    let alertBoolean = false;
    // Remove 'name' and 'unit' properties from chiTietHangHoa
    const updatedChiTietHangHoa1 = chiTietHangHoa.map(item => {
      const { name, unit, key, ...rest } = item; // Destructure to remove name
      return rest; // Return the rest of the properties
    });

    updatedChiTietHangHoa1.forEach(item => {
      if (item.giaKeHoach === 0 || item.giaKeHoach === null) {
        alertBoolean = false;
      } else if (item.giaKeHoach < (item.gia ?? 0)) {
        // Only prevent approval if user doesn't have ApproveOverBudget permission
        if (!hasApproveOverBudgetPermission) {
          alertBoolean = true;
        }
      }
    });

    const updatedChiTietHangHoa = chiTietHangHoa.map(item => {
      const { name, unit, key, giaKeHoach, ncc_name, ...rest } = item; // Destructure to remove name
      return {
        ...rest,
        dien_giai: dienGiaiValues[item.ma_vt] || '',
        hinhthuc_tt: item.hinhthuc_tt ?? EPaymentMethod.Cash,

      }; // Return the rest of the properties
    });

    // Initialize a new variable with the proposal object
    const updatedProposal = {
      ...proposalWithoutColor,
      dien_giai: dienGiai,
      chiTietHangHoa: updatedChiTietHangHoa,
      chiTietDeNghiMuaHang: updatedChiTietHangHoa,
      hoaDonVAT: [],
      ngay_duyet1: capDuyet === 0 ? dayjs().format('YYYY-MM-DD') : proposal.ngay_duyet1,
      ngay_duyet2: capDuyet === 1 ? dayjs().format('YYYY-MM-DD') : proposal.ngay_duyet2,
      ngay_duyet3: capDuyet === 2 ? dayjs().format('YYYY-MM-DD') : proposal.ngay_duyet3,
      list_of_extensions: [],
    };

    // Assign the user based on the value of capDuyet
    if (userIIS && userIIS.length > 0) {
      switch (capDuyet) {
        case 0:
          updatedProposal.nguoiDuyet1 = userIIS[0].un; // Assign user to nguoiDuyet1
          break;
        case 1:
          updatedProposal.nguoiDuyet2 = userIIS[0].un; // Assign user to nguoiDuyet2
          break;
        case 2:
          updatedProposal.nguoiDuyet3 = userIIS[0].un; // Assign user to nguoiDuyet3
          break;
        case 3:
          updatedProposal.nguoiDuyet4 = userIIS[0].un; // Assign user to nguoiDuyet4
          break;
        case 4:
          updatedProposal.nguoiDuyet5 = userIIS[0].un; // Assign user to nguoiDuyet5
          break;
        default:
          console.warn('Unknown capDuyet level');
          break;
      }
    } else {
      console.warn('userIIS is undefined or empty');
    }
    if (alertBoolean) {
      setShowWarning(true);
    } else {

      dispatch(
        accountingInvoiceActions.ConfirmProposalForm({
          data: updatedProposal as unknown as PhieuDeNghiMuaHangDTO,
          params: {},
        }),
      );
      handleClose();
    }
  };
  return (
    <div>
      <div>
        <Row>
          <Col>
            <Title level={3}>Duyệt đề xuất vật tư</Title>
          </Col>
        </Row>
        <Row>
          <span style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: '500' }}>Tên công trình: </span>
            <span>{project}</span>
          </span>
        </Row>
        <Form
          initialValues={{
            code: proposal.id,
            category: proposal.ma_ct,
          }}
          className={styles.formLayout}
        >
          <Row gutter={16} style={{ width: '120%' }}>
            <Col span={5} className={styles.formItemCol}>
              <Form.Item label={`Cấp duyệt hiện tại`} name="code" className={styles.formItem}>
                <div>{proposal.capDuyetHienTai === 0 ? 'Ráp giá' : proposal.capDuyetHienTai}</div>
              </Form.Item>
            </Col>
            <Col span={5} className={styles.formItemCol}>
              <Form.Item label={t('Date of creation of ticket')} className={styles.formItem}>
                <div>{formatDate(proposal.createDate)}</div>
              </Form.Item>
            </Col>
            {capDuyet > 0 && (
              <Col span={5} className={styles.formItemCol}>
                <Form.Item label={t('Ngày ráp giá: ')} className={styles.formItem}>
                  <div>{dayjs(proposal.ngay_duyet1).format('DD/MM/YYYY')}</div>
                </Form.Item>
              </Col>
            )}
            {capDuyet > 1 && (
              <Col span={5} className={styles.formItemCol}>
                <Form.Item label={t('Ngày duyệt 1: ')} className={styles.formItem}>
                  <div>{dayjs(proposal.ngay_duyet2).format('DD/MM/YYYY')}</div>
                </Form.Item>
              </Col>
            )}
          </Row>
          <Row gutter={16} style={{ width: '120%' }}>
            <Row gutter={16} style={{ width: '120%' }}>
              <Col span={16} style={{ width: '120%' }}>

                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%', marginBottom: 5, paddingLeft: 10 }}
                >
                  <span className={styles.labeltext} style={{ flex: 1 }}>
                    {t('Interpret')}
                  </span>
                  <Input
                    style={{ width: '100%' }}
                    defaultValue={proposal.dien_giai || ''}
                    onChange={(e) => setDienGiai(e.target.value)}
                  />
                </div>
              </Col>
            </Row>
          </Row>
        </Form>

        <Table
          dataSource={chiTietHangHoa}
          columns={columns}
          rowHoverable={false}
          pagination={false}
          scroll={{ x: 'max-content', y: '50vh' }}
        />
      </div>
      <div style={{ textAlign: 'right', width: '100%', paddingRight: 40, fontWeight: 'bold' }}>
        Tổng thành tiền: {totalThanhTien.toLocaleString('en-US')} VND
      </div>
      <div id="div2" className={styles.container}>
        {/* Show the "Import to warehouse" button only if capDuyet >= 3 */}

        <div>
        </div>
        <div className={styles.buttonNhapkho}>
          <Button
            type="primary"
            disabled={userIIS && userIIS[0] ? userIIS[0].capDuyetChi !== value : true}
            onClick={confirmProposal}
          >
            {capDuyet === 0 ? 'Ráp giá' : 'Duyệt đề xuất'}
          </Button>
        </div>
      </div>
      <div style={{ textAlign: 'right', width: '100%' }}>
        {showWarning && <span style={{ color: 'red' }}>Giá duyệt không được cao hơn giá kế hoạch!</span>}
      </div>
    </div>
  );
};
export default MachineryMaterialsConfirm;
