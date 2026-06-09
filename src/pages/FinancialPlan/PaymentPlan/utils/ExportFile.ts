/* eslint-disable import/order */
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import Utils from '@/utils';
import { BCHPayrollType as OriginalBCHPayrollType, PayrollType as OriginalPayrollType } from '../components/data';

// -----------------------------------------------------

type PayrollType = OriginalPayrollType & {
  [key: string]: any;
};

type BCHPayrollType = OriginalBCHPayrollType & {
  [key: string]: any;
};

// ---------------------------------------------------

export interface ExportRow {
  [key: string]: string | number;
}

export interface MergedCell {
  startRow: number;
  endRow: number;
  startCol: string;
  endCol: string;
  value: any;
}

type AnyObject = Record<string, any>;

interface ExportOptions<T extends AnyObject> {
  data: T[];
  fileName: string;
  sheetName?: string;
  columns?: {
    header: string;
    key: string;
  }[];
}

export const prepareExportData = (dataView: PayrollType[], visibleColumns: ColumnsType<PayrollType>): any[] => {
  const columnKeys = visibleColumns.filter(col => 'dataIndex' in col).map(col => (col as any).dataIndex as string);

  const rowsForExcel = dataView.map((row, index) => {
    const out: Record<string, any> = {};

    columnKeys.forEach(key => {
      let v = row[key];
      if (typeof v === 'number') {
        const metaType = (visibleColumns.find(c => (c as any).dataIndex === key) as any).metaType;
        out[key] = metaType === 'currency' ? `${v.toLocaleString('en-US')}` : v;
      } else {
        out[key] = v ?? '';
      }
    });

    // Gán chỉ số STT nếu có cột 'stt'
    if (columnKeys.includes('stt')) {
      out['stt'] = index + 1;
    }

    return out;
  });


  // sum
  const numericKeys = visibleColumns
    .filter(col => 'dataIndex' in col && ['number', 'currency'].includes((col as any).metaType))
    .map(col => (col as any).dataIndex as string);

  const totals: Record<string, number> = {};
  numericKeys.forEach(key => {
    totals[key] = dataView.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  });

  const totalsRow: Record<string, any> = {};
  columnKeys.forEach(key => {
    if (key === 'employeeCode') {
      totalsRow[key] = 'Tổng';
    } else if (key === 'netSalary') {
      const sum = totals[key] || 0;
      totalsRow[key] = sum ? `${sum.toLocaleString('en-US')}` : '';
    } else {
      totalsRow[key] = '';
    }
  });
  console.log(totalsRow);
  return [...rowsForExcel, totalsRow];
};

const colLetterToNumber = (l: string) =>
  l
    .toUpperCase()
    .split('')
    .reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

