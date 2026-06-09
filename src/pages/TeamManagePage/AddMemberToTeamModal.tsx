import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, CheckboxProps, Input, Modal, PaginationProps, Row, Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { AddMemberToTeamModalName, GettingProjectMembers, SavingTeamMembers } from '@/common/define';
import { useWindowSize } from '@/hooks';
import { ProjectMemberResponse } from '@/services/ProjectService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, hideModal } from '@/store/modal';
import { getProjectMembers, getSelectedProject, projectActions } from '@/store/project';
import { getSelectedTeam, getSelectedTeamDetails, teamActions } from '@/store/team';

export const AddMemberToTeamModal = () => {
  const { t } = useTranslation('team');
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const selectedTeam = useAppSelector(getSelectedTeam());
  const selectedTeamDetails = useAppSelector(getSelectedTeamDetails());
  const projectMembers = useAppSelector(getProjectMembers());
  const isModalOpen = useAppSelector(getModalVisible(AddMemberToTeamModalName));
  const [members, setMembers] = useState(projectMembers?.results || []);
  const isLoading = useAppSelector(getLoading(GettingProjectMembers));
  const isSaving = useAppSelector(getLoading(SavingTeamMembers));
  const [timer, setTimer] = useState<any>(null);
  const windowSize = useWindowSize();
  const [queryParams, setQueryParams] = useState<any>({
    paging: true,
    page: 1,
    pageSize: 20,
  });
  const [selectedEmployees, setSelectedEmployees] = useState<ProjectMemberResponse[]>([]);
  const [isCheckAll, setIsCheckAll] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      dispatch(projectActions.getProjectMembersRequest({ projectId: selectedProject.id, queryParams }));
      return;
    }
    dispatch(projectActions.setProjectMembers(undefined));
    // eslint-disable-next-line
  }, [selectedProject]);

  useEffect(() => {
    setMembers(projectMembers?.results || []);
  }, [projectMembers]);

  const handleCancel = () => {
    dispatch(hideModal({ key: AddMemberToTeamModalName }));
  };

  const handleOk = () => {
    const employeeList = selectedEmployees.map(x => ({ ...x, teamId: selectedTeam?.id }));
    dispatch(teamActions.createManyTeamMembersRequest({ teamId: selectedTeam?.id, employeeList }));
  };

  const handleCheckedAll: CheckboxProps['onChange'] = e => {
    const checked = e.target.checked;
    if (checked) {
      const selectMembers = [...members];
      setSelectedEmployees(
        selectMembers.filter(
          mem => !selectedTeamDetails?.members?.some((teamMember: any) => teamMember.employeeId === mem.employeeId),
        ),
      );
      // setIsCheckAll(true);
    } else {
      setSelectedEmployees([]);
      // setIsCheckAll(false);
    }
  };

  const handleSelectedCheckbox = (record: ProjectMemberResponse) => {
    const empList = [...selectedEmployees];
    const recordIdx = selectedEmployees.findIndex(employee => employee.id === record.id);
    console.log(recordIdx, 'recordIdx');
    if (recordIdx === -1) {
      setSelectedEmployees([...empList, record]);
      return;
    }
    empList.splice(recordIdx, 1);
    setSelectedEmployees(empList);
  };
  const columns: any = [
    {
      title: <Checkbox checked={isCheckAll} onChange={handleCheckedAll} />,
      dataIndex: 'code',
      key: 'code',
      width: 50,
      render: (value: string, record: any) => {
        return (
          <Checkbox
            checked={selectedEmployees.findIndex(emp => emp.id === record.id) === -1 ? false : true}
            onChange={() => handleSelectedCheckbox(record)}
            disabled={
              selectedTeamDetails
                ? selectedTeamDetails.members?.findIndex((x: any) => x.employeeId === record.employeeId) > -1
                : false
            }
          />
        );
      },
    },
    {
      title: t('Employee code'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
  ];

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    const params = { ...queryParams, search };
    setQueryParams(params);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      dispatch(projectActions.getProjectMembersRequest({ projectId: selectedProject?.id, queryParams: params }));
    }, 500);
    setTimer(timeoutId);
  };

  // const rowSelection = {
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
  //     setSelectedEmployees(selectedRows);
  //   },
  //   getCheckboxProps: (record: any) => ({
  //     disabled: selectedTeamDetails
  //       ? selectedTeamDetails.members?.findIndex((x: any) => x.employeeId === record.employeeId) > -1
  //       : false, // Column configuration not to be checked
  //     name: record.name,
  //   }),
  //   columnWidth: 50,
  // };

  const handleEmpTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const params = { ...queryParams, page: current, pageSize };
    setQueryParams(params);
    dispatch(projectActions.getProjectMembersRequest({ projectId: selectedProject?.id, queryParams: params }));
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('pagingTotal', { range1: range[0], range2: range[1], total });

  useEffect(() => {
    // kiểm tra xem nếu danh sách những nhân viên có thể chọn = với danh sách nhân viên đã chọn thì set check all = true
    const availableEmp = members.filter(
      mem => !selectedTeamDetails?.members?.some((teamMember: any) => teamMember.employeeId === mem.employeeId),
    );
    if (selectedEmployees.length === availableEmp.length) {
      setIsCheckAll(true);
    } else {
      setIsCheckAll(false);
    }
    // eslint-disable-next-line
  }, [selectedEmployees, members]);

  return (
    <Modal
      open={isModalOpen}
      title={t('Choose member')}
      width={800}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={isSaving}
    >
      <Row justify="end" style={{ marginBottom: 10 }}>
        <Input
          placeholder={t('Search')}
          style={{ width: 300 }}
          suffix={queryParams?.search ? null : <SearchOutlined />}
          allowClear
          value={queryParams?.search}
          onChange={onSearchChange}
        />
      </Row>
      <Table
        rowKey={record => record.employeeId}
        columns={columns}
        dataSource={members}
        size="small"
        // rowSelection={rowSelection}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: projectMembers?.queryCount || 0,
          showTotal: showTotal,
        }}
        scroll={{ y: windowSize[1] - 500 }}
        loading={isLoading}
        onChange={handleEmpTableChange}
      />
    </Modal>
  );
};
