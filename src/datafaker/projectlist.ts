import { Project, ProjectStatus } from '@/common/define';

export const ProjectList: Project[] = [
  {
    id: 2,
    external_id: 10066,
    title: 'Khách sạn Mariana',
    address: '499 Trần Hưng Đạo',
    status: ProjectStatus.BIDDING,
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 3,
    external_id: 10067,
    title: 'Dự án 12 Hà Bổng',
    address: '12 Hà Bổng',
    status: ProjectStatus.COMPLETED,
    photoUrl: 'https://as1.ftcdn.net/v2/jpg/01/62/06/40/1000_F_162064034_HI2YEgV7km3HMy0rccQczKH2vvpI4OnB.jpg'
  },
  {
    id: 4,
    external_id: 10068,
    title: 'Dự án nhà a Thuận',
    address: '12 Tô Hiến Thành',
    status: ProjectStatus.EXECUTING,
    photoUrl: 'https://as1.ftcdn.net/v2/jpg/03/57/79/06/1000_F_357790697_9UfRlHQCMQmPS5KBpCO9vXYtpi43brHb.jpg'
  },
  {
    id: 1,
    external_id: 10069,
    title: 'Dự án 81 Phan Tôn',
    address: '81 Phan Tôn',
    status: ProjectStatus.COMPLETED,
    photoUrl: 'https://as1.ftcdn.net/v2/jpg/02/97/04/44/1000_F_297044418_mpZhBMnU7WHQEcfpkRp5rg7nAbuxknMM.jpg'
  },
];

export const statusList = [
  { id: 0, name: 'Khởi tạo' },
  { id: 1, name: 'Đang dự thầu' },
  { id: 2, name: 'Đang thi công' },
  { id: 3, name: 'Hoàn thành' },
  { id: 4, name: 'Không trúng thầu' },
  { id: 5, name: 'Dự án tạm dừng' },
];
