import React from 'react';

import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space } from 'antd';

const statusItems: MenuProps['items'] = [
  {
    label: 'Mới',
    key: '0',
  },
  {
    label: 'Đang thực hiện',
    key: '1',
  },
  {
    label: 'Hoàn thành',
    key: '3',
  },
];

interface BidStatusOptionsProps {
  issue: any;
}

export const BidStatusOptions = ({ issue }: BidStatusOptionsProps) => {
  const colorStatus = () => {
    switch (issue.status) {
      case 'new':
        return '#8C8C8C';
      case 'progress':
        return '#FAAD14';
      case 'completed':
        return '#52C41A';
      default:
        return '#8C8C8C';
    }
  };

  return (
    <Dropdown menu={{ items: statusItems }} trigger={['click']}>
      <Button
        onClick={e => e.preventDefault()}
        type="primary"
        style={{ backgroundColor: colorStatus() }}
        size="small"
        shape="round"
      >
        <Space>
          {issue.status}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
