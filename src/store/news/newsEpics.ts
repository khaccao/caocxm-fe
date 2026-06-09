/* eslint-disable import/order */
import { catchError, concat, filter, finalize, mergeMap, switchMap, withLatestFrom } from 'rxjs';

import { defaultPagingParams } from '@/common/define';
import { cxmService } from '@/services/CxmService';
import { MessageService } from '@/services/MesageAPI/MessageService';
import { eNewsTypeUpdate, NewsService } from '@/services/NewsService';
import Utils from '@/utils';
import { startLoading, stopLoading } from '../loading';
import { RootEpic } from '../types';
import { newsActions } from './newsSlice';

const getListNews$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.getListNews.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { companyId, type } = action.payload;
      return concat(
        [startLoading({ key: 'getListNews' })],
        cxmService.Message.Get.getByType(companyId, type).pipe(
          mergeMap(results => {
            if (results?.results?.length > 0) {
              let news = results?.results.map((x: any) => {
                return NewsService.dataTransform2NewsRecord(x);
              });
              news = news.sort((a: any, b: any) => {
                return b.id - a.id;
              });
              return [newsActions.setListNews(news)];
            }
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log('errors', errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getListNews' })],
      );
    }),
  );
};

const getNewsById$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.getNewsById.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { newsId, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'getNewsById' })],
        cxmService.Message.Get.getReviewMessage(newsId).pipe(
          mergeMap(result => {
            console.log(result);
            const news = NewsService.dataTransform2NewsRecord(result);
            console.log(news);
            const dispatchComment = NewsService.getRelate2News(`${news.id}`, companyId);
            return [newsActions.setCurrentNews(news), ...dispatchComment];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getNewsById' })],
      );
    }),
  );
};

const editNews$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.editNews.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { news, id, dataImage, ispublish } = action.payload;
      const files = dataImage.getAll('files');
      const hasFile = files.length > 0 && files.some((f: any) => f instanceof File);
      return concat(
        [startLoading({ key: 'editNews' })],
        cxmService.Message.Put.editMessage(news, id).pipe(
          mergeMap(result => {
            if (result) {
              const news = NewsService.dataTransform2NewsRecord(result);
              if (!ispublish)
                Utils.successNotification(`Chỉnh sửa tin tức thành công.`);
              else {
                Utils.successNotification(`${news.published === 2 ? 'Xuất bản' : 'Ngừng xuất bản'} tin tức thành công.`);
              }
              const actions: any[] = [
                newsActions.updateListNews({ news, type: eNewsTypeUpdate.ADD_NEWS }),
                newsActions.updateCurrentNews({ news, type: eNewsTypeUpdate.EDIT_NEWS }),
                newsActions.getListNews({ companyId: news.companyId | 1, type: 1 }),
              ];

              if (hasFile) {
                actions.push(newsActions.uploadAttachmentLinks({
                  itemId: news.id,
                  dataImage: dataImage,
                  companyId: news.companyId,
                }));
              }

              return actions;
            }
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log('errors', errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'editNews' })],
      );
    }),
  );
};
const addNews$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.addNews.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { news, dataImage } = action.payload;
      const files = dataImage.getAll('files');
      const hasFile = files.length > 0 && files.some((f: any) => f instanceof File);
      return concat(
        [startLoading({ key: 'addNews' })],
        cxmService.Message.Post.addNewMessage(news).pipe(
          mergeMap(result => {
            if (result) {
              const news = NewsService.dataTransform2NewsRecord(result);
              Utils.successNotification(`Thêm tin tức thành công`);

              const actions: any[] = [
                newsActions.updateListNews({ news, type: eNewsTypeUpdate.ADD_NEWS }),
                newsActions.updateCurrentNews({ news, type: eNewsTypeUpdate.EDIT_NEWS }),
                newsActions.getListNews({ companyId: news.companyId | 1, type: 1 }),

              ];

              if (hasFile) {
                actions.push(newsActions.uploadAttachmentLinks({
                  itemId: news.id,
                  dataImage: dataImage,
                  companyId: news.companyId,
                }));
              }

              return actions;
            }
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log('errors', errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'addNews' })],
      );
    }),
  );
};

const deleteNews$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.deleteNews.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id } = action.payload;
      return concat(
        [startLoading({ key: 'deleteNews' })],
        cxmService.Message.Delete.deleteMessage(id).pipe(
          mergeMap(reviews => {
            if (reviews) {
              Utils.successNotification(`Xóa tin tức thành công`);
              return [newsActions.updateListNews({ newsId: id, type: eNewsTypeUpdate.DELETE_NEWS })];
            } else return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log('errors', errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'deleteNews' })],
      );
    }),
  );
};

