import { useEffect, useMemo, useState } from 'react';

import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, Table, Tag, Typography } from 'antd';

import {
  AccountingAccountOption,
  AccountingAccountService,
  AccountingExpenseItemOption,
  AccountingWorkItemOption,
} from '@/services/AccountingAccountService';
import { AccountingObjectOption, SubContractorCatalogService } from '@/services/SubContractorCatalogService';
import { SubContractorTypePayload, SubContractorTypeResponse, SubContractorTypeService } from '@/services/SubContractorTypeService';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

const accountingFields = [
  ['accountingObjectCode', 'Mã đối tượng'],
  ['expenseItemCode', 'Mã khoản mục'],
  ['workItemCode', 'Mã vụ việc'],
  ['contractCode', 'Mã hợp đồng'],
  ['debitAccount', 'TK Nợ'],
  ['creditAccount', 'TK Có'],
  ['debitAccount1', 'TK Nợ 1'],
  ['creditAccount1', 'TK Có 1'],
  ['debitAccount2', 'TK Nợ 2'],
  ['creditAccount2', 'TK Có 2'],
  ['debitAccount3', 'TK Nợ 3'],
  ['creditAccount3', 'TK Có 3'],
] as const;

const accountFieldNames = new Set([
  'debitAccount',
  'creditAccount',
  'debitAccount1',
  'creditAccount1',
  'debitAccount2',
  'creditAccount2',
  'debitAccount3',
  'creditAccount3',
]);

const trimOrNull = (value?: string) => value?.trim() || null;
const optionSearch = (input: string, option: any) =>
  String(option?.searchText || option?.label || '').toLocaleLowerCase('vi').includes(input.toLocaleLowerCase('vi'));

