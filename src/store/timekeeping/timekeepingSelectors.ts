import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store/types';

export const getTimekeepingState = (state: RootState) => state.timekeeping;

export function getTeams() {
  return createSelector([getTimekeepingState], state => state.teams);
}

export function getCheckInData() {
  return createSelector([getTimekeepingState], state => state.checkIn);
}

export function getSelectedCheckInDetail() {
  return createSelector([getTimekeepingState], state => state.selectedCheckInDetail);
}

export function getSelectedCheckInItem() {
  return createSelector([getTimekeepingState], state => state.selectedCheckInItem);
}

export function getCheckInPhoto() {
  return createSelector([getTimekeepingState], state => state.checkInPhoto);
}

export function getDataUser() {
  return createSelector([getTimekeepingState], state => state.employeeSelected);
}

export function getAllTimeForMonthOfOneEmployee() {
  return createSelector([getTimekeepingState], state => state.allTimeKeepingFormonth);
}

export function getAllTimeForDayOfEmployees() {
  return createSelector([getTimekeepingState], state => state.timeKeepingForDay);
}

export function getChekinTimeForDay() {
  return createSelector([getTimekeepingState], state => state.checkInModelData);
}

export function getMembers() {
  return createSelector([getTimekeepingState], state => state.membersByGroupCode || {});
}

export function getMembersByGroupCode(groupCode: string) {
  return createSelector([getTimekeepingState], state =>
    state.membersByGroupCode ? state.membersByGroupCode[groupCode] : [],
  );
}
