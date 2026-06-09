import React, { useEffect } from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, PaginationProps, Space, Table, TableProps, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { UpdateMemberModal } from './UpdateMemberModal';
import { EditProjectMemberModalName, GettingProjectMembers, SavingProject, largePagingParams } from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { ProjectMemberResponse } from '@/services/ProjectService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getProjectMembers, getProjectQueryParams, getSelectedProject, projectActions } from '@/store/project';

export const ProjectMemberTable = () => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const windowSize = useWindowSize();
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const queryParams = useAppSelector(getProjectQueryParams());
  const isLoading = useAppSelector(getLoading(GettingProjectMembers));
  const isSaving = useAppSelector(getLoading(SavingProject));
  const openUpdateMemberModal = useAppSelector(getModalVisible(EditProjectMemberModalName));

  const editGranted = usePermission(['CaiDat.ThanhVien.Delete']);
  const deleteGranted = usePermission(['CaiDat.ThanhVien.Edit']);

  useEffect(() => {
    if (selectedProject) {
      dispatch(
        projectActions.getProjectMembersRequest({
          projectId: selectedProject.id,
          queryParams: { ...queryParams, ...largePagingParams },
        }),
      );
      return;
    }
    dispatch(projectActions.setProjectMembers(undefined));
    // eslint-disable-next-line
  }, [selectedProject]);

  const showUpdateMemberModal = (member: ProjectMemberResponse) => {
    dispatch(projectActions.setSelectedMember(member));
    dispatch(showModal({ key: EditProjectMemberModalName }));
  };

  const confirmRemoveMember = (member: ProjectMemberResponse) => {
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

  const columns: TableProps<ProjectMemberResponse>['columns'] = [
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
      title: '',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('Edit')}>
            <Button
              size="small"
              disabled={!editGranted}
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
              disabled={!deleteGranted}
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
        dataSource={projectMembers?.results || []}
        pagination={{
          current: queryParams?.page,
          pageSize: queryParams?.pageSize,
          total: projectMembers?.queryCount || 0,
          showTotal: showTotal,
          showSizeChanger: true,
        }}
        // pagination={false}
        size="small"
        style={{ width: '100%' }}
        scroll={{ x: 1000, y: windowSize[1] - 260 }}
        onChange={handleEmpTableChange}
        loading={isLoading || isSaving}
      />
      {openUpdateMemberModal && <UpdateMemberModal />}
    </div>
  );
};
