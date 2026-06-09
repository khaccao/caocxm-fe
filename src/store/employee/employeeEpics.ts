/* eslint-disable import/order */
import { catchError, concat, EMPTY, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import {
  CreateUpdateEmployeeModalName,
  defaultPagingParams,
  ePeriodCode,
  FeeTableEmployee,
  GettingEmployeeList,
  IEmployeeFee,
  RemovingEmployee,
  SavingEmployee,
} from '@/common/define';
import { EmployeeService } from '@/services/EmployeeService';
import Utils from '@/utils';
import dayjs from 'dayjs';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { RootEpic } from '../types';
import { employeeActions } from './employeeSlice';

const getEmployeesRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getEmployeesRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, params, paging } = action.payload;
      const search = { ...defaultPagingParams, ...state.employee.queryParams, ...params };
      return concat(
        [startLoading({ key: GettingEmployeeList })],
        EmployeeService.Get.getEmployees(companyId, { search: { ...params, groupCodeOrder: 'BCH' } }).pipe(
          mergeMap(employees => {
            return [employeeActions.setQueryParams(search), employeeActions.setEmployees(employees)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [employeeActions.setEmployees(undefined)];
          }),
        ),
        [stopLoading({ key: GettingEmployeeList })],
      );
    }),
  );
};

const getDanhSachUserRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.getDanhSachUserRequest.match),
    switchMap(action => {
      const { options } = action.payload;
      console.log(options);
      return concat(
        of(startLoading({ key: 'getClientPortTwo' })),
        EmployeeService.Get.getDanhSachUser(options).pipe(
          map(response => {
            return employeeActions.setDanhSachUser(response);
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return EMPTY;
          }),
        ),
        of(stopLoading({ key: 'getClientPortTwo' })),
      );
    }),
  );
};

const createEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.createEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { employee } = action.payload;
      const search = { ...defaultPagingParams, ...state.employee.queryParams };
      return concat(
        [startLoading({ key: SavingEmployee })],
        EmployeeService.Post.createEmployee(employee).pipe(
          switchMap(() => {
            return EmployeeService.Get.getEmployees(employee.companyId, { search }).pipe(
              mergeMap(empResult => {
                Utils.successNotification();
                return [
                  employeeActions.setEmployees(empResult),
                  employeeActions.setSelectedEmployee(undefined),
                  hideModal({ key: CreateUpdateEmployeeModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [employeeActions.setEmployees(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingEmployee })],
      );
    }),
  );
};

const updateEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.updateEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { employeeId, employee } = action.payload;
      const search = { ...defaultPagingParams, ...state.employee.queryParams };
      return concat(
        [startLoading({ key: SavingEmployee })],
        EmployeeService.Put.updateEmployee(employeeId, employee).pipe(
          switchMap(() => {
            return EmployeeService.Get.getEmployees(employee.companyId, { search }).pipe(
              mergeMap(empResult => {
                Utils.successNotification();
                return [
                  employeeActions.setEmployees(empResult),
                  employeeActions.setSelectedEmployee(undefined),
                  hideModal({ key: CreateUpdateEmployeeModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [employeeActions.setEmployees(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: SavingEmployee })],
      );
    }),
  );
};

const removeEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.removeEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { employeeId, companyId, params } = action.payload;
      const search = { ...params, ...state.employee.queryParams };
      return concat(
        [startLoading({ key: RemovingEmployee })],
        EmployeeService.delete.removeEmployee(employeeId).pipe(
          switchMap(() => {
            return EmployeeService.Get.getEmployees(companyId, { search }).pipe(
              mergeMap(empResult => {
                Utils.successNotification('Removed successfully');
                return [
                  employeeActions.getEmployeesRequest({
                    companyId: companyId,
                    params: { ...params, page: params.page, search: undefined },
                  }),
                  employeeActions.setSelectedEmployee(undefined),
                  employeeActions.setQueryParams(search),
                  hideModal({ key: CreateUpdateEmployeeModalName }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [employeeActions.setEmployees(undefined)];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: RemovingEmployee })],
      );
    }),
  );
};

const getEmployeeSalariesPaysRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getEmployeeSalariesPaysRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, body } = action.payload;
      return concat(
        [startLoading({ key: 'getEmployeeSalariesPays' })],
        EmployeeService.Put.getEmployeeSalariesPays(companyId, body).pipe(
          mergeMap(res => {
            return [employeeActions.setEmployeeSalariesPays(res)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [
              employeeActions.setEmployeeSalariesPays(undefined),
            ];
          }),
        ),
        [stopLoading({ key: 'getEmployeeSalariesPays' })],
      );
    }),
  );
};

const updateEmployeeSalariesPaysRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.updateEmployeeSalariesPaysRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, body, bodyGet } = action.payload;
      return concat(
        [startLoading({ key: 'updateEmployeeSalariesPays' })],
        EmployeeService.Put.updateEmployeeSalariesPays(companyId, body).pipe(
          mergeMap(res => {
            return [employeeActions.getEmployeeSalariesPaysRequest({ companyId: companyId, body: bodyGet })];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [
              employeeActions.getEmployeeSalariesPaysRequest({ companyId: companyId, body: bodyGet }),
            ];
          }),
        ),
        [stopLoading({ key: 'updateEmployeeSalariesPays' })],
      );
    }),
  );
};

