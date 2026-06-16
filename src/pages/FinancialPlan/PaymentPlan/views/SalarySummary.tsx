/* eslint-disable import/order */
import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { Button, Input, Modal, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { EFinancialPlan, ePeriodCode } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import {
  employeeActions,
  getBCHEmployeeSalaryStatementSummary,
  getEmployees,
  getNVEmployeeSalaryStatementSummary,
} from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

import styles from '../PaymentPlan.module.css';
import { exportBaseExcel } from '../utils/ExportFile';

interface BchEmployeeRecord {
  key: string;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  shiftMainTime: number;
  shiftOTTime: number;
  salaryMain: number;
  salaryOT: number;
  totalMoneyAdjustment: number;
  totalSalary: number;
}

interface RecordType {
  key: string;
  operatorId: string;
  projectCode?: string;
  duAn: string;
  congNhan: number;
  bchEmployeeCount: number;
  bchSalaryMain: number;
  bchSalaryOT: number;
  bchAdjustment: number;
  bch: number;
  bchEmployees: BchEmployeeRecord[];
}

interface SalarySummaryProps {
  activeKey: EFinancialPlan;
  NVperiodCode: string;
  BCHperiodCode: string;
  month: dayjs.Dayjs;
  includeTerminatedEmployees?: boolean;
}

export interface SalarySummaryRef {
  exportSalarySummary: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);

const SalarySummary = forwardRef<SalarySummaryRef, SalarySummaryProps>(
  ({ activeKey, NVperiodCode, BCHperiodCode, month, includeTerminatedEmployees = false }, ref): React.JSX.Element => {
    const tableRef = useRef<any>(null);
    const dispatch = useAppDispatch();
    const loading = useAppSelector(getLoading('getEmployeeSalaryStatementSummary'));
    const [selectedProject, setSelectedProject] = useState<string>();
    const [searchText, setSearchText] = useState('');
    const [detailProject, setDetailProject] = useState<RecordType | null>(null);
    const [detailSearchText, setDetailSearchText] = useState('');

    const employees = useAppSelector(getEmployees());
    const companyCurrent = useAppSelector(getCurrentCompany());
    const nvStatementsSummary = useAppSelector(getNVEmployeeSalaryStatementSummary());
    const bchStatementsSummary = useAppSelector(getBCHEmployeeSalaryStatementSummary());

    const BCHemployees = useMemo(
      () => employees?.results.filter(employee => employee.groupCodes?.includes('BCH')) || [],
      [employees?.results],
    );

    const NVemployees = useMemo(
      () => employees?.results.filter(employee => !BCHemployees.some(bch => bch.id === employee.id)) || [],
      [employees?.results, BCHemployees],
    );

    const NVEmployeeIds = useMemo(
      () => NVemployees
        .filter(employee => includeTerminatedEmployees || employee.status !== 8)
        .map(employee => employee.id),
      [NVemployees, includeTerminatedEmployees],
    );
    const BCHEmployeeIds = useMemo(
      () => BCHemployees
        .filter(employee => includeTerminatedEmployees || employee.status !== 8)
        .map(employee => employee.id),
      [BCHemployees, includeTerminatedEmployees],
    );
    const employeeNameMap = useMemo(
      () =>
        Object.fromEntries(
          (employees?.results || []).map(employee => [
            employee.id,
            [employee.lastName, employee.middleName, employee.firstName].filter(Boolean).join(' ').trim(),
          ]),
        ),
      [employees?.results],
    );

    useEffect(() => {
      if (!companyCurrent?.orgId || !employees) return;

      const groups: ('NV' | 'BCH')[] =
        activeKey === EFinancialPlan.KeHoachThanhToan20 ? ['NV'] : ['NV', 'BCH'];

      groups.forEach(group => {
        const body = group === 'NV' ? NVEmployeeIds : BCHEmployeeIds;
        const periodCode = group === 'NV' ? NVperiodCode : BCHperiodCode;
        if (body.length === 0) return;

        const day = group === 'BCH' ? 5 : NVperiodCode === ePeriodCode.PERIODCODEDAY5 ? 20 : 5;
        dispatch(
          employeeActions.getEmployeeSalaryStatementSummaryRequest({
            companyId: companyCurrent.orgId,
            body,
            params: {
              workingDay: month.date(day).format('YYYY-MM-DD'),
              periodCode,
            },
            group,
          }),
        );
      });
    }, [
      activeKey,
      companyCurrent?.orgId,
      month,
      NVEmployeeIds,
      BCHEmployeeIds,
      NVperiodCode,
      BCHperiodCode,
      dispatch,
      employees,
    ]);

    const rawTableData: RecordType[] = useMemo(() => {
      const rows: Record<string, RecordType> = {};

      const ensureRow = (operatorId: string, projectName: string, projectCode?: string) => {
        const key = operatorId || `${projectCode || ''}-${projectName}`;
        if (!rows[key]) {
          rows[key] = {
            key,
            operatorId,
            projectCode,
            duAn: projectName,
            congNhan: 0,
            bchEmployeeCount: 0,
            bchSalaryMain: 0,
            bchSalaryOT: 0,
            bchAdjustment: 0,
            bch: 0,
            bchEmployees: [],
          };
        }
        return rows[key];
      };

      nvStatementsSummary?.forEach(item => {
        ensureRow(item.operatorId, item.projectName, item.projectCode).congNhan += item.totalSalary;
      });

      if (activeKey !== EFinancialPlan.KeHoachThanhToan20) {
        bchStatementsSummary?.forEach(item => {
          const row = ensureRow(item.operatorId, item.projectName, item.projectCode);
          row.bchEmployeeCount += item.employeeCount || 0;
          row.bchSalaryMain += item.salaryMain || 0;
          row.bchSalaryOT += item.salaryOT || 0;
          row.bchAdjustment += item.totalMoneyAdjustment || 0;
          row.bch += item.totalSalary || 0;
          row.bchEmployees.push(
            ...(item.employees || []).map(employee => ({
              key: `${item.operatorId}-${employee.employeeId}`,
              employeeId: employee.employeeId,
              employeeCode: employee.employeeCode || '',
              employeeName: employeeNameMap[employee.employeeId] || 'Chưa xác định',
              shiftMainTime: employee.shiftMainTime || 0,
              shiftOTTime: employee.shiftOTTime || 0,
              salaryMain: employee.salaryMain || 0,
              salaryOT: employee.salaryOT || 0,
              totalMoneyAdjustment: employee.totalMoneyAdjustment || 0,
              totalSalary: employee.totalSalary || 0,
            })),
          );
        });
      }

      return Object.values(rows).sort((a, b) => a.duAn.localeCompare(b.duAn, 'vi'));
    }, [nvStatementsSummary, bchStatementsSummary, activeKey, employeeNameMap]);

    const projectOptions = useMemo(
      () =>
        rawTableData.map(item => ({
          value: item.key,
          label: item.projectCode ? `${item.projectCode} - ${item.duAn}` : item.duAn,
        })),
      [rawTableData],
    );

    const normalizedSearch = searchText.trim().toLocaleLowerCase('vi');
    const tableData = useMemo(
      () =>
        rawTableData
          .filter(item => !selectedProject || item.key === selectedProject)
          .map(item => {
            if (!normalizedSearch) return item;

            const projectMatches = `${item.projectCode || ''} ${item.duAn}`
              .toLocaleLowerCase('vi')
              .includes(normalizedSearch);
            const matchingEmployees = item.bchEmployees.filter(employee =>
              `${employee.employeeCode} ${employee.employeeName}`.toLocaleLowerCase('vi').includes(normalizedSearch),
            );

            if (!projectMatches && matchingEmployees.length === 0) return null;
            return projectMatches ? item : { ...item, bchEmployees: matchingEmployees };
          })
          .filter((item): item is RecordType => Boolean(item)),
      [rawTableData, selectedProject, normalizedSearch],
    );

    const showBCH = activeKey !== EFinancialPlan.KeHoachThanhToan20;
    const filteredDetailEmployees = useMemo(() => {
      if (!detailProject) return [];
      const keyword = detailSearchText.trim().toLocaleLowerCase('vi');
      if (!keyword) return detailProject.bchEmployees;

      return detailProject.bchEmployees.filter(employee =>
        `${employee.employeeCode} ${employee.employeeName}`.toLocaleLowerCase('vi').includes(keyword),
      );
    }, [detailProject, detailSearchText]);

    const closeDetail = () => {
      setDetailProject(null);
      setDetailSearchText('');
    };

    const columns: ColumnsType<RecordType> = useMemo(() => {
      const result: ColumnsType<RecordType> = [
        {
          title: 'Dự án',
          dataIndex: 'duAn',
          key: 'duAn',
          width: '18%',
          ellipsis: true,
          filters: Array.from(new Set(tableData.map(item => item.duAn))).map(value => ({
            text: value,
            value,
          })),
          filterSearch: true,
          onFilter: (value, record) => record.duAn.toLowerCase().includes((value as string).toLowerCase()),
        },
        {
          title: 'Công nhân',
          dataIndex: 'congNhan',
          key: 'congNhan',
          align: 'right',
          width: '12%',
          render: value => formatCurrency(value),
        },
      ];

      if (showBCH) {
        result.push({
          title: 'Chi phí lương BCH',
          key: 'bch',
          align: 'center',
          children: [
            {
              title: 'Nhân sự',
              dataIndex: 'bchEmployeeCount',
              key: 'bchEmployeeCount',
              align: 'center',
              width: '8%',
              render: (value, record) =>
                record.bchEmployees.length > 0 ? <Typography.Link>{value}</Typography.Link> : value,
            },
            {
              title: 'Lương chính',
              dataIndex: 'bchSalaryMain',
              key: 'bchSalaryMain',
              align: 'right',
              width: '15%',
              render: value => formatCurrency(value),
            },
            {
              title: 'Tăng ca',
              dataIndex: 'bchSalaryOT',
              key: 'bchSalaryOT',
              align: 'right',
              width: '12%',
              render: value => formatCurrency(value),
            },
            {
              title: 'Điều chỉnh',
              dataIndex: 'bchAdjustment',
              key: 'bchAdjustment',
              align: 'right',
              width: '15%',
              render: value => formatCurrency(value),
            },
            {
              title: 'Tổng chi phí',
              dataIndex: 'bch',
              key: 'bch',
              align: 'right',
              width: '20%',
              render: value => <Typography.Text strong>{formatCurrency(value)}</Typography.Text>,
            },
          ],
        });
      }

      return result;
    }, [showBCH, tableData]);

    const employeeColumns: ColumnsType<BchEmployeeRecord> = useMemo(
      () => [
        { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode', width: '11%', ellipsis: true },
        { title: 'Họ tên', dataIndex: 'employeeName', key: 'employeeName', width: '21%', ellipsis: true },
        {
          title: 'Công chính',
          dataIndex: 'shiftMainTime',
          key: 'shiftMainTime',
          align: 'right',
          width: '10%',
        },
        { title: 'Công OT', dataIndex: 'shiftOTTime', key: 'shiftOTTime', align: 'right', width: '9%' },
        {
          title: 'Lương chính',
          dataIndex: 'salaryMain',
          key: 'salaryMain',
          align: 'right',
          width: '14%',
          render: value => formatCurrency(value),
        },
        {
          title: 'Tăng ca',
          dataIndex: 'salaryOT',
          key: 'salaryOT',
          align: 'right',
          width: '11%',
          render: value => formatCurrency(value),
        },
        {
          title: 'Điều chỉnh',
          dataIndex: 'totalMoneyAdjustment',
          key: 'totalMoneyAdjustment',
          align: 'right',
          width: '12%',
          render: value => formatCurrency(value),
        },
        {
          title: 'Tổng chi phí',
          dataIndex: 'totalSalary',
          key: 'totalSalary',
          align: 'right',
          width: '12%',
          render: value => <Typography.Text strong>{formatCurrency(value)}</Typography.Text>,
        },
      ],
      [],
    );

    useImperativeHandle(ref, () => ({
      exportSalarySummary: () => {
        const exportData = tableData.flatMap((project, index) => {
          const projectRow = {
            stt: index + 1,
            loaiDong: 'Tổng công trình',
            duAn: project.duAn,
            projectCode: project.projectCode || '',
            employeeCode: '',
            employeeName: '',
            shiftMainTime: '',
            shiftOTTime: '',
            congNhan: project.congNhan,
            bchEmployeeCount: project.bchEmployeeCount,
            bchSalaryMain: project.bchSalaryMain,
            bchSalaryOT: project.bchSalaryOT,
            bchAdjustment: project.bchAdjustment,
            bch: project.bch,
          };
          const employeeRows = project.bchEmployees.map(employee => ({
            stt: '',
            loaiDong: 'Chi tiết BCH',
            duAn: project.duAn,
            projectCode: project.projectCode || '',
            employeeCode: employee.employeeCode,
            employeeName: employee.employeeName,
            shiftMainTime: employee.shiftMainTime,
            shiftOTTime: employee.shiftOTTime,
            congNhan: '',
            bchEmployeeCount: '',
            bchSalaryMain: employee.salaryMain,
            bchSalaryOT: employee.salaryOT,
            bchAdjustment: employee.totalMoneyAdjustment,
            bch: employee.totalSalary,
          }));
          return [projectRow, ...employeeRows];
        });

        const day = activeKey === EFinancialPlan.KeHoachThanhToan20 ? 15 : 30;
        exportBaseExcel({
          data: exportData,
          fileName: `TongHopLuong_${day}-${month.format('MM-YYYY')}.xlsx`,
          sheetName: 'TongHopLuong',
          columns: [
            { header: 'STT', key: 'stt' },
            { header: 'Loại dòng', key: 'loaiDong' },
            { header: 'Mã công trình', key: 'projectCode' },
            { header: 'Công trình', key: 'duAn' },
            { header: 'Mã nhân sự BCH', key: 'employeeCode' },
            { header: 'Nhân sự BCH', key: 'employeeName' },
            { header: 'Công chính', key: 'shiftMainTime' },
            { header: 'Công OT', key: 'shiftOTTime' },
            { header: 'Chi phí công nhân', key: 'congNhan' },
            { header: 'Số BCH', key: 'bchEmployeeCount' },
            { header: 'Lương chính BCH', key: 'bchSalaryMain' },
            { header: 'Tăng ca BCH', key: 'bchSalaryOT' },
            { header: 'Điều chỉnh BCH', key: 'bchAdjustment' },
            { header: 'Tổng chi phí BCH', key: 'bch' },
          ],
        })
          .then(() => Utils.successNotification('Xuất file thành công'))
          .catch(() => Utils.errorNotification('Xuất file thất bại'));
      },
    }));

    return (
      <Fragment>
        <Space className={styles.salarySummaryFilters} wrap>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tất cả công trình"
            value={selectedProject}
            options={projectOptions}
            onChange={setSelectedProject}
            style={{ minWidth: 300 }}
          />
          <Input.Search
            allowClear
            value={searchText}
            placeholder="Tìm công trình, tên hoặc mã nhân sự"
            onChange={event => setSearchText(event.target.value)}
            style={{ width: 360 }}
          />
        </Space>

        <Table
          bordered
          className={`${styles.customExcelTable} ${styles.salarySummaryTable}`}
          ref={tableRef}
          loading={loading}
          columns={columns}
          pagination={false}
          dataSource={tableData}
          tableLayout="fixed"
          scroll={{ y: 'calc(100vh - 230px)' }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className={styles.salarySummaryTotalRow}>
                <Table.Summary.Cell index={0}>Tổng hợp lương</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {formatCurrency(tableData.reduce((sum, row) => sum + row.congNhan, 0))}
                </Table.Summary.Cell>
                {showBCH ? (
                  <>
                    <Table.Summary.Cell index={2} align="center">
                      {
                        new Set(tableData.flatMap(row => row.bchEmployees.map(employee => employee.employeeId)))
                          .size
                      }
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      {formatCurrency(tableData.reduce((sum, row) => sum + row.bchSalaryMain, 0))}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      {formatCurrency(tableData.reduce((sum, row) => sum + row.bchSalaryOT, 0))}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      {formatCurrency(tableData.reduce((sum, row) => sum + row.bchAdjustment, 0))}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      {formatCurrency(tableData.reduce((sum, row) => sum + row.bch, 0))}
                    </Table.Summary.Cell>
                  </>
                ) : null}
              </Table.Summary.Row>
            </Table.Summary>
          )}
          onRow={record => ({
            onClick: () => {
              if (showBCH && record.bchEmployees.length > 0) setDetailProject(record);
            },
            className: showBCH && record.bchEmployees.length > 0 ? styles.salarySummaryRow : '',
          })}
        />

        <Modal
          open={Boolean(detailProject)}
          onCancel={closeDetail}
          width="min(1080px, calc(100vw - 32px))"
          centered
          destroyOnClose
          maskClosable
          title={
            <div className={styles.salaryDetailTitle}>
              <Typography.Title level={4}>Chi tiết chi phí lương BCH</Typography.Title>
              <Typography.Text type="secondary">
                {detailProject?.projectCode ? `${detailProject.projectCode} - ` : ''}
                {detailProject?.duAn}
              </Typography.Text>
            </div>
          }
          footer={
            <Button type="primary" onClick={closeDetail}>
              Đóng
            </Button>
          }
        >
          {detailProject ? (
            <div className={styles.salaryDetailContent}>
              <div className={styles.salaryDetailSummary}>
                <div>
                  <span>Nhân sự BCH</span>
                  <strong>{detailProject.bchEmployeeCount}</strong>
                </div>
                <div>
                  <span>Lương chính</span>
                  <strong>{formatCurrency(detailProject.bchSalaryMain)}</strong>
                </div>
                <div>
                  <span>Tăng ca</span>
                  <strong>{formatCurrency(detailProject.bchSalaryOT)}</strong>
                </div>
                <div>
                  <span>Điều chỉnh</span>
                  <strong>{formatCurrency(detailProject.bchAdjustment)}</strong>
                </div>
                <div>
                  <span>Tổng chi phí</span>
                  <strong>{formatCurrency(detailProject.bch)}</strong>
                </div>
              </div>

              <Input.Search
                allowClear
                value={detailSearchText}
                placeholder="Tìm theo tên hoặc mã nhân sự"
                onChange={event => setDetailSearchText(event.target.value)}
                className={styles.salaryDetailSearch}
              />

              <Table
                className={styles.salaryDetailTable}
                rowKey="key"
                size="small"
                tableLayout="fixed"
                columns={employeeColumns}
                dataSource={filteredDetailEmployees}
                pagination={false}
                scroll={{ y: 420 }}
              />
            </div>
          ) : null}
        </Modal>
      </Fragment>
    );
  },
);

export default SalarySummary;
SalarySummary.displayName = 'SalarySummary';
