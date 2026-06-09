import { useEffect, useState } from 'react';

import { RoleEnum } from '@/common/define';
import { getAuthenticated, policyGranted } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

export const fullPermissionsRoles = [RoleEnum.Director, RoleEnum.Deputy_Director];
export const usePermission = (keys?: string[], acceptRoles?: RoleEnum[]) => {
  const [permission, setPermission] = useState(true);

  const isGranted = useAppSelector(policyGranted(keys || []));
  const auth = useAppSelector(getAuthenticated());

  useEffect(() => {
    const userRoles = auth?.roles ? Array.isArray(auth?.roles) ? auth.roles : [auth.roles]  : [];
    if (acceptRoles?.length) {
      const hasAcceptRole = acceptRoles.some(role => userRoles.includes(role));
      setPermission(hasAcceptRole)
      return;
    }
    if (fullPermissionsRoles.some(role => userRoles.includes(role))) {
      setPermission(true);
      return;
    }

    setPermission(isGranted);
  }, [isGranted, auth]);

  if (!keys?.length && !acceptRoles?.length) {
    return true;
  }

  return permission;
};
