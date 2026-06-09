import { createSelector } from "@reduxjs/toolkit";

import { defaultPagingParams } from "@/common/define";
import { RootState } from "@/store/types";

export const getEmployeeState = (state: RootState) => state.employee;
export const getDanhSachUserState = (state: RootState) => state.employee.DanhSachUser;
export function getSelectedEmployee () {
  return createSelector([getEmployeeState], state => state.selectedEmployee);
}

export function getEmployees () {
  return createSelector([getEmployeeState], state => state.employees);
}

export function getEmployeeQueryParams () {
  return createSelector([getEmployeeState], state => state.queryParams || defaultPagingParams);
}

// [10/12/2024][#21146][phuong_td] lưu QueryFeeParams
export function getFeeParams () {
  return createSelector([getEmployeeState], state => state.queryFeeParams || defaultPagingParams);
}

export function getFeeTableEmployees () {
  return createSelector([getEmployeeState], state => state.FeeTableEmployee);
}

export function getEmployeeSalariesPays () {
  return createSelector([getEmployeeState], state => state.employeeSalariesPays);
}

export function getEmployeeReportEfficiencyByStartEndDate() {
  return createSelector([getEmployeeState], state => state.employeeReportEfficiencyByStartEndDate);
}

export function getQueryEmployeeReportEfficiencyByStartEndDate() {
  return createSelector([getEmployeeState], state => state.queryEmployeeReportEfficiencyByStartEndDate);
}

// [19/05/2025][#21983][vy_tt]
export function getEmployeeSalaryStatement() {
  return createSelector([getEmployeeState], state => state.employeeSalaryStatement);
}

export function getNVEmployeeSalaryStatement() {
  return createSelector([getEmployeeState], state => state.nvSalaryStatements);
}

export function getBCHEmployeeSalaryStatement() {
  return createSelector([getEmployeeState], state => state.bchSalaryStatements);
}

export function getNVEmployeeSalaryStatementSummary() {
  return createSelector([getEmployeeState], state => state.nvSalaryStatementsSummary);
}

export function getBCHEmployeeSalaryStatementSummary() {
  return createSelector([getEmployeeState], state => state.bchSalaryStatementsSummary);
}

export const selectColumnVisibility = (state: { employee: any }) => 
  state.employee.columnVisibility;

export const selectTableColumnVisibility = (tableKey: string) => 
  (state: { employee: any }) => 
    state.employee.columnVisibility?.[tableKey] || {};