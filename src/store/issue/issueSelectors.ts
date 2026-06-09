import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../types';
import { defaultPagingParams, eDateGanttOption } from '@/common/define';

const getState = (state: RootState) => state.issue;

export function getIssuesView() {
  return createSelector([getState], state => state.view || []);
}

export function getIssuesDateGanttOption() {
  return createSelector([getState], state => state.dateGanttOption || eDateGanttOption.WEEKS);
}

export function getIssues() {
  return createSelector([getState], state => state.issues);
}

export function getIssueStatusList() {
  return createSelector([getState], state => state.issueStatus?.results || []);
}

export function getIssueProgressList() {
  return createSelector([getState], state => state.issueProgress?.results || []);
}

export function getIssueQueryParams() {
  return createSelector([getState], state => state.queryParams || defaultPagingParams);
}

export function getSelectedIssue() {
  return createSelector([getState], state => state.selectedIssue);
}

export function getEditIssuePublic() {
  return createSelector([getState], state => state.editIssuePublic);
}

export function getSelectedWorkWeekly() {
  return createSelector([getState], state => state.selectedWorkWeekly);
}

export function getIssueByVersion() {
  return createSelector([getState], state => state.issueByVersion);
}

export function getTagVersionId() {
  return createSelector([getState], state => state.tagVersionId)
}

export function getIssueChecklist() {
  return createSelector([getState], state => state.issueChecklist);
}

export function getCheckItemIds() {
  return createSelector([getState], state => state.checkItemIds);
}

export function getChecklistsTeams() {
  return createSelector([getState], state => state.checklistsTeams);
}


export function getIssueTeams() {
  return createSelector([getState], state => state.issueTeams);
}

export function getSelectedChecklistItem() {
  return createSelector([getState], state => state.selectedChecklistItem);
}

export function getSelectedChecklistsTeam() {
  return createSelector([getState], state => state.selectedChecklistsTeam);
}

export function getIssueIds() {
  return createSelector([getState], state => state.issueIds);
}

export function getCategorys() {
  return createSelector([getState], state => state.categorys);
}

export function getTargets() {
  return createSelector([getState], state => state.targets);
}

export function getTargetsIssue() {
  return createSelector([getState], state => state.targetsIssue);
}


export function getDateFilter() {
  return createSelector([getState], state => state.dateFilter);
}

export function getTagsVersion() {
  return createSelector([getState], state => state.tagsVersion);
}

export function getTracker() {
  return createSelector([getState], state => state.tracker);
}

export function getAttributes() {
  return createSelector([getState], state => state.attributes);
}

export function getOtherResources() {
  return createSelector([getState], state => state.otherResources);
}
export function getIssueRelationshipParent() {
  return createSelector([getState], state => state.ParentIssueRelationship);
}
export function getIssueRelationshipChild() {
  return createSelector([getState], state => state.ChildIssueRelationship);
}
export function getAllChildRelationship() {
  return createSelector([getState], state => state.AllChildIssueRelationShipFromId);
}

export function getIssuesByParentId() {
  return createSelector([getState], state => state.issuesByParentId);
}

export function getFileAttachmenForIssue() {
  return createSelector([getState], state => state.listFileAttachmentOfIssue);
}

export function getAllMembersToGroup() {
  return createSelector([getState], state => state.allMembersToGroup);
}

export function queryParamsMachinery() {
  return createSelector([getState], state => state.queryParamsMachinery);
}

export function queryParamsMaterial() {
  return createSelector([getState], state => state.queryParamsMaterial);
}

export function queryParamsByTagVersion() {
  return createSelector([getState], state => state.queryParamsByTagVersion);
}

export function getMaterials() {
  return createSelector([getState], state => state.materials);
}

export function getMachineries() {
  return createSelector([getState], state => state.machineries);
}

export function getLabelEdit() {
  return createSelector([getState], state => state.setSelectedLabel);
}

export function getSession() {
  return createSelector([getState], state => state.session);
}
export function getDataFileView() {
  return createSelector([getState], state => state.dataFileView);
}

export function getEmployeeReportByIssue() {
  return createSelector([getState], state => state.employeeReportByIssue);
}

export function getFinanceFile() {
  return createSelector([getState], state => state.dataFilnance)};
export function getReportsByStartEndDate() {
  return createSelector([getState], state => state.reportsByStartEndDate);
}

export function getQueryReportsByStartEndDate() {
  return createSelector([getState], state => state.queryReportsByStartEndDate);
}

export function getQueryParamAccountingManagement() {
  return createSelector([getState], state => state.queryParamAccountingManagement);
}