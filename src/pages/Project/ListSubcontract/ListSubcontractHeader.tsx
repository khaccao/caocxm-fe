import { useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Input, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { getActiveMenu } from '@/store/app';
import { documentActions, getDocumentQueryParams, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const ListSubcontractHeader: React.FC = () => {

  const { t } = useTranslation('document');
  const activeMenu = useAppSelector(getActiveMenu());
  const [searchStr, setSearchStr] = useState();
  const [timer, setTimer] = useState<any>(null);
  const dispatch = useAppDispatch();
  const params = useAppSelector(getDocumentQueryParams());

  const folderRootId = useAppSelector(getFolderRootId());
  const path = useAppSelector(getPathDocument());

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      const newParams = { ...params, page: 1, search };
      if (!path?.length && folderRootId) {
        dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: newParams }));
      } else {
        const lastPath = path[(path?.length || 1) - 1];
        if (lastPath) {
          dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: newParams }));
        }
      }
    }, 500);
    setTimer(timeoutId);
  };

  return (
    <Row
      style={{
        padding: 10,
        backgroundColor: 'white',
       
      }}
    >
      <Space style={{ flex: 1 }}>
        <Typography.Title style={{ margin: 0 }} level={4}>
        {activeMenu?.label}
        </Typography.Title>
      </Space>
      <Space style={{ marginRight: '115px' }}>
        <Input
          value={searchStr}
          onChange={onSearchChange}
          allowClear
          placeholder={t('Search')}
          suffix={searchStr ? null : <SearchOutlined />}
          style={{ width: 250 }}
        />
      </Space>
    </Row>
  );
};
