/* eslint-disable import/order */
import React, { useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import { usePermission } from '@/hooks';
import { IncidentalData } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { useAppDispatch } from '@/store/hooks';
import Utils from '@/utils';
import { IncidentalForm } from '.';
import { getColorBaseOnStatus, getConfirmLevel } from '../utils';
import styles from './IncidentalCard.module.css';
import IncidentalDetailModal from './IncidentalDetailModal';

// --------------------------------------------------------------------

const { Text } = Typography;

interface IncidentalCardProps {
  incidental: IncidentalData & { items?: IncidentalData[] };
  handleDelete: (ids: number[]) => void;
}

export default function IncidentalCard({ incidental, handleDelete }: IncidentalCardProps): React.JSX.Element {
  const canEdit = usePermission(['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Edit']);
  const canDelete = usePermission(['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Delete']);
  const dispatch = useAppDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [keyEditIndex, setKeyEditIndex] = useState(0);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const handleClose = () => {
    setIsModalEdit(false);
    setKeyEditIndex(keyEditIndex + 1);
  };
  return (
    <>
      <Card
        headStyle={{ backgroundColor: 'white' }}
        className={`${styles.incidentalCard} ${styles[getColorBaseOnStatus(incidental)]} `}
        onClick={() => {
          setIsModalVisible(true); dispatch(accountingInvoiceActions.setIncidental(incidental));
        }}
        title={
          <div className={styles.noOuterPadding}>
            <div className={styles.incidentalCardHeader} style={{ backgroundColor: 'white' }}>
              <Text className={styles.project}>{incidental.payer}</Text>
              <Space className={styles.buttonGroup}>
                {canEdit && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                      icon={<EditOutlined />}
                      className={styles.noBorderButton}
                      style={{ color: '#1890FF' }}
                      disabled={getConfirmLevel(incidental) !== 0}
                      onClick={e => {
                        setIsModalEdit(true);
                        e.stopPropagation();
                      }}
                    />
                    <Text className={styles.noteText}>Sửa</Text>
                  </div>
                )}

                {canDelete && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                      icon={<DeleteOutlined />}
                      className={styles.noBorderButton}
                      style={{ color: 'red' }}
                      onClick={e => {
                        e.stopPropagation();
                        setIsDeleteConfirmVisible(true);
                      }}
                    />
                    <Text className={styles.noteText}>Xóa</Text>
                  </div>
                )}
              </Space>
            </div>
          </div>
        }
      >
        <div className={styles.incidentalCardBody}>
          <Text className={styles.textWhite}>
            <strong>Người tạo: </strong>
            {incidental.createdBy ? incidental.createdBy.replace(/ - $/, '') : ''}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>Tên dự án: </strong>
            {incidental.projectName ? incidental.projectName : 'Tổng'}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>Tổng tiền: </strong>
            {Number(incidental.totalAmount).toLocaleString('en-US')} VNĐ
          </Text>
          <br />

          <Text className={styles.textWhite}>
            <strong>Ngày hạch toán: </strong>
            {incidental.dateConfirmByRank2 ? <>{dayjs(incidental.dateConfirmByRank2).format('DD/MM/YYYY')}</> : null}
          </Text>
        </div>
        <div className={styles.confirmlevel}>
          <Text className={styles.textHighlight}>
            {getConfirmLevel(incidental) === 3 ? (
              <div style={{ textAlign: 'center' }}>
                <strong>Đã duyệt cấp 2</strong>
                <br />
                <strong>Đã xác nhận</strong>
              </div>
            ) : (
              <strong>Đã duyệt cấp {getConfirmLevel(incidental)}</strong>
            )}
          </Text>
        </div>
      </Card>

      {/* Incidental Detail - Confirm */}
      <Modal
        className={styles.antModal}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1250}
      >
        <IncidentalDetailModal incidental={incidental} onClose={() => setIsModalVisible(false)} />
      </Modal>

      {/* Edit */}
      <Modal
        title="Chỉnh sửa chi phí phát sinh"
        open={isModalEdit}
        onCancel={() => {
          handleClose();
        }}
        footer={null}
        width={'80%'}
      >
        <IncidentalForm
          key={`${keyEditIndex}`}
          onCancel={handleClose}
          onSuccess={handleClose}
          mode="edit"
          data={incidental}
          handleDelete={handleDelete}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmVisible}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        onOk={() => {
          const ids = incidental.items?.length ? incidental.items.map(i => i.id) : [incidental.id];
          handleDelete(ids as number[]);
          setIsDeleteConfirmVisible(false);
          Utils.successNotification('Xóa phát sinh chi phí thành công');
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa chi phí phát sinh này không?</p>
      </Modal>
    </>
  );
}
