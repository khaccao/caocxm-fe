/* eslint-disable import/order */
import { jwtDecode } from 'jwt-decode';
import { catchError, concat, EMPTY, filter, finalize, map, of, switchMap } from 'rxjs';

import { JwtDecoded } from '@/common/define';
import { setToken } from '@/services/HttpClient';
import { IdentityService } from '@/services/IdentityService';
import { UserService } from '@/services/UserService';
import Utils from '@/utils';
import { startLoading, stopLoading } from '../loading';
import { RootEpic } from '../types';
import { userActions } from '../user';
import { appActions } from './appSlice';

const loginRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(appActions.loginRequest.match),
    switchMap(action => {
      const { input, callback } = action.payload;
      let success = false;
      return concat(
        [startLoading({ key: 'login' })],
        IdentityService.Post.login(input).pipe(
          switchMap(loginResponse => {
            if (loginResponse.errorCode) {
              Utils.errorHandling(loginResponse);
              return [stopLoading({ key: 'login' })];
            }
            success = true;
            const decoded: JwtDecoded = jwtDecode(loginResponse.access_token);
            const user = JSON.parse(decoded.profile);
            console.log('user', user);
            if (input.password) {
              // lấy user prefences ngay sau khi đăng nhập thành công
              setToken(loginResponse.access_token);
              return UserService.Get.getUserPreferences().pipe(
                switchMap(preferences => {
                  return [
                    appActions.loginSuccess({ loginResponse, loginData: input }),
                    userActions.setUserPreferences(preferences),
                    appActions.getEmployeeByContactRequest({
                      phone: user.PhoneNumber,
                      email: user.Email,
                    }),
                  ];
                }),
                catchError(() => {
                  return [
                    appActions.loginSuccess({ loginResponse, loginData: input }),
                    userActions.setUserPreferences(undefined),
                    appActions.getEmployeeByContactRequest({
                      phone: user.PhoneNumber,
                      email: user.Email,
                    }),
                  ];
                }),
              );
            }
            return [
              appActions.loginSuccess({ loginResponse, loginData: input }),
              userActions.getCurrentConfigRequest(),
              appActions.getEmployeeByContactRequest({
                phone: user.PhoneNumber,
                email: user.Email,
              }),
            ];
          }),
          catchError(error => {
            // if (error.response?.CaptchaId && !input.captcha) {
            //   const { CaptchaId, Captcha } = error.response;
            //   return [appActions.setCaptcha({ CaptchaId, Captcha }), stopLoading({ key: 'login' })];
            // }
            Utils.errorHandling(error);
            if (error.response) {
              const { CaptchaId, Captcha } = error.response;
              if (CaptchaId) {
                return [appActions.setCaptcha({ CaptchaId, Captcha }), stopLoading({ key: 'login' })];
              }
            }
            return [];
          }),
          finalize(() => {
            if (success && callback) {
              callback();
            }
          }),
          ),
          [stopLoading({ key: 'login' })],
      );
    }),
  );
};
const getUserIISRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(appActions.getUserIISRequest.match),
    switchMap(action => {
      const { userName } = action.payload;
      console.log(userName);
      return concat(
        of(startLoading({ key: 'getUserIIS' })),
        IdentityService.Get.getDanhSachUser(userName).pipe(
          map(response => {
            return appActions.setDanhSachUser(response);
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return EMPTY;
          }),
        ),
        of(stopLoading({ key: 'getUserIIS' })),
      );
    }),
  );
};

const getEmployeeByContactRequest$: RootEpic = action$ => {
  return action$.pipe(
    filter(appActions.getEmployeeByContactRequest.match),
    switchMap(action => {
      const { phone, email } = action.payload;
      console.log(phone, email);
      return concat(
        of(startLoading({ key: 'getEmployeeByContact' })),
        IdentityService.Get.getbyContact(phone, email).pipe(
          switchMap(response => {
            const employee = response;
            if (!employee || !employee.employIdConnect) {
              // Nếu employee bị undefined, không thực hiện hành động gì
              return [appActions.setEmployeeDetails(response), stopLoading({ key: 'getEmployeeByContact' })];
            }
            return [
              appActions.setEmployeeDetails(response),
              appActions.getUserIISRequest({ userName: employee.employIdConnect }),
              stopLoading({ key: 'getEmployeeByContact' }),
            ];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return EMPTY;
          }),
        ),
        of(stopLoading({ key: 'getEmployeeByContact' })),
      );
    }),
  );
};
const getCaptcha$: RootEpic = action$ => {
  return action$.pipe(
    filter(appActions.getCaptcha.match),
    switchMap(action => {
      return concat(
        [startLoading({ key: 'GetCaptcha' })],
        IdentityService.Get.getCaptchaByEmail(action.payload).pipe(
          switchMap(captcha => {
            return [appActions.setCaptcha(captcha)];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [];
          }),
        ),
        [stopLoading({ key: 'GetCaptcha' })],
      );
    }),
  );
};

export const appEpics = [loginRequest$, getCaptcha$, getUserIISRequest$, getEmployeeByContactRequest$];
