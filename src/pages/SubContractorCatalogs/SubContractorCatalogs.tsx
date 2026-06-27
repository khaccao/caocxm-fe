import { useEffect, useMemo, useState } from 'react';

import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Form, Input, Popconfirm, Row, Select, Space, Switch, Table, Tag, Typography } from 'antd';

import {
  AccountingAccountOption,
  AccountingAccountService,
  AccountingExpenseItemOption,
  AccountingWorkItemOption,
} from '@/services/AccountingAccountService';
import {
  AccountingObjectOption,
  SubContractorCatalogPayload,
  SubContractorCatalogResponse,
  SubContractorCatalogService,
} from '@/services/SubContractorCatalogService';
import { SubContractorTypeResponse, SubContractorTypeService } from '@/services/SubContractorTypeService';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

const accountingFields = [
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

export const SubContractorCatalogs = () => {
  const company = useAppSelector(getCurrentCompany());
  const [form] = Form.useForm();
  const [items, setItems] = useState<SubContractorCatalogResponse[]>([]);
  const [types, setTypes] = useState<SubContractorTypeResponse[]>([]);
  const [accountingObjects, setAccountingObjects] = useState<AccountingObjectOption[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccountOption[]>([]);
  const [expenseItems, setExpenseItems] = useState<AccountingExpenseItemOption[]>([]);
  const [workItems, setWorkItems] = useState<AccountingWorkItemOption[]>([]);
  const [editingItem, setEditingItem] = useState<SubContractorCatalogResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taxLookupLoading, setTaxLookupLoading] = useState(false);

  const loadData = (keyword = search, inactive = includeInactive) => {
    if (!company?.id) return;
    setLoading(true);
    SubContractorCatalogService.Get.getCatalogs(company.id, keyword, inactive).subscribe({
      next: result => setItems(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  const loadSelectData = () => {
    if (!company?.id) return;
    SubContractorTypeService.Get.getTypes(company.id).subscribe({ next: result => setTypes(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    SubContractorCatalogService.Get.getAccountingObjects().subscribe({ next: result => setAccountingObjects(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getAccounts().subscribe({ next: result => setAccounts(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getExpenseItems().subscribe({ next: result => setExpenseItems(Array.isArray(result) ? result : []), error: Utils.errorHandling });
    AccountingAccountService.Get.getWorkItems().subscribe({ next: result => setWorkItems(Array.isArray(result) ? result : []), error: Utils.errorHandling });
  };

  useEffect(() => {
    loadData('', includeInactive);
    loadSelectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, includeInactive]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return items;
    return items.filter(item => [
      item.subContractorTypeCode,
      item.subContractorTypeName,
      item.code,
      item.name,
      item.fullName,
      item.accountingObjectCode,
      item.expenseItemCode,
      item.workItemCode,
      item.taxCode,
    ].some(value => String(value || '').toLocaleLowerCase('vi').includes(keyword)));
  }, [items, search]);

  const typeOptions = useMemo(() => types.map(type => ({ value: type.id, label: type.code + ' - ' + type.name })), [types]);
  const accountingObjectOptions = useMemo(() => accountingObjects.map(item => ({
    value: item.value,
    label: item.label,
    searchText: (item.code || item.value) + ' ' + (item.name || ''),
  })), [accountingObjects]);
  const accountOptions = useMemo(() => accounts.map(account => ({
    value: account.code || account.value,
    label: (account.code || account.value) + ' - ' + (account.name || ''),
    searchText: (account.code || account.value) + ' ' + (account.name || ''),
  })), [accounts]);
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

  const applyType = (typeId: number) => {
    const type = types.find(item => item.id === typeId);
    if (!type) return;
    form.setFieldsValue({
      subContractorTypeId: type.id,
      subContractorTypeCode: type.code,
      subContractorTypeName: type.name,
      expenseItemCode: form.getFieldValue('expenseItemCode') || type.expenseItemCode,
      workItemCode: form.getFieldValue('workItemCode') || type.workItemCode,
      contractCode: form.getFieldValue('contractCode') || type.contractCode,
      debitAccount: form.getFieldValue('debitAccount') || type.debitAccount,
      creditAccount: form.getFieldValue('creditAccount') || type.creditAccount,
      debitAccount1: form.getFieldValue('debitAccount1') || type.debitAccount1,
      creditAccount1: form.getFieldValue('creditAccount1') || type.creditAccount1,
      debitAccount2: form.getFieldValue('debitAccount2') || type.debitAccount2,
      creditAccount2: form.getFieldValue('creditAccount2') || type.creditAccount2,
      debitAccount3: form.getFieldValue('debitAccount3') || type.debitAccount3,
      creditAccount3: form.getFieldValue('creditAccount3') || type.creditAccount3,
    });
  };

  const openCreateDrawer = () => { setEditingItem(undefined); form.resetFields(); form.setFieldsValue({ status: true }); setDrawerOpen(true); };
  const openEditDrawer = (record: SubContractorCatalogResponse) => { setEditingItem(record); form.setFieldsValue({ ...record, status: record.status === 1 }); setDrawerOpen(true); };

  const handleLookupTaxCode = () => {
    const taxCode = trimOrNull(form.getFieldValue('taxCode'));
    if (!taxCode || taxLookupLoading) return;
    setTaxLookupLoading(true);
    SubContractorCatalogService.Get.lookupTaxCode(taxCode).subscribe({
      next: result => {
        if (!result?.taxCode && !result?.companyName) {
          Utils.errorNotification('Không tìm thấy thông tin mã số thuế.');
          return;
        }
        const current = form.getFieldsValue();
        form.setFieldsValue({
          taxCode: result.taxCode || taxCode,
          name: current.name || result.companyName,
          fullName: current.fullName || result.companyName,
          representative: current.representative || result.representative,
          address: current.address || result.address,
        });
      },
      error: Utils.errorHandling,
      complete: () => setTaxLookupLoading(false),
    });
  };

  const buildPayload = (values: any): SubContractorCatalogPayload => ({
    companyId: company!.id,
    subContractorTypeId: values.subContractorTypeId,
    subContractorTypeCode: trimOrNull(values.subContractorTypeCode),
    subContractorTypeName: trimOrNull(values.subContractorTypeName),
    code: values.code?.trim(),
    name: values.name?.trim(),
    fullName: trimOrNull(values.fullName),
    taxCode: trimOrNull(values.taxCode),
    representative: trimOrNull(values.representative),
    phone: trimOrNull(values.phone),
    address: trimOrNull(values.address),
    email: trimOrNull(values.email),
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
    customerType: 1,
    status: values.status ? 1 : 0,
  });

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!company?.id) return;
      setSaving(true);
      const request = editingItem
        ? SubContractorCatalogService.Put.updateCatalog(editingItem.id, buildPayload(values))
        : SubContractorCatalogService.Post.createCatalog(buildPayload(values));
      request.subscribe({
        next: () => { Utils.successNotification(); setDrawerOpen(false); loadData(); },
        error: error => { Utils.errorHandling(error); setSaving(false); },
        complete: () => setSaving(false),
      });
    });
  };

  const handleDelete = (record: SubContractorCatalogResponse) => {
    SubContractorCatalogService.Delete.removeCatalog(record.id).subscribe({ next: () => { Utils.successNotification(); loadData(); }, error: Utils.errorHandling });
  };

  const columns = [
    { title: 'Loại nhà thầu', dataIndex: 'subContractorTypeCode', width: 170, render: (_: unknown, record: SubContractorCatalogResponse) => record.subContractorTypeCode ? <Tag color="purple">{record.subContractorTypeCode}</Tag> : '-' },
    { title: 'Mã nhà thầu', dataIndex: 'code', width: 150, render: (_: unknown, record: SubContractorCatalogResponse) => <Tag color="blue">{record.code}</Tag> },
    { title: 'Mã đối tượng ISS', dataIndex: 'accountingObjectCode', width: 170, render: (value: string) => value || '-' },
    { title: 'Tên nhà thầu', dataIndex: 'name', width: 240 },
    { title: 'Tên đầy đủ', dataIndex: 'fullName', width: 280, render: (value: string) => value || '-' },
    { title: 'Mã số thuế', dataIndex: 'taxCode', width: 140, render: (value: string) => value || '-' },
    { title: 'TK Nợ/Có', width: 150, render: (_: unknown, record: SubContractorCatalogResponse) => [record.debitAccount, record.creditAccount].filter(Boolean).join(' / ') || '-' },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, align: 'center' as const, render: (_: unknown, record: SubContractorCatalogResponse) => record.status === 1 ? <Tag color="green">Đang dùng</Tag> : <Tag>Ngừng dùng</Tag> },
    { title: 'Thao tác', width: 120, align: 'center' as const, fixed: 'right' as const, render: (_: unknown, record: SubContractorCatalogResponse) => <Space><Button type="text" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} /><Popconfirm title="Ẩn nhà thầu này?" onConfirm={() => handleDelete(record)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>Danh mục nhà thầu</Typography.Title>
        <Input allowClear value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm mã, tên, loại nhà thầu, mã đối tượng" prefix={<SearchOutlined />} style={{ width: 340, height: 32 }} />
        <Space><span>Hiển thị ngừng dùng</span><Switch checked={includeInactive} onChange={setIncludeInactive} /></Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>Thêm nhà thầu</Button>
      </div>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>Mỗi nhà thầu phải thuộc một loại nhà thầu. Tài khoản nợ/có của nhà thầu là cấu hình cụ thể và được ưu tiên khi gán vào công trình.</Typography.Paragraph>
      <Table rowKey="id" loading={loading} dataSource={filteredItems} columns={columns as any} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 1500 }} />

      <Drawer destroyOnClose open={drawerOpen} width={780} title={editingItem ? 'Cập nhật nhà thầu' : 'Thêm nhà thầu'} onClose={() => setDrawerOpen(false)} extra={<Space><Button onClick={() => setDrawerOpen(false)}>Đóng</Button><Button type="primary" loading={saving} onClick={handleSave}>Lưu</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="Loại nhà thầu" name="subContractorTypeId" rules={[{ required: true, message: 'Chọn loại nhà thầu' }]}><Select showSearch options={typeOptions} optionFilterProp="label" onChange={applyType} placeholder="Chọn PCCC, Chống thấm..." /></Form.Item>
          <Form.Item name="subContractorTypeCode" hidden><Input /></Form.Item>
          <Form.Item name="subContractorTypeName" hidden><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Mã nhà thầu" name="code" rules={[{ required: true, message: 'Nhập mã nhà thầu' }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item label="Mã đối tượng ISS" name="accountingObjectCode" rules={[{ required: true, message: 'Chọn mã đối tượng ISS' }]}><Select showSearch allowClear options={accountingObjectOptions} optionFilterProp="searchText" filterOption={optionSearch} placeholder="Chọn mã đối tượng ISS" /></Form.Item></Col>
            <Col span={8}><Form.Item label="Mã số thuế" name="taxCode"><Input.Search loading={taxLookupLoading} enterButton="Tra" onSearch={handleLookupTaxCode} onBlur={handleLookupTaxCode} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Tên nhà thầu" name="name" rules={[{ required: true, message: 'Nhập tên nhà thầu' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Tên đầy đủ" name="fullName"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Người đại diện" name="representative"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item label="Điện thoại" name="phone"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item label="Email" name="email"><Input /></Form.Item></Col>
          </Row>
          <Form.Item label="Địa chỉ" name="address"><Input /></Form.Item>
          <Row gutter={12}>{accountingFields.map(([name, label]) => <Col span={8} key={name}><Form.Item label={label} name={name}>{renderAccountingControl(name)}</Form.Item></Col>)}</Row>
          <Form.Item label="Ghi chú" name="note"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Đang dùng" name="status" valuePropName="checked"><Switch checkedChildren="Bật" unCheckedChildren="Tắt" /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};
