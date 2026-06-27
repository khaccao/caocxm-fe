import { PagingResponse } from '@/common/define';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export enum UnionExpenseProposalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface UnionExpenseProposal {
  id: number;
  companyId: number;
  code: string;
  expenseDate: string;
  title: string;
  description?: string;
  amount: number;
  status: UnionExpenseProposalStatus;
  rejectReason?: string;
  proposerUserId?: string;
  proposerName?: string;
  submittedAt?: string;
  approverUserId?: string;
  approverName?: string;
  approvedAt?: string;
  createdDate: string;
  modifiedDate?: string;
}

export interface UnionExpenseProposalPagingResponse extends PagingResponse {
  results: UnionExpenseProposal[];
}

export interface UnionExpenseFundSummary {
  companyId: number;
  startDate: string;
  endDate: string;
  totalCollected: number;
  approvedExpense: number;
  pendingExpense: number;
  rejectedExpense: number;
  balance: number;
}

export interface UnionExpenseProposalInput {
  companyId: number;
  expenseDate: string;
  title: string;
  description?: string;
  amount: number;
  approverUserId?: string;
  approverName?: string;
}

class UnionExpenseProposalService {
  public Get = {
    getByCompanyId: (companyId: number, status?: number, options?: RequestOptions) => {
      return HttpClient.get(`${issueServiceUrl}/UnionExpenseProposal/getByCompanyId/${companyId}`, {
        ...options,
        search: {
          ...options?.search,
          ...(status !== undefined ? { status } : {}),
          _t: Date.now(),
        },
      });
    },
    getFundSummary: (companyId: number, startDate: string, endDate: string, options?: RequestOptions) => {
      return HttpClient.get(`${issueServiceUrl}/UnionExpenseProposal/fundSummary/${companyId}`, {
        ...options,
        search: {
          ...options?.search,
          startDate,
          endDate,
          _t: Date.now(),
        },
      });
    },
  };

  public Post = {
    create: (input: UnionExpenseProposalInput, options?: RequestOptions) => {
      return HttpClient.post(`${issueServiceUrl}/UnionExpenseProposal`, input, options);
    },
    approve: (id: number, options?: RequestOptions) => {
      return HttpClient.post(`${issueServiceUrl}/UnionExpenseProposal/${id}/approve`, undefined, options);
    },
    reject: (id: number, rejectReason: string, options?: RequestOptions) => {
      return HttpClient.post(`${issueServiceUrl}/UnionExpenseProposal/${id}/reject`, { rejectReason }, options);
    },
  };

  public Put = {
    update: (id: number, input: UnionExpenseProposalInput, options?: RequestOptions) => {
      return HttpClient.put(`${issueServiceUrl}/UnionExpenseProposal/${id}`, input, options);
    },
  };

  public Delete = {
    delete: (id: number, options?: RequestOptions) => {
      return HttpClient.delete(`${issueServiceUrl}/UnionExpenseProposal/${id}`, options);
    },
  };
}

export default new UnionExpenseProposalService();
