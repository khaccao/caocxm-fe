import { useEffect, useState } from 'react';  

import dayjs, { Dayjs } from 'dayjs';  

import CostsList from './components/CostsList';
import TabHeaderDiary from '@/components/Layout/TabHeaderDiary/TabHeaderDiary';  
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject, projectActions } from '@/store/project';

 
export const AggregateCosts = () => {  
  const [startDate, setStartDate] = useState<Dayjs | null>(null);  
  const [endDate, setEndDate] = useState<Dayjs | null>(null);  
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());

  const handleDownload = () => {  
  };  

  const handleSelectDate = (dates: [Dayjs | null, Dayjs | null] | null) => {  
    if (dates) {  
      setStartDate(dates[0]);  
      setEndDate(dates[1]);  
    } else {  
      setStartDate(null);  
      setEndDate(null);  
    }  
  };  
  useEffect(() => {
    if (selectedProject) {
      const currentDate = dayjs();
      const apiStartDate = startDate ? startDate.format('YYYY-MM-DD') : currentDate.startOf('month').format('YYYY-MM-DD');
      const apiEndDate = endDate ? endDate.format('YYYY-MM-DD') : currentDate.endOf('month').format('YYYY-MM-DD');

      dispatch(projectActions.getpaymentByProject({
        projectId: selectedProject.id,
        paymentTerm: -1,
        startDate: apiStartDate,
        endDate: apiEndDate,
      }));
    }
  }, [selectedProject, dispatch, startDate, endDate]);
  return (  
    <div>  
      <TabHeaderDiary text={'Tổng hợp chi phí'} onDownload={handleDownload} onSelectDate={handleSelectDate} />  
      <CostsList/>
    </div>  
  );  
}; 