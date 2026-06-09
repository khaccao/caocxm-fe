import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';

const { apiUrl } = getEnvVars();

class ImportFileController {
  public post = {
    importFile: (body: FormData, projectId: number, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Cxm/importFile?projectId=${projectId}`, body, options);
    },
    importFileIssueTemplate: (companyId: number, body: FormData, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/api/Cxm/importFileIssuetemplate?companyId=${companyId}`, body, options);
    },
    genIssue: (companyId: number, projectId: number, tagversionCode: string, body: any, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/IssueTemplate/genIssueWithTemplate/${companyId}/${projectId}?tagVersionCode=${tagversionCode}`, body, options);
    },
  };
}

export const ImportFileService = new ImportFileController();
