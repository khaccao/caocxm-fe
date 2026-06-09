import React, { useEffect, useState } from 'react';

import {
  PlusOutlined,
  FilterOutlined,
  SearchOutlined,
  AlignLeftOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Input, Space, Tooltip, Typography , Upload} from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './Contract.module.less';
import FloorNumberPopup from '../PublicPage/FloorNumberPopup';
import { CreateUpdateIssueModalName, eTrackerCode, sMilestone, ViewState } from '@/common/define';
import GanttHeader from '@/components/Gantt/components/GanttHeader';
import { WithPermission } from '@/hocs/PermissionHOC';
import { getActiveMenu } from '@/store/app';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { importFileActions } from '@/store/importFile';
import { getIssueQueryParams, getIssuesView, issueActions, getTagsVersion, getTracker } from '@/store/issue';
import { showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

export const ContractHeader = () => {
  const { t } = useTranslation();
  const tPublic = useTranslation('publics').t;

  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const activeMenu = useAppSelector(getActiveMenu());
  const view = useAppSelector(getIssuesView());
  const params = useAppSelector(getIssueQueryParams());

  const [timer, setTimer] = useState<any>(null);
  const [searchStr, setSearchStr] = useState(params?.search);
  const tags = useAppSelector(getTagsVersion());
  const trackers = useAppSelector(getTracker());
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const company = useAppSelector(getCurrentCompany());

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
    dispatch(showModal({ key: CreateUpdateIssueModalName }));
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
            projectId: selectedProject?.id,
            params: {
              ...params,
              page: 1,
              search,
              tagVersionId: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags),
              pageSize: 10000,
              trackerId,
            },
          }),
        );
        // dispatch(
        //   issueActions.getIssuesByMilestoneRequest({
        //     projectId: selectedProject.id,
        //     params: { ...params, page: 1, search },
        //   }),
        // );
      }, 500);
      setTimer(timeoutId);
    }
  };

  const handleUploadChange = (info: any) => {
    const { status } = info.file;
    if (status === 'done' || status === 'error') {
      const formData = new FormData();
      formData.append('file', info.file.originFileObj as File);
      if (selectedProject) {
        dispatch(importFileActions.importFileRequest({ file: formData }));
      }
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    onChange: handleUploadChange,
    showUploadList: false
  };
  
  // [#20708 ][dung_lt][03/11/2024] _  hàm gen issue with template
  const handleGenIssueWithTemplate = async () => {
    const body = {
      levelCount: -1,
      isMezzanine: false,
      isTechnicalFloors: false,
      isRooftopFloor: false,
      floorsBasementCount: 0,
      subject: '',
      isBasement: false,
    };

    if (company) {
      const companyId = company.id as number;
      dispatch(importFileActions.genIssueRequest({ companyId, tagVersionCode: sMilestone.ContractBiddingKPIs, body }));
    }
  }

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerLeft}>
        <div className={styles.titleContainer}>
          <Typography.Title style={{ margin: 0 }} level={4}>
            {activeMenu?.label}
          </Typography.Title>
          <WithPermission policyKeys={['HopDong_KPIDauThau.Create']} strategy='disable'>
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
          {/* <Button type="primary" shape="circle" icon={<FilterOutlined />} size="small" />
          <Button type="link" size="small" style={{ padding: 0 }}>
            {t('Clear')}
          </Button> */}
        </div>
      </div>
      <Space>
      {/*  [#20707][dung_lt][03/11/2024] ẩn button import file excel 
      <Tooltip title={t('Import file excel')}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}  />
          </Upload>
        </Tooltip> */}
        <Tooltip title={tPublic('numFloors')}>
          <Button icon={<PlusCircleOutlined />} onClick={() => handleGenIssueWithTemplate()} />
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
        {/* <FloorNumberPopup
          visible={isModalVisible}
          tagVersionCode={sMilestone.ContractBiddingKPIs}
          onClose={() => setIsModalVisible(false)} 
        /> */}
      </Space>
    </div>
  );
};
