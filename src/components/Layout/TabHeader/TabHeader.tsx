/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import type { ButtonProps, TabsProps } from 'antd';
import { Button, DatePicker, Input, Modal, Select, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { accountingInvoice, FormatDateAPI } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import ExpenseForm from '@/pages/MachineryMaterials/components/AddAriseNew';
import { accountingInvoiceActions, getDateFilterOptions, getDateRange } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getSelectedProject } from '@/store/project';
import Style from './TabHeader.module.less';

const { RangePicker } = DatePicker;
const { Search } = Input;

interface TabHeaderProps {
  tabs: TabsProps['items'];
  onAddProposal?: () => void;
  onAddMorearise?: () => void;
  onDownload?: () => void;
  onSelectDate?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onSearch?: (searchText: string) => void;
  addButtonProps?: ButtonProps;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  tabs,
  onAddProposal,
  onDownload,
  onSelectDate,
  onAddMorearise,
  onSearch,
  addButtonProps,
}) => {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const { t } = useTranslation('tabheader');

  const [activeTab, setActiveTab] = useState<string>('1');
  const [isExpenseFormVisible, setIsExpenseFormVisible] = useState(false);
  const [KeyPopup, setKeyPopup] = useState('1');
  const company = useAppSelector(getCurrentCompany());
  const isLoading = useAppSelector(getLoading(accountingInvoice.GetTonKho));
  const dateRanges = useAppSelector(getDateRange());
  const dateFilterOptionsStore = useAppSelector(getDateFilterOptions());
  const [dateFilterOptions, setDateFilterOptions] = useState<any[]>([]);
  /** state cho Select và RangePicker */
  const [selectedDateOption, setSelectedDateOption] = useState<string>('today');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);
  const [selectedMonthYear, setSelectedMonthYear] = useState<Dayjs | null>(dayjs());
  /** Tính khoảng ngày theo option của Select, kết hợp với tháng-năm đã chọn */
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

  /** Tự chọn option mặc định theo ngày hiện tại */
  const getDefaultOptionByToday = (): string => {
    const d = dayjs().date();
    const dateFilterOption = dateFilterOptionsStore.find(option => {
      if (option.startDay > option.endDay) {
        return option.startDay <= d || option.endDay >= d;
      } else {
        return option.startDay <= d && option.endDay >= d;
      }
    });
    return dateFilterOption ? `${dateFilterOption.startDay}-${dateFilterOption.endDay}` : `${d}-${d + 6}`;
  };

  /** Khi đổi project: set lại range và đồng bộ Redux */
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

  useEffect(() => {
    if (company.id) {
      dispatch(accountingInvoiceActions.GetDateFilterOptions({ CompanyId: company.id }));
    }
  }, [company]);

  useEffect(() => {
    const data = dateFilterOptionsStore.map((item) => ({
      label: `${item.name}`,
      value: `${item.startDay}-${item.endDay}`,
    }));
    setDateFilterOptions(data);
  }, [dateFilterOptionsStore]);
  /** Đồng bộ local state khi store dateRange thay đổi */
  useEffect(() => {
    if (dateRanges?.startDate && dateRanges?.endDate) {
      const start = dayjs(dateRanges.startDate).startOf('day');
      const end = dayjs(dateRanges.endDate).endOf('day');
      setDateRange([start, end]);
    }
  }, [dateRanges]);

  /** Khi click chọn option trong Select */
  const handleDateOptionChange = (value: string) => {
    setSelectedDateOption(value);
    // Kết hợp với tháng-năm đã chọn để tính range
    const range = getDateRangeByOption(value, selectedMonthYear);
    setDateRange(range);
    // Giữ nguyên filter tháng-năm, không cập nhật

    // đồng bộ store
    dispatch(
      accountingInvoiceActions.setDateRange({
        startDate: range[0].format(FormatDateAPI),
        endDate: range[1].format(FormatDateAPI),
      }),
    );

    // gửi ra ngoài (nếu cần)
    onSelectDate?.(range);
  };

  /** Khi chọn trực tiếp trong RangePicker */
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

      onSelectDate?.(range);
    }
  };


  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const [isHovered, setIsHovered] = useState(false);
  const buttonStyle: React.CSSProperties = {
    marginRight: 8,
    borderRadius: '20px',
    transition: 'all 0.3s',
    backgroundColor: '#22c55e',
    color: 'white',
  };

  return (
    <div>
      <div className={Style.tabContainer}>
        <Tabs
          defaultActiveKey="1"
          onChange={handleTabChange}
          tabBarExtraContent={
            <div className={Style.tabActions}>
              {activeTab === '1' && (
                <Search
                  placeholder="Tìm kiếm..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  onSearch={(value) => onSearch?.(value)}
                  style={{ width: 200, marginRight: 8 }}
                />
              )}

              {(activeTab === '2') && (
                <Space direction="vertical" size={12} className={Style.datePicker}>
                  {/* Use RangePicker for selecting a date range */}
                  <RangePicker
                    onChange={(dates) => handleDateChange(dates)}
                    value={dateRange}
                  />
                </Space>
              )}

              {activeTab === '3' && (
                <Space direction="horizontal" size={12} className={Style.datePicker}>
                  <DatePicker
                    picker="month"
                    format="MM/YYYY"
                    placeholder="Chọn tháng-năm"
                    value={selectedMonthYear}
                    onChange={handleMonthYearChange}
                    style={{ width: 150 }}
                  />
                  <Select
                    style={{ width: 220 }}
                    value={selectedDateOption}
                    options={dateFilterOptions}
                    onChange={handleDateOptionChange}
                  />
                  <RangePicker
                    onChange={(dates) => handleDateChange(dates)}
                    value={dateRange}
                  />
                </Space>
              )}

              {activeTab !== '4' && (
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  style={{ marginRight: 8, borderRadius: '20px' }}
                  onClick={onAddProposal}
                  loading={isLoading}
                  {...addButtonProps}
                >
                  {t('Add Proposal')}
                </Button>
              )}

              {activeTab === '4' && (
                <WithPermission
                  policyKeys={['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Create']}
                  strategy="disable"
                >
                  <Button
                    icon={<CheckOutlined />}
                    type="text"
                    onClick={() =>
                      dispatch(
                        accountingInvoiceActions.DongBoChiPhiPhatSinh({
                          companyId: company.id,
                          businessDate: dayjs().format(FormatDateAPI),
                        }),
                      )
                    }
                    style={isHovered ? { ...buttonStyle, backgroundColor: '#29e36d' } : buttonStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {t('Confirm')}
                  </Button>
                </WithPermission>
              )}
            </div>
          }
          items={tabs}
        />
      </div>

      <Modal
        open={isExpenseFormVisible}
        title={t('Add new costs')}
        onCancel={() => setIsExpenseFormVisible(false)}
        footer={null}
      >
        <ExpenseForm setModel={setIsExpenseFormVisible} key={KeyPopup} />
      </Modal>
    </div>
  );
};

export default TabHeader;