const uploadAttachmentLinks$: RootEpic = action$ => {
  return action$.pipe(
    filter(newsActions.uploadAttachmentLinks.match),
    switchMap(action => {
      const { itemId, dataImage, companyId } = action.payload; //actionpayload truyền vào bao gồm itemid và dữ liệu ảnh
      return concat(
        [startLoading({ key: 'uploadAttachmentLinks' })],
        cxmService.Message.Post.uploadAttachmentFile(itemId, dataImage).pipe(
          switchMap(response => {
            // console.log('Tải file thành công', response);
            if (response) {
              Utils.successNotification('Tải file thành công');
              return [newsActions.getAttachmentLink({ newsId: itemId, companyId })];
            } else {
              Utils.successNotification('Tải file không thành công');
              return [];
            }
          }),
          catchError(error => {
            console.error('Lỗi tải file', error);
            return [];
          }),
        ),
        [stopLoading({ key: 'uploadAttachmentLinks' })],
      );
    }),
  );
};

const getAttachmentLink$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.getAttachmentLink.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { newsId, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'getAttachmentLink' })],
        cxmService.Message.Get.getReviewMessage(newsId).pipe(
          switchMap(results => {
            // if (results?.attachmentLinkReadDTOs?.length > 0) {
            //   const getImageActions: any[] = [];
            //   results?.attachmentLinkReadDTOs.forEach((x: any) => {
            //     getImageActions.push(newsActions.getDrawingImage({drawingId: x.drawingId, companyId, newsId}));
            //   });
            //   return [newsActions.updateCurrentNews({newsId, attachmentLinkReadDTOs: results.attachmentLinkReadDTOs, type: eNewsTypeUpdate.ATTACHMENT_LINKS}), ...getImageActions];
            // }
            // use url download instead of download
            if (results?.attachmentLinkReadDTOs?.length > 0) {
              const attachmentLinkReadDTOs = results?.attachmentLinkReadDTOs.map((x: any) => {
                return { ...x, url: NewsService.getImageUrl(x.drawingId, companyId) };
              });
              return [
                newsActions.updateCurrentNews({
                  newsId,
                  attachmentLinkReadDTOs,
                  type: eNewsTypeUpdate.ATTACHMENT_LINKS,
                }),
              ];
            }
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getAttachmentLink' })],
      );
    }),
  );
};

const getDrawingImage$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.getDrawingImage.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingId, companyId, newsId } = action.payload;
      return concat(
        [startLoading({ key: 'getDrawingImage' })],
        cxmService.Get.downloadFile(drawingId, companyId).pipe(
          switchMap(imageData => {
            const imageUrl = window.URL.createObjectURL(imageData);
            return [
              newsActions.updateCurrentNews({
                newsId,
                drawingId,
                imageUrl,
                type: eNewsTypeUpdate.ATTACHMENT_LINKS_IMAGE,
              }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getDrawingImage' })],
      );
    }),
  );
};

const getNewsByCodeRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.getNewsByCodeRequest.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      // eslint-disable-next-line
      const { code, callback, searchParams, companyId } = action.payload;
      const search = { ...defaultPagingParams, ...searchParams, categoryCode: code };
      let data: any = [];
      return concat(
        [startLoading({ key: 'GetNews' + code })],
        MessageService.Get.getMessageByCategoryCode(companyId, { search }).pipe(
          mergeMap(res => {
            data = res.results || [];
            return [
              newsActions.setNewsByCode({
                [code]: res.results || [],
              }),
            ];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
          finalize(() => {
            if (callback) {
              callback(data);
            }
          }),
        ),
        [stopLoading({ key: 'GetNews' + code })],
      );
    }),
  );
};
const deleteFilesRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(newsActions.deleteFilesRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id, drawingIds } = action.payload;
      return concat(
        [startLoading({ key: 'deleteFilesRequest' })],
        cxmService.Message.Delete.deleteAttachmentLink(id, drawingIds).pipe(
          mergeMap(reviews => {
            // Utils.successNotification('Xóa ảnh thành công');
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log('errors', errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'deleteFilesRequest' })],
      );
    }),
  );
};
export const newsEpics = [
  getListNews$,
  getNewsById$,
  editNews$,
  addNews$,
  deleteNews$,
  uploadAttachmentLinks$,
  getAttachmentLink$,
  getDrawingImage$,
  getNewsByCodeRequest$,
  deleteFilesRequest$,
];
