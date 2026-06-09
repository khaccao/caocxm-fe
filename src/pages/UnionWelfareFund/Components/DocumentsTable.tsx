import { useCallback, useEffect, useState } from 'react';

import { DashOutlined, DownloadOutlined, FundViewOutlined } from '@ant-design/icons';
import { Button, Dropdown, PaginationProps, Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { defaultPagingParams, documentProject, FileStatus, FileStatusConstant } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { DocumentResponse } from '@/services/DocumentService';
import { getCurrentCompany } from '@/store/app';
import { documentActions, getDocuments, getFolderRootId, getPathDocument, getSelectedRowKeys } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams } from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

export const DocumentsTable = () => {
  const { t } = useTranslation(['document', 'common']);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const company = useAppSelector(getCurrentCompany());
  const isLoading = useAppSelector(getLoading(documentProject.GettingDocumentList));
  const params = useAppSelector(getIssueQueryParams());
  const documents = useAppSelector(getDocuments());
  const selectedRowKeys = useAppSelector(getSelectedRowKeys());
  const getMoreActions = useCallback((record: DocumentResponse) => {
    const fileActions = [
      {
        key: 'download',
        label: t('Download'),
        icon: <DownloadOutlined style={{ color: '#48b691' }} />,
        onClick: () => downloadDocument(record),
      },
      {
        key: 'preview',
        label: t('Preview'),
        icon: <FundViewOutlined style={{ color: 'green' }} />,
        // onClick: () => handleRemoveDocument(record),
      },
    ];

    return fileActions;
  }, []);

  // [#20684][hao_lt][04/11/2024]_Các màn hình tài liệu
  const downloadDocument = (document: DocumentResponse) => {
    dispatch(documentActions.downloadFile({ document, search: { companyId: company?.id } }));
  };

  const handleTableChange: TableProps<DocumentResponse>['onChange'] = (pagination, filters, sorter) => {};

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total, ns: 'common' });

  const columns: TableProps<DocumentResponse>['columns'] = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      key: 'size',
      render: size => <>{size ? Utils.readableFileSize(size) : ''}</>,
    },
    {
      fixed: 'right',
      align: 'center',
      width: '80px',
      key: 'action',
      render: (_, record) => {
        return (
          !!getMoreActions(record).length && (
            <Dropdown menu={{ items: getMoreActions(record) }}>
              <Button icon={<DashOutlined style={{ fontSize: 12 }} />} shape="circle" />
            </Dropdown>
          )
        );
      },
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows?: DocumentResponse[]) => {
    dispatch(documentActions.setSelectedRowKeys(newSelectedRowKeys));
  };

  // eslint-disable-next-line
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 50,
  };

  return (
    <div>
      <div style={{ padding: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 8,
            alignItems: 'center',
          }}
        ></div>
        <Table
          rowKey={record => record.id}
          virtual
          dataSource={documents?.results || []}
          columns={columns}
          size="small"
          scroll={{ x: 800, y: windowSize[1] - 310 }}
          pagination={{
            current: defaultPagingParams?.page || params.page,
            pageSize: defaultPagingParams?.pageSize || params.pageSize,
            total: documents?.queryCount || 0,
            showSizeChanger: true,
            // responsive: true,
            showTotal,
          }}
          loading={isLoading}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          expandable={{
            showExpandColumn: false,
          }}
        />
      </div>
    </div>
  );
};
