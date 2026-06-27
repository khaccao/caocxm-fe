import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export interface AccountingFields {
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
}

export interface SubContractorCatalogResponse extends AccountingFields {
  id: number;
  companyId: number;
  subContractorTypeId?: number | null;
  subContractorTypeCode?: string | null;
  subContractorTypeName?: string | null;
  code: string;
  name: string;
  fullName?: string | null;
  taxCode?: string | null;
  representative?: string | null;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  status: number;
  customerType?: number | null;
}

export interface SubContractorCatalogPayload extends AccountingFields {
  companyId: number;
  subContractorTypeId?: number | null;
  subContractorTypeCode?: string | null;
  subContractorTypeName?: string | null;
  code: string;
  name: string;
  fullName?: string | null;
  taxCode?: string | null;
  representative?: string | null;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  status: number;
  customerType?: number | null;
}

export interface AccountingObjectOption {
  value: string;
  code: string;
  name: string;
  label: string;
  customerType: number;
}

export interface AccountingObjectQuery {
  customerType?: number | null;
  customerCode?: string | null;
  customerName?: string | null;
  otherFilter?: string | number | null;
}

export interface TaxCodeLookupResponse {
  taxCode?: string | null;
  taxCodeId?: string | null;
  companyName?: string | null;
  address?: string | null;
  taxProvince?: string | null;
  taxAuthority?: string | null;
  representative?: string | null;
  establishedDate?: string | null;
  status?: string | null;
  statusName?: string | null;
}

class SubContractorCatalogController {
  public Get = {
    getCatalogs: (
      companyId: number,
      search?: string,
      includeInactive: boolean = false,
      options?: RequestOptions,
    ): Observable<SubContractorCatalogResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/SubContractorCatalog`, {
        ...options,
        search: {
          ...options?.search,
          companyId,
          includeInactive,
          ...(search ? { search } : {}),
        },
      }),

    getAccountingObjects: (
      query: number | AccountingObjectQuery = {},
      options?: RequestOptions,
    ): Observable<AccountingObjectOption[]> => {
      const search = typeof query === 'number'
        ? { customerType: query }
        : {
          ...(query.customerType !== undefined && query.customerType !== null ? { customerType: query.customerType } : {}),
          ...(query.customerCode ? { customerCode: query.customerCode } : {}),
          ...(query.customerName ? { customerName: query.customerName } : {}),
          ...(query.otherFilter !== undefined && query.otherFilter !== null && `${query.otherFilter}` !== ''
            ? { otherFilter: query.otherFilter }
            : {}),
        };

      return (
      HttpClient.get(`${issueServiceUrl}/api/SubContractorCatalog/accounting-objects`, {
        ...options,
        search: {
          ...options?.search,
          ...search,
        },
      })
      );
    },

    lookupTaxCode: (tax: string, options?: RequestOptions): Observable<TaxCodeLookupResponse> =>
      HttpClient.get(`${issueServiceUrl}/api/SubContractorCatalog/tax-code`, {
        ...options,
        search: {
          ...options?.search,
          tax,
        },
      }),
  };

  public Post = {
    createCatalog: (
      input: SubContractorCatalogPayload,
      options?: RequestOptions,
    ): Observable<SubContractorCatalogResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/SubContractorCatalog`, input, options),
  };

  public Put = {
    updateCatalog: (
      id: number,
      input: SubContractorCatalogPayload,
      options?: RequestOptions,
    ): Observable<SubContractorCatalogResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/SubContractorCatalog/${id}`, input, options),
  };

  public Delete = {
    removeCatalog: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/SubContractorCatalog/${id}`, options),
  };
}

export const SubContractorCatalogService = new SubContractorCatalogController();
