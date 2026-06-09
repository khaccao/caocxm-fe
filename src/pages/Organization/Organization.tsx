import React, { useEffect, useState } from 'react';

import { Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { OrganizationCard } from './components/OrganizationCard';
import styles from './Organization.module.less';
import { appActions, getAuthenticated } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { organizationActions } from '@/store/organization';
import { getUserOrganizations, userActions } from '@/store/user';

export const Organization = () => {
  const { t } = useTranslation(['organization']);

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const auth = useAppSelector(getAuthenticated());
  const userOrganizations = useAppSelector(getUserOrganizations());

  const [isHover, setIsHover] = useState(false);

  const handleSelectOrg = (org: any) => {
    const values: any = {
      grant_type: 'refresh_token',
      refresh_token: auth.refresh_token,
      remember: auth.remember,
      orgId: org.guid,
    };
    dispatch(userActions.setUserPreferences({ defaultOrganization: org.guid }));
    dispatch(organizationActions.setSelectedOrg(org));
    const callBack = navigate('/projects');
    dispatch(appActions.loginRequest({ ...values, callBack }));
    const createUserPreferencesPayload = {
      defaultOrganization: org.guid,
    };
    dispatch(userActions.createUserPreferencesRequest(createUserPreferencesPayload));
  };

  useEffect(() => {
    if (userOrganizations.length === 1) {
      handleSelectOrg(userOrganizations[0]);
    }
    // eslint-disable-next-line
  }, [userOrganizations]);

  return (
    <div className={styles.selectOrgContainer}>
      <div className={styles.headerContainer}>
        <Typography.Title level={4}>{t('Select organization')}</Typography.Title>
      </div>
      <div className={styles.bodyContainer}>
        <Row
          gutter={[16, 16]}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className={`${isHover && styles.scrollAble}`}
          style={{ width: '100%' }}
        >
          {userOrganizations.map(org => {
            return <OrganizationCard key={org.guid} org={org} handleSelectOrg={handleSelectOrg} />;
          })}
        </Row>
      </div>
    </div>
  );
};