export const exportExcel = async (
  rowsForExcel: any[],
  month: dayjs.Dayjs | undefined,
  mergedCells: MergedCell[],
  visibleColumns: ColumnsType<PayrollType>,
) => {
  const logoUrl = new URL('./NVH-logo.png', import.meta.url).href;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`BẢNG LƯƠNG TỔNG HỢP CÁC CÔNG TRÌNH`)

  const imgBuffer = await fetch(logoUrl).then(r => r.arrayBuffer());
  const imgId = wb.addImage({ buffer: imgBuffer, extension: 'png' });
  ws.addImage(imgId, {
    tl: { col: 1, row: 0 },
    ext: { width: 80, height: 80 },
  } as unknown as ExcelJS.ImagePosition);

  const startCol = colLetterToNumber('A');
  const endCol = colLetterToNumber('H');

  ws.getCell(2, startCol).value = 'Công Ty Cổ Phần Xây Dựng -TM';
  ws.mergeCells(2, startCol, 2, endCol);
  ws.getCell(2, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(2, startCol).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(3, startCol).value = 'NAM VIỆT HÙNG';
  ws.mergeCells(3, startCol, 3, endCol);
  ws.getCell(3, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(3, startCol).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(4, startCol).value = 'K 30/09 Đường Trường Sơn-Quận Cẩm Lệ-TP ĐN';
  ws.mergeCells(4, startCol, 4, endCol);
  ws.getCell(4, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(4, startCol).alignment = { horizontal: 'center', vertical: 'middle' };

  const title = month
    ? `BẢNG LƯƠNG TỔNG HỢP CÁC CÔNG TRÌNH - ${month.format('DD/MM/YYYY')}`
    : 'BẢNG LƯƠNG TỔNG HỢP CÁC CÔNG TRÌNH';

  ws.getCell('A6').value = title;
  ws.mergeCells(6, 1, 6, visibleColumns.length);
  ws.getCell('A6').font = { bold: true, size: 14 };
  ws.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

  const headers = visibleColumns.filter(c => 'dataIndex' in c).map(c => (c as any).rawTitle as string);

  ws.getRow(7).values = [, ...headers];
  ws.getRow(7).font = { name: 'Cambria', bold: true };

  ws.getRow(7).alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
  const headerRow = ws.getRow(7);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }, // Màu xanh
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // Chữ trắng
      bold: true,
    };
  });
  headerRow.height = 100;
  const colKeys = visibleColumns.filter(c => 'dataIndex' in c).map(c => (c as any).dataIndex as string);
  const columnAlignments: Record<string, Partial<ExcelJS.Alignment>> = {};
  visibleColumns.forEach(col => {
    const key = (col as any).dataIndex;
    const metaType = (col as any).metaType;
    const dataIndex = (col as any).dataIndex as string;
    if (key) {
      if (metaType === 'currency' || metaType === 'number') {
        columnAlignments[key] = { horizontal: 'right' };
      } else if (dataIndex === 'name') {
        columnAlignments[key] = { horizontal: 'left' };
      } else {
        columnAlignments[key] = { horizontal: 'center' };
      }
    }
  });
  let rowIdx = 8;
  rowsForExcel.forEach(obj => {
    const rowValues = colKeys.map(k => obj[k]);
    ws.getRow(rowIdx).values = [, ...rowValues];
    colKeys.forEach((key, colIdx) => {
      const cell = ws.getRow(rowIdx).getCell(colIdx + 1); // +1 vì bắt đầu từ cột B
      const align = columnAlignments[key];
      if (align) {
        cell.alignment = align;
      }
    });
    rowIdx++;
  });

  const DATA_START_ROW = 8;
  mergedCells.forEach(mc => {
    const startC = colKeys.indexOf(mc.startCol) + 1;
    const endC = colKeys.indexOf(mc.endCol) + 1;
    const startR = DATA_START_ROW + mc.startRow;
    const endR = DATA_START_ROW + mc.endRow;
    ws.mergeCells(startR, startC, endR, endC);
  });

  // ws.columns = visibleColumns.map(col => ({
  //   width: Math.max((col.title as string).length * 3, 15),
  // }));
  ws.eachRow((row, rowNumber) => {
    // Bỏ qua các dòng tiêu đề công ty (1–4) và dòng tiêu đề bảng lương (6)
    if (rowNumber >= 5 && rowNumber !== 6) {
      row.eachCell(cell => {
        if (rowNumber !== 7) {
          cell.font = { name: 'Cambria' };
        } else {
          cell.font = {
            ...cell.font,
            name: 'Cambria', // giữ nguyên màu trắng và bold
          };
        }
      });
    }
  });

  // Calc width col
  const calculateColumnWidth = (dataIndex: string): number => {
    let maxDataWidth = 0;
    rowsForExcel.forEach(row => {
      const cellValue = row[dataIndex];
      if (cellValue !== null && cellValue !== undefined) {
        const valueLength = String(cellValue).length;
        maxDataWidth = Math.max(maxDataWidth, valueLength);
      }
    });

    const calculatedWidth = maxDataWidth * 1.2 + 1;

    return Math.min(Math.max(calculatedWidth, 5), 50); // Giới hạn min 5, max 50
  };

  ws.columns = visibleColumns.map((col, index) => {
    const dataIndex = (col as any).dataIndex as string;
    const title = (col as any).rawTitle as string;
    if (title === 'Ký nhận') {
      return { width: 18 };
    }
    return {
      width: calculateColumnWidth(dataIndex),
    };
  });

  // Thêm border
  const lastDataRow = DATA_START_ROW + rowsForExcel.length - 1;
  ws.getRow(lastDataRow).eachCell(cell => {
    cell.font = { ...cell.font, bold: true };
  });
  const sumProjectsColIdx = colKeys.indexOf('totalWork') + 1; // +2 vì cột bắt đầu từ B (B = colIdx 1)
  if (sumProjectsColIdx >= 2) {
    for (let r = 8; r <= lastDataRow; r++) {
      ws.getCell(r, sumProjectsColIdx).font = {
        ...ws.getCell(r, sumProjectsColIdx).font,
        bold: true,
      };
    }
  }
  const lastCol = visibleColumns.length;

  for (let row = 7; row <= lastDataRow; row++) {
    for (let col = 1; col <= lastCol; col++) {
      const cell = ws.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }

  const blob = new Blob([await wb.xlsx.writeBuffer({ useSharedStrings: true, useStyles: true })]);
  const fname = `Bảng tiền lương ${month ? month.format('DD-MM-YYYY') : 'export'}_NVH.xlsx`;
  saveAs(blob, fname);
  Utils.successNotification('Xuất file thành công');
};

// ----------------------BCH----------------------

