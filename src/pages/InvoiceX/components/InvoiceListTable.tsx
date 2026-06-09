import React from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, message, Modal, Space, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from '../InvoiceX.module.css';
import { usePermission } from '@/hooks';
import { InvoiceXDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// ---------------------------------------

interface InvoiceXListTableProps {
  dataSource: InvoiceXDTO[];
}

export default function InvoiceListTable({ dataSource }: InvoiceXListTableProps): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation('finance');
  const dispatch = useAppDispatch();

  const user = useAppSelector(getCurrentUser());

  const editGranted = usePermission(['KeHoachTaiChinh.HoaDonX.Edit']);
  const deleteGranted = usePermission(['KeHoachTaiChinh.HoaDonX.Edit']);

  const columns: ColumnsType<InvoiceXDTO> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: 60,
      key: 'stt',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Ký hiệu',
      dataIndex: 'ban_KyHieu',
      key: 'ban_KyHieu',
      width: 110,
    },
    {
      title: 'Số hoá đơn',
      dataIndex: 'ban_SoHoaDon',
      key: 'ban_SoHoaDon',
      width: 100,
    },
    {
      title: 'Ngày hoá đơn',
      dataIndex: 'ban_NgayKyPhatHanh',
      key: 'ban_NgayKyPhatHanh',
      width: 120,
      render: (value: string) => {
        return value ? new Date(value).toLocaleDateString('vi-VN') : '';
      }
    },
    {
      title: 'Tên người bán',
      dataIndex: 'ban_TenNguoiBan',
      key: 'ban_TenNguoiBan',
      width: 200,
    },
    {
      title: 'Mã số thuế người bán',
      dataIndex: 'ban_MaSoThue',
      key: 'ban_MaSoThue',
      width: 100,
    },
    {
      title: 'Tổng tiền chưa thuế',
      dataIndex: 'tongTienChuaThue',
      key: 'tongTienChuaThue',
      width: 150,
      align: 'center',
      render: (value: number) => value.toLocaleString('en-US'),
    },
    {
      title: 'Tổng tiền thuế',
      dataIndex: 'tongTienThueGTGT',
      key: 'tongTienThueGTGT',
      width: 140,
      align: 'center',
      render: (value: number) => value.toLocaleString('en-US'),
    },
    {
      title: 'Tổng tiền thanh toán',
      dataIndex: 'tongTienThanhToan',
      key: 'tongTienThanhToan',
      width: 150,
      align: 'center',
      render: (value: number) => value.toLocaleString('en-US'),
    },
    {
      title: null,
      key: 'actions',
      fixed: 'right',
      width: 70,
      align: 'center',
      onHeaderCell: () => ({
        style: {
          right: 0,
        },
      }),
      render: (_: any, record) => {
        return (
          <Space>
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined />}
                type="text"
                size="small"
                style={{ color: '#096798' }}
                disabled={!editGranted}
                onClick={() => {
                  if (user) {
                    navigate(`/management-accounting/edit-invoice-x?id=${record.id}`);
                  } else {
                    message.warning('Bạn không có quyền chỉnh sửa hoá đơn này!');
                  }
                }}
              />
            </Tooltip>
            <Tooltip title={t('Delete')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                disabled={!deleteGranted}
                onClick={() => {
                  Modal.confirm({
                    title: t('Can you sure delete this invoice?'),
                    okText: t('Delete'),
                    cancelText: t('Cancel'),
                    onOk: async () => {
                      if (user) {
                        dispatch(accountingInvoiceActions.DeleteInvoiceX({ body: [record.id] }));
                        dispatch(accountingInvoiceActions.GetInvoicesX());
                      } else {
                        message.warning('Bạn không có quyền xoá hoá đơn này!');
                      }
                    },
                  });
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      className={styles.tableWrapper}
      style={{ padding: '8px 8px 0 8px', backgroundColor: 'white' }}
      columns={columns}
      dataSource={dataSource}
      bordered
      scroll={{ x: 1250, y: 'calc(100vh - 215px)' }}
      pagination={false}
      summary={pageData => {
        const totalExclTax = pageData.reduce((sum, rec) => sum + rec.tongTienChuaThue, 0);
        const totalTax = pageData.reduce((sum, rec) => sum + rec.tongTienThueGTGT, 0);
        const totalPayment = pageData.reduce((sum, rec) => sum + rec.tongTienThanhToan, 0);
        return (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell align="center" index={1} colSpan={3}>
                <strong>Tổng cộng</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell align="center" index={3} />
              <Table.Summary.Cell align="center" index={4} />
              <Table.Summary.Cell align="center" index={5} />

              <Table.Summary.Cell index={6} align="center" colSpan={1}>
                {totalExclTax.toLocaleString('en-US')}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="center" colSpan={1}>
                {totalTax.toLocaleString('en-US')}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="center" colSpan={1}>
                {totalPayment.toLocaleString('en-US')}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        );
      }}
    />
  );
}
