import { ReactNode, Children, isValidElement, cloneElement, ComponentType, ReactElement } from 'react';

import { usePermission } from '@/hooks/usePermission';
import NotAuth from '@/pages/403';

type WithPermissionProps = {
  policyKeys?: string[];
  strategy?: 'hide' | 'disable' | 'showResult'; // should do what when not granted
  children: ReactNode;
};

// export function withPermission<P>(
//   Component: ComponentType<P & { disabled?: boolean }>,
//   permissionProps?: WithPermissionProps,
// ) {
//   const Forwarded = forwardRef<Ref<any>, P & WithPermissionProps>((props, ref) => {
//     const { policyKeys: policyKeysProp, strategy: strategyProp, ...rest } = props;
//     const { policyKeys, strategy = 'hide' } = permissionProps || props;
//     const isGranted = policyKeys ? usePermission(policyKeys) : true;

//     if (strategy === 'hide') {
//       return isGranted ? <Component ref={ref} {...(rest as P)} /> : null;
//     }
//     if (strategy === 'disable') {
//       return <Component ref={ref} {...(rest as P)} disabled={!isGranted} />;
//     }

//     return <></>;
//   });

//   return Forwarded;
// }
export const WithPermission = ({ policyKeys, children, strategy = 'hide' }: WithPermissionProps) => {
  // eslint-disable-next-line
  const isGranted = policyKeys ? usePermission(policyKeys) : true;

  if (!isGranted) {
    return (
      <>
        {Children.map(children, child => {
          // Check if the child is a valid React element and clone it with the disabled prop
          if (strategy === 'hide') {
            return null;
          } else if (strategy === 'disable') {
            if (isValidElement(child)) {
              return cloneElement(child as ReactElement<any>, { disabled: true });
            }
            return child;
          } else if (strategy === 'showResult') {
            return <NotAuth />;
          }
        })}
      </>
    );
  }

  return <>{children}</>;
};
