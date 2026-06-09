import React from 'react';

import { Tabs, Button, Space, Select, DatePicker } from 'antd';
import { TabsProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import styles from '../PaymentPlan.module.css';
import { EFinancialPlan } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';

// ------------------------------------------------------

interface ActionBarProps {
  activeKey: string;
  items: TabsProps['items'];
  onTabChange: (key: string) => void;
  onSave: () => void;
  onExport: () => void;
  t: (key: string) => string;

  /** options payment plan */
  selectOptions: Record<string, { value: string; label: string; policyKeys: string }[]>;
  selectedValue: string;
  onSelectChange: (val: string) => void;
  onCreateAccountingInvoice: () => void;
  onExportSalarySummary: () => void;

  month: Dayjs | null;
  onMonthChange: (m: Dayjs | null) => void;
}

export default function ActionBar({
  activeKey,
  items,
  onTabChange,
  onSave,
  onExport,
  t,
  selectOptions,
  selectedValue,
  onSelectChange,
  month,
  onMonthChange,
  onCreateAccountingInvoice,
  onExportSalarySummary,
}: ActionBarProps): React.JSX.Element {
  const isSalarySummary =
    (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedValue === '6') ||
    (activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedValue === '7');

  return (
    <div className={styles.actionBar}>
      <Tabs activeKey={activeKey} onChange={onTabChange} items={items} />

      <div className={styles.actionButtons}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Select
            style={{ width: 220 }}
            value={selectedValue}
            onChange={onSelectChange}
            options={selectOptions[activeKey]}
          />

          <DatePicker
            picker="month"
            style={{ width: 220 }}
            value={month ?? dayjs()}
            onChange={onMonthChange}
            format="YYYY-MM"
          />
        </div>

        {!isSalarySummary ? (
          (activeKey === EFinancialPlan.KeHoachThanhToan05 || activeKey === EFinancialPlan.KeHoachThanhToan20) &&
          (selectedValue === '3' || selectedValue === '5') ? (
            <div style={{ marginLeft: 10 }}>
              <WithPermission policyKeys={['KeHoachTaiChinh.ThanhToan.Create']} strategy='disable'>
                <Button type="primary" onClick={onCreateAccountingInvoice}>
                  {t('Save')}
                </Button>
              </WithPermission>
            </div>
          ) : (
            <>
              <Space>
                <WithPermission policyKeys={['KeHoachTaiChinh.BangLuongBCH.SaveChanges']} strategy='disable'>
                  <Button type="primary" onClick={onSave}>
                    {t('Save')}
                  </Button>
                </WithPermission>
              </Space>

              <Space>
                <WithPermission policyKeys={['KeHoachTaiChinh.BangLuongBCH.Export']} strategy='disable'>
                  <Button type="primary" onClick={onExport}>
                    {t('Export Excel')}
                  </Button>
                </WithPermission>
              </Space>
            </>
          )
        ) : (
          <div style={{ marginLeft: 10 }}>
            <WithPermission policyKeys={['KeHoachTaiChinh.BangTHLuong.Export']} strategy='disable'>
              <Button type="primary" onClick={onExportSalarySummary}>
                {t('Export Excel')}
              </Button>
            </WithPermission>
          </div>
        )}
      </div>
    </div>
  );
}
