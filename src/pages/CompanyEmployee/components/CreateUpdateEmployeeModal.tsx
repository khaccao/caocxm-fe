import React, { useEffect, useMemo, useState } from 'react';

import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Steps, Upload, notification } from 'antd';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';

import './EmployeeModal.less';
import {
  CreateUpdateEmployeeModalName,
  DateEmptyString,
  FormatDateAPI,
  SavingEmployee,
  formatDateDisplay,
} from '@/common/define';
import { getEnvVars } from '@/environment';
import { FaceCheckService, TeamsResponse } from '@/services/CheckInService';
import { EmployeeService } from '@/services/EmployeeService';
import { PayrollTeamResponse, PayrollTeamService } from '@/services/PayrollTeamService';
import { ProjectService } from '@/services/ProjectService';
import { TeamResponse, TeamService } from '@/services/TeamService';
import { getAuthenticated, getCurrentCompany } from '@/store/app';
import { employeeActions, getSelectedEmployee } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, hideModal } from '@/store/modal';
import { getRolesByCompanyId, projectActions } from '@/store/project';
import { RootState } from '@/store/types';
import { getDefaultOrganization } from '@/store/user';
import Utils from '@/utils';

const { apiUrl } = getEnvVars();

interface CreatedEmployeeInfo {
  id: number;
  employeeCode: string;
  name: string;
}

interface EmployeeDraftInfo {
  input: any;
  name: string;
  prefix: string;
  startDate?: dayjs.Dayjs;
}

