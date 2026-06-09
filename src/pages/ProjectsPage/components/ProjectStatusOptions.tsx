import React from 'react';

import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface ProjectStatusOptionsProps {
  project: any;
}

const statusItems: MenuProps['items'] = [
  {
    label: 'Đang thi công',
    key: '0',
  },
  {
    label: 'Đang dự thầu',
    key: '1',
  },
  {
    label: 'Hoàn thành',
    key: '3',
  },
];

export const ProjectStatusOptions = ({ project }: ProjectStatusOptionsProps) => {
  const { t } = useTranslation(['projects']);

  const infoByStatus = () => {
    switch (project.status) {
      case 'executing':
        return {
          color: '#8C8C8C',
          status: `${t('project.status.executing')}`,
        };
      case 'bidding':
        return {
          color: '#FAAD14',
          status: `${t('project.status.bidding')}`,
        };
      case 'completed':
        return {
          color: '#52C41A',
          status: `${t('project.status.completed')}`,
        };
      default:
        return {
          color: '#FAAD14',
          status: `${t('project.status.bidding')}`,
        };
    }
  };

  return (
    <Dropdown menu={{ items: statusItems }} trigger={['click']}>
      <Button
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        type="primary"
        style={{ backgroundColor: infoByStatus().color, width: '150px' }}
        size="small"
        shape="round"
      >
        <Space>
          {infoByStatus().status}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
