/* eslint-disable import/order */
import { catchError, concat, filter, switchMap, withLatestFrom } from "rxjs";

import { SalaryAdvance } from "@/common/define";
import { SalaryService } from "@/services/SalaryService";
import Utils from "@/utils";
import { startLoading, stopLoading } from "../loading";
import { RootEpic } from "../types";
import { salaryActions } from "./salarySlice";

function formatDateString(dateStr: string): string {
    const parts = dateStr.split('_');
    if (parts.length === 3) {
        const [month, , year] = parts;
        return `${month}_${year}`;
    }
    throw new Error('Invalid date format. Expected format: MM_DD_YYYY');
}

const getSalarys$: RootEpic = action$ => {
    return action$.pipe(
        filter(salaryActions.getSalarysRequest.match),
        switchMap(action => {
            const options = { search: { ...action.payload } };
            console.log('options ', options);
            return concat(
                [startLoading({ key: SalaryAdvance.getSalarys })],
                SalaryService.Get.getSalarys(options).pipe(
                    switchMap(response => {
                        // [13/01/2025][#21283][phuong_td] sửa data lấy từ results
                        return [salaryActions.setSalarys(response.results), salaryActions.setSalarysParams(action.payload)];
                    }),
                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.setSalarys([]), salaryActions.setSalarysParams(action.payload)];
                    }),
                ),
                [stopLoading({ key: SalaryAdvance.getSalarys })],
            );
        }),
    );
};

const getSalarysById$: RootEpic = action$ => {
    return action$.pipe(
        filter(salaryActions.getSalaryByIdRequest.match),
        switchMap(action => {
            const { id } = action.payload;
            return concat(
                [startLoading({ key: SalaryAdvance.getSalarysById })],
                SalaryService.Get.getSalaryById(id).pipe(
                    switchMap(result => {
                        return [salaryActions.setSalaryById(result), salaryActions.setSalarysByIdParams(action.payload)];
                    }),
                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.setSalaryById(undefined), salaryActions.setSalarysByIdParams(action.payload)];
                    }),
                ),
                [stopLoading({ key: SalaryAdvance.getSalarysById })],
            );
        }),
    );
};

const createSalary$: RootEpic = (action$, state$) => {
    return action$.pipe(
        filter(salaryActions.createSalaryRequest.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const { data } = action.payload;
            return concat(
                [startLoading({ key: SalaryAdvance.createSalary })],
                SalaryService.Post.createSalary(data).pipe(
                    switchMap(result => {
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                ),
                [stopLoading({ key: SalaryAdvance.createSalary })],
            );
        }),
    );
};

const updateSalary$: RootEpic = (action$, state$) => {
    return action$.pipe(
        filter(salaryActions.updateSalaryRequest.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const { data, id } = action.payload;
            return concat(
                [startLoading({ key: 'updateLabel' })],
                SalaryService.Put.updateSalary(id, data, {}).pipe(
                    switchMap(response => {
                        Utils.successNotification();
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                ),
                [stopLoading({ key: 'updateLabel' })],
            );
        }),
    );
};

const updateSalarys$: RootEpic = (action$, state$) => {
    return action$.pipe(
        filter(salaryActions.updateSalarysRequest.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const { data, companyId, dateTime } = action.payload;
            return concat(
                [startLoading({ key: SalaryAdvance.updateSalarys })],
                SalaryService.Post.updateSalarys(data, { search: { companyId, dateTime } }).pipe(
                    switchMap(result => {
                        Utils.successNotification();
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                ),
                [stopLoading({ key: SalaryAdvance.updateSalarys })],
            );
        }),
    );
};

const deleteSalarys$: RootEpic = (action$, state$) => {
    return action$.pipe(
        filter(salaryActions.deleteSalarysRequest.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const { id } = action.payload;
            return concat(
                [startLoading({ key: SalaryAdvance.deleteSalarys })],
                SalaryService.Delete.removeSalary(id).pipe(
                    switchMap(() => {
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                    catchError(errors => {
                        Utils.errorHandling(errors);
                        return [];
                    }),
                ),
                [stopLoading({ key: SalaryAdvance.deleteSalarys })],
            );
        }),
    );
};

const exportSalarys$: RootEpic = (action$, state$) => {
    return action$.pipe(
        filter(salaryActions.exportSalariesRequest.match),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const { companyId, dateTime, period, rows } = action.payload;
            return concat(
                [startLoading({ key: SalaryAdvance.exportSalarys })],
                SalaryService.Post.exportExcel(companyId, dateTime, period, rows).pipe(
                    switchMap((result: Blob) => {
                        // Hiển thị thông báo thành công
                        Utils.successNotification('Đã xuất file thành công.');
                        const firstPeriod = 'ngày 12';
                        const secondPeriod = 'ngày 27';

                        const fileName =
                          period === 1
                            ? `Ứng lương ${firstPeriod} ${dateTime}.xlsx`
                            : `Ứng lương ${secondPeriod} ${dateTime}.xlsx`;

                        const url = window.URL.createObjectURL(result);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();

                        // Cleanup
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),

                    catchError(error => {
                        Utils.errorHandling(error);
                        return [salaryActions.getSalarysRequest({ ...state.salary.salarysParams })];
                    }),
                ),
                
                [stopLoading({ key: SalaryAdvance.exportSalarys })],
            );
        }),
    );
};

export const salaryEpics = [getSalarys$, createSalary$, updateSalary$, updateSalarys$, getSalarysById$, deleteSalarys$, exportSalarys$];