//  [#20680][dung_lt][12/11/2024] lấy bảng chi phí
const getFeeTableEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getFeeTableEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      //[#20938][hoang_nm][25/11/2024] thêm options vào payload để lấy theo tháng
      const { companyId, options } = action.payload;
      return concat(
        [startLoading({ key: FeeTableEmployee })],
        //[#20938][hoang_nm][25/11/2024] thêm options để api lấy theo tháng
        // [10/12/2024][#21146][phuong_td] lưu QueryFeeParams
        EmployeeService.Get.getFeeTableEmployee(companyId, options).pipe(
          mergeMap(fee => {
            return [employeeActions.setFeeTableEmployee(fee.results), employeeActions.setQueryFeeParams(options)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [
              employeeActions.setFeeTableEmployee(undefined),
              employeeActions.setQueryFeeParams(defaultPagingParams),
            ];
          }),
        ),
        [stopLoading({ key: FeeTableEmployee })],
      );
    }),
  );
};

//  [#20680][dung_lt][12/11/2024] lấy chi phí công đoàn cho các nhân viên
const createFeeTableEmployeeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.createFeeTableEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { feeTable, companyId, datetime } = action.payload;
      return concat(
        [startLoading({ key: FeeTableEmployee })],
        EmployeeService.Post.createFeeTableEmployee(feeTable, datetime).pipe(
          mergeMap(fee => {
            Utils.successNotification();
            // [10/12/2024][#21146][phuong_td] Điều chỉnh truyền thêm tham số params và option khi lấy FeeTableEmployee và danh sách Employees
            return [
              // [20891][dung_lt][20/11/2024] get lại phí công đôàn
              employeeActions.getFeeTableEmployeeRequest({
                companyId: companyId,
                options: state.employee.queryFeeParams,
              }),
              //[#20938][hoang_nm][25/11/2024] get lại dữ liệu nhân viên sau đó ra component UnionDues để map bên ngoài
              employeeActions.getEmployeesRequest({ companyId: companyId, params: state.employee.queryParams }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: FeeTableEmployee })],
      );
    }),
  );
};

//  [#20680][dung_lt][12/11/2024] cập nhật chi phí công đoàn cho nhiều nhân viên, input feeTable là IEmployee[]
const updateFeeTableEmployeeRequest$: RootEpic = (action$, state$) => {
  //[#20938][hoang_nm][25/11/2024] update thêm khi đã có dữ liệu
  return action$.pipe(
    filter(employeeActions.updateFeeTableEmployeeRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { feeTable, options } = action.payload;
      const fee = feeTable[0];
      const newFee = feeTable.filter((f: IEmployeeFee) => f.id !== fee.id);
      return concat(
        [startLoading({ key: FeeTableEmployee })],
        EmployeeService.Put.updateFeeEmployee(fee).pipe(
          mergeMap(fee => {
            if (newFee && newFee.length > 0) {
              //[#20938][hoang_nm][25/11/2024] thêm dữ liệu thì update và get lại
              return [
                employeeActions.updateFeeTableEmployeeRequest({ feeTable: newFee }),
                //[#20938][hoang_nm][25/11/2024] get lại dữ liệu theo tháng ddwcuoj truyền vào trong options
                employeeActions.getFeeTableEmployeeRequest({ companyId: fee.companyId, options }),
              ];
            } else {
              //[#20938][hoang_nm][25/11/2024] không thì get lại
              return [
                //[#20938][hoang_nm][25/11/2024] get lại dữ liệu theo tháng ddwcuoj truyền vào trong options
                employeeActions.getFeeTableEmployeeRequest({ companyId: fee.companyId, options }),
                //[#20938][hoang_nm][25/11/2024] get lại dữ liệu nhân viên sau đó ra component UnionDues để map bên ngoài
                employeeActions.getEmployeesRequest({ companyId: fee.companyId }),
              ];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: FeeTableEmployee })],
      );
    }),
  );
};

