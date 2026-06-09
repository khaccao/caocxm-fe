/* eslint-disable import/order */
import { SalaryAdvanceRowDTO, SalaryPayload } from '@/common/define';
import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();
class SalaryController {
  public Get = {
    // https://sit.cxm.hicas.vn/SalaryAdvance/getSalarys?dateTime=2024-01-01&period=11
    getSalarys: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/SalaryAdvance/getSalarys`, options);
    },
    getSalaryById: (id: number, options?: RequestOptions) => {
      // https://sit.cxm.hicas.vn/SalaryAdvance/11
      return HttpClient.get(`${apiUrl}/SalaryAdvance/${id}`, options);
    }
  };

  public Post = {
    createSalary: (inputValues: SalaryPayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/SalaryAdvance`, inputValues, options);
    },
    updateSalarys: (inputValues: SalaryPayload[], options?: RequestOptions) => {
      // https://sit.cxm.hicas.vn/SalaryAdvance/updateSalarys?companyId=11&dateTime=2024-01-01
      // [13/01/2025][#21283][phuong_td] sửa đường dẫn sai
      return HttpClient.post(`${apiUrl}/SalaryAdvance/updateSalarys`, inputValues, options);
    },

    // [task #22188]
    exportExcel: (companyId: number, dateTime: string, period: number, rows: SalaryAdvanceRowDTO[], options?: RequestOptions) => {
      return HttpClient.post(
        `${apiUrl}/SalaryAdvance/exportExcel/${companyId}?period=${period}&dateTime=${dateTime}`,
        rows,
        {
          responseType: 'blob',
          ...options,
        },
      );
    },
  };
  public Put = {
    updateSalary: (id: number, inputValues: SalaryPayload, options?: RequestOptions) => {
      // https://sit.cxm.hicas.vn/SalaryAdvance/11
      return HttpClient.put(`${apiUrl}/SalaryAdvance/${id}`, inputValues, options);
    },
  };

  public Delete = {
    removeSalary: (id: number, options?: RequestOptions) => {
      // https://sit.cxm.hicas.vn/SalaryAdvance/11
      return HttpClient.delete(`${apiUrl}/SalaryAdvance/${id}`, options);
    }
  };
}

export const SalaryService = new SalaryController();
