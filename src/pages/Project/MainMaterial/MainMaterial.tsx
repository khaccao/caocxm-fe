/* eslint-disable import/order */
import { useState } from 'react';

import { Modal, TabsProps } from 'antd';
import dayjs from 'dayjs';

import TabHeader from '@/components/Layout/TabHeader/TabHeader';
import MaterialList from './components/MaterialList';
import NewMaterialList from './components/NewMaterialList';
import ProposalHistory from './components/ProposalHistory';

export const MainMaterial = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: 'Danh sách vật tư chính',
      children: <MaterialList />,
    },
    {
      key: '2',
      label: 'Lịch sử đề xuất cấp vật tư chính',
      children: <ProposalHistory />,
    },
  ];
  const handleAddProposal = () => {
    setIsModalVisible(true);
  };

  const handleDownload = () => {};

  const handleSelectDate = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        console.log('Ngày bắt đầu:', startDate.format('DD/MM/YYYY'));
        console.log('Ngày kết thúc:', endDate.format('DD/MM/YYYY'));
      }
    } else {
      console.log('Khoảng thời gian chưa được chọn đầy đủ.');
    }
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <TabHeader
        tabs={tabs}
        onAddProposal={handleAddProposal}
        onDownload={handleDownload}
        onSelectDate={handleSelectDate}
      />
      <Modal open={isModalVisible} onCancel={handleModalClose} footer={null} width={1250}>
        <NewMaterialList />
      </Modal>
    </div>
  );
};
