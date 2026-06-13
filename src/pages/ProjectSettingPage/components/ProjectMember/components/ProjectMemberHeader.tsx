import React, { useEffect, useState } from 'react';

import { PlusCircleOutlined, SearchOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Button, Input, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { colors } from '@/common/colors';
import { AddMemberToProjectModalName } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showModal } from '@/store/modal';
import { getProjectQueryParams, getSelectedProject, projectActions } from '@/store/project';
import { ProjectCheckInMemberStatus } from '@/services/CheckInService';
import { SetupCheckInMembersModal } from './SetupCheckInMembersModal';

interface ProjectMemberHeaderProps {
  checkInMembers: ProjectCheckInMemberStatus[];
  onCheckInMembersChanged: () => void;
}

export const ProjectMemberHeader = ({
  checkInMembers,
  onCheckInMembersChanged,
}: ProjectMemberHeaderProps) => {
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const queryParams = useAppSelector(getProjectQueryParams());
  const [timer, setTimer] = useState<any>(null);
  const [searchStr, setSearchStr] = useState(queryParams?.search);
  const [setupCheckInOpen, setSetupCheckInOpen] = useState(false);

  useEffect(() => {
    setSearchStr(queryParams?.search);
  }, [queryParams]);

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    const params = { ...queryParams, search };
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      dispatch(projectActions.setQueryParams(params));
      dispatch(projectActions.getProjectMembersRequest({ projectId: selectedProject?.id, queryParams: params }));
    }, 500);
    setTimer(timeoutId);
  };

  const addMembers = () => {
    dispatch(showModal({ key: AddMemberToProjectModalName }));
  };

  return (
    <Row style={{ marginBottom: 16 }}>
      <Space style={{ flex: 1 }}>
        <WithPermission policyKeys={['CaiDat.ThanhVien.Create']} strategy="disable">
          <Button
            size="middle"
            type="text"
            icon={<PlusCircleOutlined />}
            onClick={addMembers}
            style={{ color: colors.primary }}
          >
            {t('projectSetting.projectMember.addMember')}
          </Button>
        </WithPermission>
        <WithPermission policyKeys={['CaiDat.ThanhVien.Edit']} strategy="disable">
          <Button
            size="middle"
            type="text"
            icon={<UserSwitchOutlined />}
            onClick={() => setSetupCheckInOpen(true)}
            style={{ color: colors.primary }}
          >
            Thiết lập chấm công
          </Button>
        </WithPermission>
      </Space>
      <Space>
        <Input
          placeholder={t('projectSetting.projectMember.findMember')}
          allowClear
          className={styles.inputSearch}
          value={searchStr}
          onChange={onSearchChange}
          suffix={searchStr ? null : <SearchOutlined />}
        />
      </Space>
      <SetupCheckInMembersModal
        open={setupCheckInOpen}
        checkInMembers={checkInMembers}
        onClose={() => setSetupCheckInOpen(false)}
        onSaved={() => {
          setSetupCheckInOpen(false);
          onCheckInMembersChanged();
        }}
      />
    </Row>
  );
};
