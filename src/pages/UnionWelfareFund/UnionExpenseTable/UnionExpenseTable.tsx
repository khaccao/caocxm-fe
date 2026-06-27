import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
  message,
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { firstValueFrom } from 'rxjs';

import { defaultPagingParams } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { EmployeeResponse, EmployeeService } from '@/services/EmployeeService';
import { GroupDTO, GroupService } from '@/services/GroupService';
import UnionExpenseProposalService, {
  UnionExpenseFundSummary,
  UnionExpenseProposal,
  UnionExpenseProposalInput,
  UnionExpenseProposalPagingResponse,
  UnionExpenseProposalStatus,
} from '@/services/UnionExpenseProposalService';
import { getCurrentCompany, getCurrentUser, getGrantedPolicies } from '@/store/app';
import { getUserRoles } from '@/store/app/appSelectors';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';
import './UnionExpenseTable.css';

const { RangePicker } = DatePicker;

const statusOptions = [
  { label: 'Chờ duyệt', value: UnionExpenseProposalStatus.Pending },
  { label: 'Đã duyệt', value: UnionExpenseProposalStatus.Approved },
  { label: 'Từ chối', value: UnionExpenseProposalStatus.Rejected },
];

const statusMeta = {
  [UnionExpenseProposalStatus.Pending]: { label: 'Chờ duyệt', color: 'gold' },
  [UnionExpenseProposalStatus.Approved]: { label: 'Đã duyệt', color: 'green' },
  [UnionExpenseProposalStatus.Rejected]: { label: 'Từ chối', color: 'red' },
};

const currency = (value?: number) => {
  return (value || 0).toLocaleString('en-US');
};

const defaultUnionFeeAmount = 10000;

const emptyFundSummary: UnionExpenseFundSummary = {
  companyId: 0,
  startDate: '',
  endDate: '',
  totalCollected: 0,
  approvedExpense: 0,
  pendingExpense: 0,
  rejectedExpense: 0,
  balance: 0,
};

type ApproverKind = 'director' | 'manager';

type ApproverOption = {
  value: string;
  label: string;
  searchText: string;
  approverName: string;
  kind: ApproverKind;
};

const DIRECTOR_GROUP_KEYWORDS = ['bgd', 'ban giam doc', 'giam doc', 'pho giam doc', 'director'];
const MANAGER_GROUP_KEYWORDS = ['ql', 'quan ly', 'bch', 'ban chi huy', 'chi huy', 'truong', 'manager', 'commander'];
const DIRECTOR_EMPLOYEE_CODES = ['NVH01', 'NVH02'];

const normalizeText = (value?: string | number | null) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const getEmployeeName = (employee: Partial<EmployeeResponse> & { name?: string }) =>
  employee.name ||
  `${employee.lastName || ''} ${employee.middleName || ''} ${employee.firstName || ''}`.replace(/\s+/g, ' ').trim() ||
  `#${employee.id}`;

const matchAny = (text: string, keywords: string[]) => keywords.some(keyword => text.includes(keyword));

