import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store/types';

export const getAppState = (state: RootState) => state.app;

export function getLanguage() {
  return createSelector([getAppState], state => state.language);
}

export function getCurrentUser() {
  return createSelector([getAppState], state => state.auth?.user);
}

export function getCurrentCompany() {
  return createSelector([getAppState], state => state.auth?.company);
}

export function getCaptcha() {
  return createSelector([getAppState], state => state.captcha);
}

export function getAuthenticated() {
  return createSelector([getAppState], state => state.auth);
}

export function getUserRoles() {
  return createSelector([getAppState], state => state.auth?.roles || []);
}

export function getActiveMenu() {
  return createSelector([getAppState], state => state.activeMenu);
}
export function getEmployeedetal() {
  return createSelector([getAppState], state => state.selectedEmployeeDetails);
}
export function getgetUserIIS() {
  return createSelector([getAppState], state => state.DanhSachUseriis);
}
export function getEmployeeDetails() {
  return createSelector([getAppState], state => state.selectedEmployeeDetails);
}
export function getGrantedPolicies() {
  return createSelector([getAppState], state => state.grantedPolicies || {});
}
export function policyGranted(policiesKey: string[]) {
  return createSelector([getAppState], state => {
    const grantedPolicies = state.grantedPolicies;
    if (!grantedPolicies) return false;
    return policiesKey.some(key => grantedPolicies[key] === true);
  });
}
