import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Row, Space, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { documentActions, getDocumentQueryParams, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';


export const DocumentsToolbar = () => {
  const { t } = useTranslation('document');
  const [searchStr, setSearchStr] = useState();
  const [timer, setTimer] = useState<any>(null);
  const dispatch = useAppDispatch();
  const params = useAppSelector(getDocumentQueryParams());
  const folderRootId = useAppSelector(getFolderRootId());
  const path = useAppSelector(getPathDocument());

  useEffect(() => {
    setSearchStr(params?.search);
  }, [params]);

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      const newParams = { ...params, page: 1, search };
      if (!path?.length && folderRootId) {
        dispatch(dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: newParams })));
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
    <Row style={{ padding: 10 }} gutter={[10, 10]}>
      <Space style={{ flex: 1 }}>
        <Input
          value={searchStr}
          onChange={onSearchChange}
          allowClear
          placeholder={t('Search')}
          suffix={searchStr ? null : <SearchOutlined />}
          style={{ width: 300 }}
        />
      </Space>
    </Row>
  );
};
