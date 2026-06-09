import React, { useEffect, useState } from 'react';

import { PaperClipOutlined, ArrowDownOutlined, DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons';
import {
  Modal,
  Button,
  Input,
  Checkbox,
  Form,
  Row,
  Space,
  Tooltip,
  UploadFile,
  Typography,
  Upload,
  UploadProps,
} from 'antd';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { issueActions } from '@/store/issue';

interface FloorNumberPopupProps {
  visible: boolean;
  onClose: () => void;
  labelid: any;
}

const FolderPopup: React.FC<FloorNumberPopupProps> = ({ visible, onClose, labelid }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('publics');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formFileData, setFormFileData] = useState<any>(null);


  const handleUploadChange = (info: any) => {
    const { status, fileList } = info;
    const formData = new FormData();
    fileList.forEach((file: any) => {
      if (file || file.originFileObj) {
        formData.append('iFiles', file.originFileObj || (file as File));
      }
    });
    setFormFileData(formData);
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file, files) => {
      const _fileList = fileList || [];
      setFileList([..._fileList, ...files]);
      return false;
    },
    fileList,
    name: 'file',
    multiple: true,
    onChange: handleUploadChange,
    showUploadList: false,
  };

  useEffect(()=> {
    setFileList([])
  },[visible])

  const removefile = (file: UploadFile<any> | any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    // setListFileRemove((prevList: any) => [...prevList, {drawingId: file?.drawingId, id: file?.id } ]);
  };

  const handleSave = async () => {
    const companyId = 1;
    if (fileList.length > 0) {
      dispatch(issueActions.uploadFileForFolder({ companyId, labelid, files: formFileData, parentId: labelid}))
    }
    onClose()
  };

  return (
    <Modal
      title={t('Tài liệu dự thầu')}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('FloorNumber.Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          {t('FloorNumber.Save')}
        </Button>,
      ]}
      width={400}
      centered
    >
      <Form layout="vertical">
        <Form.Item>
          <Row align="stretch" style={{ margin: 0 }}>
            <Typography.Text style={{ flex: 1 }} className="ant-form-item-label">
              {t('Attachments')}
            </Typography.Text>
            <Upload {...uploadProps}>
              <Button type="link" icon={<CloudUploadOutlined />} style={{ padding: 0 }}>
                {t('Click to Upload')}
              </Button>
            </Upload>
          </Row>
          {fileList && fileList.length > 0 && (
            <div style={{ border: '1px solid #D9D9D9', padding: 10, borderRadius: 8 }}>
              {fileList.map((f: any, index: number) => (
                <Row key={index} style={{ margin: 0 }} className="app-upload-list-item">
                  <Space style={{ flex: 1, width: '290px'}}>
                    <PaperClipOutlined />
                    <span style={{ width: '290px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>===={f.name ? f.name : f.fileName}</span>
                  </Space>
                  {f.fileName  && 
                  <Tooltip title={t('Lưu file')}>
                    <ArrowDownOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: colors.primary }}
                      onClick={() => console.log('first')}
                    />
                  </Tooltip>
                  }
                  <div style={{ marginLeft: '5px' }}></div>
                  <Tooltip title={t('Remove file')}>
                    <DeleteOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => removefile(f)}
                    />
                  </Tooltip>
                </Row>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FolderPopup;
