import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';

const getState = (state: RootState) => state.organization;

export function getSelectedOrg() {
  return createSelector([getState], state => state.selectedOrg || undefined);
}
