import React, { useMemo } from 'react';

import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import './DailyLaborSummaryTable.css';
import { EmployeeRow, EmployeeRows } from '../types';
import { convertMinutesToWorkday, formatNumber } from '@/utils';

// ------------------------------------------------------------------

interface DailyLaborSummaryTableProps {
  dataSource: EmployeeRow[];
}

interface DataSourceRow extends EmployeeRows {
  chenhLech?: number;
  isRecordRow?: boolean;
}

export default function DailyLaborSummaryTable({ dataSource }: DailyLaborSummaryTableProps): React.JSX.Element {
  const adjustedData = dataSource;

  const groupObj = adjustedData.reduce<Record<number, EmployeeRow[]>>((acc, cur) => {
    if (!acc[cur.teamId]) acc[cur.teamId] = [];
    acc[cur.teamId].push(cur);
    return acc;
  }, {});

  const finalData = useMemo<DataSourceRow[]>(() => {
    const groups: Record<string, DataSourceRow[]> = {};

    dataSource.forEach(row => {
      (groups[row.groupName] ||= []).push(row);
    });

    let allCongCham = 0, allCongDanhGia = 0, allChenhLech = 0;
    let result: DataSourceRow[] = [];
    Object.entries(groupObj).forEach(([teamIdStr, rows]) => {
      let totalCongCham = 0,
        totalCongDanhGia = 0,
        totalChenhLech = 0
      ;
      const records: DataSourceRow[] = [];
      rows.forEach((r, i) => {
        const congChamValue = parseFloat(convertMinutesToWorkday(r.congCham).toFixed(3));
        const congDanhGia = parseFloat(r.congDanhGia.toFixed(3));
        const chenhLech = congChamValue - congDanhGia;
        records.push({ ...r, sttWithinGroup: i + 1, chenhLech, isRecordRow: true });
        totalCongCham += r.congCham || 0;
        totalCongDanhGia += r.congDanhGia || 0;
        totalChenhLech += chenhLech || 0;
      });
      
      const groupHeader = {
        teamId: Number(teamIdStr),
        maNV: '',
        tenNV: '',
        groupName: rows[0].groupName,
        chucVu: '',
        dvt: '',
        congCham: totalCongCham,
        congDanhGia: totalCongDanhGia,
        chenhLech: totalChenhLech,
        isGroupHeader: true,
      };
      result = result.concat([groupHeader, ...records]);

      allCongCham += totalCongCham;
      allCongDanhGia += totalCongDanhGia;
      allChenhLech += totalChenhLech;
    });

    const summaryHeader = {
      teamId: Number(-1),
      maNV: '',
      tenNV: '',
      groupName: 'Tổng công trình: ',
      chucVu: '',
      dvt: '',
      congCham: allCongCham,
      congDanhGia: allCongDanhGia,
      chenhLech: allChenhLech,
      isGroupHeader: true,
    }
    return [summaryHeader, ...result];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nn
  }, [dataSource]);

  const columns: ColumnsType<DataSourceRow> = [
    {
      title: 'STT',
      width: 70,
      render: (_, record) =>
        record.isGroupHeader
          ? {
              children: <strong style={{ textTransform: 'uppercase' }}>{record.groupName}</strong>,
              props: { colSpan: 5 },
            }
          : record.sttWithinGroup,
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'maNV',
      width: 150,
      render: (v, r) => (r.isGroupHeader ? { children: null, props: { colSpan: 0 } } : v),
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'tenNV',
      width: 250,
      render: (v, r) => (r.isGroupHeader ? { children: null, props: { colSpan: 0 } } : v),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'chucVu',
      width: 150,
      render: (v, r) => (r.isGroupHeader ? { children: null, props: { colSpan: 0 } } : v),
    },
    {
      title: 'ĐVT',
      dataIndex: 'dvt',
      width: 100,
      render: (v, r) => (r.isGroupHeader ? { children: null, props: { colSpan: 0 } } : v),
    },
    {
      title: 'Công chấm',
      dataIndex: 'congCham',
      width: 150,
      align: 'center',
      render: (v, r) => {
        const workdays = convertMinutesToWorkday(v);
        return <Typography.Text strong={r.isGroupHeader}>{formatNumber(workdays, 3)}</Typography.Text>;
      },
    },
    {
      title: 'Công đánh giá',
      dataIndex: 'congDanhGia',
      width: 150,
      align: 'center',
      render: (v, r) => {
        return <Typography.Text strong={r.isGroupHeader}>{formatNumber(v, 3)}</Typography.Text>;
      }
    },
    {
      title: 'Chênh lệch',
      key: 'chenhLech',
      dataIndex: 'chenhLech',
      width: 150,
      align: 'center',
      // render: (_, r) => {
      //   const congChamValue = convertMinutesToWorkday(r.congCham);
      //   return <Typography.Text strong={r.isGroupHeader}>{formatNumber(congChamValue - r.congDanhGia, 3)}</Typography.Text>;
      // },
      render: (v, r) => {
        return <Typography.Text strong={r.isGroupHeader}>{formatNumber(v, 3)}</Typography.Text>;
      },
    },
    {
      title: 'Ghi chú',
      key: 'ghiChu',
      width: 150,
      render: (_, r) => {
        if (r.isGroupHeader) return { children: null, props: { colSpan: 1 } };
        const diff = r.chenhLech;
        return diff !== 0 ? <span style={{ color: 'red' }}>Sai</span> : null;
      },
    },
  ];

  const rowClassName = (record: DataSourceRow) => {
    if (record.isGroupHeader || record.isBCH) return '';
    const diff = record.chenhLech;
    return diff !== 0 ? 'error-row' : '';
  };

  return (
    <Table
      rowKey={r => (r.isGroupHeader ? `group_${r.teamId}` : `${r.teamId}_${r.maNV}`)}
      columns={columns}
      dataSource={finalData}
      rowClassName={rowClassName}
      pagination={false}
      className="daily-labor-summary-table"
      scroll={{ y: 'calc(100vh - 240px)', x: 1200 }}
      summary={(data) => {
        const countChenhLech = data.filter(item => item.isRecordRow).reduce((count, item) => item.chenhLech !== 0 ? count + 1 : count, 0)
        return <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}><strong>{`Tổng số nhân sự có chênh lệch: `}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4}>{countChenhLech}</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      }}
    />
  );
}
