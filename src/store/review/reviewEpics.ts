import dayjs from "dayjs";
import { filter, withLatestFrom, switchMap, concat, mergeMap, catchError } from "rxjs";

import { reviewActions } from "./reviewSlice";
import { startLoading, stopLoading } from "../loading";
import { shiftActions } from "../shift";
import { RootEpic } from "../types";
import { defaultPagingParams, eReviewTypeUpdate, IReviewMessages } from "@/common/define";
import { IAttachmentLinks } from "@/services/AccountingInvoiceService";
import { cxmService } from "@/services/CxmService";
import { ReviewService } from "@/services/ReviewService";
import Utils from "@/utils";

const getRelate2ReviewMessage = (messageId: string, companyId: string) => {
  const dispatchComment: any[] = [];
  dispatchComment.push(reviewActions.getCommentsByMessage({messageId}));
  dispatchComment.push(reviewActions.getCountLikes({messageId}));
  dispatchComment.push(reviewActions.getCountViews({messageId}));
  dispatchComment.push(reviewActions.getAttachmentLink({messageId, companyId}));
  return dispatchComment;
}


const getReviewsById$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getReviewsById.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { id, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'getReviewsById' })],
        ReviewService.Get.getMessagebyId(id).pipe(
          mergeMap(review => {
            const dispatchComment = getRelate2ReviewMessage(review.id, companyId);
            return [...dispatchComment];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
        [stopLoading({ key: 'getReviewsById' })],
      );
    }),
  );
};
const editReviewsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.editReviewRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id, dataImage, review } = action.payload;
      // console.log(review, 'review', id, 'id');
      return concat(
        [startLoading({ key: 'editReviewsRequest' })],
        ReviewService.Put.editMessage(review, id).pipe(
          mergeMap(reviewMessage => {
            if (reviewMessage) {
              Utils.successNotification('Chỉnh sửa chủ đề thành công');
              return [
                reviewActions.updateReviewMessage({message: reviewMessage, messageId: reviewMessage.id, type: eReviewTypeUpdate.EDIT_MESSAGE}), 
                reviewActions.uploadAttachmentLinks({itemId: reviewMessage.id, dataImage: dataImage, companyId: review.companyId })];
              }
              else {
                Utils.errorHandling('Chỉnh sửa chủ đề thất bại');
                return [];
              }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log("errors", errors); 
            return [];
          }),          ),
        [stopLoading({ key: 'editReviewsRequest' })],
      );
    }),
  );
};
const deleteReviewsRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.deleteReviewRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id} = action.payload;
      // console.log(id, 'id');
      return concat(
        [startLoading({ key: 'deleteReviewRequest' })],
        ReviewService.Delete.deleteMessage(id).pipe(
          mergeMap(reviews => {
            if (reviews > 0) {
              Utils.successNotification('Xóa chủ đề thành công');
              return [reviewActions.updateReviewMessage({messageId: id, type: eReviewTypeUpdate.DELETE_MESSAGE})];
            }
            else {
              Utils.errorHandling('Xóa chủ đề thất bại');
              return [];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log("errors", errors); 
            return [];
          }),          ),
        [stopLoading({ key: 'deleteReviewRequest' })],
      );
    }),
  );
};
const createReviewRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.createReviewRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const { inputValues, dataImage } = action.payload;
      console.log('test run new request', inputValues);
      return concat(
        [startLoading({ key: 'createReviewRequest' })],
        ReviewService.Post.addNewMessage(inputValues).pipe(
          mergeMap(reviewMessage => { 
            if (reviewMessage) {
              const result = {
                ...reviewMessage,
                selected: false,
                countLike: 0,
                countVisit: 0
              };
              Utils.successNotification('Tạo mới chủ đề thành công');
              return [
                reviewActions.updateReviewMessage({message: result, messageId:0, type: eReviewTypeUpdate.ADD_MESSAGE}), 
                reviewActions.uploadAttachmentLinks({itemId: result.id, dataImage: dataImage, companyId: inputValues.companyId })];
            } else {
              Utils.errorHandling('Tạo mới chủ đề thất bại');
              return [];
            }
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),          ),
        [stopLoading({ key: 'createReviewRequest' })],
      );
    }),
  );
};

