import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DeleteOutlined, ReloadOutlined, SaveOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { firstValueFrom } from 'rxjs';

import './BchRoundingSetup.css';
import { EmployeeResponse, EmployeeService } from '@/services/EmployeeService';
import { GroupDTO, GroupService } from '@/services/GroupService';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

type BchRoundGroupCode = 'BCH_ROUND_2H' | 'BCH_ROUND_1H';

type BchRoundConfig = {
  code: BchRoundGroupCode;
  name: string;
  description: string;
  threshold: string;
};

type CxmGroup = GroupDTO & {
  id: number;
  employees?: EmployeeResponse[];
};

const ROUND_GROUPS: BchRoundConfig[] = [
  {
    code: 'BCH_ROUND_2H',
    name: 'Làm tròn BCH 2 giờ',
    description: 'Tổng ca chính từ 6 giờ đến dưới 8 giờ sẽ được nâng lên 8 giờ.',
    threshold: '>= 360 và < 480 phút',
  },
  {
    code: 'BCH_ROUND_1H',
    name: 'Làm tròn BCH 1 giờ',
    description: 'Tổng ca chính từ 7 giờ đến dưới 8 giờ sẽ được nâng lên 8 giờ.',
    threshold: '>= 420 và < 480 phút',
  },
];

const getEmployeeName = (employee: Partial<EmployeeResponse>) =>
  `${employee.lastName || ''} ${employee.middleName || ''} ${employee.firstName || ''}`.trim() || `#${employee.id}`;

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const getEmployeeSearchLabel = (employee: Partial<EmployeeResponse>) =>
  `${employee.employeeCode || ''} ${getEmployeeName(employee)}`;