export const SubContractorTypes = () => {
  const company = useAppSelector(getCurrentCompany());
  const activeMenu = useAppSelector(getActiveMenu());
  const [form] = Form.useForm();
  const [types, setTypes] = useState<SubContractorTypeResponse[]>([]);
  const [editingType, setEditingType] = useState<SubContractorTypeResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<AccountingAccountOption[]>([]);
  const [accountingObjects, setAccountingObjects] = useState<AccountingObjectOption[]>([]);
  const [expenseItems, setExpenseItems] = useState<AccountingExpenseItemOption[]>([]);
  const [workItems, setWorkItems] = useState<AccountingWorkItemOption[]>([]);
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

  useEffect(() => {
    SubContractorCatalogService.Get.getAccountingObjects().subscribe({ next: result => setAccountingObjects(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getAccounts().subscribe({ next: result => setAccounts(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getExpenseItems().subscribe({ next: result => setExpenseItems(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getWorkItems().subscribe({ next: result => setWorkItems(Array.isArray(result) ? result : []), error: Utils.errorHandling });
  }, []);

  const filteredTypes = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return types;
    return types.filter(type => [
      type.code,
      type.name,
      type.fullName,
      type.description,
      type.accountingObjectCode,
      type.expenseItemCode,
      type.workItemCode,
      type.contractCode,
    ].some(value => String(value || '').toLocaleLowerCase('vi').includes(keyword)));
  }, [search, types]);

  const accountOptions = useMemo(() => accounts.map(account => ({
    value: account.code || account.value,
    label: (account.code || account.value) + ' - ' + (account.name || ''),
    searchText: (account.code || account.value) + ' ' + (account.name || ''),
  })), [accounts]);
  const accountingObjectOptions = useMemo(() => accountingObjects.map(item => ({
    value: item.value,
    label: item.label,
    searchText: (item.code || item.value) + ' ' + (item.name || ''),
  })), [accountingObjects]);
  const expenseItemOptions = useMemo(() => expenseItems.map(item => ({
    value: item.code || item.value,
    label: (item.code || item.value) + ' - ' + (item.name || ''),
    searchText: (item.code || item.value) + ' ' + (item.name || ''),
  })), [expenseItems]);
  const workItemOptions = useMemo(() => workItems.map(item => ({
    value: item.code || item.value,
    label: (item.code || item.value) + ' - ' + (item.name || ''),
    searchText: (item.code || item.value) + ' ' + (item.name || ''),
  })), [workItems]);

  const renderAccountingControl = (name: string) => {
    if (name === 'accountingObjectCode') {
      return <Select showSearch allowClear options={accountingObjectOptions} optionFilterProp="searchText" filterOption={optionSearch} placeholder="Gõ mã hoặc tên đối tượng ISS" />;
    }
    if (name === 'expenseItemCode') {
      return <Select showSearch allowClear options={expenseItemOptions} optionFilterProp="searchText" filterOption={optionSearch} placeholder="Gõ mã hoặc tên khoản mục" />;
    }
    if (name === 'workItemCode') {
      return <Select showSearch allowClear options={workItemOptions} optionFilterProp="searchText" filterOption={optionSearch} placeholder="Gõ mã hoặc tên vụ việc" />;
    }
    if (accountFieldNames.has(name)) {
      return <Select showSearch allowClear options={accountOptions} optionFilterProp="searchText" filterOption={optionSearch} placeholder="Gõ mã hoặc tên tài khoản" />;
    }
    return <Input />;
  };

  const openCreateDrawer = () => { setEditingType(undefined); form.resetFields(); form.setFieldsValue({ sortOrder: 0, status: true }); setDrawerOpen(true); };
  const openEditDrawer = (record: SubContractorTypeResponse) => { setEditingType(record); form.setFieldsValue({ ...record, status: record.status === 1 }); setDrawerOpen(true); };

  const buildPayload = (values: any): SubContractorTypePayload => ({
    companyId: company!.id,
    code: values.code?.trim(),
    name: values.name?.trim(),
    fullName: trimOrNull(values.fullName),
    description: trimOrNull(values.description),
    accountingObjectCode: trimOrNull(values.accountingObjectCode),
    expenseItemCode: trimOrNull(values.expenseItemCode),
    workItemCode: trimOrNull(values.workItemCode),
    contractCode: trimOrNull(values.contractCode),
    debitAccount: trimOrNull(values.debitAccount),
    creditAccount: trimOrNull(values.creditAccount),
    debitAccount1: trimOrNull(values.debitAccount1),
    creditAccount1: trimOrNull(values.creditAccount1),
    debitAccount2: trimOrNull(values.debitAccount2),
    creditAccount2: trimOrNull(values.creditAccount2),
    debitAccount3: trimOrNull(values.debitAccount3),
    creditAccount3: trimOrNull(values.creditAccount3),
    note: trimOrNull(values.note),
    sortOrder: values.sortOrder ?? 0,
    status: values.status ? 1 : 0,
  });

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!company?.id) return;
      setSaving(true);
      const request = editingType
        ? SubContractorTypeService.Put.updateType(editingType.id, buildPayload(values))
        : SubContractorTypeService.Post.createType(buildPayload(values));
      request.subscribe({
        next: () => { Utils.successNotification(); setDrawerOpen(false); loadTypes(); },
        error: error => { Utils.errorHandling(error); setSaving(false); },
        complete: () => setSaving(false),
      });
    });
  };

  const handleDelete = (record: SubContractorTypeResponse) => {
    SubContractorTypeService.Delete.removeType(record.id).subscribe({ next: () => { Utils.successNotification(); loadTypes(); }, error: Utils.errorHandling });
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
      error: error => { Utils.errorHandling(error); setDownloading(false); },
      complete: () => setDownloading(false),
    });
  };

  const columns = [
    { title: 'Mã loại nhà thầu', dataIndex: 'code', key: 'code', width: 180, render: (_: unknown, record: SubContractorTypeResponse) => <Tag color="blue">{record.code}</Tag> },
    { title: 'Tên loại nhà thầu', dataIndex: 'name', key: 'name', width: 220 },
    { title: 'Tên đầy đủ loại nhà thầu', dataIndex: 'fullName', key: 'fullName', width: 320, render: (value: string) => value || '-' },
    { title: 'Mã đối tượng', dataIndex: 'accountingObjectCode', key: 'accountingObjectCode', width: 150, render: (value: string) => value || '-' },
    { title: 'Mã vụ việc', dataIndex: 'workItemCode', key: 'workItemCode', width: 150, render: (value: string) => value || '-' },
    { title: 'TK Nợ/Có', key: 'account', width: 160, render: (_: unknown, record: SubContractorTypeResponse) => [record.debitAccount, record.creditAccount].filter(Boolean).join(' / ') || '-' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 90, align: 'center' as const },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, align: 'center' as const, render: (_: unknown, record: SubContractorTypeResponse) => record.status === 1 ? <Tag color="green">Đang dùng</Tag> : <Tag>Ngừng dùng</Tag> },
    { title: 'Thao tác', key: 'action', width: 120, align: 'center' as const, fixed: 'right' as const, render: (_: unknown, record: SubContractorTypeResponse) => <Space><Button type="text" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} /><Popconfirm title="Ẩn loại nhà thầu này?" onConfirm={() => handleDelete(record)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>{activeMenu?.label || 'Loại nhà thầu'}</Typography.Title>
        <Input allowClear value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo mã, tên, mã đối tượng" prefix={<SearchOutlined />} style={{ width: 320, height: 32 }} />
        <Space><span>Hiển thị ngừng dùng</span><Switch checked={includeInactive} onChange={setIncludeInactive} /></Space>
        <Button icon={<DownloadOutlined />} loading={downloading} onClick={handleDownloadTemplate}>Tải file mẫu</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>Thêm loại nhà thầu</Button>
      </div>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>Danh mục này dùng để chuẩn hóa nhóm chi phí thầu phụ, sinh sheet mã loại nhà thầu trong file import và làm cơ sở gán nhà thầu cho từng công trình.</Typography.Paragraph>
      <Table rowKey="id" loading={loading} dataSource={filteredTypes} columns={columns as any} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 1400 }} />
      <Drawer destroyOnClose open={drawerOpen} width={760} title={editingType ? 'Cập nhật loại nhà thầu' : 'Thêm loại nhà thầu'} onClose={() => setDrawerOpen(false)} extra={<Space><Button onClick={() => setDrawerOpen(false)}>Đóng</Button><Button type="primary" loading={saving} onClick={handleSave}>Lưu</Button></Space>}>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Mã loại nhà thầu" name="code" rules={[{ required: true, message: 'Nhập mã loại nhà thầu' }]}><Input placeholder="PCCC" /></Form.Item></Col>
            <Col span={8}><Form.Item label="Tên loại nhà thầu" name="name" rules={[{ required: true, message: 'Nhập tên loại nhà thầu' }]}><Input placeholder="Phòng cháy chữa cháy" /></Form.Item></Col>
            <Col span={8}><Form.Item label="Thứ tự" name="sortOrder"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="Tên đầy đủ loại nhà thầu" name="fullName"><Input placeholder="Chi phí nhà thầu khoán - PCCC" /></Form.Item>
          <Row gutter={12}>{accountingFields.map(([name, label]) => <Col span={8} key={name}><Form.Item label={label} name={name}>{renderAccountingControl(name)}</Form.Item></Col>)}</Row>
          <Form.Item label="Ghi chú" name="note"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Mô tả" name="description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Đang dùng" name="status" valuePropName="checked"><Switch checkedChildren="Bật" unCheckedChildren="Tắt" /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};
