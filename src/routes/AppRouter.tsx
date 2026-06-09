import React, { Suspense } from 'react';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { getAuthRouters } from './AuthRoute';
import { routers } from './routers';
import { Loading } from '@/components';
import { fullPermissionsRoles } from '@/hooks';
import NotAuth from '@/pages/403';
import { getGrantedPolicies, getUserRoles } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

export const AppRouter = () => {
  const grantedPolicies = useAppSelector(getGrantedPolicies());
  const userRoles = useAppSelector(getUserRoles());
  const isFullPermissions = fullPermissionsRoles.some(role => userRoles.includes(role));

  const _routers = getAuthRouters({
    routers,
    noAuthElement: router => (isFullPermissions ? router.element : <NotAuth />),
    // render: (element) => (loading ? <Loading /> : element),
    auth: Object.keys(grantedPolicies) || [],
  });

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider
        router={createBrowserRouter(_routers, { basename: '/' })}
        // route loader loading
        fallbackElement={<Loading />}
      />
    </Suspense>
  );
};
