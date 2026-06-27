import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export interface PaymentPeriodResponse {
  id: number;
  guid?: string | null;
  code?: string | null;
  name?: string | null;
  displayName?: string | null;
  subName1?: string | null;
  subName2?: string | null;
  day1?: number | null;
  month1?: number | null;
  day2?: string | null;
  month2?: number | null;
  note?: string | null;
  note2?: string | null;
}

export interface PaymentPeriodPayload {
  code?: string | null;
  name?: string | null;
  displayName?: string | null;
  subName1?: string | null;
  subName2?: string | null;
  day1?: number | null;
  month1?: number | null;
  day2?: string | null;
  month2?: number | null;
  note?: string | null;
  note2?: string | null;
}

export interface PaymentPeriodCatalogResponse {
  id: number;
  guid?: string | null;
  code?: string | null;
  name?: string | null;
  displayName?: string | null;
  dataGroup?: string | null;
  dateMode?: string | null;
  expenseItemCode?: string | null;
  note?: string | null;
  sortOrder?: number | null;
  status: number;
}

export interface PaymentPeriodCatalogPayload {
  code?: string | null;
  name?: string | null;
  displayName?: string | null;
  dataGroup?: string | null;
  dateMode?: string | null;
  expenseItemCode?: string | null;
  note?: string | null;
  sortOrder?: number | null;
  status: number;
}

export interface PaymentPeriodDetailResponse {
  id: number;
  guid?: string | null;
  periodId: number;
  periodCode: string;
  catalogId: number;
  catalogCode: string;
  catalogName?: string | null;
  displayName?: string | null;
  day1?: number | null;
  month1?: number | null;
  day2?: string | null;
  month2?: number | null;
  expenseItemCode?: string | null;
  note?: string | null;
  sortOrder?: number | null;
  status: number;
}

export interface PaymentPeriodDetailPayload {
  periodId: number;
  catalogId: number;
  displayName?: string | null;
  day1?: number | null;
  month1?: number | null;
  day2?: string | null;
  month2?: number | null;
  expenseItemCode?: string | null;
  note?: string | null;
  sortOrder?: number | null;
  status: number;
}

class PaymentPeriodController {
  public Get = {
    getPeriods: (paymentTerm?: number | null, options?: RequestOptions): Observable<PaymentPeriodResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/PaymentPeriod`, {
        ...options,
        search: {
          ...options?.search,
          ...(paymentTerm !== undefined && paymentTerm !== null ? { paymentTerm } : {}),
        },
      }),
    getCatalogs: (includeInactive = false, options?: RequestOptions): Observable<PaymentPeriodCatalogResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/PaymentPeriod/catalogs`, {
        ...options,
        search: {
          ...options?.search,
          includeInactive,
        },
      }),
    getDetails: (
      periodId: number,
      includeInactive = false,
      options?: RequestOptions,
    ): Observable<PaymentPeriodDetailResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/PaymentPeriod/${periodId}/details`, {
        ...options,
        search: {
          ...options?.search,
          includeInactive,
        },
      }),
  };

  public Post = {
    createPeriod: (input: PaymentPeriodPayload, options?: RequestOptions): Observable<PaymentPeriodResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/PaymentPeriod`, input, options),
    createCatalog: (
      input: PaymentPeriodCatalogPayload,
      options?: RequestOptions,
    ): Observable<PaymentPeriodCatalogResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/PaymentPeriod/catalogs`, input, options),
    createDetail: (
      periodId: number,
      input: PaymentPeriodDetailPayload,
      options?: RequestOptions,
    ): Observable<PaymentPeriodDetailResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/PaymentPeriod/${periodId}/details`, input, options),
  };

  public Put = {
    updatePeriod: (
      id: number,
      input: PaymentPeriodPayload,
      options?: RequestOptions,
    ): Observable<PaymentPeriodResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/PaymentPeriod/${id}`, input, options),
    updateCatalog: (
      id: number,
      input: PaymentPeriodCatalogPayload,
      options?: RequestOptions,
    ): Observable<PaymentPeriodCatalogResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/PaymentPeriod/catalogs/${id}`, input, options),
    updateDetail: (
      id: number,
      input: PaymentPeriodDetailPayload,
      options?: RequestOptions,
    ): Observable<PaymentPeriodDetailResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/PaymentPeriod/details/${id}`, input, options),
  };

  public Delete = {
    removePeriod: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/PaymentPeriod/${id}`, options),
    removeCatalog: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/PaymentPeriod/catalogs/${id}`, options),
    removeDetail: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/PaymentPeriod/details/${id}`, options),
  };
}

export const PaymentPeriodService = new PaymentPeriodController();
