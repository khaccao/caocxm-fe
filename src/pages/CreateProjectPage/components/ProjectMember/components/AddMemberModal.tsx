import React, { useEffect, useState } from 'react';

import { Button, Checkbox, Col, Input, Modal, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { EmployeesByCompanyId } from '@/common/project';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible, hideModal } from '@/store/modal';
import { getEmployeesByCompanyId, getProjectMemberList, getRolesByCompanyId, projectActions } from '@/store/project';
import { CheckboxValueType } from '@/common/define';

const { Search } = Input;

export const AddMemberModal = () => {
  const { t } = useTranslation(['projects']);

  const dispatch = useAppDispatch();

  const projectMemberList = useAppSelector(getProjectMemberList());
  const isAddMemberModalOpen = useAppSelector(getModalVisible('AddMemberModal'));
  const employeesByCompanyId = useAppSelector(getEmployeesByCompanyId());
  const rolesByCompanyId = useAppSelector(getRolesByCompanyId());

  const [selectedMember, setSelectedMember] = useState<CheckboxValueType[]>([]);
  const [role, setRole] = useState<CheckboxValueType[]>([]);
  const [employeeList, setEmployeeList] = useState<EmployeesByCompanyId[]>([]);

  const onSearch = (value: string) => {
    if (value) {
      const filteredEmployee = employeeList.filter(employee => {
        const employeeLastName = employee.lastName.toLowerCase();
        const employeeMiddlname = employee.middleName.toLowerCase();
        const employeeFirstName = employee.firstName.toLowerCase();

        const empName = employeeLastName + employeeMiddlname + employeeFirstName;

        return empName.includes(value.toLowerCase());
      });
      setEmployeeList(filteredEmployee);
    } else {
      const filteredUnselectedEmployee = employeesByCompanyId.filter(
        employee => !projectMemberList.some(member => member.employeeId === employee.id),
      );
      setEmployeeList(filteredUnselectedEmployee);
    }
  };

  const onChangeMember = (checkedValues: CheckboxValueType[]) => {
    setSelectedMember(checkedValues);
  };

  const onChangeRole = (checkedValues: CheckboxValueType[]) => {
    setRole(checkedValues);
  };

  const handleOk = () => {
    const filteredList = employeeList.filter(employee => selectedMember.some(member => member === employee.id));
    const currentProjectMem: any[] = filteredList.map(mem => {
      return {
        employeeId: mem.id,
        name: `${mem.lastName}${mem.middleName}${mem.firstName}`,
        code: mem.employeeCode,
        status: mem.status,
        roles: role as string[],
      };
    });
    const newProjectMemberList = [...projectMemberList, ...currentProjectMem];
    dispatch(projectActions.setProjectMemberList(newProjectMemberList));
    dispatch(hideModal({ key: 'AddMemberModal' }));
  };

  const handleCancel = () => {
    dispatch(hideModal({ key: 'AddMemberModal' }));
  };

  useEffect(() => {
    const filteredUnselectedEmployee = employeesByCompanyId.filter(
      employee => !projectMemberList.some(member => member.employeeId === employee.id),
    );
    setEmployeeList(filteredUnselectedEmployee);
    // eslint-disable-next-line
  }, []);

  return (
    <Modal
      width={1000}
      title={t('createProject.projectMember.addMember')}
      open={isAddMemberModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel} style={{ borderRadius: '20px' }}>
          {t('createProject.projectMember.modal.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} style={{ borderRadius: '20px' }}>
          {t('createProject.projectMember.modal.add')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Row gutter={[0, 16]}>
        <Col span={24} className={styles.mainContainer}>
          <div className={styles.headerContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>
              {t('createProject.projectMember.modal.memberList')}
            </Typography.Text>
            <Search
              placeholder={t('createProject.projectMember.modal.searchMemberPlaceholder')}
              onSearch={onSearch}
              style={{ width: 200, borderRadius: '10px' }}
            />
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChangeMember}>
            <Row gutter={[16, 16]}>
              {employeeList && (
                <>
                  {employeeList.map(emp => {
                    return (
                      <Col span={24} sm={6} key={`empId_${emp.id}`}>
                        <Checkbox value={emp.id}>{`${emp.lastName} ${emp.middleName} ${emp.firstName}`}</Checkbox>
                      </Col>
                    );
                  })}
                </>
              )}
            </Row>
          </Checkbox.Group>
        </Col>
        <Col span={24} className={styles.mainContainer}>
          <div className={styles.headerContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>
              {t('createProject.projectMember.modal.roleList')}
            </Typography.Text>
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChangeRole}>
            <Row gutter={[16, 16]}>
              {rolesByCompanyId && (
                <>
                  {rolesByCompanyId.map(role => {
                    return (
                      <Col span={24} sm={6} key={`roleId_${role.id}`}>
                        <Checkbox value={role.id}>{role.name}</Checkbox>
                      </Col>
                    );
                  })}
                </>
              )}
            </Row>
          </Checkbox.Group>
        </Col>
      </Row>
    </Modal>
  );
};