const buildApproverOptions = (
  employees: EmployeeResponse[],
  groups: (GroupDTO & { employees?: EmployeeResponse[] })[],
): ApproverOption[] => {
  const optionMap = new Map<string, ApproverOption>();

  const addEmployee = (
    employee: Partial<EmployeeResponse> & { name?: string },
    kind: ApproverKind,
    source?: string,
  ) => {
    if (!employee?.id || employee.status === 8) return;

    const value = String(employee.id);
    const approverName = getEmployeeName(employee);
    const employeeCode = employee.employeeCode ? `${employee.employeeCode} - ` : '';
    const label = `${employeeCode}${approverName}${source ? ` (${source})` : ''}`;
    const searchText = normalizeText(`${label} ${employee.groupCodes?.join(' ') || ''}`);

    const current = optionMap.get(value);
    if (!current || current.kind === 'manager') {
      optionMap.set(value, { value, label, searchText, approverName, kind });
    }
  };

  groups.forEach(group => {
    const groupText = normalizeText(`${group.code || ''} ${group.name || ''}`);
    const kind = matchAny(groupText, DIRECTOR_GROUP_KEYWORDS)
      ? 'director'
      : matchAny(groupText, MANAGER_GROUP_KEYWORDS)
        ? 'manager'
        : undefined;

    if (!kind) return;
    group.employees?.forEach(employee => addEmployee(employee, kind, group.code || group.name));
  });

  employees.forEach(employee => {
    const employeeCode = String(employee.employeeCode || '').toUpperCase();
    const groupText = normalizeText(employee.groupCodes?.join(' ') || '');

    if (DIRECTOR_EMPLOYEE_CODES.includes(employeeCode)) {
      addEmployee(employee, 'director', 'Ban giám đốc');
      return;
    }

    if (employeeCode.startsWith('BCH') || matchAny(groupText, MANAGER_GROUP_KEYWORDS)) {
      addEmployee(employee, 'manager', 'Quản lý/BCH');
    }
  });

  return Array.from(optionMap.values()).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'director' ? -1 : 1;
    return a.label.localeCompare(b.label, 'vi');
  });
};

const normalizeProposal = (item: any): UnionExpenseProposal => ({
  id: item?.id ?? item?.Id,
  companyId: item?.companyId ?? item?.CompanyId,
  code: item?.code ?? item?.Code,
  expenseDate: item?.expenseDate ?? item?.ExpenseDate,
  title: item?.title ?? item?.Title,
  description: item?.description ?? item?.Description,
  amount: item?.amount ?? item?.Amount ?? 0,
  status: item?.status ?? item?.Status ?? UnionExpenseProposalStatus.Pending,
  rejectReason: item?.rejectReason ?? item?.RejectReason,
  proposerUserId: item?.proposerUserId ?? item?.ProposerUserId,
  proposerName: item?.proposerName ?? item?.ProposerName,
  submittedAt: item?.submittedAt ?? item?.SubmittedAt,
  approverUserId: item?.approverUserId ?? item?.ApproverUserId,
  approverName: item?.approverName ?? item?.ApproverName,
  approvedAt: item?.approvedAt ?? item?.ApprovedAt,
  createdDate: item?.createdDate ?? item?.CreatedDate,
  modifiedDate: item?.modifiedDate ?? item?.ModifiedDate,
});

const normalizeFundSummary = (item: any): UnionExpenseFundSummary => ({
  companyId: item?.companyId ?? item?.CompanyId ?? 0,
  startDate: item?.startDate ?? item?.StartDate ?? '',
  endDate: item?.endDate ?? item?.EndDate ?? '',
  totalCollected: item?.totalCollected ?? item?.TotalCollected ?? 0,
  approvedExpense: item?.approvedExpense ?? item?.ApprovedExpense ?? 0,
  pendingExpense: item?.pendingExpense ?? item?.PendingExpense ?? 0,
  rejectedExpense: item?.rejectedExpense ?? item?.RejectedExpense ?? 0,
  balance: item?.balance ?? item?.Balance ?? 0,
});

const calculateDisplayedUnionFeeTotal = (employees: any[] = [], feeRows: any[] = []) => {
  if (!employees.length) return undefined;

  return employees.reduce((total, employee) => {
    const fee = feeRows.find(item => item.employeeCode === employee.employeeCode || item.EmployeeCode === employee.employeeCode);
    return total + Number(fee?.amount ?? fee?.Amount ?? defaultUnionFeeAmount);
  }, 0);
};

type UnionExpenseTableProps = {
  mode?: 'proposal' | 'approval';
};

