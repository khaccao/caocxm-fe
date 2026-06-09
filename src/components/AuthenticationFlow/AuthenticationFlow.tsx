import React, { useEffect } from 'react';

import { appActions, getAuthenticated } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getUserOrganizations, getUserPreferences, userActions } from '@/store/user';
import Utils from '@/utils';

interface AuthenticationFlowProps {
  children: React.ReactNode;
}

export const AuthenticationFlow = ({ children }: AuthenticationFlowProps) => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(getUserOrganizations());
  const preferences = useAppSelector(getUserPreferences());
  const auth = useAppSelector(getAuthenticated());

  useEffect(() => {
    // dispatch(userActions.getCurrentUser());
    dispatch(userActions.getOrganizations());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!auth?.token || !Utils.isTokenValid(auth?.token)) {
      // nếu token đã hết hạn, token sẽ được tự động renew trong class HttpCLient
      return;
    }
    if (preferences?.defaultOrganization) {
      // nếu đã có organization thì gọi renew để lấy lại token
      const loginData = {
        grant_type: 'refresh_token',
        refresh_token: auth?.refresh_token,
        remember: auth?.remember,
        orgId: preferences?.defaultOrganization,
      };
      
      dispatch(appActions.loginRequest({ input: loginData }));
    }
    // eslint-disable-next-line
  }, [preferences]);

  useEffect(() => {
    // lấy organization đấu tiên, nếu preferences chưa có
    if (!preferences?.defaultOrganization && organizations.length > 0) {
      const org = organizations[0];
      dispatch(userActions.setUserPreferences({defaultOrganization: org.guid}));
    }
    // eslint-disable-next-line
  }, [organizations, preferences]);

  useEffect(() => {
    if (organizations.length === 0 || !preferences?.defaultOrganization) {
      dispatch(userActions.setDefaultOrganization(undefined));
    } else {
      const defaultOrg = organizations.find(x => x.guid === preferences.defaultOrganization);
      dispatch(userActions.setDefaultOrganization(defaultOrg));
    }
    // eslint-disable-next-line
  }, [organizations, preferences]);

  return <>{children}</>;
};
