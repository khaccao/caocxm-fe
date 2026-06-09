import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { MessageResponse } from '@/services/MesageAPI/MessageService';
import { eNewsTypeUpdate, INewsRecord } from '@/services/NewsService';

export enum NewsCategoryCode {
  BANGTIN_TINTUC = 'BANGTIN_TINTUC',
  BANGTIN_GIOITHIEU = 'BANGTIN_GIOITHIEU',
  BANGTIN_CONGTRINH = 'BANGTIN_CONGTRINH',
}
interface NewsState {
  newsByCode: {
    [code: string]: MessageResponse[];
  };
  listNews: INewsRecord[];
  currentNews?: INewsRecord;
}
const initialState: NewsState = {
  newsByCode: {},
  listNews: [],
  currentNews: undefined,
};

const newsSlice = createSlice({
  name: 'News',
  initialState,
  reducers: {
    getNewsById: (state, action) => {},
    getListNews: (state, action) => {},
    setListNews: (state, action) => {
      state.listNews = action.payload;
    },
    updateListNews: (state, action) => {
      const { newsId, type } = action.payload;
      const listNews = [...state.listNews];
      if (type === eNewsTypeUpdate.ADD_NEWS) {
        const { news } = action.payload;
        state.listNews = [news, ...listNews];
      } else if (type === eNewsTypeUpdate.DELETE_NEWS) {
        state.listNews = listNews.filter(x => x.id !== newsId);
      } else if (type === eNewsTypeUpdate.EDIT_NEWS) {
        const { news } = action.payload;
        state.listNews = listNews.map((x: INewsRecord) => {
          if (x.id === news) {
            x.imageUrl = news.imageUrl;
            x.newsGroup = news.newsGroup;
            x.title = news.title;
            x.htmlContent = news.htmlContent;
            x.description = news.description;
            x.htmlContent = news.htmlContent;
            x.published = news.published;
          }
          return x;
        });
      }
    },
    setCurrentNews: (state, action) => {
      state.currentNews = action.payload;
    },
    updateCurrentNews: (state, action) => {
      if (!state.currentNews) return;

      const { newsId, type } = action.payload;
      const currentNews = { ...state.currentNews };
      if (type === eNewsTypeUpdate.ATTACHMENT_LINKS) {
        const { attachmentLinkReadDTOs } = action.payload;
        currentNews.attachmentLinkReadDTOs = attachmentLinkReadDTOs;
        if (attachmentLinkReadDTOs?.length > 0) {
          currentNews.imageUrl = attachmentLinkReadDTOs[0].url;
        }
      } else if (type === eNewsTypeUpdate.ATTACHMENT_LINKS_IMAGE) {
        const { imageUrl, drawingId } = action.payload;
        if (currentNews.attachmentLinkReadDTOs?.length > 0) {
          currentNews.attachmentLinkReadDTOs.forEach((x, index) => {
            if (x.drawingId === drawingId) {
              x.imageUrl = imageUrl;
            }
            if (index === 0) currentNews.imageUrl = imageUrl;
          });
        }
      } else if (type === eNewsTypeUpdate.EDIT_NEWS) {
        console.log('action.payload', action.payload);
        const { news } = action.payload;
        currentNews.imageUrl = news.imageUrl;
        currentNews.newsGroup = news.newsGroup;
        currentNews.title = news.title;
        currentNews.htmlContent = news.htmlContent;
        currentNews.description = news.description;
        currentNews.htmlContent = news.htmlContent;
        currentNews.published = news.published;
        currentNews.createDate = news.createDate;
        currentNews.id = news.id;
        currentNews.projectId = news.projectId ?? 0;
        currentNews.projectCode = news.projectCode ?? '';
      }
      state.currentNews = currentNews;
    },
    editNews: (state, action) => {},
    addNews: (state, action) => {},
    deleteNews: (state, action) => {},
    uploadAttachmentLinks: (state, action) => {},
    getAttachmentLink: (state, action) => {},
    getDrawingImage: (state, action) => {},
    deleteFilesRequest: (state, action) => {},
    getNewsByCodeRequest: (
      state,
      action: PayloadAction<{
        code: NewsCategoryCode;
        companyId: number;
        searchParams?: any;
        callback?: (data?: any) => void;
      }>,
    ) => {    },
    setNews: (state, action: PayloadAction<{ [code: string]: MessageResponse[] }>) => {
      state.newsByCode = action.payload;
    },
    setNewsByCode: (state, action: PayloadAction<{ [code: string]: MessageResponse[] }>) => {
      state.newsByCode = {
        ...state.newsByCode,
        ...action.payload,
      };
    },
  },
});

export const newsActions = newsSlice.actions;
export const newsReducer = newsSlice.reducer;
