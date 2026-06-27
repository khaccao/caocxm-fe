import { useEffect, useMemo, useState } from 'react';
import { firstValueFrom } from 'rxjs';

import { DeleteOutlined, EditOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';

import {
  PaymentPeriodCatalogPayload,
  PaymentPeriodCatalogResponse,
  PaymentPeriodDetailPayload,
  PaymentPeriodDetailResponse,
  PaymentPeriodPayload,
  PaymentPeriodResponse,
  PaymentPeriodService,
} from '@/services/PaymentPeriodService';
import { AccountingAccountOption, AccountingAccountService, AccountingExpenseItemOption } from '@/services/AccountingAccountService';
import Utils from '@/utils';

const dataGroupOptions = [
  { value: 'SALARY_ADVANCE', label: 'Ứng lương' },
  { value: 'WORKER_SALARY', label: 'Lương công nhân' },
  { value: 'BCH_SALARY', label: 'Lương BCH' },
  { value: 'MATERIAL_MAIN', label: 'Vật tư chính' },
  { value: 'MATERIAL_AUX', label: 'Vật tư phụ' },
  { value: 'MACHINERY', label: 'Máy móc-CCDC' },
  { value: 'INCIDENTAL_COST', label: 'Chi phí phát sinh' },
  { value: 'OTHER', label: 'Khác' },
];

const dateModeOptions = [
  { value: 'THEO_KY_THANH_TOAN', label: 'Theo khoảng ngày của kỳ' },
  { value: 'NGAY_CO_DINH', label: 'Ngày cố định' },
  { value: 'KHONG_THEO_NGAY', label: 'Không theo ngày' },
];

const monthRelationOptions = Array.from({ length: 25 }, (_, index) => {
  const value = index - 12;
  if (value === 0) return { value, label: 'Tháng đang chọn' };
  if (value < 0) return { value, label: `${Math.abs(value)} tháng trước` };
  return { value, label: `${value} tháng sau` };
});

const trimOrNull = (value?: string) => value?.trim() || null;

const rangeText = (item?: Pick<PaymentPeriodResponse, 'day1' | 'month1' | 'day2' | 'month2'> | null) => {
  if (!item?.day1 || !item?.day2) return '-';
  const monthOffsetText = (value?: number | null) => {
    if (!value) return 'tháng đang chọn';
    if (value < 0) return `${Math.abs(value)} tháng trước`;
    return `${value} tháng sau`;
  };
  return `Từ ngày ${item.day1} của ${monthOffsetText(item.month1)} đến hết ngày ${item.day2} của ${monthOffsetText(item.month2)}`;
};

export const PaymentPeriods = () => {
  const [periodForm] = Form.useForm();
  const [catalogForm] = Form.useForm();
  const [detailForm] = Form.useForm();

  const [periods, setPeriods] = useState<PaymentPeriodResponse[]>([]);
  const [catalogs, setCatalogs] = useState<PaymentPeriodCatalogResponse[]>([]);
  const [details, setDetails] = useState<PaymentPeriodDetailResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccountOption[]>([]);
  const [expenseItems, setExpenseItems] = useState<AccountingExpenseItemOption[]>([]);
  const [editingPeriod, setEditingPeriod] = useState<PaymentPeriodResponse>();
  const [editingCatalog, setEditingCatalog] = useState<PaymentPeriodCatalogResponse>();
  const [editingDetail, setEditingDetail] = useState<PaymentPeriodDetailResponse>();
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriodResponse>();
  const [periodDrawerOpen, setPeriodDrawerOpen] = useState(false);
  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const periodDay1 = Form.useWatch('day1', periodForm);
  const periodMonth1 = Form.useWatch('month1', periodForm);
  const periodDay2 = Form.useWatch('day2', periodForm);
  const periodMonth2 = Form.useWatch('month2', periodForm);
  const detailDay1 = Form.useWatch('day1', detailForm);
  const detailMonth1 = Form.useWatch('month1', detailForm);
  const detailDay2 = Form.useWatch('day2', detailForm);
  const detailMonth2 = Form.useWatch('month2', detailForm);

  const activeCatalogs = useMemo(() => catalogs.filter(item => item.status !== 1), [catalogs]);
  const catalogOptions = useMemo(
    () => activeCatalogs.map(item => ({ value: item.id, label: `${item.code} - ${item.displayName || item.name}` })),
    [activeCatalogs],
  );
  const expenseItemOptions = useMemo(() => expenseItems.map(item => ({
    value: item.code || item.value,
    label: `${item.code || item.value} - ${item.name || ''}`,
    searchText: `${item.code || item.value} ${item.name || ''}`.toLocaleLowerCase('vi'),
  })), [expenseItems]);
  const periodRangePreview = rangeText({
    day1: periodDay1,
    month1: periodMonth1,
    day2: periodDay2,
    month2: periodMonth2,
  });
  const detailRangePreview = rangeText({
    day1: detailDay1,
    month1: detailMonth1,
    day2: detailDay2,
    month2: detailMonth2,
  });

  const loadPeriods = () => {
    setLoading(true);
    PaymentPeriodService.Get.getPeriods().subscribe({
      next: result => setPeriods(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  const loadCatalogs = () => {
    PaymentPeriodService.Get.getCatalogs(true).subscribe({
      next: result => setCatalogs(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  };

  const loadDetails = (periodId: number) => {
    setDetailLoading(true);
    PaymentPeriodService.Get.getDetails(periodId, true).subscribe({
      next: result => setDetails(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setDetailLoading(false),
    });
  };

  useEffect(() => {
    loadPeriods();
    loadCatalogs();
    AccountingAccountService.Get.getExpenseItems().subscribe({
      next: result => setExpenseItems(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
    AccountingAccountService.Get.getAccounts().subscribe({
      next: result => setAccounts(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  }, []);

  const openCreatePeriod = () => {
    setEditingPeriod(undefined);
    periodForm.resetFields();
    periodForm.setFieldsValue({ month1: 0, month2: 0, catalogIds: [] });
    setPeriodDrawerOpen(true);
  };

  const openEditPeriod = (record: PaymentPeriodResponse) => {
    setEditingPeriod(record);
    periodForm.setFieldsValue({ ...record, catalogIds: [] });
    setPeriodDrawerOpen(true);
    PaymentPeriodService.Get.getDetails(record.id, true).subscribe({
      next: result => {
        const activeDetails = Array.isArray(result) ? result.filter(item => item.status !== 1) : [];
        periodForm.setFieldValue('catalogIds', activeDetails.map(item => item.catalogId));
      },
      error: Utils.errorHandling,
    });
  };

  const buildPeriodPayload = (values: any): PaymentPeriodPayload => ({
    code: values.code?.trim(),
    name: trimOrNull(values.name),
    displayName: trimOrNull(values.displayName),
    subName1: trimOrNull(values.subName1),
    subName2: trimOrNull(values.subName2),
    day1: values.day1 ?? null,
    month1: values.month1 ?? null,
    day2: values.day2 ? `${values.day2}` : null,
    month2: values.month2 ?? null,
    note: trimOrNull(values.note),
    note2: trimOrNull(values.note2),
  });

  const syncPeriodCatalogs = async (period: PaymentPeriodResponse, catalogIds: number[]) => {
    const selectedIds = Array.from(new Set(catalogIds || []));
    const selected = new Set(selectedIds);
    const currentDetails = await firstValueFrom(PaymentPeriodService.Get.getDetails(period.id, true));
    const detailsByCatalogId = new Map((currentDetails || []).map(item => [item.catalogId, item]));

    for (let index = 0; index < selectedIds.length; index++) {
      const catalogId = selectedIds[index];
      const catalog = catalogs.find(item => item.id === catalogId);
      if (!catalog) continue;

      const existing = detailsByCatalogId.get(catalogId);
      const payload: PaymentPeriodDetailPayload = {
        periodId: period.id,
        catalogId,
        displayName: existing?.displayName || catalog.displayName || catalog.name || catalog.code,
        expenseItemCode: existing?.expenseItemCode || catalog.expenseItemCode || null,
        day1: period.day1 ?? null,
        month1: period.month1 ?? null,
        day2: period.day2 ?? null,
        month2: period.month2 ?? null,
        note: existing?.note || null,
        sortOrder: existing?.sortOrder ?? index + 1,
        status: 0,
      };

      if (existing) {
        await firstValueFrom(PaymentPeriodService.Put.updateDetail(existing.id, payload));
      } else {
        await firstValueFrom(PaymentPeriodService.Post.createDetail(period.id, payload));
      }
    }

    for (const detail of currentDetails || []) {
      if (detail.status !== 1 && !selected.has(detail.catalogId)) {
        await firstValueFrom(PaymentPeriodService.Delete.removeDetail(detail.id));
      }
    }
  };

  const savePeriod = () => {
    periodForm.validateFields().then(async values => {
      setSaving(true);
      const payload = buildPeriodPayload(values);

      try {
        const period = await firstValueFrom(
          editingPeriod
            ? PaymentPeriodService.Put.updatePeriod(editingPeriod.id, payload)
            : PaymentPeriodService.Post.createPeriod(payload),
        );

        await syncPeriodCatalogs(period, values.catalogIds || []);
        Utils.successNotification();
        setPeriodDrawerOpen(false);
        loadPeriods();
      } catch (error) {
        Utils.errorHandling(error);
      } finally {
        setSaving(false);
      }
    });
  };

  const deletePeriod = (record: PaymentPeriodResponse) => {
    PaymentPeriodService.Delete.removePeriod(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadPeriods();
      },
      error: Utils.errorHandling,
    });
  };

  const openCreateCatalog = () => {
    setEditingCatalog(undefined);
    catalogForm.resetFields();
    catalogForm.setFieldsValue({ dateMode: 'THEO_KY_THANH_TOAN', sortOrder: 0, status: true });
    setCatalogDrawerOpen(true);
  };

  const openEditCatalog = (record: PaymentPeriodCatalogResponse) => {
    setEditingCatalog(record);
    catalogForm.setFieldsValue({ ...record, status: record.status !== 1 });
    setCatalogDrawerOpen(true);
  };

  const buildCatalogPayload = (values: any): PaymentPeriodCatalogPayload => ({
    code: values.code?.trim(),
    name: trimOrNull(values.name),
    displayName: trimOrNull(values.displayName),
    dataGroup: trimOrNull(values.dataGroup),
    dateMode: trimOrNull(values.dateMode),
    expenseItemCode: trimOrNull(values.expenseItemCode),
    note: trimOrNull(values.note),
    sortOrder: values.sortOrder ?? 0,
    status: values.status ? 0 : 1,
  });

  const saveCatalog = () => {
    catalogForm.validateFields().then(values => {
      setSaving(true);
      const payload = buildCatalogPayload(values);
      const request = editingCatalog
        ? PaymentPeriodService.Put.updateCatalog(editingCatalog.id, payload)
        : PaymentPeriodService.Post.createCatalog(payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          setCatalogDrawerOpen(false);
          loadCatalogs();
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const deleteCatalog = (record: PaymentPeriodCatalogResponse) => {
    PaymentPeriodService.Delete.removeCatalog(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadCatalogs();
      },
      error: Utils.errorHandling,
    });
  };

  const openDetails = (record: PaymentPeriodResponse) => {
    setSelectedPeriod(record);
    setDetails([]);
    setDetailDrawerOpen(true);
    loadDetails(record.id);
  };

  const openCreateDetail = () => {
    if (!selectedPeriod) return;
    setEditingDetail(undefined);
    detailForm.resetFields();
    detailForm.setFieldsValue({
      periodId: selectedPeriod.id,
      day1: selectedPeriod.day1,
      month1: selectedPeriod.month1,
      day2: selectedPeriod.day2,
      month2: selectedPeriod.month2,
      sortOrder: details.length + 1,
      status: true,
    });
  };

  const openEditDetail = (record: PaymentPeriodDetailResponse) => {
    setEditingDetail(record);
    detailForm.setFieldsValue({ ...record, status: record.status !== 1 });
  };

  const buildDetailPayload = (values: any): PaymentPeriodDetailPayload => ({
    periodId: selectedPeriod!.id,
    catalogId: values.catalogId,
    displayName: trimOrNull(values.displayName),
    expenseItemCode: trimOrNull(values.expenseItemCode),
    day1: values.day1 ?? null,
    month1: values.month1 ?? null,
    day2: values.day2 ? `${values.day2}` : null,
    month2: values.month2 ?? null,
    note: trimOrNull(values.note),
    sortOrder: values.sortOrder ?? 0,
    status: values.status ? 0 : 1,
  });

  const saveDetail = () => {
    if (!selectedPeriod) return;

    detailForm.validateFields().then(values => {
      setSaving(true);
      const payload = buildDetailPayload(values);
      const request = editingDetail
        ? PaymentPeriodService.Put.updateDetail(editingDetail.id, payload)
        : PaymentPeriodService.Post.createDetail(selectedPeriod.id, payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          setEditingDetail(undefined);
          detailForm.resetFields();
          loadDetails(selectedPeriod.id);
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const deleteDetail = (record: PaymentPeriodDetailResponse) => {
    if (!selectedPeriod) return;
    PaymentPeriodService.Delete.removeDetail(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadDetails(selectedPeriod.id);
      },
      error: Utils.errorHandling,
    });
  };

  const periodColumns = [
    { title: 'Mã kỳ', dataIndex: 'code', width: 110, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Tên kỳ', dataIndex: 'name', width: 140 },
    { title: 'Tên hiển thị', dataIndex: 'displayName', width: 220 },
    { title: 'Khoảng ngày lấy dữ liệu', width: 300, render: (_: unknown, record: PaymentPeriodResponse) => rangeText(record) },
    { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
    {
      title: 'Thao tác',
      width: 180,
      align: 'center' as const,
      render: (_: unknown, record: PaymentPeriodResponse) => (
        <Space>
          <Button type="text" icon={<UnorderedListOutlined />} onClick={() => openDetails(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditPeriod(record)} />
          <Popconfirm title="Xóa kỳ thanh toán này?" onConfirm={() => deletePeriod(record)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const catalogColumns = [
    { title: 'Mã danh mục', dataIndex: 'code', width: 180, render: (value: string) => <Tag color="cyan">{value}</Tag> },
    { title: 'Tên danh mục', dataIndex: 'name', width: 220 },
    { title: 'Nhóm dữ liệu', dataIndex: 'dataGroup', width: 180 },
    { title: 'Mã khoản mục', dataIndex: 'expenseItemCode', width: 150, render: (value: string) => value || '-' },
    { title: 'Kiểu ngày', dataIndex: 'dateMode', width: 180 },
    { title: 'Sắp xếp', dataIndex: 'sortOrder', width: 100, align: 'right' as const },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (value: number) => value === 1 ? <Tag>Ngừng dùng</Tag> : <Tag color="green">Đang dùng</Tag>,
    },
    {
      title: 'Thao tác',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: PaymentPeriodCatalogResponse) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditCatalog(record)} />
          <Popconfirm title="Ngừng dùng danh mục này?" onConfirm={() => deleteCatalog(record)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    { title: 'Danh mục', dataIndex: 'catalogCode', width: 180, render: (value: string) => <Tag>{value}</Tag> },
    { title: 'Tên hiển thị', dataIndex: 'displayName', width: 260 },
    { title: 'Mã khoản mục', dataIndex: 'expenseItemCode', width: 150, render: (value: string) => value || '-' },
    { title: 'Khoảng ngày', width: 280, render: (_: unknown, record: PaymentPeriodDetailResponse) => rangeText(record) },
    { title: 'Sắp xếp', dataIndex: 'sortOrder', width: 90, align: 'right' as const },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (value: number) => value === 1 ? <Tag>Ngừng dùng</Tag> : <Tag color="green">Đang dùng</Tag>,
    },
    {
      title: 'Thao tác',
      width: 110,
      align: 'center' as const,
      render: (_: unknown, record: PaymentPeriodDetailResponse) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditDetail(record)} />
          <Popconfirm title="Ngừng dùng dòng này?" onConfirm={() => deleteDetail(record)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const accountColumns = [
    { title: 'Mã tài khoản', dataIndex: 'code', width: 160, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Tên tài khoản', dataIndex: 'name', width: 360 },
    { title: 'Giá trị chọn', dataIndex: 'value', width: 180 },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Cấu hình kỳ thanh toán
      </Typography.Title>
      <Tabs
        items={[
          {
            key: 'periods',
            label: 'Kỳ thanh toán',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePeriod}>
                    Thêm kỳ
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={periods}
                  columns={periodColumns as any}
                  pagination={false}
                />
              </>
            ),
          },
          {
            key: 'catalogs',
            label: 'Chi tiết kỳ thanh toán',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCatalog}>
                    Thêm danh mục
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  dataSource={catalogs}
                  columns={catalogColumns as any}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              </>
            ),
          },
          {
            key: 'accounts',
            label: 'Danh sách tài khoản',
            children: (
              <Table
                rowKey={record => record.code || record.value}
                dataSource={accounts}
                columns={accountColumns as any}
                pagination={{ pageSize: 20, showSizeChanger: false }}
              />
            ),
          },
        ]}
      />

      <Drawer
        destroyOnClose
        open={periodDrawerOpen}
        width={620}
        title={editingPeriod ? 'Cập nhật kỳ thanh toán' : 'Thêm kỳ thanh toán'}
        onClose={() => setPeriodDrawerOpen(false)}
        extra={<Button type="primary" loading={saving} onClick={savePeriod}>Lưu</Button>}
      >
        <Form form={periodForm} layout="vertical">
          <Form.Item name="code" label="Mã kỳ" rules={[{ required: true, message: 'Nhập mã kỳ' }]}>
            <Input placeholder="Ví dụ: Ky1" />
          </Form.Item>
          <Form.Item name="name" label="Tên kỳ">
            <Input placeholder="Ví dụ: Kỳ 1" />
          </Form.Item>
          <Form.Item name="displayName" label="Tên hiển thị">
            <Input placeholder="Ví dụ: Thanh toán ngày 5" />
          </Form.Item>
          <Form.Item
            name="catalogIds"
            label="Danh mục áp dụng trong kỳ"
            rules={[{ required: true, message: 'Chọn ít nhất một danh mục áp dụng' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              options={catalogOptions}
              optionFilterProp="label"
              placeholder="Chọn các dòng như Lương công nhân, Vật tư chính, CPPS..."
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="day1" label="Ngày bắt đầu">
              <InputNumber min={1} max={31} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month1" label="Tháng bắt đầu">
              <Select options={monthRelationOptions} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="day2" label="Ngày kết thúc">
              <InputNumber min={1} max={31} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month2" label="Tháng kết thúc">
              <Select options={monthRelationOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          </div>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: -4, marginBottom: 16 }}>
            {periodRangePreview}
          </Typography.Text>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="note2" label="Ghi chú 2">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        destroyOnClose
        open={catalogDrawerOpen}
        width={620}
        title={editingCatalog ? 'Cập nhật danh mục dòng' : 'Thêm danh mục dòng'}
        onClose={() => setCatalogDrawerOpen(false)}
        extra={<Button type="primary" loading={saving} onClick={saveCatalog}>Lưu</Button>}
      >
        <Form form={catalogForm} layout="vertical">
          <Form.Item name="code" label="Mã danh mục" rules={[{ required: true, message: 'Nhập mã danh mục' }]}>
            <Input placeholder="Ví dụ: VAT_TU_CHINH" />
          </Form.Item>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục' }]}>
            <Input placeholder="Ví dụ: Vật tư chính" />
          </Form.Item>
          <Form.Item name="displayName" label="Tên hiển thị">
            <Input />
          </Form.Item>
          <Form.Item name="dataGroup" label="Nhóm dữ liệu">
            <Select showSearch allowClear options={dataGroupOptions} />
          </Form.Item>
          <Form.Item name="expenseItemCode" label="Mã khoản mục">
            <Select
              showSearch
              allowClear
              options={expenseItemOptions}
              optionFilterProp="searchText"
              filterOption={(input, option) =>
                `${option?.searchText || option?.label || ''}`.toLocaleLowerCase('vi').includes(input.toLocaleLowerCase('vi'))
              }
              placeholder="Gõ mã hoặc tên khoản mục"
            />
          </Form.Item>
          <Form.Item name="dateMode" label="Kiểu ngày">
            <Select options={dateModeOptions} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sắp xếp">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Đang dùng" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        destroyOnClose
        open={detailDrawerOpen}
        width={980}
        title={`Chi tiết kỳ: ${selectedPeriod?.displayName || selectedPeriod?.name || selectedPeriod?.code || ''}`}
        onClose={() => setDetailDrawerOpen(false)}
      >
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDetail}>
            Thêm dòng
          </Button>
          <Typography.Text type="secondary">{selectedPeriod ? rangeText(selectedPeriod) : ''}</Typography.Text>
        </Space>
        <Table
          rowKey="id"
          loading={detailLoading}
          dataSource={details}
          columns={detailColumns as any}
          pagination={false}
          style={{ marginBottom: 16 }}
        />

        <Typography.Title level={5}>{editingDetail ? 'Cập nhật dòng chi tiết' : 'Thêm dòng chi tiết'}</Typography.Title>
        <Form form={detailForm} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="catalogId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]} style={{ gridColumn: 'span 2' }}>
              <Select showSearch options={catalogOptions} optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="displayName" label="Tên hiển thị" style={{ gridColumn: 'span 2' }}>
              <Input placeholder="Ví dụ: Vật tư chính (ngày 12-19)" />
            </Form.Item>
            <Form.Item name="expenseItemCode" label="Mã khoản mục" style={{ gridColumn: 'span 2' }}>
              <Select
                showSearch
                allowClear
                options={expenseItemOptions}
                optionFilterProp="searchText"
                filterOption={(input, option) =>
                  `${option?.searchText || option?.label || ''}`.toLocaleLowerCase('vi').includes(input.toLocaleLowerCase('vi'))
                }
                placeholder="Gõ mã hoặc tên khoản mục"
              />
            </Form.Item>
            <Form.Item name="day1" label="Ngày bắt đầu">
              <InputNumber min={1} max={31} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month1" label="Tháng bắt đầu">
              <Select options={monthRelationOptions} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="day2" label="Ngày kết thúc">
              <InputNumber min={1} max={31} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="month2" label="Tháng kết thúc">
              <Select options={monthRelationOptions} showSearch optionFilterProp="label" />
            </Form.Item>
            <Typography.Text type="secondary" style={{ gridColumn: 'span 4', marginTop: -8 }}>
              {detailRangePreview}
            </Typography.Text>
            <Form.Item name="sortOrder" label="Sắp xếp">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="Đang dùng" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú" style={{ gridColumn: 'span 2' }}>
              <Input />
            </Form.Item>
          </div>
          <Button type="primary" loading={saving} onClick={saveDetail}>
            {editingDetail ? 'Cập nhật dòng' : 'Lưu dòng'}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};
