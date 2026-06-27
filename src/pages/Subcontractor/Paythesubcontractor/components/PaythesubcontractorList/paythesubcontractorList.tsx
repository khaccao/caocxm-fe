import React, { useEffect, useMemo, useState } from 'react';

import {
  MoneyCollectOutlined,
} from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './paythesubcontractorList.module.css';
import { Paythesubcontractor } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { EmployeeResponse, EmployeeService } from '@/services/EmployeeService';
import {
  PaymentPeriodDetailResponse,
  PaymentPeriodResponse,
  ProjectSubContractorAssignmentResponse,
  ProjectSubContractorPaymentResponse,
  ProjectSubContractorAssignmentService,
} from '@/services/ProjectSubContractorAssignmentService';
import { useAppSelector } from '@/store/hooks';
import { getCurrentCompany } from '@/store/app';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';

interface DataType {
  key: string;
  code: string;
  date: string;
  name: string;
  contractValue: number;
  cumulativeValue: number;
  remainingValue: number;
}
export interface PaymentTerm {
  code: string;
  accountingCustomerCode?: string;
  contractorTypeCode?: string;
  contractorTypeName?: string;
  name: string;
  nguoiDaiDien: string;
  giaTriTheoHopDong: number;
  giaTriTheoHopDong_Code: string;
  giaTriUngTruoc: number;
  giaTriUngTruoc_Code: string;
  giaTriLuyKeThucHienDotNay: number;
  giaTriKeHoachThucHienDotNay_Code: string;
  giaTriThanhToanKeHoach: number;
  giaTriThanhToanKeHoach_Code: string;
  giaTriTTLanNay: number;
  giaTriTTLanNay_Code: string;
  giaTriConLai: number;
  giaTriConLai_Code: string;
  projectId: number;
  paymentTermDate: string;
  paymentTerm: number;
  id: number;
}

const parseMoney = (value?: string) => {
  const rawValue = String(value || '').replace(/[^\d]/g, '');
  return rawValue ? Number(rawValue) : 0;
};

const moneyInputProps = {
  style: { width: '100%' },
  min: 0,
  formatter: (value?: string | number) => {
    const rawValue = String(value ?? '').replace(/[^\d]/g, '');
    return rawValue ? Number(rawValue).toLocaleString('en-US') : '';
  },
  parser: parseMoney,
};

const numberValue = (value?: number | null) => Number(value || 0);