export const prepareBCHExportData = (
  dataView: BCHPayrollType[],
  visibleColumns: ColumnsType<BCHPayrollType>,
): any[] => {
  const columnKeys = visibleColumns.filter(col => 'dataIndex' in col).map(col => (col as any).dataIndex as string);

  const rowsForExcel = dataView.map((row, index) => {
    const out: Record<string, any> = {};

    if (row.employeeCode === 'Tổng') {
      columnKeys.forEach(key => {
        out[key] = key === 'netSalary' ? row[key] : '';
      });
    } else {
      columnKeys.forEach(key => {
        let v = row[key];
        if (typeof v === 'number') {
          const metaType = (visibleColumns.find(c => (c as any).dataIndex === key) as any).metaType;
          out[key] = metaType === 'currency' ? `${v.toLocaleString('en-US')}` : v;
        } else {
          out[key] = v ?? '';
        }
      });

      if (columnKeys.includes('stt')) {
        out['stt'] = index + 1;
      }
    }
    return out;
  });


  // sum
  const numericKeys = visibleColumns
    .filter(col => 'dataIndex' in col && ['number', 'currency'].includes((col as any).metaType))
    .map(col => (col as any).dataIndex as string);

  const totals: Record<string, number> = {};
  numericKeys.forEach(key => {
    totals[key] = dataView.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  });

  const totalsRow: Record<string, any> = {};
  columnKeys.forEach((key, idx) => {
    if (key === 'stt') {
      totalsRow[key] = ''; // Dòng tổng không cần STT
    } else if (idx === 1) {
      totalsRow[key] = 'Tổng';
    } else if (numericKeys.includes(key)) {
      const sum = totals[key] || 0;
      totalsRow[key] = sum
        ? `${sum.toLocaleString('en-US')}${['salary', 'advancePayment', 'advance20'].includes(key) ? ' VNĐ' : ''
        }`
        : '';
    } else {
      totalsRow[key] = '';
    }
  });

  return [...rowsForExcel, totalsRow];
};

