import { UserAddOutlined, PlusOutlined, MenuFoldOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Select, Space, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';

import styles from '../Bidding.module.less';
import { colors } from '@/common/colors';
import { StatusColor, StatusLabel, formatDateDisplay } from '@/common/define';
import { Status, StatusHelperControl } from '@/services/IssueService';
import Utils from '@/utils';


function renderNameColumn(text: any, record: any, editIssue: any) {
  // if (record.children && record.children.length > 0) {
  //   return text;
  // }
  const handleClickAdd: React.MouseEventHandler<HTMLSpanElement> = (event) => {
    console.log('Span clicked');
    // Do something with the event, if needed
  };
  return (
    <>
      <Space>
        <Tooltip title={text}>
          <Typography.Text 
            style={{ 
              fontWeight: 'normal', 
              cursor: 'pointer', 
              paddingLeft: record.children && record.children.length > 0 ? '-25px' : '25px' 
            }} 
          >
            {text}
          </Typography.Text>
        </Tooltip>
          <span style={{ display: 'flex', gap:'5px'}}>
            <Tooltip title={record.description}>
              <Button 
              type={'default'} 
              icon={<MenuFoldOutlined />} 
              size="small"
              />
            </Tooltip>
            <Button 
              type={'default'} 
              icon={<PlusOutlined />} 
              size="small" 
              onClick={(e)=> {
                e.preventDefault();
                editIssue(record, false)
              }}
              />
          </span>
      </Space>
    </>
  );
}

const renderAvata = (name: string | undefined) => {
  if (name) {
    const assigneeName = name;
    return (
      <Tooltip title={assigneeName} key={Utils.generateRandomString(5)}>
        <Avatar
          size="small"
          onClick={() => console.log('')}
          style={{ backgroundColor: Utils.stringToColour(assigneeName), cursor: 'pointer', alignItems: 'center' }}
        >
          {assigneeName.charAt(0)}
        </Avatar>
      </Tooltip>
    );
  }
  return null;
};


const statusOptions = StatusHelperControl.statusOptions;

export const issuesColumns: any = ({t, handleStatusChange, editIssue, confirmRemoveIssue, editButtonProps, deleteButtonProps}: any) => {
  const { Option } = Select;
  return [
    {
      title: t('ID'),
      dataIndex: 'id',
      key: 'id',
      width: 140,
      fixed: 'left',
      align: 'center',
      render: (value: any, record: any) => {
        if(record.isCategory) {
          return <span></span>
        } else {
          return <>{value}</>
        }
      } 
    },
    {
      title: t('Subject'),
      dataIndex: 'subject',
      key: 'subject',
      width: 280,
      render: (text: any, record: any) => <></>,
    },
    {
      title: t('Start date Contract'),
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      width: 130,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('End date Contract'),
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 130,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Actual start date'),
      dataIndex: 'actualStartDate',
      key: 'actualStartDate',
      width: 160,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Actual end date'),
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: 160,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Undertaker'),
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 150,
      align: 'center',
      render: (value: any, record: any) => {
        if (record && record.issueContacts) {
          let issueContact = record.issueContacts;
          return (
            <Avatar.Group
              size='small'
              shape='circle'
              style={{width: '100%', alignItems: 'center', display: 'flow'}}
            >
              {issueContact && issueContact.filter((i:any) => i.contact.employeeId !== null).map((assign: any) => {
                return renderAvata(assign?.contact?.fullname);
              })}
            </Avatar.Group>
          );

        }
        return (
          <Avatar
            icon={<UserAddOutlined />}
            size="small"
            onClick={() => console.log('')}
            style={{ backgroundColor: '#87d068', cursor: 'pointer' }}
          />
        );
      },
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      width: 180,
      align: 'center',
      render: (value: number, record: any) => {
        if(record.isCategory) return;
        const selectedOption = statusOptions.find((option: any) => {
          if (typeof value === 'number') return option.value === value;
          const s = Utils.getStatus(value);
          return option.value === +s;
        });
        
        return <>
          <Select
            className={styles.customSelect}
            value={selectedOption?.label || null}
            onChange={(value) => handleStatusChange(value, record, false)}
          >
            {statusOptions.map(option => (
              <Option 
              key={option.value} 
              value={option.label}
              disabled={+value === 0}
              >
                <Tag color={option.color} className={styles.customTag} 
                   style={{
                    width: '139px',
                    height: '100%',
                    textAlign: "center",
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {option.label}
                </Tag>
              </Option>
            ))}
          </Select>
        </>
      },
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: any) => {
        if (record.isCategory) return;
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return (
          <Space>
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined style={{ color: colors.primary }} />}
                type="text"
                size="small"
                onClick={() => editIssue(record, true)}
                {...editButtonProps}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={() => confirmRemoveIssue(record, null)}
                {...deleteButtonProps}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
} 