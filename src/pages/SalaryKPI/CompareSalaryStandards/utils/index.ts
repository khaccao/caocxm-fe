import { EmployeeReportEfficiencyByStartEndDateDTO as DTO } from '@/common/define';

// ---------------------------------------------------------------------------------
export interface ProjectInfo {
  id: number;
  name: string;
}

export interface CompareRow {
  key: string;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  dinhmucluong: string;
  issueId: number;
  issueName: string;
  unitVolume: string;
  costPerValue: number;
  teamName: string;
  teamId: number;

  projectId?: number;
  projectName?: string;
  children?: any[];

  [attrCode: string]: string | number | undefined | any[];
}
interface BuildRowsOpts {
  showProjectCol: boolean;
  selectedEmployees: string[];
}

export const buildCompareRows = (reports: DTO[] | undefined, opts: BuildRowsOpts): CompareRow[] => {
  if (!Array.isArray(reports) || !reports.length) return [];

  const { showProjectCol, selectedEmployees } = opts;

  return reports
    .filter(r => selectedEmployees.length === 0 || selectedEmployees.includes(String(r.employeeId)))
    .map(r => {
      const dynamicPart = Object.fromEntries(
        (r.employReportAttributes ?? []).map(a => [a.attributeCode, toNumberIfPossible(a.value)]),
      );

      const base: CompareRow = {
        key: `emp_${r.id}`,
        employeeId: r.employeeId,
        employeeCode: r.employeeCode,
        employeeName: r.employeeName,
        dinhmucluong: r.dinhMucLuong ?? '',
        issueId: r.issueId ?? 0,
        issueName: r.issueName ?? '',
        unitVolume: r.unitVolume ?? '',
        costPerValue: r.costPerValue ?? 0,
        teamName: r.teamName ?? '',
        teamId: r.teamId ?? 0,
        ...dynamicPart,
      };

      return showProjectCol ? { ...base, projectId: r.projectId, projectName: (r as any).projectName ?? '' } : base;
    });
};

const toNumberIfPossible = (val: string): number | string => (isNaN(Number(val)) ? val : Number(val));

// ---------------------build tree ------------------------------------------

type Kind = 'project' | 'team' | 'employee' | 'task';

export interface TreeRow extends CompareRow {
  kind: Kind;
  stt?: number;
  children?: TreeRow[];
  projectName?: string;
  groupName?: string;
}

const toNumeric = (val: unknown): number => {
  if (typeof val === 'number') return val;
  const str = String(val).replace(/[^0-9.-]+/g, '');
  const num = Number(str);
  return isNaN(num) ? 0 : num;
};

const createProjectNode = (projectId?: number, projectName?: string): TreeRow => ({
  key: `project_${projectId ?? 'none'}`,
  kind: 'project',
  projectId,
  projectName: projectName != null ? `Công trình: ${projectName}` : projectId ? `Công trình: ${projectId}` : '---',
  employeeId: 0,
  employeeCode: '',
  employeeName: '',
  dinhmucluong: '',
  issueId: 0,
  issueName: '',
  unitVolume: '',
  costPerValue: 0,
  teamName: '',
  teamId: 0,
  children: [],
});

const createTeamNode = (teamId: number, teamName: string): TreeRow => ({
  ...{
    employeeId: 0,
    employeeCode: '',
    employeeName: '',
    dinhmucluong: '',
    issueId: 0,
    issueName: '',
    unitVolume: '',
    costPerValue: 0,
    teamName: '',
    teamId: 0,
    children: [],
  },
  key: `team_${teamId}`,
  kind: 'team',
  groupName: teamName,
});

const createEmployeeNode = (row: CompareRow, stt: number): TreeRow => ({
  ...row,
  kind: 'employee',
  stt,
  children: [],
});

const createTaskNode = (row: CompareRow): TreeRow => ({
  ...{
    employeeId: 0,
    employeeCode: '',
    employeeName: '',
    dinhmucluong: '',
    issueId: 0,
    issueName: '',
    unitVolume: '',
    costPerValue: 0,
    teamName: '',
    teamId: 0,
  },
  key: `task_${row.issueId}`,
  kind: 'task',
  issueName: `• ${row.issueName}`,
  So_Cong_Hoan_Thanh: row.So_Cong_Hoan_Thanh,
  Khoi_Luong: row.Khoi_Luong,
  unitVolume: row.unitVolume,
  costPerValue: row.costPerValue,
  issueId: row.issueId,
  children: [],
});

export const buildTreeRows = (rows: CompareRow[], projectList: ProjectInfo[]): TreeRow[] => {
  if (!rows.length) return [];

  const projectMap = new Map<number, string>(projectList.map(p => [p.id, p.name]));

  const projects = new Map<number | undefined, TreeRow>();
  const groupedData = new Map<string, CompareRow[]>();

  // project -> team -> employee
  rows.forEach(row => {
    const key = `${row.projectId}_${row.teamId}_${row.employeeId}`;
    if (!groupedData.has(key)) groupedData.set(key, []);
    groupedData.get(key)!.push(row);
  });

  groupedData.forEach(employeeRows => {
    if (!employeeRows.length) return;
    const firstRow = employeeRows[0];
    const pid = firstRow.projectId;

    let projectNode = projects.get(pid);
    if (!projectNode) {
      const pname = pid != null ? projectMap.get(pid) : undefined;
      projectNode = createProjectNode(pid, pname);
      projects.set(pid, projectNode);
    }

    // team
    const teamKey = `team_${firstRow.teamId}`;
    let teamNode = projectNode.children!.find(c => c.kind === 'team' && c.key === teamKey);
    if (!teamNode) {
      teamNode = createTeamNode(firstRow.teamId, firstRow.teamName);
      projectNode.children!.push(teamNode);
    }

    // employee
    const empIndex = teamNode.children!.filter(c => c.kind === 'employee').length + 1;
    const empNode = createEmployeeNode(firstRow, empIndex);

    // tasks
    employeeRows.forEach(r => {
      empNode.children!.push(createTaskNode(r));
    });

    const totalSo = employeeRows.reduce((s, r) => s + toNumeric(r.So_Cong_Hoan_Thanh), 0);
    const totalKl = employeeRows.reduce((s, r) => s + toNumeric(r.Khoi_Luong), 0);
    const totalCost = employeeRows.reduce((s, r) => s + toNumeric(r.costPerValue) * toNumeric(r.Khoi_Luong), 0);

    empNode.So_Cong_Hoan_Thanh = totalSo;
    empNode.Khoi_Luong = totalKl;
    (empNode as any).totalCost = totalCost;

    empNode.unitVolume = employeeRows.map(r => String(r.unitVolume)).join(', ');
    empNode.costPerValue = firstRow.costPerValue;

    teamNode.children!.push(empNode);
  });

  return Array.from(projects.values());
};
