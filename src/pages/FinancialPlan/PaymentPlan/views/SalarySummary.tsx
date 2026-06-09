/* eslint-disable import/order */
import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import { Table } from 'antd';
import type { ColumnsType, ColumnType } from "antd/es/table";
import dayjs from 'dayjs';

import { exportBaseExcel } from '../utils/ExportFile';
import { EFinancialPlan, ePeriodCode } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import {
  employeeActions,
  getBCHEmployeeSalaryStatementSummary,
  getEmployees,
  getNVEmployeeSalaryStatementSummary,
} from '@/store/employee';
import styles from '../PaymentPlan.module.css';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

// ---------------------------------------------------------------

interface RecordType {
  key: string;
  duAn: string;
  congNhan: number;
  bch: number;
}

interface SalarySummaryProps {
  activeKey: EFinancialPlan;
  NVperiodCode: string;
  BCHperiodCode: string;
  month: dayjs.Dayjs;
}

export interface SalarySummaryRef {
  exportSalarySummary: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US').format(value);

const SalarySummary = forwardRef<SalarySummaryRef, SalarySummaryProps>(
  ({ activeKey, NVperiodCode, BCHperiodCode, month }, ref): React.JSX.Element => {
    const tableRef = useRef<any>(null);
    const dispatch = useAppDispatch();
    const loading = useAppSelector(getLoading('getEmployeeSalaryStatement'));

    const employees = useAppSelector(getEmployees());
    const companyCurrent = useAppSelector(getCurrentCompany());
    const nvStatementsSummary = useAppSelector(getNVEmployeeSalaryStatementSummary());
    const bchStatementsSummary = useAppSelector(getBCHEmployeeSalaryStatementSummary());

    const BCHemployees = useMemo(
      () => employees?.results.filter(e => e.groupCodes?.includes('BCH')) || [],
      [employees?.results],
    );

    const NVemployees = useMemo(
      () => employees?.results.filter(e => !BCHemployees.some(b => b.id === e.id)) || [],
      [employees?.results, BCHemployees],
    );

    const NVEmployeeIds = useMemo(() => NVemployees.map(e => e.id), [NVemployees]);
    const BCHEmployeeIds = useMemo(() => BCHemployees.map(e => e.id), [BCHemployees]);

    useEffect(() => {
      const groups: ('NV' | 'BCH')[] = activeKey === EFinancialPlan.KeHoachThanhToan20 ? ['NV'] : ['NV', 'BCH'];

      groups.forEach(group => {
        const body = group === 'NV' ? NVEmployeeIds : BCHEmployeeIds;
        const day = NVperiodCode === ePeriodCode.PERIODCODEDAY5 ? 20 : 5;
        const workingDay = month.date(day).format('YYYY-MM-DD');
        const periodCode = group === 'NV' ? NVperiodCode : BCHperiodCode;

        dispatch(
          employeeActions.getEmployeeSalaryStatementSummaryRequest({
            companyId: companyCurrent.orgId,
            body,
            params: { workingDay, periodCode },
            group,
          }),
        );
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeKey, companyCurrent.orgId, month, NVEmployeeIds, BCHEmployeeIds, NVperiodCode, BCHperiodCode]);

    const tableData: RecordType[] = useMemo(() => {
      type Acc = Record<string, RecordType>;
      const acc: Acc = {};

      const ensureRow = (name: string) => {
        if (!acc[name]) {
          acc[name] = { key: name, duAn: name, congNhan: 0, bch: 0 };
        }
        return acc[name];
      };

      nvStatementsSummary?.forEach(item => {
        ensureRow(item.projectName).congNhan += item.totalSalary;
      });

      if (activeKey !== EFinancialPlan.KeHoachThanhToan20) {
        bchStatementsSummary?.forEach(item => {
          ensureRow(item.projectName).bch += item.totalSalary;
        });
      }

      return Object.values(acc);
    }, [nvStatementsSummary, bchStatementsSummary, activeKey]);

    const makeNumberFilters = <K extends keyof RecordType>(field: K) =>
      Array.from(new Set(tableData.map(r => r[field]))).map(v => ({
        text: formatCurrency(v as number),
        value: v,
      }));

    const showBCH = activeKey !== EFinancialPlan.KeHoachThanhToan20;
    const columns: ColumnsType<RecordType> = useMemo(() => {
      const cols: ColumnsType<RecordType> = [
        {
          title: 'Dự án',
          dataIndex: 'duAn',
          width: 200,
          key: 'duAn',
          filters: Array.from(new Set(tableData.map(d => d.duAn))).map(v => ({
            text: v,
            value: v,
          })),
          filterSearch: true,
          onFilter: (value, record) => record.duAn.toLowerCase().includes((value as string).toLowerCase()),
        },
        {
          title: 'Công nhân',
          dataIndex: 'congNhan',
          key: 'congNhan',
          align: 'center',
          width: 350,
          render: val => formatCurrency(val),
        },
      ];

      if (showBCH) {
        cols.push({
          title: 'BCH',
          dataIndex: 'bch',
          key: 'bch',
          align: 'center',
          width: 350,
          render: val => formatCurrency(val),
        });
      }
      return cols;
    }, [tableData, showBCH]);

    useImperativeHandle(ref, () => ({
      exportSalarySummary: () => {
        const exportData = tableData.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));

        const day = activeKey === EFinancialPlan.KeHoachThanhToan20 ? 15 : 30;
        const monthYear = month.format('MM-YYYY');
        const fileName = `SalarySummary_${day}-${monthYear}.xlsx`;

        exportBaseExcel({
          data: [...exportData],
          fileName,
          sheetName: 'SalarySummary',
          columns: [
            { header: 'STT', key: 'stt' },
            { header: 'Dự án', key: 'Dự án' },
            { header: 'Công nhân', key: 'Công nhân' },
            { header: 'BCH', key: 'BCH' },
          ],
        })
          .then(() => {
            Utils.successNotification('Xuất file thành công');
          })
          .catch(err => {
            Utils.errorNotification('Xuất file thất bại');
          });
      },
    }));

    return (
      <Fragment>
        <div>
          <Table
            bordered
            className={styles.customExcelTable}
            ref={tableRef}
            loading={loading}
            columns={columns}
            pagination={false}
            dataSource={tableData}
            scroll={{ x: 800, y: 'calc(100vh - 178px)' }}
          />
        </div>

        {/* Sticky footer tổng hợp lương */}
        <div style={{ position: 'sticky', bottom: 0, paddingTop: 6, fontWeight: "bold" }}>
          <Table
            style={{ borderTop: "1px solid #000" }}
            className={styles.customExcelTable}
            pagination={false}
            showHeader={false}
            columns={columns.map(col => {
              // Nếu cột có dataIndex (tức là ColumnType, không phải ColumnGroupType)
              if ("dataIndex" in col && col.dataIndex === "duAn") {
                return {
                  ...col,
                  onCell: (record: any) => {
                    if (record.key === "summary") {
                      return {
                        style: {
                          fontSize: 16,
                          fontWeight: "bold",
                        },
                      };
                    }
                    return {};
                  },
                } as ColumnType<any>;
              }
              return col;
            })}
            dataSource={[
              {
                key: "summary",
                duAn: "Tổng hợp lương",
                congNhan: tableData.reduce((sum, r) => sum + r.congNhan, 0),
                bch: showBCH
                  ? tableData.reduce((sum, r) => sum + r.bch, 0)
                  : undefined,
              },
            ]}
          />
        </div>
      </Fragment>
    );
  },
);

export default SalarySummary;
SalarySummary.displayName = 'SalarySummary';
