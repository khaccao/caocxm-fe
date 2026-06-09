import React, { useState } from 'react';

import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Table, Input, Button, Form } from 'antd';

export const EditableTable = () => {
  const [dataSource, setDataSource] = useState([
    { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
    { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
  ]);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: { key: string }) => record.key === editingKey;

  const edit = (record: { key: React.SetStateAction<string> }) => {
    setEditingKey(record.key);
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setDataSource(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setDataSource(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', editable: true },
    { title: 'Age', dataIndex: 'age', editable: true },
    { title: 'Address', dataIndex: 'address', editable: true },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: { key: any }) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              <SaveOutlined />
            </Button>
            <Button onClick={cancel}>Cancel</Button>
          </span>
        ) : (
          <Button disabled={editingKey !== ''} onClick={() => edit(record)}>
            <EditOutlined />
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  interface EditableCellProps {
    editing: any;
    dataIndex: any;
    title: any;
    record: any;
    index: any;
    children: any;
  }

  const EditableCell = ({ editing, dataIndex, title, record, index, children, ...restProps }: EditableCellProps) => {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            <Input />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={dataSource}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};
