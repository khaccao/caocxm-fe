import { useEffect, useState } from 'react';

import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Button, Empty, Modal, PaginationProps, Select, Table, TableProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

// import Menucontext from './components/Menucontext';
import FolderPopup from './FolderPopup';
import styles from './SalaryAdvance.module.less';
import { folderColumn } from '../columns/folderColumn';
import {
  CreateUpdateIssueModalName,
  RemovingIssue,
  SavingIssue,
  UpdateStatusIssue,
  defaultPagingParams,
  GettingIssueByVersionList,
} from '@/common/define';
import { Loading } from '@/components';
import { useWindowSize } from '@/hooks';
import { BiddingDTO } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { importFileActions } from '@/store/importFile';
import { getIssueQueryParams, issueActions } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { showModal } from '@/store/modal';
import { getLabelChildren, projectActions, getFileRoots } from '@/store/project';

export const TableFolderPopup = ({ visible, onClose }: any) => {
  const { t } = useTranslation('bidding');
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const params = useAppSelector(getIssueQueryParams());
  const isLoading = useAppSelector(getLoading(GettingIssueByVersionList));
  const [dataInita, setDataInit] = useState<BiddingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const ascending = false;
  const ListLabelChild = useAppSelector(getLabelChildren());
  const listDataFileRoots = useAppSelector(getFileRoots());
  const [idFolder, setIdFolder] = useState<string>('');
  const [isModalFolderVisible, setIsModalFolderVisible] = useState<boolean>(false);
  const uploadFileForFolder = useAppSelector(getLoading('uploadFileForFolder'));
  const deleteDocument = useAppSelector(getLoading('deleteDocument'));

  useEffect(() => {
    if (!ListLabelChild) {
      setLoading(true);
    }
    if (ListLabelChild && ListLabelChild && ListLabelChild.length > 0) {
      const newData = mappingData(ListLabelChild);
      setDataInit(newData);
      setLoading(false);
    }
  }, [ListLabelChild, params, ListLabelChild?.length, isLoading, uploadFileForFolder, deleteDocument ]);

  const mappingData = (ListLabelChild: any) => {
    const results: BiddingDTO[] = [];
    ListLabelChild?.forEach((item: any) => {
      const datamap: BiddingDTO = {
        ...item,
        subject: item.name,
      };
      results.push(datamap);
    });
    return results;
  };

  const handleDownload = (file: any) => {
    dispatch(issueActions.downloadFileAttachmentOfIssue({ id: file.id, fileName: file.name }));
  };

  useEffect(() => {
    // if (!ListLabelChild) {
    //   dispatch(projectActions.setLabel(undefined));
    //   return;
    // }
    if (listDataFileRoots && listDataFileRoots.results && listDataFileRoots.results.length > 0) {
      const rootId = listDataFileRoots.results.find((i: any) => i.name === 'duthau');
      setIdFolder(rootId?.id);
      if (rootId) {
        dispatch(projectActions.getLabel({ id: rootId?.id, isbiding: true }));
      }
    }
  }, [visible, uploadFileForFolder, deleteDocument]);
  

  const confirmRemoveIssue = (value: any) => {
    dispatch(importFileActions.deleteDocument({ documentId: value.id, id: idFolder }));
  };
  const handleIssueTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...params, page: current, pageSize };
    if (ListLabelChild) {
      // dispatch(issueActions.getIssuesByMilestoneRequest({ projectId: ListLabelChild.id, params: search, pageSize: 20 }));
    }
  };
  const handleClick = (value: any) => {
    setIsModalFolderVisible(true);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  return (
    <>
      <Modal open={visible} onCancel={onClose} width={700} centered footer={null}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('Tài liệu dự thầu')}</div>
          <Button onClick={handleClick} type="primary" style={{ alignItems: 'right', marginRight: '20px' }}>
            {t('Tải file lên')}
          </Button>
        </div>
        <div style={{ padding: 10 }}>
          {ListLabelChild && ListLabelChild.length === 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                margin: 10,
              }}
            >
              <Empty
                description={
                  <>
                    <Typography.Title level={4}>{t('No data found based on filtering criteria')}</Typography.Title>
                    {/* <Typography.Text>{t('Try reselecting the filtering criteria to find your data')}</Typography.Text> */}
                  </>
                }
              />
            </div>
          )}
          {ListLabelChild && ListLabelChild.length > 0 && (
            <div>
              {loading ? <Loading /> :
                <Table
                  className="biddingCustom"
                  rowKey={record => record.id}
                  dataSource={dataInita!}
                  columns={folderColumn({ t, handleDownload, confirmRemoveIssue })}
                  style={{ width: '100%' }}
                  size="small"
                  scroll={{ x: 600, y: windowSize[1] - 310 }}
                  loading={uploadFileForFolder || deleteDocument || loading}
                  pagination={false}
                  onChange={handleIssueTableChange}
                  expandable={{
                    expandIcon: ({ expanded, onExpand, record }) => {
                      return null;
                    },
                  }}
                />
              }
            </div>
          )}
        </div>
      </Modal>
      <FolderPopup visible={isModalFolderVisible} onClose={() => setIsModalFolderVisible(false)} labelid={idFolder} />
    </>
  );
};
