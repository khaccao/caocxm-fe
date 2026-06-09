/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Row, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { largePagingParams } from '@/common/define';
import { ProjectResponse } from '@/common/project';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission } from '@/hooks';
import { getCurrentCompany } from '@/store/app';
import { ConstantStatic, documentActions } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getFileRoots, getProjectList, projectActions } from '@/store/project';
import { teamActions } from '@/store/team';
import { ProjectItem } from './components/ProjectItem';
import styles from './ProjectPage.module.less';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const company = useAppSelector(getCurrentCompany());
  const projectList = useAppSelector(getProjectList());
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [searchStr, setSearchStr] = useState('');
  const listDataFileRoots = useAppSelector(getFileRoots());
  const isLoading = useAppSelector(getLoading('getProjectsByCompanyId'));

  const viewBiddingGranted = usePermission(['DuThau.View']);

  useEffect(() => {
    dispatch(
      projectActions.getStatusListRequest({
        ...largePagingParams,
        type: 0,
      }),
    );
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Call api get folder root id
    dispatch(projectActions.getFolderRootId({ projectId: -1, isGetId: true }));
    if (
      listDataFileRoots &&
      listDataFileRoots.results &&
      listDataFileRoots.results.length === 0 &&
      listDataFileRoots.length === 0
    ) {
      //  dispatch(projectActions.getFolderRootId({ projectId: -1, isGetId: false }));
      // kiểm tra điều kiện sau
    }
  }, []);

  const onSearchChange = (evt: any) => {
    const { value } = evt.target;
    setSearchStr(value);
    if (value) {
      const filteredEmployee = projects.filter(prj => {
        const employeeLastName = prj.name.toLowerCase();
        return employeeLastName.includes(value.toLowerCase());
      });
      setProjects(filteredEmployee);
    } else {
      setProjects(projectList);
    }
  };

  const handleSelectProject = (item: ProjectResponse) => {
    dispatch(projectActions.setSelectedProject(item));
    dispatch(
      projectActions.getWarehousesRequest({
        projectId: item?.id,
      }),
    );
    dispatch(projectActions.getFolderRootId({ projectId: item.id, isGetId: true }));
    //[#20477] [hao_lt] Tài liệu dự án - Fix bug upload duplicate.
    dispatch(documentActions.setListFilesUpload([]));
    dispatch(teamActions.getTeamsRequest({ projectId: item.id, queryParams: {} }));

    dispatch(documentActions.setFolderRootId(null));
    ConstantStatic.FileDatas = [];

    if (viewBiddingGranted) {
      navigate(`/projects/bidding`);
    } else {
      navigate(`/projects/construction/manuals`);
    }
  };

  const handleCreateProject = () => {
    dispatch(projectActions.setCreateProjectCurrentStep(0));
    dispatch(projectActions.setCreateProjectInformationValue(null));
    dispatch(projectActions.setProjectMemberList([]));
    dispatch(projectActions.setProjectAvatar(''));
    navigate(`/create-project`);
  };

  useEffect(() => {
    if (company && company.id) {
      dispatch(projectActions.getProjectsByCompanyIdRequest(company.id));
    }
    dispatch(projectActions.setSelectedProject());
    dispatch(projectActions.setProjectMembers(undefined));
    // eslint-disable-next-line
  }, [company]);

  useEffect(() => {
    if (projectList) {
      //[13/1/2025] [ngoc_td] Sắp xếp projectList theo status tăng dần
      const sortedProjects = [...projectList].sort((a, b) => a.status - b.status);
      setProjects(sortedProjects);
    }
  }, [projectList]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.topper}>
        <div>
          <Typography.Text strong className={styles.title}>
            {`${projects.length} dự án`}
          </Typography.Text>
        </div>
        <div>
          <Input
            placeholder={t('Find project name')}
            allowClear
            onChange={onSearchChange}
            className={styles.inputSearch}
            suffix={searchStr ? null : <SearchOutlined />}
          />
          {/* [26/11/2024][thinh_dmp][Update permission] */}
          <WithPermission strategy="disable" policyKeys={['DuAn.Create']}>
            <Button type="primary" shape="round" icon={<PlusOutlined />} size="large" onClick={handleCreateProject}>
              {t('createProject.button')}
            </Button>
          </WithPermission>
        </div>
      </div>
      <div className={`${styles.projectContainer} custom_scrollbar`}>
        <Spin spinning={isLoading} size="large">
          <Row gutter={[15, 15]}>
            {projects.map(item => {
              return <ProjectItem key={item.id} item={item} handleSelectProject={handleSelectProject} />;
            })}
          </Row>
        </Spin>
      </div>
    </div>
  );
};
