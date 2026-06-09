/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Col, Input, Modal, PaginationProps, Row, Space, Table, TableProps, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import {
  AddMemberToProjectModalName,
  CreateManyProjectMemberLoadingKey,
  FormatDateAPI,
  GettingEmployeeList,
  GettingProjectRolesLoadingKey,
  largePagingParams,
} from '@/common/define';
import { useWindowSize } from '@/hooks';
import { EmployeeResponse } from '@/services/EmployeeService';
import { CreateProjectMemberPayload } from '@/services/ProjectService';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams, getEmployees } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, hideModal } from '@/store/modal';
import {
  getProjectMemberList,
  getProjectMembers,
  getProjectRoles,
  getSelectedProject,
  projectActions,
} from '@/store/project';
import Utils from '@/utils';
import styles from './components/components.module.less';

export const AddMemberToProject = () => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getModalVisible(AddMemberToProjectModalName));
  const queryParams = useAppSelector(getEmployeeQueryParams());
  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());
  const members = useAppSelector(getEmployees());
  const [searchStr, setSearchStr] = useState(queryParams?.search);
  const windowSize = useWindowSize();
  const isLoading = useAppSelector(getLoading(GettingEmployeeList));
  const isRolesLoading = useAppSelector(getLoading(GettingProjectRolesLoadingKey));
  const isSaving = useAppSelector(getLoading(CreateManyProjectMemberLoadingKey));
  const [timer, setTimer] = useState<any>(null);
  const projectMembers = useAppSelector(getProjectMembers());
  const roles = useAppSelector(getProjectRoles());
  const [selectedMembers, setSelectedMember] = useState<EmployeeResponse[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const projectMemberList = useAppSelector(getProjectMemberList());

  useEffect(() => {
    // lấy tất cả roles của project
    dispatch(projectActions.getProjectRolesRequest({ queryParams: { ...largePagingParams } }));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSearchStr(queryParams?.search);
  }, [queryParams]);

  useEffect(() => {
    dispatch(
      employeeActions.getEmployeesRequest({
        companyId: company.id,
        params: { ...queryParams, page: 1, search: undefined, pageSize: 10000 },
      }),
    );
    // eslint-disable-next-line
  }, [company]);

  const handleCancel = () => {
    dispatch(hideModal({ key: AddMemberToProjectModalName }));
  };

  const handleOk = () => {
    // [09/11/2024][#20629][phuong_td] thêm startTime và endTime cho ProjectMember
    const input: CreateProjectMemberPayload[] = selectedMembers.map(x => ({
      employeeId: x.id,
      name: Utils.concatFullName(x.firstName, x.middleName, x.lastName),
      code: x.employeeCode,
      role: 0,
      phone: x.contactDetail ? x.contactDetail?.mobile : null,
      email: x.contactDetail ? x.contactDetail?.workEmail : '',
      roleName: '',
      status: 0,
      note: '',
      projectId: selectedProject?.id || 0,
      roles: selectedRoles,
      startTime: selectedProject?.startDate ?? '',
      endTime: selectedProject?.endDate ?? '',
      // [10/11/2024][phuong_td] bổ xung createTime
      createTime: dayjs().format(FormatDateAPI),
    }));
    if (selectedProject) {
      dispatch(projectActions.createManyProjectMemberRequest({ members: input }));
      return;
    }
    // todo: nếu khởi tạo dự án thì đẩy dữ liệu vào store, cho đến bước cuối cùng submit data
    dispatch(projectActions.setProjectMemberList([...projectMemberList, ...input]));
    dispatch(hideModal({ key: AddMemberToProjectModalName }));
  };

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    const params = { ...queryParams, page: 1, search, pageSize: 10000 };
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      dispatch(employeeActions.getEmployeesRequest({ companyId: company.id, params }));
    }, 500);
    setTimer(timeoutId);
  };

  const onRolesChange = (checkedValues: any[]) => {
    setSelectedRoles(checkedValues);
  };

  const rowSelection = {
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys: React.Key[], selectedRows: EmployeeResponse[]) => {
      setSelectedMember(selectedRows);
    },
    getCheckboxProps: (record: EmployeeResponse) => ({
      //todo: cần xác dịnh nhân sự đã có trong project chưa
      disabled: selectedProject
        ? projectMembers && projectMembers.results?.findIndex(x => x.employeeId === record.id) > -1
        : projectMemberList.findIndex(x => x.employeeId === record.id) > -1,
      name: Utils.concatFullName(record.firstName, record.middleName, record.lastName),
    }),
  };

  const columns: TableProps<EmployeeResponse>['columns'] = [
    {
      title: t('projectSetting.projectMember.table.memberId'),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120,
    },
    {
      title: t('projectSetting.projectMember.table.memberName'),
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => {
        return Utils.concatFullName(record.firstName, record.middleName, record.lastName);
      },
    },
  ];

  const handleEmpTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...queryParams, page: current, pageSize };
    dispatch(employeeActions.getEmployeesRequest({ companyId: company.id, params: search }));
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('pagingTotal', { range1: range[0], range2: range[1], total });

  return (
    <Modal
      title={t('projectSetting.projectMember.modalAddMember.title')}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={t('createProject.projectMember.modal.add')}
      width={800}
      confirmLoading={isSaving}
    >
      <Row>
        <Space style={{ flex: 1 }}>
          {selectedMembers && (
            <Typography.Text style={{ margin: 0, fontWeight: 600 }}>{t('Selected members', { num: selectedMembers.length })}</Typography.Text>
          )}
        </Space>
        <Space>
          <Input
            placeholder={t('projectSetting.projectMember.findMember')}
            allowClear
            value={searchStr}
            onChange={onSearchChange}
            suffix={searchStr ? null : <SearchOutlined />}
            style={{ width: 300 }}
          />
        </Space>
      </Row>
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={members?.results}
        rowSelection={{ ...rowSelection, columnWidth: 50 }}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: members?.queryCount,
          showTotal,
          showSizeChanger: true,
        }}
        scroll={{ y: windowSize[1] - 600 }}
        size="small"
        loading={isLoading || isRolesLoading}
        onChange={handleEmpTableChange}
      />
      <Row>
        <Col span={24} className={styles.modalMainContainer}>
          <div className={styles.modalHeaderContainer}>
            <Typography.Text style={{ fontWeight: '500' }}>
              {t('createProject.projectMember.modal.roleList')}
            </Typography.Text>
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onRolesChange}>
            <Row gutter={[16, 16]}>
              {roles?.results?.map(item => {
                return (
                  <Col span={24} sm={6} key={item.id}>
                    <Checkbox value={item.id}>{item.name}</Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
        </Col>
      </Row>
    </Modal>
  );
};
