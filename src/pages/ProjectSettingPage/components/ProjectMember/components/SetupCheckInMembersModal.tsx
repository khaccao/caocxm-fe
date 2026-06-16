import { useEffect, useMemo, useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography } from 'antd';

import {
  FaceCheckService,
  ProjectCheckInMemberStatus,
  SetupProjectCheckInMember,
  TeamsResponse,
} from '@/services/CheckInService';
import { useAppSelector } from '@/store/hooks';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployees } from '@/store/employee';
import { useAppDispatch } from '@/store/hooks';
import { getProjectMembers, getSelectedProject } from '@/store/project';
import Utils from '@/utils';

interface SetupCheckInMembersModalProps {
  open: boolean;
  checkInMembers: ProjectCheckInMemberStatus[];
  onClose: () => void;
  onSaved: () => void;
}

interface CheckInSetupMember {
  employeeId: number;
  code: string;
  name: string;
  jobTitle?: string;
  terminated?: boolean;
}

export const SetupCheckInMembersModal = ({
  open,
  checkInMembers,
  onClose,
  onSaved,
}: SetupCheckInMembersModalProps) => {
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const employees = useAppSelector(getEmployees());
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [showTerminatedEmployees, setShowTerminatedEmployees] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [teams, setTeams] = useState<TeamsResponse[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number>();
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingFaceIdentityId, setRemovingFaceIdentityId] = useState<string>();

  const selectedTeamMemberships = useMemo(
    () => checkInMembers.filter(member => member.teamId === selectedTeamId),
    [checkInMembers, selectedTeamId],
  );

  const members = useMemo(() => {
    const memberByEmployeeKey = new Map<string, CheckInSetupMember>();
    const employeeStatusById = new Map(
      (employees?.results || []).map(employee => [employee.id, employee.status]),
    );
    const getEmployeeKey = (employeeId: number, code?: string) => {
      const normalizedCode = `${code || ''}`.trim().toLocaleLowerCase('vi');
      return normalizedCode ? `code:${normalizedCode}` : `id:${employeeId}`;
    };

    (projectMembers?.results || []).forEach(member => {
      memberByEmployeeKey.set(getEmployeeKey(member.employeeId, member.code), {
        employeeId: member.employeeId,
        code: member.code,
        name: member.name,
        jobTitle: member.roleName || undefined,
        terminated: employeeStatusById.get(member.employeeId) === 8,
      });
    });

    checkInMembers.forEach(member => {
      const employeeKey = getEmployeeKey(member.employeeId, member.employeeCode);
      if (!memberByEmployeeKey.has(employeeKey)) {
        memberByEmployeeKey.set(employeeKey, {
          employeeId: member.employeeId,
          code: member.employeeCode,
          name: member.name,
          jobTitle: member.jobTitle,
          terminated: employeeStatusById.get(member.employeeId) === 8,
        });
      }
    });

    const keyword = search.trim().toLocaleLowerCase('vi');
    const source = Array.from(memberByEmployeeKey.values())
      .filter(member => showTerminatedEmployees || !member.terminated);
    if (!keyword) return source;

    return source.filter(member =>
      member.name?.toLocaleLowerCase('vi').includes(keyword)
      || member.code?.toLocaleLowerCase('vi').includes(keyword),
    );
  }, [checkInMembers, employees?.results, projectMembers, search, showTerminatedEmployees]);

  useEffect(() => {
    if (!open || !company?.id) return;

    dispatch(employeeActions.getEmployeesRequest({
      companyId: company.id,
      params: { page: 1, pageSize: 10000 },
    }));
  }, [company?.id, dispatch, open]);

  const getConfiguredMembership = (member: CheckInSetupMember) => {
    const employeeCode = `${member.code || ''}`.trim().toLocaleLowerCase('vi');
    return selectedTeamMemberships.find(membership =>
      membership.employeeId === member.employeeId
      || (
        Boolean(employeeCode)
        && `${membership.employeeCode || ''}`.trim().toLocaleLowerCase('vi') === employeeCode
      ),
    );
  };

  useEffect(() => {
    if (!open || !selectedProject) return;

    setSelectedRowKeys([]);
    setSearch('');
    setLoadingTeams(true);

    const subscription = FaceCheckService.Get.fetchTeamsOfOperator(selectedProject.id).subscribe({
      next: result => {
        const activeTeams = (result || []).filter((team: TeamsResponse) => team.status === 1);
        setTeams(activeTeams);
        setSelectedTeamId(undefined);
      },
      error: error => {
        setTeams([]);
        setSelectedTeamId(undefined);
        setLoadingTeams(false);
        Utils.errorHandling(error);
      },
      complete: () => setLoadingTeams(false),
    });

    return () => subscription.unsubscribe();
  }, [open, selectedProject]);

  const handleSetup = () => {
    if (!selectedProject || !selectedTeamId || selectedRowKeys.length === 0) return;

    const payload: SetupProjectCheckInMember[] = members
      .filter(member => selectedRowKeys.includes(member.employeeId))
      .map(member => ({
        employeeId: member.employeeId,
        employeeCode: member.code,
        name: member.name,
        jobTitle: member.jobTitle,
      }));

    setSaving(true);
    FaceCheckService.Post.setupProjectCheckInMembers(
      selectedProject.id,
      selectedTeamId,
      payload,
    ).subscribe({
      next: () => {
        Utils.successNotification();
        onSaved();
      },
      error: error => {
        Utils.errorHandling(error);
        setSaving(false);
      },
      complete: () => setSaving(false),
    });
  };

  const handleRemove = (membership: ProjectCheckInMemberStatus) => {
    if (!selectedProject || !selectedTeamId) return;

    setRemovingFaceIdentityId(membership.faceIdentityId);
    FaceCheckService.Delete.removeProjectCheckInMember(
      selectedProject.id,
      selectedTeamId,
      membership.faceIdentityId,
    ).subscribe({
      next: () => {
        Utils.successNotification();
        onSaved();
      },
      error: error => {
        Utils.errorHandling(error);
        setRemovingFaceIdentityId(undefined);
      },
      complete: () => setRemovingFaceIdentityId(undefined),
    });
  };

  return (
    <Modal
      title="Thiết lập nhân sự chấm công"
      open={open}
      width={760}
      okText="Thiết lập chấm công"
      cancelText="Đóng"
      confirmLoading={saving}
      okButtonProps={{ disabled: !selectedTeamId || selectedRowKeys.length === 0 }}
      onOk={handleSetup}
      onCancel={onClose}
    >
      <Typography.Paragraph type="secondary">
        Chọn đúng tổ đội để nhân sự xuất hiện trong báo cáo chấm công và áp dụng đúng ca làm của tổ đội đó.
      </Typography.Paragraph>

      <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 12 }}>
        <Typography.Text strong>Tổ đội chấm công</Typography.Text>
        <Select
          value={selectedTeamId}
          loading={loadingTeams}
          placeholder="Chọn tổ đội"
          style={{ width: '100%' }}
          options={teams.map(team => ({ value: team.id, label: team.name }))}
          onChange={teamId => {
            setSelectedTeamId(teamId);
            setSelectedRowKeys([]);
          }}
        />
      </Space>

      <Input.Search
        allowClear
        placeholder="Tìm theo tên hoặc mã nhân viên"
        value={search}
        onChange={event => setSearch(event.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Space size={6} style={{ marginBottom: 12 }}>
        <Switch
          size="small"
          checked={showTerminatedEmployees}
          onChange={setShowTerminatedEmployees}
        />
        <Typography.Text>Hiển thị nhân sự đã nghỉ việc</Typography.Text>
      </Space>

      <Table<CheckInSetupMember>
        rowKey="employeeId"
        size="small"
        dataSource={members}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        rowSelection={{
          selectedRowKeys,
          onChange: keys => setSelectedRowKeys(keys),
          getCheckboxProps: record => ({
            disabled: Boolean(getConfiguredMembership(record)) || Boolean(record.terminated),
          }),
        }}
        columns={[
          { title: 'Mã nhân viên', dataIndex: 'code', width: 140 },
          { title: 'Họ tên', dataIndex: 'name' },
          {
            title: 'Trạng thái',
            width: 150,
            render: (_, record) =>
              record.terminated ? (
                <Tag color="error">Đã nghỉ việc</Tag>
              ) : getConfiguredMembership(record) ? (
                <Tag color="success">Đã thuộc tổ đội</Tag>
              ) : (
                <Tag>Chưa thuộc tổ đội</Tag>
              ),
          },
          {
            title: '',
            key: 'action',
            width: 56,
            render: (_, record) => {
              const membership = getConfiguredMembership(record);
              if (!membership) return null;

              return (
                <Popconfirm
                  title="Gỡ khỏi tổ đội chấm công?"
                  description={`Nhân sự sẽ được gỡ khỏi tổ ${membership.teamName}. Lịch sử chấm công cũ vẫn được giữ lại.`}
                  okText="Gỡ"
                  cancelText="Hủy"
                  onConfirm={() => handleRemove(membership)}
                >
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={removingFaceIdentityId === membership.faceIdentityId}
                    aria-label={`Gỡ ${record.name} khỏi ${membership.teamName}`}
                  />
                </Popconfirm>
              );
            },
          },
        ]}
      />
    </Modal>
  );
};
