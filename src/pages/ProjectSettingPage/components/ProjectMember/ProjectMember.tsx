import React, { useEffect } from 'react';

import { AddMemberToProject } from './AddMemberToProject';
import { ProjectMemberHeader, ProjectMemberTable } from './components';
import styles from './ProjectMember.module.less';
import { AddMemberToProjectModalName } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible } from '@/store/modal';
import { projectActions } from '@/store/project';

export const ProjectMember = () => {
  const dispatch = useAppDispatch();
  const chooseMembersModal = useAppSelector(getModalVisible(AddMemberToProjectModalName));

  useEffect(() => {
    // todo: call API to get members
    dispatch(projectActions.setProjectMemberList([]));
    // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.mainContainer}>
      <ProjectMemberHeader />
      <ProjectMemberTable />
      {chooseMembersModal && <AddMemberToProject />}
    </div>
  );
};
