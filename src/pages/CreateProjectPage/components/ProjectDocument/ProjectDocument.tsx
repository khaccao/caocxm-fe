import React, { useState } from 'react';

import { InboxOutlined, UploadOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography, Upload, UploadFile, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './ProjectDocument.module.less';
import { useAppDispatch } from '@/store/hooks';
import { projectActions } from '@/store/project';

const { Dragger } = Upload;

export const ProjectDocument = () => {
  const { t } = useTranslation(['projects']);

  const dispatch = useAppDispatch();

  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: '-1',
      name: 'xxx.png',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    }
  ]);

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    newFileList = newFileList.slice(-1);

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 1,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    onChange: handleChange,
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleNext = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(2));
  };

  const handlePrevious = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.addDocumentContainer}>
        <Typography.Text style={{ fontWeight: '700', fontSize: '18px' }}>
          {t('createProject.addDocument')}
        </Typography.Text>
        <Row>
          <Col span={0} xs={0} sm={24}>
            <Dragger {...props} fileList={fileList}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned
                files.
              </p>
            </Dragger>
          </Col>
          <Col span={24} xs={24} sm={0} md={0} lg={0} xl={0} xxl={0}>
            <Upload {...props} fileList={fileList}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Col>
        </Row>
        <div className={styles.buttonContainer}>
          <Button onClick={handlePrevious} className={styles.buttonWithIcon}>
            <ArrowLeftOutlined />
            {t('createProject.back')}
          </Button>
          <Button type="primary" className={styles.buttonWithIcon} onClick={handleNext}>
            {t('createProject.next')}
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};
