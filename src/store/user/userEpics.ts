import { catchError, concat, filter, switchMap, withLatestFrom } from 'rxjs';

import { userActions } from '.';
import { UserService } from '@/services/UserService';
import { startLoading, stopLoading } from '@/store/loading';
import { RootEpic } from '@/store/types';
import Utils from '@/utils';

const getUserPreferences$: RootEpic = action$ => {
  return action$.pipe(
    filter(userActions.getUserPreferences.match),
    switchMap(() => {
      return concat(
        [startLoading({ key: 'GetUserPreferences' })],
        UserService.Get.getUserPreferences().pipe(
          switchMap(preferences => {
            return [userActions.setUserPreferences(preferences)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [userActions.setFetchingPreferences(false), stopLoading({ key: 'GetUserPreferences' })],
      );
    }),
  );
};

const getCurrentUser$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(userActions.getCurrentUser.match),
    withLatestFrom(state$),
    switchMap(([_, state]) => {
      const { auth } = state.app;
      if (!auth) {
        return [];
      }
      const { Email } = auth.user;
      return concat(
        [startLoading({ key: 'GetMe' })],
        UserService.Get.getUserByEmail(Email).pipe(
          switchMap(me => {
            return [userActions.setMe(me)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'GetMe' })],
      );
    }),
  );
};

const getUserOrganizations$: RootEpic = action$ => {
  return action$.pipe(
    filter(userActions.getOrganizations.match),
    switchMap(() => {
      return concat(
        [startLoading({ key: 'GetUserOrganizations' })],
        UserService.Get.getOrganizations().pipe(
          switchMap(organizations => {
            return [userActions.setOrganizations(organizations)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'GetUserOrganizations' })],
      );
    }),
  );
};

const getCurrentConfig$: RootEpic = action$ => {
  return action$.pipe(
    filter(userActions.getCurrentConfigRequest.match),
    switchMap(() => {
      return concat(
        [startLoading({ key: 'getCurrentConfig' })],
        UserService.Get.getCurrentConfig().pipe(
          switchMap(organizations => {
            return [userActions.setCurrentConfig(organizations)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'getCurrentConfig' })],
      );
    }),
  );
};

const createUserPreferences$: RootEpic = action$ => {
  return action$.pipe(
    filter(userActions.createUserPreferencesRequest.match),
    switchMap(action => {
      const data = action.payload;
      return concat(
        [startLoading({ key: 'createUserPreferences' })],
        UserService.Post.createUserPreferences(data).pipe(
          switchMap(result => {
            // Utils.successNotification(result);
            return [];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'createUserPreferences' })],
      );
    }),
  );
};


//[#20926][hoang_nm][26/11/2024] Epic cập nhật mật khẩu
const updateUser$: RootEpic = action$ => {
  return action$.pipe(
    filter(userActions.updateUser.match),
    switchMap(action => {
      const { oldPassword, newPassword } = action.payload;
      return concat(
        [startLoading({ key: 'UpdateUser' })],
        UserService.Put.updateUsers({ oldPassword, newPassword }).pipe(
          switchMap(result => {
            // Utils.successNotification('Cập nhật mật khẩu thành công!');
            return [userActions.setUserPreferences(result)];
          }),
          catchError(error => {
            //[#20926][hoang_nm][26/11/2024] server đang lỗi, check lỗi 500 -> thông báo thành công
            if (error.status === 500) {
              Utils.successNotification('Cập nhật mật khẩu thành công!');
            }
            //[#20992][hoang_nm][28/11/2024] Lưu lỗi lại vào redux
            return [userActions.setErrorPassword(error)];
          }),
        ),
        [stopLoading({ key: 'UpdateUser' })],
      );
    }),
  );
};


export const userEpics = [
  getUserPreferences$,
  getCurrentUser$,
  getUserOrganizations$,
  getCurrentConfig$,
  createUserPreferences$,
  updateUser$,
];
