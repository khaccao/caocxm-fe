import { useEffect, useState } from 'react';

import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import { CheckItemsDTO } from '@/services/IssueService';

export interface WeeklyAssignmentStatusOptionsProps {
  checkItem: CheckItemsDTO;
  children?: any[];
  onChange?: any;
}

export const WeeklyAssignmenttatusOptions = ({checkItem, onChange }: WeeklyAssignmentStatusOptionsProps) => {
  const { t } = useTranslation('status');
  const statusItems: MenuProps['items'] = [
    {
      key: 0,
      label: <Typography.Text>{t("Do not")}</Typography.Text>,
    },
    {
      key: 1,
      label: <Typography.Text>{t("Complete")}</Typography.Text>,
    },
    {
      key: 2,
      label: <Typography.Text>{t("No need")}</Typography.Text>,
    },
  ];
  const updateSelectedItem = () =>{
    for (let i = 0; i < statusItems.length; i++) {
      const element = statusItems[i];
      if (element && checkItem && element.key === checkItem.status) {
        return element
      }
    }
    return statusItems[0];
  }
  const [selectedItem, setSelectedItem] = useState<any>(updateSelectedItem());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=> {
    setSelectedItem(updateSelectedItem());
  }, [checkItem])

  const handleMenuClick: MenuProps['onClick'] = e => {
    if (statusItems) {
      // work.status = parseInt(e.key);
      const item = updateSelectedItem();
      setSelectedItem(item);
    }
    onChange(e.key, checkItem);
  };
  const colorStatus = () => {
    switch (checkItem.status) {
      case 0:
        return '#FAAD14';
      case 1:
        return colors.complete;
      case 2:
        return '#EB2F96';
      default:
        return '#8C8C8C';
    }
  };

  return (
    <Dropdown menu={{ items: statusItems, onClick: handleMenuClick, }} trigger={['click']}>
      <Button
        onClick={e => e.preventDefault()}
        type="default"
        style={{ 
          borderColor: colorStatus(),
          minWidth: "105px" 
        }}
        size="small"
        shape="default"
      >
        <Space>
          {selectedItem.label}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
