import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';

const getModalState = (state: RootState) => state.modal;

export function getModalVisible(key: string) {
  return createSelector([getModalState], state => state.modals[key]?.visible || false);
}
