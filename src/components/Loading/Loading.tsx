import React, { FC } from 'react';

import { Spin } from 'antd';

export const Loading: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Spin size="large" />
    </div>
  );
};