const data: DataType[] = [
  {
    key: '1',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '2',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '3',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '2',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
  {
    key: '3',
    code: '1234',
    date: '12/12/2023',
    name: 'ABC',
    contractValue: 500000,
    cumulativeValue: 50000,
    remainingValue: 550000,
  },
];

interface PaythesubcontractorListProps {
  type?: Paythesubcontractor;
  startDate?: string;
  endDate?: string;
  paymentPeriodCode?: string | null;
  paymentPeriodDetailId?: number | null;
}

const PaythesubcontractorList: React.FC<PaythesubcontractorListProps> = ({
  type,
  startDate,
  endDate,
  paymentPeriodCode,
  paymentPeriodDetailId,
}) => {
  const { t } = useTranslation('subcontractor');
  const [form] = Form.useForm();
  const paymentByProject = useAppSelector((state: RootState) => state.project.paymentByProject || []);
  const selectedProject = useAppSelector(getSelectedProject()) as any;
  const company = useAppSelector(getCurrentCompany());
  const windowSize = useWindowSize();
  const [assignments, setAssignments] = useState<ProjectSubContractorAssignmentResponse[]>([]);
  const [createdPayments, setCreatedPayments] = useState<ProjectSubContractorPaymentResponse[]>([]);
  const [paymentPeriods, setPaymentPeriods] = useState<PaymentPeriodResponse[]>([]);
  const [paymentPeriodDetails, setPaymentPeriodDetails] = useState<PaymentPeriodDetailResponse[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<ProjectSubContractorAssignmentResponse>();
  const [bchMembers, setBchMembers] = useState<EmployeeResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const paymentTerm = type ? (type === Paythesubcontractor.ThanhToan12 ? 0 : 1) : null;
  const showLegacyPaymentTable = Boolean(type);
  const companyId = company?.id || selectedProject?.companyId || 1;
  const projectCode = selectedProject?.code || selectedProject?.projectCode || selectedProject?.Code || selectedProject?.id?.toString();
  const selectedPaymentPeriodCode = Form.useWatch('paymentPeriodCode', form);
  const completionMode = Form.useWatch('completionMode', form) || 'COUNTABLE';

  const getDefaultPaymentPeriodCode = () => {
    if (paymentPeriodCode) return paymentPeriodCode;
    if (type === Paythesubcontractor.ThanhToan12) return 'Ky2';
    if (type === Paythesubcontractor.ThanhToan27) return 'Ky4';
    return paymentPeriods[0]?.code;
  };

  const normalizeText = (value?: string | null) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const isSubContractorPeriodDetail = (detail: PaymentPeriodDetailResponse) => {
    const text = normalizeText([
      detail.catalogCode,
      detail.catalogName,
      detail.displayName,
      detail.expenseItemCode,
      detail.note,
    ].filter(Boolean).join(' '));

    return text.includes('thau') || text.includes('nha thau') || text.includes('subcontractor');
  };

  const pickPaymentPeriodDetailId = (details: PaymentPeriodDetailResponse[]) => {
    const currentDetailId = form.getFieldValue('paymentPeriodDetailId');
    const routeDetailId = paymentPeriodDetailId || undefined;
    const currentDetail = details.find(item => Number(item.id) === Number(currentDetailId));
    const routeDetail = details.find(item => Number(item.id) === Number(routeDetailId));
    const subContractorDetail = details.find(isSubContractorPeriodDetail);

    if (currentDetail) return currentDetail.id;
    if (routeDetail) return routeDetail.id;
    if (type === Paythesubcontractor.ThanhToan12 || type === Paythesubcontractor.ThanhToan27) {
      return subContractorDetail?.id;
    }

    return details.length === 1 ? details[0].id : undefined;
  };

  const getEmployeeDisplayName = (employee: EmployeeResponse) => {
    const fullName = [employee.lastName, employee.middleName, employee.firstName].filter(Boolean).join(' ').trim();
    return fullName || employee.employeeCode || `Nhân sự ${employee.id}`;
  };

  const bchMemberOptions = useMemo(() => bchMembers.map(item => {
    const name = getEmployeeDisplayName(item);
    const label = [item.employeeCode, name].filter(Boolean).join(' - ');

    return {
      value: label,
      label,
      searchText: [item.employeeCode, name].filter(Boolean).join(' '),
    };
  }), [bchMembers]);

  useEffect(() => {
    if (!selectedProject?.id) return;

    ProjectSubContractorAssignmentService.Get.getByProject(companyId, selectedProject.id, projectCode, false).subscribe({
      next: result => setAssignments(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  }, [companyId, projectCode, selectedProject?.id]);

  useEffect(() => {
    EmployeeService.Get.getMembersToGroupCode('BCH', { search: { paging: false } }).subscribe({
      next: result => setBchMembers(Array.isArray(result?.results) ? result.results : []),
      error: Utils.errorHandling,
    });
  }, []);

  const loadCreatedPayments = () => {
    if (!selectedProject?.id) return;
    ProjectSubContractorAssignmentService.Payment.getByProject(
      selectedProject.id,
      projectCode,
      paymentTerm,
      startDate,
      endDate,
      paymentPeriodCode,
      paymentPeriodDetailId,
    ).subscribe({
      next: result => setCreatedPayments(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  };

  useEffect(() => {
    loadCreatedPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.id, projectCode, paymentTerm, startDate, endDate, paymentPeriodCode, paymentPeriodDetailId]);

  useEffect(() => {
    ProjectSubContractorAssignmentService.PaymentPeriod.getPeriods(paymentTerm).subscribe({
      next: result => setPaymentPeriods(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  }, [paymentTerm]);

  const assignmentByKey = useMemo(() => {
    const map = new Map<string, ProjectSubContractorAssignmentResponse>();
    assignments.forEach(item => {
      if (item.contractorCode) map.set(`code:${item.contractorCode}`.toLowerCase(), item);
      if (item.accountingObjectCode) map.set(`iss:${item.accountingObjectCode}`.toLowerCase(), item);
      if (item.contractorName) map.set(`name:${item.contractorName}`.toLowerCase(), item);
    });
    return map;
  }, [assignments]);

  const paymentPeriodOptions = useMemo(() => paymentPeriods.map(item => ({
    value: item.code,
    label: `${item.code} - ${item.displayName || item.name || ''}`,
  })).filter(item => item.value), [paymentPeriods]);

  const paymentPeriodDetailOptions = useMemo(() => paymentPeriodDetails.map(item => ({
    value: item.id,
    label: `${item.catalogCode} - ${item.displayName || item.catalogName || ''}`,
  })).filter(item => item.value), [paymentPeriodDetails]);

  const assignmentOptions = useMemo(() => assignments.map(item => ({
    value: item.id,
    label: [
      item.contractorCode,
      item.accountingObjectCode,
      item.contractorName,
      item.subContractorTypeCode,
      item.projectCode,
    ].filter(Boolean).join(' - '),
    searchText: [
      item.contractorCode,
      item.accountingObjectCode,
      item.contractorName,
      item.subContractorTypeCode,
      item.subContractorTypeName,
      item.projectCode,
    ].filter(Boolean).join(' '),
  })), [assignments]);

  const loadPaymentPeriodDetails = (periodCode?: string | null) => {
    const period = paymentPeriods.find(item => item.code === periodCode);
    if (!period?.id) {
      setPaymentPeriodDetails([]);
      form.setFieldValue('paymentPeriodDetailId', undefined);
      return;
    }

    ProjectSubContractorAssignmentService.PaymentPeriod.getDetails(period.id).subscribe({
      next: result => {
        const details = Array.isArray(result) ? result.filter(item => item.status !== 1) : [];
        setPaymentPeriodDetails(details);
        form.setFieldValue('paymentPeriodDetailId', pickPaymentPeriodDetailId(details));
      },
      error: Utils.errorHandling,
    });
  };

  useEffect(() => {
    if (!modalOpen || !selectedPaymentPeriodCode) return;
    loadPaymentPeriodDetails(selectedPaymentPeriodCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentPeriodCode, modalOpen, paymentPeriods]);

  const findAssignment = (record: PaymentTerm) => {
    const keys = [
      record.code ? `code:${record.code}` : '',
      record.accountingCustomerCode ? `iss:${record.accountingCustomerCode}` : '',
      record.name ? `name:${record.name}` : '',
      record.nguoiDaiDien ? `name:${record.nguoiDaiDien}` : '',
    ].filter(Boolean).map(item => item.toLowerCase());

    return keys.map(key => assignmentByKey.get(key)).find(Boolean);
  };

  const hydratePaymentForm = (assignment: ProjectSubContractorAssignmentResponse | undefined, record?: PaymentTerm) => {
    const date = record?.paymentTermDate ? dayjs(record.paymentTermDate) : dayjs();
    const previousCompletion = Number((record as any)?.giaTriLuyKeThucHienDotTruoc || 0);
    const currentCompletion = record
      ? Math.max(Number(record.giaTriLuyKeThucHienDotNay || 0) - previousCompletion, 0)
      : 0;
    const defaultPeriodCode = getDefaultPaymentPeriodCode();
    setSelectedAssignment(assignment);
    form.setFieldsValue({
      assignmentId: assignment?.id,
      paymentPeriodCode: defaultPeriodCode,
      paymentPeriodDetailId: paymentPeriodDetailId || undefined,
      paymentDate: date,
      createdDate: dayjs(),
      createdBy: undefined,
      completionMode: 'COUNTABLE',
      completionAmount: Number((record as any)?.khoiLuong || 0) || undefined,
      completionText: undefined,
      completionUnit: '',
      currentCompletionValue: currentCompletion || record?.giaTriLuyKeThucHienDotNay || 0,
      currentRequestedPaymentValue: record?.giaTriTTLanNay || 0,
      advanceDeduction: 0,
      currentActualPaymentValue: record?.giaTriTTLanNay || 0,
      description: record
        ? `Thanh toán thầu phụ - ${record.name || record.nguoiDaiDien || record.code}`
        : `Thanh toán thầu phụ - ${assignment?.contractorName || assignment?.contractorCode || ''}`,
      note: '',
    });
    loadPaymentPeriodDetails(defaultPeriodCode);
    setModalOpen(true);
  };

  const openManualCreatePayment = () => {
    form.resetFields();
    hydratePaymentForm(undefined);
  };

  const openCreatePayment = (record: PaymentTerm) => {
    const assignment = findAssignment(record);
    if (!assignment) {
      Utils.errorNotification('Chưa tìm thấy nhà thầu đã chọn cho công trình. Cần vào Cài đặt dự án > Nhà thầu để chọn nhà thầu trước.');
      return;
    }

    hydratePaymentForm(assignment, record);
  };

  const validatePaymentBusinessRules = (values: any, assignment: ProjectSubContractorAssignmentResponse) => {
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

    const contractValue = numberValue(assignment.contractValue);
    const contractAdvanceValue = numberValue(assignment.advanceValue);
    const paidValue = numberValue(assignment.paidValue);
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
    if (contractValue > 0 && paidValue + actualPaymentValue + contractAdvanceValue > contractValue) {
      addError('currentActualPaymentValue', 'Tổng đã thanh toán sau dòng này không được vượt giá trị hợp đồng sau khi trừ ứng trước.');
    }

    form.setFields(errors);
    return errors.every(item => item.errors.length === 0);
  };

  const savePayment = () => {
    form.validateFields().then(values => {
      const assignment = selectedAssignment || assignments.find(item => item.id === values.assignmentId);
      if (!assignment) {
        Utils.errorNotification('Chọn nhà thầu đã gán vào công trình trước khi lưu.');
        return;
      }
      if (!validatePaymentBusinessRules(values, assignment)) return;

      setSaving(true);
      const completionBaseValue = values.completionMode === 'UNCOUNTABLE'
        ? String(values.completionText || '').trim()
        : values.completionAmount || values.completionAmount === 0
          ? String(values.completionAmount)
          : '';
      const completionUnit = String(values.completionUnit || '').trim();
      ProjectSubContractorAssignmentService.Payment.create({
        assignmentId: assignment.id,
        createdBy: values.createdBy || null,
        createdDate: values.createdDate ? values.createdDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        paymentPeriodCode: values.paymentPeriodCode,
        paymentPeriodDetailId: values.paymentPeriodDetailId,
        currentCompletionVolume: completionBaseValue
          ? [completionBaseValue, completionUnit].filter(Boolean).join(' ')
          : null,
        currentCompletionValue: values.currentCompletionValue ?? null,
        currentRequestedPaymentValue: values.currentRequestedPaymentValue ?? null,
        advanceDeduction: values.advanceDeduction ?? null,
        currentActualPaymentValue: values.currentActualPaymentValue ?? null,
        description: values.description || null,
        note: values.note || null,
        status: 0,
      }).subscribe({
        next: () => {
          Utils.successNotification('Đã tạo thanh toán. Dòng này sẽ xuất hiện ở kế hoạch tài chính theo đúng kỳ/tháng.');
          setModalOpen(false);
          setSelectedAssignment(undefined);
          form.resetFields();
          loadCreatedPayments();
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const handleAssignmentChange = (assignmentId: number) => {
    const assignment = assignments.find(item => item.id === assignmentId);
    setSelectedAssignment(assignment);
    if (!assignment) return;
    form.setFieldsValue({
      description: `Thanh toán thầu phụ - ${assignment.contractorName || assignment.contractorCode || ''}`,
    });
  };
  //[20510] [nam_do] view dữu liệu cho màn hình thanh toán ngày 12 và ngày 27
  const columns: ColumnsType<PaymentTerm> = [
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('datepay')}</span>,
      dataIndex: 'paymentTermDate',
      align: 'center',
      key: 'paymentTermDate',
      width: 150,
      render: (text: string) => {
        return text ? dayjs(text).format('DD/MM/YYYY') : '-';
      },
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorCode')}</span>,
      dataIndex: 'code',
      align: 'center',
      key: 'code',
      width: 120,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>Mã KH</span>,
      dataIndex: 'accountingCustomerCode',
      align: 'center',
      key: 'accountingCustomerCode',
      width: 120,
      render: value => value || '-',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>Loại nhà thầu</span>,
      dataIndex: 'contractorTypeCode',
      align: 'center',
      key: 'contractorTypeCode',
      width: 140,
      render: (_value, record) => record.contractorTypeCode || record.contractorTypeName || '-',
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractorName')}</span>,
      dataIndex: 'nguoiDaiDien',
      align: 'center',
      key: 'nguoiDaiDien',
      width: 150,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('contractValue')}</span>,
      dataIndex: 'giaTriTheoHopDong',
      align: 'center',
      key: 'giaTriTheoHopDong',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('cumulativeValue')}</span>,
      dataIndex: 'giaTriLuyKeThucHienDotNay',
      align: 'center',
      key: 'giaTriLuyKeThucHienDotNay',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('currentValue')}</span>,
      dataIndex: 'giaTriTTLanNay',
      align: 'center',
      key: 'giaTriTTLanNay',
      width: 150,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>{t('remainingValue')}</span>,
      dataIndex: 'giaTriConLai',
      align: 'center',
      key: 'giaTriConLai',
      width: 100,
      render: value => value.toLocaleString() || 0,
    },
    {
      title: <span style={{ fontWeight: 'bold' }}>Tạo thanh toán</span>,
      key: 'createPayment',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <Button icon={<MoneyCollectOutlined />} onClick={() => openCreatePayment(record)}>
          Tạo
        </Button>
      ),
    },
    // {
    //   title: '',
    //   key: 'action',
    //   align: 'center',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <p style={{ color: 'blue', textDecoration: 'underline' }}>{t('viewDetails')}</p>
    //       <EllipsisOutlined style={{ fontSize: '20px' }} />
    //     </Space>
    //   ),
    // },
  ];

  const totalContractValue = paymentByProject.reduce((sum, item) => sum + item.giaTriTheoHopDong, 0);
  const totalCumulativeValue = paymentByProject.reduce((sum, item) => sum + item.giaTriLuyKeThucHienDotNay, 0);
  const totalCurrentValue = paymentByProject.reduce((sum, item) => sum + item.giaTriTTLanNay, 0);
  const totalRemainingValue = paymentByProject.reduce((sum, item) => sum + item.giaTriConLai, 0);

  const createdPaymentColumns: ColumnsType<ProjectSubContractorPaymentResponse> = [
    {
      title: 'Kỳ',
      dataIndex: 'paymentPeriodCode',
      width: 170,
      render: (_value, record) => record.paymentPeriodDisplayName || record.paymentPeriodName || record.paymentPeriodCode || '-',
    },
    {
      title: 'Chi tiết kỳ thanh toán',
      dataIndex: 'paymentCatalogName',
      width: 220,
      render: (_value, record) =>
        record.paymentCatalogName || record.paymentCatalogCode || <span style={{ color: '#fa8c16' }}>Chưa chọn dòng</span>,
    },
    {
      title: 'Ngày TT',
      dataIndex: 'paymentDate',
      width: 120,
      render: value => value ? dayjs(value).format('DD/MM/YYYY') : '-',
    },
    { title: 'Mã nhà thầu', dataIndex: 'contractorCode', width: 130, render: value => value || '-' },
    { title: 'Mã KH', dataIndex: 'accountingCustomerCode', width: 120, render: value => value || '-' },
    { title: 'Loại nhà thầu', dataIndex: 'contractorTypeCode', width: 140, render: value => value || '-' },
    {
      title: 'Tên nhà thầu',
      dataIndex: 'contractorName',
      width: 220,
      render: (_value, record) => record.contractorName || record.contractorFullName || '-',
    },
    {
      title: 'Giá trị HĐ',
      dataIndex: 'aContractValue',
      align: 'right',
      width: 140,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Lũy kế đến lần này',
      dataIndex: 'cAccumulatedCompletionValue',
      align: 'right',
      width: 165,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    { title: 'H', dataIndex: 'hCurrentCompletionVolume', width: 100, render: value => value || '-' },
    {
      title: 'Giá trị hoàn thành',
      dataIndex: 'currentCompletionValue',
      align: 'right',
      width: 150,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Đề nghị TT',
      dataIndex: 'currentRequestedPaymentValue',
      align: 'right',
      width: 140,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Thực thanh toán',
      dataIndex: 'currentActualPaymentValue',
      align: 'right',
      width: 150,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Còn lại',
      dataIndex: 'gRemainingValue',
      align: 'right',
      width: 130,
      render: value => Number(value || 0).toLocaleString('vi-VN'),
    },
    { title: 'Diễn giải', dataIndex: 'description', width: 220, render: value => value || '-' },
    { title: 'Công trình', dataIndex: 'projectCode', width: 120, render: value => value || '-' },
  ];

  return (
    <div className={styles.tableContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Thanh toán thầu phụ
        </Typography.Title>
        <Button type="primary" icon={<MoneyCollectOutlined />} onClick={openManualCreatePayment}>
          Tạo thanh toán
        </Button>
      </div>
      {showLegacyPaymentTable && (
        <>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Dữ liệu đề xuất/import theo kỳ
          </Typography.Title>
          <Table
            columns={columns}
            dataSource={paymentByProject}
            pagination={false}
            scroll={{ x: 'max-content', y: windowSize[1] - 255 }}
            summary={() => (
              <Table.Summary.Row style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                <Table.Summary.Cell index={0}>{t('total')}</Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5}>{totalContractValue.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={6}>{totalCumulativeValue.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={7}>{totalCurrentValue.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={8}>{totalRemainingValue.toLocaleString()}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </>
      )}
      <Typography.Title level={5} style={{ marginTop: 18 }}>
        Chi tiết kỳ thanh toán đã lập
      </Typography.Title>
      <Table
        rowKey="id"
        columns={createdPaymentColumns}
        dataSource={createdPayments}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 2360 }}
        locale={{ emptyText: 'Chưa có chi tiết kỳ thanh toán đã lập trong kỳ/dự án này' }}
      />
      <Modal
        open={modalOpen}
        title="Tạo thanh toán thầu phụ"
        width={860}
        onCancel={() => setModalOpen(false)}
        onOk={savePayment}
        okText="Lưu thanh toán"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="assignmentId" label="Nhà thầu trong công trình" rules={[{ required: true, message: 'Chọn nhà thầu trong công trình' }]}>
            <Select
              showSearch
              options={assignmentOptions as any}
              optionFilterProp="searchText"
              filterOption={(input, option: any) =>
                String(option?.searchText || option?.label || '').toLocaleLowerCase('vi').includes(input.toLocaleLowerCase('vi'))
              }
              placeholder="Chọn nhà thầu đã gán vào công trình"
              onChange={handleAssignmentChange}
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
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
            <Form.Item name="paymentDate" label="Ngày thanh toán">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="createdBy" label="Người lập">
              <Select
                allowClear
                showSearch
                options={bchMemberOptions as any}
                optionFilterProp="searchText"
                placeholder="Chọn người lập từ danh sách BCH"
                filterOption={(input, option: any) =>
                  String(option?.searchText || option?.label || '').toLocaleLowerCase('vi').includes(input.toLocaleLowerCase('vi'))
                }
              />
            </Form.Item>
            <Form.Item name="createdDate" label="Ngày lập">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Giá trị nghiệm thu" style={{ gridColumn: 'span 2' }}>
              <Form.Item name="completionMode" noStyle>
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { value: 'COUNTABLE', label: 'Đếm được' },
                    { value: 'UNCOUNTABLE', label: 'Không đếm được' },
                  ]}
                  style={{ marginBottom: 8 }}
                />
              </Form.Item>
              <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 8 }}>
                {completionMode === 'UNCOUNTABLE' ? (
                  <Form.Item name="completionText" noStyle>
                    <Input placeholder="Nhập nội dung nghiệm thu" />
                  </Form.Item>
                ) : (
                  <Form.Item name="completionAmount" noStyle>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số" />
                  </Form.Item>
                )}
                <Form.Item name="completionUnit" noStyle>
                  <Input placeholder="Đơn vị" />
                </Form.Item>
              </div>
            </Form.Item>
            <Form.Item name="currentCompletionValue" label="Giá trị hoàn thành kỳ này">
              <InputNumber {...moneyInputProps} />
            </Form.Item>
            <Form.Item name="currentRequestedPaymentValue" label="Giá trị đề nghị TT kỳ này">
              <InputNumber {...moneyInputProps} />
            </Form.Item>
            <Form.Item name="advanceDeduction" label="Giảm trừ tạm ứng">
              <InputNumber {...moneyInputProps} />
            </Form.Item>
            <Form.Item name="currentActualPaymentValue" label="Giá trị thực thanh toán kỳ này">
              <InputNumber {...moneyInputProps} />
            </Form.Item>
            <Form.Item name="description" label="Diễn giải" style={{ gridColumn: 'span 2' }}>
              <Input />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú" style={{ gridColumn: 'span 2' }}>
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PaythesubcontractorList;
