import { Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { documentProject, labelProject } from '@/common/define';
import { documentActions, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, hideModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';

export const CreateUploadFolderModal = () => {
  const { t } = useTranslation('document');
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const documentPath = useAppSelector(getPathDocument());
  const folderRootId = useAppSelector(getFolderRootId());
  const isModalOpen = useAppSelector(getModalVisible(documentProject.CreateUpdateFolderModalName));
  const folderCreating = useAppSelector(getLoading(labelProject.SavingLabel));

  const lastPath = documentPath[(documentPath?.length || 1) - 1];

  const handleOk = () => {
    form.submit();
  };
  const handleCancel = () => {
    dispatch(hideModal({ key: documentProject.CreateUpdateFolderModalName }));
  };
  // [#20508][dung_lt][24/10/2024] -gọi api tạo folder cho tài liệu.
  const handleSaveFolder = (values: any) => {
    if (selectedProject) {
      if (!documentPath.length) {
        dispatch(
          documentActions.createLabelRequest({
            label: {
              ...values,
              type: 'folder',
              parentId: folderRootId,
            },
            projectId: selectedProject.id,
          }),
        );
      } else {
        dispatch(
          documentActions.createLabelRequest({
            label: {
              ...values,
              type: 'folder',
              parentId: lastPath?.id || undefined,
            },
            projectId: selectedProject.id,
          }),
        );
      }
    }
  };

  return (
    <Modal
      title={t('New folder')}
      confirmLoading={folderCreating}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: 'Untitled',
        }}
        onFinish={handleSaveFolder}
      >
        <Form.Item name={'name'}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