const updateFeeEmployeeByMonthRequest$: RootEpic = (action$, state$) => {
  //[#20938][hoang_nm][25/11/2024] update dữ liệu lần đầu theo tháng
  return action$.pipe(
    filter(employeeActions.updateFeeEmployeeByMonthRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, datetime, feeTableMonth, options } = action.payload;
      //[#20938][hoang_nm][25/11/2024] companyid, datetime là tham số api, feeTableMonth dữ liệu update, options truyền thêm để get lại danh sách
      return concat(
        [startLoading({ key: FeeTableEmployee })],
        EmployeeService.Put.updateFeeEmployeeByMonth(companyId, datetime, feeTableMonth).pipe(
          //[#20938][hoang_nm][25/11/2024] truyền tham số và body bvaof để update
          mergeMap(fee => {
            return [
              //[#20938][hoang_nm][25/11/2024]get lại dữ liệu theo tháng ddwcuoj truyền vào trong options
              employeeActions.getFeeTableEmployeeRequest({ companyId: companyId, options }),
              //[#20938][hoang_nm][25/11/2024]get lại dữ liệu nhân viên sau đó map bên ngoài
              employeeActions.getEmployeesRequest({ companyId: companyId }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: FeeTableEmployee })],
      );
    }),
  );
};

const getRank$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.getRanksRequest.match),
    switchMap(action => {
      const { companyId } = action.payload;
      return concat(
        [startLoading({ key: 'getranks' })],
        EmployeeService.Get.getRank(companyId).pipe(
          switchMap(response => {
            return [employeeActions.getRanksSuccess(response)];
          }),
          catchError(error => {
            console.error('Lấy danh sách rank không thành công', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getranks' })],
      );
    }),
  );
};

const getRankByID$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.getRankByIdRequest.match),
    switchMap(action => {
      const { companyId, rankCode } = action.payload;
      return concat(
        [startLoading({ key: 'getranks' })],
        EmployeeService.Get.getRankById(companyId, rankCode).pipe(
          switchMap(response => {
            return [employeeActions.getRankByIdSuccess(response)];
          }),
          catchError(error => {
            console.error('Lấy danh sách theo id không thành công', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getranks' })],
      );
    }),
  );
};

const updateEmployeeID$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.updategetByEmployeeIdRequest.match),
    switchMap(action => {
      const { employeeId, dateTime } = action.payload;
      return concat(
        [startLoading({ key: 'updategetByEmployeeIdRequest' })],
        EmployeeService.Put.updategetByEmployeeId(employeeId, dateTime).pipe(
          switchMap(response => {
            return [employeeActions.updategetByEmployeeIdSuccess(response)];
          }),
          catchError(error => {
            console.error('Lấy danh sách theo cán bộ không thành công', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'updategetByEmployeeIdRequest' })],
      );
    }),
  );
};

const updateEmployee$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.updateEmployeeIdRequest.match),
    switchMap(action => {
      const { companyId, employeeId, dateTime, data } = action.payload;
      return concat(
        [startLoading({ key: 'updateEmployeeIdRequest' })],
        EmployeeService.Put.updateEmployeeId(companyId, employeeId, dateTime, data).pipe(
          switchMap(response => {
            Utils.successNotification('Cập nhật dữ liệu thành công');
            return [employeeActions.updateEmployeeIdSuccess(response)];
          }),
          catchError(error => {
            console.error('Lấy danh sách theo không thành công', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'updateEmployeeIdRequest' })],
      );
    }),
  );
};

//[implement #22092]
const getEmployeeReportEfficiencyByStartEndDate$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getEmployeeReportEfficiencyByStartEndDateRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { companyId, body, params } = action.payload;
      return concat(
        EmployeeService.Put.getEmployeeReportEfficiencyByStartEndDate(companyId, [...body], { search: { ...params } }).pipe(
          switchMap(result => {
            return [
              employeeActions.setEmployeeReportEfficiencyByStartEndDate(result),
              employeeActions.setQueryEmployeeReportEfficiencyByStartEndDate(action.payload),
            ];
          }),
          catchError(error => {
            return [
              employeeActions.setEmployeeReportEfficiencyByStartEndDate([]),
              employeeActions.setQueryEmployeeReportEfficiencyByStartEndDate(action.payload),
            ];
          }),
        ),
      );
    }),
  );
};

