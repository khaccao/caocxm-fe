import React, { useState, useEffect } from 'react';

import { MergeCellsOutlined, SplitCellsOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Checkbox, Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';

import styles from '../PaymentPlan.module.css';

// --------------------------------------------------------

interface FilterBarProps<T> {
  /* Column visibility */
  allColumns: ColumnsType<T>;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;

  /* Merge and Unmerge */
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  selectedCellsCount: number;
  onMerge: () => void;
  onUnmerge: () => void;

  t: (k: string) => string;
}

export default function FilterBar<T>({
  allColumns,
  columnVisibility,
  setColumnVisibility,
  selectionMode,
  toggleSelectionMode,
  selectedCellsCount,
  onMerge,
  onUnmerge,
  t,
}: FilterBarProps<T>): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [tempVisibility, setTempVisibility] = useState(columnVisibility);

  // Sync tempVisibility khi columnVisibility thay đổi
  useEffect(() => {
    setTempVisibility(columnVisibility);
  }, [columnVisibility]);

  const handleApply = () => {
    setColumnVisibility(tempVisibility);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempVisibility(columnVisibility); // Reset về state hiện tại
    setOpen(false);
  };

  const overlay = (
    <div className={styles.columnDropdown}>
      <div className={styles.columnDropdownBody}>
        {allColumns
          .filter(c => {
            const key: any =
              ((c as ColumnType<T>).dataIndex as string) || c.key;
            return !['key', 'id', 'rowNumber'].includes(key || '');
          })
          .map(c => {
            const key =
              ((c as ColumnType<T>).dataIndex as string) ||
              (c.key as string);
            const title = (c as any).rawTitle || key;
            return (
              <Checkbox
                key={key}
                checked={tempVisibility[key] !== false}
                onChange={e =>
                  setTempVisibility(prev => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className={styles.columnCheckbox}
              >
                {title}
              </Checkbox>
            );
          })}
      </div>
  
      <div className={styles.columnDropdownFooter}>
        <Button size="small" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={handleApply}
          style={{ marginLeft: 8 }}
        >
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.filterBar}>
      {/* <Select
        style={{ width: 220 }}
        value={selectedValue}
        onChange={onSelectChange}
        options={selectOptions[activeKey]}
      /> */}

      {/* <DatePicker
        picker="month"
        style={{ width: 220 }}
        value={month ?? dayjs()}
        onChange={onMonthChange}
        format="YYYY-MM"
      /> */}

      <Dropdown trigger={['click']} open={open} onOpenChange={setOpen} overlay={overlay}>
        <Button>
          {t('Chọn cột ẩn/hiện')}
          <DownOutlined
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease-in-out',
            }}
          />
        </Button>
      </Dropdown>

      <Space>
        <Button
          type={selectionMode ? 'primary' : 'default'}
          icon={<MergeCellsOutlined />}
          onClick={toggleSelectionMode}
        >
          {selectionMode ? t('Thoát chọn ô') : t('Chọn ô để gộp')}
        </Button>

        {selectionMode && (
          <>
            <Button type="primary" onClick={onMerge} disabled={selectedCellsCount < 2}>
              {t('Gộp')}
            </Button>
            <Button icon={<SplitCellsOutlined />} onClick={onUnmerge} disabled={selectedCellsCount !== 1}>
              {t('Bỏ gộp')}
            </Button>
          </>
        )}
      </Space>
    </div>
  );
}