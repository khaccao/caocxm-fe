/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import {
  CaretDownOutlined,
  CaretUpOutlined,
} from '@ant-design/icons';
import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useWindowSize } from '@/hooks';
import { ChiTietHangHoaDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getDieuchuyenvattu, getProducts, getTypeDieuChuyen } from '@/store/accountingInvoice';
import { useAppSelector } from '@/store/hooks';
import styles from './TranMaterials.module.css';
export interface DataType {
  id: number;
  del: boolean;
  madvcs: string;
  recId: number;
  ma_ct: string;
  ngay_ct: string;
  so_ct: string;
  loai_tt: number;
  han_tt: string;
  ma_kh: string;
  ma_bo_phan: string;
  nguoi_tt: string;
  nv_bh: string;
  dia_chi: string;
  dien_giai: string;
  ma_nt: string;
  ty_gia: number;
  info: string;
  is_local: boolean;
  release: boolean;
  moduleName: string;
  createDate: string;
  capDuyet: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  recIdparent: number;
  nguoiDuyet1: string;
  nguoiDuyet2: string;
  nguoiDuyet3: string;
  recIdrelation: number;
  guid: string;
  nguoiDuyet4: string;
  nguoiDuyet5: string;
  guidRelation: string;
  chiTietHangHoa: Array<{
    id: number;
    recId: number;
    ma_vt: string;
    ma_kho: string;
    so_luong: number;
    gia: number;
    tien: number;
    gia_nt: number;
    tien_nt: number;
    dien_giai: string;
    tk_no: string;
    tk_co: string;
    so_hopdong: string;
    ma_Vv: string;
    ma_Km: string;
    ma_kho1: string;
    tinh_gia_von_truc_tiep: boolean;
    createDate: string;
    guid: string;
    guidRelation: string;
  }>;
  hoaDonVAT: any;
  list_of_extensions: any;
  chiTietDeNghiMuaHang: any;
  date: string;
  // [23/10/2024][#20578][phuong_td] thêm thuộc tính children để expand
  children: ChiTietHangHoaDTO[];
}
interface GroupedDataType {
  date: string;
  items: DataType[];
}
const TranMaterials: React.FC = () => {
  const { t } = useTranslation('material');
  const dispatch = useDispatch();
  const products = useAppSelector(getProducts()) || [];
  const DanhSachVatTu = products.filter(item => item.productType !== 2);
  const DanhSachMayMoc = products.filter(item => item.productType === 2);
  const Dieuchuyenvattu = useAppSelector(getDieuchuyenvattu());
  const typeDieuChuyen = useAppSelector(getTypeDieuChuyen());
  // get all includes may moc
  const vatTuMap = products ? new Map(products.map(vatTu => [vatTu.ma_vt, { ten: vatTu.ten_vt, dvt: vatTu.dvt }])) : new Map();
  const [transferList, setTransferList] = useState<any[]>(Dieuchuyenvattu);
  // [23/10/2024][#20578][phuong_td] lấy kích thước của window
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!Array.isArray(Dieuchuyenvattu)) {
      setTransferList([]);
      return;
    }
    console.log(Dieuchuyenvattu, 'Dieuchuyenvattu');
    let allowedMaVt: Set<string> = new Set();

    if (typeDieuChuyen === 'VatTuChinh') {
      allowedMaVt = new Set(
        DanhSachVatTu.filter(vt => vt.productType === 1).map(vt => vt.ma_vt)
      );
    } else if (typeDieuChuyen === 'VatTuPhu') {
      allowedMaVt = new Set(
        DanhSachVatTu.filter(vt => vt.productType === 0).map(vt => vt.ma_vt)
      );
    } else if (typeDieuChuyen === 'MayMoc') {
      allowedMaVt = new Set(
        DanhSachMayMoc.map(vt => vt.ma_vt)
      );
    }

    const filtered = Dieuchuyenvattu.filter(item => {
      const ma_vt = item?.chiTietHangHoa?.[0]?.ma_vt;

      return ma_vt && allowedMaVt.has(ma_vt);
    });
    // 🔒 So sánh kỹ để tránh setTransferList không cần thiết
    const isEqual = JSON.stringify(filtered) === JSON.stringify(transferList);
    if (!isEqual) {
      setTransferList(filtered);
    }
  }, [Dieuchuyenvattu, DanhSachVatTu, typeDieuChuyen]);
  useEffect(() => {
    dispatch(accountingInvoiceActions.setUpdateTransfer(transferList as any));
  }, [transferList]);
  if (!Array.isArray(Dieuchuyenvattu) || Dieuchuyenvattu.length === 0) {
    return <div></div>;
  }
  const handleCheckboxChange = (checked: boolean, record: DataType) => {
    setTransferList(prevList =>
      prevList.map(item =>
        item.id === record.id ? { ...item, release: checked } : item
      )
    );
  };
  // [23/10/2024][#20578][phuong_td] Gắn giá trị children cho item 
  const groupedData = transferList.reduce((acc: GroupedDataType[], _item: DataType) => {
    const item = { ..._item };
    if (item.ma_ct === 'PXDC') {
      const dateGroup = acc.find((group: GroupedDataType) => group.date === item.ngay_ct.split('T')[0]);
      if (item.chiTietHangHoa) item.children = [...item.chiTietHangHoa];
      if (dateGroup) {
        dateGroup.items.push(item);
      } else {
        acc.push({ date: item.ngay_ct.split('T')[0], items: [item] });
      }
    }
    return acc;
  }, [] as GroupedDataType[])
    .sort((a: GroupedDataType, b: GroupedDataType) => new Date(b.date).getTime() - new Date(a.date).getTime());

  groupedData.forEach((group: { items: any[] }) => {
    group.items.sort((a, b) => {

      const dateComparison = new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
      if (dateComparison !== 0) return dateComparison;


      return b.id - a.id;
    });
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedList = transferList.map(item => ({ ...item, release: checked }));
    setTransferList(updatedList);

  };

  const isAllSelected = transferList.every(item => item.release);


  const columns: ColumnsType<DataType> = [
    {
      title: 'Mã',
      dataIndex: 'ma_ct',
      key: 'ma',
      width: '6%',
      align: 'center',
      render: (text: string, record: any) => {
        return '';

      },
    },
    {
      title: 'Công trình điều chuyển',
      dataIndex: 'chiTietHangHoa',
      key: 'congtrinhdc',
      width: '10%',
      align: 'center',
      render: (text: any, record: any) => {

        if (record.ma_ct) {
          return <span style={{ fontWeight: 'bold' }}>{t(record.ma_ct)}</span>
        }
        return record.ma_kho;

      },
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'chiTietHangHoa',
      key: 'mavattu',
      width: '10%',
      align: 'center',
      render: (text: any, record: any) => {

        return record.ma_vt;
      },
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'chiTietHangHoa',
      key: 'tenvattu',
      width: '20%',
      align: 'center',
      render: (text: any, record: any) => {
        const ma_vt = record.ma_vt ?? '';
        return vatTuMap.has(ma_vt) ? vatTuMap.get(ma_vt)?.ten : '';
      },
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'chiTietHangHoa',
      key: 'donvi',
      width: '8%',
      align: 'center',
      render: (text: any, record: any) => {
        const ma_vt = record.ma_vt ?? '';
        return vatTuMap.has(ma_vt) ? vatTuMap.get(ma_vt)?.dvt : '';
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'chiTietHangHoa',
      key: 'soluong',
      width: '8%',
      align: 'center',
      render: (text: any, record: any) => {
        return record.so_luong;

      },
    },
    {
      title: 'Công trình nhận điều chuyển',
      dataIndex: 'chiTietHangHoa',
      key: 'congtrinhnhandc',
      width: '13%',
      align: 'center',
      render: (text: any, record: any) => {
        return record.ma_kho1;

      },
    },
    // {
    //   title: <Checkbox
    //     checked={isAllSelected}
    //     onChange={e => handleSelectAll(e.target.checked)}
    //   >
    //     Duyệt
    //   </Checkbox>,
    //   dataIndex: 'release',
    //   key: 'duyet',
    //   width: '10%',
    //   align: 'left',
    //   render: (text: any, record: DataType) =>
    //     record.release === true || record.release === false ? (<>
    //       <Checkbox
    //         checked={record.release}
    //         onChange={(e) => handleCheckboxChange(e.target.checked, record)}
    //       />
    //       <span>{record.release ? record.nguoiDuyet3 : ''}</span>
    //     </>

    //     ) : null,
    // },
  ];

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        dataSource={groupedData.flatMap((group: { date: string; items: any[] }) => [
          { key: group.date, date: formatDate(group.date), isGroupHeader: true },
          ...group.items
        ])}
        pagination={false}
        rowKey={(record: DataType & { isGroupHeader?: boolean; date?: string }) =>
          record.isGroupHeader ? `header-${record.date}` : `item-${record.id}`
        }

        rowClassName={(record, index) => {
          const { children } = record;
          return !children ? '' : styles.headerColor;
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 175px)' }}
        components={{
          body: {
            row: ({ children, ...props }: any) => {
              if (props['data-row-key'] && props['data-row-key'].startsWith('header-')) {
                return (
                  <tr {...props}>
                    <td colSpan={columns.length}>
                      <h2 className={`${styles.tableHeader} ${styles.tableDate}`}>{props['data-row-key'].split('-')[1]}</h2>
                    </td>
                  </tr>
                );
              }
              return <tr {...props}>{children}</tr>;
            },
          },
        }}

        expandable={{
          expandIcon: ({ expanded, onExpand, record }) => {
            const { children } = record;
            if (!children || children.length === 0) {
              return record.ma_ct;
            }
            return expanded ? (
              <Space style={{ display: 'flex', flexDirection: 'row' }}>
                <CaretUpOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ fontSize: '18px', color: '#000000', border: 'node' }}
                />
                <span style={{ fontWeight: 'bold' }}>{record.ma_ct}</span>
              </Space>
            ) : (
              <Space style={{ display: 'flex', flexDirection: 'row' }}>
                <CaretDownOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ fontSize: '18px', color: '#52c41a' }}
                />
                <span style={{ fontWeight: 'bold' }}>{record.ma_ct}</span>
              </Space>
            );
          },
          expandIconColumnIndex: 0,
          defaultExpandAllRows: true
        }}
      />
    </div>
  );

};
export default TranMaterials;