import React, { useEffect, useState } from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Row, Space, Table, Tooltip, Typography } from 'antd';
import type { TableProps, PaginationProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { CreateUpdateShift } from './CreateUpdateShift';
import { colors } from '@/common/colors';
import { defaultPagingParams } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission } from '@/hooks';
import { ShiftResponse } from '@/services/ShiftService';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getShiftQueryParams, getShifts, shiftActions } from '@/store/shift';

export const ShiftTemplates = () => {
  const { t } = useTranslation('shift');
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(getActiveMenu());
  const shifts = useAppSelector(getShifts());
  const shiftModal = useAppSelector(getModalVisible('CreateUpdateShiftModal'));
  const company = useAppSelector(getCurrentCompany());
  const [shiftList, setShiftList] = useState<ShiftResponse[]>([]);
  const queryParams = useAppSelector(getShiftQueryParams());
  const isLoading = useAppSelector(getLoading('GetShifts'));

  const editGranted = usePermission(['CaLamViec.Edit']);
  const deletedGranted = usePermission(['CaLamViec.Delete']);

  useEffect(() => {
    dispatch(shiftActions.getShiftsRequest({ companyId: company.id, queryParams }));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setShiftList(shifts?.results || []);
  }, [shifts]);

  const shiftColumns: TableProps<ShiftResponse>['columns'] = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Start time'),
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: t('End time'),
      dataIndex: 'endTime',
      key: 'endTime',
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
                onClick={() => editShift(record)}
                disabled={!editGranted}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={() => confirmRemoveShift(record)}
                disabled={!deletedGranted}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const confirmRemoveShift = (shift: ShiftResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('confirmRemove', {
              name: `<strong>"${shift.name}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      onOk: close => {
        dispatch(shiftActions.removeShiftsRequest({ shiftId: shift.id }));
        close();
      },
    });
  };

  const createShift = () => {
    dispatch(showModal({ key: 'CreateUpdateShiftModal' }));
  };

  const editShift = (shift: any) => {
    dispatch(shiftActions.setSelectedShift(shift));
    dispatch(showModal({ key: 'CreateUpdateShiftModal' }));
  };

  const handleShiftTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...queryParams, page: current, pageSize };
    dispatch(shiftActions.getShiftsRequest({ companyId: company.id, queryParams: search }));
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('pagingTotal', { range1: range[0], range2: range[1], total });

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
      {shiftModal && <CreateUpdateShift />}
      <Row align="stretch" style={{ backgroundColor: 'white', padding: 10 }}>
        <Typography.Title style={{ flex: 1, marginTop: 5 }} level={4}>
          {activeMenu?.label}
        </Typography.Title>
        <div style={{ marginTop: 5 }}>
          <WithPermission strategy="disable" policyKeys={['CaLamViec.Create']}>
            <Button type="primary" onClick={createShift}>
              {t('New')}
            </Button>
          </WithPermission>
        </div>
      </Row>
      <div
        style={{
          height: 'calc(100vh - 130px)',
          padding: 5,
        }}
      >
        <Table
          size="small"
          rowKey={record => record.id}
          dataSource={shiftList}
          columns={shiftColumns}
          pagination={{
            current: queryParams?.page || defaultPagingParams.page,
            pageSize: queryParams?.pageSize || defaultPagingParams.pageSize,
            total: shifts?.queryCount || 0,
            responsive: true,
            showTotal,
            showSizeChanger: true,
          }}
          onChange={handleShiftTableChange}
          loading={isLoading}
        />
      </div>
    </div>
  );
};
