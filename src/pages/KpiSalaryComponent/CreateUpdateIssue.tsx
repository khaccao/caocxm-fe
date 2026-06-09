import { useEffect, useRef, useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined, DeleteOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Modal, Form, Input, Row, Typography, Upload, Button, Space, Tooltip, Col } from 'antd';
import dayjs from 'dayjs';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import { CreateUpdateIssueModalName } from '@/common/define';
import { CreateFolderRootProject } from '@/common/project';
import { IssuesResponse } from '@/services/IssueService';
import { UpdateLable } from '@/services/ProjectService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedIssue, issueActions, getEditIssuePublic, getFileAttachmenForIssue, getLabelEdit } from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';
import { getlistFileRootsEdit, getSelectedProject, projectActions } from '@/store/project';

export const CreateUpdateIssue = ({ labelid }: any) => {
  const { t } = useTranslation('kpiSalary');

  const [form] = Form.useForm();

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(CreateUpdateIssueModalName));
  const selectedIssue: any = useAppSelector(getLabelEdit());
  const selectedProject = useAppSelector(getSelectedProject());
  const isEditPublic = useAppSelector(getEditIssuePublic());
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const [formFileData, setFormFileData] = useState<any>(null);
  const [listFileRemove, setListFileRemove] = useState<any[]>([]);
  const company = useAppSelector(getCurrentCompany());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const listFileRootsEdit: any = useAppSelector(getlistFileRootsEdit());


  const handleUploadChange = (info: any) => {
    const { status, fileList } = info;
    const formData = new FormData();
    fileList.forEach((file: any) => {
      if (file || file.originFileObj) {
        formData.append('iFiles', file.originFileObj || (file as File));
      }
    });
    setFormFileData(formData);
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    fileList,
    name: 'file',
    multiple: true,
    onChange: handleUploadChange,
    showUploadList: false,
  };

  const removefile = (file: UploadFile<any> | any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    setListFileRemove((prevList: any) => [...prevList, file?.id]);
  };

  const handleDownload = (file: any) => {
    dispatch(issueActions.downloadFileAttachmentOfIssue({id: file.id, fileName: file.name }));
  }

  const confirmRemoveIssue = (value: any) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t(`${t('You want save change')}`, {
              name: `<strong></strong>`,
            }),
          }}
        />
      ),
      closable: true,
      maskClosable: true,
      onOk: close => {
        handleSaveIssue(value)
        close();
      },
    });
  };

  useEffect(() => {
    if (selectedIssue && selectedIssue.documentChildren) {
      setFileList(selectedIssue.documentChildren);
      form.setFieldsValue({
        subject: selectedIssue?.name,
      });
    } else {
      setFileList([])
      form.resetFields()
    } 
    if (!isEditPublic) {
      setFileList([])
      form.resetFields()
    }
  }, [selectedIssue, isEditPublic]);

  useEffect(() => {
    if (listFileRootsEdit && listFileRootsEdit.results.lenght > 0 && isEditPublic) {
      setFileList(listFileRootsEdit.results);
    }
  }, [isEditPublic, listFileRootsEdit]);

  const handleSaveIssue = (values: any) => {
    const bodyData: CreateFolderRootProject = {
      name: values.name || values.subject,
      type: 'ungluongItem',
      parentId: labelid,
    };
    let inputData: UpdateLable = {
      name: values.subject || selectedIssue.name,
      color: "",
      type: "",
      labelCode: ""
    };
    if (selectedProject) {
      if (selectedIssue && isEditPublic) {
        if (listFileRemove && listFileRemove.length > 0) {
          dispatch(issueActions.removeFileFolder({documentIds: listFileRemove}))
        }
        dispatch(
          projectActions.updateLabel({idLabel: selectedIssue.id, inputData: inputData, parentId: labelid}),
        );
        const fileChanges = fileList.filter((file: any) => !file.hasOwnProperty('id'))
        if (fileList && fileList.length > 0 && fileChanges.length > 0) {
          dispatch(issueActions.uploadFileForFolder({companyId: company.id , labelid: selectedIssue.id, files: formFileData, isUpdate: true}))
        }
        dispatch(hideModal({ key: CreateUpdateIssueModalName }));
        return;
      }
      dispatch(projectActions.CreateLabel({projectId: selectedProject?.id, bodyData, files: formFileData, companyId: company.id, parentId: labelid}));
      dispatch(hideModal({ key: CreateUpdateIssueModalName }));
    } else {
      if (isEditPublic) {
        if (listFileRemove && listFileRemove.length > 0) {
          dispatch(issueActions.removeFileFolder({documentIds: listFileRemove}))
        }
        dispatch(
          projectActions.updateLabel({idLabel: selectedIssue.id, inputData: inputData, parentId: labelid}),
        );
        const fileChanges = fileList.filter((file: any) => !file.hasOwnProperty('id'))
        if (fileList && fileList.length > 0 && fileChanges.length > 0) {
          dispatch(issueActions.uploadFileForFolder({companyId: company.id , labelid: selectedIssue.id, files: formFileData, isUpdate: true}))
        }
        dispatch(hideModal({ key: CreateUpdateIssueModalName }));
        return;
      }
      dispatch(projectActions.CreateLabel({projectId: -1, bodyData, files: formFileData, companyId: company.id, parentId: labelid}));
      dispatch(hideModal({ key: CreateUpdateIssueModalName }));
    }
  };

  const handleCancel = () => {
    dispatch(issueActions.setSelectedIssue(undefined));
    dispatch(hideModal({ key: 'CreateUpdateIssueModal' }));
  };

  const handleOk = () => form.submit();

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <Modal
      title={
        <div
          style={{
            width: '100%',
            cursor: 'move',
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {selectedIssue && isEditPublic ? t('Edit') : t('New')}
        </div>
      }
      className="custom-modal-scrollbar"
      centered
      open={isModalOpen}
      style={{ width: '580px', ...{ important: 'true' } }}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('Save')}
      footer={(_, { OkBtn, CancelBtn }) =>
        selectedIssue ? (
          <Row style={{ margin: 0 }} align="stretch">
            <Space style={{ flex: 1 }}>
              <Button
                key="remove"
                type="primary"
                danger
                style={{ display: 'none' }}
              >
                {t('Remove')}
              </Button>
            </Space>
            <Space>
              <CancelBtn />
              <OkBtn />
            </Space>
          </Row>
        ) : (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )
      }
      modalRender={modal => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event: any, uiData: any) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={isEditPublic ? confirmRemoveIssue : handleSaveIssue}
        autoComplete="off"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label={t('Tên File')}
              name="subject"
              rules={[{ required: true, message: t('Please input name!') }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Form.Item label={t('Nội dung file')} name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col> */}
        </Row>
        <Form.Item style={{ marginBottom: 0 }}>
          <Row align="stretch" style={{ margin: 0 }}>
            <Typography.Text style={{ flex: 1 }} className="ant-form-item-label">
              {t('Attachments')}
            </Typography.Text>
            <Upload {...uploadProps}>
              <Button type="link" icon={<CloudUploadOutlined />} style={{ padding: 0 }}>
                {t('Click to Upload')}
              </Button>
            </Upload>
          </Row>
          {fileList?.length > 0 && (
            <div style={{ border: '1px solid #D9D9D9', padding: 10, borderRadius: 8 }}>
              {fileList.map((f: any) => (
                <Row key={f.uid ? f.uid : f?.id} style={{ margin: "-5px" }} className="app-upload-list-item">
                  <Space style={{ flex: 1 }}>
                    <PaperClipOutlined />
                    <span>{f.name ? f.name : f.fileName}</span>
                  </Space>
                  {f.id && (
                    <Tooltip title={t('Lưu file')}>
                      <ArrowDownOutlined
                        role="button"
                        style={{ cursor: 'pointer', color: colors.primary }}
                        onClick={() => handleDownload(f)}
                      />
                    </Tooltip>
                  )}
                  <div style={{ marginLeft: '5px' }}></div>
                  <Tooltip title={t('Remove file')}>
                    <DeleteOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => removefile(f)}
                    />
                  </Tooltip>
                </Row>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
