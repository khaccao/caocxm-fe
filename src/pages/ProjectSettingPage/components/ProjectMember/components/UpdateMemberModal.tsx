import React from 'react';

import { Form, Input, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { EditProjectMemberModalName } from '@/common/define';
import { UpdateProjectMember } from '@/services/ProjectService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible, hideModal } from '@/store/modal';
import { getProjectRoles, getProjectSelectedMember, projectActions } from '@/store/project';

export const UpdateMemberModal = () => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const open = useAppSelector(getModalVisible(EditProjectMemberModalName));
  const selectedMember = useAppSelector(getProjectSelectedMember());
  const roles = useAppSelector(getProjectRoles());
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    dispatch(hideModal({ key: EditProjectMemberModalName }));
  };

  const handleUpdateMember = (values: any) => {
    if (!selectedMember) {
      return;
    }
    const input: UpdateProjectMember = {
      ...selectedMember,
      ...values,
      projectRoleIds: values.roles,
    };
    dispatch(projectActions.updateProjectMemberRequest({ employeeId: selectedMember.employeeId, member: input }));
  };

  return (
    <Modal
      open={open}
      title={t('projectSetting.projectMember.modalUpdateMember.title')}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('projectSetting.projectMember.modalUpdateMember.okText')}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...selectedMember, roles: selectedMember?.roleReadDTOs?.map(x => x.id) }}
        onFinish={handleUpdateMember}
      >
        <Form.Item style={{ marginBottom: 0 }}>
          <Form.Item
            name={'code'}
            label={t('projectSetting.projectMember.table.memberId')}
            style={{ display: 'inline-block', width: 'calc(30% - 5px)' }}
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name={'name'}
            label={t('projectSetting.projectMember.table.memberName')}
            style={{ display: 'inline-block', width: 'calc(70% - 0px)', marginLeft: 5 }}
          >
            <Input readOnly />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="roles"
          label={t('projectSetting.projectMember.modalUpdateMember.role')}
          rules={[{ required: true, message: t('Please input roles') }]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            options={roles?.results?.map(x => ({ value: x.id, label: x.name }))}
          />
        </Form.Item>
        <Form.Item name="note" label={t('projectSetting.projectMember.modalUpdateMember.note')}>
          <Input.TextArea placeholder={t('projectSetting.projectMember.modalUpdateMember.notePlaceholder')} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
