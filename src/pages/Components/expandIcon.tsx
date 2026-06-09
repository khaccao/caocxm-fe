import { PlusOutlined, MenuFoldOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Space, Tooltip, Typography } from 'antd';
export const expandIconCustom: any = ({ expanded, onExpand, record, editIssue, addButtonProps }: any) => {
  if (!record.children || record.children.length === 0) {
    return (
      <Space style={{ display: 'flex', flexDirection: 'row' }}>
        {/* <Button
            type={'default'}
            icon={<CaretUpOutlined />}
            size="small"
            onClick={e => onExpand(record, e)}
            style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0)' }}
          /> */}
        <Space style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0)', width: 24}}> 
          <CaretUpOutlined />
        </Space>
        {renderNameColumn(record.subject, record, editIssue, addButtonProps)}
      </Space>
    );
  }
  return expanded ? (
    <Space style={{ display: 'flex', flexDirection: 'row' }}>
      <Button 
          type={'default'} 
          icon={<CaretUpOutlined />} size="small"
          onClick={e => onExpand(record, e)}
          style={{ fontSize: '18px', color: '#000000' }}
        />
      {renderNameColumn(record.subject, record, editIssue, addButtonProps)}
    </Space>
  ) : (
    <Space style={{ display: 'flex', flexDirection: 'row' }}>
      <Button 
          type={'default'} 
          icon={<CaretDownOutlined />} size="small"
        onClick={e => onExpand(record, e)}
        style={{ fontSize: '18px', color: '#52c41a' }}
        />
      {renderNameColumn(record.subject, record, editIssue, addButtonProps)}
    </Space>
  );
}

function renderNameColumn(text: any, record: any, editIssue: any, addButtonProps?: ButtonProps) {
  if (record.isCategory || typeof record.parentId === 'string') {
    return (
      <Typography.Text
        style={{
          fontWeight: 'bold',
          cursor: 'pointer',
          paddingLeft:
            record.children && record.children.length > 0
              ? '-25px'
              : record.isCategory && record?.children?.length
              ? '25px'
              : '0px',
        }}
      >
        {text}
      </Typography.Text>
    );
  } else {
    return (
      <Space
        style={{
          width: '100%',
          // background: 'red',
        }}
      >
        <Tooltip title={`${text}`}>
          <Typography.Text style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{`${text}`}</Typography.Text>
        </Tooltip>
        <Space style={{ display: 'flex', gap: '5px' }}>
          <Tooltip title={record.description}>
            <Button type={'default'} icon={<MenuFoldOutlined />} size="small" />
          </Tooltip>
          <Button type={'default'} icon={<PlusOutlined />} size="small" onClick={() => editIssue(record, false)} {...addButtonProps} />
        </Space>
      </Space>
    );
  }
}
