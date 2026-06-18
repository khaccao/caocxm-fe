import { Observable } from 'rxjs';

import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();

export interface SubContractorTypeResponse {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  status: number;
}

export interface SubContractorTypePayload {
  companyId: number;
  code: string;
  name: string;
  description?: string | null;
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
      HttpClient.get(`${apiUrl}/api/SubContractorType`, {
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
      HttpClient.get(`${apiUrl}/api/SubContractorType/import-template`, {
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
      HttpClient.post(`${apiUrl}/api/SubContractorType`, input, options),
  };

  public Put = {
    updateType: (
      id: number,
      input: SubContractorTypePayload,
      options?: RequestOptions,
    ): Observable<SubContractorTypeResponse> =>
      HttpClient.put(`${apiUrl}/api/SubContractorType/${id}`, input, options),
  };

  public Delete = {
    removeType: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${apiUrl}/api/SubContractorType/${id}`, options),
  };
}

export const SubContractorTypeService = new SubContractorTypeController();
