import * as React from 'react';

import { LoginInput } from '@/common/define';
import { AuthContext } from '@/context';
import { appActions, getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(getCurrentUser());
  
  const signin = (input: LoginInput, callback: VoidFunction) => {
    dispatch(appActions.loginRequest({ input, callback }));
  };

  const signout = (callback: VoidFunction) => {
    dispatch(appActions.logout({ callback }));
  };

  const value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
