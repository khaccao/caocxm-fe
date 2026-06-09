
import { getEnvVars } from "@/environment";
import { newsActions } from "@/store/news";

const { apiUrl } = getEnvVars();
export interface INews {
}

export interface INewsRecord {
  id: number;
  categoryId: number;
  senderId: string;
  senderName: string;
  attachmentLinkReadDTOs: any[],
  companyId: number;
  imageUrl: string;
  newsGroup: string;
  title: string;
  createDate: string; // iso format
  path: string;
  description: string;
  published: number; // 1: 'Không xuất bản'; 2: 'Xuất bản'; 0: 'Tạo mới';
  htmlContent: string;
  selected: boolean;
  projectId?: number;
  projectCode?: string;
}

export interface INewsGroup {
  value: string;
  label: string;
}

export enum eNewsCategoryCode {
  BANGTIN_TINTUC = 'BANGTIN_TINTUC',
  BANGTIN_GIOITHIEU = 'BANGTIN_GIOITHIEU',
  BANGTIN_CONGTRINH = 'BANGTIN_CONGTRINH',
}

export enum eNewsTypeUpdate {
  ADD_NEWS = 'ADD_NEWS',
  EDIT_NEWS = 'EDIT_NEWS',
  DELETE_NEWS = 'DELETE_NEWS',
  ATTACHMENT_LINKS = 'ATTACHMENT_LINKS',
  ATTACHMENT_LINKS_IMAGE = 'ATTACHMENT_LINKS_IMAGE',
}

// page: number;
// pageCount: number;
// pageSize: number;
// queryCount: number;
// firstRowIndex: number;
// lastRowIndex: number;
class CNewsService {
  t: any;
  groupOption: INewsGroup[] = [
    {
      value: eNewsCategoryCode.BANGTIN_TINTUC,
      label: 'Tin tức',
    },
    {
      value: eNewsCategoryCode.BANGTIN_GIOITHIEU,
      label: 'Giới thiệu',
    },
    {
      value: eNewsCategoryCode.BANGTIN_CONGTRINH,
      label: 'Công trình',
    },
  ];
  createTestData() {
    const newsList = [];
    for (let i = 1; i <= 102; i++) {
      newsList.push({
        id: i,
        categoryId: 0,
        senderId: '11',
        senderName: 'test',
        attachmentLinkReadDTOs: [],
        companyId: 1,
        imageUrl: `https://via.placeholder.com/300x200?text=News+Image+${i}`, // Hình ảnh mẫu
        newsGroup: eNewsCategoryCode.BANGTIN_TINTUC,
        title: `News Title ${i}`,
        createDate: new Date().toISOString(), // Ngày giờ hiện tại theo ISO format
        path: `/news/${i}`,
        description: `This is the description for news item ${i}.`,
        published: 0,
        htmlContent: `<p>HTML content for <strong>News ${i}</strong>.</p>`,
      });
    }
    return newsList;
  }
  generateNewsRecord(categoryCode: string) {
    const news: INewsRecord = {
      id: 0,
      categoryId: 0,
      senderId: '11',
      senderName: 'test',
      attachmentLinkReadDTOs: [],
      companyId: 1,
      imageUrl: '',
      newsGroup: categoryCode,
      title: '',
      createDate: new Date().toISOString(), // new Date().toISOString(), // iso format
      path: '',
      description: '',
      published: 0,
      htmlContent: '',
      selected: false
    }
    return news;
  }

  dataTransform2NewsRecord = (apiNewsRecord: any) => {
    const newsRecord: INewsRecord = {
      id: apiNewsRecord.id,
      categoryId: apiNewsRecord.categoryId,
      senderId: apiNewsRecord.senderId,
      senderName: apiNewsRecord.senderName,
      attachmentLinkReadDTOs: apiNewsRecord.attachmentLinkReadDTOs,
      companyId: apiNewsRecord.companyId,
      imageUrl: '', // cần goi api de lấy thông tin ==> se update luc select 
      newsGroup: apiNewsRecord.categoryCode,
      title: apiNewsRecord.subject,
      createDate: apiNewsRecord.createdDate,
      path: '',
      description: apiNewsRecord.description,
      published: apiNewsRecord.status,
      htmlContent: apiNewsRecord.content,
      projectId : apiNewsRecord.projectId ?? 0,
      projectCode : apiNewsRecord.projectCode ?? '',
      selected: false,
    };
    return newsRecord;
  }
  getPublish(status: number) {
    switch (status) {
      case 1:
        return 'Không xuất bản';
      case 2:
        return 'Xuất bản';
    }
    return 'Tạo mới';
  }

  getNewsGroupsName(newsGroup: string) {
    switch (newsGroup) {
      case eNewsCategoryCode.BANGTIN_TINTUC:
        return 'Tin tức';
    }
    return 'Giới thiệu';
  }
  getRelate2News = (newsId: string, companyId: string) => {
    const dispatchComment: any[] = [];
    dispatchComment.push(newsActions.getAttachmentLink({ newsId, companyId }));
    return dispatchComment;
  }
  getImageUrl(drawingId: string, companyId: number) {
    return `${apiUrl}/Document/downloadFile/${drawingId}?companyId=${companyId}`;
  }
}

export const NewsService = new CNewsService();
