import { getMessage } from '@reduxjs/toolkit/dist/actionCreatorInvariantMiddleware';

import { iOptions } from './../common/define';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { getEnvVars } from '@/environment';

const { apiUrl } = getEnvVars();

export interface ReviewDTO {
  subject: string,
  companyId: number,
  categoryCode: number,
  content: string,
  createdDate: string,
  toIdList: string,
  status: number,
  id?: number,
  attachmentLinkReadDTOs?: any[],
}

class ReviewController {
  public Get = {
    getMessage: (companyId: number, options?: RequestOptions) => {
      return HttpClient.get(`${apiUrl}/Message/getByCategoryId/${companyId}`, options);
    },
    getMessagebyId: (id: number, options?: RequestOptions) => {
      // console.log(id, 'id');
      return HttpClient.get(`${apiUrl}/Message/${id}`, options);

    }
  };
  public Post = {
    addNewMessage: (inputValues: ReviewDTO, options?: RequestOptions) => {
      // console.log(inputValues, 'inputValues');
      return HttpClient.post(`${apiUrl}/Message/addMessage`, inputValues, options);
    },
    createFileCPPS: (itemId: number, dataImage: FormData, options?: RequestOptions) => {
      //tạo file ảnh upload
      // console.log(itemId, dataImage, 'inputValues');
      return HttpClient.post(
        `${apiUrl}/MessageAttachmentLink/uploadAttachmentFile?itemId=${itemId}`,
        dataImage,
        options
      );
    },  };
  public Put = {
    editMessage: (inputValues: ReviewDTO, id: number, options?: RequestOptions) => {
      // console.log(inputValues, 'inputValues', id, 'id');
      return HttpClient.put(`${apiUrl}/Message/${id}`, inputValues, options);
    },
  };
  public Delete = {
    deleteMessage: (reviewId: string, options?: RequestOptions) => {
      // console.log(reviewId, 'reviewId');
      return HttpClient.delete(`${apiUrl}/Message/${reviewId}`, options);
    },
    deleteAttachmentLink: (reviewId: number, drawingIds: string, options?: RequestOptions) => {
      return HttpClient.delete(`${apiUrl}/MessageAttachmentLink/deleteAttachmentFiles/?itemId=${reviewId}`, options, drawingIds);
    },
  };
  getImageUrl(drawingId: string, companyId: number) {
    return `${apiUrl}/Document/downloadFile/${drawingId}?companyId=${companyId}`;
  }
}

export const ReviewService = new ReviewController();