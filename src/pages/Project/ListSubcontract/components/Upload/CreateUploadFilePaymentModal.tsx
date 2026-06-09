/* eslint-disable import/order */
import { useEffect, useRef, useState } from 'react';

import {
  FileExclamationOutlined,
  InboxOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Button, message, Modal, Select, Upload, UploadFile } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { FileUpLoadName } from '@/common/define';
import { documentActions, getFileData, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFileRoots, getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import styles from './CreateUploadFilePaymentModal.module.less';

const { Option } = Select;

export default function CreateUploadFilePaymentModal({ isUploadModal, setIsUploadModal, date, hdtp, tp12, tp27 }: any) {
  //console.log('isUploadModal', isUploadModal);
  const updatedDate = tp12 === 12 && tp27 === 27 ? '12-27' : date;
  const { t } = useTranslation('document');
  const selectedProject = useAppSelector(getSelectedProject());
  const projectCode = selectedProject?.code;
  const fileData = useAppSelector(getFileData());
  //console.log('fileData', fileData);
  const resetFileData = () => dispatch(documentActions.setFileData([]));

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const path = useAppSelector(getPathDocument());
  const folderRootId = useAppSelector(getFolderRootId());
  const documentPath = useAppSelector(getPathDocument());
  //console.log('documentPath', documentPath);
  // [#20508][dung_lt][25/10/2024] Initialize the current month

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  });

  const dispatch = useAppDispatch();
  const lastPath = documentPath[(documentPath?.length || 1) - 1];
  //console.log('lastPath', lastPath);
  const documentsuccess = useSelector((state: RootState) => state.document.documents);

  const listDataFileRoots = useAppSelector(getFileRoots());
  const isCallRef = useRef(true);

  const rootId12 = listDataFileRoots?.results?.find((i: any) => i.name === 'thanhtoanthauphu12');
  const rootId27 = listDataFileRoots?.results?.find((i: any) => i.name === 'thanhtoanthauphu27');

  useEffect(() => {
    resetFileData();
  }, [date, fileList, selectedMonth, isUploadModal]);

  // useEffect(() => {
  //   const lastPath = documentPath?.[documentPath.length - 1];
  //   if (lastPath) {
  //     dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: defaultPagingParams }));
  //   } else if (folderRootId && isCallRef.current) {
  //     dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
  //   }
  // }, [dispatch, folderRootId, documentPath, selectedProject]);

  const months = [
    { value: '01', label: t('January') },
    { value: '02', label: t('February') },
    { value: '03', label: t('March') },
    { value: '04', label: t('April') },
    { value: '05', label: t('May') },
    { value: '06', label: t('June') },
    { value: '07', label: t('July') },
    { value: '08', label: t('August') },
    { value: '09', label: t('September') },
    { value: '10', label: t('October') },
    { value: '11', label: t('November') },
    { value: '12', label: t('December') },
  ];

  const props = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: UploadFile) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
  };

  const handleCancel = () => {
    setIsUploadModal(false);
  };

  //[21320][hoang_nm][13/01/2025] Chỉnh lại logic tải file và tên folder màn hình TTTP 12,27
  const handleSaveFolder = (values: any) => {
    if (selectedProject) {
      //[#20992][hoang_nm][27/11/2024] Check phải select project
      const existingLabels = documentsuccess?.results || [];
      const parentIdDelete = tp12 ? rootId12?.id : tp27 ? rootId27?.id : folderRootId;
      const currentYear = new Date().getFullYear();
      if (hdtp) {
        //[#20992][hoang_nm][27/11/2024] Check mh hdtp thì tạo label vào tạo file
        if (!documentPath.length) {
          dispatch(
            documentActions.createLabelRequest({
              label: {
                ...values,
                type: 'folder',
                parentId: folderRootId,
              },
              projectId: selectedProject.id,
            }),
          );
        } else {
          dispatch(
            documentActions.createLabelRequest({
              label: {
                ...values,
                type: 'folder',
                parentId: lastPath?.id || undefined,
              },
              projectId: selectedProject.id,
            }),
          );
        }
      } else if (tp12 || tp27) {
        //[#20992][hoang_nm][27/11/2024] Check nếu sang mh ttp12,27 thì check thêm các điều kiện tiếp
        if (Array.isArray(existingLabels)) {
          const duplicateLabel = existingLabels.find((label: any) => label.name === values.name);
          //console.log('duplicateLabel', duplicateLabel);
          if (duplicateLabel) {
            console.log(projectCode, 'projectCode')
            dispatch(
              documentActions.uploadFilePayment({
                projectId: selectedProject?.id,
                projectCode: projectCode,
                paymentTerm: date === 12 ? 0 : 1,
                paymentTermDate: `${currentYear}-${selectedMonth}-${date}`,
                file: values.file,
                labelid: duplicateLabel.id,
                parentId: parentIdDelete,
                selectedMonth,
              }),
            );
          } else {
            if (!documentPath.length && fileData[0]?.code !== undefined) {
              console.log('createLabelTPRequest !documentPath.length && fileData[0]?.code !== undefined');

              dispatch(
                documentActions.createLabelTPRequest({
                  label: {
                    ...values,
                    type: 'folder',
                    parentId: folderRootId,
                  },
                  projectId: selectedProject.id,
                  projectCode: projectCode, // Convert projectCode to number, use 0 as fallback
                  isThauPhu: true,
                  file: values.file,
                  paymentTerm: date === 12 ? 0 : 1,
                  paymentTermDate: `${currentYear}-${selectedMonth}-${date}`,
                  parentId: parentIdDelete,
                  selectedMonth,
                }),
              );
            } else {
              console.log('createLabelTPRequest');

              dispatch(
                documentActions.createLabelTPRequest({
                  label: {
                    ...values,
                    type: 'folder',
                    parentId: folderRootId,
                  },
                  projectId: selectedProject.id,
                  projectCode: projectCode, // Convert projectCode to number, use 0 as fallback
                  isThauPhu: true,
                  file: values.file,
                  paymentTerm: date === 12 ? 0 : 1,
                  paymentTermDate: `${currentYear}-${selectedMonth}-${date}`,
                  parentId: parentIdDelete,
                  selectedMonth,
                }),
              );
            }
          }
        } else {
          console.error('Existing labels are not an array:', existingLabels);
        }
      }
    }
  };
  const handleMonthChange = (value: string) => {
    const formattedMonth = value.padStart(2, '0');
    setSelectedMonth(formattedMonth);
  };

  const handleOk = async () => {
    if (!selectedMonth) {
      message.error('Please select a month.');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileList[0] as any);

    const currentYear = new Date().getFullYear();

    const fileNameTTTP = `${FileUpLoadName.ThanhToanThauPhu}_[${fileData?.[0]?.name}]_${selectedMonth}${currentYear}`;

    await handleSaveFolder({
      name: fileNameTTTP,
      file: formData,
      paymentTerm: date === 12 ? 0 : 1,
      paymentTermDate: `${currentYear}-${selectedMonth}-${date}`,
    });

    setIsUploadModal(false);
  };

  //[21320][hoang_nm][13/01/2025] Chỉnh lại logic tải file và tên folder màn hình TTTP 12,27
  // useEffect(() => {
  //   if (fileData.length > 0 && fileData[0]?.code !== undefined) {
  //     handleOk();
  //   }
  // }, [fileData[0]?.code]);

  return (
    <Modal
      visible={isUploadModal}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      className={styles['custom-modal']}
      width={600}
      title={
        <div className={styles['modal-header']}>
          <span>{t(`Payment Documents ${date}th`)}</span>
        </div>
      }
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginRight: 80 }}
      >
        <span style={{ marginRight: 10, fontSize: '16px', fontWeight: 700 }}>{t('Month')}:</span>
        {/* [21145][hoang_nm][12/12/2024]Fix hiển thị tháng trên màn hình upload */}
        <Select style={{ width: '50%' }} onChange={handleMonthChange} value={selectedMonth}>
          {months.map(month => (
            <Option key={month.value} value={month.value}>
              {month.label}
            </Option>
          ))}
        </Select>
      </div>

      <Upload.Dragger
        {...props}
        style={{
          background: 'rgba(250, 250, 250, 1)',
          width: '100%',
          maxWidth: 370,
          margin: 'auto',
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className={styles['ant-upload-text']}>{t('Select or drag and drop documents')}</p>
      </Upload.Dragger>

      <div style={{ textAlign: 'right', marginTop: 20, marginRight: 40 }}>
        <Button
          onClick={handleCancel}
          style={{
            marginRight: 10,
            borderRadius: 50,
            border: '1px solid rgba(9, 109, 217, 1)',
            color: 'rgba(9, 109, 217, 1)',
          }}
        >
          <FileExclamationOutlined />
          {t('Cancel')}
        </Button>
        <Button type="primary" onClick={handleOk} style={{ borderRadius: 50 }}>
          {t('Upload')}
          <UploadOutlined />
        </Button>
      </div>
    </Modal>
  );
}
