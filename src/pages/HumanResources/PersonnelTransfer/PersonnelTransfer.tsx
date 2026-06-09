/* eslint-disable react-hooks/exhaustive-deps */
import React, { Children, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { PersonnelTransferHeader } from './PersonnelTransferHeader';
import { eEmployeeType, EmployeeReportDTO, FormatDateAPI, iOptions, ProjectEmployeeDTO } from '@/common/define';
import { ProjectResponse } from '@/common/project';
import { eColumnsTpye, iColumnsConfig, TableCustom } from '@/components/TableCustom';
import { ProjectMemberPagingResponse } from '@/services/ProjectService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getQueryReportsByStartEndDate, getReportsByStartEndDate, issueActions } from '@/store/issue';
import { getEmployeeProjects, getProjectList, getProjectMembers, getSelectedProject, projectActions } from '@/store/project';
import Utils from '@/utils';



interface iPersonnelTransfer {
  Key: number;
  MaNV: string;
  TenNV: string;
  CongTrinhDC: string[];
  StartDate: string;
  Date: string;
  EndDate: string;
  CongTrinhNhanDC: string;
}
export const PersonnelTransfer: React.FC = () => {
  const [Data, setData] = useState<iPersonnelTransfer[]>([]);
  const tTable = useTranslation('table').t;
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  // [06/12/2024][#21116][phuong_td] Thêm inteface
  const selectedProject: ProjectResponse | null = useAppSelector(getSelectedProject());
  const reportsByStartEndDate: EmployeeReportDTO[] | undefined = useAppSelector(getReportsByStartEndDate());
  const projectList: ProjectResponse[] = useAppSelector(getProjectList());
  const employeeProjects: ProjectEmployeeDTO[] | undefined = useAppSelector(getEmployeeProjects());
  const queryReportsByStartEndDate: { projectId: number, params: iOptions } | undefined = useAppSelector(getQueryReportsByStartEndDate());
  const projectMembers: ProjectMemberPagingResponse | undefined = useAppSelector(getProjectMembers());

  useEffect(() => { 
    // [06/12/2024][#21116][phuong_td] Lấy Danh sách nhân viên thuộc project hiện tại
    if (selectedProject) {
      dispatch(
        projectActions.getProjectMembersRequest({
          projectId: selectedProject.id,
          queryParams: { paging: false,  },
        }),
      );
    }
  }, [selectedProject]);
  // [#20692][phuong_td][31/10/2024] Dữ liệu thay đổi
  const DataModifine: { [key: string]: iPersonnelTransfer } = {};
  // [#20692][phuong_td][31/10/2024] Cấu hình của table
  const columnsConfig: { [key: string]: iColumnsConfig } = {
    Key: {
      hidden: true,
      isKey: true,
      width: 20,
      type: eColumnsTpye.text,
    },
    MaNV: {
      title: tTable('MaNV'),
      width: 30,
      type: eColumnsTpye.text,
    },
    TenNV: {
      title: tTable('TenNV'),
      width: 30,
      type: eColumnsTpye.text,
      sorter: true,
    },
    CongTrinhDC: {
      title: tTable('CongTrinhDC'),
      width: 30,
      type: eColumnsTpye.avatar,
    },
    Date: {
      title: tTable('Date'),
      width: 30,
      type: eColumnsTpye.date,
      sorter: true,
    },
    // StartDate: {
    //   title: tTable('StartDate'),
    //   width: 50,
    //   type: eColumnsTpye.date,
    // },
    // EndDate: {
    //   title: tTable('EndDate'),
    //   width: 50,
    //   type: eColumnsTpye.date,
    // },
    CongTrinhNhanDC: {
      title: tTable('CongTrinhNhanDC'),
      width: 30,
      type: eColumnsTpye.text,
    },
  };

  // [09/11/2024][#20629][phuong_td] phương thức lấy tên dự án theo id
  const GetProjectName = (id?: number) => {
    let projectName = '';
    if (projectList && !Utils.checkNull(id)) {
      const project = projectList.find(p => p.id === id);
      projectName = project?.name ?? '';
    }
    return projectName;
  };

  // [09/11/2024][#20629][phuong_td] đọc dữ liệu report và gọi api lấy project của nhân công
  useEffect(() => {
    if (reportsByStartEndDate) {
      const ids: number[] = [];
      reportsByStartEndDate.forEach(r => {
        if (r.id && r.employeeId && r.employeeType === eEmployeeType.BoXung && !ids.includes(r.employeeId)) {
          ids.push(r.employeeId);
        }
      });
      const startDate = queryReportsByStartEndDate?.params.startDate ?? dayjs().startOf('week').format(FormatDateAPI);
      const endDate = queryReportsByStartEndDate?.params.endDate ?? dayjs().endOf('week').format(FormatDateAPI);
      dispatch(
        projectActions.getEmployeeProjectsRequest({
          ids,
          params: {
            startTime: startDate,
            endTime: endDate,
          },
        }),
      );
    }
  }, [reportsByStartEndDate]);

  useEffect(() => {
    const _data: iPersonnelTransfer[] = [];
    // [09/11/2024][#20629][phuong_td] tạo dữ liệu nhân viên điều chuyển
    if (reportsByStartEndDate) {
      reportsByStartEndDate.forEach(r => {
        if (r.id && r.employeeType === eEmployeeType.BoXung) {
          // [10/11/2024][#20629][phuong_td] lấy thông tin dự án làm việc của nhân công theo ngày
          const employeeProject = employeeProjects?.filter(e => {
            const startTimeWork = dayjs(e.startTime);
            const endTimeWork = dayjs(e.endTime);
            const dateReport = dayjs(r.startTime);
            return e.employeeId === r.employeeId && Utils.isSameOrAfter(dateReport, startTimeWork, endTimeWork);
          });
          // [06/12/2024][#21116][phuong_td] Điều chỉnh công trình điều chuyển thành danh sách công trình điều chuyển
          const none = t('None');
          let CongTrinhDC = [none];
          let CongTrinhDCId: number[] = [];
          if (employeeProject) {
            employeeProject.forEach((e) => {
              if (CongTrinhDC.includes(none)) {
                CongTrinhDC = [`${e.projectName}`];
                CongTrinhDCId = [e.projectId];
              } else {
                CongTrinhDC.push(`${e.projectName}`);
                CongTrinhDCId.push(e.projectId);
              }
            })
          }
          // CongTrinhDC.push("AVATAR HỘI AN");
          const temp: iPersonnelTransfer = {
            Key: r.id,
            MaNV: r.employeeCode,
            TenNV: `${r.employeeName}`,
            CongTrinhDC,
            Date: r.startTime,
            StartDate: r.startTime,
            EndDate: r.endTime,
            CongTrinhNhanDC: `${GetProjectName(r.projectId)}`,
          };
          // [06/12/2024][#21116][phuong_td] Kiểm tra xem nhân công có trong dự án hiện tại không
          const employeeInCurrentPJ = projectMembers?.results?.find(pm => `${pm.code}` === temp.MaNV);
          
          // [06/12/2024][#21116][phuong_td] kiểm tra xem Công trình nhận điều chuyển có tồn tại trong danh sách điều chuyển không
          let checkCTNhanDieuChuyenCoCTDieuChuyen = false;
          if (r.projectId ) {
            checkCTNhanDieuChuyenCoCTDieuChuyen = CongTrinhDCId.includes(r.projectId);
          }
          // [06/12/2024][#21116][phuong_td] Kiểm tra nhân viên có trùng lắp theo Mã Nhân công và ngày
          const checkDuplicate = _data.find((transfer) => {
            const dkNV = transfer.MaNV === temp.MaNV;
            const dkDate = transfer.Date === temp.Date;
            // const dkCongTrinhNhanDC = transfer.CongTrinhNhanDC === temp.CongTrinhNhanDC;
            // const dkCongTrinhDC = transfer.CongTrinhDC.includes(temp.CongTrinhDC);
            return dkNV &&  dkDate;// && dkCongTrinhNhanDC && dkCongTrinhDC;
          });
          // && !employeeInCurrentPJ
          if (!checkDuplicate && !checkCTNhanDieuChuyenCoCTDieuChuyen && !employeeInCurrentPJ) {
            // console.log('check ', `${r.employeeCode}-${r.employeeName}`, check);
            _data.push(temp);
          }
        }
      });
    }
    setData(_data);
  }, [employeeProjects, reportsByStartEndDate, projectMembers]);

  return (
    <>
      <PersonnelTransferHeader />
      <TableCustom dataSource={Data} columnsConfig={columnsConfig} />
    </>
  );
};

export default PersonnelTransfer;
