import React from 'react';

import { Form, Input, Modal, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible, hideModal } from '@/store/modal';
import { getSelectedShift, shiftActions } from '@/store/shift';

export const CreateUpdateShift = () => {
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getModalVisible('CreateUpdateShiftModal'));
  const selectedShift = useAppSelector(getSelectedShift());
  const { t } = useTranslation('shift');
  const [form] = Form.useForm();
  const dateOnly = dayjs().format('YYYY-MM-DD');
  const company = useAppSelector(getCurrentCompany());

  const handleSaveShift = (values: any) => {
    const shift = { ...values, companyId: company.id };
    if (selectedShift) {
      dispatch(shiftActions.updateShiftRequest({ shiftId: selectedShift.id, shift }));
      return;
    }
    dispatch(shiftActions.createShiftRequest({ shift }));
  };

  const handleCancel = () => {
    dispatch(shiftActions.setSelectedShift(undefined));
    dispatch(hideModal({ key: 'CreateUpdateShiftModal' }));
  };

  const handleOk = () => form.submit();

  return (
    <Modal
      title={selectedShift ? t('Edit') : t('New')}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('Submit')}
      cancelText={t('Cancel')}
      // footer={(_, { OkBtn, CancelBtn }) =>
      //   selectedShift ? (
      //     <Row style={{ margin: 0 }} align="stretch">
      //       <Space style={{ flex: 1 }}>
      //         <Button key="remove" type="primary" danger onClick={handleRemoveShift}>
      //           {t('Remove')}
      //         </Button>
      //       </Space>
      //       <Space>
      //         <CancelBtn />
      //         <OkBtn />
      //       </Space>
      //     </Row>
      //   ) : (
      //     <>
      //       <CancelBtn />
      //       <OkBtn />
      //     </>
      //   )
      // }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveShift}
        initialValues={{
          status: 1,
          ...selectedShift,
          startTime: selectedShift?.startTime ? dayjs(`${dateOnly}T${selectedShift.startTime}`) : null,
          endTime: selectedShift?.endTime ? dayjs(`${dateOnly}T${selectedShift.endTime}`) : null,
        }}
      >
        <Form.Item
          labelAlign="left"
          label={t('Name')}
          name="name"
          rules={[{ required: true, message: t('Please input name!') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Form.Item
            labelAlign="left"
            label={t('Start time')}
            name="startTime"
            rules={[{ required: true, message: t('Please input start time!') }]}
            style={{ display: 'inline-block', width: 'calc(50% - 5px)', marginLeft: 5 }}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            labelAlign="left"
            label={t('End time')}
            name="endTime"
            rules={[{ required: true, message: t('Please input end time!') }]}
            style={{ display: 'inline-block', width: 'calc(50% - 5px)', marginLeft: 5 }}
          >
            <TimePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form.Item>
        {/* <Form.Item name="status" label={t('Status')}>
          <Select
            options={[
              { value: 1, label: t('Active') },
              { value: 2, label: t('Deactive') },
            ]}
          />
        </Form.Item> */}
      </Form>
    </Modal>
  );
};