const uploadAttachmentLinks$: RootEpic = action$ => {
  return action$.pipe(
    filter(reviewActions.uploadAttachmentLinks.match),
    switchMap(action => {
      const { itemId, dataImage, companyId } = action.payload; //actionpayload truyền vào bao gồm itemid và dữ liệu ảnh

      return concat(
        [startLoading({ key: 'createFileCPPS' })],
        ReviewService.Post.createFileCPPS(itemId, dataImage).pipe(
          switchMap(response => {
            // console.log('Tải file thành công', response);
            if (response)
            {
              Utils.successNotification('Tải file thành công');
              return [reviewActions.getAttachmentLink({messageId: itemId, companyId })];
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
        [stopLoading({ key: 'createFileCPPS' })],
      );
    }),
  );
};

const getReviewMessage$: RootEpic = action$ => {
  return action$.pipe(
    filter(reviewActions.getReviewMessage.match),
    switchMap(action => {
      const { companyId, categoryCode, startDate, endDate } = action.payload;
      return concat(
        [startLoading({ key: 'getReviewMessage' })],
        cxmService.Message.Get.getByCategoryCode(companyId, categoryCode, startDate, endDate).pipe(
          switchMap((results) => {
            let dispatchComment: any = [];
            let tempResult: IReviewMessages = {
              page: 0,
              pageCount: 0,
              pageSize: 0,
              queryCount: 0,
              firstRowIndex: 0,
              lastRowIndex: 0,
              results: []
            };
            if (results) {
              tempResult = {...results};
              if (tempResult.results?.length > 0) {
                tempResult.results = tempResult.results.map(x => {
                  // ko can lay cac thong tin nay o day , lấy qua event 'getReviewsById' 
                  // dispatchComment.push(reviewActions.getCommentsByMessage({messageId: x.id}));
                  // dispatchComment.push(reviewActions.getCountLikes({messageId: x.id}));
                  // dispatchComment.push(reviewActions.getCountViews({messageId: x.id}));
                  // dispatchComment.push(reviewActions.getAttachmentLink({messageId: x.id, companyId}));
                  return {
                    ...x,
                    selected: false,
                    countLike: 0,
                    countVisit: 0
                  };
                });
                tempResult.results = tempResult.results.sort((a, b) => {
                  return b.id - a.id;
                });
              }
            }
            return [reviewActions.setReviewMessage(tempResult), ...dispatchComment];
          }),
          catchError(error => {
            Utils.errorHandling(error);
            return [stopLoading({ key: 'getReviewMessage' })];
          }),
        ),
        [stopLoading({ key: 'getReviewMessage' })],
      );
    }),
  );
};

const getCommentsByMessage$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getCommentsByMessage.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      return concat(
        [startLoading({ key: 'getCommentsByMessage' })],
        cxmService.Message.Get.getCommentsByMessage(messageId).pipe(
          switchMap((results) => {
            return [reviewActions.updateReviewMessage({messageId, comments: results, type: eReviewTypeUpdate.SET_COMMENTS})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getCommentsByMessage' })]
      );
    }),
  );
};

const getCountLikes$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getCountLikes.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      return concat(
        [startLoading({ key: 'getCountLikes' })],
        cxmService.Message.Get.getCountLikes(messageId).pipe(
          switchMap((results) => { 
            return [reviewActions.updateReviewMessage({messageId, countLike: Utils.getNumber(results), type: eReviewTypeUpdate.SET_LIKES})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getCountLikes' })]
      );
    }),
  );
};
/**
 * yêu cầu lấy thông tin CountView cho một message
 */
const getCountViews$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getCountViews.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      return concat(
        [startLoading({ key: 'getCountViews' })],
        cxmService.Message.Get.getCountViews(messageId).pipe(
          switchMap((results) => { 
            return [reviewActions.updateReviewMessage({messageId, countView: Utils.getNumber(results), type: eReviewTypeUpdate.SET_VIEWS})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getCountViews' })]
      );
    }),
  );
};
const getLike$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getLike.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId, user, postLike } = action.payload;
      return concat(
        [startLoading({ key: 'getLike' })],
        cxmService.Message.Get.getLike(messageId).pipe(
          switchMap((results) => { 
            if (postLike) {
              let emotion = 1;
              if (results && results.length > 0) {
                const likeInfor = results.find((x: any) => x.userIdBy === user?.Id);
                if (likeInfor) {
                  emotion = likeInfor.emotion;
                  if (!emotion) emotion = 1;
                  else emotion = 0;
                }
              }

              return [reviewActions.postLike({
                emotion,
                messageId,
                userIdBy: '',
                likeBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                likeByName: '',
                touchedOn: new Date().toISOString(),
              })];
            } else return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getLike' })]
      );
    }),
  );
};

const postLike$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.postLike.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      return concat(
        [startLoading({ key: 'postLike' })],
        cxmService.Message.Post.Like(messageId, action.payload).pipe(
          switchMap((results) => { 
            return [reviewActions.getCountLikes({messageId})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'postLike' })]
      );
    }),
  );
};
/**
 * yêu cầu ghi nhận 1 thông tin View cho một message
 */
