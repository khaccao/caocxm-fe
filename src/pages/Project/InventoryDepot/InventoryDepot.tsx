/* eslint-disable import/order */
import React from 'react';

import SummaryScreen from '@/components/SummaryScreen/SummaryScreen';
import { eSummaryScreen } from '@/common/define';

const InventoryDepot: React.FC = () => {
  return <SummaryScreen type={eSummaryScreen.TONGKHO} />;
};

export default InventoryDepot;
