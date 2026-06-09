import React from 'react';

import { DashOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';

interface MoreOptionsProps {
  onMenuClick: (info: any, data?: any) => void;
  menuOptions: { key: any; label: string }[];
  data?: any
}

export const MoreOptions = (props: MoreOptionsProps) => {
  const { onMenuClick, menuOptions, data } = props;

  const items: MenuProps['items'] = menuOptions;

  const onClick: MenuProps['onClick'] = ({ key }) => {
    onMenuClick({ key }, data);
  };

  return (
    <Dropdown menu={{ items, onClick }} trigger={['hover']}>
      <Button onClick={e => e.preventDefault()} type="text" size="small" shape="round">
        <Space>
          <DashOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