const postView$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.postView.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      return concat(
        [startLoading({ key: 'postView' })],
        cxmService.Message.Post.PostView(messageId).pipe(
          switchMap((results) => {
            // change logic: ket qua khong la countView ==> can goi ham getCountViews để update kết quả
            return [reviewActions.getCountViews({messageId})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'postView' })]
      );
    }),
  );
};

const getAttachmentLink$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getAttachmentLink.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId, companyId } = action.payload;
      return concat(
        [startLoading({ key: 'getAttachmentLink' })],
        cxmService.Message.Get.getReviewMessage(messageId).pipe(
          switchMap((results) => {
            if (results?.attachmentLinkReadDTOs?.length > 0) {
              // const getImageActions: any[] = [];
              // results?.attachmentLinkReadDTOs.forEach((x: any) => {
              //   getImageActions.push(reviewActions.getDrawingImage({drawingId: x.drawingId, companyId, messageId}));
              // });
              // return [reviewActions.updateReviewMessage({messageId, attachmentLinkReadDTOs: results.attachmentLinkReadDTOs, type: eReviewTypeUpdate.ATTACHMENT_LINKS}), ...getImageActions];
              // use url download instead of download 
              const attachmentLinkReadDTOs = results?.attachmentLinkReadDTOs.map((x: any) => {
                return {...x, url: ReviewService.getImageUrl(x.drawingId, companyId)};
              });
              return [reviewActions.updateReviewMessage({messageId, attachmentLinkReadDTOs, type: eReviewTypeUpdate.ATTACHMENT_LINKS})];
            }
            return [];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getAttachmentLink' })]
      );
    }),
  );
};

const getDrawingImage$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.getDrawingImage.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { drawingId, companyId, messageId } = action.payload;
      return concat(
        [startLoading({ key: 'getDrawingImage' })],
        cxmService.Get.downloadFile(drawingId, companyId).pipe(
          switchMap((imageData) => {
            const imageUrl = window.URL.createObjectURL(imageData);
            return [reviewActions.updateReviewMessage({messageId, drawingId, imageUrl, type: eReviewTypeUpdate.ATTACHMENT_LINKS_IMAGE})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'getDrawingImage' })]
      );
    }),
  );
};

const postReviewMessage$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.postReviewMessage.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { messageId } = action.payload;
      // content: inputValue,
      // createdDate: new Date().toLocaleDateString(),
      // messageId: message.id,
      // parentId: null,
      return concat(
        [startLoading({ key: 'postReviewMessage' })],
        cxmService.Message.Post.PostComment(action.payload).pipe(
          switchMap((results) => {         
            // {
            //   "id": 10,
            //   "senderId": "11b56e7a-171a-4253-b1cf-aef656f32f52",
            //   "senderName": "Công",
            //   "content": "test comment",
            //   "createdDate": "2024-11-11T08:31:45.215Z",
            //   "messageId": 1,
            //   "parentId": null
            // }
            return [reviewActions.updateReviewMessage({messageId, comment: results, type: eReviewTypeUpdate.ADD_COMMENT})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            return [];
          }),
        ),
      [stopLoading({ key: 'postReviewMessage' })]
      );
    }),
  );
};
const deleteFilesRequest$: RootEpic = (action$, state$) => {
  return action$.pipe(
    filter(reviewActions.deleteFilesRequest.match),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      // eslint-disable-next-line
      const { id, drawingIds } = action.payload;
      return concat(
        [startLoading({ key: 'deleteFilesRequest' })],
        ReviewService.Delete.deleteAttachmentLink(  id, drawingIds).pipe(
          mergeMap(reviews => {
            Utils.successNotification('Xóa ảnh thành công');
            return [reviewActions.updateReviewMessage({messageId: id, drawingIds, type: eReviewTypeUpdate.REMOVE_ATTACHMENT_LINKS_IMAGE})];
          }),
          catchError(errors => {
            Utils.errorHandling(errors);
            console.log("errors", errors); 
            return [];
          }),          ),
        [stopLoading({ key: 'deleteFilesRequest' })],
      );
    }),
  );
};
export const reviewEpics = [
  getReviewMessage$,
  getCommentsByMessage$,
  getCountLikes$,
  getCountViews$,
  getLike$,
  postLike$,
  postView$,
  getDrawingImage$,
  getAttachmentLink$,    
  postReviewMessage$,
  editReviewsRequest$, 
  createReviewRequest$, 
  uploadAttachmentLinks$,
  deleteReviewsRequest$,
  getReviewsById$,
  deleteFilesRequest$
];
