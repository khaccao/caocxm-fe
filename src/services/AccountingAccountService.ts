import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export interface AccountingAccountOption {
  value: string;
  code: string;
  name: string;
  label: string;
  posting?: boolean;
  level?: number;
  parentCode?: string | null;
}

export interface AccountingExpenseItemOption {
  value: string;
  code: string;
  name: string;
  label: string;
}

export interface AccountingWorkItemOption {
  value: string;
  code: string;
  name: string;
  label: string;
}

class AccountingAccountController {
  public Get = {
    getAccounts: (keyword?: string, options?: RequestOptions): Observable<AccountingAccountOption[]> =>
      HttpClient.get(`${issueServiceUrl}/api/AccountingAccount`, {
        ...options,
        search: {
          ...options?.search,
          ...(keyword ? { keyword } : {}),
        },
      }),
    getExpenseItems: (keyword?: string, options?: RequestOptions): Observable<AccountingExpenseItemOption[]> =>
      HttpClient.get(`${issueServiceUrl}/api/AccountingAccount/expense-items`, {
        ...options,
        search: {
          ...options?.search,
          ...(keyword ? { keyword } : {}),
        },
      }),
    getWorkItems: (keyword?: string, options?: RequestOptions): Observable<AccountingWorkItemOption[]> =>
      HttpClient.get(`${issueServiceUrl}/api/AccountingAccount/work-items`, {
        ...options,
        search: {
          ...options?.search,
          ...(keyword ? { keyword } : {}),
        },
      }),
  };
}

export const AccountingAccountService = new AccountingAccountController();
