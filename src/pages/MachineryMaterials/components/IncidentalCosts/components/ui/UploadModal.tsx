import React, { useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Col, Image, Modal, Row, Upload } from 'antd';
import { UploadFile } from 'antd/lib';

import fallbackSVG from '@/image/fallback.svg';


// ------------------------------------------------------------------------

interface UploadModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  fileList: any[];
  onUploadChange: (info: any) => void;
  handleRemoveFile?: (file: any) => void;
  handleImageClick?: (file: any) => void;
}

export default function UploadModal({
  visible,
  onOk,
  onCancel,
  fileList,
  onUploadChange,
  handleRemoveFile,
  handleImageClick,
}: UploadModalProps): React.JSX.Element {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

//   return (
//     <Modal title="Thêm hình ảnh" open={visible} onOk={onOk} onCancel={onCancel}>
//       <Upload.Dragger
//         name="files"
//         listType="picture"
//         accept=".jpg,.jpeg,.png"
//         beforeUpload={() => false}
//         fileList={fileList}
//         onChange={onUploadChange}
//         onRemove={handleRemoveFile}
//         onPreview={handleImageClick}
//       >
//         <p className="ant-upload-drag-icon">
//           <InboxOutlined />
//         </p>
//         <p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng jpg, jpeg, png</p>
//       </Upload.Dragger>
//     </Modal>
//   );
// }
return (
    <>
      <Modal
        title="Tải hình ảnh"
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        width={1200}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={onUploadChange}
              onRemove={handleRemoveFile}
              beforeUpload={() => false}
              multiple
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <InboxOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Col>
          
          {fileList.length > 0 && (
            <Col span={24}>
              <h3>Xem trước hình ảnh</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {fileList.map((file) => (
                  <div key={file.uid} style={{ marginBottom: '10px' }}>
                    <Image
                      src={file.url || file.preview || URL.createObjectURL(file.originFileObj as File)}
                      alt={file.name}
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                      onClick={() => handlePreview(file)}
                      preview={false}
                      fallback={fallbackSVG}
                    />
                    <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px' }}>
                      {file.name?.substring(0, 12)}{file.name && file.name.length > 12 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          )}
        </Row>
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};