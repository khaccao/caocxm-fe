import { EmployeeRow } from '../types';
import { EmployeeReportAttributesDTO, EmployeeReportDTO } from '@/common/define';
import { EmployeeResponse } from '@/services/EmployeeService';
import { ProjectMemberPagingResponse } from '@/services/ProjectService';

// -----------------------------------------------------------------------------------

const getAttr = (attrs: EmployeeReportAttributesDTO[], code: 'So_Cong_CheckIn' | 'So_Cong_Hoan_Thanh') =>
  parseFloat(attrs.find(a => a.attributeCode === code)?.value ?? '0');

export const handleEmployeeRows = (
  reports: EmployeeReportDTO[],
  members?: ProjectMemberPagingResponse,
): EmployeeRow[] => {
  const { roleMap, teamMap } = mapTeamsAndRoles(members);

  const rowsByKey = new Map<string, EmployeeRow>();

  reports.forEach(r => {
    const congCham = getAttr(r.employReportAttributes, 'So_Cong_CheckIn');
    const congDanhGia = getAttr(r.employReportAttributes, 'So_Cong_Hoan_Thanh');
    const key = `${r.teamId}_${r.employeeId}`;

    if (!rowsByKey.has(key)) {
      rowsByKey.set(key, {
        teamId: r.teamId || 0,
        groupName: r.teamId !== undefined ? teamMap.get(r.teamId) ?? r.teamName ?? '—' : r.teamName ?? '—',
        maNV: r.employeeCode,
        tenNV: r.employeeName,
        chucVu: roleMap.get(r.employeeId) ?? '—',
        dvt: 'Công',
        congCham,
        congDanhGia,
      });
    } else {
      const row = rowsByKey.get(key)!;

      // row.congCham += congCham;
      row.congDanhGia += congDanhGia;
    }
  });

  return Array.from(rowsByKey.values());
};

export const mapTeamsAndRoles = (members?: ProjectMemberPagingResponse) => {
  const roleMap = new Map<number, string>();
  const teamMap = new Map<number, string>();

  members?.results.forEach(m => {
    roleMap.set(m.employeeId, m.roleName || '—');

    m.teamReadDTO?.forEach(t => {
      if (!teamMap.has(t.id)) teamMap.set(t.id, t.name);
    });
  });

  return { roleMap, teamMap };
};

export const ONE_WORKDAY_MINUTES = 480;
export function mapBCHMemberToRow(m: EmployeeResponse): any {
  return {
    key: `bch_${m.id}`,
    teamId: 0,
    groupName: 'Ban Chỉ Huy',
    maNV: m.employeeCode,
    tenNV: [m.lastName, m.middleName, m.firstName].filter(Boolean).join(' '),
    chucVu: 'Ban Chỉ Huy',
    dvt: 'Công',
    congCham: ONE_WORKDAY_MINUTES,
    congDanhGia: 1,
    isBCH: true,
  };
}
