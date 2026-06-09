/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@/store/hooks';
import MaterialForm from '../MaterialForm';
import styles from './ProposalHistory.module.less';

const { Text } = Typography;

interface ProposalType {
  id: string;
  project: string;
  section: string;
  proposer: string;
  requestDate: string;
  status: string;
  approved: string;
  color?: string;
}

interface DayDataType {
  date: string;
  proposals: ProposalType[];
}

const colors = ['orange', 'blue', 'green', 'red'];

const data: DayDataType[] = [
  {
    date: 'Ngày 20/03/2023',
    proposals: [
      {
        id: 'DX2509_2',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Chờ chủ nhà duyệt số lượng',
        approved: '0/2',
      },
      {
        id: 'DX2509_1',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Hoàn thành duyệt',
        approved: '2/3',
      },
    ],
  },
  {
    date: 'Ngày 19/03/2023',
    proposals: [
      {
        id: 'DX2509_2',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Chờ kế toán vật tư duyệt giá',
        approved: '0/2',
      },
      {
        id: 'DX2509_2',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Chờ ban giám đốc duyệt số lượng',
        approved: '0/2',
      },
      {
        id: 'DX2509_1',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Hoàn thành duyệt',
        approved: '2/3',
      },
      {
        id: 'DX2509_2',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Chờ ban giám đốc duyệt số lượng',
        approved: '0/2',
      },
      {
        id: 'DX2509_1',
        project: 'Nhà ở chị Uyên',
        section: 'Phần thô / Xây tường',
        proposer: 'Nguyễn Thủ Kho',
        requestDate: '10/03/2023',
        status: 'Hoàn thành duyệt',
        approved: '2/3',
      },
    ],
  },
];

// Thêm thuộc tính color vào từng đề xuất
const coloredData: DayDataType[] = data.map(dayData => ({
  date: dayData.date,
  proposals: dayData.proposals.map((proposal, index) => ({
    ...proposal,
    color: colors[index % colors.length],
  })),
}));

const ProposalCard: React.FC<{ proposal: ProposalType }> = ({ proposal }) => {
  const { t } = useTranslation('proposalhistory');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Card
        className={`${styles.proposalCard} ${styles[proposal.color!]}`}
        title={
          <>
            <div className={styles.proposalCardHeader}>
              <Text className={styles.project}>{proposal.project}</Text>
              <Space className={styles.buttonGroup}>
              <Button
                  icon={<EditOutlined />}
                  className={styles.noBorderButton}
                  style={{ color: '#1890FF' }}
                  onClick={showModal}
                />
                <Button
                  icon={<EditOutlined />}
                  className={styles.noBorderButton}
                  style={{ color: '#1890FF' }}
                  onClick={showModal}
                />
                <Button icon={<DeleteOutlined />} className={styles.noBorderButton} style={{ color: 'red' }} />
              </Space>
            </div>
            <Space className={styles.proposalCardFooter}>
              <Text className={styles.section} type="secondary">
                {proposal.section}
              </Text>
              <Text className={styles.id} style={{ color: '#1890FF', textDecoration: 'underline' }}>
                {proposal.id}
              </Text>
            </Space>
          </>
        }
      >
        <div className={styles.proposalCardBody}>
          <Text className={styles.textWhite}>
            <strong>{t('proposer')}:</strong> {proposal.proposer}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>{t('requestDate')}:</strong> {proposal.requestDate}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>{t('status')}:</strong> {proposal.status}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>{t('approved')}:</strong> {proposal.approved}
          </Text>
        </div>
      </Card>

      <Modal visible={isModalVisible} onCancel={handleCancel} footer={null} width={1000}>
        <MaterialForm proposal={proposal} />
      </Modal>
    </>
  );
};

const ProposalList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log('mainmats');
    // dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
    // dispatch(accountingInvoiceActions.GetProductUnit({ params: {} }));
    // dispatch(accountingInvoiceActions.GetMoneyTypeList({ params: {} }));
    // dispatch(accountingInvoiceActions.GetProposalForm({params: {}}));
  }, []);
  return (
    <div className={styles.proposalList}>
      {coloredData.map(dayData => (
        <Card key={dayData.date} className={styles.proposalDayCard}>
          <div className={styles.proposalDayCardTitle}>{`${t(dayData.date)} (${dayData.proposals.length})`}</div>
          <div className={styles.proposalDayCardContent}>
            {dayData.proposals.map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProposalList;
