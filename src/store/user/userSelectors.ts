import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../types';

const getUserState = (state: RootState) => state.user;

export function getUserPreferences() {
  return createSelector([getUserState], state => state.preferences);
}

export function getFetchingPreferences() {
  return createSelector([getUserState], state => state.fetchingPreferences);
}

export function getUserOrganizations() {
  return createSelector([getUserState], state => state.organizations);
}

export function getDefaultOrganization() {
  return createSelector([getUserState], state => state.defaultOragization);
}

export function getCurrentConfig() {
  return createSelector([getUserState], state => state.currentConfig);
}
