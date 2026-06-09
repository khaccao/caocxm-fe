import React from 'react';

import { Typography } from 'antd';

import { getActiveMenu } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

export const ComingSoon = () => {
  const activeMenu = useAppSelector(getActiveMenu());

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
      <Typography.Title style={{ marginLeft: 20, marginTop: 10 }} level={4}>
        {activeMenu?.label}
      </Typography.Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 130px)',
          backgroundColor: 'white',
          margin: 10,
        }}
      >
        <Typography.Title level={2}>Tính năng đang phát triển</Typography.Title>
      </div>
    </div>
  );
};
