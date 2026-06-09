import React, { useContext, useEffect, useRef, useState } from 'react';

import { Form, Input, InputNumber } from 'antd';

import { EditableContext } from './EditableContext';
import styles from '../PaymentPlan.module.css';

// ----------------------------------------------------------

interface Props<T> {
  editable?: boolean;
  children: React.ReactNode;
  dataIndex: keyof T;
  record: T;
  onSave: (r: T) => void;
  handleSave?: (r: T) => void;
  locked?: boolean;
  rowSpan?: number;
  colSpan?: number;
}

export function EditableCell<T extends { [key: string]: any }>({
  editable,
  children,
  dataIndex,
  record,
  onSave,
  locked,
  rowSpan,
  colSpan,
  handleSave,
  ...props
}: Props<T>) {
  const [editing, setEditing] = useState(false);
  const form = useContext(EditableContext)!;
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) ref.current?.focus?.();
  }, [editing]);

  const toggle = () => {
    if (locked || !editable) return;
    setEditing(true);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    const values = await form.validateFields();
    setEditing(false);
    handleSave?.({
      ...record,
      ...values,
    });
  };

  let child = children;
  if (editable) {
    child = editing ? (
      <Form.Item name={dataIndex.toString()} style={{ margin: 0 }}>
        {(['number', 'currency'].includes(typeof record[dataIndex]) || typeof record[dataIndex] === 'number') ? (
          <InputNumber
            ref={ref as any}
            onPressEnter={save}
            onBlur={save}
            style={{ width: '100%' }}
            formatter={value => (value !== undefined ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
            parser={value => (value || '').toString().replace(/[^\d.-]/g, '')}
          />
        ) : (
          <Input ref={ref as any} onPressEnter={save} onBlur={save} style={{ width: '100%' }} />
        )}
      </Form.Item>
    ) : (
      <div
        className={styles.cellEditable}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
        style={{ width: '100%', height: '100%' }}
      >
        {(() => {
          const raw = String(record[dataIndex] ?? '').trim();
          return raw ? children : <span style={{ opacity: 0.5 }}>—</span>;
        })()}
        {/* {record[dataIndex] ?? '—'} */}
      </div>
    );
  }
  return (
    <td {...props} rowSpan={rowSpan} colSpan={colSpan}>
      {child}
    </td>
  );
}
