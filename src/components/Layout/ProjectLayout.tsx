import React, { useEffect } from 'react';

import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { eTrackerCode } from '@/common/define';
import {
  getCurrentCompany
} from '@/store/app'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTracker, issueActions } from '@/store/issue';
import { getSelectedProject } from '@/store/project';

const ProjectLayout = () => {
  const location = useLocation();
  const selectedProject = useAppSelector(getSelectedProject());
  const company = useAppSelector(getCurrentCompany());
  
  const trackers = useAppSelector(getTracker());

  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (company) {
      dispatch(issueActions.getTagByCompanyIdRequest({ companyId: company.id }));
      dispatch(issueActions.getTrackerByCompany({ id : company.id }));
    }
  }, [company, dispatch])

  useEffect(() => {
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
      tracker &&
        dispatch(
          issueActions.getAttributeDimByTracker({ trackerId: tracker.id }),
        );
    }
  }, [trackers]);

  useEffect(()=> {
    // if (selectedProject) dispatch(issueActions.getTrackerByProject({ id : selectedProject.id }));
  }, [dispatch, selectedProject])

  if (!selectedProject) {
    return <Navigate to="/projects" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProjectLayout;
