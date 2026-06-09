import React, { useEffect, useState } from 'react';

import { Button, Input, message, Row, Space, Typography } from 'antd';
import { DatePicker } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import InvoiceListTable from './components/InvoiceListTable';
import { exportBaseExcel } from '../FinancialPlan/PaymentPlan/utils/ExportFile';
import { FormatDateAPI, formatDateDisplay } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useDebounce } from '@/hooks';
import { InvoiceXDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { getActiveMenu } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

// -------------------------------------

const { RangePicker } = DatePicker;

export default function InvoiceX(): React.JSX.Element {
  const { t } = useTranslation('finance');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(getActiveMenu());
  const { invoiceList } = useAppSelector(s => s.accountingInvoice);

  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearch = useDebounce(searchText, 500);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [filteredData, setFilteredData] = useState<InvoiceXDTO[]>([]);

  useEffect(() => {
    dispatch(accountingInvoiceActions.GetInvoicesX());
  }, [dispatch]);

  useEffect(() => {
    const [start, end] = dateRange;
    const startStr = start.format(FormatDateAPI);
    const endStr = end.format(FormatDateAPI);

    const keyword = debouncedSearch.trim().toLowerCase();

    if (!invoiceList) {
      setFilteredData([]);
      return;
    }

    const newData = invoiceList?.results.filter((item: InvoiceXDTO) => {
      const invDateStr = dayjs(item.ban_NgayKyPhatHanh).format(FormatDateAPI);

      const inDateRange = invDateStr >= startStr && invDateStr <= endStr;

      let matchesKeyword = true;
      if (keyword !== '') {
        const invNum = String(item.ban_SoHoaDon || '').toLowerCase();
        const form = String(item.ban_KyHieu || '').toLowerCase();
        matchesKeyword = invNum.includes(keyword) || form.includes(keyword);
      }

      return inDateRange && matchesKeyword;
    });

    setFilteredData(newData);
  }, [dateRange, debouncedSearch, invoiceList]);

  const handleExportExcel = () => {
    if (invoiceList && invoiceList.results.length === 0) {
      message.warning(t('Không có dữ liệu để xuất file'));
      return;
    }

    const today = dayjs().format(formatDateDisplay);
    const fileName = `Hoá đơn X_${today}.xlsx`;

    const exportData = invoiceList.results.map((item: InvoiceXDTO, index: number) => ({
      ...item,
      stt: index + 1,
      ban_NgayLap: item.ban_NgayKyPhatHanh ? dayjs(item.ban_NgayKyPhatHanh).format(formatDateDisplay) : '',
      ban_NgayKyPhatHanh: item.ban_NgayKyPhatHanh ? dayjs(item.ban_NgayKyPhatHanh).format(formatDateDisplay) : '',
      tongTienChuaThue: item.tongTienChuaThue.toLocaleString('en-US'),
      tongTienThueGTGT: item.tongTienThueGTGT.toLocaleString('en-US'),
      tongTienThanhToan: item.tongTienThanhToan.toLocaleString('en-US'),
    }));

    const totalExclTax = invoiceList.results.reduce((sum: any, rec: InvoiceXDTO) => sum + rec.tongTienChuaThue, 0);
    const totalTax = invoiceList.results.reduce((sum: any, rec: InvoiceXDTO) => sum + rec.tongTienThueGTGT, 0);
    const totalPayment = invoiceList.results.reduce((sum: any, rec: InvoiceXDTO) => sum + rec.tongTienThanhToan, 0);

    const summaryRow: Partial<InvoiceXDTO> & { stt: string } = {
      stt: '',
      ban_KyHieu: 'Tổng cộng',
      ban_SoHoaDon: undefined,
      ban_NgayLap: undefined,
      ban_TenNguoiBan: '',
      ban_MaSoThue: '',
      tongTienChuaThue: totalExclTax.toLocaleString('en-US'),
      tongTienThueGTGT: totalTax.toLocaleString('en-US'),
      tongTienThanhToan: totalPayment.toLocaleString('en-US'),
    };

    const finalExportData = [...exportData, summaryRow as any];

    const columns = [
      { header: 'STT', key: 'stt' },
      { header: 'Ký hiệu', key: 'ban_KyHieu' },
      { header: 'Số hoá đơn', key: 'ban_SoHoaDon' },
      { header: 'Ngày hoá đơn', key: 'ban_NgayLap' },
      { header: 'Tên người bán', key: 'ban_TenNguoiBan' },
      { header: 'Mã số thuế', key: 'ban_MaSoThue' },
      { header: 'Tổng tiền chưa thuế', key: 'tongTienChuaThue' },
      { header: 'Tổng tiền thuế', key: 'tongTienThueGTGT' },
      { header: 'Tổng tiền thanh toán', key: 'tongTienThanhToan' },
    ];

    exportBaseExcel({
      data: finalExportData,
      fileName,
      sheetName: 'InvoiceList',
      columns,
    })
      .then(() => {
        Utils.successNotification('Xuất file thành công');
      })
      .catch(err => {
        message.error('Lỗi khi xuất file');
      });
  };

  return (
    <>
      <Row style={{ padding: 8, backgroundColor: 'white' }}>
        <Space style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography.Title style={{ margin: 0 }} level={4}>
            {activeMenu?.label}
          </Typography.Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.Search
              allowClear
              placeholder={t('Search')}
              style={{ width: 250 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />

            <RangePicker
              format={formatDateDisplay}
              value={[dateRange[0], dateRange[1]]}
              onChange={dates => {
                if (dates) {
                  const start = dates[0] || dayjs().startOf('month');
                  const end = dates[1] || dayjs().endOf('month');
                  setDateRange([start, end]);
                } else {
                  setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
                }
              }}
              placeholder={[t('From date'), t('To date')]}
            />

            <WithPermission policyKeys={['KeHoachTaiChinh.HoaDonX.Create']} strategy="hide">
              <Button
                type="primary"
                onClick={() => {
                  navigate(`/management-accounting/edit-invoice-x?id=0`);
                }}
              >
                {t('Create new invoice')}
              </Button>
            </WithPermission>

            <WithPermission policyKeys={['KeHoachTaiChinh.HoaDonX.View']} strategy="hide">
              <Button
                type="primary"
                onClick={() => {
                  handleExportExcel();
                }}
              >
                {t('Export invoice')}
              </Button>
            </WithPermission>
          </div>
        </Space>
      </Row>

      <InvoiceListTable dataSource={filteredData} />
    </>
  );
}
