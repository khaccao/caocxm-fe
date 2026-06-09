/* eslint-disable import/order */
import React, { useEffect, useMemo } from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ProjectResponse } from '@/common/project';
import { CompareRow, buildTreeRows } from '../utils';
import './CompareSalaryStandardsTable.css';

// -------------------------------------------------------------------

interface CompareSalaryStandardsProps {
  dataSource: CompareRow[];
  projectList: ProjectResponse[];
}

interface TreeRow {
  key: string;
  kind: 'project' | 'team' | 'task' | 'employee';
  dinhmucluong?: string | number;
  issueName?: string;
  Khoi_Luong?: number;
  So_Cong_Hoan_Thanh?: number;
  costPerValue?: number;
  unitVolume?: string;
  children?: TreeRow[];
}

function mergeSiblings(nodes: TreeRow[] = []): TreeRow[] {
  const map = new Map<string, TreeRow>();
  for (const n of nodes) {
    const key = `${n.dinhmucluong}__${n.issueName}`;
    if (map.has(key)) {
      const ex = map.get(key)!;
      ex.Khoi_Luong = (ex.Khoi_Luong || 0) + (n.Khoi_Luong || 0);
      ex.So_Cong_Hoan_Thanh = (ex.So_Cong_Hoan_Thanh || 0) + (n.So_Cong_Hoan_Thanh || 0);
    } else {
      map.set(key, { ...n });
    }
  }
  return Array.from(map.values());
}

