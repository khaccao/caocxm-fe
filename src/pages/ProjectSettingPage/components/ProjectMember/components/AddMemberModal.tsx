import React, { ReactNode, useState } from 'react';

import { Button, Checkbox, Col, Input, Modal, Row, Typography } from 'antd';
import { SearchProps } from 'antd/es/input';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { CheckboxValueType, ProjectMemberType } from '@/common/define';
import { memberList, roleList } from '@/datafaker/modalData';
import { useAppSelector } from '@/store/hooks';
import { getProjectMemberList } from '@/store/project';

const { Search } = Input;

type Props = {
  title: ReactNode;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
};

export const AddMemberModal = ({ title, open, onOk, onCancel }: Props) => {
  const { t } = useTranslation(['projects']);

  const projectMemberList = useAppSelector(getProjectMemberList())

  const [selectedMember, setSelectedMember] = useState<CheckboxValueType[]>([]);
  const [role, setRole] = useState<CheckboxValueType[]>([]);

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

  const onChangeMember = (checkedValues: CheckboxValueType[]) => {
    setSelectedMember(checkedValues);
  };

  const onChangeRole = (checkedValues: CheckboxValueType[]) => {
    setRole(checkedValues);
  };

  const handleOk = () => {
    const filteredList = memberList.filter((mem) => selectedMember.some(member => member === mem.label))
    const currentProjectMem: ProjectMemberType[] = filteredList.map(mem => {
      return {
        key: mem.key,
        name: mem.value,
        role: role as string[]
      }
    })
    const newProjectMemberList = [...projectMemberList,...currentProjectMem]
    console.log(newProjectMemberList,'newProjectMemberList');
    // dispatch(projectActions.setProjectMemberList(newProjectMemberList))
    onOk();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      width={1000}
      title={title}
      open={open}
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
        <Col span={24} className={styles.modalMainContainer}>
          <div className={styles.modalHeaderContainer}>
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
              {/* {memberList.filter(mem => !projectMemberList.some(projectMem => projectMem.id === mem.key)).map(member => {
                return (
                  <Col span={24} sm={6} key={member.key}>
                    <Checkbox value={member.value}>{member.label}</Checkbox>
                  </Col>
                );
              })} */}
            </Row>
          </Checkbox.Group>
        </Col>
        <Col span={24} className={styles.modalMainContainer}>
          <div className={styles.modalHeaderContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>
              {t('createProject.projectMember.modal.roleList')}
            </Typography.Text>
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChangeRole}>
            <Row gutter={[16, 16]}>
              {roleList.map(member => {
                return (
                  <Col span={24} sm={6} key={member.key}>
                    <Checkbox value={member.value}>{member.label}</Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
        </Col>
      </Row>
    </Modal>
  );
};
