import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';
import { defaultPagingParams } from '@/common/define';

const getTeamState = (state: RootState) => state.team;

export function getSelectedTeam() {
  return createSelector([getTeamState], state => state.selectedTeam);
}

export function getSelectedTeamDetails() {
  return createSelector([getTeamState], state => state.selectedTeamDetails);
}

export function getTeams() {
  return createSelector([getTeamState], state => state.teams || []);
}

export function getTeamQueryParams() {
  return createSelector([getTeamState], state => state.queryParams || defaultPagingParams);
}

export function getTeamCreateUpdateModalTab() {
  return createSelector([getTeamState], state => state.createUpdateTeamModalTab || 'team_info');
}

export function getHistoryReport() {
  return createSelector([getTeamState], state => state.historyReport || []);
}
export function getTeamByUser() {
  return createSelector([getTeamState], state => state.TeamByUser|| []);
}
export function getTeamsByIds() {
  return createSelector([getTeamState], state => state.teamsByIds || []);
}