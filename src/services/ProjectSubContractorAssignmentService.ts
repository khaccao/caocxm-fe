import { Observable } from 'rxjs';

import HttpClient from './HttpClient';
import { AccountingFields } from './SubContractorCatalogService';
import { RequestOptions } from './types';

const issueServiceUrl = '/iservice';

export interface ProjectSubContractorAssignmentResponse extends AccountingFields {
  id: number;
  companyId: number;
  projectId: number;
  projectCode?: string | null;
  subContractorTypeId?: number | null;
  subContractorTypeCode: string;
  subContractorTypeName?: string | null;
  contractorCatalogId?: number | null;
  contractorCode: string;
  contractorName: string;
  contractNumber?: string | null;
  contractSignDate?: string | null;
  contractValue?: number | null;
  advanceValue?: number | null;
  plannedStartDate?: string | null;
  actualStartDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  projectRepresentative?: string | null;
  finalSettlementValue?: number | null;
  contractFileUrl?: string | null;
  hasPayments?: boolean;
  paidValue?: number | null;
  status: number;
}

export interface ProjectSubContractorAssignmentPayload extends AccountingFields {
  companyId: number;
  projectId: number;
  projectCode?: string | null;
  subContractorTypeId?: number | null;
  subContractorTypeCode: string;
  subContractorTypeName?: string | null;
  contractorCatalogId?: number | null;
  contractorCode: string;
  contractorName: string;
  contractNumber?: string | null;
  contractSignDate?: string | null;
  contractValue?: number | null;
  advanceValue?: number | null;
  plannedStartDate?: string | null;
  actualStartDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  projectRepresentative?: string | null;
  finalSettlementValue?: number | null;
  contractFileUrl?: string | null;
  status: number;
}

export interface ProjectSubContractorPaymentResponse {
  id: number;
  guid?: string | null;
  assignmentId?: number | null;
  assignmentGuid?: string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  paymentDate?: string | null;
  paymentPeriodCode?: string | null;
  paymentPeriodName?: string | null;
  paymentPeriodDisplayName?: string | null;
  paymentPeriodDetailId?: number | null;
  paymentPeriodDetailGuid?: string | null;
  paymentCatalogCode?: string | null;
  paymentCatalogName?: string | null;
  currentCompletionVolume?: string | null;
  currentCompletionValue: number;
  currentRequestedPaymentValue: number;
  advanceDeduction: number;
  currentActualPaymentValue: number;
  description?: string | null;
  note?: string | null;
  status: number;
  approvalStatus?: number;
  approvalStatusName?: string | null;
  approvalNote?: string | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedByName?: string | null;
  rejectedAt?: string | null;
  accountingStatus?: number;
  accountingAt?: string | null;
  accountingNote?: string | null;
  paidAt?: string | null;
  paidCash?: number | null;
  paidTransfer?: number | null;
  paidOther?: number | null;
  projectCode?: string | null;
  contractorCatalogId?: number | null;
  contractorTypeCode?: string | null;
  contractorCode?: string | null;
  accountingCustomerCode?: string | null;
  contractorName?: string | null;
  contractorFullName?: string | null;
  expenseItemCode?: string | null;
  tkNo?: string | null;
  tkCo?: string | null;
  aContractValue: number;
  bAdvanceValue: number;
  cAccumulatedCompletionValue: number;
  dPreviousAccumulatedCompletionValue: number;
  currentPeriodCompletionValue: number;
  eAccumulatedPaidValue: number;
  previousAccumulatedPaidValue: number;
  fCurrentPaidValue: number;
  gRemainingValue: number;
  hCurrentCompletionVolume?: string | null;
  jDescription?: string | null;
  kProjectCode?: string | null;
}

export interface ProjectSubContractorPaymentPayload {
  assignmentId: number;
  createdBy?: string | null;
  createdDate?: string | null;
  paymentDate?: string | null;
  paymentPeriodCode?: string | null;
  paymentPeriodDetailId?: number | null;
  currentCompletionVolume?: string | null;
  currentCompletionValue?: number | null;
  currentRequestedPaymentValue?: number | null;
  advanceDeduction?: number | null;
  currentActualPaymentValue?: number | null;
  description?: string | null;
  note?: string | null;
  status: number;
}

export interface ProjectSubContractorPaymentApprovalPayload {
  userId?: string | null;
  userName?: string | null;
  note?: string | null;
  paidAt?: string | null;
  paidCash?: number | null;
  paidTransfer?: number | null;
  paidOther?: number | null;
}

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
  expenseItemCode?: string | null;
  note?: string | null;
  note2?: string | null;
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