// [20/05/2025][#21983][vy_tt] lấy bảng lương
const getEmployeeSalaryStatement$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getEmployeeSalaryStatementRequest.match),
    switchMap(action => {
      const { companyId, body, params, group } = action.payload;
      return concat(
        of(startLoading({ key: 'getEmployeeSalaryStatement' })),
        EmployeeService.Put.getEmployeeSalaryStatement(companyId, body, { search: { ...params } })
          .pipe(
            mergeMap(result => [
              employeeActions.setEmployeeSalaryStatement({ data: result, group }),
              stopLoading({ key: 'getEmployeeSalaryStatement' }),
            ]),
            catchError(error => of(
              employeeActions.setEmployeeSalaryStatement({ data: [], group }),
              stopLoading({ key: 'getEmployeeSalaryStatement' }),
            )),
          )
      );
    }),
  );
};

const updateEmployeeSalaryStatement$: RootEpic = action$ => {
  return action$.pipe(
    filter(employeeActions.updateEmployeeSalaryStatementRequest.match),
    switchMap(action => {
      const { body, params } = action.payload;
      console.log('body updateEmployeeSalaryStatement action.payload:', body);
      return concat(
        [startLoading({ key: 'updateEmployeeSalaryStatementRequest' })],
        EmployeeService.Put.updateEmployeeSalaryStatement(body, { search: { ...params } }).pipe(
          switchMap(response => {
            Utils.successNotification('Lưu thành công');
            return [employeeActions.updateEmployeeSalaryStatementSuccess(response)];
          }),
          catchError(error => {
            console.error('Update bảng lương không thành công', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'updateEmployeeSalaryStatementRequest' })],
      );
    }),
  );
};

// [24/05/2025][#22614][vy_tt] lấy tổng hợp lương
const getEmployeeSalaryStatementSummary$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.getEmployeeSalaryStatementSummaryRequest.match),
    mergeMap(action => {
      const { companyId, body, params, group } = action.payload;
      return concat(
        of(startLoading({ key: 'getEmployeeSalaryStatementSummary' })),
        EmployeeService.Put.getEmployeeSalaryStatementSummary(companyId, body, { search: { ...params } }).pipe(
          mergeMap(result => [
            employeeActions.setEmployeeSalaryStatementSummary({ data: result, group }),
            stopLoading({ key: 'getEmployeeSalaryStatementSummary' }),
          ]),
          catchError(error =>
            of(
              employeeActions.setEmployeeSalaryStatementSummary({ data: [], group }),
              stopLoading({ key: 'getEmployeeSalaryStatementSummary' }),
            ),
          ),
        ),
      );
    }),
  );
};
const updatePerSalaryRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(employeeActions.updatePerSalary.match),
    mergeMap(action => {
      const { companyId, periodCode, body, workingDay } = action.payload;
      return concat(
        of(startLoading({ key: 'updatePerSalary' })),
        EmployeeService.Post.getPerSalary(companyId, periodCode, body, workingDay).pipe(
          mergeMap(result => {
            Utils.successNotification('Cập nhật dữ liệu thành công');
            return [
              employeeActions.getEmployeeSalaryStatementRequest({
                companyId: companyId,
                body,
                params: { workingDay: workingDay, periodCode, type: periodCode === ePeriodCode.PERIODCODEBCH ? 1 : 0 },
                group: periodCode === ePeriodCode.PERIODCODEBCH ? 'BCH' : 'NV',
              }),
              stopLoading({ key: 'updatePerSalary' }),
            ]
          }),
          catchError(error => {
            console.error('Cập nhật dữ liệu không thành công', error);
            return [];
          }),
        ),
      );
    }),
  );
}
export const employeeEpics = [
  getEmployeeSalariesPaysRequest$,
  updateEmployeeSalariesPaysRequest$,
  updateEmployee$,
  updateEmployeeID$,
  getRankByID$,
  getRank$,
  getDanhSachUserRequest$,
  getEmployeesRequest$,
  getFeeTableEmployeeRequest$,
  createEmployeeRequest$,
  createFeeTableEmployeeRequest$,
  updateEmployeeRequest$,
  updateFeeTableEmployeeRequest$,
  updateFeeEmployeeByMonthRequest$,
  removeEmployeeRequest$,
  getEmployeeReportEfficiencyByStartEndDate$,
  getEmployeeSalaryStatement$,
  updateEmployeeSalaryStatement$,
  getEmployeeSalaryStatementSummary$,
  updatePerSalaryRequest$
];
