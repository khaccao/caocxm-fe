/* eslint-disable import/order */
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { message, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';

import { EFinancialPlan } from '@/common/define';
import { employeeActions } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';
import dayjs from 'dayjs';
import { buildColumnsFromMeta } from '../components/BuildColumns';
import { ColumnMeta, PayrollType } from '../components/data';
import styles from '../PaymentPlan.module.css';
import { EditableCell, EditableRow, FilterBar, ResizableColumn } from '../shared';
import { PayrollTableHandle } from '../types';
import { exportExcel, prepareExportData } from '../utils';

// ------------------------------------------------------------------------
interface MergedCell {
  startRow: number;
  endRow: number;
  startCol: string;
  endCol: string;
  value: any;
}

interface PayrollTableProps {
  activeKey: string;
  onExport?: (data: any) => void;
  rows: any[];
  columns: ColumnMeta[];
  month?: string;
}

const PayrollTable = forwardRef<PayrollTableHandle, PayrollTableProps>(
  ({ activeKey, onExport, rows, columns: meta, month }, ref): React.JSX.Element => {
    const { t } = useTranslation('subcontractor');
    const dispatch = useAppDispatch();
    const tableKey = 'nv-payroll-table';

    const reduxColumnVisibility = useAppSelector(
      (state: RootState) => state.employee.columnVisibility?.[tableKey] || {},
    );
    const reduxColumnWidths = useAppSelector((state: RootState) => state.employee.columnWidths[tableKey] || {});
    const projectList = useAppSelector(state => state.project.projectList);

    const [data, setData] = useState<PayrollType[]>([]);
    const [allColumns, setAllColumns] = useState<ColumnsType<PayrollType>>([]);
    const [visibleColumns, setVisibleColumns] = useState<ColumnsType<PayrollType>>([]);
    const [originalData, setOriginalData] = useState<PayrollType[] | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(reduxColumnWidths);
    const isFirstRender = useRef(true);

    const [sortCfg, setSortCfg] = useState<{ key?: keyof PayrollType; order?: 'asc' | 'desc' }>({
      key: 'name',
      order: 'asc',
    });
    const [mergedCells, setMergedCells] = useState<MergedCell[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState<{ rowIndex: number; colKey: string }[]>([]);
    const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({});

    const saveRow = (row: PayrollType) => {
      setData(prev =>
        prev.map((r: any) => {
          if (r.key === row.key) {
            const totalWork = r.totalWork ?? 0;
            const salaryPerWorkLabor = row.salaryPerWorkLabor ?? 0;
            const advanceAndUnion = row.advanceAndUnion ?? 0;
            const protectiveGear = row.protectiveGear ?? 0;
            const hoTro = Number(row['Hỗ trợ'] ?? 0);
            const truBHXH = Number(row['Trừ BHXH'] ?? 0);
            const totalMoneyWork = Number((totalWork * salaryPerWorkLabor).toFixed(4));
            const netSalary = totalMoneyWork - advanceAndUnion - protectiveGear - truBHXH + hoTro;

            const updated: any = {
              ...row,
              totalMoneyWork,
              netSalary,
            };

            const skipRound = (key: string) => key.includes('Time') || key === 'totalWork' || key.startsWith('project_');

            Object.keys(updated).forEach(key => {
              const v = updated[key];
              if (typeof v === 'number' && !skipRound(key)) {
                updated[key] = Math.round(v);
              }
            });

            return updated;
          }
          return r;
        }),
      );
    };

    const handleResize = useCallback(
      (dataIndex: string) => (width: number) => {
        console.log(activeKey, dataIndex, width);
        requestAnimationFrame(() => {
          setColumnWidths(prev => {
            const next = { ...prev, [dataIndex]: width };

            dispatch(employeeActions.updateColumnWidth({ tableKey, columnKey: dataIndex, width }));

            return next;
          });
        });
      },
      [dispatch, tableKey],
    );

    useEffect(() => {
      if (Object.keys(reduxColumnWidths).length === 0 && Object.keys(columnWidths).length > 0) {
        dispatch(employeeActions.setColumnWidths({ tableKey, widths: columnWidths }));
      }
    }, [reduxColumnWidths, columnWidths, tableKey, dispatch]);

    const initializeColumnVisibility = useCallback(
      (columns: ColumnsType<PayrollType>) => {
        const initialVisibility: Record<string, boolean> = {};

        columns.forEach((col: any) => {
          const key = ((col as ColumnType<PayrollType>).dataIndex as string) || col.key || '';
          if (key) {
            initialVisibility[key] = true;
          }
        });

        if (Object.keys(reduxColumnVisibility).length === 0) {
          dispatch(
            employeeActions.setColumnVisibility({
              tableKey,
              visibility: initialVisibility,
            }),
          );
          setLocalColumnVisibility(initialVisibility);
        } else {
          const mergedVisibility = {
            ...initialVisibility,
            ...reduxColumnVisibility,
          };
          setLocalColumnVisibility(mergedVisibility);

          if (Object.keys(mergedVisibility).length > Object.keys(reduxColumnVisibility).length) {
            dispatch(
              employeeActions.setColumnVisibility({
                tableKey,
                visibility: mergedVisibility,
              }),
            );
          }
        }
      },
      [tableKey, dispatch, reduxColumnVisibility],
    );

    const hydrate = useCallback(async () => {
      const filteredMeta =
        activeKey === EFinancialPlan.KeHoachThanhToan05 ? meta.filter(m => m.key !== 'advance20') : meta;

      const builtColumns = buildColumnsFromMeta(filteredMeta, rows, saveRow, setSortCfg);

      const columnsWithMerge: any = builtColumns.map(col => {
        const dataIndex = (col as ColumnType<PayrollType>).dataIndex as string;
        return {
          ...col,
          width: columnWidths[dataIndex] || col.width || 8,
          onHeaderCell: () => ({
            width: columnWidths[dataIndex] || col.width || 8,
            onResize: handleResize(dataIndex),
          }),
          onCell: (record: PayrollType, rowIndex: number) => {
            const props: any = {
              record,
              dataIndex,
              handleSave: saveRow,
              locked: record.locked,
              editable: (col as any).editable !== false && !selectionMode,
            };

            if (selectionMode) {
              props.onClick = () => handleCellClick(rowIndex, dataIndex);
              props.className = selectedCells.some(cell => cell.rowIndex === rowIndex && cell.colKey === dataIndex)
                ? `${styles.selectedCell}`
                : '';
            }

            for (const mergedCell of mergedCells) {
              const allColKeys = getColumnRange(mergedCell.startCol, mergedCell.endCol);
              const isInRowRange = rowIndex >= mergedCell.startRow && rowIndex <= mergedCell.endRow;
              const isInColRange = allColKeys.includes(dataIndex);

              if (isInRowRange && isInColRange) {
                if (rowIndex === mergedCell.startRow && dataIndex === mergedCell.startCol) {
                  props.rowSpan = mergedCell.endRow - mergedCell.startRow + 1;
                  props.colSpan = allColKeys.length;
                  props.children = mergedCell.value;
                } else {
                  props.rowSpan = 0;
                  props.colSpan = 0;
                }
                break;
              }
            }

            return props;
          },
        };
      });

      setAllColumns(columnsWithMerge);
      initializeColumnVisibility(columnsWithMerge);

      // Lần đầu hydrate mới setData
      if (data.length === 0) {
        setData(rows);
        setOriginalData(JSON.parse(JSON.stringify(rows)));
        isFirstRender.current = false;
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      tableKey,
      mergedCells,
      selectionMode,
      selectedCells,
      columnWidths,
      handleResize,
      initializeColumnVisibility,
      data.length,
      rows,
    ]);

    const getColumnRange = (startCol: string, endCol: string) => {
      const allColKeys = allColumns
        .filter(col => 'dataIndex' in col)
        .map(col => (col as ColumnType<PayrollType>).dataIndex as string);

      const startIdx = allColKeys.indexOf(startCol);
      const endIdx = allColKeys.indexOf(endCol);

      if (startIdx === -1 || endIdx === -1) return [];
      return allColKeys.slice(startIdx, endIdx + 1);
    };

    const updateVisibleColumns = useCallback((cols: ColumnsType<PayrollType>, visibility: Record<string, boolean>) => {
      const visible = cols.filter(col => {
        const key: any = ((col as ColumnType<PayrollType>).dataIndex as string) || col.key || '';

        if (key === 'key' || key === 'id' || key === 'rowNumber') return true;

        return visibility[key] !== false;
      });
      console.log(visible);
      setVisibleColumns(visible);
    }, []);

    useEffect(() => {
      updateVisibleColumns(allColumns, localColumnVisibility);
    }, [allColumns, localColumnVisibility, updateVisibleColumns]);

    useEffect(() => {
      hydrate();
    }, [hydrate]);

    useEffect(() => {
      if (Object.keys(reduxColumnVisibility).length > 0) {
        setLocalColumnVisibility(reduxColumnVisibility);
      }
    }, [reduxColumnVisibility]);

    const extractLastName = (fullName: string): string => {
      if (!fullName || typeof fullName !== 'string') return '';

      const nameParts = fullName.trim().split(/\s+/);

      return nameParts[nameParts.length - 1] || '';
    };

    const dataView = useMemo(() => {
      if (!sortCfg.key) return data;

      const list = [...data];
      list.sort((a, b) => {
        const { key, order } = sortCfg;
        let va = a[key!] ?? '';
        let vb = b[key!] ?? '';

        const nameColumns = ['name'];
        if (nameColumns.includes(key as string)) {
          va = extractLastName(String(va));
          vb = extractLastName(String(vb));
        }

        const cmp =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb), 'vi-VN', {
              numeric: true,
              sensitivity: 'base',
              ignorePunctuation: true,
            });
        return order === 'asc' ? cmp : -cmp;
      });
      return list;
    }, [data, sortCfg]);

    useEffect(() => {
      setMergedCells(prev =>
        prev.map(cell => {
          if (dataView[cell.startRow]) {
            const newValue = dataView[cell.startRow][cell.startCol as keyof PayrollType];
            return {
              ...cell,
              value: String(newValue || ''),
            };
          }
          return cell;
        }),
      );
    }, [data, dataView]);
    const updatedCoulmns = useMemo(() => {
      return visibleColumns.map(col => {
        const rawTitle = (col as any).rawTitle;
        if (typeof rawTitle === 'string') {
          const match = rawTitle.match(/^∑ công (\w+)$/); // regex để bắt dạng `∑ công ABC123`
          if (match) {
            const projectCode = match[1];
            const foundProject = projectList.find(p => p.code === projectCode);
            if (foundProject) {
              return {
                ...col,
                rawTitle: `∑ công ${foundProject.name}`,
              };
            }
          }
        }
        return col;
      });
    }, [visibleColumns, projectList]);

    useImperativeHandle(ref, () => ({
      getExportData() {
        return { dataView, originalData, mergedCells, visibleColumns: updatedCoulmns };
      },
      exportFile() {
        const rowsForExcel = prepareExportData(dataView, updatedCoulmns);
        const dayNumber = activeKey === EFinancialPlan.KeHoachThanhToan05 ? 30 : 15;
        const exportDate = dayjs(month).date(dayNumber);
        exportExcel(rowsForExcel, dayjs(exportDate), mergedCells, updatedCoulmns);
        onExport?.({ rowsForExcel, mergedCells, updatedCoulmns });
      },
    }));

    const toggleSelectionMode = () => {
      setSelectionMode(!selectionMode);
      if (selectionMode) {
        setSelectedCells([]);
      }
    };

    const handleCellClick = (rowIndex: number, colKey: string) => {
      if (!selectionMode) return;

      setSelectedCells(prev => {
        const alreadySelected = prev.some(cell => cell.rowIndex === rowIndex && cell.colKey === colKey);
        if (alreadySelected) {
          return prev.filter(cell => !(cell.rowIndex === rowIndex && cell.colKey === colKey));
        }

        return [...prev, { rowIndex, colKey }];
      });
    };

    // Handle merge
    const handleMergeCells = () => {
      if (selectedCells.length < 2) {
        message.error('Vui lòng chọn ít nhất 2 ô để merge');
        return;
      }

      const rowIndices = selectedCells.map(cell => cell.rowIndex);
      const colKeys = selectedCells.map(cell => cell.colKey);

      const startRow = Math.min(...rowIndices);
      const endRow = Math.max(...rowIndices);

      const allColKeys = allColumns
        .filter(col => 'dataIndex' in col)
        .map(col => (col as ColumnType<PayrollType>).dataIndex as string);

      const selectedColIndices = colKeys.map(key => allColKeys.indexOf(key)).filter(idx => idx !== -1);
      const startColIdx = Math.min(...selectedColIndices);
      const endColIdx = Math.max(...selectedColIndices);

      const startCol = allColKeys[startColIdx];
      const endCol = allColKeys[endColIdx];

      // Kiểm tra ô đã chọn có liên tục không
      let isContiguousRegion = true;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startColIdx; c <= endColIdx; c++) {
          const colKey = allColKeys[c];
          const cellIsSelected = selectedCells.some(cell => cell.rowIndex === r && cell.colKey === colKey);
          if (!cellIsSelected) {
            isContiguousRegion = false;
            break;
          }
        }
        if (!isContiguousRegion) break;
      }

      if (!isContiguousRegion) {
        message.error('Các ô đã chọn phải tạo thành một vùng liên tục');
        return;
      }

      // Kiểm tra các ô đã chọn có trùng với các cell đã merge không
      for (const mergedCell of mergedCells) {
        const mergedColRange = getColumnRange(mergedCell.startCol, mergedCell.endCol);

        for (const cell of selectedCells) {
          const isInMergedRow = cell.rowIndex >= mergedCell.startRow && cell.rowIndex <= mergedCell.endRow;
          const isInMergedCol = mergedColRange.includes(cell.colKey);

          if (isInMergedRow && isInMergedCol) {
            message.error('Không thể merge các ô đã nằm trong một vùng merge khác');
            return;
          }
        }
      }

      // Không merge cột cố định vs fixed
      const hasMixedFixedState =
        selectedCells.some(cell => {
          const col = allColumns.find(c => (c as ColumnType<PayrollType>).dataIndex === cell.colKey);
          return col && (col as any).fixed;
        }) &&
        selectedCells.some(cell => {
          const col = allColumns.find(c => (c as ColumnType<PayrollType>).dataIndex === cell.colKey);
          return col && !(col as any).fixed;
        });

      if (hasMixedFixedState) {
        message.error('Không merge ô cột cố định và cột scroll');
        return;
      }

      // Lấy giá trị trái trên cùng
      const firstCellValue = dataView[startRow][startCol as keyof PayrollType];
      const valueToDisplay = String(firstCellValue || '');

      const newMergedCell: MergedCell = {
        startRow,
        endRow,
        startCol,
        endCol,
        value: valueToDisplay,
      };

      setMergedCells(prev => [...prev, newMergedCell]);
      setSelectedCells([]);

      message.success(`Đã merge ${selectedCells.length} ô. Giá trị sẽ lấy ô trái trên cùng`);
    };

    // Handle unmerge
    const handleUnmergeCells = () => {
      if (selectedCells.length !== 1) {
        message.error('Vui lòng chọn một ô đã merge để unmerge');
        return;
      }

      const { rowIndex, colKey } = selectedCells[0];

      const mergedCellIndex = mergedCells.findIndex(mergedCell => {
        const colRange = getColumnRange(mergedCell.startCol, mergedCell.endCol);
        return rowIndex >= mergedCell.startRow && rowIndex <= mergedCell.endRow && colRange.includes(colKey);
      });

      if (mergedCellIndex === -1) {
        message.error('Ô đã chọn không phải là ô đã merge');
        return;
      }

      // Delete merged
      setMergedCells(prev => prev.filter((_, index) => index !== mergedCellIndex));
      setSelectedCells([]);
      message.success('Unmerge thành công');
    };

    // const handleToggleColumn = (key: string, visible: boolean) => {
    //   const newVisibility = { ...localColumnVisibility, [key]: visible };
    //   setLocalColumnVisibility(newVisibility);

    //   dispatch(employeeActions.toggleColumnVisibility({
    //     tableKey: activeKey,
    //     columnKey: key,
    //     visible: visible
    //   }));
    // };

    const handleSetColumnVisibility = (visibility: Record<string, boolean>) => {
      setLocalColumnVisibility(visibility);

      dispatch(
        employeeActions.setColumnVisibility({
          tableKey,
          visibility: visibility,
        }),
      );
    };

    return (
      <>
        <FilterBar
          allColumns={allColumns}
          columnVisibility={localColumnVisibility}
          setColumnVisibility={handleSetColumnVisibility}
          selectionMode={selectionMode}
          toggleSelectionMode={toggleSelectionMode}
          selectedCellsCount={selectedCells.length}
          onMerge={handleMergeCells}
          onUnmerge={handleUnmergeCells}
          t={t}
        />

        <Table
          className={styles.customExcelTable}
          components={{
            header: {
              cell: ResizableColumn,
            },
            body: {
              row: EditableRow,
              cell: EditableCell,
            },
          }}
          rowClassName={r => {
            let className = '';
            if (selectionMode) className += ' ' + styles.selectableRow;
            return className;
          }}
          bordered
          dataSource={dataView}
          rowHoverable={false}
          columns={visibleColumns}
          pagination={false}
          scroll={{ x: 1400, y: 'calc(100vh - 310px)' }}
          summary={pageData => {
            const numericKeys = visibleColumns
              .filter(c => 'dataIndex' in c && ['number', 'currency'].includes((c as any).metaType))
              .map(c => (c as ColumnType<PayrollType>).dataIndex as keyof PayrollType);

            const totals: Record<string, number> = Object.fromEntries(numericKeys.map(k => [k as string, 0]));
            pageData.forEach(rec =>
              numericKeys.forEach(k => {
                totals[k as string] += +(rec[k] as number) || 0;
              }),
            );

            return (
              <Table.Summary fixed  >
                <Table.Summary.Row style={{ border: '2px solid #000' }} >
                  {visibleColumns.map((col, idx) => {
                    if (idx === 0) {
                      const firstNumericIdx = visibleColumns.findIndex(
                        c => 'dataIndex' in c && ['number', 'currency'].includes((c as any).metaType),
                      );
                      const colSpan = Math.max(1, firstNumericIdx);

                      return (
                        <Table.Summary.Cell index={idx} key={idx} colSpan={colSpan} align="center" className={styles.summaryCellBorder}>
                          <strong
                            style={{
                              fontSize: '16px',
                              alignItems: 'center',
                              justifyContent: 'center',
                              display: 'flex',
                            }}
                          >
                            Tổng
                          </strong>
                        </Table.Summary.Cell>
                      );
                    }

                    const firstNumericIdx = visibleColumns.findIndex(
                      c => 'dataIndex' in c && ['number', 'currency'].includes((c as any).metaType),
                    );
                    if (idx > 0 && idx < firstNumericIdx) {
                      return null;
                    }

                    const key = (col as ColumnType<PayrollType>).dataIndex as string;
                    const tot = totals[key];

                    return (
                      <Table.Summary.Cell
                        key={idx}
                        index={idx}
                        align="center"
                        className={styles.summaryCellBorder}
                      >
                        {typeof tot === 'number'
                          ? tot.toLocaleString('en-US') +
                          (['salary', 'advancePayment', 'advance20'].includes(key) ? ' VNĐ' : '')
                          : null}
                      </Table.Summary.Cell>
                    );

                  })}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </>
    );
  },
);

export default PayrollTable;
PayrollTable.displayName = 'PayrollTable';
