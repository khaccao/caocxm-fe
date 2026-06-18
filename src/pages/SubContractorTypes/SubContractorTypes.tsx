import { useEffect, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';

import { SubContractorTypePayload, SubContractorTypeResponse, SubContractorTypeService } from '@/services/SubContractorTypeService';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

export const SubContractorTypes = () => {
  const company = useAppSelector(getCurrentCompany());
  const activeMenu = useAppSelector(getActiveMenu());
  const [form] = Form.useForm();
  const [types, setTypes] = useState<SubContractorTypeResponse[]>([]);
  const [editingType, setEditingType] = useState<SubContractorTypeResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadTypes = (keyword = search, inactive = includeInactive) => {
    if (!company?.id) return;

    setLoading(true);
    SubContractorTypeService.Get.getTypes(company.id, keyword, inactive).subscribe({
      next: result => setTypes(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  useEffect(() => {
    loadTypes('', includeInactive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, includeInactive]);

  const filteredTypes = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return types;

    return types.filter(type =>
      [type.code, type.name, type.description]
        .some(value => `${value || ''}`.toLocaleLowerCase('vi').includes(keyword)),
    );
  }, [search, types]);

  const openCreateDrawer = () => {
    setEditingType(undefined);
    form.resetFields();
    form.setFieldsValue({
      sortOrder: 0,
      status: true,
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (record: SubContractorTypeResponse) => {
    setEditingType(record);
    form.setFieldsValue({
      ...record,
      status: record.status === 1,
    });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!company?.id) return;

      const payload: SubContractorTypePayload = {
        companyId: company.id,
        code: values.code?.trim(),
        name: values.name?.trim(),
        description: values.description?.trim() || null,
        sortOrder: values.sortOrder ?? 0,
        status: values.status ? 1 : 0,
      };

      setSaving(true);
      const request = editingType
        ? SubContractorTypeService.Put.updateType(editingType.id, payload)
        : SubContractorTypeService.Post.createType(payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          setDrawerOpen(false);
          loadTypes();
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const handleDelete = (record: SubContractorTypeResponse) => {
    SubContractorTypeService.Delete.removeType(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadTypes();
      },
      error: Utils.errorHandling,
    });
  };

  const handleDownloadTemplate = () => {
    if (!company?.id) return;

    setDownloading(true);
    SubContractorTypeService.Get.downloadImportTemplate(company.id).subscribe({
      next: result => {
        const blob = result as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Mau_Import_Nha_Thau.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: error => {
        Utils.errorHandling(error);
        setDownloading(false);
      },
      complete: () => setDownloading(false),
    });
  };

  const columns = [
    {
      title: 'Mã loại',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (_: unknown, record: SubContractorTypeResponse) => <Tag color="blue">{record.code}</Tag>,
    },
    {
      title: 'Tên loại nhà thầu',
      dataIndex: 'name',
      key: 'name',
      width: 260,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 90,
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: SubContractorTypeResponse) =>
        record.status === 1 ? <Tag color="green">Đang dùng</Tag> : <Tag>Ngừng dùng</Tag>,
    },
    {
      title: '',
      key: 'action',
      width: 110,
      align: 'center' as const,
      render: (_: unknown, record: SubContractorTypeResponse) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} />
          <Popconfirm title="Ẩn loại nhà thầu này?" onConfirm={() => handleDelete(record)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
          {activeMenu?.label || 'Loại nhà thầu'}
        </Typography.Title>
        <Input
          allowClear
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Tìm theo mã, tên hoặc mô tả"
          prefix={<SearchOutlined />}
          style={{ width: 320, height: 32 }}
        />
        <Space>
          <span>Hiển thị ngừng dùng</span>
          <Switch checked={includeInactive} onChange={setIncludeInactive} />
        </Space>
        <Button icon={<DownloadOutlined />} loading={downloading} onClick={handleDownloadTemplate}>
          Tải file mẫu
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
          Thêm loại nhà thầu
        </Button>
      </div>

      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Danh mục này dùng cho file import thanh toán thầu phụ. File mẫu sẽ sinh sẵn sheet mã loại nhà thầu và mã nhà thầu để người dùng chọn đúng mã.
      </Typography.Paragraph>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredTypes}
        columns={columns as any}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      <Drawer
        destroyOnClose
        open={drawerOpen}
        width={460}
        title={editingType ? 'Cập nhật loại nhà thầu' : 'Thêm loại nhà thầu'}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Đóng</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Mã loại nhà thầu" name="code" rules={[{ required: true, message: 'Nhập mã loại nhà thầu' }]}>
            <Input placeholder="Ví dụ: PCCC" />
          </Form.Item>
          <Form.Item label="Tên loại nhà thầu" name="name" rules={[{ required: true, message: 'Nhập tên loại nhà thầu' }]}>
            <Input placeholder="Ví dụ: Phòng cháy chữa cháy" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Ghi chú thêm nếu cần" />
          </Form.Item>
          <Form.Item label="Thứ tự" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Đang dùng" name="status" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};
