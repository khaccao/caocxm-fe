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
  MenuProps,
  Modal,
  notification,
  PaginationProps,
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
import { useLocation } from 'react-router-dom';

import { defaultPagingParams, documentProject, FileStatus, FileStatusConstant, FileUpLoadName } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission, useWindowSize } from '@/hooks';
import { FileUpload, ViewFileNotOffice } from '@/pages/Components';
import { DocumentResponse } from '@/services/DocumentService';
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
import { getIssueQueryParams, issueActions } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import CreateUploadFilePaymentModal from '../Upload/CreateUploadFilePaymentModal';
import { CreateUploadFolderModal } from '../Upload/CreateUploadFolderModal';
import { UploadedContractsPopup } from '../Upload/UploadedContractPopup';

interface ContractstableProps {
  tp12?: number;
  tp27?: number;
  hdtp?: number;
  policies?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
}

//[#20992][hoang_nm][27/11/2024] Thêm enum ScreenType để sử dụng làm điều kiện dưới action xóa file
enum ScreenType {
  HOP_DONG_THAU_PHU = 'HOP_DONG_THAU_PHU',
  THANH_TOAN_12 = 'THANH_TOAN_12',
  THANH_TOAN_27 = 'THANH_TOAN_27 ',
}

const ContractsTable: React.FC<ContractstableProps> = ({ tp12, tp27, hdtp, policies }) => {
  const [notiApi, contextHolder] = notification.useNotification();
  const { t } = useTranslation(['document', 'common']);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const company = useAppSelector(getCurrentCompany());
  const isLoading = useAppSelector(getLoading(documentProject.GettingDocumentList));
  const [showUploadingPopup, setShowUploadingPopup] = useState(false);
  const [showUploadPayment, setShowUploadPayment] = useState(false);
  const [dateUploadPayment, setDateUploadPayment] = useState(0);
  const [paginationManager, setPaginationManager] = useState<PaginationProps>();
  const createUpdateFolderOpen = useAppSelector(getModalVisible(documentProject.CreateUpdateFolderModalName));
  const params = useAppSelector(getIssueQueryParams());
  const documents = useAppSelector(getDocuments());
  const selectedRowKeys = useAppSelector(getSelectedRowKeys());
  const isDownloadingDocument = useAppSelector(getLoading(documentProject.DownloadingDocument));
  const folderRootId = useAppSelector(getFolderRootId());
  console.log(folderRootId);
  const path = useAppSelector(getPathDocument());
  const [previewDataNotoffice, setPreviewDataNotOffice] = useState<any>(null);
  const [previewDataOffice, setPreviewDataOffice] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái để kiểm soát modal
  const setPath = (path: DocumentResponse[]) => {
    dispatch(documentActions.setDocumentPath(path));
  };
  const currentPathId = !path?.length ? folderRootId : path[path.length - 1].id;
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);
  const documentPath = useAppSelector(getPathDocument());
  const lastPath = documentPath[(documentPath?.length || 1) - 1];
  const location = useLocation();
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>(documents);

  const editGranted = usePermission(policies?.edit);
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
  //[#20508][dung_lt][24/10/2024]_ Hợp đồng thầu phụ - upload files
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
    dividedFiles.forEach((divFile: any) => {
      uploadFiles(
        params,
        divFile,
        (file: any) => {
          dispatch(documentActions.setUploadProgress(file));
        },
        () => {
          if (paginationManager) {
            const { current, pageSize } = paginationManager;
            const search = { ...params, page: current, pageSize };
            handleRequestDocument(search);
          } else {
            handleRequestDocument(params);
          }
        },
      );
    });
  };
  // [#20508][dung_lt][24/10/2024_ get tài liệu
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
  // [02/04] [ngoc_td] update đổi tên file & folder
  // [#20508][dung_lt][24/10/2024] thêm action cho row tabel
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

  // [#20508][dung_lt][24/10/2024] - tải tài liệu
  const downloadDocument = (document: DocumentResponse) => {
    dispatch(documentActions.downloadFile({ document, search: { companyId: company?.id } }));
  };

  //#region Xóa label

  // [#20508][dung_lt][24/10/2024] - xóa folder
  const handleRemoveLabel = (label: DocumentResponse) => {
    dispatch(documentActions.removeLabelRequest({ labelId: label.id, parentId: label.parentId || undefined }));
    if (currentScreenType === ScreenType.THANH_TOAN_12 || currentScreenType === ScreenType.THANH_TOAN_27) {
      const documentIds = label.id ? [String(label.id)] : [];

      dispatch(
        documentActions.deleteFileTPRequest({
          documentIds: documentIds,
        }),
      );
    }
  };

  // [#20508][dung_lt][24/10/2024] - xóa tài liệu
  const handleRemoveDocument = (document: DocumentResponse) => {
    dispatch(
      documentActions.removeDocumentRequest({ documentId: document.id, parentId: document.parentId || undefined }),
    );
  };

  const handleTableChange: TableProps<DocumentResponse>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { page: current, pageSize };
    handleRequestDocument(search);
    setPaginationManager(pagination);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total, ns: 'common' });

  // [#20508][dung_lt][24/10/2024] - yêu cầu get label
  const requestLabel = (document: DocumentResponse) => {
    dispatch(documentActions.getLabelRequest({ documentId: document.id, params: defaultPagingParams }));
    setPath([...path, document]);
  };
  // [#20508][dung_lt][24/10/2024] - tạo folder tài liệu
  const createFolder = () => {
    dispatch(showModal({ key: documentProject.CreateUpdateFolderModalName }));
  };

  const createPayment = (date: number) => {
    setShowUploadPayment(true);
    setDateUploadPayment(date);
  };

  // [#20508][dung_lt][24/10/2024] - menu upload action
  const uploadActions: MenuProps['items'] = [
    ...(hdtp
      ? [
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
      ]
      : []),
    ...(tp12
      ? [
        {
          key: 'PaymentOn12th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(12),
        },
      ]
      : []),
    ...(tp27
      ? [
        {
          key: 'PaymentOn27th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(27),
        },
      ]
      : []),
  ] as MenuProps['items'];

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
  // [24/12/2024] #21192 - bật màn hình OnlyOffice sang một trang mới cho các màn hình tài liệu
  const handleOpenNewTab = (path: any) => {
    if (!path || typeof path !== 'string') {
      console.error('Invalid path:', path);
      return;
    }
    const url = `${window.location.origin}${path}`;
    window.open(url, '_blank');
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
      dispatch(issueActions.downloadFileAttachmentOfIssue({ id: record.id, fileName: record.name, isView: true }));
      if (selectedProject) {
        handleOpenNewTab(`/preview-not-office/${record.id}/${selectedProject.companyId}/${record.name}`);
      } else {
        handleOpenNewTab(`/preview-not-office/${record.id}/${'1'}/${record.name}`);
      }
    } else if (extensions.includes(ext)) {
      if (selectedProject) {
        handleOpenNewTab(`/preview/${ext}/${record.id}/${selectedProject.companyId}`);
      } else {
        handleOpenNewTab(`/preview/${ext}/${record.id}/${'1'}`);
      }
    }
  };

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

  //[#20992][hoang_nm][27/11/2024] Check pathname xác định xem sử dụng type nào
  const currentScreenType: ScreenType = (() => {
    if (location.pathname === FileUpLoadName.hopdongthauphu) {
      return ScreenType.HOP_DONG_THAU_PHU;
    }
    if (location.pathname === FileUpLoadName.thanhtoanthauphu12) {
      return ScreenType.THANH_TOAN_12;
    }
    if (location.pathname === FileUpLoadName.thanhtoanthauphu27) {
      return ScreenType.THANH_TOAN_27;
    }
    return ScreenType.HOP_DONG_THAU_PHU;
  })();

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
          handleRemoveDocuments(selectedRowKeys, currentScreenType);
          close();
        },
      });
    }
  };
  // [#20508][dung_lt][24/10/2024] - xóa 1 or nhiều tài liệu
  const handleRemoveDocuments = (rowKeys: React.Key[], currentScreenType: ScreenType) => {
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

    if (removeDocuments.length > 0 && currentScreenType === ScreenType.HOP_DONG_THAU_PHU) {
      dispatch(
        documentActions.removeDocumentsRequest({
          documentIds: removeDocuments.map((document: any) => document.id),
          parentId: currentPathId,
        }),
      );
    }

    if (
      removeDocuments.length > 0 &&
      (currentScreenType === ScreenType.THANH_TOAN_12 || currentScreenType === ScreenType.THANH_TOAN_27)
    ) {
      dispatch(
        documentActions.deleteFileTPRequest({
          documentIds: removeDocuments.map((document: any) => document.parentId),
        }),
      );
      dispatch(
        documentActions.removeDocumentsRequest({
          documentIds: removeDocuments.map((document: any) => document.id),
          parentId: currentPathId,
        }),
      );
    }

    if (
      removelabels.length > 0 &&
      (currentScreenType === ScreenType.THANH_TOAN_12 || currentScreenType === ScreenType.THANH_TOAN_27)
    ) {
      dispatch(
        documentActions.deleteFileTPRequest({
          documentIds: removelabels.map((label: any) => label.id),
        }),
      );
    }
  };

  const dataSourceFinal = Array.isArray(documents?.results)
    ? documents?.results.filter((document: any) => document.type !== 'duthau' && document.type !== 'ungluong')
    : [];

  const marginTopAddNew = hdtp ? '58px' : '-55px';
  const marginRightAddNew = hdtp ? '10px' : '10px';
  const marginTopSelect = hdtp ? '57px' : '-55px';

  return (
    <div>
      {createUpdateFolderOpen && <CreateUploadFolderModal />}
      <CreateUploadFilePaymentModal
        isUploadModal={showUploadPayment}
        setIsUploadModal={setShowUploadPayment}
        date={dateUploadPayment}
        tp12={tp12}
        tp27={tp27}
      />
      <div style={{ padding: 5 }}>
        {contextHolder}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '99%',
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
                <Dropdown
                  menu={{ items: uploadActions }}
                  disabled={lastPath?.name?.toLowerCase().includes('thanh toán thầu phụ') || !createGranted}
                >
                  <Button
                    style={{
                      marginTop: marginTopAddNew,
                      marginRight: marginRightAddNew,
                      position: 'absolute',
                      top: '0',
                      right: '0',
                    }}
                    icon={<PlusOutlined />}
                    disabled={lastPath?.name?.toLowerCase().includes('thanh toán thầu phụ') || !createGranted}
                  >
                    {t('New')}
                  </Button>
                </Dropdown>

                {!!selectedRowKeys?.length && (
                  <div
                    style={{
                      top: '0',
                      right: '0',
                      marginTop: marginTopSelect,
                      position: 'absolute',
                      marginRight: '390px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography.Text style={{ marginRight: '10px' }}>
                      {`${selectedRowKeys.length} ${selectedRowKeys.length > 1 ? t('documents selected') : t('document selected')
                        }`}
                    </Typography.Text>
                    <WithPermission policyKeys={policies?.delete} strategy="disable">
                      <Button danger onClick={confirmRemoveDocuments}>
                        {t('Delete')}
                      </Button>
                    </WithPermission>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Table
          rowKey={record => record.id}
          virtual
          dataSource={dataSourceFinal || []}
          columns={columns}
          size="small"
          scroll={{ x: 800, y: windowSize[1] - 310 }}
          pagination={{
            current: documents?.page || params.page,
            pageSize: documents?.pageSize || params.pageSize,
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
      {showUploadingPopup && (
        <UploadedContractsPopup
          closeDialog={() => {
            setShowUploadingPopup(false);
            ConstantStatic.FileDatas = [];
            dispatch(documentActions.setListFilesUpload([]));
          }}
        ></UploadedContractsPopup>
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
    </div>
  );
};
export default ContractsTable;
