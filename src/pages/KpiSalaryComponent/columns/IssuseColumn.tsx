/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { EditOutlined } from '@ant-design/icons';
import { Button, Select, Space, Tooltip } from 'antd';

import { colors } from '@/common/colors';



export const issuesColumns: any = ({t, editIssue, handleDownload}: any) => {

  return [
    {
      title: t('Tên file'),
      dataIndex: 'subject',
      key: 'subject',
      width: 140,
      fixed: 'left',
      align: 'center',
    },
    // {
    //   title: t('Nội Dung'),
    //   dataIndex: 'description',
    //   key: 'description',
    //   width: 140,
    //   align: 'center',
    // },
    {
      title: t('Tệp tin'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'center',
      render: (text: any, record: any) => (
        <div>
          {record?.documentChildren?.map((child: any, index: number) => (
            <div key={index}>
              <a 
                style={{ color: 'blue', textDecoration: 'underline' }} 
                onClick={() => handleDownload(child)}
              >
                {child.name} {/* Hiển thị tên của tệp con */}
              </a>
            </div>
          ))}
        </div>
      ),
    },
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
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined style={{ color: colors.primary}} />}
                type="text"
                size="small"
                onClick={() => editIssue(record, true)}
              />
            </Tooltip>
            {/* <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={() => confirmRemoveIssue(record, null)}
              />
            </Tooltip> */}
          </Space>
          </div>
        );
      },
    },
  ];
} 