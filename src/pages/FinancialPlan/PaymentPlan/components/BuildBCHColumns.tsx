import { Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';

import { getBCHColumnFilterProps } from './BCHColumnFilter';
import { BCHPayrollType, ColumnMeta } from './data';
import { SPECIAL_CAN_EDIT, SPECIAL_CODES } from '../helper/bch-table';

// ----------------------------------------------------------
const renderSTT = (_: any, __: BCHPayrollType, index: number) => index + 1;

export type EditableColumn<T> = ColumnType<T> & {
  rawTitle?: string;
  metaType?: string;
  editable?: boolean;
};

function makeTitle(title: string) {
  return (
    <Tooltip title={title} placement="topLeft">
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
        {title}
      </div>
    </Tooltip>
  );
}

export function buildBCHColumnsFromMeta(
  meta: ColumnMeta[],
  rows: BCHPayrollType[],
  saveRow: (r: BCHPayrollType) => void,
  setSort: (cfg: { key: keyof BCHPayrollType; order: 'asc' | 'desc' }) => void,
): ColumnsType<BCHPayrollType> {
  return meta.flatMap(m => {
    if (m.type === 'group' && m.children) {
      const childrenCols: EditableColumn<BCHPayrollType>[] = m.children.map(child => {
        const dataIndex = child.key as keyof BCHPayrollType;
        const base: EditableColumn<BCHPayrollType> = {
          title: makeTitle(child.title),
          rawTitle: child.title,
          dataIndex,
          key: child.key,
          metaType: child.type,
          width: child.width,
          editable: child.editable,
          fixed: child.fixed,
          align: child.align ?? 'center',
          // render: child.type === 'currency' ? (v: number) => (v ?? 0).toLocaleString('en-US') : undefined,
          render:
            dataIndex === 'stt'
              ? renderSTT
              : child.type === 'currency'
              ? (v: number) => (v ?? 0).toLocaleString('en-US')
              : undefined,
          ...getBCHColumnFilterProps(dataIndex, child.type as any, setSort, rows),
        };
        return child.editable
          ? {
              ...base,
              onCell: (record: BCHPayrollType) =>
                ({
                  record,
                  // editable: true,
                  editable: canEdit(record, dataIndex as string),
                  dataIndex,
                  handleSave: saveRow,
                } as React.HTMLAttributes<HTMLElement>),
            }
          : base;
      });

      return [
        {
          title: makeTitle(m.title),
          key: m.key,
          children: childrenCols,
        } as ColumnType<BCHPayrollType>,
      ];
    }

    const dataIndex = m.key as keyof BCHPayrollType;
    const base: EditableColumn<BCHPayrollType> = {
      title: makeTitle(m.title),
      rawTitle: m.title,
      dataIndex,
      key: m.key,
      metaType: m.type,
      width: m.width,
      editable: m.editable,
      fixed: m.fixed,
      align: m.align ?? 'center',
      // render: m.type === 'currency' ? (v: number) => (v ?? 0).toLocaleString('en-US') : undefined,
      render:
        dataIndex === 'stt'
          ? renderSTT
          : m.type === 'currency'
          ? (v: number) => (v ?? 0).toLocaleString('en-US')
          : undefined,
      ...getBCHColumnFilterProps(dataIndex, m.type as any, setSort, rows),
    };

    return [
      m.editable
        ? {
            ...base,
            onCell: (record: BCHPayrollType) =>
              ({
                record,
                // editable: true,
                editable: canEdit(record, dataIndex as string),
                dataIndex,
                handleSave: saveRow,
              } as React.HTMLAttributes<HTMLElement>),
          }
        : base,
    ];
  });
}

function canEdit(record: BCHPayrollType, dataKey: string) {
  if (SPECIAL_CODES.has(record.employeeCode as string)) {
    return SPECIAL_CAN_EDIT.has(dataKey);
  }

  return true;
}
