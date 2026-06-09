import React from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Layout, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

import styles from './LayoutHeader.module.less';
import { UserLogin } from './UserLogin';
import { colors } from '@/common/colors';
import { EButtonState } from '@/common/define';
import LogoNVH_header from '@/image/LogoNVH_header.svg';
import { useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';

const { Header } = Layout;

export const LayoutHeader = () => {
  const loading = useAppSelector(getLoading());

  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Reset tất cả button states về 'false' khi click logo
    Object.values(EButtonState).forEach((key) => {
      sessionStorage.setItem(key, 'false');
    });
    navigate('/projects');
  };

  return (
    <Header className={styles.headerContainer} style={{ borderBottom: `1px solid ${colors.header.border}` }}>
      <div className={styles.headerLeft}>
        <div
          className={styles.logoContainer}
          role="button"
          onClick={handleLogoClick}
          onKeyDown={handleLogoClick}
          tabIndex={0}
        >
          <img src={LogoNVH_header} alt="Logo" className={styles.logo} />
        </div>
      </div>
      <div className={styles.headerRight}>
        <UserLogin />
        <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} />} spinning={loading} />
      </div>
    </Header>
  );
};
