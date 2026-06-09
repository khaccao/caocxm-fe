/* eslint-disable import/order */
import { useCallback, useEffect, useState } from 'react';

import {
  DashOutlined,
  // EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  FolderAddOutlined,
  HomeOutlined,
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Dropdown,
  Input,
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
  UploadProps
} from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';

import { defaultPagingParams, documentProject, FileStatus, FileStatusConstant } from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { DocumentResponse, DocumentService } from '@/services/DocumentService';
import { uploadFiles } from '@/services/UploadFilesService';
import { getCurrentCompany } from '@/store/app';
import {
  ConstantStatic,
  documentActions,
  getDocuments,
  getFolderRootId,
  getPathDocument,
  getSelectedRowKeys,
} from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import { ViewFileNotOffice } from '../ViewFile/ViewFileNotOffice';
import { FileUpload } from '../ViewFile/ViewfileOffice';
import { CreateUpdateFolderModal } from './CreateUpdateFolderModal';
import { UploadedFilesPopup } from './UploadedFilesPopup';

interface DocumentsTableProps {
  pass?: any,
  policies?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
}
export const DocumentsTable = ({ policies, pass }: DocumentsTableProps) => {
  const [notiApi, contextHolder] = notification.useNotification();
  const { t } = useTranslation(['document', 'common']);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const company = useAppSelector(getCurrentCompany());
  const editGranted = usePermission(policies?.edit);
  const isLoading = useAppSelector(getLoading(documentProject.GettingDocumentList));
  const [showUploadingPopup, setShowUploadingPopup] = useState(false);
  const [paginationManager, setPaginationManager] = useState<PaginationProps>();
  const createUpdateFolderOpen = useAppSelector(getModalVisible(documentProject.CreateUpdateFolderModalName));
  const params = useAppSelector(getIssueQueryParams());
  const documents = useAppSelector(getDocuments());
  const selectedRowKeys = useAppSelector(getSelectedRowKeys());
  const isDownloadingDocument = useAppSelector(getLoading(documentProject.DownloadingDocument));
  const folderRootId = useAppSelector(getFolderRootId());
  const path = useAppSelector(getPathDocument());
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái để kiểm soát modal
  const [previewDataOffice, setPreviewDataOffice] = useState<any>(null);
  const [previewDataNotoffice, setPreviewDataNotOffice] = useState<any>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>(documents);
  const [dataSourceFinal, setDataSourceFinal] = useState<any>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  console.log(pass);
  const extraMarginLabels = [
    'Lương các bộ phận',
    'Thanh toán lương lần 1',
    'Thanh toán lương lần 2',
    'Thưởng cuối năm',
    'Bảng chi quỹ công đoàn',
    'Chi phí thưởng lễ tết',
    'Chi phí du lịch định kỳ',
    'Dự trù chi phí',
    'Tài liệu dự án',
    'Hồ sơ quyết toán công trình',
    'Chi phí công trình',
  ];

  const shouldAddExtraMargin = extraMarginLabels.includes(pass?.label);
  const marginRightValue = shouldAddExtraMargin ? '535px' : '385px';

  useEffect(() => {
    setDataSourceFinal(documents)
  }, [documents])
  const setPath = (path: DocumentResponse[]) => {
    dispatch(documentActions.setDocumentPath(path));
  };
  const currentPathId = !path?.length ? folderRootId : path[path.length - 1].id;
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);

  // eslint-disable-next-line
  const createGranted = usePermission(policies?.create);
  const deleteGranted = usePermission(policies?.delete);

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
    let ids =
      ConstantStatic.FileDatas.filter(
        x => x.status !== FileStatusConstant.success && x.status !== FileStatusConstant.error,
      ).map(x => x.fileId) ?? [];
    let filesList = fileList.filter(x => !ids.includes(`${params.labelid}_${x.name}`));
    if (filesList.length === 0) {
      return;
    }

    var files: FileStatus[] = filesList.map(file => {
      const formData = new FormData();
      formData.append('iFiles', file as RcFile);
      let key = `${params.labelid}_${file.name}`;
      return {
        file: formData,
        percent: 0,
        status: FileStatusConstant.repairing,
        fileId: key,
        name: file.name,
      };
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
      uploadFiles(
        params,
        divFile,
        (file: any) => {
          dispatch(documentActions.setUploadProgress(file));
        },
        () => {
          completedBatches++;
          // Fix call api liên tục khi upload file
          // So sánh file length file đã upload = với file đã tải lên.
          if (completedBatches === dividedFiles.length) {
            if (paginationManager) {
              const { current, pageSize } = paginationManager;
              const search = { ...params, page: current, pageSize };
              handleRequestDocument(search);
            } else {
              handleRequestDocument(params);
            }
          }
        },
      );
    });
  };
  // [21675] [ngoc_td] sửa hàm đổi tên cho cả file và folder
  const handleRename = (record: DocumentResponse) => {
    if (record.type === 'folder') {
      dispatch(
        documentActions.updateFolderRequest({
          idLabel: renamingFolderId, inputData: {
            name: newFolderName,
            color: null,
            type: record.type,
            labelCode: null,
          }, parentId: folderRootId
        }),
      );
    } else {
      dispatch(
        documentActions.updateFileRequest(
          {
            ...record,
            name: newFolderName,
          }
        )
      );
      dispatch(documentActions.getLabelRequest({ documentId: record.parentId, params: defaultPagingParams }));
    }
    setRenamingFolderId(null);
  }
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
  const getMoreActions = useCallback(
    (record: DocumentResponse) => {
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
          disabled: !deleteGranted,
        },
        {
          key: 'edit',
          label: 'Đổi tên',
          icon: <EditOutlined style={{ color: 'blue' }} />,
          onClick: () => {
            console.log('Selected document for renaming:', record);
            setRenamingFolderId(record.id);
            setNewFolderName(record.name || '');
          },
          disabled: !editGranted
        },
      ];
      const folderActions = [
        {
          key: 'delete',
          label: t('Delete'),
          icon: <DeleteOutlined style={{ color: 'red' }} />,
          onClick: () => handleRemoveLabel(record),
          disabled: !deleteGranted,
        },
        {
          key: 'edit',
          label: 'Đổi tên',
          icon: <EditOutlined style={{ color: 'blue' }} />,
          onClick: () => {
            setRenamingFolderId(record.id);
            setNewFolderName(record.name || '');
          }, disabled: !editGranted
        },
      ];

      if (record.type !== 'folder') {
        moreActions = moreActions.concat(fileActions);
      } else {
        moreActions = moreActions.concat(folderActions);
      }

      return moreActions;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [deleteGranted],
  );
  // [24/12/2024] #21192 - bật màn hình OnlyOffice sang một trang mới cho các màn hình tài liệu
  const handleOpenNewTab = (path: any) => {
    if (!path || typeof path !== 'string') {
      console.error('Invalid path:', path);
      return;
    }
    const url = `${window.location.origin}${path}`
    window.open(url, '_blank');
  }

  const handlePreviewImage = async (file: any) => {

    // Nếu có danh sách ảnh và có drawingId
    if (file) {
      const drawingId = file?.id?.toString() || '';

      DocumentService.Get.getFileFromId(drawingId).subscribe(async (res) => {
        try {
          // Chuyển blob từ res thành file
          const blob = res as Blob;
          const fileFromBlob = new File([blob], file.name || "preview.jpg", {
            type: blob.type || 'image/jpeg',
          });
          console.log(fileFromBlob);
          // Tạo URL từ file và gán vào preview
          const fileUrl = URL.createObjectURL(fileFromBlob);
          setPreviewImage(fileUrl);
          setIsPreviewModalVisible(true);
        } catch (error) {
          console.error('Lỗi chuyển đổi blob thành file:', error);
        }
      });
    }
  };

  const handlePreview = (record: any) => {
    const extensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'xlsm',
      'csv',
      'ppt',
      'pptx',
      'pps',
      'ppsx',
      'mdb',
      'accdb',
      'pst',
      'ost',
      'one',
      'onetoc2',
    ];
    const ext = record.name.split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      // dispatch(issueActions.downloadFileAttachmentOfIssue({ id: record.id, fileName: record.name, isView: true }));
      // if (selectedProject) {
      //   handleOpenNewTab(`/preview-not-office/${record.id}/${selectedProject.companyId}/${record.name}`);
      // } else {
      //   handleOpenNewTab(`/preview-not-office/${record.id}/${'1'}/${record.name}`);
      // }
      handlePreviewImage(record);
    } else if (extensions.includes(ext)) {
      if (selectedProject) {
        handleOpenNewTab(`/preview/${ext}/${record.id}/${selectedProject.companyId}`);
      } else {
        handleOpenNewTab(`/preview/${ext}/${record.id}/${'1'}`);
      }
    }
  };

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
    const search = { ...params, page: current, pageSize: pageSize };
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
          <div onDoubleClick={() => requestLabel(record)}>
            <img src="/icons/folder.svg" width={20} alt="" />
          </div>
        );
      },
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (value, record) => {
        if (record.id === renamingFolderId) {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={value}
                style={{ marginRight: 8 }}
              />
              <Button
                type="primary"
                onClick={() => {
                  console.log(record);
                  handleRename(record)
                }}
              >
                Save
              </Button>
            </div>
          );
        }
        return record.type !== 'folder' ? (
          <div style={{ cursor: 'default' }} onDoubleClick={() => handlePreview(record)}>
            {value}
          </div>
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
    const ext = record.name.split('.').pop();
    if (ext === 'pdf') {
      return <img src="/icons/pdf.svg" width={20} alt="" />;
    } else if (ext === 'xlsx' || ext === 'xls') {
      return <img src="/icons/excel.svg" width={20} alt="" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <img src="/icons/image.svg" width={20} alt="" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <img src="/icons/doc.svg" width={20} alt="" />;
    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      return <img src="/icons/video.svg" width={20} alt="" />;
    }
    return <FileOutlined style={{ marginRight: 10, fontSize: 20 }} />;
  };

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
              __html: `${t('Are you sure you want to delete?')}`,
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
        documentActions.removeLabelsRequest({
          labelIds: removelabels.map((label: any) => label.id),
          parentId: currentPathId,
        }),
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
      <div style={{ padding: 5 }}>
        {contextHolder}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
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
              ></div>
              <div>
                <Dropdown menu={{ items: uploadActions }} disabled={!createGranted}>
                  {/* <Button style={{ marginTop: selectedRowKeys?.length ? '' : '-75px' }} icon={<PlusOutlined />}>
                  {t('New')}
                </Button> */}
                  <Button
                    style={{
                      marginTop: '62px',
                      marginRight: '10px',
                      position: 'absolute',
                      top: '0',
                      right: '0',
                    }}
                    icon={<PlusOutlined />}
                    disabled={!createGranted}
                  >
                    {t('New')}
                  </Button>
                </Dropdown>
                {!!selectedRowKeys?.length && (
                  <div
                    style={{
                      top: '0',
                      right: '0',
                      marginTop: '62px',
                      position: 'absolute',
                      marginRight: marginRightValue,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Space direction="horizontal">
                      <Typography.Text style={{ marginRight: '5px' }}>
                        {`${selectedRowKeys.filter((item: any) => item !== undefined).length} ${selectedRowKeys.length > 1 ? t('documents selected') : t('document selected')
                          }`}
                      </Typography.Text>
                      <div>
                        <Button danger onClick={confirmRemoveDocuments} disabled={!deleteGranted}>
                          {t('Delete')}
                        </Button>
                      </div>
                    </Space>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Table
          rowKey={record => record.id}
          virtual
          dataSource={dataSourceFinal?.results || []}
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
      {showUploadingPopup && (
        <UploadedFilesPopup
          closeDialog={() => {
            setShowUploadingPopup(false);
            ConstantStatic.FileDatas = [];
            dispatch(documentActions.setListFilesUpload([]));
          }}
        ></UploadedFilesPopup>
      )}
      {isModalVisible && (
        <FileUpload
          previewDataOffice={previewDataOffice}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
        />
      )}
      {previewDataNotoffice && (
        <ViewFileNotOffice
          setPreviewDataNotOffice={setPreviewDataNotOffice}
          previewDataNotoffice={previewDataNotoffice}
        />
      )}
      <Modal
        open={isPreviewModalVisible}
        footer={null}
        width="60vw"
        style={{ top: 20 }}
        styles={{
          body: {
            padding: 0,
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }
        }}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
          }
        }}
      >
        {previewImage && (
          <img
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            src={previewImage}
          />
        )}
      </Modal>
    </div>
  );
};
