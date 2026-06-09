export interface EmployeeRow {
  dvt: string;
  maNV: string;
  tenNV: string;
  teamId: number;
  chucVu: string;
  congCham: number;
  groupName: string;
  congDanhGia: number;
  key?: string;
}

export interface EmployeeRows extends EmployeeRow {
  // flag
  isGroupHeader?: boolean;
  sttWithinGroup?: number;
  isBCH?: boolean;
}
