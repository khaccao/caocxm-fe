import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export interface SubContractorTypeResponse {
  id: number;
  companyId: number;
  code: string;
  name: string;
  fullName?: string | null;
  description?: string | null;
  accountingObjectCode?: string | null;
  expenseItemCode?: string | null;
  workItemCode?: string | null;
  contractCode?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  debitAccount1?: string | null;
  creditAccount1?: string | null;
  debitAccount2?: string | null;
  creditAccount2?: string | null;
  debitAccount3?: string | null;
  creditAccount3?: string | null;
  note?: string | null;
  sortOrder: number;
  status: number;
}

export interface SubContractorTypePayload {
  companyId: number;
  code: string;
  name: string;
  fullName?: string | null;
  description?: string | null;
  accountingObjectCode?: string | null;
  expenseItemCode?: string | null;
  workItemCode?: string | null;
  contractCode?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  debitAccount1?: string | null;
  creditAccount1?: string | null;
  debitAccount2?: string | null;
  creditAccount2?: string | null;
  debitAccount3?: string | null;
  creditAccount3?: string | null;
  note?: string | null;
  sortOrder: number;
  status: number;
}

class SubContractorTypeController {
  public Get = {
    getTypes: (
      companyId: number,
      search?: string,
      includeInactive: boolean = false,
      options?: RequestOptions,
    ): Observable<SubContractorTypeResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/SubContractorType`, {
        ...options,
        search: {
          ...options?.search,
          companyId,
          includeInactive,
          ...(search ? { search } : {}),
        },
      }),

    downloadImportTemplate: (
      companyId: number,
      options?: RequestOptions,
    ): Observable<Blob> =>
      HttpClient.get(`${issueServiceUrl}/api/SubContractorType/import-template`, {
        ...options,
        responseType: 'blob',
        search: {
          ...options?.search,
          companyId,
        },
      }),
  };

  public Post = {
    createType: (
      input: SubContractorTypePayload,
      options?: RequestOptions,
    ): Observable<SubContractorTypeResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/SubContractorType`, input, options),
  };

  public Put = {
    updateType: (
      id: number,
      input: SubContractorTypePayload,
      options?: RequestOptions,
    ): Observable<SubContractorTypeResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/SubContractorType/${id}`, input, options),
  };

  public Delete = {
    removeType: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/SubContractorType/${id}`, options),
  };
}

export const SubContractorTypeService = new SubContractorTypeController();
