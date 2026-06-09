import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

import { IReviewItem } from '@/common/define';
import { getEnvVars } from '@/environment';
import { ReviewService } from '@/services/ReviewService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review/reviewSlice';

const { apiUrl } = getEnvVars();
interface CustomUploadFile extends UploadFile {
  drawingId: string;
}

interface ReviewDTO {
  subject: string;
  companyId: number;
  categoryCode: string;
  content: string;
  createdDate: string;
  toIdList: string;
  status: number;
}

interface NewReviewProps {
  messages?: IReviewItem;
  onSubmit?: (review: ReviewDTO) => void;
  onClose?: () => void;
  categoryCode: string;
  record?: any;
}

const NewReview: React.FC<NewReviewProps> = ({ messages, onSubmit, onClose, categoryCode, record }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [removeFileList, setRemoveFileList] = useState<string[]>([]);
  const [formFileData, setFormFileData] = useState<FormData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if( messages && messages.attachmentLinkReadDTOs) {
      const initialFileList = messages.attachmentLinkReadDTOs.map((attachment: any, index: number) => ({
        uid: `${index}`,
        name: attachment.fileName,
        url: ReviewService.getImageUrl(attachment.drawingId, company.id), // attachment.imageUrl || '', // `${apiUrl}/Document/downloadFile/${attachment.drawingId}?companyId=${company.id}`, //lấy trực tiếp link apiUrl
        drawingId: attachment.drawingId,
      }));
      const list = initialFileList.filter(x => removeFileList.findIndex(y => y === x.drawingId) === -1)
      setFileList(list as CustomUploadFile[]);
    } else setFileList([]);
  }, [messages?.attachmentLinkReadDTOs])

  const handleUploadChange = (info: any) => {
    const { fileList } = info;
    const formData = new FormData();
    fileList.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });
    setFormFileData(formData);
    setFileList(fileList);
  };


  const handleImageClick = (file: UploadFile) => {
    if (file.url) {
      setSelectedImage(file.url);
    }
  };

  const handleImageClose = () => {
    setSelectedImage(null);
  };

  const handleRemoveFile = (file: UploadFile) => {
    if( messages )  {
      const customFile = file as CustomUploadFile;
      setRemoveFileList([...removeFileList, customFile.drawingId]);
      setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
    }

  };

  const handleSubmit = async (values: any) => {
    const review: ReviewDTO = {
      subject: values.title,
      companyId: Number(company.id),
      categoryCode: categoryCode,
      content: values.content,
      createdDate: new Date().toISOString(),
      toIdList: 'user1', // Replace with actual ID list
      status: 1,
    };

    if (onSubmit) {
      onSubmit(review);
    } 
    if (messages) {
      if (removeFileList?.length > 0) {
        dispatch(reviewActions.deleteFilesRequest({id: messages?.id, drawingIds: removeFileList}));
      }
      dispatch(reviewActions.editReviewRequest({ review, id: messages.id, dataImage: formFileData }));
    } else {
      dispatch(reviewActions.createReviewRequest({ inputValues: review, dataImage: formFileData }));
      form.resetFields();
    }  
    if (onClose) {
      onClose();
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: messages?.subject || '',
          content: messages?.content || '',
        }}
      >
        <Form.Item
          name="title"
          label={<span style={{ fontWeight: 'bold' }}>Tên chủ đề:</span>}
          rules={[{ required: true, message: 'Tên chủ đề là bắt buộc!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="content" label={<span style={{ fontWeight: 'bold' }}>Nội dung:</span>}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Tải ảnh lên" name="upload">
          <Upload.Dragger
            name="files"
            listType="picture"
            accept=".jpg,.jpeg,.png"
            beforeUpload={() => false}
            fileList={[...fileList]}
            onChange={handleUploadChange}
            onPreview={handleImageClick}
            onRemove={handleRemoveFile}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng jpeg, png</p>
          </Upload.Dragger>
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button type="default" onClick={onClose}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              maxWidth: '80vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="button" onClick={handleImageClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewReview;
