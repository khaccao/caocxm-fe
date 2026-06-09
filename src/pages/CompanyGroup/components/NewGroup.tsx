import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { UploadFile } from 'antd/es/upload/interface';

import { IReviewItem } from '@/common/define';
import { GroupDTO } from '@/services/GroupService';
import { getCurrentCompany } from '@/store/app';
import { groupActions } from '@/store/group';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review/reviewSlice';


const NewGroup: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [form] = Form.useForm();
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();

  const handleSubmit = (values: any) => {
    const group: GroupDTO = {
      companyId: Number(company.id),
      parentId: null,
      name: values.title,
      code: values.code,
      type: 0,
      status: 0,
    };
    dispatch(groupActions.createGroupRequest({inputValues: group}))
    form.resetFields();
    onCancel();
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: '',
          code: '',
        }}
      >
        <Form.Item
          name="title"
          label={<span style={{ fontWeight: 'bold' }}>Tên phòng ban mới:</span>}
          rules={[{ required: true, message: 'Tên phòng ban là bắt buộc!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label={<span style={{ fontWeight: 'bold' }}>Mã phòng ban:</span>}
          rules={[{ required: true, message: 'Mã phòng ban là bắt buộc!' }]}
        >
          <Input />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="default" onClick={onCancel} style={{marginRight: 10}}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewGroup;
