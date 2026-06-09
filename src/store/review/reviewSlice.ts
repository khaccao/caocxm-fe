import { createSlice } from '@reduxjs/toolkit';

import { eReviewTypeUpdate, IReviewDrawing, IReviewItem, IReviewMessages } from '@/common/define';
import { ReviewDTO } from "@/services/ReviewService";



interface ReviewState {
  reviewMessage: IReviewMessages;
}

const initialState: ReviewState = {
  reviewMessage: {
    page: 0,
    pageCount: 0,
    pageSize: 0,
    queryCount: 0,
    firstRowIndex: 0,
    lastRowIndex: 0,
    results: [], // IReviewComment
  },
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    getReviewMessage: (state, action) => {},
    setReviewMessage: (state, action) => {
      state.reviewMessage = action.payload
    },
    getCommentsByMessage: (state, action) => {},
    getCountLikes: (state, action) => {},
    getCountViews: (state, action) => {},
    getAttachmentLink: (state, action) => {},
    updateReviewMessage: (state, action) => {
      const {messageId, type} = action.payload;
      // messageId: messageId
      // type: eReviewTypeUpdate
      // comments: IReviewComment[]
      // countLike: number
      const reviewMessage = {...state.reviewMessage}
      if (type ===  eReviewTypeUpdate.ADD_MESSAGE) {
        const {message} = action.payload;
        reviewMessage.results = [message, ...reviewMessage.results];
      } else if (type ===  eReviewTypeUpdate.DELETE_MESSAGE) {
        reviewMessage.results = reviewMessage.results.filter(x => x.id !== messageId);
      } else if (type ===  eReviewTypeUpdate.EDIT_MESSAGE) {
        const {message} = action.payload;
        reviewMessage.results = reviewMessage.results.map((x: IReviewItem) => {
          if (x.id === messageId) {
            x.subject = message.subject;
            x.content = message.content;
          }
          return x;
        });
      } else {
        reviewMessage.results.forEach(x => {
          if (messageId === x.id) {
            if (type === eReviewTypeUpdate.SET_COMMENTS) {
              const {comments} = action.payload;
              x.comments = comments;
            } else if (type === eReviewTypeUpdate.SET_LIKES) {
              const {countLike} = action.payload;
              x.countLike = countLike;
            } else if (type === eReviewTypeUpdate.ADD_COMMENT) {
              const {comment} = action.payload;
              x.comments.push(comment);
            } else if (type === eReviewTypeUpdate.SET_VIEWS) {
              const {countView} = action.payload;
              x.countView = countView;
            } else if (type === eReviewTypeUpdate.ATTACHMENT_LINKS) {
              const {attachmentLinkReadDTOs} = action.payload;
              x.attachmentLinkReadDTOs = attachmentLinkReadDTOs;
            } else if (type === eReviewTypeUpdate.ATTACHMENT_LINKS_IMAGE) {
              const {drawingId, imageUrl} = action.payload;
              if (x.attachmentLinkReadDTOs?.length > 0) {
                x.attachmentLinkReadDTOs.forEach(x => {
                  if (x.drawingId === drawingId) {
                    x.url = imageUrl;
                  } 
                });
              }
            } else if (type === eReviewTypeUpdate.REMOVE_ATTACHMENT_LINKS_IMAGE) {
              const {drawingIds} = action.payload;
              if (x.attachmentLinkReadDTOs?.length > 0 && drawingIds?.length > 0) {
                x.attachmentLinkReadDTOs = x.attachmentLinkReadDTOs.filter(x => !drawingIds.includes(x.drawingId));
              }
            }
          }        
        });
      }
      state.reviewMessage = reviewMessage;
    },
    postReviewMessage: (state, action) => {},
    createReviewRequest: (state, action) => {},
    removeReviewsRequest: (state, action) => {},
    editReviewRequest: (state, action) => {},
    deleteReviewRequest: (state, action) => {},
    deleteAttachmentLinks: (state, action) => {},
    uploadAttachmentLinks: (state, action) => {},
    getLike: (state, action) => {},
    postLike: (state, action) => {},
    postView: (state, action) => {},    
    getDrawingImage: (state, action) => {},    
    getReviewsById: (state, action) => {},    
    deleteFilesRequest: (state, action) => {},
  },
});

export const reviewActions = reviewSlice.actions;
export const reviewReducer = reviewSlice.reducer;
