import React, { useCallback, useEffect, useState } from 'react';

import { AddMemberToProject } from './AddMemberToProject';
import { ProjectMemberHeader, ProjectMemberTable } from './components';
import styles from './ProjectMember.module.less';
import { AddMemberToProjectModalName } from '@/common/define';
import { FaceCheckService, ProjectCheckInMemberStatus } from '@/services/CheckInService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible } from '@/store/modal';
import { getProjectMembers, getSelectedProject, projectActions } from '@/store/project';
import Utils from '@/utils';

export const ProjectMember = () => {
  const dispatch = useAppDispatch();
  const chooseMembersModal = useAppSelector(getModalVisible(AddMemberToProjectModalName));
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const [checkInMembers, setCheckInMembers] = useState<ProjectCheckInMemberStatus[]>([]);
  const [isLoadingCheckInMembers, setLoadingCheckInMembers] = useState(false);

  useEffect(() => {
    dispatch(projectActions.setProjectMemberList([]));
    // eslint-disable-next-line
  }, []);

  const loadCheckInMembers = useCallback(() => {
    if (!selectedProject) {
      setCheckInMembers([]);
      return;
    }

    setLoadingCheckInMembers(true);
    const subscription = FaceCheckService.Get.getProjectCheckInMembers(selectedProject.id).subscribe({
      next: result => setCheckInMembers(result || []),
      error: error => {
        setCheckInMembers([]);
        setLoadingCheckInMembers(false);
        if (error?.status !== 404) {
          Utils.errorHandling(error);
        }
      },
      complete: () => setLoadingCheckInMembers(false),
    });

    return () => subscription.unsubscribe();
  }, [selectedProject]);

  useEffect(() => {
    const cleanup = loadCheckInMembers();
    return cleanup;
  }, [loadCheckInMembers, projectMembers]);

  return (
    <div className={styles.mainContainer}>
      <ProjectMemberHeader
        checkInMembers={checkInMembers}
        onCheckInMembersChanged={loadCheckInMembers}
      />
      <ProjectMemberTable checkInMembers={checkInMembers} isLoadingCheckInMembers={isLoadingCheckInMembers} />
      {chooseMembersModal && <AddMemberToProject />}
    </div>
  );
};
