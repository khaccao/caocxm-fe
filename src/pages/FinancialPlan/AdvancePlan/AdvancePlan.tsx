/* eslint-disable import/order */
import React, { useEffect, useRef, useState } from 'react';

import { Button, DatePicker, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from 'react-i18next';

import { EButtonState, EFinancialPlan } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { documentActions } from '@/store/documents';
import { useAppDispatch } from '@/store/hooks';
import Utils from '@/utils';
import PlanTable from '../components/PlanTable/PlanTable';

// ---------------------------------------------------------

export const AdvancePlan: React.FC = () => {
  const { t } = useTranslation('subcontractor');
  const dispatch = useAppDispatch();
  const planTableRef = useRef<any>(null);

  const [activeKey, setActiveKey] = useState<string>(EFinancialPlan.KeHoachTamUng12);
  const [selectMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs().startOf('month'));
  
  // Get button state key based on activeKey (period)
  const getButtonStateKey = () => {
    return activeKey === EFinancialPlan.KeHoachTamUng12 
      ? EButtonState.KeHoachTamUng12 
      : EButtonState.KeHoachTamUng27;
  };
  
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(
    sessionStorage.getItem(getButtonStateKey()) === 'true' ? true : false
  );

  useEffect(() => {
    // Check sessionStorage key for current period
    const buttonStateKey = getButtonStateKey();
    const savedState = sessionStorage.getItem(buttonStateKey);
    
    // If no key exists or key is 'false', button should be enabled (disabled = false)
    // If key is 'true', button should be disabled (disabled = true)
    if (savedState === null || savedState === 'false') {
      setIsButtonDisabled(false);
      sessionStorage.setItem(buttonStateKey, 'false');
    } else if (savedState === 'true') {
      setIsButtonDisabled(true);
    }
  }, [activeKey]);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedMonth(date);
    dispatch(documentActions.setPlanTableUpdate([]));
  };

  const getTabBarExtraContent = () => {
    return (
      <>
        <Space style={{ marginRight: '20px' }}>
          <DatePicker
            value={selectMonth}
            onChange={handleDateChange}
            picker="month"
            style={{ width: 255 }}
          />
      </Space>
      <Space>
        <WithPermission policyKeys={['KeHoachTaiChinh.TamUng.Create']}>
          <Button style={{ marginTop: 2 }} type='primary' onClick={handleSave} disabled={isButtonDisabled}>
            Lưu hạch toán
          </Button>
        </WithPermission>
      </Space>
      </>
    )
  };

  const handleSave = () => {
    planTableRef.current?.handleSave();
    Utils.successNotification('Lưu hạch toán thành công');
    setIsButtonDisabled(true);
    // Set key for current period to 'true' to disable button
    const buttonStateKey = getButtonStateKey();
    sessionStorage.setItem(buttonStateKey, 'true');
  };

  const updateButtonState = () => {
    const buttonStateKey = getButtonStateKey();
    sessionStorage.setItem(buttonStateKey, 'false');
    setIsButtonDisabled(false);
  };

  return (
    <div style={{ padding: '0 5px' }}>
      <Tabs
        defaultActiveKey={EFinancialPlan.KeHoachTamUng12}
        activeKey={activeKey}
        onChange={key => setActiveKey(key)}
        tabBarExtraContent={getTabBarExtraContent()}
      >
        <Tabs.TabPane key={EFinancialPlan.KeHoachTamUng12} tab={t("Advance plan for the 12th")}>
          {<PlanTable ref={planTableRef} typeEFinancialPlan={activeKey} selectMonth={selectMonth} policies={{
            create: ['KeHoachTaiChinh.TamUng.Create'],
            delete: ['KeHoachTaiChinh.TamUng.Delete'],
          }} onUpdateButtonState={updateButtonState} />}
        </Tabs.TabPane>

        <Tabs.TabPane key={EFinancialPlan.KeHoachTamUng27} tab={t("Advance plan for the 27th")}>
          {<PlanTable ref={planTableRef} typeEFinancialPlan={activeKey} selectMonth={selectMonth} policies={{
            create: ['KeHoachTaiChinh.TamUng.Create'],
            delete: ['KeHoachTaiChinh.TamUng.Delete'],
          }} onUpdateButtonState={updateButtonState} />}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AdvancePlan;
