import { ProjectMemberType } from "@/common/define";

export interface IProjectMember {
  key: string;
  id: string;
  name: string;
  role: string;
  team: string;
  note: string;
}

export const ProjectMemberList: ProjectMemberType[] = [
  {
    key: '1',
    name: 'Trương Thế Phương',
    role: ['Chỉ huy trưởng'],
  },
  {
    key: '5',
    name: 'Nhung',
    role: ['Kế hoạch'],
  },
  {
    key: '9',
    name: 'Đậu Tiến Toàn',
    role: ['Giám đốc'],
  },
  {
    key: '12',
    name: 'Hồ Tú',
    role: ['Giám đốc'],
  },
]

export const projectMemberData: IProjectMember[] = [
  {
    key: '1',
    id: '1',
    name: 'Trương Thế Phong',
    role: 'Chỉ huy trưởng',
    team: 'Tổ 1',
    note: '',
  },
  {
    key: '2',
    id: '2',
    name: 'Lê Công Tới',
    role: 'Cán bộ kỹ thuật',
    team: 'Giám đốc',
    note: '',
  },
  {
    key: '3',
    id: '3',
    name: 'Lương Anh Sơn',
    role: 'Thủ kho',
    team: 'Giám đốc',
    note: '',
  },
  {
    key: '4',
    id: '4',
    name: 'Lương Anh Sơn',
    role: 'Thủ kho',
    team: 'Giám đốc',
    note: '',
  },
  {
    key: '5',
    id: '5',
    name: 'Lương Anh Sơn',
    role: 'Thủ kho',
    team: 'Giám đốc',
    note: '',
  },
  {
    key: '6',
    id: '6',
    name: 'Lương Anh Sơn',
    role: 'Thủ kho',
    team: 'Giám đốc',
    note: '',
  },
  {
    key: '7',
    id: '7',
    name: 'Lương Anh Sơn',
    role: 'Thủ kho',
    team: 'Giám đốc',
    note: '',
  },
];