/* eslint-disable import/order */
import { TabsProps } from 'antd';
import dayjs from 'dayjs';

import TabHeader from '@/components/Layout/TabHeader/TabHeader';
import MachineList from './components/MachineList';
import MachineryHistory from './components/MachineryHistory';

export const Machinery = () => {
  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: 'Danh sách máy móc - CCDC',
      children: <MachineList />,
    },
    {
      key: '2',
      label: 'Lịch sử đề xuất cấp máy móc - CCDC',
      children: <MachineryHistory/>,
    },
  ];
  const handleAddProposal = () => {};
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
  return (
    <div>
      <TabHeader
        tabs={tabs}
        onAddProposal={handleAddProposal}
        onDownload={handleDownload}
        onSelectDate={handleSelectDate}
      />
    </div>
  );
};
