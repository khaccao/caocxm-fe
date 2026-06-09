import { useEffect, useState } from 'react';

import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Flex, Modal, Progress } from 'antd';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import styles from './UploadedContractsPopup.module.less';
import { FileStatus, FileStatusConstant } from '@/common/define';
import { getListFileUpload } from '@/store/documents';

export const UploadedContractsPopup = (props: { closeDialog?: () => void }) => {
  const { t } = useTranslation(['document']);
  const files = useSelector(getListFileUpload());
  const [data, setData] = useState<FileStatus[]>([]);
  const [title, setTitle] = useState('');
  const [expand, setExpand] = useState(true);

  // [#20508][dung_lt][24/10/2024] - lấy thông tin file upload để hiển thị popup
  useEffect(() => {
    let array = files ?? [];
    let uploadingCount = array.filter(x => x.status !== FileStatusConstant.success).length;
    if (uploadingCount > 0) {
      setTitle(`${uploadingCount}/${array.length} ${t('uploading')}`);
    } else {
      setTitle(`${array.length} ${t('uploaded')}`);
    }
    setData(array);
  }, [files]);
  return (
    <Draggable>
      <div className={styles.popup} style={{ height: expand && data.length > 0 ? 300 : 55 }}>
        <div className={styles.popupheader}>
          {title}
          <div style={{ flex: 1 }}></div>
          <Button
            icon={expand ? <DownOutlined /> : <UpOutlined />}
            size="small"
            style={{ borderWidth: 0 }}
            onClick={() => setExpand(!expand)}
          ></Button>
          {title.includes(t('uploaded')) && (
            <Button
              icon={<CloseOutlined />}
              size="small"
              style={{ borderWidth: 0, marginLeft: 10 }}
              onClick={() => props.closeDialog && props.closeDialog()}
            ></Button>
          )}
        </div>
        {expand && (
          <div className={styles.inContent}>
            {data.map(x => {
              return (
                <Flex key={x.fileId} style={{ flex: 1, alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                  <p
                    style={{
                      padding: 0,
                      margin: 0,
                      textOverflow: 'ellipsis',
                      width: '70%',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {x.name}
                  </p>
                  <div style={{ flex: 1 }}></div>
                  {x.status != FileStatusConstant.error ? (
                    <Progress percent={x.percent} size={[30, 30]} type="circle" />
                  ) : (
                    <Progress percent={x.percent} size={[30, 30]} type="circle" status="exception" />
                  )}
                </Flex>
              );
            })}
          </div>
        )}
      </div>
    </Draggable>
  );
};
