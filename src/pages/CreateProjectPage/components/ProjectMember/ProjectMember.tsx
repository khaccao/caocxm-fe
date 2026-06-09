import React from 'react';

import { ArrowLeftOutlined, RocketOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, TableProps, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './ProjectMember.module.less';
import { colors } from '@/common/colors';
import { AddMemberToProjectModalName, FormatDateAPI } from '@/common/define';
import { CreateFolderRootProject, CreateProjectData, ProjectEmployeeWithRoles } from '@/common/project';
import { AddMemberToProject } from '@/pages/ProjectSettingPage/components/ProjectMember/AddMemberToProject';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible, showModal } from '@/store/modal';
import {
  getCreateProjectInformationValue,
  getProjectAvatar,
  getProjectMemberList,
  getRolesByCompanyId,
  projectActions,
} from '@/store/project';

export const ProjectMember = () => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const rolesByCompanyId = useAppSelector(getRolesByCompanyId());
  const projectMemberList = useAppSelector(getProjectMemberList());
  const company = useAppSelector(getCurrentCompany());
  const isAddMemberModalOpen = useAppSelector(getModalVisible(AddMemberToProjectModalName));
  const createProjectInformationValue = useAppSelector(getCreateProjectInformationValue());
  const projectAvatar = useAppSelector(getProjectAvatar());

  const handleDeleteMember = (projectMember: ProjectEmployeeWithRoles) => {
    const selectedMemberIndex = projectMemberList.findIndex(mem => mem.employeeId === projectMember.employeeId);
    const deepCloneProjectMemberList = [...projectMemberList];
    deepCloneProjectMemberList.splice(selectedMemberIndex, 1);
    dispatch(projectActions.setProjectMemberList(deepCloneProjectMemberList));
  };

  const columns: TableProps<ProjectEmployeeWithRoles>['columns'] = [
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
      title: t('createProject.projectMember.table.role'),
      dataIndex: 'roles',
      key: 'roles',
      render: (_, record) => {
        const filteredRole = rolesByCompanyId?.filter(role => record?.roles?.includes(role?.id));
        if (filteredRole?.length > 0) {
          let roleNameList = filteredRole.map(obj => obj['name']);
          return <Typography.Text>{roleNameList.join(', ')}</Typography.Text>;
        }
        return null;
      },
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('Remove member')}>
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              type="text"
              onClick={() => confirmRemoveMember(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const confirmRemoveMember = (member: any) => {
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

  const handleFinish = () => {
    if (createProjectInformationValue) {
      // [09/11/2024][#20629][phuong_td] bổ xung startTime và endTime cho ProjectEmployee
      const startDate = createProjectInformationValue.projectStartDate
        ? dayjs(createProjectInformationValue.projectStartDate).format(FormatDateAPI)
        : '';
      const endDate = createProjectInformationValue.projectEndDate
        ? dayjs(createProjectInformationValue.projectEndDate).format(FormatDateAPI)
        : '';
      const data: CreateProjectData = {
        companyId: company.id,
        name: createProjectInformationValue.projectName,
        code: createProjectInformationValue.projectCode,
        startDate,
        endDate,
        address: createProjectInformationValue.address,
        description: createProjectInformationValue.description,
        avatar: projectAvatar,
        ownerName: createProjectInformationValue.investorName,
        ownerPhone: createProjectInformationValue.investorPhone,
        ownerEmail: createProjectInformationValue.investorEmail,
        // [10/11/2024][phuong_td] bổ xung createTime
        project_Employees: projectMemberList.map(e => ({
          ...e,
          startTime: startDate,
          endTime: endDate,
          createTime: dayjs().format(FormatDateAPI),
        })),
        status: createProjectInformationValue.status,
      };
      dispatch(
        projectActions.createProjectRequest({ data, warehouses: createProjectInformationValue?.warehouses || [] }),
      );
    }
  };

  const handlePrevious = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
  };

  const showAddMemberModal = () => {
    dispatch(showModal({ key: AddMemberToProjectModalName }));
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.addMemberContainer}>
        <div className={styles.header}>
          <Typography.Text style={{ fontWeight: '700', fontSize: '18px' }}>
            {`${t('createProject.projectMember.title')} (${projectMemberList.length})`}
          </Typography.Text>
          <div className={styles.headerRight}>
            <Button
              size="middle"
              type="text"
              icon={<PlusCircleOutlined />}
              onClick={showAddMemberModal}
              style={{ color: colors.primary }}
            >
              {t('createProject.projectMember.addMember')}
            </Button>
          </div>
        </div>
        <Table
          dataSource={projectMemberList}
          rowKey={'employeeId'}
          columns={columns}
          pagination={{ pageSize: 5 }}
          size="small"
          scroll={{ x: 500, y: 300 }}
        />
        <div className={styles.buttonContainer}>
          <Button onClick={handlePrevious} className={styles.buttonWithIcon}>
            <ArrowLeftOutlined />
            {t('createProject.back')}
          </Button>
          <Button type="primary" size="large" style={{ borderRadius: '20px' }} onClick={handleFinish}>
            {t('createProject.finish')}
            <RocketOutlined />
          </Button>
        </div>
      </div>
      {isAddMemberModalOpen && <AddMemberToProject />}
    </div>
  );
};
