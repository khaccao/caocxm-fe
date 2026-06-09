import { useCallback, useEffect, useState } from 'react';

import {
  // EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  HomeOutlined,
  DashOutlined,
  DownloadOutlined,
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
  FolderAddOutlined,
  FilePdfOutlined,
  FundViewOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileUnknownOutlined,
  FileOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Divider,
  Dropdown,
  Modal,
  notification,
  PaginationProps,
  Space,
  Spin,
  Table,
  TableProps,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';

import { CreateUpdateFolderModal } from './CreateUpdateFolderModal';
import { UploadedFilesPopup } from './UploadedFilesPopup';
import { defaultPagingParams, documentProject, FileStatus, FileStatusConstant } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { FileUpload } from '@/pages/Components';
import { DocumentResponse } from '@/services/DocumentService';
import { uploadFiles } from '@/services/UploadFilesService';
import { getCurrentCompany } from '@/store/app';
import { ConstantStatic, documentActions, getDocuments, getFolderRootId, getPathDocument, getSelectedRowKeys } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams} from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

export const DocumentsTable = () => {
  const [notiApi, contextHolder] = notification.useNotification();
  const { t } = useTranslation(['document', 'common']);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const company = useAppSelector(getCurrentCompany());
  const isLoading = useAppSelector(getLoading(documentProject.GettingDocumentList));
  const [showUploadingPopup, setShowUploadingPopup] = useState(false);
  const [paginationManager, setPaginationManager] = useState<PaginationProps>();
  const createUpdateFolderOpen = useAppSelector(getModalVisible(documentProject.CreateUpdateFolderModalName));
  const params = useAppSelector(getIssueQueryParams());
  const documents = useAppSelector(getDocuments());
  const selectedRowKeys= useAppSelector(getSelectedRowKeys());;
  const isDownloadingDocument = useAppSelector(getLoading(documentProject.DownloadingDocument));
  const folderRootId = useAppSelector(getFolderRootId());
  const path = useAppSelector(getPathDocument());
  const [previewData, setPreviewData] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái để kiểm soát modal
  const setPath = (path: DocumentResponse[]) => {
    dispatch(documentActions.setDocumentPath(path));
  };
  const currentPathId = !path?.length ? folderRootId : path[path.length - 1].id;
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);
  
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file, fileList) => {
      
      handleUploadFiles(fileList);
      return false;
    },
  };
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - upload tài liệu
  const handleUploadFiles = (fileList: UploadFile[]) => {
    const params = {
      isPublish: true,
      companyId: company?.id,
      labelid: !path.length && folderRootId ? folderRootId : path[path.length - 1]?.id,
    };
    let ids = ConstantStatic.FileDatas.filter(x => x.status !== FileStatusConstant.success && x.status !== FileStatusConstant.error).map(x => x.fileId) ?? [];
    let filesList = fileList.filter(x => !ids.includes(`${params.labelid}_${x.name}`));
    if (filesList.length === 0) {
      return;
    }
    
    var files: FileStatus[] = filesList.map(file =>{
      const formData = new FormData();
      formData.append('iFiles', file as RcFile);
      let key = `${params.labelid}_${file.name}`;
      return {
        file: formData,
        percent: 0,
        status: FileStatusConstant.repairing,
        fileId: key,
        name: file.name,
      }
    });
    setShowUploadingPopup(true);
    dispatch(
      documentActions.uploadFiles({
        body: files,
        params,
      }),
    );
    let dividedFiles = Utils.divideArray(files, Math.floor(files.length / 10) + 1);
    let completedBatches = 0;
    dividedFiles.forEach((divFile: any) => {
      uploadFiles( params,divFile, (file: any) => {
        dispatch(documentActions.setUploadProgress(file))
      }, () => {
        completedBatches++;
        // Fix call api liên tục khi upload file 
        // So sánh file length file đã upload = với file đã tải lên.
        if (completedBatches === dividedFiles.length) { 
          if (paginationManager){
            const { current, pageSize } = paginationManager;
            const search = { ...params, page: current, pageSize };
            handleRequestDocument(search);
          }
          else
          {
            handleRequestDocument(params);
          }
        }
      } );
    })
  };
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa tài liệu
  const handleRequestDocument = (newParams?: any) => {
    const search = {
      ...params,
      ...newParams,
    };
    if (!path?.length && folderRootId) {
      dispatch(dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: search })));
    } else {
      const lastPath = path[(path?.length || 1) - 1];
      if (lastPath) {
        dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: search }));
      }
    }
  };

  useEffect(() => {
    onSelectChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const breadcrumbItems: BreadcrumbItemType[] = [
      {
        title: <HomeOutlined style={{ cursor: 'pointer' }} />,
        onClick: () => {
          if (path.length > 0 && folderRootId) {
            dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params }));
            setPath([]);
          }
        },
      },
    ];
    if (path?.length > 0) {
      path.forEach((p: any, index: any) => {
        breadcrumbItems.push({
          title: <span style={{ cursor: 'pointer' }}>{`${p.name}`}</span>,
          onClick: () => {
            if (index < path.length - 1)
              dispatch(documentActions.getLabelRequest({ documentId: p.id, params: defaultPagingParams }));
            setPath(path.slice(0, index + 1));
          },
        });
      });
    }
    setBreadcrumbs(breadcrumbItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, selectedProject]);

  useEffect(() => {
    if (isDownloadingDocument) {
      notiApi.open({
        message: t('Uploading item'),
        description: (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <Typography.Text>{t('Starting upload')}</Typography.Text>
            <Spin indicator={<LoadingOutlined />} />
          </div>
        ),
        duration: 0,
        placement: 'top',
      });
    } else {
      notiApi.destroy();
    }
  }, [isDownloadingDocument]);

  // [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - thêm action cho row tabel
  const getMoreActions = useCallback((record: DocumentResponse) => {
    let moreActions: any[] = [];
    const fileActions = [
      {
        key: 'download',
        label: t('Download'),
        icon: <DownloadOutlined style={{ color: '#48b691' }} />,
        onClick: () => downloadDocument(record),
      },
      {
        key: 'delete',
        label: t('Delete'),
        icon: <DeleteOutlined style={{ color: 'red' }} />,
        onClick: () => handleRemoveDocument(record),
      },
      {
        key: 'preview',
        label: t('Preview'),
        icon: <FundViewOutlined style={{ color: 'green' }} />,
        onClick: () => handlePreview(record),
      },
    ];
    const folderActions = [
      {
        key: 'delete',
        label: t('Delete'),
        icon: <DeleteOutlined style={{ color: 'red' }} />,
        onClick: () => handleRemoveLabel(record),
      },
    ];

    if (record.type !== 'folder') {
      moreActions = moreActions.concat(fileActions);
    } else {
      moreActions = moreActions.concat(folderActions);
    }

    return moreActions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreview = (record: any) => {
    setIsModalVisible(true)
    setPreviewData(record)
  }

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - tải tài liệu
  const downloadDocument = (document: DocumentResponse) => {
    dispatch(documentActions.downloadFile({ document, search: { companyId: company?.id } }));
  };

// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa folder
  const handleRemoveLabel = (label: DocumentResponse) => {
    dispatch(documentActions.removeLabelRequest({ labelId: label.id, parentId: label.parentId || undefined }));
  };
// [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa tài liệu
  const handleRemoveDocument = (document: DocumentResponse) => {
    dispatch(
      documentActions.removeDocumentRequest({ documentId: document.id, parentId: document.parentId || undefined }),
    );
  };

  const handleTableChange: TableProps<DocumentResponse>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...params, page: current, pageSize:pageSize };
    handleRequestDocument(search);
    setPaginationManager(pagination);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total, ns: 'common' });

  const requestLabel = (document: DocumentResponse) => {
    dispatch(documentActions.getLabelRequest({ documentId: document.id, params: defaultPagingParams }));
    setPath([...path, document]);
  };
  // [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - tạo folder tài liệu
  const createFolder = () => {
    dispatch(showModal({ key: documentProject.CreateUpdateFolderModalName }));
  };

  const uploadActions = [
    {
      key: 'createFolder',
      label: t('New folder'),
      icon: <FolderAddOutlined style={{ fontSize: 16 }} />,
      onClick: createFolder,
    },
    {
      key: 'uploadLabel',
      label: (
        <Upload {...uploadProps}>
          <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} /> {t('Upload')}
        </Upload>
      ),
    },
  ];

  const columns: TableProps<DocumentResponse>['columns'] = [
    {
      dataIndex: 'type',
      key: 'type',
      width: 40,
      align: 'center',
      render: (value, record) => {
        return value !== 'folder' ? (
          <>{renderIconFile(value, record)}</>
        ) : (
          <FolderOutlined
            onDoubleClick={() => requestLabel(record)}
            style={{ marginRight: 10, fontSize: 20, cursor: 'pointer' }}
          />
        );
      },
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (value, record) => {
        return record.type !== 'folder' ? (
          <>{value}</>
        ) : (
          <Typography.Text style={{ cursor: 'pointer' }} onDoubleClick={() => requestLabel(record)}>
            {value}
          </Typography.Text>
        );
      },
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

  const renderIconFile = (value: any, record: any) => {
    const ext = record.name.split('.').pop();;
    if (ext === 'pdf') {
      return  <FilePdfOutlined  style={{ marginRight: 10, fontSize: 20 }}></FilePdfOutlined>
    } else if (ext === 'xlsx' || ext === 'xls') {
      return  <FileExcelOutlined  style={{ marginRight: 10, fontSize: 20 }}></FileExcelOutlined>
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <FileImageOutlined  style={{ marginRight: 10, fontSize: 20 }} />
    }  else if (['doc', 'docx'].includes(ext)) {
      return <FileWordOutlined style={{ marginRight: 10, fontSize: 20 }} />;
    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      return <VideoCameraOutlined style={{ marginRight: 10, fontSize: 20 }} />;
  }
    return  <FileOutlined style={{ marginRight: 10, fontSize: 20 }}/>
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows?: DocumentResponse[]) => {
    dispatch(documentActions.setSelectedRowKeys(newSelectedRowKeys));
  };

  // eslint-disable-next-line
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 50,
  };

  const confirmRemoveDocuments = () => {
    if (selectedRowKeys) {
      Modal.confirm({
        title: t('Delete'),
        content: (
          <div
            dangerouslySetInnerHTML={{
              __html: `${t("Are you sure you want to delete?")}`,
            }}
          />
        ),
        closable: true,
        onOk: close => {
          handleRemoveDocuments(selectedRowKeys);
          close();
        },
      });
    }
  };
  // [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa 1 or nhiều tài liệu
  const handleRemoveDocuments = (rowKeys: React.Key[]) => {
    const removelabels = (documents?.results || []).filter(
      (document: any) => rowKeys.includes(document.id) && document.type === 'folder',
    );
    const removeDocuments = (documents?.results || []).filter(
      (document: any) => rowKeys.includes(document.id) && document.type !== 'folder',
    );
    if (removelabels.length > 0) {
      dispatch(
        documentActions.removeLabelsRequest({ labelIds: removelabels.map((label: any) => label.id), parentId: currentPathId }),
      );
    }
    if (removeDocuments.length > 0) {
      dispatch(
        documentActions.removeDocumentsRequest({
          documentIds: removeDocuments.map((document: any) => document.id),
          parentId: currentPathId,
        }),
      );
    }
  };
  return (
    <div>
      {createUpdateFolderOpen && <CreateUpdateFolderModal />}
      <div style={{ padding: 10 }}>
        {contextHolder}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 8,
            alignItems: 'center',
          }}
        >
          {!!path?.length ? (
            <Breadcrumb items={breadcrumbs} style={{ padding: '0 18px 12px' }} />
          ) : (
            <div style={{ width: 1 }}></div>
          )}
          {!!folderRootId && (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
               <div
                style={{
                  // visibility: isUploadingDocument && uploadProgress !== undefined ? 'visible' : 'hidden',
                  transition: 'all 300ms ease-in-out',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  marginRight: 5,
                  alignItems: 'center',
                }}
              > 
              </div>
              <Dropdown menu={{ items: uploadActions }}>
                <Button style={{marginTop: selectedRowKeys?.length ? '' : '-75px'}} icon={<PlusOutlined />}>{t('New')}</Button>
              </Dropdown>
              {!!selectedRowKeys?.length && (
                <>
                  <Divider type="vertical" style={{ borderInlineStart: '1px solid rgba(0, 0, 0, 0.16)' }} />
                  <Space direction="horizontal">
                    <Typography.Text>
                    {`${selectedRowKeys.filter((item: any) => item !== undefined).length} ${selectedRowKeys.length > 1 ? t('documents selected') : t('document selected')}`}
                    </Typography.Text>
                    <div>
                      <Button danger onClick={confirmRemoveDocuments}>
                      {t('Delete')}
                      </Button>
                    </div>
                  </Space>
                </>
              )}
            </div>
          )}
        </div>
        <Table
          rowKey={record => record.id}
          virtual
          dataSource={(documents?.results || [])}
          columns={columns}
          size="small"
          scroll={{ x: 800, y: windowSize[1] - 310 }}
          pagination={{
            current: documents?.page || params.page,
            pageSize: documents?.pageSize || params.pageSize,
            total: documents?.queryCount || 0,
            showSizeChanger: true,
            responsive: true,
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
      {showUploadingPopup && <UploadedFilesPopup closeDialog={() => {
        setShowUploadingPopup(false);
        ConstantStatic.FileDatas = [];
        dispatch(documentActions.setListFilesUpload([]));
      }
        }></UploadedFilesPopup> }
      {previewData && 
      <FileUpload 
      previewData={previewData}
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
       />}
    </div>
  );
};
