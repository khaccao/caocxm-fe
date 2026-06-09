import { useEffect, useState } from 'react';

import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { ShowViewFileModal } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getDataFileView, issueActions } from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';

const isSupportedFileType = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'html'];

export default function ViewFileModal() {
  const { t } = useTranslation('kpiSalary');
  const isModalOpen = useAppSelector(getModalVisible(ShowViewFileModal));
  const dataFileView = useAppSelector(getDataFileView());
  const [fileType, setFileType] = useState(null);
  const [viewFrame, setViewFrame] = useState({ width: '70vw', height: '70vh' });
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fileExtension = dataFileView?.file?.name?.split('.').pop().toLowerCase();
    setFileType(fileExtension);
  }, [dataFileView]);

  // [#20497][dung_lt][26/10/2024] kiểm tra là hình ảnh thì sẽ dùng img
  useEffect(() => {
    // Kiểm tra nếu URL có giá trị và fileType là ảnh
    if (dataFileView?.url && fileType && ['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      const img = new Image();
      img.src = dataFileView.url;

      img.onload = () => {
        setViewFrame({ width: `${img.width + 100}px`, height: `${img.height + 100}px` });

      };

      img.onerror = () => {
        console.error("Failed to load image dimensions");
      };
    }
  }, [dataFileView?.url, fileType]);

  const handleCancel = () => {
    dispatch(issueActions.setDataFileView(null));
    dispatch(hideModal({ key: ShowViewFileModal }));
  };

  return (
    <Modal
      title={t("View file")}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={dataFileView?.url && fileType && isSupportedFileType.includes(fileType) ? viewFrame.width : 400}
      bodyStyle={{ height: dataFileView?.url && fileType && isSupportedFileType.includes(fileType) ? viewFrame.height : '200px', maxHeight: '70vh', maxWidth: '70vw' }}
    >
      {dataFileView?.url && fileType && isSupportedFileType.includes(fileType) ? (
        ['jpg', 'jpeg', 'png', 'gif'].includes(fileType) ? (
          <img
            src={dataFileView.url}
            alt="File Viewer"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              margin: '0 auto'
            }}
          />
        ) : (
          <iframe
            src={dataFileView.url}
            title="File Viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '16px',
            color: '#555'
          }}
        >
          {t("This document is not viewable. Please download to view it.")}
        </div>
      )}
    </Modal>
  );
}
