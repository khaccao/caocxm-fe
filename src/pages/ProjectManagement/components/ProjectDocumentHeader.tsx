import { Row, Space, Typography } from 'antd';

import { getActiveMenu } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

export const ProjectDocumentsHeader = () => {
  const activeMenu = useAppSelector(getActiveMenu());

  return (
    <Row style={{ padding: 10, backgroundColor: 'white' }}>
      <Space style={{ flex: 1 }}>
        <Typography.Title style={{ margin: 0 }} level={4}>
          {activeMenu?.label}
        </Typography.Title>
      </Space>
    </Row>
  );
};
