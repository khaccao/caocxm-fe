import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';

const getState = (state: RootState) => state.salary;

export function getSalarys() {
  return createSelector([getState], state => state.salarys);
}

export function getSalarysParams() {
  return createSelector([getState], state => state.salarysParams || []);
}

export function getThangNam() {
  return createSelector([getState], state => state.ThangNam);
}

export function getSearchStr() {
  return createSelector([getState], state => state.SearchStr);
}
export function getOnSave() {
  return createSelector([getState], state => state.onSave);
}