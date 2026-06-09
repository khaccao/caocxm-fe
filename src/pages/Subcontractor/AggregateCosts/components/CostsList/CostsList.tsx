import React from 'react';

import { EllipsisOutlined } from '@ant-design/icons';
import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './CostsList.module.less';
import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';

interface DataType {
  key: string;
  date: string;
  description: string;
  quantity: string;
  paymentValue: string;
  cumulativeValue: string;
  contractor: string;
}
export interface PaymentTerm {
  code: string;
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
  khoiLuong: number;
  projectId: number;
  paymentTermDate: string;
  paymentTerm: number;
  id: number;
}
interface GroupHeaderType {
  key: string;
  paymentTermDate: string;
  giaTriThanhToanKeHoach: string;
  isGroupHeader: boolean;
}

type TableDataType = PaymentTerm | GroupHeaderType;

const data: DataType[] = [
  {
    key: '1',
    date: '12/07/2023',
    description: 'Xây tô lần 1',
    quantity: '10',
    paymentValue: '50.000.000',
    cumulativeValue: '50.000.000',
    contractor: 'Nhà thầu cọc nhồi',
  },
  {
    key: '2',
    date: '27/07/2023',
    description: 'Xây tô lần 2',
    quantity: '20',
    paymentValue: '30.000.000',
    cumulativeValue: '80.000.000',
    contractor: 'Nhà thầu cọc nhồi',
  },
  {
    key: '3',
    date: '12/08/2023',
    description: '',
    quantity: '',
    paymentValue: '',
    cumulativeValue: '',
    contractor: 'Nhà thầu cọc nhồi',
  },
  {
    key: '4',
    date: '27/08/2023',
    description: '',
    quantity: '',
    paymentValue: '',
    cumulativeValue: '',
    contractor: 'Nhà thầu cọc nhồi',
  },
  {
    key: '5',
    date: '12/07/2023',
    description: 'Xây tô lần 1',
    quantity: '',
    paymentValue: '50.000.000',
    cumulativeValue: '50.000.000',
    contractor: 'Nhà thầu cừ lasen',
  },
  {
    key: '6',
    date: '27/07/2023',
    description: 'Xây tô lần 2',
    quantity: '20',
    paymentValue: '30.000.000',
    cumulativeValue: '80.000.000',
    contractor: 'Nhà thầu cừ lasen',
  },
  {
    key: '7',
    date: '12/08/2023',
    description: '',
    quantity: '',
    paymentValue: '',
    cumulativeValue: '',
    contractor: 'Nhà thầu cừ lasen',
  },
  {
    key: '8',
    date: '27/08/2023',
    description: '',
    quantity: '',
    paymentValue: '',
    cumulativeValue: '',
    contractor: 'Nhà thầu cừ lasen',
  },
];

const CostsList: React.FC = () => {
  const { t } = useTranslation('subcontractor');
  const Costs = useAppSelector((state: RootState) => state.project.paymentByProject || []);
  const windowSize = useWindowSize();

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) return '0';
    return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  };

  const calculateTotalCumulative = (items: PaymentTerm[]) => {
    return formatNumber(
      items.reduce((total, item) => {
        return total + (item.giaTriLuyKeThucHienDotNay || 0);
      }, 0),
    );
  };

  const groupedData = Costs.reduce((acc, item) => {
    const ctGroup = acc.find(group => group.contractor === item.name);
    if (ctGroup) {
      ctGroup.items.push(item);
    } else {
      acc.push({ contractor: item.name, items: [item] });
    }
    return acc;
  }, [] as { contractor: string; items: PaymentTerm[] }[]);

  // Sắp xếp các mục trong mỗi nhóm theo ngày gần nhất
  groupedData.forEach(group => {
    group.items.sort((a, b) => new Date(b.paymentTermDate).getTime() - new Date(a.paymentTermDate).getTime());
  });

  const tableData = groupedData.map((group, index) => ({
    key: `group-${index}`,
    contractor: group.contractor,
    totalCumulative: calculateTotalCumulative(group.items),
    items: group.items,
  }));

  const columns: ColumnsType<TableDataType> = [
    {
      title: <strong>{t('date')}</strong>,
      dataIndex: 'paymentTermDate',
      key: 'paymentTermDate',
      width: '2%',
      align: 'center',
      render: (text, record) => {
        if ('isGroupHeader' in record && record.isGroupHeader) {
          return <strong style={{ fontSize: '14px' }}>{text}</strong>;
        }
        if (text) {
          const date = new Date(text);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
        }
        return '';
      },
    },
    {
      title: <strong>{t('description')}</strong>,
      dataIndex: 'name',
      key: 'name',
      width: '5%',
      align: 'center',
      render: (text, record) => {
        if ('isGroupHeader' in record && record.isGroupHeader) {
          return text; // Trả về tên nhà thầu cho dòng tiêu đề nhóm
        }
        if ('paymentTermDate' in record && record.paymentTermDate) {
          const date = new Date(record.paymentTermDate);
          if (!isNaN(date.getTime())) {
            // Kiểm tra xem ngày có hợp lệ không
            const formattedDate = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return `Thanh toán nhà thầu phụ ${formattedDate}`;
          }
        }
        return ''; // Trả về chuỗi rỗng nếu không có ngày hợp lệ
      },
    },
    {
      title: <strong>{t('Quantity')}</strong>,
      dataIndex: 'khoiLuongThanhToan',
      key: 'khoiLuongThanhToan',
      width: '3%',
      align: 'center',
    },
    {
      title: <strong>{t('payment')}</strong>,
      dataIndex: 'giaTriTTLanNay',
      key: 'giaTriTTLanNay',
      width: '3%',
      align: 'center',
      render: (text, record) => {
        if ('isGroupHeader' in record && record.isGroupHeader) {
          return ''; // Trả về chuỗi rỗng cho dòng tiêu đề nhóm
        }
        return formatNumber(text);
      },
    },
    {
      title: <strong>{t('cumulative')}</strong>,
      dataIndex: 'giaTriLuyKeThucHienDotNay',
      key: 'giaTriLuyKeThucHienDotNay',
      width: '3%',
      align: 'center',
      render: (text, record) => {
        if ('isGroupHeader' in record && record.isGroupHeader) {
          return <strong style={{ fontSize: '14px' }}>{record.giaTriThanhToanKeHoach}</strong>;
        }
        return formatNumber(text);
      },
    },
  ];

  return (
    <div className={styles.tableContainer}>
      <Table
        columns={columns}
        dataSource={tableData.flatMap(group => [
          {
            key: group.key,
            paymentTermDate: group.contractor,
            giaTriThanhToanKeHoach: group.totalCumulative,
            isGroupHeader: true,
          } as GroupHeaderType,
          ...group.items,
        ])}
        pagination={false}
        rowKey="key"
        scroll={{ x: 'max-content', y: windowSize[1] - 255 }}
        showHeader={true}
      />
    </div>
  );
};

export default CostsList;
