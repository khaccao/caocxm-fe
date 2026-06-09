import React from 'react';

import { Typography } from 'antd';

export const InformationScreen = ({mess}: {mess: string}) => {

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
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
        <Typography.Title level={2}>{mess}</Typography.Title>
      </div>
    </div>
  );
};
