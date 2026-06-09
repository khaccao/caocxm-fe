import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';
import { defaultPagingParams } from '@/common/define';

const getState = (state: RootState) => state.shift;

export function getShifts() {
  return createSelector([getState], state => state.shifts);
}

export function getSelectedShift() {
  return createSelector([getState], state => state.selectedShift);
}

export function getShiftQueryParams() {
  return createSelector([getState], state => state.queryParams || defaultPagingParams);
}