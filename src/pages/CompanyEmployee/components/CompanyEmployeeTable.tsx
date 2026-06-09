/* eslint-disable import/order */
import { useEffect } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { PaginationProps, TableProps } from 'antd';
import { Button, Col, Modal, Row, Space, Table, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import {
  CreateUpdateEmployeeModalName,
  GettingEmployeeList,
  RemovingEmployee,
  defaultPagingParams,
} from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { EmployeeResponse, IEmployeeGroup } from '@/services/EmployeeService';
import { GroupDTO } from '@/services/GroupService';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams, getEmployees } from '@/store/employee';
import { getGroups, groupActions } from '@/store/group';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { showModal } from '@/store/modal';
import styles from './components.module.less';

export const CompanyEmployeeTable = () => {
  const { t } = useTranslation('employee');
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const params = useAppSelector(getEmployeeQueryParams());
  const employees = useAppSelector(getEmployees());
  const groups = useAppSelector(getGroups());
  const company = useAppSelector(getCurrentCompany());
  const isLoading = useAppSelector(getLoading(GettingEmployeeList));
  const isRemoving = useAppSelector(getLoading(RemovingEmployee));

  const isEditGranted = usePermission(['CongTy.NhanSu.Edit']);
  const isDeleteGranted = usePermission(['CongTy.NhanSu.Delete']);

  useEffect(() => {
    if (company) {
      dispatch(groupActions.getGroupsRequest(company.id));
    }
  }, [company])
  const employeeColumns: TableProps<EmployeeResponse>['columns'] = [
    {
      title: t('companyEmployee.STT'),
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1 + (params.page - 1) * params.pageSize, // Bắt đầu STT từ 1
    },
    {
      title: t('companyEmployee.code'),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 100,
    },
    {
      title: t('companyEmployee.id'),
      dataIndex: 'identity',
      key: 'identity',
      width: 120,
    },
    {
      title: t('companyEmployee.fullName'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value, record) => {
        const lastName = record?.lastName ?? '';
        const middleName = record?.middleName ?? '';
        const firstName = record?.firstName ?? '';
        return `${lastName + ' ' + middleName + ' ' + firstName}`;
      },
    },
    {
      title: t('companyEmployee.gender'),
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: value => t(value),
    },
    {
      title: t('companyEmployee.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 100,
      render: (value, record) => {
        return (
          <Row>
            {record.contactDetail?.mobile && <Col span={24}>{`${record.contactDetail.mobile}`}</Col>}
            {record.contactDetail?.homePhone && <Col span={24}>{`${record.contactDetail.homePhone}`}</Col>}
            {record.contactDetail?.workPhone && <Col span={24}>{`${record.contactDetail.workPhone}`}</Col>}
          </Row>
        );
      },
    },
    {
      title: t('companyEmployee.email'),
      dataIndex: 'email',
      key: 'email',
      width: 100,
      render: (value, record) => {
        return (
          <Row>
            {record.contactDetail?.workEmail && <Col span={24}>{`${record.contactDetail.workEmail}`}</Col>}
            {record.contactDetail?.otherEmail && <Col span={24}>{`${record.contactDetail.otherEmail}`}</Col>}
          </Row>
        );
      },
    },
    {
      title: t('companyEmployee.role'),
      dataIndex: 'role',
      key: 'role',
      width: 100,
    },
    {
      title: t('companyEmployee.group'),
      dataIndex: 'employeesGroups',
      key: 'employeesGroups',
      width: 100,
      render: (value, record) => getGroupsName(record),
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <Space>
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined style={{ color: colors.primary }} />}
                type="text"
                size="small"
                disabled={!isEditGranted}
                onClick={() => editEmployee(record)}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                disabled={!isDeleteGranted}
                onClick={() => confirmRemoveEmployee(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // [#21200][dung_lt][23/12/2024] - lấy tên các phòng ban của nhân viên
  const getGroupsName = (record: EmployeeResponse): string => {
    const eGroups = record.employeesGroups;
    if (eGroups?.length) {
      return eGroups
        .map((group: IEmployeeGroup) => getGroupById(group.groupId)?.name)
        .filter((name) => name)
        .join(', ');
    }
  
    return '';
  };
  
  // [#21200][dung_lt][23/12/2024] - lấy phòng ban theo ID
  const getGroupById = (id: number): GroupDTO | undefined => {
    if (!id) return undefined;
    const item = groups.find((g: GroupDTO) => g.id === id);
    return item || undefined;
  };

  const editEmployee = (employee: any) => {
    dispatch(employeeActions.setSelectedEmployee(employee));
    dispatch(showModal({ key: CreateUpdateEmployeeModalName }));
  };

  const confirmRemoveEmployee = (employee: EmployeeResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('confirmRemove', {
              name: `<strong>"${employee.lastName} ${employee.middleName} ${employee.firstName}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      onOk: close => {
        handleRemoveEmployee(employee.id);
        close();
      },
    });
  };

  const handleRemoveEmployee = (employeeId: number) => {
    dispatch(employeeActions.removeEmployeeRequest({ employeeId, companyId: company.id, params }));
  };

  const handleEmpTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...params, page: current, pageSize };
    dispatch(employeeActions.getEmployeesRequest({ companyId: company.id, params: search, page: 1, pageSize: 10000 }));
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('companyEmployee.pagingTotal', { range1: range[0], range2: range[1], total });

  // [#21200][dung_lt][23/12/2024] - chuyển group theo mã code
  const checkGroupsByCode = (code: string, eGroups: IEmployeeGroup[]) => {
    if (!code) return false;
    return eGroups.some((g) => getGroupById(g.groupId) && getGroupById(g.groupId)?.code === code);
  }
  // [#21200][dung_lt][23/12/2024] - chuyển group Ban chỉ huy về cuối
  const sortedData = employees?.results?.slice().sort((a, b) => {
    const groupNameA = checkGroupsByCode('BCH', a.employeesGroups);
    const groupNameB = checkGroupsByCode('BCH', b.employeesGroups);

    if (groupNameA && !groupNameB) return 1; // A chứa "BCH", B không chứa
    if (groupNameB && !groupNameA) return -1; // B chứa "BCH", A không chứa

    return 0;
  });
  return (
    <div className={styles.tableContainer}>
      <Table
        rowKey={record => record.id}
        dataSource={sortedData}
        columns={employeeColumns}
        style={{width: '100%', height: '100%' }}
        size="small"
        scroll={{ x: 1000, y: windowSize[1] * 0.7 }}
        pagination={{
          current: params?.page || defaultPagingParams.page,
          pageSize: params?.pageSize || defaultPagingParams.pageSize,
          total: employees?.queryCount || 0,
          responsive: true,
          showTotal,
          showSizeChanger: true,
        }}
        loading={isLoading || isRemoving}
        onChange={handleEmpTableChange}
      />
    </div>
  );
};
