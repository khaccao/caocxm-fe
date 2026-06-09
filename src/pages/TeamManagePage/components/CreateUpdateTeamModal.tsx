import React, { useEffect, useState } from 'react';

import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  TabsProps,
  Tooltip,
} from 'antd';
import { useTranslation } from 'react-i18next';

import {
  AddMemberToTeamModalName,
  CreateUpdateTeamModalName,
  GettingTeamDetails,
  IsUpdateTeamModal,
  RemovingMemberFromTeam,
  SavingTeam,
  largePagingParams,
} from '@/common/define';
import { useWindowSize } from '@/hooks';
import { ShiftResponse } from '@/services/ShiftService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, hideModal, showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import { getShifts, shiftActions } from '@/store/shift';
import { getSelectedTeam, getSelectedTeamDetails, getTeamCreateUpdateModalTab, teamActions } from '@/store/team';
import Utils from '@/utils';

export const CreateUpdateTeamModal = () => {
  const { t } = useTranslation(['team']);

  const [form] = Form.useForm();

  const windowSize = useWindowSize();

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(CreateUpdateTeamModalName));
  const isOnlyView = useAppSelector(getModalVisible(IsUpdateTeamModal));
  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());
  const selectedTeam = useAppSelector(getSelectedTeam());
  const selectedTeamDetails = useAppSelector(getSelectedTeamDetails());
  const isShiftLoading = useAppSelector(getLoading('GetShifts'));
  const isLoading = useAppSelector(getLoading(GettingTeamDetails));
  const isSaving = useAppSelector(getLoading(SavingTeam));
  const isRemovingMember = useAppSelector(getLoading(RemovingMemberFromTeam));
  const shifts = useAppSelector(getShifts());
  const currentTab = useAppSelector(getTeamCreateUpdateModalTab());

  const [checkedShiftList, setCheckedShiftList] = useState<number[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<React.Key[]>([]);

  useEffect(() => {
    const queryParams = { ...largePagingParams };
    dispatch(shiftActions.getShiftsRequest({ companyId: company.id, queryParams }));
    // eslint-disable-next-line
  }, [company]);

  useEffect(() => {
    if (selectedTeam) {
      setSelectedTeamLead(selectedTeam?.leader_Id ? [selectedTeam.leader_Id] : []);
      dispatch(teamActions.getTeamDetailsRequest({ teamId: selectedTeam?.id }));
      return;
    }
    dispatch(teamActions.setSelectedTeamDetails(undefined));
    // eslint-disable-next-line
  }, [selectedTeam]);

  useEffect(() => {
    setCheckedShiftList(selectedTeamDetails?.shifts || []);
  }, [selectedTeamDetails]);

  const handleSaveTeam = (values: any) => {
    const teamData = {
      ...selectedTeam,
      ...values,
      compnayId: company.id,
      projectId: selectedProject?.id,
    };
    if (selectedTeam) {
      // prettier-ignore
      dispatch(teamActions.updateTeamRequest({ projectId: selectedProject?.id, teamId: selectedTeam.id, team: teamData }));
      return;
    }
    // Thêm tổ đội
    dispatch(teamActions.createTeamRequest({ projectId: selectedProject?.id, team: teamData }));
  };

  const handleOk = () => form.submit();

  const handleCancel = () => {
    dispatch(teamActions.setSelectedTeam(undefined));
    dispatch(teamActions.setSelectedTeamDetails(undefined));
    dispatch(teamActions.setCreateUpdateTeamModalTab('team_info'));
    dispatch(hideModal({ key: CreateUpdateTeamModalName }));
  };

  const RenderModalTitle = () => {
    if (selectedTeam) {
      return <div>{t('editTeam', { name: selectedTeam.name })}</div>;
    }
    return <div>{t('teamManage.addTeamModal.title')}</div>;
  };

  const memberColumns: any = [
    {
      title: t('Employee code'),
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    Table.SELECTION_COLUMN,
    {
      title: '',
      dataIndex: '',
      key: 'operation',
      width: 60,
      align: 'right',
      render: (_: any, record: any) => (
        <Tooltip title={t('Remove from the team members')}>
          <Button
            icon={<DeleteOutlined />}
            type="text"
            danger
            size="small"
            onClick={() => confirmRemoveMemberFromTheList(record)}
            disabled={selectedTeamLead.includes(record.employeeId)}
          />
        </Tooltip>
      ),
      hidden: isOnlyView ? true : false
    },
  ].filter((item: any) => !item.hidden);;

  const addMember = () => {
    dispatch(showModal({ key: AddMemberToTeamModalName }));
  };

  const confirmRemoveMemberFromTheList = (member: any) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('confirmRemoveMember', {
              name: `<strong>"${member.code} - ${member.name}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      onOk: close => {
        dispatch(
          teamActions.removeMemberFromTeamRequest({
            teamId: selectedTeam.id,
            member: { teamId: selectedTeam.id, employeeId: member.employeeId },
          }),
        );
        close();
      },
    });
  };

  const updateTeamSuppervisor = (empId: number) => {
    dispatch(
      teamActions.updateTeamLeadRequest({
        projectId: selectedProject?.id,
        teamId: selectedTeam.id,
        team: { ...selectedTeam, leader_Id: empId },
      }),
    );
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      const member = selectedRows[0];
      if (selectedTeam?.leader_Id) {
        const teamLead = selectedTeamDetails?.members?.find((x: any) => x.employeeId === selectedTeam.leader_Id);
        Modal.confirm({
          title: t('Notification'),
          content: (
            <div
              dangerouslySetInnerHTML={{
                __html: t('setTeamLead', {
                  lead: `${teamLead?.code} - ${teamLead?.name}`,
                  name: `<strong>"${member.code} - ${member.name}"</strong>`,
                }),
              }}
            />
          ),
          closable: true,
          onOk: close => {
            updateTeamSuppervisor(selectedRows[0].employeeId);
            close();
          },
        });
        return;
      }
      updateTeamSuppervisor(selectedRows[0].employeeId);
    },
  };

  const [teamMembers, setTeammembers] = useState(selectedTeamDetails?.members || []);
  useEffect(() => {
    // đua team lead lên đầu danh sách members
    const membersList = Utils.deepClone(selectedTeamDetails?.members || []);
    const idx = membersList.findIndex((x: any) => x.employeeId === selectedTeam?.leader_Id);
    if (idx > -1) {
      const teamLead = membersList[idx];
      membersList.splice(idx, 1);
      membersList.unshift(teamLead);
    }
    setTeammembers(membersList);
  }, [selectedTeam, selectedTeamDetails]);

  const onTeamModalTabClick = (key: 'team_info' | 'team_members' | 'team_shifts') => {
    dispatch(teamActions.setCreateUpdateTeamModalTab(key));
  };

  const renderMembers = () => {
    return (
      <>
        <Form.Item noStyle>
          <Row justify="end">
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={addMember}>
              {t('teamManage.addMemberModal.title')}
            </Button>
          </Row>
          <Table
            rowKey={record => record.employeeId}
            columns={memberColumns}
            dataSource={teamMembers}
            pagination={false}
            size="small"
            scroll={{ y: windowSize[1] - 500 }}
            loading={isRemovingMember}
            rowSelection={{
              columnTitle: t('Supervisor'),
              columnWidth: 100,
              type: 'radio',
              selectedRowKeys: selectedTeamLead,
              ...rowSelection,
            }}
          />
        </Form.Item>
        {!isOnlyView ? (
          <Form.Item noStyle>
            <Row justify="end" style={{ marginTop: 15 }}>
              <Space>
                <Button onClick={handleCancel}>{t('Cancel')}</Button>
                <Button type="primary" onClick={() => onTeamModalTabClick('team_shifts')}>
                  {t('Next')}
                </Button>
              </Space>
            </Row>
          </Form.Item>
        ) : (
          <></>
        )}
      </>
    );
  };

  const onCheckShiftChange: any = (checkedValues: number[]) => {
    setCheckedShiftList(checkedValues);
  };
  const saveTeamShifts = () => {
    dispatch(
      teamActions.updateTeamShiftRequest({
        projectId: selectedProject?.id,
        teamId: selectedTeam.id,
        shifts: checkedShiftList,
      }),
    );
  };

  const items: TabsProps['items'] = [
    {
      key: 'team_info',
      label: t('General info'),
      children: (
        <>
          <Form.Item style={{ marginBottom: 0 }}>
            <Form.Item
              name={'code'}
              label={`${t('Code')}`}
              rules={[{ required: true, message: t('Please input code') }]}
              style={{ display: 'inline-block', width: 'calc(30% - 5px)' }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={'name'}
              label={`${t('teamManage.createUpdateform.teamName')}`}
              rules={[{ required: true, message: t('teamManage.createUpdateform.requireTeamName') }]}
              style={{ display: 'inline-block', width: 'calc(70%)', marginLeft: 5 }}
            >
              <Input />
            </Form.Item>
          </Form.Item>
          {/* <Form.Item name="description" label={t('teamManage.createUpdateform.description')}>
            <Input />
          </Form.Item> */}
          <Form.Item name="note" label={t('teamManage.createUpdateform.note')}>
            <Input.TextArea rows={3} name="note" />
          </Form.Item>
          <Form.Item name="status" label={t('teamManage.createUpdateform.status')}>
            <Select
              options={[
                { value: 1, label: t('Active') },
                { value: 2, label: t('Deactive') },
              ]}
            />
          </Form.Item>
          {!isOnlyView ? (
            <Form.Item noStyle>
              <Row justify="end" style={{ marginTop: 20 }}>
                <Space>
                  <Button onClick={handleCancel}>{t('Cancel')}</Button>
                  <Button type="primary" onClick={handleOk} loading={isSaving}>
                    {t('Save')}
                  </Button>
                </Space>
              </Row>
            </Form.Item>
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      key: 'team_members',
      label: t('Members'),
      children: renderMembers(),
    },
    {
      key: 'team_shifts',
      label: t('Shift'),
      children: (
        <Spin spinning={isShiftLoading}>
          <Form.Item label={t('Shift')} className="team-shifts" style={{ marginBottom: 0 }}>
            <Checkbox.Group style={{ width: '100%' }} value={checkedShiftList} onChange={onCheckShiftChange}>
              <Row>
                {shifts?.results?.map((x: ShiftResponse) => (
                  <Col span={24} key={x.id}>
                    <Checkbox value={x.id}>{x.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          {!isOnlyView ? (
            <Form.Item noStyle>
              <Row justify="end" style={{ marginTop: 20 }}>
                <Space>
                  <Button onClick={handleCancel}>{t('Cancel')}</Button>
                  <Button type="primary" onClick={saveTeamShifts} loading={isSaving}>
                    {t('Save')}
                  </Button>
                </Space>
              </Row>
            </Form.Item>
          ) : (
            <></>
          )}
        </Spin>
      ),
    },
  ];

  return (
    <Modal
      width={600}
      title={<RenderModalTitle />}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isSaving}
      footer={false}
      className="team-modal"
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 1, ...selectedTeam }}
          onFinish={handleSaveTeam}
          disabled={isOnlyView ? true : false}
        >
          <Form.Item noStyle>
            <Tabs items={items} activeKey={currentTab} onTabClick={(key: any) => onTeamModalTabClick(key)} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};
