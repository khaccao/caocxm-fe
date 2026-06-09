import { Observable } from 'rxjs';

import { DanhSachUserResponse } from './EmployeeService';
/* eslint-disable import/order */
import { EmployeesByCompanyId } from '@/common/project';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { identityUrl, oAuthConfig, apiUrl,accountingInvoiceURL } = getEnvVars();

// eslint-disable-next-line
const getLoginData = (inputValues: any) => {
  const formData: any = {
    grant_type: 'password',
    scope: oAuthConfig.scope,
    client_id: oAuthConfig.clientId,
    ...inputValues,
  };

  if (oAuthConfig.clientSecret) formData['client_secret'] = oAuthConfig.clientSecret;

  // prettier-ignore
  return Object.entries(formData).map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`).join('&');
};

class IdentityController {
  public Get = {
    getCaptchaByEmail: (email: string, options?: RequestOptions) => {
      return HttpClient.get(`${identityUrl}/identity/clients/captcha/${email}`, options);
    },
    getbyContact: (phone: string, email: string): Observable<EmployeesByCompanyId> => {
      return HttpClient.get(`${apiUrl}/api/Employee/getbyContact?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`);
    },
    getDanhSachUser: ( userName: string, options?: RequestOptions) : Observable<DanhSachUserResponse[]> =>{
      return HttpClient.get(`${accountingInvoiceURL}/api/GetDanhSachUser?userName=${encodeURIComponent(userName)}`, options);
    },
  }

  public Post = {
    login: (inputValues: any, options?: RequestOptions) => {
      const loginData = getLoginData(inputValues);
      const customOptions: RequestOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      return HttpClient.post(`${identityUrl}/connect/token`, loginData, customOptions);
    },
  };
}

export const IdentityService = new IdentityController();
