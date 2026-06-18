/* eslint-disable import/order */
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button, DatePicker, message, Modal, Select, Space, Spin, Switch, Tabs, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { EButtonState, EFinancialPlan, EmployeeSalaryStatementDTO, ePeriodCode } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission } from '@/hooks';
import { getCurrentCompany } from '@/store/app';
import {
  employeeActions,
  getBCHEmployeeSalaryStatement,
  getEmployees,
  getNVEmployeeSalaryStatement,
} from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getDefaultOrganization } from '@/store/user';
import Utils from '@/utils';
import { AggregatedPayrollType, buildEmployeeNameMap } from './helper';
import styles from './PaymentPlan.module.css';
import { PayrollTableHandle } from './types';
import BCHSalaryContainer from './views/BCHSalaryContainer';
import PaymentCost, { PaymentCostRef } from './views/PaymentCost';
import PayrollTableContainer from './views/PayrollTableContainer';
import SalarySummary from './views/SalarySummary';

// -------------------------------------------------------

export default function PaymentPlan(): React.JSX.Element {
  const canViewPayroll = usePermission(['KeHoachTaiChinh.BangLuongBCH.View']);
  const tableRef = useRef<PayrollTableHandle>(null);
  const paymentCostRef = useRef<PaymentCostRef>(null);
  const salarySummaryRef = useRef<any>(null);
  const { t } = useTranslation('subcontractor');
  const dispatch = useAppDispatch();
  const companyCurrent = useAppSelector(getCurrentCompany());
  const employees = useAppSelector(getEmployees());
  const nvStatements = useAppSelector(getNVEmployeeSalaryStatement());
  const bchStatements = useAppSelector(getBCHEmployeeSalaryStatement());
  const defaultOrg = useAppSelector(getDefaultOrganization());

  const [month, setMonth] = useState(dayjs());
  const [showTerminatedEmployees, setShowTerminatedEmployees] = useState(false);
  const [activeKey, setActiveKey] = useState<string>(EFinancialPlan.KeHoachThanhToan05);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    [EFinancialPlan.KeHoachThanhToan05]: '3',
    [EFinancialPlan.KeHoachThanhToan20]: '5',
  });
  
  // Get button state key based on activeKey (period)
  const getButtonStateKey = () => {
    return activeKey === EFinancialPlan.KeHoachThanhToan05 
      ? EButtonState.KeHoachThanhToan05 
      : EButtonState.KeHoachThanhToan20;
  };
  
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(
    sessionStorage.getItem(getButtonStateKey()) === 'true' ? true : false
  );
  const [isAccountingSaving, setIsAccountingSaving] = useState(false);

  const baseOptions = useMemo(
    () => ({
      [EFinancialPlan.KeHoachThanhToan05]: [
        { value: '3', label: t('payment cost'), policyKeys: ['KeHoachTaiChinh.ThanhToan.View'] },
        { value: '1', label: t('salary data 5th'), policyKeys: ['KeHoachTaiChinh.BangLuongCN.View'] },
        { value: '2', label: t('BCH salary data'), policyKeys: ['KeHoachTaiChinh.BangLuongBCH.View'] },
        { value: '6', label: t('salary summary'), policyKeys: ['KeHoachTaiChinh.BangTHLuong.View'] },
      ],
      [EFinancialPlan.KeHoachThanhToan20]: [
        { value: '5', label: t('payment cost'), policyKeys: ['KeHoachTaiChinh.ThanhToan.View'] },
        { value: '4', label: t('salary data 20th'), policyKeys: ['KeHoachTaiChinh.BangLuongCN.View'] },
        { value: '7', label: t('salary summary'), policyKeys: ['KeHoachTaiChinh.BangTHLuong.View'] },
      ],
    }),
    [t],
  );

  const [selectOptions, setSelectOptions] =
    useState<Record<string, Array<{ value: string; label: string; policyKeys?: string[] }>>>(baseOptions);

  useEffect(() => {
    if (companyCurrent.id) {
      dispatch(employeeActions.getEmployeesRequest({ companyId: companyCurrent.id, params: { page: 1, pageSize: 10000 } }));
    }
  }, [dispatch, companyCurrent.id]);

  const BCHemployees = useMemo(
    () => employees?.results.filter(e => e.groupCodes?.includes('BCH')) || [],
    [employees?.results],
  );

  const NVemployees = useMemo(
    () => employees?.results.filter(e => !BCHemployees.some(b => b.id === e.id)) || [],
    [employees?.results, BCHemployees],
  );

  const activeNVEmployeeIds = useMemo(
    () => NVemployees.filter(employee => employee.status !== 8).map(employee => employee.id),
    [NVemployees],
  );
  const activeBCHEmployeeIds = useMemo(
    () => BCHemployees.filter(employee => employee.status !== 8).map(employee => employee.id),
    [BCHemployees],
  );
  const terminatedEmployeeIds = useMemo(
    () => new Set((employees?.results || []).filter(employee => employee.status === 8).map(employee => employee.id)),
    [employees?.results],
  );

  // TODO: Các bước xử lý bảng lương
  // 1. Call API lấy bảng lương
  // 2. Phân tích structure
  // 3. Aggregate data theo employeeId
  // 4. Tạo columns cho table
  const nameMap = useMemo(() => buildEmployeeNameMap(employees?.results || []), [employees?.results]);
  // const nvAnalysis = useMemo(() => analyzeAggregatedStructure(nvStatements), [nvStatements]);
  // const nvRecords = useMemo(() => aggregatePayrollData(nvStatements || [], nameMap), [nvStatements, nameMap]);
  // const nvColumns = useMemo(() => generateAggregatedTableColumns(nvAnalysis), [nvAnalysis]);

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

  useEffect(() => {
    if (!canViewPayroll) {
      setSelectOptions({
        [EFinancialPlan.KeHoachThanhToan05]: baseOptions[EFinancialPlan.KeHoachThanhToan05].filter(
          o => o.value === '3',
        ),
        [EFinancialPlan.KeHoachThanhToan20]: baseOptions[EFinancialPlan.KeHoachThanhToan20].filter(
          o => o.value === '5',
        ),
      });

      setSelectedOptions({
        [EFinancialPlan.KeHoachThanhToan05]: '3',
        [EFinancialPlan.KeHoachThanhToan20]: '5',
      });
    } else {
      setSelectOptions(baseOptions);
    }
  }, [canViewPayroll, baseOptions]);

  const outerItems = useMemo(
    () => [
      {
        key: EFinancialPlan.KeHoachThanhToan05,
        label: t('Payment plan for the 5th'),
        children: null,
      },
      {
        key: EFinancialPlan.KeHoachThanhToan20,
        label: t('Payment plan for the 20th'),
        children: null,
      },
    ],
    [t],
  );

  const handleSelectChange = (value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [activeKey]: value,
    }));
  };

  const updateButtonState = () => {
    const buttonStateKey = getButtonStateKey();
    sessionStorage.setItem(buttonStateKey, 'false');
    setIsButtonDisabled(false);
  };

  // const handleSave = useCallback(() => {
  //   if (!tableRef.current) return;
  //   const { dataView } = tableRef.current.getExportData();
  //   const isPayrollNV =
  //     (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '1') ||
  //     (activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '4');
  //   const originalData: EmployeeSalaryStatementDTO[] = isPayrollNV ? nvStatements || [] : bchStatements || [];

  //   const bodyRequest = convertDataViewToEmployeeSalaryDTOSimple(
  //     dataView as unknown as AggregatedPayrollType[],
  //     originalData,
  //   );

  //   // if (bodyRequest.length > 0) {
  //   //   dispatch(
  //   //     employeeActions.updateEmployeeSalaryStatementRequest({
  //   //       body: bodyRequest,
  //   //     }),
  //   //   );
  //   // } else {
  //   //   message.warning('Không có dữ liệu thay đổi');
  //   // }
  // }, [activeKey, selectedOptions, nvStatements, bchStatements, dispatch]);

  const handleSave = useCallback(() => {
    if (!tableRef.current) return;

    const { dataView } = tableRef.current.getExportData();
    const isPayrollNV =
      (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '1') ||
      (activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '4');

    const originalData: EmployeeSalaryStatementDTO[] = isPayrollNV ? nvStatements || [] : bchStatements || [];

    const dataViewMap = new Map<number, AggregatedPayrollType>(
      (dataView as unknown as AggregatedPayrollType[]).map(record => [record.employeeId, record]),
    );

    const bodyRequest: EmployeeSalaryStatementDTO[] = originalData.map(originalRecord => {
      const updated = dataViewMap.get(originalRecord.employeeId);

      if (!updated) return originalRecord;

      return {
        ...originalRecord,
        salary: typeof updated.salary === 'number' ? updated.salary : originalRecord.salary,
        salaryAmount: typeof updated.salaryAmount === 'number' ? updated.salaryAmount : originalRecord.salaryAmount,
        performanceSalaryAmount:
          typeof updated.performanceSalaryAmount === 'number'
            ? updated.performanceSalaryAmount
            : originalRecord.performanceSalaryAmount,
        supportRepair: typeof updated.supportRepair === 'number' ? updated.supportRepair : originalRecord.supportRepair,
        protectiveGear:
          typeof updated.protectiveGear === 'number' ? updated.protectiveGear : originalRecord.protectiveGear,
        shiftMainTime: typeof updated.shiftMainTime === 'number' ? updated.shiftMainTime : originalRecord.shiftMainTime,
        shiftOTTime: typeof updated.shiftOTTime === 'number' ? updated.shiftOTTime : originalRecord.shiftOTTime,
        salaryOT: typeof updated.salaryOT === 'number' ? updated.salaryOT : originalRecord.salaryOT,
        salaryMain: typeof updated.salaryMain === 'number' ? updated.salaryMain : originalRecord.salaryMain,
        salaryPerWorkHour:
          typeof updated.salaryPerWorkHour === 'number' ? updated.salaryPerWorkHour : originalRecord.salaryPerWorkHour,
        salaryPerWorkLabor:
          typeof updated.salaryPerWorkLabor === 'number'
            ? updated.salaryPerWorkLabor
            : originalRecord.salaryPerWorkLabor,
        kpiValue: typeof updated.kpiValue === 'number' ? updated.kpiValue : originalRecord.kpiValue,
        salaryBalance: typeof updated.salaryBalance === 'number' ? updated.salaryBalance : originalRecord.salaryBalance,
        signed: typeof updated.signed === 'string' ? updated.signed : originalRecord.signed,
        unionFund: typeof updated.unionFund === 'number' ? updated.unionFund : originalRecord.unionFund,
        salaryAdvance_D20:
          typeof updated.salaryAdvance_D20 === 'number' ? updated.salaryAdvance_D20 : originalRecord.salaryAdvance_D20,
        shiftMainTimeDic:
          typeof updated.shiftMainTimeDic === 'object' ? updated.shiftMainTimeDic : originalRecord.shiftMainTimeDic,
        shiftOTTimeDic:
          typeof updated.shiftOTTimeDic === 'object' ? updated.shiftOTTimeDic : originalRecord.shiftOTTimeDic,

        employeeProjectStatements: originalRecord.employeeProjectStatements?.map(project => {
          const projectKey = `project_${project.projectId}` as keyof AggregatedPayrollType;
          const totalShiftTime = updated[projectKey];
          return {
            ...project,
            totalShiftTime: typeof totalShiftTime === 'number' ? totalShiftTime : project.totalShiftTime,
          };
        }),

        employeeInsurances: originalRecord.employeeInsurances?.map(insurance => {
          const premium = updated[insurance.insuranceName as keyof AggregatedPayrollType];
          return {
            ...insurance,
            premium: typeof premium === 'number' ? premium : insurance.premium,
          };
        }),

        employeeSurcharges: originalRecord.employeeSurcharges?.map(surcharge => {
          const surchargeValue = updated[surcharge.surchargeName as keyof AggregatedPayrollType];
          return {
            ...surcharge,
            surchargeValue: typeof surchargeValue === 'number' ? surchargeValue : surcharge.surchargeValue,
          };
        }),

        employeeFunds: originalRecord.employeeFunds?.map(fund => {
          const contribution = updated[fund.fundName as keyof AggregatedPayrollType];
          return {
            ...fund,
            contribution: typeof contribution === 'number' ? contribution : fund.contribution,
          };
        }),

        employeeSalaryPolicys: originalRecord.employeeSalaryPolicys?.map(policy => {
          const policyValue = updated[`policy_${policy.salaryPolicyId}` as keyof AggregatedPayrollType];
          return {
            ...policy,
            value: typeof policyValue === 'number' ? policyValue : policy.value,
          };
        }),

        employeeSalary: originalRecord.employeeSalary
          ? {
            ...originalRecord.employeeSalary,
            baseSalary:
              typeof updated.baseSalary === 'number' ? updated.baseSalary : originalRecord.employeeSalary.baseSalary,
            salaryPerWorkLabor:
              typeof updated.salaryPerWorkLabor === 'number'
                ? updated.salaryPerWorkLabor
                : originalRecord.employeeSalary.salaryPerWorkLabor,
          }
          : originalRecord.employeeSalary,
      };
    });

    if (bodyRequest.length > 0) {
      dispatch(
        employeeActions.updateEmployeeSalaryStatementRequest({
          body: bodyRequest,
        }),
      );
    } else {
      message.warning('Không có dữ liệu thay đổi');
    }
  }, [activeKey, selectedOptions, nvStatements, bchStatements, dispatch]);

  const handleExportFile = () => {
    if (!tableRef.current) return;
    tableRef.current.exportFile();
  };
  const handleUpdatePerSalary = () => {
    Modal.confirm({
      title: t('Xác nhận lấy dữ liệu kỳ trước?'),
      content: t('Hệ thống sẽ lấy  dữ liệu Định mức lương, BHXH và Hỗ trợ của nhân sự từ kỳ lương trước sang kỳ hiện tại. Bạn có chắc chắn muốn tiếp tục?'),
      okText: t('Xác nhận'),
      cancelText: t('Hủy'),
      onOk: () => {
        let periodCode = ePeriodCode.PERIODCODEDAY5;
        if (activeKey === EFinancialPlan.KeHoachThanhToan20) {
          periodCode = ePeriodCode.PERIODCODEDAY20;
        }
        if (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '2') {
          periodCode = ePeriodCode.PERIODCODEBCH;
        }

        // Nếu là BCH thì workingDay luôn là ngày 05
        const workingDay =
          periodCode === ePeriodCode.PERIODCODEBCH
            ? month.date(5).format('YYYY-MM-DD')
            : month.date(activeKey === EFinancialPlan.KeHoachThanhToan20 ? 5 : 20).format('YYYY-MM-DD');

        dispatch(
          employeeActions.updatePerSalary({
            companyId: defaultOrg?.guid,
            periodCode,
            body: periodCode === ePeriodCode.PERIODCODEBCH ? activeBCHEmployeeIds : activeNVEmployeeIds,
            workingDay,
          }),
        );
      },
    });
  }
  const handleCreateAccountingInvoice = async () => {
    if (!paymentCostRef.current) return;
    if (isAccountingSaving) return;
    setIsAccountingSaving(true);
    try {
      const saved = await paymentCostRef.current.handleSave();
      if (!saved) return;
      Utils.successNotification('Lưu hạch toán thành công');
      setIsButtonDisabled(true);
      // Set key for current period to 'true' to disable button
      const buttonStateKey = getButtonStateKey();
      sessionStorage.setItem(buttonStateKey, 'true');
    } finally {
      setIsAccountingSaving(false);
    }
  };

  const handleExportSalarySummary = () => {
    if (!salarySummaryRef.current) return;
    salarySummaryRef.current.exportSalarySummary();
  };

  const isSalarySummary =
    (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '6') ||
    (activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '7');

  return (
    <div className={styles.paymentPlanContainer}>
      <div className={styles.header}>
        <div className={styles.actionBar}>
          <Tabs activeKey={activeKey} onChange={setActiveKey} items={outerItems} />

          <div className={styles.actionButtons}>
            <Space>
              <WithPermission policyKeys={['KeHoachTaiChinh.BangLuongCN.View']} strategy="disable">
                {(
                  (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '1') ||
                  (activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '4') ||
                  (activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '2') // BCH salary data
                )
                  ? (
                    <Button type="primary" onClick={handleUpdatePerSalary}>
                      {t('Lấy dữ liệu kỳ trước')}
                    </Button>
                  ) : null}
              </WithPermission>
            </Space>
            <div style={{ display: 'flex', gap: 10 }}>
              <Select
                style={{ width: 220 }}
                value={selectedOptions[activeKey]}
                onChange={handleSelectChange}
                options={selectOptions[activeKey]}
              />

              <DatePicker
                picker="month"
                style={{ width: 220 }}
                value={month ?? dayjs()}
                onChange={m => m && setMonth(m)}
                format="YYYY-MM"
              />
              <Space size={6}>
                <Switch
                  size="small"
                  checked={showTerminatedEmployees}
                  onChange={setShowTerminatedEmployees}
                />
                <Typography.Text>Hiển thị đã nghỉ việc</Typography.Text>
              </Space>
            </div>

            {!isSalarySummary ? (
              (activeKey === EFinancialPlan.KeHoachThanhToan05 || activeKey === EFinancialPlan.KeHoachThanhToan20) &&
                (selectedOptions[activeKey] === '3' || selectedOptions[activeKey] === '5') ? (
                <div style={{ marginLeft: 10 }}>
                  <WithPermission policyKeys={['KeHoachTaiChinh.ThanhToan.Create']} strategy="disable">
                    <Button
                      type="primary"
                      onClick={handleCreateAccountingInvoice}
                      disabled={isButtonDisabled || isAccountingSaving}
                      loading={isAccountingSaving}
                    >
                      Lưu hạch toán
                    </Button>
                  </WithPermission>
                </div>
              ) : (
                <>
                  <Space>
                    <WithPermission policyKeys={['KeHoachTaiChinh.BangLuongBCH.SaveChanges']} strategy="disable">
                      <Button type="primary" onClick={handleSave}>
                        {t('Save')}
                      </Button>
                    </WithPermission>
                  </Space>

                  <Space>
                    <WithPermission policyKeys={['KeHoachTaiChinh.BangLuongBCH.Export']} strategy="disable">
                      <Button type="primary" onClick={handleExportFile}>
                        {t('Export Excel')}
                      </Button>
                    </WithPermission>
                  </Space>
                </>
              )
            ) : (
              <div style={{ marginLeft: 10 }}>
                <WithPermission policyKeys={['KeHoachTaiChinh.BangTHLuong.Export']} strategy="disable">
                  <Button type="primary" onClick={handleExportSalarySummary}>
                    {t('Export Excel')}
                  </Button>
                </WithPermission>
              </div>
            )}
          </div>
        </div>
        {/* <ActionBar
          activeKey={activeKey}
          items={outerItems}
          onTabChange={setActiveKey}
          onSave={handleSave}
          onExport={handleExportFile}
          onCreateAccountingInvoice={handleCreateAccountingInvoice}
          onExportSalarySummary={handleExportSalarySummary}
          t={t}
          selectOptions={selectOptions}
          selectedValue={selectedOptions[activeKey]}
          onSelectChange={handleSelectChange}
          month={month}
          onMonthChange={m => m && setMonth(m)}
        /> */}
      </div>

      <Suspense fallback={<Spin size="large" />}>
        {activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '1' && (
          <PayrollTableContainer
            tableRef={tableRef}
            orgId={companyCurrent.orgId}
            group="NV"
            month={month}
            periodCode={ePeriodCode.PERIODCODEDAY5}
            body={activeNVEmployeeIds}
            nameMap={nameMap}
            excludedEmployeeIds={showTerminatedEmployees ? undefined : terminatedEmployeeIds}
            typeEFinancialPlan={EFinancialPlan.KeHoachThanhToan05}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '2' && (
          <BCHSalaryContainer
            tableRef={tableRef}
            orgId={companyCurrent.orgId}
            group="BCH"
            month={month}
            periodCode={ePeriodCode.PERIODCODEBCH}
            body={activeBCHEmployeeIds}
            nameMap={nameMap}
            excludedEmployeeIds={showTerminatedEmployees ? undefined : terminatedEmployeeIds}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '3' && (
          <PaymentCost
            ref={paymentCostRef}
            typeEFinancialPlan={EFinancialPlan.KeHoachThanhToan05}
            selectMonth={month}
            onUpdateButtonState={updateButtonState}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan05 && selectedOptions[activeKey] === '6' && (
          <SalarySummary
            ref={salarySummaryRef}
            activeKey={EFinancialPlan.KeHoachThanhToan05}
            BCHperiodCode={ePeriodCode.PERIODCODEBCH}
            NVperiodCode={ePeriodCode.PERIODCODEDAY5}
            month={month}
            includeTerminatedEmployees={showTerminatedEmployees}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '4' && (
          <PayrollTableContainer
            tableRef={tableRef}
            orgId={companyCurrent.orgId}
            group="NV"
            month={month}
            periodCode={ePeriodCode.PERIODCODEDAY20}
            body={activeNVEmployeeIds}
            nameMap={nameMap}
            excludedEmployeeIds={showTerminatedEmployees ? undefined : terminatedEmployeeIds}
            typeEFinancialPlan={EFinancialPlan.KeHoachThanhToan20}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '5' && (
          <PaymentCost
            ref={paymentCostRef}
            typeEFinancialPlan={EFinancialPlan.KeHoachThanhToan20}
            selectMonth={month}
            onUpdateButtonState={updateButtonState}
          />
        )}

        {activeKey === EFinancialPlan.KeHoachThanhToan20 && selectedOptions[activeKey] === '7' && (
          <SalarySummary
            ref={salarySummaryRef}
            activeKey={EFinancialPlan.KeHoachThanhToan20}
            BCHperiodCode={ePeriodCode.PERIODCODEBCH}
            NVperiodCode={ePeriodCode.PERIODCODEDAY20}
            month={month}
            includeTerminatedEmployees={showTerminatedEmployees}
          />
        )}
      </Suspense>
    </div>
  );
}
