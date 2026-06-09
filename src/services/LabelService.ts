import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';

const { apiUrl } = getEnvVars();

export interface CreateLabelData {
  id:string,
  labelCode?: string;
  name: string;
  color?: string;
  type?: 'folder';
  children?: CreateLabelData[];
  parentId?: string;
  projectId?: number;
}

export interface labelData {
  name: string,
  color: string,
  type: string,
  labelCode: string
}


class LabelController {
  public Get = {
    getLabelByDocumentId: (documentId: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Label/files/${documentId}`, options);
    },
  };
  public Post = {
    createRootFolder: (inputValues: CreateLabelData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Label/createFolderRootProject`, inputValues, options);
    },
    createLabel: (projectId: number, inputValues: CreateLabelData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Label/${projectId}`, inputValues, options);
    },
    createLabels: (projectId: number, inputValues: CreateLabelData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Label/createLabels/${projectId}`, inputValues, options);
    },
  };
  public Put = {
    updateLabel: (labelId: string, input: labelData, options?: RequestOptions) => {
      console.log("input PUT updateLabel", input)
      return HttpClient.put(`${apiUrl}/Label/${labelId}`, input, options);
    },
  };
  
  public Delete = {
    deleteLabel: (labelId: string, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Label/${labelId}`, options);
    },
    deleteLabels: (labelIds: string[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Label/deleteLabels`, options, labelIds);
    },
    deleteFileTP:(documentIds: string[], options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/SubContractor/deleteWhenDelFileDocumentIds`, options,documentIds);
    },
  };
}

export const LabelService = new LabelController();
