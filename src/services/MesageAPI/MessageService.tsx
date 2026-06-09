/* eslint-disable import/order */
import { PagingResponse } from '@/common/define';
import { getEnvVars } from '@/environment';
import { Observable } from 'rxjs';
import HttpClient from '../HttpClient';
import { RequestOptions } from '../types';

const { apiUrl } = getEnvVars();

export interface AttachmentLinkReadDTO {
  itemId?: number;
  drawingId?: string;
  fileName?: string;
  status: number;
  id: number;
}
export interface MessageResponse {
  subject?: string;
  companyId: number;
  categoryCode?: string;
  type: number;
  content?: string;
  createdDate: string;
  toIdList?: string;
  status: number;
  id: number;
  categoryId: number;
  description?: string;
  senderId?: string;
  senderName?: string;
  attachmentLinkReadDTOs: AttachmentLinkReadDTO[];
  projectId?: number;
  projectCode?: string;
}
export interface MessagePagingResponse extends PagingResponse {
  results: MessageResponse[];
}
class MessageController {
  public Get = {
    getMessageByCategoryCode: (companyId: number, options?: RequestOptions): Observable<MessagePagingResponse> => {
      return HttpClient.get(`${apiUrl}/Message/getByCategoryCode/${companyId}`, options);
    },
    getMessageById: (id: string, options?: RequestOptions): Observable<MessageResponse> => {
      return HttpClient.get(`${apiUrl}/Message/${id}`, options);
    },
    getCountViews: (id: string, options?: RequestOptions): Observable<number> => {
      return HttpClient.get(`${apiUrl}/Message/getCountViews/${id}`, options);
    },
  };
  public Post = {
    updateView: (messageId: number, options?: RequestOptions): Observable<number> => {
      return HttpClient.post(`${apiUrl}/Message/view/${messageId}`, options);
    },
  };
  public Put = {};

  public Delete = {};
}

export const MessageService = new MessageController();
