
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import styles from './AuthLayout.module.less';
import { LayoutHeader } from './Header/LayoutHeader';
import { LeftSider } from './Sider/LeftSider';
import { AuthenticationFlow } from '../AuthenticationFlow';
import { RequireAuth } from '../RequireAuth';
import { MetaMenuAuthRouteObject } from '@/routes';
import { useAppSelector } from '@/store/hooks';
import { getDefaultOrganization } from '@/store/user';

const { Content } = Layout;

interface LayoutProps {
  // default routers
  routers?: MetaMenuAuthRouteObject[];
  // menu routers
  authRouters?: MetaMenuAuthRouteObject[];
}

const MainLayout = (props: LayoutProps) => {
  const defaultOrganization = useAppSelector(getDefaultOrganization());

  return (
    <RequireAuth>
      <AuthenticationFlow>
        <Layout className={styles.mainContainer}>
          <LayoutHeader />
          <Layout>
            {defaultOrganization && <LeftSider />}
            <Layout>
              <Content className={styles.contentContainer}>
                <Outlet />
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </AuthenticationFlow>
    </RequireAuth>
  );
};

export default MainLayout;