const normalizeText = (value?: string | null) =>
  `${value || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi');

const isAllTeam = (team: { name?: string | null; code?: string | null }) => {
  const name = normalizeText(team.name);
  const code = normalizeText(team.code);
  return name === 'tat ca' || name === 'all' || code === 'tatca' || code === 'all';
};

const employeeCodePrefixOptions = [
  { value: 'NVH', title: 'NVH', description: 'Nhân sự công ty' },
  { value: 'BCH', title: 'BCH', description: 'Ban chỉ huy' },
  { value: 'CN', title: 'CN', description: 'Công nhân' },
];

export const CreateUpdateEmployeeModal = () => {
  const { t } = useTranslation('employee');
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getModalVisible(CreateUpdateEmployeeModalName));
  const selectedEmployee = useAppSelector(getSelectedEmployee());
  const company = useAppSelector(getCurrentCompany());
  const DanhSachUser = useAppSelector((state: RootState) => state.employee.DanhSachUser);
  const defaultOrg = useAppSelector(getDefaultOrganization());
  const auth = useAppSelector(getAuthenticated());
  const isSaving = useAppSelector(getLoading(SavingEmployee));
  const [form] = Form.useForm();
  const [setupForm] = Form.useForm();
  const employeeCodePrefix = Form.useWatch('employeeCodePrefix', form) || 'NVH';
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isUploading, setUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreatedEmployeeInfo>();
  const [employeeDraft, setEmployeeDraft] = useState<EmployeeDraftInfo>();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTeams, setProjectTeams] = useState<TeamResponse[]>([]);
  const [checkInTeams, setCheckInTeams] = useState<TeamsResponse[]>([]);
  const [payrollTeams, setPayrollTeams] = useState<PayrollTeamResponse[]>([]);
  // eslint-disable-next-line
  const roles = useAppSelector(getRolesByCompanyId());

  const projectOptions = useMemo(
    () => projects.map(project => ({ value: project.id, label: project.name })),
    [projects],
  );

  const projectTeamOptions = useMemo(
    () => projectTeams.map(team => ({ value: team.id, label: team.name })),
    [projectTeams],
  );

  const checkInTeamOptions = useMemo(
    () => checkInTeams.map(team => ({ value: team.id, label: team.name })),
    [checkInTeams],
  );

  const payrollTeamOptions = useMemo(
    () =>
      payrollTeams.map(team => ({
        value: team.id,
        label: `${team.code} - ${team.name}`,
      })),
    [payrollTeams],
  );

  useEffect(() => {
    dispatch(projectActions.getRolesByCompanyIdRequest(company.id));
    // eslint-disable-next-line
  }, [company]);
  const fetchData = () => {
    dispatch(
      employeeActions.getDanhSachUserRequest({
        options: { },
      }),
    );
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isModalOpen || selectedEmployee || !company?.id) return;

    const projectSubscription = ProjectService.Get.getProjectsByCompanyId(company.id).subscribe({
      next: result => setProjects(result || []),
      error: Utils.errorHandling,
    });
    const payrollSubscription = PayrollTeamService.Get.getTeams(company.id).subscribe({
      next: result => setPayrollTeams(result || []),
      error: Utils.errorHandling,
    });

    return () => {
      projectSubscription.unsubscribe();
      payrollSubscription.unsubscribe();
    };
  }, [company?.id, isModalOpen, selectedEmployee]);

  useEffect(() => {
    if (!isModalOpen) {
      setStep(0);
      setCreatedEmployee(undefined);
      setEmployeeDraft(undefined);
      setupForm.resetFields();
    }
  }, [isModalOpen, setupForm]);
  const handleChangePhoto: UploadProps['onChange'] = info => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      const url = info.file.response;
      setUploading(false);
      setPhotoUrl(url);
      return;
    }
    if (info.file.status === 'error') {
      setUploading(false);
      notification.error({
        message: t('Notification'),
        description: t('errorUploadPhoto'),
      });
    }
  };

  const props: UploadProps = {
    accept: 'image/*',
    action: `${apiUrl}/Project_Employee/project/uploadImage`,
    headers: {
      Authorization: auth.token ? `Bearer ${auth.token}` : '',
    },
    onChange: handleChangePhoto,
    showUploadList: false,
  };

  useEffect(() => {
    setPhotoUrl(selectedEmployee?.picture || '');
    // eslint-disable-next-line
  }, [selectedEmployee, ]);

  const buildEmployeeInput = (values: any) => {
    const nameSplit = Utils.spitFullNameIntoFirstMiddleLastName(values.name);
    return {
      ...values,
      picture: photoUrl,
      companyId: company.id,
      companyGuid: defaultOrg?.guid,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format(FormatDateAPI) : undefined,
      startDate: values.startDate ? values.startDate.format(FormatDateAPI) : undefined,
      endDate: values.endDate ? values.endDate.format(FormatDateAPI) : undefined,
      ...nameSplit,
      contactDetail: {
        ...selectedEmployee?.contactDetail,
        employeeId: selectedEmployee?.id,
        addressStreet1: values.addressStreet1,
        mobile: values.mobile,
        workEmail: values.workEmail,
        employIdConnect: values.un,
      },
    };
  };

  const refreshEmployees = () => {
    dispatch(
      employeeActions.getEmployeesRequest({
        companyId: company.id,
        params: { page: 1, search: undefined, pageSize: 10000 },
      }),
    );
  };

  const handleSaveEmployee = (values: any) => {
    const inputData = buildEmployeeInput(values);
    if (selectedEmployee) {
      // prettier-ignore
      dispatch(employeeActions.updateEmployeeRequest({ employeeId: selectedEmployee.id, employee: { ...selectedEmployee, ...inputData }}));
      return;
    }
  };

  const handleCreateAndContinue = async () => {
    if (employeeDraft) {
      setStep(1);
      return;
    }

    try {
      const values = await form.validateFields();
      const inputData = buildEmployeeInput(values);
      const nameSplit = Utils.spitFullNameIntoFirstMiddleLastName(values.name);
      setEmployeeDraft({
        input: inputData,
        name: values.name,
        prefix: values.employeeCodePrefix || 'NVH',
        startDate: values.startDate,
      });
      setupForm.setFieldsValue({
        role: 0,
        roleName: 'Nhân viên',
        status: 0,
        startTime: values.startDate || dayjs(),
        endTime: dayjs('2099-12-31'),
        payrollEffectiveFrom: values.startDate || dayjs(),
        employeeCode: `${values.employeeCodePrefix || 'NVH'} (tự động)`,
        employeeName: `${nameSplit.lastName || ''} ${nameSplit.middleName || ''} ${nameSplit.firstName || ''}`.trim(),
      });
      setStep(1);
    } catch (error) {
      Utils.errorHandling(error);
    }
  };

  const handleProjectChange = (projectId: number) => {
    setupForm.setFieldsValue({
      projectTeamIds: [],
      checkInTeamIds: [],
      payrollTeamId: undefined,
    });
    setProjectTeams([]);
    setCheckInTeams([]);

    if (!projectId) return;

    TeamService.Get.getTeams(projectId).subscribe({
      next: teams => {
        const activeTeams = (teams || []).filter((team: TeamResponse) => team.status === 1);
        setProjectTeams(activeTeams);
        const allTeam = activeTeams.find((team: TeamResponse) => isAllTeam(team));
        setupForm.setFieldsValue({
          projectTeamIds: allTeam ? [allTeam.id] : [],
        });
      },
      error: Utils.errorHandling,
    });

    FaceCheckService.Get.fetchTeamsOfOperator(projectId).subscribe({
      next: teams => {
        const activeTeams = (teams || []).filter((team: TeamsResponse) => team.status === 1);
        setCheckInTeams(activeTeams);
        const allTeam = activeTeams.find((team: TeamsResponse) => isAllTeam(team));
        setupForm.setFieldsValue({
          checkInTeamIds: allTeam ? [allTeam.id] : [],
        });
      },
      error: Utils.errorHandling,
    });
  };

  const handleFinishOnboarding = async () => {
    if (!employeeDraft) return;

    try {
      const values = await setupForm.validateFields();
      const selectedProjectId = values.projectId;
      setOnboardingSaving(true);
      const createdResult: any = await firstValueFrom(EmployeeService.Post.createEmployee(employeeDraft.input));
      const createdEmployeeInfo: CreatedEmployeeInfo = {
        id: Number(createdResult?.id),
        employeeCode: createdResult?.employeeCode || employeeDraft.input.employeeCode || '',
        name: employeeDraft.name,
      };
      setCreatedEmployee(createdEmployeeInfo);

      if (selectedProjectId) {
        const projectMember = {
          employeeId: createdEmployeeInfo.id,
          name: createdEmployeeInfo.name,
          code: createdEmployeeInfo.employeeCode,
          role: values.role ?? 0,
          roleName: values.roleName || 'Nhân viên',
          status: values.status ?? 0,
          note: values.note || '',
          projectId: selectedProjectId,
          startTime: values.startTime?.format(FormatDateAPI) || dayjs().format(FormatDateAPI),
          endTime: values.endTime?.format(FormatDateAPI) || dayjs('2099-12-31').format(FormatDateAPI),
          createTime: dayjs().format(FormatDateAPI),
          roles: [],
        };
        await firstValueFrom(ProjectService.Post.createManyProjectMembers([projectMember]));

        const teamMemberPayload = (values.projectTeamIds || []).map((teamId: number) => ({
          employeeId: createdEmployeeInfo.id,
          name: createdEmployeeInfo.name,
          code: createdEmployeeInfo.employeeCode,
          role: values.role ?? 0,
          roleName: values.roleName || 'Nhân viên',
          status: values.status ?? 0,
          note: values.note || '',
          teamId,
        }));
        if (teamMemberPayload.length > 0) {
          await firstValueFrom(TeamService.Post.createManyTeamMembers(teamMemberPayload));
        }

        const checkInMember = {
          employeeId: createdEmployeeInfo.id,
          employeeCode: createdEmployeeInfo.employeeCode,
          name: createdEmployeeInfo.name,
          jobTitle: values.roleName || 'Nhân viên',
        };
        for (const checkInTeamId of values.checkInTeamIds || []) {
          await firstValueFrom(
            FaceCheckService.Post.setupProjectCheckInMembers(selectedProjectId, checkInTeamId, [checkInMember]),
          );
        }
      }

      if (values.payrollTeamId) {
        await firstValueFrom(
          PayrollTeamService.Post.addEmployees(values.payrollTeamId, [
            {
              employeeId: createdEmployeeInfo.id,
              employeeCode: createdEmployeeInfo.employeeCode,
              projectId: selectedProjectId || null,
              effectiveFrom: values.payrollEffectiveFrom?.format(FormatDateAPI) || dayjs().format(FormatDateAPI),
              effectiveTo: values.payrollEffectiveTo?.format(FormatDateAPI) || null,
            },
          ]),
        );
      }

      Utils.successNotification('Đã hoàn tất tạo nhân sự và thiết lập làm việc.');
      refreshEmployees();
      handleCancel();
    } catch (error) {
      Utils.errorHandling(error);
    } finally {
      setOnboardingSaving(false);
    }
  };

  const handleCancel = () => {
    dispatch(employeeActions.setSelectedEmployee(undefined));
    setStep(0);
    setCreatedEmployee(undefined);
    setEmployeeDraft(undefined);
    setupForm.resetFields();
    dispatch(hideModal({ key: CreateUpdateEmployeeModalName }));
  };

  const handleOk = () => {
    if (selectedEmployee) {
      form.submit();
      return;
    }
    if (step === 0) {
      handleCreateAndContinue();
      return;
    }
    handleFinishOnboarding();
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none', cursor: 'pointer' }} type="button">
      {isUploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{t('Avatar')}</div>
    </button>
  );

  return (
    <Modal
      width={1000}
      title={selectedEmployee ? t('companyEmployee.updateEmployee') : t('companyEmployee.addNewEmployee')}
      open={isModalOpen}
      okText={selectedEmployee ? t('companyEmployee.okText') : step === 0 ? 'Tiếp tục' : 'Hoàn tất'}
      onOk={handleOk}
      cancelText={t('companyEmployee.cancelText')}
      onCancel={handleCancel}
      confirmLoading={isSaving || onboardingSaving}
      footer={
        selectedEmployee
          ? undefined
          : [
              step === 1 && (
                <Button key="back" onClick={() => setStep(0)} disabled={onboardingSaving}>
                  Quay lại
                </Button>
              ),
              <Button key="cancel" onClick={handleCancel} disabled={onboardingSaving}>
                Đóng
              </Button>,
              <Button key="ok" type="primary" loading={onboardingSaving} onClick={handleOk}>
                {step === 0 ? 'Tiếp tục' : 'Hoàn tất'}
              </Button>,
            ]
      }
    >
      {!selectedEmployee && (
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 20 }}
          items={[
            { title: 'Thông tin nhân sự' },
            { title: 'Dự án, tổ đội, chấm công' },
          ]}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        style={{ display: step === 0 || selectedEmployee ? undefined : 'none' }}
        initialValues={{
          nationality: 'Vietnam',
          status: 1,
          employeeCodePrefix: 'NVH',
          ...selectedEmployee,
          ...selectedEmployee?.contactDetail,
          name: selectedEmployee
            ? `${selectedEmployee?.lastName ?? ''} ${selectedEmployee?.middleName ?? ''} ${selectedEmployee?.firstName ?? ''}`.trim()
            : '',
          dateOfBirth: selectedEmployee?.dateOfBirth ? dayjs(selectedEmployee.dateOfBirth) : null,
          startDate:
            selectedEmployee?.startDate && selectedEmployee?.startDate !== DateEmptyString
              ? dayjs(selectedEmployee.startDate)
              : selectedEmployee
              ? null
              : dayjs(),
          endDate:
            selectedEmployee?.endDate && selectedEmployee?.endDate !== DateEmptyString
              ? dayjs(selectedEmployee.endDate)
              : null,
        }}
        onFinish={handleSaveEmployee}
      >
        <Row>
          <Col span={24} md={8}>
            <Row justify="center" style={{ marginLeft: -24, padding: 24 }}>
              <Upload name="File" listType="picture-circle" className={`avatar-uploader emp-photo`} {...props}>
                {photoUrl ? (
                  <img
                    src={photoUrl != null && photoUrl.includes('http') ? photoUrl : `${apiUrl}/Projects${photoUrl}`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Row>
          </Col>
          <Col span={24} md={16}>
            <Row gutter={[16, 0]}>
              <Col span={24} md={10}>
                {selectedEmployee ? (
                  <Form.Item
                    label={t('companyEmployee.code')}
                    name="employeeCode"
                    rules={[{ required: true, message: t('companyEmployee.requireCode') }]}
                  >
                    <Input />
                  </Form.Item>
                ) : (
                  <Form.Item label={t('companyEmployee.code')}>
                    <Input disabled value={`${employeeCodePrefix} (tự động)`} />
                  </Form.Item>
                )}
              </Col>
              {!selectedEmployee && (
                <Col span={24} md={8}>
                  <Form.Item label="Loại mã nhân sự" name="employeeCodePrefix">
                    <Select
                      options={employeeCodePrefixOptions.map(option => ({
                        value: option.value,
                        label: `${option.title} - ${option.description}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={24} md={selectedEmployee ? 14 : 6}>
                <Form.Item
                  label={t('companyEmployee.id')}
                  name="identity"
                  rules={[{ required: true, message: t('companyEmployee.requireId') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={t('companyEmployee.fullName')}
              name="name"
              rules={[{ required: true, message: t('companyEmployee.requireFullname') }]}
            >
              <Input />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col span={24} md={10}>
                <Form.Item
                  label={t('companyEmployee.dateOfBirth')}
                  name="dateOfBirth"
                  rules={[{ required: true, message: t('companyEmployee.requireDateOfBirth') }]}
                >
                  <DatePicker style={{ width: '100%' }} format={formatDateDisplay} placeholder="27/05/2002" />
                </Form.Item>
              </Col>
              <Col span={24} md={7}>
                <Form.Item
                  label={t('companyEmployee.gender')}
                  name="gender"
                  rules={[{ required: true, message: t('companyEmployee.requireGender') }]}
                >
                  <Select
                    options={[
                      { value: 'Male', label: t('Male') },
                      { value: 'Female', label: t('Female') },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={24} md={7}>
                <Form.Item
                  label={t('companyEmployee.nation')}
                  name="nationality"
                  rules={[{ required: true, message: t('companyEmployee.requireNation') }]}
                >
                  <Select options={[{ value: 'Vietnam', label: t('Vietnam') }]} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={24} md={10}>
                <Form.Item
                  label={t('companyEmployee.phone')}
                  name="mobile"
                  rules={[{ required: true, message: t('companyEmployee.requirePhone') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} md={14}>
                <Form.Item label={t('companyEmployee.email')} name="workEmail">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            {/* <Row gutter={[16, 0]}>
              <Col span={24} md={10}>
                <Form.Item
                  label={t('companyEmployee.role')}
                  name="role"
                  // rules={[{ required: true, message: t('companyEmployee.requireRole') }]}
                >
                  <Select options={roles?.map(x => ({ value: x.id, label: x.name }))} />
                </Form.Item>
              </Col>
              <Col span={24} md={14}>
                <Form.Item label={t('companyEmployee.group')} name="group">
                  <Select options={[{ value: 'giamdoc', label: 'Giám đốc' }]} />
                </Form.Item>
              </Col>
            </Row> */}
                  <Form.Item
                    label={t('companyEmployee.address')}
                    name="addressStreet1"
                    rules={[{ required: true, message: t('companyEmployee.requireAddress') }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={t('companyEmployee.userId IIS')}
                    name="employIdConnect"
                  >
                   <Select
                       options={DanhSachUser.map(dsuser => ({                      
                        value: dsuser.un, 
                        label: dsuser.un || 'Unknown'
                      }))}
                    />
                  </Form.Item>
            <Form.Item label={t('companyEmployee.note')} name="note">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col span={24} md={10}>
                <Form.Item
                  label={t('companyEmployee.entranceDate')}
                  name="startDate"
                  rules={[{ required: true, message: t('companyEmployee.requireEntranceDate') }]}
                >
                  <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
                </Form.Item>
              </Col>
              <Col span={24} md={14}>
                <Form.Item name="status" label={t('Status')}>
                  <Select
                    options={[
                      { value: 1, label: t('Working') },
                      { value: 2, label: t('Maternity') },
                      { value: 3, label: t('Unpaid leave long term') },
                      { value: 4, label: t('Sick leave long term') },
                      { value: 5, label: t('Submitted termination letter') },
                      { value: 6, label: t('Before maternity') },
                      { value: 7, label: t('After maternity') },
                      { value: 8, label: t('Terminated') },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      {!selectedEmployee && step === 1 && (
        <Form
          form={setupForm}
          layout="vertical"
          initialValues={{
            role: 0,
            roleName: 'Nhân viên',
            status: 0,
            startTime: dayjs(),
            endTime: dayjs('2099-12-31'),
            payrollEffectiveFrom: dayjs(),
          }}
        >
          <Row gutter={[16, 0]}>
            <Col span={24} md={12}>
              <Form.Item label="Nhân sự sẽ tạo">
                <Input
                  value={`${employeeDraft?.prefix || 'NVH'} (tự động) - ${employeeDraft?.name || ''}`}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item label="Dự án" name="projectId">
                <Select
                  allowClear
                  showSearch
                  placeholder="Chọn dự án để thêm nhân sự vào công trình"
                  optionFilterProp="label"
                  options={projectOptions}
                  onChange={handleProjectChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={24} md={8}>
              <Form.Item label="Vai trò" name="roleName">
                <Input placeholder="Nhân viên / Công nhân / BCH..." />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item label="Từ ngày" name="startTime">
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item label="Đến ngày" name="endTime">
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={24} md={12}>
              <Form.Item label="Tổ đội dự án" name="projectTeamIds">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Mặc định chọn tổ Tất cả nếu có"
                  optionFilterProp="label"
                  options={projectTeamOptions}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item label="Tổ đội chấm công mobile" name="checkInTeamIds">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Chọn tổ để nhân sự chấm công mobile"
                  optionFilterProp="label"
                  options={checkInTeamOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col span={24} md={12}>
              <Form.Item label="Tổ đội tính lương" name="payrollTeamId">
                <Select
                  allowClear
                  showSearch
                  placeholder="Có thể chọn sau nếu chưa có"
                  optionFilterProp="label"
                  options={payrollTeamOptions}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={6}>
              <Form.Item label="Tính lương từ ngày" name="payrollEffectiveFrom">
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
            <Col span={24} md={6}>
              <Form.Item label="Tính lương đến ngày" name="payrollEffectiveTo">
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Ghi chú phân công">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space direction="vertical" size={4}>
            <Checkbox checked disabled>
              Thêm vào danh sách thành viên dự án nếu đã chọn dự án
            </Checkbox>
            <Checkbox checked disabled>
              Thêm vào tổ đội dự án đã chọn, ưu tiên tổ Tất cả
            </Checkbox>
            <Checkbox checked disabled>
              Thiết lập FaceIdentity và tổ đội chấm công nếu đã chọn tổ chấm công
            </Checkbox>
          </Space>
        </Form>
      )}
    </Modal>
  );
};
