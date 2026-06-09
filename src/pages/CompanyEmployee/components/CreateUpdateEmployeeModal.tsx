import React, { useEffect, useState } from 'react';

import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Col, DatePicker, Form, Input, Modal, Row, Select, Upload, notification } from 'antd';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import './EmployeeModal.less';
import {
  CreateUpdateEmployeeModalName,
  DateEmptyString,
  FormatDateAPI,
  SavingEmployee,
  formatDateDisplay,
} from '@/common/define';
import { getEnvVars } from '@/environment';
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
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isUploading, setUploading] = useState(false);
  // eslint-disable-next-line
  const roles = useAppSelector(getRolesByCompanyId());

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

  const handleSaveEmployee = (values: any) => {
    const nameSplit = Utils.spitFullNameIntoFirstMiddleLastName(values.name);
    const inputData = {
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
    if (selectedEmployee) {
      // prettier-ignore
      dispatch(employeeActions.updateEmployeeRequest({ employeeId: selectedEmployee.id, employee: { ...selectedEmployee, ...inputData }}));
      return;
    }
    dispatch(employeeActions.createEmployeeRequest({ employee: inputData }));
  };

  const handleCancel = () => {
    dispatch(employeeActions.setSelectedEmployee(undefined));
    dispatch(hideModal({ key: CreateUpdateEmployeeModalName }));
  };

  const handleOk = () => form.submit();

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
      okText={t('companyEmployee.okText')}
      onOk={handleOk}
      cancelText={t('companyEmployee.cancelText')}
      onCancel={handleCancel}
      confirmLoading={isSaving}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          nationality: 'Vietnam',
          status: 1,
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
                <Form.Item
                  label={t('companyEmployee.code')}
                  name="employeeCode"
                  rules={[{ required: true, message: t('companyEmployee.requireCode') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} md={14}>
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
    </Modal>
  );
};