export default function CompareSalaryStandards({
  dataSource,
  projectList,
}: CompareSalaryStandardsProps): React.JSX.Element {

  const treeData = useMemo(() => {
    const raw = buildTreeRows(dataSource, projectList);
    return raw.map((project: any) => ({
      ...project,
      children: project.children.map((team: any) => ({
        ...team,
        children: team.children.map((task: any) => ({
          ...task,
          children: mergeSiblings(task.children),
        })),
      })),
    }));
  }, [dataSource, projectList]);
  useEffect(() => { console.log(treeData) }, [treeData]);

  const columns: ColumnsType<any> = [
    {
      title: 'STT',
      width: 70,
      render: (_, r) => {
        if (r.kind === 'project') return { children: <strong>{r.projectName}</strong>, props: { colSpan: 11 } };
        if (r.kind === 'team') return { children: <strong>{r.groupName}</strong>, props: { colSpan: 11 } };
        if (r.kind === 'task') return { children: r.issueName, props: { colSpan: 3 } };
        return r.stt;
      },
    },
    {
      title: 'Mã nhân sự',
      dataIndex: 'employeeCode',
      width: 150,
      render: (v, r) => {
        if (r.kind === 'employee') return v;
        return { children: null, props: { colSpan: 0 } };
      },
    },
    {
      title: 'Tên Nhân Sự',
      dataIndex: 'employeeName',
      width: 150,
      render: (v, r) => {
        if (r.kind === 'employee') return v;
        return { children: null, props: { colSpan: 0 } };
      },
    },
    {
      title: 'Công cập nhật',
      dataIndex: 'So_Cong_Hoan_Thanh',
      width: 150,
      render: (v, r) => {
        if (r.kind === 'project' || r.kind === 'team') return { children: null, props: { colSpan: 0 } };
        return v.toLocaleString('en-US', { maximumFractionDigits: 4 });
      },
    },
    {
      title: 'Khối lượng theo đánh giá',
      dataIndex: 'Khoi_Luong',
      width: 220,
      render: (v, r) => {
        if (r.kind === 'project' || r.kind === 'team') return { children: null, props: { colSpan: 0 } };
        if (r.kind === 'employee') return { children: null, props: { colSpan: 1 } };
        return v;
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unitVolume',
      width: 100,
      render: (v, r) => {
        if (r.kind === 'project' || r.kind === 'team') return { children: null, props: { colSpan: 0 } };
        if (r.kind === 'employee') return { children: null, props: { colSpan: 1 } };

        return v;
      },
    },
    {
      title: 'Đơn giá định mức',
      dataIndex: 'costPerValue',
      width: 180,
      render: (v, r) => {
        if (r.kind === 'project' || r.kind === 'team') return { children: null, props: { colSpan: 0 } };
        if (r.kind === 'employee') return { children: null, props: { colSpan: 1 } };

        return v?.toLocaleString('en-US');
      },
    },
    {
      title: 'Tổng thành tiền',
      width: 150,
      render: (_, r) => {
        if (r.kind === 'project' || r.kind === 'team') return { children: null, props: { colSpan: 0 } };

        const kl = r.Khoi_Luong ?? 0;
        const dg = r.costPerValue ?? 0;
        const total = kl * dg;

        if (r.kind === 'task') return { children: total.toLocaleString('en-US'), props: { colSpan: 4 } };

        return total !== 0 ? total.toLocaleString('en-US') : 0;
      },
    },
    {
      title: 'Lương sản phẩm/Ngày',
      width: 200,
      render: (_, r) => {
        if (r.kind === 'project' || r.kind === 'team' || r.kind === 'task')
          return { children: null, props: { colSpan: 0 } };

        const kl = r.Khoi_Luong ?? 0;
        const dg = r.costPerValue ?? 0;
        const soC = r.So_Cong_Hoan_Thanh ?? 0;

        const total = kl * dg;
        const luongSP = soC ? total / soC : 0;

        const rounded = Math.round(luongSP); // Làm tròn và bỏ phần thập phân

        return rounded !== 0 ? rounded.toLocaleString('en-US') : 0;
      },
    },
    {
      title: 'Định mức lương',
      dataIndex: 'dinhmucluong',
      width: 150,
      render: (v, r) => {
        if (r.kind === 'project' || r.kind === 'team' || r.kind === 'task')
          return { children: null, props: { colSpan: 0 } };
        return Number(v).toLocaleString('en-US');
      },
    },
    {
      title: 'Chênh lệch lợi nhuận',
      width: 200,
      render: (_, r) => {
        if (r.kind === 'project' || r.kind === 'team' || r.kind === 'task')
          return { children: null, props: { colSpan: 0 } };

        const kl = r.Khoi_Luong ?? 0;
        const dg = r.costPerValue ?? 0;
        const soC = r.So_Cong_Hoan_Thanh ?? 0;

        const total = kl * dg;
        const luongSP = soC ? total / soC : 0;
        const dinhMucLuong = r.dinhmucluong ?? 0;
        const chenhlech = luongSP - dinhMucLuong;

        return chenhlech !== 0 ? chenhlech.toLocaleString('en-US') : 0;
      },
    },
  ];

  const allExpandedKeys = useMemo(() => {
    const keys: string[] = [];
    const walk = (nodes: TreeRow[]) => {
      for (const n of nodes) {
        keys.push(n.key);
        if (n.children) walk(n.children);
      }
    };
    console.log(treeData);
    walk(treeData);
    return keys;
  }, [treeData]);

  const negativeProfitCount = useMemo(() => {
    let count = 0;

    const walk = (nodes: TreeRow[]) => {
      for (const node of nodes) {
        if (node.kind === 'employee') {
          const kl = node.Khoi_Luong ?? 0;
          const dg = node.costPerValue ?? 0;
          const soC = node.So_Cong_Hoan_Thanh ?? 0;
          const dinhMucLuong = Number(node.dinhmucluong ?? 0);

          const total = kl * dg;
          const luongSP = soC ? total / soC : 0;
          const chenhlech = luongSP - dinhMucLuong;

          if (chenhlech < 0) {
            count += 1;
          }
        }
        if (node.children) {
          walk(node.children);
        }
      }
    };

    walk(treeData);
    return count;
  }, [treeData]);


  const getRowClassName = (record: TreeRow): string => {
    if (record.kind !== 'employee') return '';

    const kl = record.Khoi_Luong ?? 0;
    const dg = record.costPerValue ?? 0;
    const soC = record.So_Cong_Hoan_Thanh ?? 0;
    const dinhMucLuong = Number(record.dinhmucluong ?? 0);

    const total = kl * dg;
    const luongSP = soC ? total / soC : 0;
    const chenhlech = luongSP - dinhMucLuong;
    return chenhlech < 0 ? 'negative-diff-row' : '';
  };


  return (
    <Table
      key={Math.random()}
      rowKey="key"
      columns={columns}
      dataSource={treeData}
      pagination={false}
      className="compare-salary-standards-table"
      scroll={{ y: 'calc(94vh - 200px)', x: 1600 }}
      rowClassName={getRowClassName}
      expandable={{
        expandedRowKeys: allExpandedKeys,
        defaultExpandAllRows: true,
        expandIconColumnIndex: 0,
        expandIcon: ({ expanded, onExpand, record }) => {
          if (record.kind === 'task') {
            return null;
          }

          const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const fakeEvent = {
                target: e.currentTarget,
                stopPropagation: () => { },
              } as unknown as React.MouseEvent<HTMLElement>;
              onExpand(record, fakeEvent);
            }
          };

          return expanded ? (
            <button
              type="button"
              aria-label="Collapse"
              className="ant-table-row-expand-icon ant-table-row-expand-icon-expanded"
              onClick={e => onExpand(record, e)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <button
              type="button"
              aria-label="Expand"
              className="ant-table-row-expand-icon ant-table-row-expand-icon-collapsed"
              onClick={e => onExpand(record, e)}
              onKeyDown={handleKeyDown}
            />
          );
        },
      }}
      footer={() => <div style={{ fontWeight: 'bold' }}>Tổng nhân sự có chênh lệch âm: {negativeProfitCount} </div>}
    />
  );
}
