import { createSelector } from '@reduxjs/toolkit';

import { defaultPagingParams } from '@/common/define';
import { RootState } from '@/store/types';

export const getProjectState = (state: RootState) => state.project;

export function getProjectList() {
  return createSelector([getProjectState], state => state.projectList || []);
}

export function getProjects() {
  return createSelector([getProjectState], state => state.projects || []);
}

export function getProjectById() {
  return createSelector([getProjectState], state => state.projectById || null);
}

export function getProjectsByCompanyId() {
  return createSelector([getProjectState], state => state.projectsByCompanyId || []);
}

export function getSelectedCompanyProjects() {
  return createSelector([getProjectState], state => state.selectedCompanyProject || null);
}

export function getEmployeesByCompanyId() {
  return createSelector([getProjectState], state => state.employeesByCompanyId || []);
}

export function getRolesByCompanyId() {
  return createSelector([getProjectState], state => state.rolesByCompanyId || []);
}

export function getSelectedProject() {
  return createSelector([getProjectState], state => state.selectedProject || null);
}

export function getCreateProjectCurrentStep() {
  return createSelector([getProjectState], state => state.createProjectCurrentStep || 0);
}

export function getCreateProjectInformationValue() {
  return createSelector([getProjectState], state => state.createProjectInformationValue || null);
}

export function getProjectAvatar() {
  return createSelector([getProjectState], state => state.projectAvatar || '');
}

export function getProjectMemberList() {
  return createSelector([getProjectState], state => state.projectMemberList || []);
}

export function getProjectStatusList() {
  return createSelector([getProjectState], state => state.projectStatus?.results || []);
}

export function getProjectMembers() {
  return createSelector([getProjectState], state => state.projectMembers);
}

export function  getProjectQueryParams() {
  return createSelector([getProjectState], state => state.queryParams || defaultPagingParams);
}

export function  getProjectRoles() {
  return createSelector([getProjectState], state => state.projectRoles);
}

export function  getProjectSelectedMember() {
  return createSelector([getProjectState], state => state.selectedMember);
}

export function getLabelChildren() {
  return createSelector([getProjectState], state => state.listLableChildren)
}

export function getFileRoots() {
  return createSelector([getProjectState], state => state.listDataFileRoots)
}

export function getFileRootsOutProject() {
  return createSelector([getProjectState], state => state.listDataFileRootsOutProject)
}

export function folderisCreated() {
  return createSelector([getProjectState], state => state.isCreated);
}

export function getlistFileRootsEdit() {
  return createSelector([getProjectState], state => state.listFileRootsEdit)
}
export function getCreatedWarehouses() {
  return createSelector([getProjectState], state => state.createdWarehouses);
}

export function getCreatedProjectWarehouses() {
  return createSelector([getProjectState], state => state.createdProjectWarehouses);
}
export function getProjectWarehouses() {
  return createSelector([getProjectState], state => state.projectwarehouseResponse);
}
export function coppyProject() {
  return createSelector([getProjectState], state => state.coppyProject);
}
export function getpaymentByProject() {
  return createSelector([getProjectState], state => state.paymentByProject);
}
export function getDinhMucThuongs() {
  return createSelector([getProjectState], state => state.DinhMucThuongs);
}
export function getEmployeeProjects() {
  return createSelector([getProjectState], state => state.EmployeeProjects);
}

export function getSubContractor() {
  return createSelector([getProjectState], state => state.SubContractor);
}