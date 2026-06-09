import React from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Modal, PaginationProps, Space, Table, TableProps, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import { CreateUpdateTeamModalName, GettingTeams, IsUpdateTeamModal, RemovingTeam } from '@/common/define';
import { usePermission, useWindowSize } from '@/hooks';
import { TeamResponse } from '@/services/TeamService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { hideModal, showModal } from '@/store/modal';
import { getSelectedProject } from '@/store/project';
import { getTeamQueryParams, getTeams, teamActions } from '@/store/team';

export const TeamManageTable = () => {
  const { t } = useTranslation(['team']);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const teams = useAppSelector(getTeams());
  const queryParams = useAppSelector(getTeamQueryParams());
  const isLoading = useAppSelector(getLoading(GettingTeams));
  const isRemoving = useAppSelector(getLoading(RemovingTeam));
  const selectedProject = useAppSelector(getSelectedProject());

  const editGranted = usePermission(['QuanLyToDoi.Edit']);
  const deleteGranted = usePermission(['QuanLyToDoi.Delete']);

  const editTeam = (record: any, onlyView: boolean) => {
    dispatch(teamActions.setSelectedTeam(record));
    dispatch(showModal({ key: CreateUpdateTeamModalName }));
    console.log(onlyView);
    if (onlyView) {
      dispatch(showModal({ key: IsUpdateTeamModal }));
    } else {
      dispatch(hideModal({ key: IsUpdateTeamModal }));
    }
  };

  const columns: TableProps<TeamResponse>['columns'] = [
    {
      title: t('Code'),
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: t('teamManage.table.teamName'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: t('teamManage.table.description'),
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: t('teamManage.table.note'),
      dataIndex: 'note',
      key: 'note',
      width: 300,
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
                onClick={e => {
                  editTeam(record, false);
                  e.stopPropagation();
                }}
                disabled={!editGranted}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={e => {
                  confirmRemoveTeam(record);
                  e.stopPropagation();
                }}
                disabled={!deleteGranted}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const confirmRemoveTeam = (team: TeamResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('confirmRemove', {
              name: `<strong>"${team.name}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      onOk: close => {
        dispatch(teamActions.removeTeamRequest({ projectId: selectedProject?.id, teamId: team.id }));
        close();
      },
    });
  };

  const handleTeamTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    dispatch(teamActions.setQueryParams({ ...queryParams, page: current, pageSize }));
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('pagingTotal', { range1: range[0], range2: range[1], total });

  return (
    <div style={{ padding: 5 }}>
      <Table
        rowKey={record => record.id}
        columns={columns}
        dataSource={teams}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => {
              editTeam(record, true);
              event.stopPropagation();
            }, // click row
          };
        }}
        size="small"
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          showTotal: showTotal,
          showSizeChanger: true,
        }}
        scroll={{ x: 1000, y: windowSize[1] - 230 }}
        onChange={handleTeamTableChange}
        loading={isLoading || isRemoving}
      />
    </div>
  );
};
