import React from 'react';

import { Tabs, TabsProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { GeneralInformation } from './components/GeneralInformation';
import { ProjectMember } from './components/ProjectMember';
import styles from './ProjectSettingPage.module.less';
import { WithPermission } from '@/hocs/PermissionHOC';

export const ProjectSettingPage = () => {
  const { t } = useTranslation(['projects']);

  const onChange = (_key: string) => {
    // console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('projectSetting.tabs.generalInfo'),
      children: (
        <WithPermission policyKeys={['CaiDat.ThongTinChung.View']} strategy="showResult">
          <GeneralInformation />
        </WithPermission>
      ),
    },
    {
      key: '2',
      label: t('projectSetting.tabs.projectMember'),
      children: (
        <WithPermission policyKeys={['CaiDat.ThanhVien.View']} strategy="showResult">
          <ProjectMember />
        </WithPermission>
      ),
    },
    // {
    //   key: '3',
    //   label: t('projectSetting.tabs.jobCategory'),
    //   children: 'Sắp có',
    // },
    // {
    //   key: '4',
    //   label: t('projectSetting.tabs.phase'),
    //   children: 'Sắp có',
    // },
    // {
    //   key: '5',
    //   label: t('projectSetting.tabs.category'),
    //   children: 'Sắp có',
    // },
  ];

  return (
    <div className={styles.mainContainer}>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} className="projectInfoTabs" />
    </div>
  );
};
