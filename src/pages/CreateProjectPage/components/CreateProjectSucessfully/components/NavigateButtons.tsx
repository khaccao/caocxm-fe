import React from 'react'

import {
  BarChartOutlined,
  FileDoneOutlined,

} from '@ant-design/icons';
import { Button } from 'antd'
import { useTranslation } from 'react-i18next';

import styles from './components.module.less'

type Props = {
  handleBackToProjectList: () => void;
  handleGotoBiddingPage: () => void;
}

export const NavigateButtons = (props: Props) => {
  const {handleBackToProjectList, handleGotoBiddingPage} = props;

  const { t } = useTranslation(['projects']);

  return (
    <div className={styles.buttonContainer}>
      <Button className={styles.buttonWithIcon} onClick={handleBackToProjectList}><BarChartOutlined />{t('createProject.backToProjectList')}</Button>
      <Button type='primary' className={styles.buttonWithIcon} onClick={handleGotoBiddingPage}>{t('createProject.goToBiddingContractPage')}<FileDoneOutlined /></Button>
    </div>
  )
}