class ProjectSubContractorAssignmentController {
  public Get = {
    getByProject: (
      companyId: number,
      projectId: number,
      projectCode?: string | null,
      includeInactive: boolean = false,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorAssignmentResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/ProjectSubContractorAssignment/project/${projectId}`, {
        ...options,
        search: {
          ...options?.search,
          companyId,
          ...(projectCode ? { projectCode } : {}),
          includeInactive,
        },
      }),
  };

  public Post = {
    createAssignment: (
      input: ProjectSubContractorAssignmentPayload,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorAssignmentResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/ProjectSubContractorAssignment`, input, options),
  };

  public Put = {
    updateAssignment: (
      id: number,
      input: ProjectSubContractorAssignmentPayload,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorAssignmentResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/ProjectSubContractorAssignment/${id}`, input, options),
  };

  public Delete = {
    removeAssignment: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/ProjectSubContractorAssignment/${id}`, options),
  };

  public Payment = {
    getByAssignment: (assignmentId: number, options?: RequestOptions): Observable<ProjectSubContractorPaymentResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/ProjectSubContractorPayment/assignment/${assignmentId}`, options),
    getByProject: (
      projectId: number,
      projectCode?: string | null,
      paymentTerm?: number | null,
      startDate?: string | null,
      endDate?: string | null,
      paymentPeriodCode?: string | null,
      paymentPeriodDetailId?: number | null,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorPaymentResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/ProjectSubContractorPayment/project/${projectId}`, {
        ...options,
        search: {
          ...options?.search,
          ...(projectCode ? { projectCode } : {}),
          ...(paymentTerm !== undefined && paymentTerm !== null ? { paymentTerm } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(paymentPeriodCode ? { paymentPeriodCode } : {}),
          ...(paymentPeriodDetailId ? { paymentPeriodDetailId } : {}),
        },
      }),
    getApprovedForPaymentPlan: (
      paymentPeriodCode?: string | null,
      startDate?: string | null,
      endDate?: string | null,
      projectCode?: string | null,
      paymentPeriodDetailId?: number | null,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorPaymentResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/ProjectSubContractorPayment/approved`, {
        ...options,
        search: {
          ...options?.search,
          ...(projectCode ? { projectCode } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(paymentPeriodCode ? { paymentPeriodCode } : {}),
          ...(paymentPeriodDetailId ? { paymentPeriodDetailId } : {}),
        },
      }),
    create: (input: ProjectSubContractorPaymentPayload, options?: RequestOptions): Observable<ProjectSubContractorPaymentResponse> =>
      HttpClient.post(`${issueServiceUrl}/api/ProjectSubContractorPayment`, input, options),
    update: (
      id: number,
      input: ProjectSubContractorPaymentPayload,
      options?: RequestOptions,
    ): Observable<ProjectSubContractorPaymentResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/ProjectSubContractorPayment/${id}`, input, options),
    remove: (id: number, options?: RequestOptions) =>
      HttpClient.delete(`${issueServiceUrl}/api/ProjectSubContractorPayment/${id}`, options),
    approve: (id: number, input?: ProjectSubContractorPaymentApprovalPayload, options?: RequestOptions): Observable<ProjectSubContractorPaymentResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/ProjectSubContractorPayment/${id}/approve`, input ?? {}, options),
    reject: (id: number, input?: ProjectSubContractorPaymentApprovalPayload, options?: RequestOptions): Observable<ProjectSubContractorPaymentResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/ProjectSubContractorPayment/${id}/reject`, input ?? {}, options),
    markAccounted: (id: number, input?: ProjectSubContractorPaymentApprovalPayload, options?: RequestOptions): Observable<ProjectSubContractorPaymentResponse> =>
      HttpClient.put(`${issueServiceUrl}/api/ProjectSubContractorPayment/${id}/accounted`, input ?? {}, options),
  };

  public PaymentPeriod = {
    getPeriods: (paymentTerm?: number | null, options?: RequestOptions): Observable<PaymentPeriodResponse[]> =>
      HttpClient.get(`${issueServiceUrl}/api/PaymentPeriod`, {
        ...options,
        search: {
          ...options?.search,
          ...(paymentTerm !== undefined && paymentTerm !== null ? { paymentTerm } : {}),
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
}

export const ProjectSubContractorAssignmentService = new ProjectSubContractorAssignmentController();
