import React, { useState } from 'react';

import { Button, Checkbox, Col, Input, Modal, Row, Typography } from 'antd';
import { SearchProps } from 'antd/es/input';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { CheckboxValueType } from '@/common/define';
import { memberList, roleList } from '@/datafaker/modalData';
import { ProjectMemberList } from '@/datafaker/projectMemberList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible, hideModal } from '@/store/modal';

const { Search } = Input;

export const AddMemberModal = () => {
  const { t } = useTranslation(['team']);

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible('AddMemberModal'));

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
    console.log(selectedMember, 'selectedMember');
    console.log(role, 'role');
    dispatch(hideModal({ key: 'AddMemberModal' }));
  };

  const handleCancel = () => {
    dispatch(hideModal({ key: 'AddMemberModal' }));
  };

  return (
    <Modal
      width={1000}
      title={t('teamManage.addMemberModal.title')}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel} style={{ borderRadius: '20px' }}>
          {t('teamManage.addMemberModal.cancelText')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} style={{ borderRadius: '20px' }}>
          {t('teamManage.addMemberModal.okText')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Row gutter={[0, 16]}>
        <Col span={24} className={styles.addMemberContainer}>
          <div className={styles.addMemberheaderContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>{t('teamManage.addMemberModal.memberList')}</Typography.Text>
            <Search
              placeholder={t('Tìm thành viên')}
              onSearch={onSearch}
              style={{ width: 200, borderRadius: '10px' }}
            />
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChangeMember}>
            <Row gutter={[16, 16]}>
              {memberList
                .filter(mem => !ProjectMemberList.some(projectMem => projectMem.key === mem.key))
                .map(member => {
                  return (
                    <Col span={24} sm={6} key={member.key}>
                      <Checkbox value={member.value}>{member.label}</Checkbox>
                    </Col>
                  );
                })}
            </Row>
          </Checkbox.Group>
        </Col>
        <Col span={24} className={styles.addMemberContainer}>
          <div className={styles.addMemberheaderContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>{t('teamManage.addMemberModal.roleList')}</Typography.Text>
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
