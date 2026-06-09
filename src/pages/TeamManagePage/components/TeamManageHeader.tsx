import React, { useEffect, useState } from 'react';

import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';
import { colors } from '@/common/colors';
import { CreateUpdateTeamModalName, IsUpdateTeamModal } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideModal, showModal } from '@/store/modal';
import { getTeamQueryParams, teamActions } from '@/store/team';

export const TeamManageHeader = () => {
  const { t } = useTranslation(['team']);
  const queryParams = useAppSelector(getTeamQueryParams());
  const [searchStr, setSearchStr] = useState(queryParams?.search);
  const dispatch = useAppDispatch();
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    setSearchStr(queryParams?.search);
  }, [queryParams]);

  const handleOpenTeamModal = () => {
    dispatch(showModal({ key: CreateUpdateTeamModalName }));
    dispatch(hideModal({ key: IsUpdateTeamModal }));
  };

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      dispatch(teamActions.setQueryParams({ ...queryParams, search }));
    }, 500);
    setTimer(timeoutId);
  };

  return (
    <div className={styles.headerContainer}>
      <WithPermission policyKeys={['QuanLyToDoi.Create']} strategy='disable'>
        <Button
          size="middle"
          type="text"
          icon={<PlusCircleOutlined />}
          onClick={handleOpenTeamModal}
          style={{ color: colors.primary }}
        >
          {t('teamManage.header.addNewTeam')}
        </Button>
      </WithPermission>
      <Input
        placeholder={t('teamManage.header.findTeam')}
        allowClear
        className={styles.inputSearch}
        value={searchStr}
        onChange={onSearchChange}
        suffix={searchStr ? null : <SearchOutlined />}
      />
    </div>
  );
};
