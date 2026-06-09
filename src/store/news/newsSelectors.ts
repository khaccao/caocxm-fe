import { createSelector } from '@reduxjs/toolkit';

import { NewsCategoryCode } from './newsSlice';
import { RootState } from '../types';

const getState = (state: RootState) => state.news;

export function getNewsByCode(code: NewsCategoryCode) {
  return createSelector([getState], state => state.newsByCode[code] || []);
}
