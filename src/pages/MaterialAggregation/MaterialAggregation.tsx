import React from 'react';

import { eSummaryScreen } from '@/common/define';
import SummaryScreen from '@/components/SummaryScreen/SummaryScreen';
import { usePermission } from '@/hooks';

const MaterialAggregation: React.FC = () => {
  const searchGranted = usePermission(['KeHoachTaiChinh.TongHopVatTu.Search']);

  return <SummaryScreen type={eSummaryScreen.TONGHOPVATTU} allowFilter={true} />;
};

export default MaterialAggregation;