export const BchRoundingSetup: React.FC = () => {
  const company = useAppSelector(getCurrentCompany());
  const companyId = Number(company?.id || 0);
  const [groups, setGroups] = useState<CxmGroup[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Record<BchRoundGroupCode, number[]>>({
    BCH_ROUND_2H: [],
    BCH_ROUND_1H: [],
  });
  const [memberSearch, setMemberSearch] = useState<Record<BchRoundGroupCode, string>>({
    BCH_ROUND_2H: '',
    BCH_ROUND_1H: '',
  });
  const [loading, setLoading] = useState(false);
  const [savingCode, setSavingCode] = useState<BchRoundGroupCode | null>(null);

  const groupByCode = useMemo(() => {
    return ROUND_GROUPS.reduce((acc, item) => {
      acc[item.code] = groups.find(group => group.code === item.code);
      return acc;
    }, {} as Record<BchRoundGroupCode, CxmGroup | undefined>);
  }, [groups]);

  const loadData = useCallback(async () => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    try {
      const [groupResponse, employeeResponse] = await Promise.all([
        firstValueFrom(GroupService.Get.getGroup(companyId)),
        firstValueFrom(EmployeeService.Get.getEmployees(companyId, { search: { page: 1, pageSize: 10000 } })),
      ]);
      setGroups(groupResponse?.results || []);
      setEmployees(employeeResponse?.results || []);
    } catch (error) {
      message.error('Không tải được dữ liệu cấu hình BCH.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createGroup = async (config: BchRoundConfig) => {
    if (!companyId) {
      return undefined;
    }

    const inputValues: GroupDTO = {
      companyId,
      parentId: null,
      name: config.name,
      code: config.code,
      type: 0,
      status: 0,
    };

    await firstValueFrom(GroupService.Post.addNewGroup(inputValues));
    const groupResponse = await firstValueFrom(GroupService.Get.getGroup(companyId));
    const nextGroups = groupResponse?.results || [];
    setGroups(nextGroups);
    return nextGroups.find((group: CxmGroup) => group.code === config.code);
  };

  const ensureGroup = async (config: BchRoundConfig) => {
    return groupByCode[config.code] || createGroup(config);
  };

  const saveMembers = async (config: BchRoundConfig) => {
    const employeeIds = selectedEmployeeIds[config.code];
    if (!employeeIds.length) {
      message.warning('Chọn ít nhất một nhân sự để thêm vào nhóm.');
      return;
    }

    setSavingCode(config.code);
    try {
      const targetGroup = await ensureGroup(config);
      if (!targetGroup?.id) {
        message.error('Không tạo được nhóm cấu hình.');
        return;
      }

      await firstValueFrom(GroupService.Put.addMemberToGroup(targetGroup.id, employeeIds));
      setSelectedEmployeeIds(prev => ({ ...prev, [config.code]: [] }));
      await loadData();
      message.success('Đã cập nhật nhân sự cho nhóm.');
    } catch (error) {
      message.error('Cập nhật nhóm thất bại.');
    } finally {
      setSavingCode(null);
    }
  };

  const removeMember = async (groupId: number, employeeId: number) => {
    if (!companyId) {
      return;
    }

    setLoading(true);
    try {
      await firstValueFrom(GroupService.Delete.deleteEmployeeGroup({ employeeId, parentId: groupId }));
      await loadData();
      message.success('Đã xóa nhân sự khỏi nhóm.');
    } catch (error) {
      message.error('Xóa nhân sự khỏi nhóm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const renderGroupPanel = (config: BchRoundConfig) => {
    const group = groupByCode[config.code];
    const currentEmployeeIds = new Set((group?.employees || []).map(employee => employee.id));
    const availableEmployees = employees.filter(employee => !currentEmployeeIds.has(employee.id));
    const searchValue = normalizeSearchText(memberSearch[config.code]);
    const currentMembers = (group?.employees || []).filter(employee =>
      normalizeSearchText(getEmployeeSearchLabel(employee)).includes(searchValue),
    );
    const columns: ColumnsType<EmployeeResponse> = [
      {
        title: 'Mã NV',
        dataIndex: 'employeeCode',
        width: 110,
      },
      {
        title: 'Nhân sự',
        render: (_, employee) => getEmployeeName(employee),
      },
      {
        title: '',
        width: 64,
        align: 'center',
        render: (_, employee) =>
          group?.id ? (
            <Popconfirm
              title="Xóa nhân sự khỏi nhóm này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => removeMember(group.id, employee.id)}
            >
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : null,
      },
    ];

    return (
      <section className="bch-rounding-panel" key={config.code}>
        <div className="bch-rounding-panel-header">
          <div>
            <h2 className="bch-rounding-panel-title">{config.name}</h2>
            <div className="bch-rounding-code">{config.code}</div>
            <Typography.Text type="secondary">{config.description}</Typography.Text>
          </div>
          <Tag color={group ? 'green' : 'orange'}>{group ? 'Đã có nhóm' : 'Chưa có nhóm'}</Tag>
        </div>

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Text strong>Điều kiện: {config.threshold}</Typography.Text>
          <div className="bch-rounding-actions">
            <Select
              mode="multiple"
              allowClear
              showSearch
              maxTagCount="responsive"
              style={{ flex: 1 }}
              placeholder="Tìm theo tên hoặc mã nhân viên"
              value={selectedEmployeeIds[config.code]}
              optionFilterProp="label"
              filterOption={(input, option) =>
                normalizeSearchText(String(option?.label || '')).includes(normalizeSearchText(input))
              }
              options={availableEmployees.map(employee => ({
                value: employee.id,
                label: `${employee.employeeCode || ''} - ${getEmployeeName(employee)}`,
              }))}
              onChange={value => setSelectedEmployeeIds(prev => ({ ...prev, [config.code]: value }))}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingCode === config.code}
              onClick={() => saveMembers(config)}
            >
              Lưu
            </Button>
          </div>
        </Space>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm trong danh sách đã thêm"
          value={memberSearch[config.code]}
          onChange={event => setMemberSearch(prev => ({ ...prev, [config.code]: event.target.value }))}
          style={{ marginBottom: 12 }}
        />

        <Table
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={currentMembers}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          locale={{ emptyText: <Empty description="Chưa có nhân sự trong nhóm" /> }}
        />
      </section>
    );
  };

  return (
    <div className="bch-rounding-page">
      <div className="bch-rounding-header">
        <div>
          <h1 className="bch-rounding-title">
            <TeamOutlined /> Cấu hình làm tròn công BCH
          </h1>
          <div className="bch-rounding-subtitle">
            Quản lý nhân sự áp dụng rule BCH_ROUND_2H và BCH_ROUND_1H cho báo cáo chấm công.
          </div>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          Tải lại
        </Button>
      </div>

      <div className="bch-rounding-grid">{ROUND_GROUPS.map(renderGroupPanel)}</div>
    </div>
  );
};

export default BchRoundingSetup;
