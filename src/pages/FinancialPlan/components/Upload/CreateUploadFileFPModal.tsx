import  { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  InboxOutlined,
  UploadOutlined,
  FileExclamationOutlined,
} from '@ant-design/icons';
import { Modal, Button, Upload, UploadFile, message, Select } from 'antd'; 
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import styles from './CreateUploadFileFPModal.module.less';
import { EFinancialPlan } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { documentActions, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFileRoots } from '@/store/project';
import { RootState } from '@/store/types';
 
const { Option } = Select;

interface IProps {
  isUploadModal: boolean,
  setIsUploadModal: Dispatch<SetStateAction<boolean>>,
  date: Number,
  typeEFinancialPlan: string

}

export default function CreateUploadFileFPModal({ isUploadModal, setIsUploadModal, date, typeEFinancialPlan }: IProps) {

  const { t } = useTranslation('document');
  const company = useAppSelector(getCurrentCompany());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const folderRootId = useAppSelector(getFolderRootId());
  // [#20508][dung_lt][25/10/2024] Initialize the current month
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  });
  const documentPath = useAppSelector(getPathDocument());

  const lastPath = documentPath[(documentPath?.length || 1) - 1];
  
  
  const dispatch = useAppDispatch();
  const documentsuccess = useSelector((state: RootState) => state.document.documents);

  const listDataFileRoots = useAppSelector(getFileRoots());

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

  const findParentId = (type: string) => {
    if (type) {
      return listDataFileRoots.results.find((i: any) => i.name === type);
    }
    return folderRootId;
  } 

  const getFinanceTerm = (type: string) => {
    switch (type) {
      case EFinancialPlan.KeHoachTamUng12:
        return 1;
      case EFinancialPlan.KeHoachTamUng27:
        return 2;
      case EFinancialPlan.KeHoachThanhToan05:
        return 3;
      case EFinancialPlan.KeHoachThanhToan20:
      default:
        return 4;

    }
  }
  const handleSaveFolder = (values: any) => {
    if (company) {
      const existingLabels = documentsuccess?.results || [];

      const parentIdDelete = findParentId(typeEFinancialPlan)?.id;
      const currentYear = new Date().getFullYear();

      if (Array.isArray(existingLabels)) {
        const duplicateLabel = existingLabels.find((label: any) => label.name === values.name);
        if (duplicateLabel) {
          dispatch(
            documentActions.uploadFileFinance({
              companyId: company?.id,
              financeTerm: getFinanceTerm(typeEFinancialPlan),
              financeTermDate: `${currentYear}-${selectedMonth}-${date}`,
              file: values.file,
              labelid: duplicateLabel.id,
              parentId: parentIdDelete,
            }),
          );
        } else {
          if (lastPath?.id) {
            dispatch(
              documentActions.uploadFileFinance({
                companyId: company?.id,
                financeTerm: getFinanceTerm(typeEFinancialPlan),
                financeTermDate: `${currentYear}-${selectedMonth}-${date}`,
                file: values.file,
                labelid: lastPath?.id,
                parentId: parentIdDelete,
                ReloadPath: false,
              }),
            );
          } else {
            dispatch(
              documentActions.createLabelFinanceRequest({
                companyId: company?.id,
                label: {
                  ...values,
                  type: 'folder',
                  parentId: folderRootId,
                },
                projectId: -1,
                file: values.file,
                financeTerm: getFinanceTerm(typeEFinancialPlan),
                financeTermDate: `${currentYear}-${selectedMonth}-${date}`,
                parentId: parentIdDelete,
              }),
            );
          }
         
        }
      } else {
        console.error('Existing labels are not an array:', existingLabels);
      }
    }
  };

  const handleMonthChange = (value: string) => {
    const formattedMonth = value.padStart(2, '0');
    setSelectedMonth(formattedMonth);
  };

  const getNameFolder = (type: string | undefined) => {
    switch(type) {
      case EFinancialPlan.KeHoachTamUng12:
      case EFinancialPlan.KeHoachTamUng27:
        return t("Advance Payment Plan");
      case EFinancialPlan.KeHoachThanhToan05:
      case EFinancialPlan.KeHoachThanhToan20:
        return t("Payment Plan");
      default:
        return '';

    }
  }

  const handleOk = async () => {

    if (!selectedMonth) {
      message.error('Hãy chọn một tháng!.');
      return;
    }

    if (fileList.length === 0) {
      message.error('Chưa có file nào được chọn.');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileList[0] as any);
    const currentYear = new Date().getFullYear();
    await handleSaveFolder({
      name: `${getNameFolder(typeEFinancialPlan)} ${date}-${selectedMonth}-${currentYear}`,
      file: formData,
    });
    setFileList([]);
    setIsUploadModal(false);
  };

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
          <span>{getNameFolder(typeEFinancialPlan) + ' ' + t(`${date}th`)}</span>
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