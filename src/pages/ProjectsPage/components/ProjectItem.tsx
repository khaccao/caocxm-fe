import React from 'react';

import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Tag, Tooltip, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './Components.module.less';
import ProjectDescription from './ProjectDescription';
import { colors } from '@/common/colors';
import { ProjectResponse } from '@/common/project';
import { getEnvVars } from '@/environment';
import { usePermission } from '@/hooks';
import LocationIcon from '@/image/icon/location-icon.svg';
import ProjectBg from '@/image/icon/project.png';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getProjectStatusList, projectActions } from '@/store/project';
import Utils from '@/utils';

const { Meta } = Card;
const { apiUrl: hostUrl } = getEnvVars();

const Context = React.createContext({ name: 'Default' });
interface ProjectItemProps {
  item: ProjectResponse;
  handleSelectProject: (item: ProjectResponse) => void;
}

export const ProjectItem = (props: ProjectItemProps) => {
  const { item, handleSelectProject } = props;
  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const statuses = useAppSelector(getProjectStatusList());

  const deleteGranted = usePermission(['DuAn.Delete']);
  const settingGranted = usePermission(['CaiDat.ThongTinChung.View', 'CaiDat.ThongTinChung.Edit']);

  const openNotification = () => {
    notification.info({
      message: t(`Notification`),
      description: <Context.Consumer>{() => `Tính năng đang phát triển`}</Context.Consumer>,
    });
  };

  const confirm = (evt: any, item: any) => {
    Modal.confirm({
      title: t('projectMenuDropdown.deleteTitle'),
      icon: <ExclamationCircleOutlined />,
      content: (
        <p>
          {t('projectMenuDropdown.deleteContent')} <span style={{ fontWeight: 'bold' }}>{`"${item.name}"`}</span>?
        </p>
      ),
      okText: t('projectMenuDropdown.yes'),
      onOk: () => {
        // [27/11/2024] Implement #20972 Gắn Api xóa dự án
        if (item && item?.id) {
          dispatch(projectActions.removeProject({ projectId: item.id, companyId: item?.companyId }));
        }
      },
      cancelText: t('projectMenuDropdown.no'),
    });
    evt.stopPropagation();
  };

  const handleEditProjectInfo = (evt: any) => {
    evt.stopPropagation();
    dispatch(projectActions.setSelectedProject(item));
    navigate('/projects/project-settings');
  };

  const getStatusName = (id: number) => {
    const st = statuses.find(x => x.id === id);
    return st ? st.name : t('unknown');
  };

  const getColorStatus = (id: number) => {
    switch (id) {
      case 0:
        return '';
      case 1:
        return '#FAAD14';
      case 2:
        return colors.progress;
      case 3:
        return colors.complete;
      default:
        return Utils.stringToColour(getStatusName(id));
    }
  };

  return (
    <Col span={24} md={24} lg={12} xl={8} xxl={6}>
      {/* [26/11/2024][thinh_dmp][Update permission] */}
      <Card
        className={styles.projectCard}
        styles={{ body: { padding: '0px' } }}
        actions={[
          <Tooltip title={t('Edit info')}>
            <Button
              disabled={!settingGranted}
              onClick={handleEditProjectInfo}
              type={'text'}
              icon={<EditOutlined key="edit" />}
            />
          </Tooltip>,
          <Tooltip title={t('Remove')}>
            <Button
              onClick={e => confirm(e, item)}
              type={'text'}
              disabled={!deleteGranted}
              icon={<DeleteOutlined key="remove" style={{ color: '#ff4d4f' }} />}
            />
          </Tooltip>,
          <Tooltip title={t('View')}>
            <Button
              onClick={() => handleSelectProject(item)}
              type={'text'}
              icon={<CaretRightOutlined key="view" style={{ color: colors.primary }} />}
            />
          </Tooltip>,
        ]}
      >
        <Meta
          description={
            <>
              <div role="button" tabIndex={0} className={styles.imgInfoContainer}>
                <div className={styles.imgContainer}>
                  <img
                    src={item.avatar && item.avatar !== 'string' ? `${hostUrl}/Projects${item.avatar}` : ProjectBg}
                    alt="Project"
                    className={styles.imgStyle}
                  />
                </div>
                <div className={styles.infoContainer}>
                  <span style={{ fontSize: 20, fontWeight: '500', color: '#000000' }}>{item.name}</span>
                  <div className={styles.descriptions}>
                    <ProjectDescription label={<img src={LocationIcon} alt="location" />}>
                      {item.address.length > 35 ? `${item.address.slice(0, 35)}...` : item.address}
                    </ProjectDescription>
                    <ProjectDescription label={t('startDate')}>
                      {Utils.formatDateTimeStamp(new Date(item.startDate))}
                    </ProjectDescription>
                  </div>
                </div>
              </div>
              <Row style={{ padding: '0 10px 10px 10px', marginBottom: 5 }}>
                <Tag color={getColorStatus(item.status)} style={{ padding: '3px 10px 3px 10px' }}>
                  {t(getStatusName(item.status))}
                </Tag>
              </Row>
            </>
          }
        />
      </Card>
    </Col>
  );
};
