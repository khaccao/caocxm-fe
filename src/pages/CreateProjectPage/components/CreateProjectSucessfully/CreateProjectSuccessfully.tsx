import React from 'react';

import { Col, Row } from 'antd';
import { useNavigate } from 'react-router-dom';

import { GeneralInfo, NavigateButtons, ProjectMember, TitleSuccessfully } from './components';
import styles from './CreateProjectSucessfully.module.less';
import { documentActions } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCreateProjectInformationValue, projectActions } from '@/store/project';
import { RootState } from '@/store/types';


export const CreateProjectSuccessfully = () => {
  const navigate = useNavigate();
  const projectcreate = useAppSelector((state: RootState) => state.project.createProjectResponse);
  const dispatch = useAppDispatch();

  const createProjectInformationValue = useAppSelector(getCreateProjectInformationValue());

  // [31/10/2024][#20704][phuong_td] Reset dữ liệu Tài liệu của dự án
  const resetDocuments = () => {
    dispatch(projectActions.setListFileRoots([]));
    dispatch(documentActions.setDocuments(null));
    dispatch(documentActions.setDocumentPath([]));
    dispatch(documentActions.setListFilesUpload([]));
    dispatch(documentActions.setFolderRootId(null));
    dispatch(projectActions.getFolderRootId({projectId: projectcreate.id, isGetId: true}))
  }

  const handleBackToProjectList = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
    dispatch(projectActions.setCreateProjectInformationValue(null));
    dispatch(projectActions.setProjectMemberList([]));
    dispatch(projectActions.setProjectAvatar(''));
    resetDocuments();
    navigate('/projects');
  };
// [#20669] [nam_do] Click button [Dự thầu- Hợp đồng] bị thoát ra màn hình Danh sách dự án
  const handleGotoBiddingPage = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
    dispatch(projectActions.setCreateProjectInformationValue(null));
    dispatch(projectActions.setProjectMemberList([]));
    dispatch(projectActions.setProjectAvatar(''));
    dispatch(projectActions.setSelectedProject(projectcreate));
    resetDocuments();
    navigate('/projects/bidding');
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.bodyContainer}>
        <Row gutter={[30, 24]}>
          <Col span={24} className={styles.bodyTopContainer}>
            {createProjectInformationValue && (
              <TitleSuccessfully createProjectInformationValue={createProjectInformationValue} />
            )}
          </Col>
          <Col span={24} md={24} xl={14}>
            {createProjectInformationValue && (
              <GeneralInfo createProjectInformationValue={createProjectInformationValue} />
            )}
          </Col>
          <Col span={24} md={24} xl={10}>
            <ProjectMember />
          </Col>
        </Row>
        <NavigateButtons handleBackToProjectList={handleBackToProjectList} handleGotoBiddingPage={handleGotoBiddingPage}/>
      </div>
    </div>
  );
};
