import React, { useEffect, useState } from 'react';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, Select, Typography, Upload, UploadProps, message } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { largePagingParams } from '@/common/define';
import { ProjectResponse } from '@/common/project';
import { getEnvVars } from '@/environment';
import { getAuthenticated } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getProjectAvatar, getProjectStatusList, projectActions } from '@/store/project';

const { apiUrl } = getEnvVars();

const { TextArea } = Input;

interface ProjectInfoProps {
  projectList: ProjectResponse[];
  onCopyFromProject: (projectId: number) => void;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ projectList, onCopyFromProject }) => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);
  const auth = useAppSelector(getAuthenticated());
  const projectAvatar = useAppSelector(getProjectAvatar());
  const projectStatuses = useAppSelector(getProjectStatusList());

  useEffect(() => {
    dispatch(projectActions.getStatusListRequest({ ...largePagingParams, type: 0 }));
    // eslint-disable-next-line
  }, []);

  const props: UploadProps = {
    name: 'File',
    multiple: true,
    maxCount: 1,
    accept: '.png,.jpg',
    action: `${apiUrl}/Project_Employee/project/uploadImage`,
    headers: {
      Authorization: auth.token ? `Bearer ${auth.token}` : '',
    },
    onChange(info) {
      const { status } = info.file;
      if (info.file.status === 'uploading') {
        setUploading(true);
        return;
      }
      if (status === 'done') {
        message.success(`${info.file.name} upload thành công.`);
        dispatch(projectActions.setProjectAvatar(`${info.file.response}`));
        setUploading(false);
      } else if (status === 'error') {
        message.error(`${info.file.name} upload không thành công.`);
        dispatch(projectActions.setProjectAvatar(''));
        setUploading(false);
      }
    },
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{t('ProjectPhoto')}</div>
    </button>
  );
  //[20491] [nam_do] tim kiem project
  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div className={styles.mainContainer}>
      <Form.Item
        name="copyFromProject"
        label={
          <Typography.Text style={{ fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>
            {t('createProject.projectInfo.copyFromProject')}
          </Typography.Text>
        }
      >
        <Select
          placeholder={t('createProject.projectInfo.copyFromProject')}
          onChange={onCopyFromProject}
          allowClear
          showSearch
          filterOption={filterOption}
          options={[
            { value: '', label: '' },
            ...projectList.map(project => ({ value: project.id.toString(), label: project.name })),
          ]}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Typography.Text style={{ fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>
        {t('createProject.projectInfo.title')}
      </Typography.Text>
      <Form.Item
        name={'projectCode'}
        label={<Typography.Text strong>{t('createProject.projectInfo.projectCode')}</Typography.Text>}
        rules={[{ required: true, message: t('createProject.projectInfo.requireProjectCode') }]}
      >
        <Input placeholder={t('createProject.projectInfo.projectCodePlaceholder')} />
      </Form.Item>
      <Form.Item
        name={'projectName'}
        label={<Typography.Text strong>{t('createProject.projectInfo.projectName')}</Typography.Text>}
        rules={[{ required: true, message: t('createProject.projectInfo.requireProjectName') }]}
      >
        <Input placeholder={t('createProject.projectInfo.projectNamePlaceholder')} />
      </Form.Item>
      <Form.Item
        name={'projectStartDate'}
        label={<Typography.Text strong>{t('createProject.projectInfo.projectStartDate')}</Typography.Text>}
        rules={[{ required: true, message: t('createProject.projectInfo.requireProjectStartDate') }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={'projectEndDate'}
        label={<Typography.Text strong>{t('createProject.projectInfo.projectEndDate')}</Typography.Text>}
        rules={[{ required: true, message: t('createProject.projectInfo.projectEndDate') }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name={'address'}
        label={<Typography.Text strong>{t('createProject.projectInfo.address')}</Typography.Text>}
        rules={[{ required: true, message: t('createProject.projectInfo.requireAddress') }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={'description'}
        label={<Typography.Text strong>{t('createProject.projectInfo.description')}</Typography.Text>}
      >
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item name={'status'} label={t('Status')} rules={[{ required: true, message: t('requiredStatus') }]}>
        <Select options={projectStatuses?.map(x => ({ value: x.id, label: x.name }))} />
      </Form.Item>
      <Form.Item>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader project-photo"
          showUploadList={false}
          {...props}
        >
          {projectAvatar ? (
            <img
              src={`${apiUrl}/Projects${projectAvatar}`}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
    </div>
  );
};
