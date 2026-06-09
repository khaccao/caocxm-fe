import { useState } from 'react';  

import { Dayjs } from 'dayjs';  

import PaysubcontractorList from './components/PaysubcontractorList';
import TabHeaderDiary from '@/components/Layout/TabHeaderDiary/TabHeaderDiary';  

 
export const PaySubcontractor = () => {  
  const [startDate, setStartDate] = useState<Dayjs | null>(null);  
  const [endDate, setEndDate] = useState<Dayjs | null>(null);  

  const handleDownload = () => {  
  };  

  const handleSelectDate = (dates: [Dayjs | null, Dayjs | null] | null) => {  
    if (dates) {  
      setStartDate(dates[0]);  
      setEndDate(dates[1]);  
      console.log('Ngày bắt đầu được chọn:', dates[0]);  
      console.log('Ngày kết thúc được chọn:', dates[1]);  
    } else {  
      setStartDate(null);  
      setEndDate(null);  
    }  
  };  

  return (  
    <div>  
      <TabHeaderDiary onDownload={handleDownload} onSelectDate={handleSelectDate} />  
      <PaysubcontractorList/>
    </div>  
  );  
};