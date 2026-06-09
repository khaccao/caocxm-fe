/* eslint-disable import/order */
import { useState } from 'react';

import { Modal, TabsProps } from 'antd';
import dayjs from 'dayjs';

import TabHeader from '@/components/Layout/TabHeader/TabHeader';
import AdditionalCost from './components/AdditionalCost';
import AuxiliaryHistory from './components/AuxiliaryHistory';
import AuxiliaryMaterialList from './components/AuxiliaryMaterialList';
import NewAuxiliaryMaterial from './components/NewAuxiliaryMaterial';

export const Auxiliarymaterial = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: 'Danh sách vật tư phụ',
      children: <AuxiliaryMaterialList />,
    },
    {
      key: '2',
      label: 'Lịch sử đề xuất cấp vật tư phụ',
      children: <AuxiliaryHistory/>,
    },
    {
      key: '3',
      label: 'Chi phí phát sinh ',
      children: <AdditionalCost />,
    },
  ];
  const handleAddProposal = () => {
    setIsModalVisible(true);
  };
  const AddMorearise = () => {};
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
        onAddMorearise={AddMorearise}
        onDownload={handleDownload}
        onSelectDate={handleSelectDate}
      />
      <Modal open={isModalVisible} onCancel={handleModalClose} footer={null} width={1220}>
        <NewAuxiliaryMaterial />
      </Modal>
    </div>
  );
};
