import React, { ReactNode } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Image, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';

import styles from './style.module.less';

const DefaultUploadButton = () => {
  return (
    <Button type="primary" icon={<UploadOutlined />}>
      Upload
    </Button>
  );
};

const MoreFiles = ({ fileList }: { fileList?: UploadFile[] }) => {
  const getMenuItems = () => {
    let menuItems: ItemType[] = [];
    if (fileList?.length) {
      menuItems = fileList.map(file => {
        return {
          key: file.uid,
          label: file.name,
        };
      });
    }
    return menuItems;
  };
  return (
    <Dropdown menu={{ items: getMenuItems() }}>
      <Button>{`${fileList?.length} +`}</Button>
    </Dropdown>
  );
};

interface ProposalUploaderProps extends UploadProps {
  canContinueUpload?: boolean;
  children?: ReactNode;
  previewLimit?: number;
}
export const ProposalUploader = ({
  canContinueUpload = true,
  children = <DefaultUploadButton />,
  fileList = [],
  previewLimit,
  ...props
}: ProposalUploaderProps) => {
  const withinLimitFileList = previewLimit ? fileList.slice(0, previewLimit) : fileList;
  const exceedLimitFileList = previewLimit ? fileList.slice(previewLimit) : [];

  const renderFile = (file: UploadFile) => {
    if (file.url || file.preview) {
      return <Image src={file.url || file.preview} width={50} height={50} />;
    }
    return null;
  };

  return (
    <Flex wrap align="center" gap={10}>
      <Upload {...props} showUploadList={false}>
        {canContinueUpload ? children : null}
      </Upload>
      {withinLimitFileList.map(renderFile)}
      {exceedLimitFileList.length > 0 && <MoreFiles fileList={exceedLimitFileList} />}
    </Flex>
  );
};
