import { catchError, concat, filter, mergeMap, switchMap, withLatestFrom } from 'rxjs';

import { shiftActions } from './shiftSlice';
import { store } from '..';
import { startLoading, stopLoading } from '../loading';
import { hideModal } from '../modal';
import { RootEpic } from '../types';
import { defaultPagingParams, formatTimeOnly } from '@/common/define';
import { ShiftService } from '@/services/ShiftService';
import Utils from '@/utils';

const getShiftsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(shiftActions.getShiftsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { companyId, queryParams } = action.payload;
      const search = { ...defaultPagingParams, ...state.shift.queryParams, ...queryParams };
      return concat(
        [startLoading({ key: 'GetShifts' })],
        ShiftService.Get.getShifts({ search: {...queryParams, companyId: companyId} }).pipe(
          mergeMap(shifts => {
            return [shiftActions.setQueryParams(search), shiftActions.setShifts(shifts)];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [shiftActions.setShifts(undefined)];
          }),
        ),
        [stopLoading({ key: 'GetShifts' })],
      );
    }),
  );
};

const createShiftsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(shiftActions.createShiftRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { shift } = action.payload;
      const shiftData = {
        companyId: shift.companyId,
        startTime: shift.startTime.format(formatTimeOnly),
        endTime: shift.endTime.format(formatTimeOnly),
        code: shift.code ?? '',
        name: shift.name,
      };
      const search = { ...defaultPagingParams, ...state.shift.queryParams };
      return concat(
        [startLoading({ key: 'SaveShifts' })],
        ShiftService.Post.createShift(shiftData).pipe(
          switchMap(() => {
            return ShiftService.Get.getShifts( { search: {...search, companyId: shift.companyId} }).pipe(
              mergeMap(shifts => {
                Utils.successNotification();
                return [
                  shiftActions.setShifts(shifts),
                  shiftActions.setSelectedShift(undefined),
                  hideModal({ key: 'CreateUpdateShiftModal' }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [shiftActions.setShifts([])];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'SaveShifts' })],
      );
    }),
  );
};

const updateShiftsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(shiftActions.updateShiftRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { shiftId, shift } = action.payload;
      const shiftData = {
        companyId: shift.companyId,
        startTime: shift.startTime.format(formatTimeOnly),
        endTime: shift.endTime.format(formatTimeOnly),
        name: shift.name,
        code: shift.code ?? '',
      };
      const search = { ...defaultPagingParams, ...state.shift.queryParams };
      return concat(
        [startLoading({ key: 'SaveShifts' })],
        ShiftService.Put.updateShift(shiftId, shiftData).pipe(
          switchMap(() => {
            return ShiftService.Get.getShifts({ search: {...search, companyId: shift.companyId} }).pipe(
              mergeMap(shifts => {
                Utils.successNotification();
                return [
                  shiftActions.setShifts(shifts),
                  shiftActions.setSelectedShift(undefined),
                  hideModal({ key: 'CreateUpdateShiftModal' }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [shiftActions.setShifts([])];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'SaveShifts' })],
      );
    }),
  );
};

const removeShiftsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(shiftActions.removeShiftsRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { shiftId } = action.payload;
      const search = { ...defaultPagingParams, ...state.shift.queryParams, page: 1 };
      return concat(
        [startLoading({ key: 'SaveShifts' })],
        ShiftService.delete.removeShift(shiftId).pipe(
          switchMap(() => {
            return ShiftService.Get.getShifts({ search: {...search , companyId: store.getState().app.auth.company.id} }).pipe(
              mergeMap(shifts => {
                Utils.successNotification();
                return [
                  shiftActions.setShifts(shifts),
                  shiftActions.setSelectedShift(undefined),
                  hideModal({ key: 'CreateUpdateShiftModal' }),
                ];
              }),
              catchError(errors => {
                Utils.errorHandling(errors);
                return [shiftActions.setShifts([])];
              }),
            );
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'SaveShifts' })],
      );
    }),
  );
};

export const shiftEpics = [getShiftsRequest$, createShiftsRequest$, updateShiftsRequest$, removeShiftsRequest$];
