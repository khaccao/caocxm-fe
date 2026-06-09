import React from 'react';

import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { ProjectInformationValue } from '@/common/define';

type Props = {
  createProjectInformationValue: ProjectInformationValue;
};

export const GeneralInfo = (props: Props) => {
  const { createProjectInformationValue } = props;

  const { t } = useTranslation(['projects']);

  return (
    <div className={styles.informationContainer}>
      <Typography.Text className={styles.informationTitle}>{createProjectInformationValue?.projectName}</Typography.Text>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <div className={styles.dataContainer}>
            <Typography.Text className={styles.dataLabel}><CalendarOutlined /> {t('createProject.startDate')}:</Typography.Text>
            <Typography.Text><CalendarOutlined style={{visibility: 'hidden'}}/> {`${moment(createProjectInformationValue.projectStartDate).format('DD/MM/yyyy')}`}</Typography.Text>
          </div>
        </Col>
        <Col span={24} md={12}>
          <div className={styles.dataContainer}>
            <Typography.Text className={styles.dataLabel}><EnvironmentOutlined /> {t('createProject.address')}:</Typography.Text>
            <Typography.Text><EnvironmentOutlined  style={{visibility: 'hidden'}}/> {createProjectInformationValue.address}</Typography.Text>
          </div>
        </Col>
        <Col span={24}>
          <div className={styles.dataContainer}>
            <Typography.Text className={styles.dataLabel}><UserOutlined /> {t('createProject.owner')}:</Typography.Text>
            <Typography.Text><UserOutlined  style={{visibility: 'hidden'}}/> {createProjectInformationValue.investorName}</Typography.Text>
          </div>
        </Col>
        <Col span={24} md={12}>
          <div className={styles.dataContainer}>
            <Typography.Text className={styles.dataLabel}><PhoneOutlined /> {t('createProject.phone')}:</Typography.Text>
            <Typography.Text><PhoneOutlined  style={{visibility: 'hidden'}}/> {createProjectInformationValue.investorPhone}</Typography.Text>
          </div>
        </Col>
        <Col span={24} md={12}>
          <div className={styles.dataContainer}>
            <Typography.Text className={styles.dataLabel}><MailOutlined /> {t('createProject.email')}:</Typography.Text>
            <Typography.Text><MailOutlined  style={{visibility: 'hidden'}}/> {createProjectInformationValue.investorEmail}</Typography.Text>
          </div>
        </Col>
      </Row>
    </div>
  );
};
