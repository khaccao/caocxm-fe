import React, { useEffect } from 'react';

import { AddMemberToTeamModal } from './AddMemberToTeamModal';
import { CreateUpdateTeamModal, TeamManageHeader, TeamManageTable } from './components';
import styles from './TeamManagePage.module.less';
import { AddMemberToTeamModalName, CreateUpdateTeamModalName } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import { teamActions } from '@/store/team';

export const TeamManagePage = () => {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const isOpenTeamModal = useAppSelector(getModalVisible(CreateUpdateTeamModalName));
  const isOpenAddMemberModal = useAppSelector(getModalVisible(AddMemberToTeamModalName));
  
  useEffect(() => {
    if (selectedProject) {
      dispatch(teamActions.getTeamsRequest({ projectId: selectedProject.id, queryParams: {} }));
    }
    // eslint-disable-next-line
  }, [selectedProject]);

  return (
    <div className={styles.mainContainer}>
      <TeamManageHeader />
      <TeamManageTable />
      {isOpenTeamModal && <CreateUpdateTeamModal />}
      {isOpenAddMemberModal && <AddMemberToTeamModal />}
    </div>
  );
};
