import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';
import { defaultPagingParams } from '@/common/define';

const getState = (state: RootState) => state.group;

export function getGroups() {
  return createSelector([getState], state => state.group);
}

export function getSearchStr() {
  return createSelector([getState], state => state.searchStr);
}
