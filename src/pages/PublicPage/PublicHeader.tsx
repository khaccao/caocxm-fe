import React, { useEffect, useState } from 'react';

import {
  PlusOutlined,
  FilterOutlined,
  SearchOutlined,
  AlignLeftOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { UploadOutlined,PlusCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Input, Space, Tooltip, Typography, Upload } from 'antd';
import { useTranslation } from 'react-i18next';

import FloorNumberPopup from './FloorNumberPopup';
import styles from './Public.module.less';
import { CreateUpdateInitWorkModalName, eTrackerCode, sMilestone, ViewState } from '@/common/define';
import GanttHeader from '@/components/Gantt/components/GanttHeader';
import { WithPermission } from '@/hocs/PermissionHOC';
import { getCurrentCompany } from '@/store/app';
import { getActiveMenu } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { importFileActions } from '@/store/importFile';
import { getIssueQueryParams,  getIssuesView, issueActions, getTagsVersion, getTracker } from '@/store/issue';
import { showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

export const PublicHeader = () => {
  const { t } = useTranslation('publics');
  
  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const activeMenu = useAppSelector(getActiveMenu());
  const view = useAppSelector(getIssuesView());
  const params = useAppSelector(getIssueQueryParams());
  const company = useAppSelector(getCurrentCompany());

  const [timer, setTimer] = useState<any>(null);
  const [searchStr, setSearchStr] = useState(params?.search);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const tags = useAppSelector(getTagsVersion());
  const ascending = true;
  const trackers = useAppSelector(getTracker());
  const getTrackerID = () => {
    let trackerId = 20;
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
      if (tracker && tracker.id) {
        trackerId = tracker.id;
      }
    }
    return trackerId;
  }

  useEffect(() => {
    setSearchStr(params?.search);
  }, [params]);

  const handleChangeView = (v: ViewState) => {
    dispatch(issueActions.setView(v));
  };


  const createIssue = () => {
    dispatch(issueActions.setEditIssuePublics(true))
    dispatch(showModal({ key: CreateUpdateInitWorkModalName }));
  };

  const onSearchChange = (evt: any) => {
    if (selectedProject) {
      const search = evt.target.value;
      setSearchStr(search);
      clearTimeout(timer);
      const timeoutId = setTimeout(() => {
        let trackerId = getTrackerID();
        dispatch(
          issueActions.getIssuesByMilestoneRequest({
            projectId: selectedProject.id,
            params: {
              ...params,
              pageSize: 10000,
              search,
              tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
              ascending,
              trackerId,
            },
          }),
        );
      }, 500);
      setTimer(timeoutId);
    }
  };

  const handleUploadChange = (info: any) => {
    const { status } = info.file;
    if (status === 'done' || status === 'error') {
      const formData = new FormData();
      formData.append('file', info.file.originFileObj as File);
      const companyId = company?.id as number;
      
      if (companyId) {
        dispatch(importFileActions.importFileTemplateRequest({ companyId, file: formData }));
      }
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    onChange: handleUploadChange,
    showUploadList: false
  };
  
  return (
    <div className={styles.headerContainer + ' publicHeader'}>
      <div className={styles.headerLeft}>
        <div className={styles.titleContainer}>
          <Typography.Title style={{ margin: 0 }} level={4}>
            {activeMenu?.label}
          </Typography.Title>
          <WithPermission policyKeys={['LapTienDoBanDau.Create']} strategy='disable'>
            <Button type="primary" shape="circle" icon={<PlusOutlined />} size="small" onClick={createIssue} />
          </WithPermission>
        </div>
        <div className={styles.searchContainer}>
          <Input
            allowClear
            value={searchStr}
            onChange={onSearchChange}
            suffix={searchStr ? null : <SearchOutlined />}
            style={{ borderRadius: 20, width: 200 }}
            placeholder={t('Search')}
          />
          {/* <Button type="primary" shape="circle" icon={<FilterOutlined />} size="small" /> */}
        </div>
      </div>

      <Space>
      {/* <Tooltip title={t('Importexcel')}style={{ display: 'none' }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}  />
          </Upload>
        </Tooltip> */}
        <Tooltip title={t('numFloors')}>
          <Button icon={<PlusCircleOutlined />} onClick={() => setIsModalVisible(true)} />
        </Tooltip>
        {view === 'Gantt' && (<GanttHeader namePage={t(activeMenu.label)}/>)}
        <Tooltip title={t('Gantt')}>
          <Button
            type={view === 'Gantt' ? 'primary' : 'default'}
            ghost={view === 'Gantt'}
            icon={<AlignLeftOutlined />}
            onClick={() => handleChangeView('Gantt')}
          />
        </Tooltip>
        <Tooltip title={t('List')}>
          <Button
            type={view === 'List' ? 'primary' : 'default'}
            ghost={view === 'List'}
            icon={<UnorderedListOutlined />}
            onClick={() => handleChangeView('List')}
          />
        </Tooltip>
      </Space>
      <FloorNumberPopup
        visible={isModalVisible}
        tagVersionCode={sMilestone.SetupInitialProgress}
        onClose={() => setIsModalVisible(false)} 
      />
    </div>
  );
};
