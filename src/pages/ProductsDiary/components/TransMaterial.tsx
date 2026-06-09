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
import { accountingInvoiceActions, getDieuchuyenvattu, getMayMoc, getProducts } from '@/store/accountingInvoice';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';
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
  const DanhSachVatTu = useAppSelector(getProducts());
  const Dieuchuyenvattu = useAppSelector(getDieuchuyenvattu());
  const vatTuMap = DanhSachVatTu ? new Map(DanhSachVatTu.map(vatTu => [vatTu.ma_vt, { ten: vatTu.ten_vt, dvt: vatTu.dvt }])) : new Map();
  const [transferList, setTransferList] = useState<any[]>(Dieuchuyenvattu);
  const DanhSachMayMoc = useAppSelector(getMayMoc());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const warehouseCode = projectwareHouses?.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode;
  // [23/10/2024][#20578][phuong_td] lấy kích thước của window
  const windowSize = useWindowSize();

  useEffect(() => {
    console.log(Dieuchuyenvattu, 'Dieuchuyenvattu');
    if (Array.isArray(Dieuchuyenvattu)) {
      setTransferList(Dieuchuyenvattu);
    } else {
      setTransferList([]); // Fallback to an empty array
    }
  }, [Dieuchuyenvattu]);
  useEffect(() => {
    console.log(transferList);
    dispatch(accountingInvoiceActions.setUpdateTransfer(transferList as any));
  }, [transferList]);
  if (!Array.isArray(Dieuchuyenvattu) || Dieuchuyenvattu.length === 0) {
    return <div></div>;
  }

  // [23/10/2024][#20578][phuong_td] Gắn giá trị children cho item 
  const groupedData = transferList.reduce((acc: GroupedDataType[], _item: DataType) => {
    const item = { ..._item };

    const dateGroup = acc.find((group: GroupedDataType) => group.date === item.ngay_ct.split('T')[0]);
    if (item.chiTietHangHoa) item.children = [...item.chiTietHangHoa];
    if (dateGroup) {
      dateGroup.items.push(item);
    } else {
      acc.push({ date: item.ngay_ct.split('T')[0], items: [item] });
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



  const columns: ColumnsType<DataType> = [

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
      title: 'Số lượng nhập',
      dataIndex: 'chiTietHangHoa',
      key: 'soluong',
      width: '8%',
      align: 'center',
      render: (text: any, record: any) => {
        const ma_vt = record.ma_vt ?? '';
        return record.so_luong;
      },
    },
    {
      title: 'Số lượng xuất',
      dataIndex: 'chiTietHangHoa',
      key: 'soluong',
      width: '8%',
      align: 'center',
      render: (text: any, record: any) => {
        return record.so_luong;

      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'chiTietHangHoa',
      key: 'ghichu',
      width: '13%',
      align: 'center',
      render: (text: any, record: any) => {
        return record.ma_kho1;

      },
    },
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
        scroll={{ x: 'max-content', y: windowSize[1] * 0.65 }}
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
            const firstItem = record.chiTietHangHoa[0];
            let title;
            if (record.ma_ct === 'PXDC') {title = 'Điều chuyển'} else {
              if (DanhSachVatTu.some(vt => vt.ma_vt === firstItem.ma_vt)) {
                title = 'Vật tư'
              } else if (DanhSachMayMoc.some(vt => vt.ma_vt === firstItem.ma_vt)) {
                title = 'Máy móc - CCDC'
              }
            }

            return expanded ? (
              <Space style={{ display: 'flex', flexDirection: 'row' }}>
                <CaretUpOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ fontSize: '18px', color: '#000000', border: 'node' }}
                />
                <span style={{ fontWeight: 'bold' }}>{title}</span>
              </Space>
            ) : (
              <Space style={{ display: 'flex', flexDirection: 'row' }}>
                <CaretDownOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ fontSize: '18px', color: '#52c41a' }}
                />
                <span style={{ fontWeight: 'bold' }}>{title}</span>
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