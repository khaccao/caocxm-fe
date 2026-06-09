
import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';
const { apiUrl } = getEnvVars();

export interface CreateUpdateShiftPayload {
  companyId: number;
  startTime: string;
  endTime: string;
  name: string;
}

export interface ShiftResponse {
  companyId: number;
  startTime: string;
  endTime: string;
  name: string;
  id: number;
}

class ShiftController {
  public Get = {
    getShifts: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Shift`, options);
    },
  };

  public Post = {
    createShift: (input: CreateUpdateShiftPayload, options?: RequestOptions) => {
      return HttpClient.post(`${apiUrl}/Shift`, input, options);
    },
  };

  public Put = {
    updateShift: (shiftId: number, input: CreateUpdateShiftPayload, options?: RequestOptions) => {
      return HttpClient.put(`${apiUrl}/Shift/${shiftId}`, input, options);
    },
  };

  public delete = {
    removeShift: (shiftId: number, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/Shift/${shiftId}`, options);
    },
  };
}

export const ShiftService = new ShiftController();
