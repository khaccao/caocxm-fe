import React from 'react';

import { Button } from 'antd';

import { AuthStatus } from "@/components";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { userActions } from '@/store/user';

export const ProtectedPage = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(getLoading());

  const handleGetCurrentUser = () => {
    dispatch(userActions.getCurrentUser());
  }

  return (
    <>
      <h3>Protected</h3>
      <AuthStatus />
      <Button loading={loading} onClick={handleGetCurrentUser}>Test</Button>
    </>
  );
};
