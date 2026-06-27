import { useEffect, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  EditOutlined,
  MoneyCollectOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import {
  ProjectSubContractorAssignmentPayload,
  ProjectSubContractorAssignmentResponse,
  ProjectSubContractorAssignmentService,
  ProjectSubContractorPaymentPayload,
  ProjectSubContractorPaymentResponse,
  PaymentPeriodDetailResponse,
  PaymentPeriodResponse,
} from '@/services/ProjectSubContractorAssignmentService';
import { SubContractorCatalogResponse, SubContractorCatalogService } from '@/services/SubContractorCatalogService';
import { SubContractorTypeResponse, SubContractorTypeService } from '@/services/SubContractorTypeService';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

const displayValue = (value?: string | number | null) => value || value === 0 ? value : '-';
const formatMoney = (value?: number | null) => Number(value || 0).toLocaleString('vi-VN');
const parseMoney = (value?: string) => (value || '').replace(/[,.]/g, '');
const formatDate = (value?: string | null) => value ? dayjs(value).format('DD/MM/YYYY') : '-';
const toDayjs = (value?: string | null) => value ? dayjs(value) : undefined;
const toIso = (value?: Dayjs | null) => value ? value.format('YYYY-MM-DDTHH:mm:ss') : null;
const splitCompletionVolume = (value?: string | null) => {
  if (!value) return { completionAmount: undefined, completionUnit: 'PERCENT' };
  const normalized = value.trim();
  if (normalized.endsWith('%')) return { completionAmount: Number(normalized.replace('%', '').trim()) || undefined, completionUnit: 'PERCENT' };
  return { completionAmount: Number(normalized.replace(/[^\d.]/g, '')) || undefined, completionUnit: 'QUANTITY' };
};

export const ProjectSubContractorAssignments = () => {
  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject()) as any;
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [items, setItems] = useState<ProjectSubContractorAssignmentResponse[]>([]);
  const [types, setTypes] = useState<SubContractorTypeResponse[]>([]);
  const [contractors, setContractors] = useState<SubContractorCatalogResponse[]>([]);
  const [payments, setPayments] = useState<ProjectSubContractorPaymentResponse[]>([]);
  const [paymentPeriods, setPaymentPeriods] = useState<PaymentPeriodResponse[]>([]);
  const [paymentPeriodDetails, setPaymentPeriodDetails] = useState<PaymentPeriodDetailResponse[]>([]);
  const [editingItem, setEditingItem] = useState<ProjectSubContractorAssignmentResponse>();
  const [editingPayment, setEditingPayment] = useState<ProjectSubContractorPaymentResponse>();
  const [paymentAssignment, setPaymentAssignment] = useState<ProjectSubContractorAssignmentResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const companyId = company?.id || selectedProject?.companyId;
  const projectId = selectedProject?.id;
  const projectCode = selectedProject?.code || selectedProject?.projectCode || selectedProject?.Code || selectedProject?.id?.toString();
  const selectedContractorId = Form.useWatch('contractorCatalogId', form);
  const selectedPaymentPeriodCode = Form.useWatch('paymentPeriodCode', paymentForm);

  const loadAssignments = (inactive = includeInactive) => {
    if (!companyId || !projectId) return;
    setLoading(true);
    ProjectSubContractorAssignmentService.Get.getByProject(companyId, projectId, projectCode, inactive).subscribe({
      next: result => setItems(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  const loadCatalogs = () => {
    if (!companyId) return;

    SubContractorTypeService.Get.getTypes(companyId).subscribe({
      next: result => setTypes(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
    SubContractorCatalogService.Get.getCatalogs(companyId).subscribe({
      next: result => setContractors(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
    ProjectSubContractorAssignmentService.PaymentPeriod.getPeriods().subscribe({
      next: result => setPaymentPeriods(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  };

  const loadPayments = (assignmentId: number) => {
    setPaymentLoading(true);
    ProjectSubContractorAssignmentService.Payment.getByAssignment(assignmentId).subscribe({
      next: result => setPayments(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setPaymentLoading(false),
    });
  };

  const loadPaymentPeriodDetails = (periodCode?: string | null, selectedDetailId?: number | null) => {
    const period = paymentPeriods.find(item => item.code === periodCode);
    if (!period?.id) {
      setPaymentPeriodDetails([]);
      paymentForm.setFieldValue('paymentPeriodDetailId', undefined);
      return;
    }

    ProjectSubContractorAssignmentService.PaymentPeriod.getDetails(period.id).subscribe({
      next: result => {
        const details = Array.isArray(result) ? result.filter(item => item.status !== 1) : [];
        setPaymentPeriodDetails(details);
        if (selectedDetailId && details.some(item => item.id === selectedDetailId)) {
          paymentForm.setFieldValue('paymentPeriodDetailId', selectedDetailId);
          return;
        }
        paymentForm.setFieldValue('paymentPeriodDetailId', details.length === 1 ? details[0].id : undefined);
      },
      error: Utils.errorHandling,
    });
  };

  useEffect(() => {
    loadCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    loadAssignments(includeInactive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, projectId, includeInactive]);

  const selectedType = useMemo(
    () => types.find(item => item.id === selectedTypeId),
    [selectedTypeId, types],
  );

  const selectedContractor = useMemo(
    () => contractors.find(item => item.id === selectedContractorId),
    [contractors, selectedContractorId],
  );

  const typeOptions = useMemo(() => types.map(item => ({
    value: item.id,
    label: `${item.code} - ${item.name}`,
  })), [types]);

  const filteredContractors = useMemo(() => {
    if (!selectedType) return [];

    return contractors.filter(item =>
      item.subContractorTypeId === selectedType.id
      || item.subContractorTypeCode === selectedType.code,
    );
  }, [contractors, selectedType]);

  const contractorOptions = useMemo(() => filteredContractors.map(item => ({
    value: item.id,
    label: `${item.code} - ${item.name}`,
  })), [filteredContractors]);

  const paymentPeriodOptions = useMemo(() => paymentPeriods.map(item => ({
    value: item.code,
    label: `${item.code} - ${item.displayName || item.name || ''}`,
  })).filter(item => item.value), [paymentPeriods]);

  const paymentPeriodDetailOptions = useMemo(() => paymentPeriodDetails.map(item => ({
    value: item.id,
    label: `${item.catalogCode} - ${item.displayName || item.catalogName || ''}`,
  })).filter(item => item.value), [paymentPeriodDetails]);

  useEffect(() => {
    if (!paymentDrawerOpen || !selectedPaymentPeriodCode) return;
    loadPaymentPeriodDetails(selectedPaymentPeriodCode, paymentForm.getFieldValue('paymentPeriodDetailId'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentPeriodCode, paymentDrawerOpen, paymentPeriods]);

  const applyType = (typeId: number) => {
    const type = types.find(item => item.id === typeId);
    if (!type) return;

    setSelectedTypeId(type.id);
    form.setFieldsValue({
      subContractorTypeId: type.id,
      contractorCatalogId: undefined,
    });
  };

  const applyContractor = (contractorId: number) => {
    const contractor = contractors.find(item => item.id === contractorId);
    if (!contractor) return;

    const contractorType = types.find(item =>
      item.id === contractor.subContractorTypeId
      || item.code === contractor.subContractorTypeCode,
    );

    form.setFieldsValue({
      subContractorTypeId: contractor.subContractorTypeId || contractorType?.id || form.getFieldValue('subContractorTypeId'),
      contractorCatalogId: contractor.id,
    });
  };

  const openCreateDrawer = () => {
    setEditingItem(undefined);
    setSelectedTypeId(undefined);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setDrawerOpen(true);
  };

  const openEditDrawer = (record: ProjectSubContractorAssignmentResponse) => {
    setEditingItem(record);
    const typeId = record.subContractorTypeId || types.find(item => item.code === record.subContractorTypeCode)?.id;
    const contractorId = record.contractorCatalogId || contractors.find(item => item.code === record.contractorCode)?.id;
    setSelectedTypeId(typeId);
    form.setFieldsValue({
      subContractorTypeId: typeId,
      contractorCatalogId: contractorId,
      contractNumber: record.contractNumber,
      contractSignDate: toDayjs(record.contractSignDate),
      contractValue: record.contractValue,
      advanceValue: record.advanceValue,
      plannedStartDate: toDayjs(record.plannedStartDate),
      actualStartDate: toDayjs(record.actualStartDate),
      plannedEndDate: toDayjs(record.plannedEndDate),
      actualEndDate: toDayjs(record.actualEndDate),
      projectRepresentative: record.projectRepresentative,
      finalSettlementValue: record.finalSettlementValue,
      contractFileUrl: record.contractFileUrl,
      status: record.status === 1,
    });
    setDrawerOpen(true);
  };

  const buildPayload = (values: any): ProjectSubContractorAssignmentPayload => ({
    companyId,
    projectId,
    projectCode: projectCode || null,
    subContractorTypeId: selectedType?.id || selectedContractor?.subContractorTypeId || values.subContractorTypeId,
    subContractorTypeCode: selectedType?.code || selectedContractor?.subContractorTypeCode || '',
    subContractorTypeName: selectedType?.name || selectedContractor?.subContractorTypeName || null,
    contractorCatalogId: selectedContractor?.id || values.contractorCatalogId,
    contractorCode: selectedContractor?.code || '',
    contractorName: selectedContractor?.name || '',
    contractNumber: values.contractNumber || null,
    contractSignDate: toIso(values.contractSignDate),
    contractValue: values.contractValue ?? null,
    advanceValue: values.advanceValue ?? null,
    plannedStartDate: toIso(values.plannedStartDate),
    actualStartDate: toIso(values.actualStartDate),
    plannedEndDate: toIso(values.plannedEndDate),
    actualEndDate: toIso(values.actualEndDate),
    projectRepresentative: values.projectRepresentative || null,
    finalSettlementValue: values.finalSettlementValue ?? null,
    contractFileUrl: values.contractFileUrl || null,
    status: values.status ? 1 : 0,
  });

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!companyId || !projectId) return;
      if (!validateAssignmentBusinessRules(values)) return;

      setSaving(true);
      const payload = buildPayload(values);
      const request = editingItem
        ? ProjectSubContractorAssignmentService.Put.updateAssignment(editingItem.id, payload)
        : ProjectSubContractorAssignmentService.Post.createAssignment(payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          setDrawerOpen(false);
          loadAssignments();
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const handleDelete = (record: ProjectSubContractorAssignmentResponse) => {
    ProjectSubContractorAssignmentService.Delete.removeAssignment(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadAssignments();
      },
      error: Utils.errorHandling,
    });
  };

  const openPaymentDrawer = (record: ProjectSubContractorAssignmentResponse) => {
    setPaymentAssignment(record);
    setEditingPayment(undefined);
    paymentForm.resetFields();
    const paymentDate = dayjs();
    paymentForm.setFieldsValue({
      createdDate: paymentDate,
      paymentDate,
      paymentPeriodCode: undefined,
      paymentPeriodDetailId: undefined,
      completionUnit: 'PERCENT',
      advanceDeduction: 0,
    });
    setPaymentPeriodDetails([]);
    setPaymentDrawerOpen(true);
    loadPayments(record.id);
  };

  const openPaymentEdit = (record: ProjectSubContractorPaymentResponse) => {
    const volume = splitCompletionVolume(record.currentCompletionVolume);
    setEditingPayment(record);
    paymentForm.setFieldsValue({
      createdBy: record.createdBy,
      createdDate: toDayjs(record.createdDate),
      paymentDate: toDayjs(record.paymentDate),
      paymentPeriodCode: record.paymentPeriodCode,
      paymentPeriodDetailId: record.paymentPeriodDetailId,
      completionAmount: volume.completionAmount,
      completionUnit: volume.completionUnit,
      currentCompletionValue: record.currentCompletionValue,
      currentRequestedPaymentValue: record.currentRequestedPaymentValue,
      advanceDeduction: record.advanceDeduction,
      currentActualPaymentValue: record.currentActualPaymentValue,
      description: record.description,
      note: record.note,
    });
    loadPaymentPeriodDetails(record.paymentPeriodCode, record.paymentPeriodDetailId);
  };

  const resetPaymentForm = () => {
    setEditingPayment(undefined);
    paymentForm.resetFields();
    paymentForm.setFieldsValue({
      createdDate: dayjs(),
      paymentDate: dayjs(),
      paymentPeriodCode: undefined,
      paymentPeriodDetailId: undefined,
      completionUnit: 'PERCENT',
      advanceDeduction: 0,
    });
    setPaymentPeriodDetails([]);
  };

  const buildPaymentPayload = (values: any): ProjectSubContractorPaymentPayload => ({
    assignmentId: paymentAssignment!.id,
    createdBy: values.createdBy || null,
    createdDate: toIso(values.createdDate),
    paymentDate: toIso(values.paymentDate),
    paymentPeriodCode: values.paymentPeriodCode || null,
    paymentPeriodDetailId: values.paymentPeriodDetailId ?? null,
    currentCompletionVolume: values.completionAmount || values.completionAmount === 0
      ? `${values.completionAmount}${values.completionUnit === 'PERCENT' ? '%' : ''}`
      : null,
    currentCompletionValue: values.currentCompletionValue ?? null,
    currentRequestedPaymentValue: values.currentRequestedPaymentValue ?? null,
    advanceDeduction: values.advanceDeduction ?? null,
    currentActualPaymentValue: values.currentActualPaymentValue ?? null,
    description: values.description || null,
    note: values.note || null,
    status: 0,
  });

  const handleSavePayment = () => {
    if (!paymentAssignment) return;

    paymentForm.validateFields().then(values => {
      if (!validatePaymentBusinessRules(values)) return;

      setPaymentSaving(true);
      const payload = buildPaymentPayload(values);
      const request = editingPayment
        ? ProjectSubContractorAssignmentService.Payment.update(editingPayment.id, payload)
        : ProjectSubContractorAssignmentService.Payment.create(payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          resetPaymentForm();
          loadPayments(paymentAssignment.id);
          loadAssignments();
        },
        error: error => {
          Utils.errorHandling(error);
          setPaymentSaving(false);
        },
        complete: () => setPaymentSaving(false),
      });
    });
  };

  const handleDeletePayment = (record: ProjectSubContractorPaymentResponse) => {
    if (!paymentAssignment) return;
    ProjectSubContractorAssignmentService.Payment.remove(record.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadPayments(paymentAssignment.id);
        loadAssignments();
      },
      error: Utils.errorHandling,
    });
  };

  const amountInputProps = {
    style: { width: '100%' },
    min: 0,
    formatter: (value?: string | number) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    parser: parseMoney,
  };

  const numberValue = (value?: number | null) => Number(value || 0);

  const validateAssignmentBusinessRules = (values: any) => {
    const errors: { name: string; errors: string[] }[] = [
      'advanceValue',
      'finalSettlementValue',
      'contractSignDate',
      'plannedEndDate',
      'actualEndDate',
    ].map(name => ({ name, errors: [] }));
    const addError = (name: string, message: string) => {
      const field = errors.find(item => item.name === name);
      if (field) field.errors.push(message);
    };

    const contractValue = numberValue(values.contractValue);
    const advanceValue = numberValue(values.advanceValue);
    const finalSettlementValue = numberValue(values.finalSettlementValue);

    if (contractValue > 0 && advanceValue > contractValue) {
      addError('advanceValue', 'Tiền ứng trước không được lớn hơn giá trị hợp đồng.');
    }
    if (contractValue > 0 && finalSettlementValue > contractValue) {
      addError('finalSettlementValue', 'Giá trị quyết toán không được lớn hơn giá trị hợp đồng.');
    }
    if (values.contractSignDate && values.plannedStartDate && values.contractSignDate.isAfter(values.plannedStartDate, 'day')) {
      addError('contractSignDate', 'Ngày ký HĐ không được sau ngày bắt đầu dự kiến.');
    }
    if (values.plannedStartDate && values.plannedEndDate && values.plannedStartDate.isAfter(values.plannedEndDate, 'day')) {
      addError('plannedEndDate', 'Ngày kết thúc dự kiến phải sau hoặc bằng ngày bắt đầu dự kiến.');
    }
    if (values.actualStartDate && values.actualEndDate && values.actualStartDate.isAfter(values.actualEndDate, 'day')) {
      addError('actualEndDate', 'Ngày kết thúc thực tế phải sau hoặc bằng ngày bắt đầu thực tế.');
    }

    form.setFields(errors);
    return errors.every(item => item.errors.length === 0);
  };

  const validatePaymentBusinessRules = (values: any) => {
    const errors: { name: string; errors: string[] }[] = [
      'createdDate',
      'paymentDate',
      'currentCompletionValue',
      'currentRequestedPaymentValue',
      'advanceDeduction',
      'currentActualPaymentValue',
    ].map(name => ({ name, errors: [] }));
    const addError = (name: string, message: string) => {
      const field = errors.find(item => item.name === name);
      if (field) field.errors.push(message);
    };

    const contractValue = numberValue(paymentAssignment?.contractValue);
    const contractAdvanceValue = numberValue(paymentAssignment?.advanceValue);
    const paidValue = numberValue(paymentAssignment?.paidValue);
    const editingPaidValue = numberValue(editingPayment?.fCurrentPaidValue ?? editingPayment?.currentActualPaymentValue);
    const paidBeforeThisLine = Math.max(paidValue - editingPaidValue, 0);
    const currentCompletionValue = numberValue(values.currentCompletionValue);
    const requestedValue = numberValue(values.currentRequestedPaymentValue);
    const advanceDeduction = numberValue(values.advanceDeduction);
    const actualPaymentValue = numberValue(values.currentActualPaymentValue);

    if (values.createdDate && values.paymentDate && values.createdDate.isAfter(values.paymentDate, 'day')) {
      addError('paymentDate', 'Ngày thanh toán phải sau hoặc bằng ngày lập.');
    }
    if (contractValue > 0 && currentCompletionValue > contractValue) {
      addError('currentCompletionValue', 'Giá trị hoàn thành kỳ này không được lớn hơn giá trị hợp đồng.');
    }
    if (requestedValue > currentCompletionValue) {
      addError('currentRequestedPaymentValue', 'Giá trị đề nghị thanh toán không được lớn hơn giá trị hoàn thành kỳ này.');
    }
    if (contractAdvanceValue > 0 && advanceDeduction > contractAdvanceValue) {
      addError('advanceDeduction', 'Giảm trừ tạm ứng không được lớn hơn tiền ứng trước của hợp đồng.');
    }
    if (advanceDeduction + actualPaymentValue > requestedValue) {
      addError('currentActualPaymentValue', 'Thực thanh toán + giảm trừ tạm ứng không được lớn hơn giá trị đề nghị thanh toán.');
    }
    if (contractValue > 0 && paidBeforeThisLine + actualPaymentValue + contractAdvanceValue > contractValue) {
      addError('currentActualPaymentValue', 'Tổng đã thanh toán sau dòng này không được vượt giá trị hợp đồng sau khi trừ ứng trước.');
    }

    paymentForm.setFields(errors);
    return errors.every(item => item.errors.length === 0);
  };

  const columns = [
    { title: 'Loại nhà thầu', dataIndex: 'subContractorTypeCode', width: 150, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Tên loại nhà thầu', dataIndex: 'subContractorTypeName', width: 190, render: displayValue },
    { title: 'Mã nhà thầu', dataIndex: 'contractorCode', width: 140 },
    { title: 'Mã đối tượng ISS', dataIndex: 'accountingObjectCode', width: 150, render: displayValue },
    { title: 'Nhà thầu', dataIndex: 'contractorName', width: 240 },
    { title: 'Số HĐ', dataIndex: 'contractNumber', width: 150, render: displayValue },
    { title: 'Ngày ký HĐ', dataIndex: 'contractSignDate', width: 120, render: formatDate },
    { title: 'Giá trị HĐ', dataIndex: 'contractValue', width: 150, align: 'right' as const, render: formatMoney },
    { title: 'Ứng trước', dataIndex: 'advanceValue', width: 130, align: 'right' as const, render: formatMoney },
    {
      title: 'Đã thanh toán',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: ProjectSubContractorAssignmentResponse) =>
        record.hasPayments ? formatMoney(record.paidValue) : <Tag>Chưa có</Tag>,
    },
    { title: 'Bắt đầu dự kiến', dataIndex: 'plannedStartDate', width: 135, render: formatDate },
    { title: 'Bắt đầu thực tế', dataIndex: 'actualStartDate', width: 135, render: formatDate },
    { title: 'Kết thúc dự kiến', dataIndex: 'plannedEndDate', width: 140, render: formatDate },
    { title: 'Kết thúc thực tế', dataIndex: 'actualEndDate', width: 140, render: formatDate },
    { title: 'Đại diện tại công trình', dataIndex: 'projectRepresentative', width: 190, render: displayValue },
    { title: 'Giá trị quyết toán', dataIndex: 'finalSettlementValue', width: 160, align: 'right' as const, render: formatMoney },
    { title: 'File hợp đồng', dataIndex: 'contractFileUrl', width: 220, render: displayValue },
    { title: 'Mã khoản mục', dataIndex: 'expenseItemCode', width: 140, render: displayValue },
    { title: 'Mã vụ việc', dataIndex: 'workItemCode', width: 130, render: displayValue },
    { title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 140, render: displayValue },
    { title: 'TK Nợ', dataIndex: 'debitAccount', width: 100, render: displayValue },
    { title: 'TK Có', dataIndex: 'creditAccount', width: 100, render: displayValue },
    { title: 'TK Nợ 1', dataIndex: 'debitAccount1', width: 100, render: displayValue },
    { title: 'TK Có 1', dataIndex: 'creditAccount1', width: 100, render: displayValue },
    { title: 'TK Nợ 2', dataIndex: 'debitAccount2', width: 100, render: displayValue },
    { title: 'TK Có 2', dataIndex: 'creditAccount2', width: 100, render: displayValue },
    { title: 'TK Nợ 3', dataIndex: 'debitAccount3', width: 100, render: displayValue },
    { title: 'TK Có 3', dataIndex: 'creditAccount3', width: 100, render: displayValue },
    { title: 'Ghi chú', dataIndex: 'note', width: 220, render: displayValue },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: ProjectSubContractorAssignmentResponse) =>
        record.status === 1 ? <Tag color="green">Đang dùng</Tag> : <Tag>Ngừng dùng</Tag>,
    },
    {
      title: 'Thao tác',
      width: 160,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: unknown, record: ProjectSubContractorAssignmentResponse) => (
        <Space>
          <Button title="Thanh toán" type="text" icon={<MoneyCollectOutlined />} onClick={() => openPaymentDrawer(record)} />
          <Button title="Sửa lựa chọn" type="text" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} />
          <Popconfirm
            title={record.hasPayments ? 'Nhà thầu đã có thanh toán, không thể xóa gán.' : 'Xóa chọn nhà thầu này?'}
            onConfirm={() => handleDelete(record)}
            disabled={record.hasPayments}
          >
            <Button title="Xóa lựa chọn" type="text" danger icon={<DeleteOutlined />} disabled={record.hasPayments} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'Kỳ TT',
      dataIndex: 'paymentPeriodCode',
      width: 180,
      render: (_: unknown, record: ProjectSubContractorPaymentResponse) =>
        displayValue(record.paymentPeriodDisplayName || record.paymentPeriodName || record.paymentPeriodCode),
    },
    {
      title: 'Chi tiết kỳ thanh toán',
      dataIndex: 'paymentCatalogName',
      width: 220,
      render: (_: unknown, record: ProjectSubContractorPaymentResponse) =>
        displayValue(record.paymentCatalogName || record.paymentCatalogCode),
    },
    { title: 'Ngày TT', dataIndex: 'paymentDate', width: 120, render: (value: string) => value ? dayjs(value).format('DD/MM/YYYY') : '-' },
    { title: 'H', dataIndex: 'hCurrentCompletionVolume', width: 120, render: displayValue },
    { title: 'A - Hợp đồng', dataIndex: 'aContractValue', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'B - Ứng trước', dataIndex: 'bAdvanceValue', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'C - NT lũy kế', dataIndex: 'cAccumulatedCompletionValue', width: 140, align: 'right' as const, render: formatMoney },
    { title: 'D - NT kỳ trước', dataIndex: 'dPreviousAccumulatedCompletionValue', width: 140, align: 'right' as const, render: formatMoney },
    { title: 'KL kỳ này', dataIndex: 'currentPeriodCompletionValue', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'E - Đã TT lũy kế', dataIndex: 'eAccumulatedPaidValue', width: 140, align: 'right' as const, render: formatMoney },
    { title: 'F - TT kỳ này', dataIndex: 'fCurrentPaidValue', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'G - Còn lại', dataIndex: 'gRemainingValue', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'J - Diễn giải', dataIndex: 'jDescription', width: 220, render: displayValue },
    { title: 'K - Công trình', dataIndex: 'kProjectCode', width: 130, render: displayValue },
    {
      title: 'Thao tác',
      width: 90,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: unknown, record: ProjectSubContractorPaymentResponse) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openPaymentEdit(record)} />
          <Popconfirm title="Xóa kỳ thanh toán này?" onConfirm={() => handleDeletePayment(record)}>
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
          Chọn nhà thầu cho Dự án
        </Typography.Title>
        <Space>
          <span>Hiển thị ngừng dùng</span>
          <Switch checked={includeInactive} onChange={setIncludeInactive} />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer} disabled={!projectId}>
          Tạo mới
        </Button>
      </div>

      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Luồng chuẩn: tạo loại nhà thầu, tạo danh mục nhà thầu thuộc loại đó, tạo mới nhà thầu vào công trình kèm thông tin hợp đồng, sau đó nhập các kỳ thanh toán/nghiệm thu.
      </Typography.Paragraph>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns as any}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 4100 }}
      />

      <Drawer
        destroyOnClose
        open={drawerOpen}
        width={860}
        title={editingItem ? 'Cập nhật nhà thầu' : 'Thêm mới nhà thầu'}
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
          <Form.Item name="subContractorTypeId" label="Loại nhà thầu" rules={[{ required: true, message: 'Chọn loại nhà thầu' }]}>
            <Select
              showSearch
              options={typeOptions}
              optionFilterProp="label"
              onChange={applyType}
              placeholder="Chọn loại nhà thầu"
            />
          </Form.Item>
          <Form.Item name="contractorCatalogId" label="Nhà thầu" rules={[{ required: true, message: 'Chọn nhà thầu' }]}>
            <Select
              showSearch
              options={contractorOptions}
              optionFilterProp="label"
              onChange={applyContractor}
              disabled={!selectedTypeId}
              placeholder={selectedTypeId ? 'Chọn nhà thầu thuộc loại đã chọn' : 'Chọn loại nhà thầu trước'}
            />
          </Form.Item>

          {selectedTypeId && contractorOptions.length === 0 && (
            <Alert
              showIcon
              type="warning"
              style={{ marginBottom: 16 }}
              message="Chưa có nhà thầu trong loại này"
              description="Vào Quản lý danh mục hệ thống > Danh mục nhà thầu để tạo nhà thầu thuộc loại đã chọn trước khi chọn vào công trình."
            />
          )}

          {selectedContractor && (
            <Descriptions
              bordered
              size="small"
              column={2}
              title="Thông tin chung từ danh mục nhà thầu"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Mã nhà thầu">{selectedContractor.code}</Descriptions.Item>
              <Descriptions.Item label="Tên nhà thầu">{selectedContractor.name}</Descriptions.Item>
              <Descriptions.Item label="Mã đối tượng ISS">{displayValue(selectedContractor.accountingObjectCode)}</Descriptions.Item>
              <Descriptions.Item label="Mã khoản mục">{displayValue(selectedContractor.expenseItemCode)}</Descriptions.Item>
              <Descriptions.Item label="Mã vụ việc">{displayValue(selectedContractor.workItemCode)}</Descriptions.Item>
              <Descriptions.Item label="Mã hợp đồng kế toán">{displayValue(selectedContractor.contractCode)}</Descriptions.Item>
              <Descriptions.Item label="TK Nợ">{displayValue(selectedContractor.debitAccount)}</Descriptions.Item>
              <Descriptions.Item label="TK Có">{displayValue(selectedContractor.creditAccount)}</Descriptions.Item>
              <Descriptions.Item label="TK Nợ 1">{displayValue(selectedContractor.debitAccount1)}</Descriptions.Item>
              <Descriptions.Item label="TK Có 1">{displayValue(selectedContractor.creditAccount1)}</Descriptions.Item>
              <Descriptions.Item label="TK Nợ 2">{displayValue(selectedContractor.debitAccount2)}</Descriptions.Item>
              <Descriptions.Item label="TK Có 2">{displayValue(selectedContractor.creditAccount2)}</Descriptions.Item>
            </Descriptions>
          )}

          <Divider orientation="left">Thông tin hợp đồng tại công trình</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="contractNumber" label="Số hợp đồng">
              <Input placeholder="Nhập số hợp đồng" />
            </Form.Item>
            <Form.Item name="contractSignDate" label="Ngày ký HĐ">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="contractValue" label="Giá trị hợp đồng">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="advanceValue" label="Tiền ứng trước">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="plannedStartDate" label="Ngày bắt đầu dự kiến">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="actualStartDate" label="Ngày bắt đầu thực tế">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="plannedEndDate" label="Ngày kết thúc dự kiến">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="actualEndDate" label="Ngày kết thúc thực tế">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="projectRepresentative" label="Đại diện tại công trình">
              <Input placeholder="Nhập/chọn người đại diện" />
            </Form.Item>
            <Form.Item name="finalSettlementValue" label="Giá trị quyết toán">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="contractFileUrl" label="Link file hợp đồng" style={{ gridColumn: '1 / span 2' }}>
              <Input placeholder="Dán link file hợp đồng hoặc đường dẫn file" />
            </Form.Item>
          </div>

          {/* <Alert
            showIcon
            type="info"
            message="Thông tin hợp đồng lưu ở NhaThauPhu_CongTrinh. Các kỳ thanh toán sẽ link về bản ghi này qua ID/GUID trong NhaThauPhu_CongTrinh_ThanhToan."
          /> */}
          <Form.Item label="Đang dùng" name="status" valuePropName="checked" style={{ marginTop: 16 }}>
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        destroyOnClose
        open={paymentDrawerOpen}
        width={1280}
        title={`Thanh toán thầu phụ: ${paymentAssignment?.contractorName || ''}`}
        onClose={() => setPaymentDrawerOpen(false)}
      >
        {paymentAssignment && (
          <Descriptions bordered size="small" column={4} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Công trình">{displayValue(paymentAssignment.projectCode || projectCode)}</Descriptions.Item>
            <Descriptions.Item label="Loại">{paymentAssignment.subContractorTypeCode}</Descriptions.Item>
            <Descriptions.Item label="Số HĐ">{displayValue(paymentAssignment.contractNumber)}</Descriptions.Item>
            <Descriptions.Item label="Giá trị HĐ">{formatMoney(paymentAssignment.contractValue)}</Descriptions.Item>
          </Descriptions>
        )}

        <Form form={paymentForm} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            <Form.Item name="paymentPeriodCode" label="Mã kỳ thanh toán" rules={[{ required: true, message: 'Chọn kỳ thanh toán' }]}>
              <Select
                showSearch
                options={paymentPeriodOptions as any}
                optionFilterProp="label"
                placeholder="Chọn kỳ từ danh mục KyThanhToan"
              />
            </Form.Item>
            <Form.Item name="paymentPeriodDetailId" label="Chi tiết kỳ thanh toán" rules={[{ required: true, message: 'Chọn chi tiết kỳ thanh toán' }]}>
              <Select
                showSearch
                options={paymentPeriodDetailOptions as any}
                optionFilterProp="label"
                placeholder={selectedPaymentPeriodCode ? 'Chọn chi tiết nghiệp vụ của kỳ' : 'Chọn mã kỳ trước'}
                disabled={!selectedPaymentPeriodCode}
              />
            </Form.Item>
            <Form.Item name="createdBy" label="Người lập">
              <Input placeholder="Người lập phiếu" />
            </Form.Item>
            <Form.Item name="createdDate" label="Ngày lập">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="paymentDate" label="Ngày thanh toán">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="H - Giá trị nghiệm thu kỳ này" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 8 }}>
                <Form.Item name="completionAmount" noStyle>
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số" />
                </Form.Item>
                <Form.Item name="completionUnit" noStyle>
                  <Select
                    options={[
                      { value: 'PERCENT', label: '%' },
                      { value: 'QUANTITY', label: 'Khối lượng' },
                    ]}
                  />
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item name="currentCompletionValue" label="Giá trị hoàn thành kỳ này">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="currentRequestedPaymentValue" label="Giá trị đề nghị TT kỳ này">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="advanceDeduction" label="Giảm trừ tạm ứng">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="currentActualPaymentValue" label="Giá trị thực thanh toán kỳ này">
              <InputNumber {...amountInputProps} />
            </Form.Item>
            <Form.Item name="description" label="J - Diễn giải" style={{ gridColumn: 'span 2' }}>
              <Input placeholder="Diễn giải thanh toán/nghiệm thu" />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <Input placeholder="Ghi chú nội bộ" />
            </Form.Item>
          </div>
        </Form>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} loading={paymentSaving} onClick={handleSavePayment}>
            {editingPayment ? 'Cập nhật chi tiết kỳ thanh toán' : 'Lưu chi tiết kỳ thanh toán'}
          </Button>
          <Button onClick={resetPaymentForm}>Nhập mới</Button>
        </Space>

        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 12 }}
          message="Công thức hiển thị: A = hợp đồng, B = ứng trước, C/D = nghiệm thu lũy kế hiện tại/kỳ trước, E/F = thanh toán lũy kế/kỳ này, G = A - E - B."
        />
        <Table
          rowKey="id"
          loading={paymentLoading}
          dataSource={payments}
          columns={paymentColumns as any}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1800 }}
          summary={data => {
            const totalCompletion = data.reduce((sum, item) => sum + Number(item.currentPeriodCompletionValue || 0), 0);
            const totalPaid = data.reduce((sum, item) => sum + Number(item.fCurrentPaidValue || 0), 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={8}>
                  <Typography.Text strong>Tổng kỳ đang xem</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right">
                  <Typography.Text strong>{formatMoney(totalCompletion)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} />
                <Table.Summary.Cell index={10} align="right">
                  <Typography.Text strong>{formatMoney(totalPaid)}</Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Drawer>
    </div>
  );
};
