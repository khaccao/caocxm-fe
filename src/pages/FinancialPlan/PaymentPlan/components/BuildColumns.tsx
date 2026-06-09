import { Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';

import { getColumnFilterProps } from './ColumnFilter';
import { ColumnMeta, PayrollType } from './data';

// --------------------------------------------------------------

export type EditableColumn<T> = ColumnType<T> & {
  editable?: boolean;
  metaType?: string;
  onFilter?: any;
  rawTitle?: string;
};

export const buildColumnsFromMeta = (
  meta: ColumnMeta[],
  rows: PayrollType[],
  saveRow: (r: PayrollType) => void,
  setSort: (cfg: { key: keyof PayrollType; order: 'asc' | 'desc' }) => void,
): ColumnsType<PayrollType> =>
  meta.map((m): EditableColumn<PayrollType> => {
    const k = m.key as keyof PayrollType;

    const headerTitle = (
      <Tooltip title={m.title} placement="topLeft">
        <div
          style={{
            display: '-webkit-box',
            // WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {m.title}
        </div>
      </Tooltip>
    );

    const base: EditableColumn<PayrollType> = {
      title: headerTitle,
      rawTitle: m.title,
      dataIndex: k,
      metaType: m.type,
      width: m.width ?? 150,
      editable: m.editable,
      fixed: m.fixed,
      align: m.align ?? 'center',
      // render: m.type === 'currency' ? (v: number) => (v ?? 0).toLocaleString('en-US') : undefined,
      render:
        k === 'stt'
          ? (_: any, __: PayrollType, index: number) => index + 1
          : m.type === 'currency'
          ? (v: number) => (v ?? 0).toLocaleString('en-US')
          : undefined,
      ...getColumnFilterProps(k, m.type as any, setSort, rows),
    };

    return m.editable
      ? {
          ...base,
          onCell: (record: PayrollType) =>
            ({
              record,
              editable: true,
              dataIndex: m.key as keyof PayrollType,
              handleSave: saveRow,
              locked: record.locked,
            } as React.HTMLAttributes<HTMLElement>),
        }
      : base;
  });
