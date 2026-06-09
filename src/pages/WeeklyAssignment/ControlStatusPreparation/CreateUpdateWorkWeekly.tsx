import { useEffect, useState } from 'react';

import type { UploadFile, UploadProps } from 'antd';
import { Modal, Form, Input, Select, Row, Typography, Upload, Space, Col } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { CreateUpdateWorkWeeklyModalName, FormatDateAPI } from '@/common/define';
import { CheckItemsDTO, IssuesResponse } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedChecklistItem, getSelectedWorkWeekly, issueActions, getIssueIds, getSelectedChecklistsTeam } from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';
import { getProjectMembers, getSelectedProject } from '@/store/project';
import { getTeams } from '@/store/team';

export const CreateUpdateWorkWeekly = () => {
  const { t } = useTranslation('weeklyAssignment');
  const tCommon = useTranslation('common').t;
  const tStatus = useTranslation('status').t;

  const [form] = Form.useForm();

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(CreateUpdateWorkWeeklyModalName));
  // const selectedIssue = useAppSelector(getSelectedIssue());s
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const selectedWorkWeekly = useAppSelector(getSelectedWorkWeekly());
  const selectedChecklistItem = useAppSelector(getSelectedChecklistItem());
  const selectedChecklistsTeam = useAppSelector(getSelectedChecklistsTeam());
  const teams = useAppSelector(getTeams());
  const ids = useAppSelector(getIssueIds());

  useEffect(() => {
    dispatch(issueActions.getTeamsIdsByCheckItemIdRequest({id: selectedChecklistItem?.id}))
  }, [dispatch, selectedChecklistItem])

  useEffect(() => {
    console.log('selectedChecklistsTeam ', selectedChecklistsTeam);
  }, [selectedChecklistsTeam])

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { Dragger } = Upload;

  const propsDragger: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    showUploadList: false,
  };

  const removefile = (file: UploadFile<any>) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const handleSaveIssue = (values: any) => {
    if (selectedProject && projectMembers) {
      const team = teams.find((t)=> t.id === values.assignee);
      let teamOld = null;
      if (selectedChecklistsTeam && selectedChecklistsTeam.length) {
        const { length } = selectedChecklistsTeam;
        teamOld = teams.find((t)=> t.id === selectedChecklistsTeam[length-1] && t.id !== team?.id);
      }
      if (selectedChecklistItem) {
        const checkItem: CheckItemsDTO = {
          issueId: selectedChecklistItem.issueId,
          status: values.status,
          createdTime: selectedChecklistItem.createdTime,
          index: selectedChecklistItem.index,
          subject: values.subject,
          estimatedTime: selectedChecklistItem.estimatedTime,
          issue: ''
        }
        dispatch(
          issueActions.updateChecklistRequest({
            team,
            teamOld,
            issueId: selectedChecklistItem.id,
            issue: checkItem,
            ids
          }),
        );
        handleCancel();
        return;
      } else {
        const checkItem = {
          issueId: selectedWorkWeekly?.id,
          status: values.status,
          createdTime: dayjs().format(FormatDateAPI),
          index: 0,
          subject: values.subject,
          estimatedTime: 0,
        }
        
        dispatch(issueActions.createChecklistRequest({
          ids,
          issue: checkItem,
          team: team
        }));
      }
      handleCancel();
    }
  };

  const confirmRemoveIssue = (issue: IssuesResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('Confirm remove', {
              name: `<strong>"${issue.id}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      onOk: close => {
        handleRemoveIssue(issue.id);
        close();
      },
    });
  };

  const handleRemoveIssue = (issueId: number) => {
    if (selectedProject) {
      dispatch(issueActions.removeIssueRequest({ issueId, projectId: selectedProject.id }));
    }
  };

  const handleCancel = () => {
    dispatch(issueActions.setSelectedChecklistsTeam(undefined));
    dispatch(issueActions.setSelectedChecklistItem(undefined));
    dispatch(hideModal({ key: CreateUpdateWorkWeeklyModalName }));
  };

  const handleOk = () => form.submit();

  return (
    <Modal
      title={
        <Space direction={'vertical'}>
          <Typography.Text style={{ fontSize: '20px' }}>
            {selectedChecklistItem ? tCommon('Edit') : tCommon('New')}
          </Typography.Text>
          <Typography.Text>{selectedWorkWeekly?.subject}</Typography.Text>
        </Space>
      }
      centered
      open={isModalOpen}
      closable={false}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('Save')}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          selectedselectedWorkPrepare: selectedChecklistItem,
          subject: selectedChecklistItem && selectedChecklistItem.subject,
          status: selectedChecklistItem && selectedChecklistItem.status,
          assignee: selectedChecklistsTeam && selectedChecklistsTeam.length && selectedChecklistsTeam[selectedChecklistsTeam.length-1]
          // assignee:
            // selectedChecklistItem &&
            // selectedChecklistItem.assignedTo &&
            // selectedChecklistItem.assignedTo.employeeId,
        }}
        onFinish={handleSaveIssue}
        autoComplete="off"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label={t('Preparation content')}
              name="subject"
              rules={[{ required: true, message: t('Please input name!') }]}
            >
              <Input placeholder={t('Input preparation content')} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t('Person in charge')}
              name="assignee"
              rules={[{ required: true, message: t('Please input supervisor!') }]}
            >
              <Select
                placeholder={t('Choose the person in charge')}
                allowClear
                options={teams.map(x => ({ label: x.name, value: x.id}))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={tCommon('Status')} name="status">
              <Select
                allowClear
                value={0}
                options={[
                  {
                    value: 0,
                    label: <Typography.Text>{tStatus('Do not')}</Typography.Text>,
                  },
                  {
                    value: 1,
                    label: <Typography.Text>{tStatus('Complete')}</Typography.Text>,
                  },
                  {
                    value: 2,
                    label: <Typography.Text>{tStatus('No need')}</Typography.Text>,
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Form.Item style={{ marginBottom: 0 }}>
          <Row align="stretch" style={{ margin: 0 }}>
            <Space direction={'vertical'} style={{width: "100%"}}>
              <Typography.Text style={{ flex: 1 }} className="ant-form-item-label">
                {t('Upload Image')}
              </Typography.Text>
              <Dragger {...propsDragger}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-hint">{tCommon('Upload Title')}</p>
              </Dragger>
            </Space>
          </Row>
          {fileList.length > 0 && (
            <div style={{ border: '1px solid #D9D9D9', padding: 10, borderRadius: 8 }}>
              {fileList.map(f => (
                <Row key={f.uid} style={{ margin: 0 }} className="app-upload-list-item">
                  <Space style={{ flex: 1 }}>
                    <PaperClipOutlined />
                    <span>{f.name}</span>
                  </Space>
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
        </Form.Item> */}
      </Form>
    </Modal>
  );
};
