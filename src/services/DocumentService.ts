/* eslint-disable import/order */
import { IBudgetEstimateByProjectResult } from '@/common/define';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();

export interface DocumentOwnerResponse {
  id: string;
  email: string | null;
  icon: string | null;
  name: string | null;
}

export interface DocumentPagingResponse {
  page: number;
  pageCount: number;
  pageSize: number;
  queryCount: number;
  firstRowIndex: number;
  lastRowIndex: number;
  results: DocumentResponse[];
}

export interface DocumentResponse {
  id: string;
  cloudLink: string | null;
  typeStorage: string | null;
  clientId: string;
  createDate: string | null;
  lastModified: string | null;
  owner: null;
  fileId: string;
  name: string | null;
  type: string | null;
  jsonContent: string | null;
  isPublish: boolean;
  parentId: string | null;
  version: number;
  size: number;
}

export interface CreateDocumentPayload {
  parentId: number;
  projectId: number;
  categoryId: number;
  subject: string;
  description: string;
  createdById: number;
  supervisorId: number;
  priority: number;
  status: number;
  type: number;
  estimatedTime: number;
  startDate: string;
  dueDate: string;
}


class DocumentController {
  CreateLabel(CreateLabel: any) {
    throw new Error('Method not implemented.');
  }
  public Get = {
    getDocumentsByProjectId: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/project/${projectId}`, options);
    },
    getFolderRootId: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/getFolderRootId/${projectId}`, options);
    },
    getBudgetEstimateByProject: (companyId: number, projectId: number, paymentTerm: number, baseDate: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/BudgetEstimate/getBudgetEstimateByProject/${companyId}/${projectId}?paymentTerm=${paymentTerm}&baseDate=${baseDate}`, options);
    },
    downloadFile: (documentId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/downloadFile/${documentId}`, {
        ...options,
        headers: {
          ...options?.headers,
        },
        responseType: 'blob',
      });
    },
    getFileFromId: (documentId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Document/downloadFile/${documentId}`, {
        ...options,
        headers: {
          ...options?.headers,
        },
        responseType: 'blob',

      });
    },
  };

  public Post = {
    getFilesByDocumentIds: (ids: string[], options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Document/files`, ids, options);
    },
    createDocument: (body: FormData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Document`, body, options);
    },
    uploadFiles: (body: FormData, setProgress: (progress: any) => void, options?: RequestOptions) => {
      return HttpClient.upload(`${apiUrl}/Document/files/uploads`, setProgress, body, options);
    },
    uploadFileFolder: (companyId: number, labelid: string, body: FormData, options?: RequestOptions) => {
      return HttpClient.post(
        `${apiUrl}/Document/files/uploads?companyId=${companyId}&labelid=${labelid}&isPublish=false`,
        body,
        options,
      );
    },
  };

  public Put = {
    updateDocument: (document: any, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Document`, document, options);
    },
    updateBudgetEstimate: (dataUpdate: IBudgetEstimateByProjectResult[], options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/BudgetEstimate/updates`, dataUpdate, options);
    },
    uploadFilePayment: (
      projectId: number,
      projectCode: any,
      paymentTerm: number,
      paymentTermDate: string,
      labelid: string,
      body: FormData,
      options?: RequestOptions,
    ) => {
      return HttpClient.put(
        `${apiUrl}/SubContractor/importFilePayment/${projectId}?projectCode=${projectCode}&paymentTerm=${paymentTerm}&lableId=${labelid}&paymentTermDate=${paymentTermDate}`,
        body,
        options,
      );
    },
    uploadFileFinance: (
      companyId: number,
      financeTerm: number,
      financeTermDate: string,
      labelid: string,
      body: FormData,
      options?: RequestOptions,
    ) => {
      return HttpClient.put(
        `${apiUrl}/FinanceDocument/importFileFinance/${companyId}?financeTerm=${financeTerm}&lableId=${labelid}&financeTermDate=${financeTermDate}`,
        body,
        options,
      );
    },
  };

  public Delete = {
    deleteDocument: (documentId: string, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Document/${documentId}`, options);
    },
    deleteDocuments: (documentIds: string[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Document/deleteFiles`, options, documentIds);
    },
  };
}

export const DocumentService = new DocumentController();