export const UnionExpenseTable = ({ mode = 'proposal' }: UnionExpenseTableProps) => {
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const company = useAppSelector(getCurrentCompany());
  const currentUser = useAppSelector(getCurrentUser());
  const grantedPolicies = useAppSelector(getGrantedPolicies());
  const userRoles = useAppSelector(getUserRoles());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    mode === 'approval' ? UnionExpenseProposalStatus.Pending : undefined,
  );
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<UnionExpenseProposal[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UnionExpenseProposal | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<UnionExpenseProposal | null>(null);
  const [approverOptions, setApproverOptions] = useState<ApproverOption[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [fundSummary, setFundSummary] = useState<UnionExpenseFundSummary>(emptyFundSummary);

  const isApprovalMode = mode === 'approval';
  const isDirectorRole = userRoles?.some((role: string) => ['GiamDoc', 'PhoGiamDoc', 'System'].includes(role));
  const canApprove = Boolean(grantedPolicies?.['CongDoan.ChiQuyCD.Approve'] || isDirectorRole);

  const groupedApproverOptions = useMemo(
    () => [
      {
        label: 'Ban giám đốc / Phó giám đốc',
        options: approverOptions.filter(option => option.kind === 'director'),
      },
      {
        label: 'Quản lý / Ban chỉ huy',
        options: approverOptions.filter(option => option.kind === 'manager'),
      },
    ].filter(group => group.options.length),
    [approverOptions],
  );

  const summary = useMemo(() => {
    return data.reduce(
      (result, item) => {
        result.total += item.amount || 0;
        if (item.status === UnionExpenseProposalStatus.Approved) result.approved += item.amount || 0;
        if (item.status === UnionExpenseProposalStatus.Pending) result.pending += item.amount || 0;
        return result;
      },
      { total: 0, approved: 0, pending: 0 },
    );
  }, [data]);

  const fetchData = async (
    page = pagination.current || 1,
    pageSize = pagination.pageSize || 20,
    overrides?: {
      nextDateRange?: [Dayjs, Dayjs];
      nextStatusFilter?: number;
      nextKeyword?: string;
    },
  ) => {
    if (!company?.id) return;

    const activeDateRange = overrides?.nextDateRange || dateRange;
    const activeKeyword = overrides?.nextKeyword ?? keyword;
    const activeStatusFilter =
      overrides && Object.prototype.hasOwnProperty.call(overrides, 'nextStatusFilter')
        ? overrides.nextStatusFilter
        : statusFilter;

    setLoading(true);
    try {
      const startDate = activeDateRange[0].format('YYYY-MM-DD');
      const endDate = activeDateRange[1].format('YYYY-MM-DD');
      const [response, summaryResponse, employeeResponse, feeResponse]: [
        UnionExpenseProposalPagingResponse,
        UnionExpenseFundSummary,
        any,
        any,
      ] = await Promise.all([
        firstValueFrom(
          UnionExpenseProposalService.Get.getByCompanyId(company.id, activeStatusFilter, {
            search: {
              ...defaultPagingParams,
              page,
              pageSize,
              ...(activeKeyword ? { search: activeKeyword } : {}),
              startDate,
              endDate,
            },
          }),
        ),
        firstValueFrom(UnionExpenseProposalService.Get.getFundSummary(company.id, startDate, endDate)),
        firstValueFrom(
          EmployeeService.Get.getEmployees(company.id, {
            search: {
              page: 1,
              pageSize: 10000,
              startDate,
              endDate,
            },
          }),
        ),
        firstValueFrom(
          EmployeeService.Get.getFeeTableEmployee(company.id, {
            search: {
              page: 1,
              paging: false,
              startDate,
              endDate,
            },
          }),
        ),
      ]);
      const responseAny = response as any;
      const results = (responseAny?.results || responseAny?.Results || []).map(normalizeProposal);
      const queryCount = responseAny?.queryCount || responseAny?.QueryCount || results.length;
      const normalizedSummary = normalizeFundSummary(summaryResponse);
      const displayedCollected = calculateDisplayedUnionFeeTotal(
        employeeResponse?.results || employeeResponse?.Results || [],
        feeResponse?.results || feeResponse?.Results || [],
      );
      setData(results);
      setFundSummary({
        ...normalizedSummary,
        totalCollected: displayedCollected ?? normalizedSummary.totalCollected,
        balance: (displayedCollected ?? normalizedSummary.totalCollected) - normalizedSummary.approvedExpense,
      });
      setTotal(queryCount);
      setPagination({ current: page, pageSize, total: queryCount });
    } catch (error) {
      Utils.errorHandling(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize || 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, dateRange, statusFilter]);

  useEffect(() => {
    if (!company?.id) return;

    setLoadingApprovers(true);
    Promise.all([
      firstValueFrom(EmployeeService.Get.getEmployees(company.id, { search: { page: 1, pageSize: 10000 } })),
      firstValueFrom(GroupService.Get.getGroup(company.id)),
    ])
      .then(([employeeResponse, groupResponse]) => {
        setApproverOptions(buildApproverOptions(employeeResponse?.results || [], groupResponse?.results || []));
      })
      .catch(Utils.errorHandling)
      .finally(() => setLoadingApprovers(false));
  }, [company?.id]);

  const openCreateDrawer = () => {
    setEditingRecord(null);
    form.setFieldsValue({
      expenseDate: dayjs(),
      title: undefined,
      amount: undefined,
      approverUserId: undefined,
      approverName: undefined,
      description: undefined,
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (record: UnionExpenseProposal) => {
    setEditingRecord(record);
    form.setFieldsValue({
      expenseDate: dayjs(record.expenseDate),
      title: record.title,
      amount: record.amount,
      approverUserId: record.approverUserId || undefined,
      approverName: record.approverName,
      description: record.description,
    });
    setDrawerOpen(true);
  };

  const saveProposal = async () => {
    if (!company?.id) return;

    const values = await form.validateFields();
    const input: UnionExpenseProposalInput = {
      companyId: company.id,
      expenseDate: values.expenseDate.format('YYYY-MM-DD'),
      title: values.title,
      amount: values.amount,
      approverUserId: values.approverUserId,
      approverName: values.approverName,
      description: values.description,
      proposerUserId: currentUser?.Id,
    } as UnionExpenseProposalInput;

    setSaving(true);
    try {
      if (editingRecord) {
        await firstValueFrom(UnionExpenseProposalService.Put.update(editingRecord.id, input));
        message.success('Đã cập nhật đề xuất chi công đoàn.');
      } else {
        await firstValueFrom(UnionExpenseProposalService.Post.create(input));
        message.success('Đã tạo đề xuất chi công đoàn.');
      }
      const proposalMonthRange: [Dayjs, Dayjs] = [
        values.expenseDate.startOf('month'),
        values.expenseDate.endOf('month'),
      ];
      setKeyword('');
      setStatusFilter(undefined);
      setDateRange(proposalMonthRange);
      setDrawerOpen(false);
      await fetchData(1, pagination.pageSize || 20, {
        nextDateRange: proposalMonthRange,
        nextStatusFilter: undefined,
        nextKeyword: '',
      });
    } catch (error) {
      Utils.errorHandling(error);
    } finally {
      setSaving(false);
    }
  };

  const approveProposal = (record: UnionExpenseProposal) => {
    Modal.confirm({
      title: 'Duyệt đề xuất chi công đoàn?',
      content: `${record.code} - ${record.title}`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        await firstValueFrom(UnionExpenseProposalService.Post.approve(record.id));
        message.success('Đã duyệt đề xuất.');
        await fetchData(pagination.current || 1, pagination.pageSize || 20);
      },
    });
  };

  const rejectProposal = async () => {
    if (!rejectingRecord) return;

    const values = await rejectForm.validateFields();
    setSaving(true);
    try {
      await firstValueFrom(UnionExpenseProposalService.Post.reject(rejectingRecord.id, values.rejectReason));
      message.success('Đã từ chối đề xuất.');
      setRejectingRecord(null);
      rejectForm.resetFields();
      await fetchData(pagination.current || 1, pagination.pageSize || 20);
    } catch (error) {
      Utils.errorHandling(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProposal = (record: UnionExpenseProposal) => {
    Modal.confirm({
      title: 'Xóa đề xuất chi công đoàn?',
      content: `${record.code} - ${record.title}`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        await firstValueFrom(UnionExpenseProposalService.Delete.delete(record.id));
        message.success('Đã xóa đề xuất.');
        await fetchData(pagination.current || 1, pagination.pageSize || 20);
      },
    });
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: 'Ngày chi',
      dataIndex: 'expenseDate',
      width: 120,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Nội dung',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      width: 140,
      align: 'right' as const,
      render: (value: number) => currency(value),
    },
    {
      title: 'Người đề xuất',
      dataIndex: 'proposerName',
      width: 180,
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approverName',
      width: 180,
      render: (value: string) => value || 'Chưa chọn',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (value: UnionExpenseProposalStatus) => {
        const meta = statusMeta[value] || statusMeta[UnionExpenseProposalStatus.Pending];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      width: isApprovalMode ? 210 : 104,
      fixed: 'right' as const,
      render: (_: unknown, record: UnionExpenseProposal) => {
        const isPending = record.status === UnionExpenseProposalStatus.Pending;
        return (
          <Space size={4}>
            {isApprovalMode && isPending && canApprove && (
              <>
                <Button size="small" type={isApprovalMode ? 'primary' : 'default'} icon={<CheckOutlined />} onClick={() => approveProposal(record)}>
                  Duyệt
                </Button>
                <Button size="small" icon={<CloseOutlined />} onClick={() => setRejectingRecord(record)}>
                  Từ chối
                </Button>
              </>
            )}
            {isPending && !isApprovalMode && (
              <WithPermission policyKeys={['CongDoan.ChiQuyCD.Edit']} strategy="hide">
                <Button size="small" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} />
              </WithPermission>
            )}
            {isPending && !isApprovalMode && (
              <WithPermission policyKeys={['CongDoan.ChiQuyCD.Delete']} strategy="hide">
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteProposal(record)} />
              </WithPermission>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {isApprovalMode ? 'Duyệt đề xuất chi công đoàn' : 'Đề xuất chi công đoàn'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {isApprovalMode
              ? 'Lọc và duyệt các phiếu chi công đoàn đang chờ xử lý.'
              : 'Tạo và theo dõi các phiếu đề xuất chi công đoàn.'}
          </Typography.Text>
        </div>
        {!isApprovalMode && (
          <WithPermission policyKeys={['CongDoan.ChiQuyCD.Create']} strategy="disable">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
              Tạo đề xuất
            </Button>
          </WithPermission>
        )}
      </div>

      <Space wrap style={{ width: '100%', marginBottom: 12 }}>
        <RangePicker
          value={dateRange}
          format="DD/MM/YYYY"
          onChange={values => {
            if (values?.[0] && values?.[1]) setDateRange([values[0], values[1]]);
          }}
          allowClear={false}
        />
        <Select
          style={{ width: 160 }}
          allowClear
          placeholder="Trạng thái"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Input.Search
          allowClear
          placeholder="Tìm mã phiếu, nội dung, người đề xuất"
          style={{ width: 320 }}
          value={keyword}
          onChange={event => {
            const nextKeyword = event.target.value;
            setKeyword(nextKeyword);
            if (!nextKeyword) {
              fetchData(1, pagination.pageSize || 20, { nextKeyword: '' });
            }
          }}
          onSearch={value => {
            setKeyword(value);
            fetchData(1, pagination.pageSize || 20, { nextKeyword: value });
          }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(1, pagination.pageSize || 20)}>
          Tải lại
        </Button>
      </Space>

      <div className="union-expense-fund-summary">
        <div className="union-expense-fund-card union-expense-fund-card-collected">
          <Typography.Text type="secondary">Tổng tiền đã thu CĐ</Typography.Text>
          <Typography.Title level={4}>{currency(fundSummary.totalCollected)}</Typography.Title>
        </div>
        <div className="union-expense-fund-card union-expense-fund-card-expense">
          <Typography.Text type="secondary">Đã duyệt chi CĐ</Typography.Text>
          <Typography.Title level={4}>{currency(fundSummary.approvedExpense)}</Typography.Title>
        </div>
        <div className="union-expense-fund-card union-expense-fund-card-balance">
          <Typography.Text type="secondary">Quỹ còn lại</Typography.Text>
          <Typography.Title level={4}>{currency(fundSummary.balance)}</Typography.Title>
        </div>
        <div className="union-expense-fund-card union-expense-fund-card-pending">
          <Typography.Text type="secondary">Đang chờ duyệt</Typography.Text>
          <Typography.Title level={4}>{currency(fundSummary.pendingExpense)}</Typography.Title>
        </div>
      </div>

      <Space wrap style={{ marginBottom: 12 }}>
        <Tag color="blue">Tổng dòng đang xem: {currency(summary.total)}</Tag>
        <Tag color="green">Đã duyệt: {currency(summary.approved)}</Tag>
        <Tag color="gold">Chờ duyệt: {currency(summary.pending)}</Tag>
      </Space>

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        dataSource={data}
        columns={columns}
        rowClassName={record => {
          if (record.status === UnionExpenseProposalStatus.Pending) return 'union-expense-row-pending';
          if (record.status === UnionExpenseProposalStatus.Approved) return 'union-expense-row-approved';
          if (record.status === UnionExpenseProposalStatus.Rejected) return 'union-expense-row-rejected';
          return '';
        }}
        scroll={{ x: isApprovalMode ? 1350 : 1180 }}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showTotal: value => `Tổng ${value} phiếu`,
        }}
        onChange={nextPagination => fetchData(nextPagination.current || 1, nextPagination.pageSize || 20)}
      />

      <Drawer
        title={editingRecord ? 'Cập nhật đề xuất chi công đoàn' : 'Tạo đề xuất chi công đoàn'}
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" loading={saving} onClick={saveProposal}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Ngày chi" name="expenseDate" rules={[{ required: true, message: 'Chọn ngày chi' }]}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Nội dung chi" name="title" rules={[{ required: true, message: 'Nhập nội dung chi' }]}>
            <Input placeholder="Ví dụ: Chi thăm hỏi công đoàn" />
          </Form.Item>
          <Form.Item label="Số tiền" name="amount" rules={[{ required: true, message: 'Nhập số tiền' }]}>
            <InputNumber<number>
              min={0}
              precision={0}
              style={{ width: '100%' }}
              formatter={value => (value === undefined || value === null ? '' : currency(Number(value)))}
              parser={value => Number(String(value || '').replace(/[^\d]/g, '') || 0)}
            />
          </Form.Item>
          <Form.Item
            label="Người duyệt"
            name="approverUserId"
            rules={[{ required: true, message: 'Chọn người duyệt' }]}
          >
            <Select
              showSearch
              allowClear
              loading={loadingApprovers}
              placeholder="Chọn quản lý hoặc Ban giám đốc"
              options={groupedApproverOptions}
              filterOption={(input, option) => {
                return normalizeText((option as any)?.searchText).includes(normalizeText(input));
              }}
              onChange={(_, option) => {
                const selected = option as any;
                form.setFieldValue('approverName', selected?.approverName);
              }}
              notFoundContent={loadingApprovers ? 'Đang tải...' : 'Chưa có nhân sự quản lý phù hợp'}
            />
          </Form.Item>
          <Form.Item name="approverName" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Ghi chú" name="description">
            <Input.TextArea rows={4} placeholder="Ghi chú thêm nếu có" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Từ chối đề xuất chi công đoàn"
        open={Boolean(rejectingRecord)}
        okText="Từ chối"
        okButtonProps={{ danger: true, loading: saving }}
        cancelText="Hủy"
        onCancel={() => setRejectingRecord(null)}
        onOk={rejectProposal}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item label="Lý do từ chối" name="rejectReason" rules={[{ required: true, message: 'Nhập lý do từ chối' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
