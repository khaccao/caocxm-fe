import React from 'react';

import { Table, TableProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { ProjectEmployeeWithRoles } from '@/common/project';
import { useAppSelector } from '@/store/hooks';
import { getEmployeesByCompanyId, getProjectMemberList, getRolesByCompanyId } from '@/store/project';

export const ProjectMember = () => {
  const { t } = useTranslation(['projects']);

  const employeesByCompanyId = useAppSelector(getEmployeesByCompanyId());
  const rolesByCompanyId = useAppSelector(getRolesByCompanyId());
  const projectMemberList = useAppSelector(getProjectMemberList());

  const columns: TableProps<ProjectEmployeeWithRoles>['columns'] = [
    {
      title: t('createProject.projectMember.table.name'),
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 200,
      render: (_, record) => {
        const selectedEmployee = employeesByCompanyId.find(employee => employee.id === record.employeeId);
        const lastName = selectedEmployee?.lastName ?? '';
        const middleName = selectedEmployee?.middleName ?? '';
        const firstName = selectedEmployee?.firstName ?? '';
        return (
          <Typography.Text>
            {lastName + ' ' + middleName + ' ' + firstName}
          </Typography.Text>
        );
      },
    },
    {
      title: t('createProject.projectMember.table.role'),
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (_, record) => {
        // [11/24/2024] [#20953] fix bug undefine.
        const filteredRole = rolesByCompanyId?.filter(role => record?.roles?.includes(role.id));
        if (filteredRole?.length > 0) {
          let roleNameList = filteredRole.map(obj => obj['name']);
          return <Typography.Text>{roleNameList.join(', ')}</Typography.Text>;
        }
        return null;
      },
    },
  ];

  return (
    <div className={styles.informationContainer}>
      <Typography.Text style={{ fontWeight: '700', fontSize: '18px' }}>{`${t('createProject.projectMember.title')} (${
        projectMemberList.length
      })`}</Typography.Text>
      <Table
        dataSource={projectMemberList}
        rowKey={'employeeId'}
        columns={columns}
        pagination={{ pageSize: 5 }}
        size="small"
        scroll={{ x: 300, y: 300 }}
        style={{ width: '100%', height: '100%' }}
        onHeaderRow={()=> {
          return {
            style: {backgroundColor: '#f0f0f0'}
          }
        }}
      />
    </div>
  );
};
