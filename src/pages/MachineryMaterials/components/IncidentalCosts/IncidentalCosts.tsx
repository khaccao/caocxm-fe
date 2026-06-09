/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Modal, Select, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { FormatDateAPI } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission } from '@/hooks';
import { accountingInvoiceActions, getDateFilterOptions, getDateRange } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import { useLocation } from 'react-router-dom';
import { IncidentalForm, IncidentalList } from './components';
import styles from './IncidentalCosts.module.css';

// ----------------------------------------------------------

const { RangePicker } = DatePicker;

export default function IncidentalCosts(): React.JSX.Element {
  const location = useLocation();

  const { t } = useTranslation('material');
  const tHeader = useTranslation('tabheader').t;
  const dispatch = useAppDispatch();

  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());
  const canDelete = usePermission(['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Delete']);

  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpenseFormVisible, setIsExpenseFormVisible] = useState(false);
  const dateRanges = useAppSelector(getDateRange());

  const [selectedDateOption, setSelectedDateOption] = useState<string>('today');
  const [selectedMonthYear, setSelectedMonthYear] = useState<Dayjs | null>(dayjs());
  const [dateFilterOptions, setDateFilterOptions] = useState<any[]>([]);
  const dateFilterOptionsStore = useAppSelector(getDateFilterOptions());
  const getPermissionKeys = () => {
    const isProjectLayout = location.pathname.startsWith('/projects');

    let permissionKeys: { confirm?: string[] } = {
      confirm: isProjectLayout ? ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Confirm'] : ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Confirm'],
    };
    return permissionKeys;
  };
  const permissionKeys = getPermissionKeys();
  const confirmGranted = usePermission(permissionKeys.confirm);

  // state cho RangePicker & IncidentalList (kiểu Dayjs[])
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    dispatch(accountingInvoiceActions.GetDateFilterOptions({ CompanyId: company.id }));
  }, [company]);

  useEffect(() => {
    const data = dateFilterOptionsStore.map((item) => ({
      label: `${item.name}`,
      value: `${item.startDay}-${item.endDay}`,
    }));
    setDateFilterOptions(data);
  }, [dateFilterOptionsStore]);
  /**
   * Khi đổi project: set lại range = hôm nay
   * và đồng bộ vào store để tránh bị ghi đè
   */
  useEffect(() => {
    const defaultOption = getDefaultOptionByToday();
    const range = getDateRangeByOption(defaultOption);

    setSelectedDateOption(defaultOption);
    setDateRange(range);
    setSelectedMonthYear(dayjs());

    dispatch(
      accountingInvoiceActions.setDateRange({
        startDate: range[0].format(FormatDateAPI),
        endDate: range[1].format(FormatDateAPI),
      }),
    );
  }, [selectedProject, dispatch, dateFilterOptionsStore]);


  /**
   * Cập nhật local dateRange mỗi khi dateRanges trong store thay đổi
   * (trường hợp bạn muốn vẫn theo dõi giá trị toàn cục)
   */
  useEffect(() => {
    if (dateRanges?.startDate && dateRanges?.endDate) {
      const start = dayjs(dateRanges.startDate).startOf('day');
      const end = dayjs(dateRanges.endDate).endOf('day');
      setDateRange([start, end]);
    }
  }, [dateRanges]);

    // Gọi API GetAccountingMapping khi mở màn hình lần đầu tiên
    useEffect(() => {
      dispatch(
        accountingInvoiceActions.GetAccountingMapping({
          params: { type: 5 }, // businessType = 5 cho chi phí phát sinh
        }),
      );
    }, []);



  //Tính khoảng ngày theo option của Select, kết hợp với tháng-năm đã chọn
  const getDateRangeByOption = (optionValue: string, monthYear?: Dayjs | null): [Dayjs, Dayjs] => {
    const baseDate = monthYear || dayjs();
    const [startDate, endDate] = optionValue.split('-');
    let start = baseDate.date(Number(startDate)).startOf('day');
    let end = baseDate.date(Number(endDate)).endOf('day');

    // Nếu endDate < startDate → end nằm ở tháng sau
    if (Number(endDate) < Number(startDate)) {
      //  Nếu endDate > toDay thì end nằm ở tháng này start nằm ở tháng trước
      if (Number(endDate) >= dayjs().date()) {
        start = start.add(-1, 'month');
      } else {
        end = end.add(1, 'month');
      }
    }

    return [start, end];
  };

  const getDefaultOptionByToday = (): string => {
    const d = dayjs().date(); // chỉ lấy ngày trong tháng (1–31)
    const dateFilterOption = dateFilterOptionsStore.find(option => {
      if (option.startDay > option.endDay) {
        return option.startDay <= d || option.endDay >= d;
      } else {
        return option.startDay <= d && option.endDay >= d;
      }
    });
    return dateFilterOption ? `${dateFilterOption.startDay}-${dateFilterOption.endDay}` : `${d}-${d + 6}`;
  };


  const handleDateOptionChange = (value: string) => {
    setSelectedDateOption(value);
    // Kết hợp với tháng-năm đã chọn để tính range
    const range = getDateRangeByOption(value, selectedMonthYear);
    setDateRange(range);

    // đồng bộ store
    dispatch(
      accountingInvoiceActions.setDateRange({
        startDate: range[0].format(FormatDateAPI),
        endDate: range[1].format(FormatDateAPI),
      }),
    );
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0].startOf('day');
      const end = dates[1].endOf('day');
      setDateRange([start, end]);
      setSelectedDateOption('custom'); // đánh dấu là chọn thủ công
      // Khi chọn RangePicker, không áp dụng filter tháng-năm và set về null
      setSelectedMonthYear(null);

      dispatch(
        accountingInvoiceActions.setDateRange({
          startDate: start.format(FormatDateAPI),
          endDate: end.format(FormatDateAPI),
        }),
      );
    }
  };

  /** Khi chọn tháng-năm */
  const handleMonthYearChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedMonthYear(date);
      
      // Nếu đã có option ngày được chọn, áp dụng option đó vào tháng-năm mới
      // Nếu không, set cả tháng
      let range: [Dayjs, Dayjs];
      if (selectedDateOption && selectedDateOption !== 'custom' && selectedDateOption !== '0') {
        range = getDateRangeByOption(selectedDateOption, date);
      } else {
        // Tự động set date range từ ngày đầu tháng đến ngày cuối tháng
        range = [date.startOf('month').startOf('day'), date.endOf('month').endOf('day')];
        setSelectedDateOption('custom');
      }
      
      setDateRange(range);

      dispatch(
        accountingInvoiceActions.setDateRange({
          startDate: range[0].format(FormatDateAPI),
          endDate: range[1].format(FormatDateAPI),
        }),
      );
    }
  };

  const handleAddMoreAriseClick = () => setIsExpenseFormVisible(true);
  const handleExpenseFormClose = () => setIsExpenseFormVisible(false);

  const buttonStyle = {
    marginRight: 8,
    borderRadius: '20px',
    transition: 'all 0.3s',
    backgroundColor: '#22c55e',
    color: 'white',
  };

  const hoverStyle = {
    backgroundColor: '#29e36d',
  };

  useEffect(() => {
    dispatch(accountingInvoiceActions.getCustomers());
  }, [dispatch]);

  const handleDelete = (ids: number[]) => {
    if (!canDelete) {
      Utils.errorNotification(t('Bạn không có quyền xóa chi phí phát sinh'));
      return;
    }
    ids.forEach((id) => {
      dispatch(
        accountingInvoiceActions.DeleteAdditionalCostRequest({
          id,
          projectId: selectedProject?.id,
          companyId: company?.id,
        }),
      );
    });
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography.Title level={4} style={{ marginBottom: 0 }}>
            {t('Incidental costs')}
          </Typography.Title>

          <div>
            <DatePicker
              picker="month"
              format="MM/YYYY"
              placeholder="Chọn tháng-năm"
              value={selectedMonthYear}
              onChange={handleMonthYearChange}
              style={{ width: 150, marginRight: 10 }}
            />
            
            <Select
              style={{ width: 220 }}
              value={selectedDateOption}
              options={dateFilterOptions}
              onChange={handleDateOptionChange}
            />

            <RangePicker
              onChange={handleDateChange}
              value={dateRange}
              style={{ marginRight: 10, marginLeft: 10 }}
            />

            {/* Confirm - Hidden */}
            {/* <WithPermission
              policyKeys={['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Create']}
              strategy="disable"
            >
              {!selectedProject && (
                <Button
                  icon={<CheckOutlined />}
                  type="text"
                  onClick={() => {
                    dispatch(
                      accountingInvoiceActions.DongBoChiPhiPhatSinh({
                        companyId: company.id,
                        businessDate: dayjs().format(FormatDateAPI),
                      }),
                    );
                  }}
                  style={{
                    ...(isHovered && confirmGranted ? hoverStyle : {}),
                    ...buttonStyle,
                    ...(!confirmGranted
                      ? { color: '#999', backgroundColor: '#f0f0f0', cursor: 'not-allowed' }
                      : {}),
                  }}
                  onMouseEnter={() => confirmGranted && setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={!confirmGranted}
                >
                  {tHeader('Confirm')}
                </Button>
              )}
            </WithPermission> */}

            {/* Create */}
            <WithPermission
              policyKeys={['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Create']}
              strategy="disable"
            >
              <Button
                icon={<PlusOutlined />}
                type="primary"
                style={{ marginRight: 8, borderRadius: '20px' }}
                onClick={handleAddMoreAriseClick}
              >
                {tHeader('More arise')}
              </Button>
            </WithPermission>
          </div>
        </div>

        <IncidentalList dateRange={dateRange} handleDelete={handleDelete} />
      </div>

      <Modal
        className={styles.antModal}
        open={isExpenseFormVisible}
        title={t('Add new costs')}
        onCancel={handleExpenseFormClose}
        footer={null}
      >
        <IncidentalForm
          onCancel={handleExpenseFormClose}
          onSuccess={handleExpenseFormClose}
          handleDelete={handleDelete}
        />
      </Modal>
    </>
  );
}
