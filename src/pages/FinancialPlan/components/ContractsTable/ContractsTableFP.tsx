/* eslint-disable import/order */
import {
  DashOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  HomeOutlined,
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
  Table,
  TableProps,
  Typography,
} from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useTranslation } from 'react-i18next';

import { defaultPagingParams, documentProject, EFinancialPlan } from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { FileUpload, ViewFileNotOffice } from '@/pages/Components';
import { UploadedContractsPopup } from '@/pages/Project/ListSubcontract/components/Upload/UploadedContractPopup';
import { DocumentResponse } from '@/services/DocumentService';
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
import { getFileRootsOutProject, getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import CreateUploadFileFPModal from '../Upload/CreateUploadFileFPModal';

interface ContractstableProps {
  typeEFinancialPlan: string;
  policies?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
}

const ContractsTableFP: React.FC<ContractstableProps> = ({ typeEFinancialPlan, policies }) => {
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
  const params = useAppSelector(getIssueQueryParams());
  const documents = useAppSelector(getDocuments());
  const selectedRowKeys = useAppSelector(getSelectedRowKeys());
  const folderRootId = useAppSelector(getFolderRootId());
  const path = useAppSelector(getPathDocument());
  const [previewDataNotoffice, setPreviewDataNotOffice] = useState<any>(null);
  const [previewDataOffice, setPreviewDataOffice] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái để kiểm soát modal
  const listDataFileRoots = useAppSelector(getFileRootsOutProject());
  const isCallRef = useRef(true);
  const [isDisableUpload, setIsDisableUpload] = useState(false);
  const createGranted = usePermission(policies?.create);
  const deleteGranted = usePermission(policies?.delete);
  const editGranted = usePermission(policies?.edit);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [dataSourceFinal, setDataSourceFinal] = useState<any>([]);
  const setPath = (path: DocumentResponse[]) => {
    dispatch(documentActions.setDocumentPath(path));
  };
  const currentPathId = !path?.length ? folderRootId : path[path.length - 1].id;
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);

  const documentPath = useAppSelector(getPathDocument());



  useEffect(() => {
    const lastPath = documentPath[(documentPath?.length || 1) - 1];
    checkDisableUpload(lastPath)
  }, [documentPath])
  // [#20959][dung_lt][26/11/2024] lấy label id của tab hiện tại
  useEffect(() => {
    if (listDataFileRoots && listDataFileRoots?.results?.length > 0) {
      const rootId = listDataFileRoots.results.find((i: any) => i.name === typeEFinancialPlan);
      if (rootId) {
        dispatch(documentActions.setFolderRootId(rootId?.id));
      } else {
        isCallRef.current = false;
        dispatch(documentActions.setFolderRootId(null));
        dispatch(documentActions.setDocuments([]));
      }
      dispatch(documentActions.setDocumentPath([]));
    }
    // eslint-disable-next-line
  }, [listDataFileRoots, typeEFinancialPlan]);

  // [#20959][dung_lt][26/11/2024] get giá trị label
  useEffect(() => {
    const lastPath = documentPath[documentPath?.length - 1];
    if (lastPath) {
      dispatch(documentActions.getLabelRequest({ documentId: lastPath?.id, params: defaultPagingParams }));
    } else {
      if (folderRootId && isCallRef.current) {
        dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
      }
    }
    // eslint-disable-next-line
  }, [folderRootId, documentPath, selectedProject]);

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

  // [#20508][dung_lt][24/10/2024] thêm action cho row tabel
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
        disabled: !deleteGranted
      },
      {
        key: 'edit',
        label: 'Đổi tên',
        icon: <EditOutlined style={{ color: 'blue' }} />,
        onClick: () => {
          setRenamingFolderId(record.id);
          setNewFolderName(record.name || '');
        },
        disabled: !editGranted
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

  // [#20508][dung_lt][24/10/2024] - tải tài liệu
  const downloadDocument = (document: DocumentResponse) => {
    dispatch(documentActions.downloadFile({ document, search: { companyId: company?.id } }));
  };

  // [#20508][dung_lt][24/10/2024] - xóa folder
  const handleRemoveLabel = (label: DocumentResponse) => {
    dispatch(documentActions.removeLabelRequest({ labelId: label.id, parentId: label.parentId || undefined }));
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

  const createPayment = (date: number) => {
    setShowUploadPayment(true);
    setDateUploadPayment(date);
  };

  // [#20508][dung_lt][24/10/2024] - menu upload action
  const uploadActions: MenuProps['items'] = [
    ...(typeEFinancialPlan === EFinancialPlan.KeHoachTamUng12
      ? [
        {
          key: 'AdvancePlan12th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(12),
        },
      ]
      : []),
    ...(typeEFinancialPlan === EFinancialPlan.KeHoachTamUng27
      ? [
        {
          key: 'AdvancePlan27th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(27),
        },
      ]
      : []),
    ...(typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan05
      ? [
        {
          key: 'PaymentPlan5th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(5),
        },
      ]
      : []),
    ...(typeEFinancialPlan === EFinancialPlan.KeHoachThanhToan20
      ? [
        {
          key: 'PaymentPlan20th',
          label: t('Upload'),
          icon: <UploadOutlined style={{ marginRight: 6, fontSize: 16, color: '#cf6eff' }} />,
          onClick: () => createPayment(20),
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
                  handleRename(record);
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
    const url = `${window.location.origin}${path}`
    window.open(url, '_blank');
  }

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
  // [#20508][dung_lt][24/10/2024] - xóa 1 or nhiều tài liệu
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

  // [hotfix][dung_lt][2/12/2024] kiểm tra xem đang nằm trong thư mục không để disable nó đi
  const checkDisableUpload = (lastPath: DocumentResponse) => {
    if (lastPath?.name?.includes(t("Advance Payment Plan")) || lastPath?.name?.includes(t("Payment Plan"))) {
      setIsDisableUpload(true);
    } else setIsDisableUpload(false);
  }
  // const dataSourceFinal = Array.isArray(documents?.results)
  // ? documents?.results.filter((document: any) => document.type !== 'duthau' && document.type !== 'ungluong')
  // : []
  useEffect(() => {
    setDataSourceFinal(Array.isArray(documents?.results)
      ? documents?.results.filter((document: any) => document.type !== 'duthau' && document.type !== 'ungluong')
      : [])
  }, [documents])
  useEffect(() => {
    console.log(dataSourceFinal);
  }, [dataSourceFinal])
  const marginTopAddNew = '-55px';
  const marginRightAddNew = '10px'
  const marginTopSelect = '-55px';

  // [#21801][dung_lt][4/12/2024] kiểm tra select document có phải là file k thì disable action xóa
  const checkDisableDelete = (rowkeys: any) => {
    const removeDocuments = (documents?.results || []).filter(
      (document: any) => rowkeys.includes(document.id) && document.type !== 'folder',
    );
    return !(removeDocuments?.length > 0);
  }

  return (
    <div>
      <CreateUploadFileFPModal
        isUploadModal={showUploadPayment}
        setIsUploadModal={setShowUploadPayment}
        date={dateUploadPayment}
        typeEFinancialPlan={typeEFinancialPlan}
      />
      <div style={{ padding: 0 }}>
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
              <div >
                <Dropdown
                  menu={{ items: uploadActions }}
                  disabled={isDisableUpload || !createGranted}
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
                  >
                    {t('New')}
                  </Button>
                </Dropdown>

                {!!selectedRowKeys?.length && checkDisableDelete(selectedRowKeys) && (
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
                    <Button danger onClick={confirmRemoveDocuments}>
                      {t('Delete')}
                    </Button>
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
export default ContractsTableFP;
