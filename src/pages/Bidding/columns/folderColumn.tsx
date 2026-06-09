/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Select, Space, Tooltip } from 'antd';

import { colors } from '@/common/colors';



export const folderColumn: any = ({t,handleDownload, confirmRemoveIssue}: any) => {

  return [
    {
      title: t('Tên file'),
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      fixed: 'left',
      align: 'center',
    },
    // {
    //   title: t('Tệp tin'),
    //   dataIndex: 'name',
    //   key: 'name',
    //   width: 100,
    //   align: 'center',
    //   render: (text: any, record: any) => (
    //     <div>
    //       {text} {/* Hiển thị tên của tệp con */}
    //     </div>
    //   ),
    // },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'right',
      style: '',
      render: (_: any, record: any) => {
       return (
        <div style={{ marginRight: '30px' }}>
          <Space>
            {/* [20905][dung_lt][20/11/2024] fix lỗi tooltip */}
            <Tooltip title={t('Download')}>
              <Button
                icon={<ArrowDownOutlined style={{ color: colors.primary}} />}
                type="text"
                size="small"
                onClick={() => handleDownload(record)}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={() => confirmRemoveIssue(record)}
              />
            </Tooltip>
          </Space>
          </div>
        );
      },
    },
  ];
} 