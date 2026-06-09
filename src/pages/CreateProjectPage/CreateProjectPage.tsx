import React, { useEffect } from 'react';

import { Button, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { CreateProjectSuccessfully } from './components/CreateProjectSucessfully';
import { GeneralInformation } from './components/GeneralInformation';
import { ProjectDocument } from './components/ProjectDocument';
import { ProjectMember } from './components/ProjectMember';
import styles from './CreateProjectPage.module.less';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCreateProjectCurrentStep, projectActions } from '@/store/project';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['projects']);

  const dispatch = useAppDispatch();
  const company = useAppSelector(getCurrentCompany());

  const createProjectCurrentStep = useAppSelector(getCreateProjectCurrentStep());

  const handleNavigateProjectPage = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
    dispatch(projectActions.setCreateProjectInformationValue(null));
    dispatch(projectActions.setProjectMemberList([]));
    dispatch(projectActions.setProjectAvatar(''));
    navigate('/projects');
  };

  const steps = [
    {
      title: t('createProject.steps.generalInfo'),
      content: <GeneralInformation />,
    },
    // Ẩn thêm tài liệu 
    // {
    //   title: t('createProject.steps.projectDoc'),
    //   content: <ProjectDocument />,
    // },
    {
      title: t('createProject.steps.projectMem'),
      content: <ProjectMember />,
    },
  ];

  const handleUnmountComponent = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
    dispatch(projectActions.setCreateProjectInformationValue(null));
    dispatch(projectActions.setProjectMemberList([]));
    dispatch(projectActions.setProjectAvatar(''));
  };

  useEffect(() => {
    dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    dispatch(projectActions.getRolesByCompanyIdRequest(company.id));
    return handleUnmountComponent();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.mainContainer}>
      {createProjectCurrentStep !== 3 ? (
        <>
          <div className={styles.header}>
            <Button onClick={handleNavigateProjectPage}>{t('createProject.cancel')}</Button>
          </div>
          <div className={styles.body}>
            <div className={styles.stepper}>
              <Steps size="default" current={createProjectCurrentStep} items={steps} />
            </div>
            <div className={styles.stepperContent}>{steps[createProjectCurrentStep]?.content}</div>
          </div>
        </>
      ) : (
        <>
          <CreateProjectSuccessfully />
        </>
      )}
    </div>
  );
};
