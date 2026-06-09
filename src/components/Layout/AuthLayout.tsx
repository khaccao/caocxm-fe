
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import styles from './AuthLayout.module.less';
import { LayoutHeader } from './Header/LayoutHeader';
import RequireAuth from '../RequireAuth';
import { MetaMenuAuthRouteObject } from '@/routes';


const { Content } = Layout;

interface LayoutProps {
  // default routers
  routers?: MetaMenuAuthRouteObject[];
  // menu routers
  authRouters?: MetaMenuAuthRouteObject[];
}

export const AuthLayout = (props: LayoutProps) => {
  const { routers, authRouters } = props;
  // you can use this to generate your menus
  console.log('Layout: ', routers, authRouters);

  return (
    <RequireAuth>
      <Layout className={styles.mainContainer}>
        <LayoutHeader />
        <Layout>
          <Layout>
            <Content className={styles.contentContainer}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </RequireAuth>
  );
};
