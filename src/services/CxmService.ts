/* eslint-disable import/order */

import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';

const { apiUrl } = getEnvVars();

class CxmService {
  Message = {
    Get: {
      /**
       * the messege infor exclude 'attachmentLinkReadDTOs'
       * @param companyId 
       * @param categoryCode 
       * @param startDate 
       * @param endDate 
       */
      getByCategoryCode: (companyId: number, categoryCode: string, startDate: string = '2000-01-01', endDate: string = '9000-01-01', options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/getByCategoryCode/${companyId}?categoryCode=${categoryCode}&startDate=${startDate}&endDate=${endDate}`, options);
      },
      /**
       * 
       * @param messageId 
       * @param options 
       * @returns 
       */
      getCommentsByMessage: (messageId: number, options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Comment/getCommentsByMessage/${messageId}`, options);
      },
      /**
       * 
       * @param messageId 
       * @param options 
       * @returns 
       */
      getCountLikes: (messageId: number, options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/getCountLikes/${messageId}`, options);
      },
      getLike: (messageId: number, options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/getLikes/${messageId}`, options);
      },
      /**
       * 
       * @param messageId 
       * @param options 
       * @returns 
       */
      getCountViews: (messageId: number, options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/getCountViews/${messageId}`, options);
      },
      /**
       * the messege infor include 'attachmentLinkReadDTOs'
       * @param messageId 
       * @param options 
       * @returns 
       */
      getReviewMessage: (messageId: number, options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/${messageId}`, options);
      },
      getByType: (companyId: number, type: number = 1, startDate: string = '2000-01-01', endDate: string = '9000-01-01', options?: RequestOptions) => {
        return HttpClient.get(`${apiUrl}/Message/getByType/${companyId}?type=${type}&startDate=${startDate}&endDate=${endDate}`, options);
      },
    },

    Post: {
      PostComment: (data: any, options?: RequestOptions) => {
        return HttpClient.post(`${apiUrl}/Comment/postComment`, data, options);
      },
      Like: (messageId: number, data: any, options?: RequestOptions) => {
        return HttpClient.post(`${apiUrl}/Message/like/${messageId}`, data, options);
      },
      /**
       * 
       * @param messageId 
       * @param options 
       * @returns 
       */
      PostView: (messageId: number, options?: RequestOptions) => {
        return HttpClient.post(`${apiUrl}/Message/view/${messageId}`, options);
      },
      /**
       * 
       * @param itemId 
       * @param dataImage 
       * @param options 
       * @returns 
       */
      uploadAttachmentFile: (itemId: number, dataImage: FormData, options?: RequestOptions) => {
        return HttpClient.post(
          `${apiUrl}/MessageAttachmentLink/uploadAttachmentFile?itemId=${itemId}`,
          dataImage,
          options
        );
      },
      addNewMessage: (inputValues: any, options?: RequestOptions) => {
        return HttpClient.post(`${apiUrl}/Message/addMessage`, inputValues, options);
      },
    },

    Put: {
      editMessage: (inputValues: any, id: number, options?: RequestOptions) => {
        return HttpClient.put(`${apiUrl}/Message/${id}`, inputValues, options);
      },
    },
    Delete: {
      deleteMessage: (reviewId: string, options?: RequestOptions) => {
        return HttpClient.delete(`${apiUrl}/Message/${reviewId}`, options);
      },
      deleteAttachmentLink: (reviewId: number, drawingIds: string, options?: RequestOptions) => {
        return HttpClient.delete(`${apiUrl}/MessageAttachmentLink/deleteAttachmentFiles/?itemId=${reviewId}`, options, drawingIds);
      },
    }
  };

  public Get = {
    /**
     * Lấy dữ liệu chi phí phát sinh ngoài của dự án
     * AdditionalCost/getByProjectId/3
     * @param projectId {number}
     * @returns
     */
    getAdditionalCosts: (projectId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AdditionalCost/getByProjectId/${projectId}`, options);
    },
    getAdditionalCostsByDate: (dateTime: string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AdditionalCost/getAdditionalCosts?dateTime=${dateTime}`, options);
    },
    getAdditionalCostsByRangeDate: (startDate: string, endDate:string, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AdditionalCost/getAdditionalCostsByDate?startDate=${startDate}&endDate=${endDate}`, options);
    },
    /**
     * Lấy tất cả dữ liệu chi phí phát sinh
     * AdditionalCost/getAll
     * @param projectId {number}
     * @returns
     */
    getAllAdditionalCost: (options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/AdditionalCost/getAll`, options);
    },
    /**
     * Lấy thong tin image
     * Document/downloadFile/2?companyId=1
     * @param id {number} drawingId
     * @param companyId {number}
     * @returns
     */
    downloadFile: (id: string, companyId: string, options?: RequestOptions) => {
      return HttpClient.get(
        `${apiUrl}/Document/downloadFile/${id}?companyId=${companyId}`, {
        ...options,
        headers: {
          ...options?.headers,
        },
        responseType: 'blob',
      }
      );
    },

  };

  public Post = {
    /**
     * upload AttachmentFiles
     * /AdditionAttachmentLink/uploadAttachmentFiles
     * @param itemId {number} id của record addition cost
     * @param dataImage: FormData
     * @returns
     */
    uploadAttachmentFiles: (itemId: number, dataImage: FormData, options?: RequestOptions) => {
      //uploadFileCPPS
      return HttpClient.post(
        `${apiUrl}/AdditionAttachmentLink/uploadAttachmentFile?itemId=${itemId}`,
        dataImage,
        options,
      );
    },
  };

  public Put = {};

  public delete = {
    /**
 * Xóa AttachmentFiles
 * /AdditionAttachmentLink/deleteAttachmentFiles
 * @param itemId {number} id của record addition cost
 * @param drawingIds: {string[]}
 * @returns
 */
    deleteAttachmentFiles: (itemId: number, drawingIds: string[], options?: RequestOptions) => {
      return HttpClient.delete(
        `${apiUrl}/AdditionAttachmentLink/deleteAttachmentFiles?itemId=${itemId}`, options, drawingIds);
    },
  };
}

export const cxmService = new CxmService();
