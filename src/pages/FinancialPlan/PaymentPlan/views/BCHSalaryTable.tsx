/* eslint-disable import/order */
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { message, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { employeeActions } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';
import { buildBCHColumnsFromMeta } from '../components/BuildBCHColumns';
import { BCHPayrollType, ColumnMeta, PayrollType } from '../components/data';
import { SPECIAL_CODES } from '../helper/bch-table';
import styles from '../PaymentPlan.module.css';
import { EditableCell, EditableRow, FilterBar, ResizableColumn } from '../shared';
import { BCHPayrollTableHandle } from '../types';
import { exportBCHExcel, prepareBCHExportData } from '../utils/ExportFile';

// ------------------------------------------------------------------------
interface MergedCell {
  startRow: number;
  endRow: number;
  startCol: string;
  endCol: string;
  value: any;
}

interface BCHSalaryTableProps {
  onExport?: (data: any) => void;
  rows: any[];
  columns: ColumnMeta[];
  month?: string;
}
const BCHSalaryTable = forwardRef<BCHPayrollTableHandle, BCHSalaryTableProps>(
  ({ onExport, rows, columns: meta, month }, ref): React.JSX.Element => {
    const { t } = useTranslation('subcontractor');
    const activeKey = 'bch-salary-table';
    const dispatch = useAppDispatch();

    const reduxColumnVisibility = useAppSelector(
      (state: RootState) => state.employee.columnVisibility?.[activeKey] || {},
    );
    const reduxColumnWidths = useAppSelector((state: RootState) => state.employee.columnWidths[activeKey] || {});

    const [data, setData] = useState<BCHPayrollType[]>([]);
    const [allColumns, setAllColumns] = useState<ColumnsType<BCHPayrollType>>([]);
    const [visibleColumns, setVisibleColumns] = useState<ColumnsType<BCHPayrollType>>([]);
    // const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
    const [originalData, setOriginalData] = useState<PayrollType[] | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(reduxColumnWidths);
    const isFirstRender = useRef(true);

    // const [sortCfg, setSortCfg] = useState<{ key?: keyof BCHPayrollType; order?: 'asc' | 'desc' }>({});
    const [sortCfg, setSortCfg] = useState<{ key?: keyof BCHPayrollType; order?: 'asc' | 'desc' }>({
      key: 'employeeName',
      order: 'asc',
    });
    const [mergedCells, setMergedCells] = useState<MergedCell[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState<{ rowIndex: number; colKey: string }[]>([]);
    const [localColumnVisibility, setLocalColumnVisibility] = useState<Record<string, boolean>>({});

    // const saveRow = (row: BCHPayrollType) => setData(prev => prev.map(r => (r.key === row.key ? row : r)));

    const saveRow = (row: BCHPayrollType) => {
      setData(prev =>
        prev.map((r: any) => {
          if (r.key === row.key) {
            let unionFund = row.unionFund ?? 0;
            if (row.employeeCode === 'NVH02' || row.employeeCode === 'DKT' || row.employeeCode === 'BT'|| row.employeeCode === 'NVH01') {
              unionFund = 0;
            }
            const salaryAdvance_D12 = row.salaryAdvance_D12 ?? 0;
            const salaryAdvance_D20 = row.salaryAdvance_D20 ?? 0;
            const salaryAdvance_D27 = row.salaryAdvance_D27 ?? 0;
            const salaryBalance_D12 = row.salaryBalance_D12 ?? 0;
            const salaryBalance_D27 = row.salaryBalance_D27 ?? 0;
            const kpiValue = row.kpiValue ?? 0;
            const baseSalary = row.baseSalary ?? 0;
            const advanceAndUnion = Number(
              unionFund +
              salaryAdvance_D12 +
              salaryAdvance_D20 +
              salaryAdvance_D27 +
              salaryBalance_D12 +
              salaryBalance_D27,
            );
            const protectiveGear = row.protectiveGear ?? 0;
            const hoTro = Number(row['Hỗ trợ'] ?? 0);
            const truBHXH = Number(row['Trừ BHXH'] ?? 0);
            let salaryPerDay = baseSalary / 26;

            if (row.employeeCode === 'BCH11') {
              salaryPerDay = baseSalary / 30;
            } else if (row.employeeCode === 'NVH02' || row.employeeCode === 'DKT' || row.employeeCode === 'BT' || row.employeeCode === 'NVH01') {
              salaryPerDay = 0;
            }

            const basicSalary = salaryPerDay * (row.totalWorkAndOT ?? 0) * 0.6;
            const performanceSalary = (salaryPerDay * (row.totalWorkAndOT ?? 0) * kpiValue) / 10;
            const totalMoney = basicSalary + performanceSalary;
            let netSalary = totalMoney - advanceAndUnion - protectiveGear - truBHXH + hoTro || 0;
            if (row.employeeCode === 'NVH02' || row.employeeCode === 'DKT' || row.employeeCode === 'BT' || row.employeeCode === 'NVH01') {
              netSalary = baseSalary - advanceAndUnion;
            }

            const updated: any = {
              ...row,
              totalMoney,
              advanceAndUnion,
              performanceSalary,
              netSalary,
              basicSalary,
              salaryPerDay,
              salaryBalance: salaryBalance_D12 + salaryBalance_D27,
            };

            const skipRound = (key: string) => key.includes('Time') || key === 'totalWorkAndOT' || key === 'kpiValue';

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

    // Handle column resize
    const handleResize = useCallback(
      (dataIndex: string) => (width: number) => {
        console.log(dataIndex);
        requestAnimationFrame(() => {
          setColumnWidths(prev => {
            const next = { ...prev, [dataIndex]: width };
            dispatch(employeeActions.updateColumnWidth({ tableKey: activeKey, columnKey: dataIndex, width }));

            return next;
          });
        });
      },
      [dispatch, activeKey],
    );

    useEffect(() => {
      if (Object.keys(reduxColumnWidths).length === 0 && Object.keys(columnWidths).length > 0) {
        dispatch(employeeActions.setColumnWidths({ tableKey: activeKey, widths: columnWidths }));
      }
    }, [reduxColumnWidths, columnWidths, activeKey, dispatch]);

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
              tableKey: activeKey,
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
                tableKey: activeKey,
                visibility: mergedVisibility,
              }),
            );
          }
        }
      },
      [activeKey, dispatch, reduxColumnVisibility],
    );

    const hydrate = useCallback(async () => {
      const builtColumns = buildBCHColumnsFromMeta(meta, rows, saveRow, setSortCfg);

      const columnsWithMerge: any = builtColumns.map(col => {
        const dataIndex = (col as ColumnType<BCHPayrollType>).dataIndex as string;

        return {
          ...col,
          width: columnWidths[dataIndex] || col.width || 150,
          onHeaderCell: () => ({
            width: columnWidths[dataIndex] || col.width || 150,
            onResize: handleResize(dataIndex),
          }),
          onCell: (record: BCHPayrollType, rowIndex: number) => {
            const props: any = {
              record,
              dataIndex,
              handleSave: saveRow,
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

      // lần đầu hydrate mới setData
      if (data.length === 0) {
        setData(rows);

        setOriginalData(JSON.parse(JSON.stringify(rows)));
        isFirstRender.current = false;
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeKey,
      mergedCells,
      selectionMode,
      selectedCells,
      handleResize,
      columnWidths,
      initializeColumnVisibility,
      data.length,
      rows,
    ]);

    const getColumnRange = (startCol: string, endCol: string) => {
      const allColKeys = allColumns
        .filter(col => 'dataIndex' in col)
        .map(col => (col as ColumnType<BCHPayrollType>).dataIndex as string);

      const startIdx = allColKeys.indexOf(startCol);
      const endIdx = allColKeys.indexOf(endCol);

      if (startIdx === -1 || endIdx === -1) return [];
      return allColKeys.slice(startIdx, endIdx + 1);
    };

    const updateVisibleColumns = useCallback(
      (cols: ColumnsType<BCHPayrollType>, visibility: Record<string, boolean>) => {
        const visible = cols.filter(col => {
          const key: any = ((col as ColumnType<BCHPayrollType>).dataIndex as string) || col.key || '';

          if (key === 'key' || key === 'id' || key === 'rowNumber') return true;

          return visibility[key] !== false;
        });
        setVisibleColumns(visible);
      },
      [],
    );

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

      const specials = data.filter(r => SPECIAL_CODES.has(r.employeeCode));
      const normalsRaw = data.filter(r => !SPECIAL_CODES.has(r.employeeCode));

      const normals = [...normalsRaw].sort((a, b) => {
        const { key, order } = sortCfg;
        let va = a[key!] ?? '';
        let vb = b[key!] ?? '';
        
        if (key === 'name' || key === 'employeeName') {
          va = a['name'] ?? '';
          vb = b['name'] ?? '';
        }
        if (key === 'employeeCode' || key === 'name' || key === 'employeeName') {
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
      return [...normals, ...specials];
    }, [data, sortCfg]);

    useEffect(() => {
      setMergedCells(prev =>
        prev.map(cell => {
          if (dataView[cell.startRow]) {
            const newValue = dataView[cell.startRow][cell.startCol as keyof BCHPayrollType];
            return {
              ...cell,
              value: String(newValue || ''),
            };
          }
          return cell;
        }),
      );
    }, [data, dataView]);

    useImperativeHandle(ref, () => ({
      getExportData() {
        return { dataView, originalData, mergedCells, visibleColumns };
      },
      exportFile() {
        const rowsForExcel = prepareBCHExportData(dataView, visibleColumns);
        exportBCHExcel(rowsForExcel, dayjs(month), mergedCells, visibleColumns);
        onExport?.({ rowsForExcel, mergedCells, visibleColumns });
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
        .map(col => (col as ColumnType<BCHPayrollType>).dataIndex as string);

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
      const firstCellValue = dataView[startRow][startCol as keyof BCHPayrollType];
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

    function getLeafColumns(cols: ColumnsType<BCHPayrollType>): ColumnType<BCHPayrollType>[] {
      const res: ColumnType<BCHPayrollType>[] = [];
      cols.forEach(c => {
        if ('children' in c && c.children?.length) res.push(...getLeafColumns(c.children));
        else res.push(c);
      });
      return res;
    }

    const handleSetColumnVisibility = (visibility: Record<string, boolean>) => {
      setLocalColumnVisibility(visibility);

      dispatch(
        employeeActions.setColumnVisibility({
          tableKey: activeKey,
          visibility: visibility,
        }),
      );
    };

    return (
      <>
        <FilterBar
          allColumns={allColumns}
          // columnVisibility={columnVisibility}
          // setColumnVisibility={setColumnVisibility}
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
          scroll={{ x: 1450, y: 'calc(100vh - 310px)' }}
          summary={pageData => {
            const leafColumns = getLeafColumns(visibleColumns);
            const numericKeys = leafColumns
              .filter((c: any) => ['number', 'currency'].includes((c as any).metaType))
              .map((c: any) => c.dataIndex as keyof BCHPayrollType);

            const totals: Record<string, number> = Object.fromEntries(numericKeys.map((k: any) => [k as string, 0]));
            pageData.forEach(rec =>
              numericKeys.forEach(k => {
                totals[k as string] += +(rec[k] as number) || 0;
              }),
            );

            const firstNumericIdx = leafColumns.findIndex(c => ['number', 'currency'].includes((c as any).metaType));
            const labelColSpan = Math.max(1, firstNumericIdx);

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  {leafColumns.map((col: any, idx: any) => {
                    if (idx === 0) {
                      return (
                        <Table.Summary.Cell key={idx} index={idx} colSpan={labelColSpan} className={styles.summaryCellBorder}>
                          <strong style={{ display: 'flex', justifyContent: 'center', fontSize: 16 }}>Tổng</strong>
                        </Table.Summary.Cell>
                      );
                    }
                    if (idx < labelColSpan) return null;

                    const key = col.dataIndex as string;
                    const tot = totals[key];

                    return (
                      <Table.Summary.Cell key={idx} index={idx} align="right" className={styles.summaryCellBorder}>
                        {typeof tot === 'number' ? tot.toLocaleString('en-US') : null}
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
export default BCHSalaryTable;
BCHSalaryTable.displayName = 'BCHSalaryTable';
