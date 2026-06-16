import { useEffect, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import { FormatDateAPI } from '@/common/define';
import { EmployeeResponse, EmployeeService } from '@/services/EmployeeService';
import { PayrollTeamResponse, PayrollTeamService, PayrollTeamType } from '@/services/PayrollTeamService';
import { ProjectService } from '@/services/ProjectService';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import Utils from '@/utils';

const typeOptions: { value: PayrollTeamType; label: string; color: string }[] = [
  { value: 'BCH', label: 'Ban chỉ huy', color: 'blue' },
  { value: 'WORKER', label: 'Công nhân', color: 'green' },
  { value: 'OFFICE', label: 'Văn phòng', color: 'purple' },
  { value: 'SERVICE', label: 'Dịch vụ', color: 'orange' },
  { value: 'OTHER', label: 'Khác', color: 'default' },
];

const accountingFields = [
  ['maCongNo', 'Mã công nợ'],
  ['maVuViec', 'Mã vụ việc'],
  ['maKhoanMuc', 'Mã khoản mục'],
  ['maHopDong', 'Mã hợp đồng'],
  ['tkNo', 'TK Nợ'],
  ['tkCo', 'TK Có'],
  ['tkNo1', 'TK Nợ 1'],
  ['tkCo1', 'TK Có 1'],
  ['tkNo2', 'TK Nợ 2'],
  ['tkCo2', 'TK Có 2'],
  ['ghiChu1', 'Ghi chú 1'],
  ['ghiChu2', 'Ghi chú 2'],
  ['ghiChu3', 'Ghi chú 3'],
  ['ghiChu4', 'Ghi chú 4'],
  ['ext1', 'Ext 1'],
  ['ext2', 'Ext 2'],
] as const;

export const PayrollTeams = () => {
  const company = useAppSelector(getCurrentCompany());
  const activeMenu = useAppSelector(getActiveMenu());
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [teams, setTeams] = useState<PayrollTeamResponse[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PayrollTeamResponse>();
  const [editingTeam, setEditingTeam] = useState<PayrollTeamResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const projectOptions = useMemo(
    () => (Array.isArray(projects) ? projects : []).map(project => ({ value: project.id, label: project.name })),
    [projects],
  );

  const employeeOptions = useMemo(
    () =>
      (Array.isArray(employees) ? employees : []).map(employee => ({
        value: employee.id,
        label: `${employee.employeeCode || ''} - ${[
          employee.lastName,
          employee.middleName,
          employee.firstName,
        ].filter(Boolean).join(' ')}`.trim(),
        employee,
      })),
    [employees],
  );

  const filteredTeams = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    const source = Array.isArray(teams) ? teams : [];
    if (!keyword) return source;

    return source.filter(team =>
      [team.code, team.name, team.projectName, team.maCongNo, team.maVuViec]
        .some(value => `${value || ''}`.toLocaleLowerCase('vi').includes(keyword)),
    );
  }, [search, teams]);

  const loadTeams = () => {
    if (!company?.id) return;

    setLoading(true);
    PayrollTeamService.Get.getTeams(company.id).subscribe({
      next: result => setTeams(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  useEffect(() => {
    if (!company?.id) return;

    loadTeams();

    const projectSubscription = ProjectService.Get.getProjectsByCompanyId(company.id).subscribe({
      next: result => setProjects(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
    const employeeSubscription = EmployeeService.Get.getEmployees(company.id, {
      search: { page: 1, pageSize: 10000 },
    }).subscribe({
      next: result => setEmployees(Array.isArray(result?.results) ? result.results : []),
      error: Utils.errorHandling,
    });

    return () => {
      projectSubscription.unsubscribe();
      employeeSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  const openCreateDrawer = () => {
    setEditingTeam(undefined);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      type: 'WORKER',
      companyId: company?.id,
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (team: PayrollTeamResponse) => {
    setEditingTeam(team);
    form.setFieldsValue({
      ...team,
      companyId: company?.id,
    });
    setDrawerOpen(true);
  };

  const handleSaveTeam = () => {
    form.validateFields().then(values => {
      if (!company?.id) return;

      const payload = {
        ...values,
        companyId: company.id,
        parentId: values.parentId || null,
        projectId: values.projectId || null,
        status: values.status ?? 1,
      };

      setSaving(true);
      const request = editingTeam
        ? PayrollTeamService.Put.updateTeam(editingTeam.id, payload)
        : PayrollTeamService.Post.createTeam(payload);

      request.subscribe({
        next: () => {
          Utils.successNotification();
          setDrawerOpen(false);
          loadTeams();
        },
        error: error => {
          Utils.errorHandling(error);
          setSaving(false);
        },
        complete: () => setSaving(false),
      });
    });
  };

  const loadMembers = (team: PayrollTeamResponse) => {
    setSelectedTeam(team);
    setMemberDrawerOpen(true);
    PayrollTeamService.Get.getEmployees(team.id).subscribe({
      next: result => setMembers(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
    });
  };

  const handleAddMembers = () => {
    memberForm.validateFields().then(values => {
      if (!selectedTeam) return;

      const selectedEmployeeIds: number[] = values.employeeIds || [];
      const employeePayload = selectedEmployeeIds
        .map(employeeId => {
          const employee = employees.find(item => item.id === employeeId);
          return employee
            ? {
                employeeId,
                employeeCode: employee.employeeCode,
                projectId: values.projectId || selectedTeam.projectId || null,
                effectiveFrom: values.effectiveFrom?.format(FormatDateAPI) || dayjs().format(FormatDateAPI),
                effectiveTo: values.effectiveTo?.format(FormatDateAPI) || null,
              }
            : undefined;
        })
        .filter(Boolean) as any[];

      PayrollTeamService.Post.addEmployees(selectedTeam.id, employeePayload).subscribe({
        next: result => {
          setMembers(Array.isArray(result) ? result : []);
          memberForm.resetFields();
          Utils.successNotification();
        },
        error: Utils.errorHandling,
      });
    });
  };

  const handleRemoveMember = (record: any) => {
    if (!selectedTeam) return;

    PayrollTeamService.Delete.removeEmployee(selectedTeam.id, record.employeeId, record.projectId).subscribe({
      next: () => {
        setMembers(current => (Array.isArray(current) ? current : []).filter(item => item.id !== record.id));
        Utils.successNotification();
      },
      error: Utils.errorHandling,
    });
  };

  const handleRemoveTeam = (team: PayrollTeamResponse) => {
    PayrollTeamService.Delete.removeTeam(team.id).subscribe({
      next: () => {
        Utils.successNotification();
        loadTeams();
      },
      error: Utils.errorHandling,
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
          {activeMenu?.label || 'Tổ đội tính lương'}
        </Typography.Title>
        <Input
          allowClear
          value={search}
          placeholder="Tìm mã tổ, tên tổ, dự án, mã kế toán"
          suffix={search ? null : <SearchOutlined />}
          onChange={event => setSearch(event.target.value)}
          style={{ width: 360 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
          Thêm tổ đội
        </Button>
      </div>

      <Table<PayrollTeamResponse>
        rowKey="id"
        loading={loading}
        dataSource={filteredTeams}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        columns={[
          { title: 'Mã tổ', dataIndex: 'code', width: 130 },
          { title: 'Tên tổ', dataIndex: 'name', width: 220 },
          {
            title: 'Loại',
            dataIndex: 'type',
            width: 130,
            render: value => {
              const option = typeOptions.find(item => item.value === value);
              return <Tag color={option?.color}>{option?.label || value}</Tag>;
            },
          },
          { title: 'Công trình', dataIndex: 'projectName', ellipsis: true },
          { title: 'Mã công nợ', dataIndex: 'maCongNo', width: 120 },
          { title: 'Mã vụ việc', dataIndex: 'maVuViec', width: 120 },
          { title: 'TK Nợ', dataIndex: 'tkNo', width: 100 },
          { title: 'TK Có', dataIndex: 'tkCo', width: 100 },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 110,
            render: value => <Tag color={value === 1 ? 'success' : 'default'}>{value === 1 ? 'Đang dùng' : 'Ngừng dùng'}</Tag>,
          },
          {
            title: '',
            width: 128,
            render: (_, record) => (
              <Space>
                <Button title="Nhân sự" size="small" icon={<TeamOutlined />} onClick={() => loadMembers(record)} />
                <Button title="Sửa" size="small" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} />
                <Popconfirm
                  title="Ngừng dùng tổ đội này?"
                  okText="Ngừng dùng"
                  cancelText="Hủy"
                  onConfirm={() => handleRemoveTeam(record)}
                >
                  <Button danger title="Ngừng dùng" size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Drawer
        title={editingTeam ? 'Cập nhật tổ đội tính lương' : 'Thêm tổ đội tính lương'}
        open={drawerOpen}
        width={720}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button type="primary" loading={saving} onClick={handleSaveTeam}>
            Lưu
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Space size={12} style={{ width: '100%' }} align="start">
            <Form.Item label="Mã tổ" name="code" rules={[{ required: true, message: 'Nhập mã tổ' }]}>
              <Input style={{ width: 180 }} placeholder="BCH_CT01" />
            </Form.Item>
            <Form.Item label="Tên tổ" name="name" rules={[{ required: true, message: 'Nhập tên tổ' }]}>
              <Input style={{ width: 300 }} placeholder="BCH công trình CT01" />
            </Form.Item>
            <Form.Item label="Loại" name="type" rules={[{ required: true, message: 'Chọn loại' }]}>
              <Select style={{ width: 150 }} options={typeOptions.map(({ value, label }) => ({ value, label }))} />
            </Form.Item>
          </Space>

          <Space size={12} style={{ width: '100%' }} align="start">
            <Form.Item label="Công trình" name="projectId">
              <Select
                allowClear
                showSearch
                style={{ width: 360 }}
                placeholder="Áp dụng toàn công ty nếu để trống"
                optionFilterProp="label"
                options={projectOptions}
              />
            </Form.Item>
            <Form.Item label="Tổ cha" name="parentId">
              <Select
                allowClear
                showSearch
                style={{ width: 260 }}
                placeholder="Không có"
                optionFilterProp="label"
                options={teams
                  ? (Array.isArray(teams) ? teams : [])
                  .filter(team => team.id !== editingTeam?.id)
                  .map(team => ({ value: team.id, label: `${team.code} - ${team.name}` }))
                  : []}
              />
            </Form.Item>
          </Space>

          <Typography.Text strong>Mã kế toán</Typography.Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, marginTop: 12 }}>
            {accountingFields.map(([name, label]) => (
              <Form.Item key={name} label={label} name={name}>
                <Input />
              </Form.Item>
            ))}
          </div>

          <Form.Item label="Trạng thái" name="status">
            <Select
              options={[
                { value: 1, label: 'Đang dùng' },
                { value: 0, label: 'Ngừng dùng' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={selectedTeam ? `Nhân sự thuộc ${selectedTeam.code} - ${selectedTeam.name}` : 'Nhân sự tổ đội'}
        open={memberDrawerOpen}
        width={900}
        okText="Thêm nhân sự"
        cancelText="Đóng"
        onOk={handleAddMembers}
        onCancel={() => setMemberDrawerOpen(false)}
      >
        <Form
          form={memberForm}
          layout="vertical"
          initialValues={{
            effectiveFrom: dayjs(),
            projectId: selectedTeam?.projectId,
          }}
        >
          <Space align="start" style={{ width: '100%' }}>
            <Form.Item
              label="Nhân sự"
              name="employeeIds"
              rules={[{ required: true, message: 'Chọn nhân sự' }]}
            >
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Tìm theo tên hoặc mã nhân sự"
                style={{ width: 360 }}
                options={employeeOptions}
              />
            </Form.Item>
            <Form.Item label="Công trình" name="projectId">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: 260 }}
                options={projectOptions}
              />
            </Form.Item>
            <Form.Item label="Từ ngày" name="effectiveFrom">
              <DatePicker style={{ width: 140 }} />
            </Form.Item>
            <Form.Item label="Đến ngày" name="effectiveTo">
              <DatePicker style={{ width: 140 }} />
            </Form.Item>
          </Space>
        </Form>

        <Table
          rowKey="id"
          size="small"
          dataSource={members}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'Mã nhân sự', dataIndex: 'employeeCode', width: 120 },
            { title: 'Họ tên', dataIndex: 'employeeName' },
            { title: 'Công trình', dataIndex: 'projectName' },
            {
              title: 'Hiệu lực',
              width: 210,
              render: (_, record) =>
                `${dayjs(record.effectiveFrom).format('DD/MM/YYYY')} - ${
                  record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Hiện tại'
                }`,
            },
            {
              title: '',
              width: 56,
              render: (_, record) => (
                <Popconfirm
                  title="Gỡ nhân sự khỏi tổ đội tính lương?"
                  okText="Gỡ"
                  cancelText="Hủy"
                  onConfirm={() => handleRemoveMember(record)}
                >
                  <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};