export const exportBCHExcel = async (
  rowsForExcel: any[],
  month: dayjs.Dayjs | undefined,
  mergedCells: MergedCell[],
  visibleColumns: ColumnsType<BCHPayrollType>,
) => {
  const logoUrl = new URL('./NVH-logo.png', import.meta.url).href;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('BẢNG LƯƠNG BAN CHỈ HUY');

  const imgBuffer = await fetch(logoUrl).then(r => r.arrayBuffer());
  const imgId = wb.addImage({ buffer: imgBuffer, extension: 'png' });

  ws.addImage(imgId, {
    tl: { col: 1, row: 0 },
    ext: { width: 80, height: 80 },
  } as unknown as ExcelJS.ImagePosition);

  const startCol = colLetterToNumber('A');
  const endCol = colLetterToNumber('H');

  ws.getCell(2, startCol).value = 'Công Ty Cổ Phần Xây Dựng -TM';
  ws.mergeCells(2, startCol, 2, endCol);
  ws.getCell(2, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(2, startCol).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(3, startCol).value = 'NAM VIỆT HÙNG';
  ws.mergeCells(3, startCol, 3, endCol);
  ws.getCell(3, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(3, startCol).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(4, startCol).value = 'K 30/09 Đường Trường Sơn-Quận Cẩm Lệ-TP ĐN';
  ws.mergeCells(4, startCol, 4, endCol);
  ws.getCell(4, startCol).font = { name: 'Cambria', bold: true, size: 10 };
  ws.getCell(4, startCol).alignment = { horizontal: 'center', vertical: 'middle' };


  const title = month ? `BẢNG LƯƠNG BAN CHỈ HUY - ${month.format('MM/YYYY')}` : 'BẢNG LƯƠNG BAN CHỈ HUY';

  ws.getCell('A6').value = title;
  ws.mergeCells(6, 1, 6, visibleColumns.length);
  ws.getCell('A6').font = { bold: true, size: 14 };
  ws.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

  const headers = visibleColumns.filter(c => 'dataIndex' in c).map(c => (c as any).rawTitle as string);

  ws.getRow(7).values = [, ...headers];
  ws.getRow(7).font = { name: 'Cambria', bold: true };

  ws.getRow(7).alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
  const headerRow = ws.getRow(7);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }, // Màu xanh
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // Chữ trắng
      bold: true,
    };
  });
  headerRow.height = 100;
  const colKeys = visibleColumns.filter(c => 'dataIndex' in c).map(c => (c as any).dataIndex as string);
  const columnAlignments: Record<string, Partial<ExcelJS.Alignment>> = {};
  visibleColumns.forEach(col => {
    const key = (col as any).dataIndex;
    const metaType = (col as any).metaType;
    const dataIndex = (col as any).dataIndex as string;
    if (key) {
      if (metaType === 'currency' || metaType === 'number') {
        columnAlignments[key] = { horizontal: 'right' };
      } else if (dataIndex === 'name') {
        columnAlignments[key] = { horizontal: 'left' };
      } else {
        columnAlignments[key] = { horizontal: 'center' };
      }
    }
  });
  let rowIdx = 8;
  rowsForExcel.forEach(obj => {
    const rowValues = colKeys.map(k => obj[k]);
    ws.getRow(rowIdx).values = [, ...rowValues];
    colKeys.forEach((key, colIdx) => {
      const cell = ws.getRow(rowIdx).getCell(colIdx + 1); // +1 vì bắt đầu từ cột B
      const align = columnAlignments[key];
      if (align) {
        cell.alignment = align;
      }
    });
    rowIdx++;
  });

  const DATA_START_ROW = 8;
  mergedCells.forEach(mc => {
    const startC = colKeys.indexOf(mc.startCol) + 1;
    const endC = colKeys.indexOf(mc.endCol) + 1;
    const startR = DATA_START_ROW + mc.startRow;
    const endR = DATA_START_ROW + mc.endRow;
    ws.mergeCells(startR, startC, endR, endC);
  });

  const calculateColumnWidth = (dataIndex: string): number => {
    let maxDataWidth = 0;
    rowsForExcel.forEach(row => {
      const cellValue = row[dataIndex];
      if (cellValue !== null && cellValue !== undefined) {
        const valueLength = String(cellValue).length;
        maxDataWidth = Math.max(maxDataWidth, valueLength);
      }
    });

    const calculatedWidth = maxDataWidth * 1.2 + 1;

    return Math.min(Math.max(calculatedWidth, 5), 50); // Giới hạn min 5, max 50
  };
  ws.columns = visibleColumns.map((col, index) => {
    const dataIndex = (col as any).dataIndex as string;
    const title = (col as any).rawTitle as string;

    return {
      width: calculateColumnWidth(dataIndex),
    };
  });

  // Thêm border
  const lastDataRow = DATA_START_ROW + rowsForExcel.length - 1;
  const lastCol = visibleColumns.length;

  for (let row = 7; row <= lastDataRow; row++) {
    for (let col = 1; col <= lastCol; col++) {
      const cell = ws.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }
  ws.eachRow((row, rowNumber) => {
    // Bỏ qua các dòng tiêu đề công ty (1–4) và dòng tiêu đề bảng lương (6)
    if (rowNumber >= 5 && rowNumber !== 6) {
      row.eachCell(cell => {
        if (rowNumber !== 7) {
          cell.font = { name: 'Cambria' };
        } else {
          cell.font = {
            ...cell.font,
            name: 'Cambria', // giữ nguyên màu trắng và bold
          };
        }
      });
    }
  });
  const blob = new Blob([await wb.xlsx.writeBuffer({ useSharedStrings: true, useStyles: true })]);
  const fname = `BẢNG LƯƠNG BAN CHỈ HUY_${month ? month.format('DD-MM-YYYY') : 'export'}.xlsx`;
  saveAs(blob, fname);
  Utils.successNotification('Xuất file thành công');
};

export async function exportBaseExcel<T extends object>(options: ExportOptions<T>) {
  const { data, fileName, sheetName = 'Sheet1', columns } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  function calculateColumnWidth(
    data: T[],
    dataIndex: keyof T,
    title: string
  ): number {
    const headerWidth = title.length * 1.2;
    let maxDataWidth = 0;
    data.forEach((row) => {
      const cellValue = row[dataIndex];
      if (cellValue !== null && cellValue !== undefined) {
        const len = String(cellValue).length;
        if (len > maxDataWidth) {
          maxDataWidth = len;
        }
      }
    });
    const calculated = Math.max(headerWidth, maxDataWidth * 1.1) + 2;

    return Math.min(Math.max(calculated, 10), 50);
  }

  if (columns && columns.length > 0) {
    worksheet.columns = columns.map((col) => {
      const headerTitle = col.header;
      const keyAsString = col.key;

      const fieldKey = keyAsString as keyof T;

      const width = calculateColumnWidth(data, fieldKey, headerTitle);

      return {
        header: headerTitle,
        key: String(fieldKey),
        width,
      };
    });
  } else {
    if (data.length > 0) {
      const sample = data[0];
      const keys = Object.keys(sample) as (keyof T)[];

      worksheet.columns = keys.map((key) => {
        const headerTitle = String(key);
        const width = calculateColumnWidth(data, key, headerTitle);
        return {
          header: headerTitle,
          key: String(key),
          width,
        };
      });
    }
  }

  data.forEach((item) => {
    worksheet.addRow(item as any);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }, // Màu xanh
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // Chữ trắng
      bold: true,
    };
  });
  headerRow.height = 40;
  const blob = new Blob([await workbook.xlsx.writeBuffer({ useSharedStrings: true, useStyles: true })]);
  saveAs(blob, fileName);
}