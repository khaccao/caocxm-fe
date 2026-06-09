import React from 'react';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { ProjectInformationValue } from '@/common/define';

type Props = {
  createProjectInformationValue: ProjectInformationValue;
};

export const TitleSuccessfully = (_props: Props) => {

  const { t } = useTranslation(['projects']);

  return (
    <div className={styles.titleContainer}>
      <Typography.Text style={{ fontSize: '24px', fontWeight: '500', }}>
        <CheckCircleOutlined style={{ fontSize: '24px', fontWeight: '500', color: '#52c41a' }} /> {t('createProject.createProjectSuccessfully')}
      </Typography.Text>
    </div>
  );
};
