import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Row, Space, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export interface DocumentsToolbar {
  initialSearch: string | any;
  onSearchChange: (search: string) => void;
}
export const DocumentsToolbar = ({ initialSearch = '', onSearchChange }: DocumentsToolbar) => {
  const { t } = useTranslation('document');
  const [searchStr, setSearchStr] = useState();
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    setSearchStr(initialSearch);
  }, [initialSearch]);

  const handleSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeOutId = setTimeout(() => {
      onSearchChange(search);
    }, 500);
    setTimer(timeOutId);
  };

  return (
    <Row style={{ padding: 10 }} gutter={[10, 10]}>
      <Space style={{ flex: 1 }}>
        <Input
          value={searchStr}
          onChange={handleSearchChange}
          allowClear
          placeholder={t('Search')}
          suffix={searchStr ? null : <SearchOutlined />}
          style={{ width: 300 }}
        />
      </Space>
    </Row>
  );
};
