import React, { useEffect, useMemo } from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, PaginationProps, Space, Table, TableProps, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { UpdateMemberModal } from './UpdateMemberModal';
import { EditProjectMemberModalName, GettingProjectMembers, SavingProject, largePagingParams } from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { ProjectMemberResponse } from '@/services/ProjectService';
import { ProjectCheckInMemberStatus } from '@/services/CheckInService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getProjectMembers, getProjectQueryParams, getSelectedProject, projectActions } from '@/store/project';

interface ProjectMemberTableProps {
  checkInMembers: ProjectCheckInMemberStatus[];
  isLoadingCheckInMembers: boolean;
}

type ProjectMemberTableRow = ProjectMemberResponse & {
  checkInOnly?: boolean;
};

export const ProjectMemberTable = ({
  checkInMembers,
  isLoadingCheckInMembers,
}: ProjectMemberTableProps) => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const windowSize = useWindowSize();
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const queryParams = useAppSelector(getProjectQueryParams());
  const isLoading = useAppSelector(getLoading(GettingProjectMembers));
  const isSaving = useAppSelector(getLoading(SavingProject));
  const openUpdateMemberModal = useAppSelector(getModalVisible(EditProjectMemberModalName));

  const editGranted = usePermission(['CaiDat.ThanhVien.Edit']);
  const deleteGranted = usePermission(['CaiDat.ThanhVien.Delete']);

  const tableData = useMemo<ProjectMemberTableRow[]>(() => {
    const projectRows: ProjectMemberTableRow[] = projectMembers?.results || [];
    const projectEmployeeIds = new Set(projectRows.map(member => member.employeeId));
    const projectEmployeeCodes = new Set(
      projectRows
        .map(member => `${member.code || ''}`.trim().toLocaleLowerCase('vi'))
        .filter(Boolean),
    );
    const checkInEmployeeIds = new Set<number>();
    const checkInTeamsByEmployeeId = new Map<number, ProjectCheckInMemberStatus[]>();

    checkInMembers.forEach(member => {
      const memberships = checkInTeamsByEmployeeId.get(member.employeeId) || [];
      memberships.push(member);
      checkInTeamsByEmployeeId.set(member.employeeId, memberships);
    });

    const checkInOnlyRows = checkInMembers.reduce<ProjectMemberTableRow[]>((rows, member) => {
      const employeeCode = `${member.employeeCode || ''}`.trim().toLocaleLowerCase('vi');
      if (
        projectEmployeeIds.has(member.employeeId)
        || (employeeCode && projectEmployeeCodes.has(employeeCode))
        || checkInEmployeeIds.has(member.employeeId)
      ) {
        return rows;
      }

      checkInEmployeeIds.add(member.employeeId);
      rows.push({
        id: 0,
        projectId: selectedProject?.id || 0,
        employeeId: member.employeeId,
        employeeCode: Number(member.employeeCode) || 0,
        name: member.name,
        code: member.employeeCode,
        role: 0,
        roleName: member.jobTitle || '',
        status: 0,
        phone: '',
        email: '',
        note: '',
        startTime: '',
        endTime: '',
        createTime: '',
        roleReadDTOs: member.jobTitle
          ? [{
              id: 0,
              name: member.jobTitle,
              companyId: 0,
              type: 0,
              description: '',
              status: 0,
            }]
          : [],
        teamReadDTO: (checkInTeamsByEmployeeId.get(member.employeeId) || []).map(membership => ({
          id: membership.teamId,
          companyId: 0,
          projectId: selectedProject?.id || 0,
          name: membership.teamName,
          note: '',
          code: '',
          status: 1,
          leader_Id: 0,
          referenceFaceCKId: '',
        })),
        checkInOnly: true,
      });

      return rows;
    }, []);

    const search = `${queryParams?.search || ''}`.trim().toLocaleLowerCase('vi');
    const rows = [...projectRows, ...checkInOnlyRows];
    if (!search) {
      return rows;
    }

    return rows.filter(member =>
      `${member.code || ''}`.toLocaleLowerCase('vi').includes(search)
      || `${member.name || ''}`.toLocaleLowerCase('vi').includes(search),
    );
  }, [checkInMembers, projectMembers, queryParams?.search, selectedProject?.id]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(
        projectActions.getProjectMembersRequest({
          projectId: selectedProject.id,
          queryParams: { ...queryParams, ...largePagingParams, search: queryParams?.search },
        }),
      );
      return;
    }
    dispatch(projectActions.setProjectMembers(undefined));
    // eslint-disable-next-line
  }, [selectedProject]);

  const showUpdateMemberModal = (member: ProjectMemberTableRow) => {
    if (member.checkInOnly) {
      return;
    }
    dispatch(projectActions.setSelectedMember(member));
    dispatch(showModal({ key: EditProjectMemberModalName }));
  };

  const confirmRemoveMember = (member: ProjectMemberTableRow) => {
    if (member.checkInOnly) {
      return;
    }
    Modal.confirm({
      title: t('projectSetting.projectMember.table.action.deleteTitle'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('projectSetting.projectMember.table.action.deleteDescription', {
              mem: `"<strong>${member.name}</strong>"`,
            }),
          }}
        />
      ),
      onOk: close => {
        handleDeleteMember(member);
        close();
      },
      closable: true,
    });
  };

  const handleDeleteMember = (record: ProjectMemberResponse) => {
    dispatch(projectActions.removeProjectMemberRequest({ employeeId: record.employeeId }));
  };

  const columns: TableProps<ProjectMemberTableRow>['columns'] = [
    {
      title: t('projectSetting.projectMember.table.memberId'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: t('projectSetting.projectMember.table.memberName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('projectSetting.projectMember.table.role'),
      dataIndex: 'roleName',
      key: 'roleName',
      render: (value, record) => {
        return record.roleReadDTOs?.map(x => x.name).join(', ');
      },
    },
    {
      title: t('projectSetting.projectMember.table.team'),
      dataIndex: 'team',
      key: 'team',
      render: (value, record) => {
        return record.teamReadDTO?.map(x => x.name).join(', ');
      },
    },
    {
      title: t('projectSetting.projectMember.table.note'),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Chấm công',
      key: 'checkInStatus',
      width: 210,
      render: (_, record) => {
        const recordCode = `${record.code || ''}`.trim().toLocaleLowerCase('vi');
        const memberships = checkInMembers.filter(x =>
          x.employeeId === record.employeeId
          || (
            Boolean(recordCode)
            && `${x.employeeCode || ''}`.trim().toLocaleLowerCase('vi') === recordCode
          ),
        );
        const teamNames = memberships.map(x => x.teamName).join(', ');
        if (memberships.length === 0) {
          return <Tag>Chưa thiết lập</Tag>;
        }

        return (
          <Space size={4} wrap>
            <Tooltip title={`Đã gắn tổ đội chấm công: ${teamNames}`}>
              <Tag color="success">Đã thiết lập</Tag>
            </Tooltip>
            {record.checkInOnly && (
              <Tooltip title="Nhân sự có trong hệ thống Check-in nhưng chưa có trong danh sách thành viên dự án do CXM trả về">
                <Tag color="gold">Chưa thuộc dự án CXM</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('Edit')}>
            <Button
              size="small"
              disabled={!editGranted || record.checkInOnly}
              style={{ color: 'rgba(0, 155, 235, 1)' }}
              type="text"
              icon={<EditOutlined />}
              onClick={() => showUpdateMemberModal(record)}
            />
          </Tooltip>
          <Tooltip title={t('Remove member')}>
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              type="text"
              disabled={!deleteGranted || record.checkInOnly}
              onClick={() => confirmRemoveMember(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEmpTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const params = { ...queryParams, page: current, pageSize };
    dispatch(projectActions.setQueryParams(params));
    dispatch(projectActions.getProjectMembersRequest({ projectId: selectedProject?.id, queryParams: params }));
  };

  // eslint-disable-next-line
  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('pagingTotal', { range1: range[0], range2: range[1], total });

  return (
    <div style={{}}>
      <Table
        rowKey={record => record.employeeId}
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: queryParams?.page,
          pageSize: queryParams?.pageSize,
          total: tableData.length,
          showTotal: showTotal,
          showSizeChanger: true,
        }}
        // pagination={false}
        size="small"
        style={{ width: '100%' }}
        scroll={{ x: 1000, y: windowSize[1] - 260 }}
        onChange={handleEmpTableChange}
        loading={isLoading || isSaving || isLoadingCheckInMembers}
      />
      {openUpdateMemberModal && <UpdateMemberModal />}
    </div>
  );
};
