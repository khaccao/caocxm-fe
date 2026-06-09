import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';

const getLoadingState = (state: RootState) => state.loading;

export function getLoading(key?: string) {
  return createSelector([getLoadingState], state => (key ? !!state.activeLoadings[key] : state.loading));
}

export function getActiveLoading(key: string) {
  return createSelector([getLoadingState], state => !!state.activeLoadings[key]);
}
