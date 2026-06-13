import { notification } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import {
  AttributeDimDTO,
  CategoryDTO,
  eAttribute,
  EmployeeReportAttributesDTO,
  EPredecessorType,
  eTrackerCode,
  MenuItem,
  TagVersion,
  Tracker,
} from '@/common/define';
import { EmployeesByCompanyId } from '@/common/project';
import { DataType } from '@/services/AccountingInvoiceService';
import { ApprovedHoursWorkingPayload } from '@/services/CheckInService';
import { codeStatus, IssuesPagingResponse, Status, StatusLabel } from '@/services/IssueService';

export default class Utils {
  static datetimeFormatIsoString = 'YYYY-MM-DDTHH:mm:ssZ';
  static dateFormat = 'DD-MM-YYYY';
  static deepClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  static getPersistAppState() {
    const persistState = localStorage.getItem('persist:root');
    const rootState = persistState ? JSON.parse(persistState) : {};
    /* prettier-ignore */
    const persistAppState: any = rootState['app'] ? JSON.parse(rootState['app']) : {};
    return persistAppState;
  }

  static isTokenValid(token: string) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const decoded = jwtDecode(token);

    if (!decoded.exp) {
      return false;
    }

    const now = new Date().valueOf();

    return now < decoded.exp * 1000;
  }

  static convertISODateToLocalTime(isoDateString: string) {
    const date = new Date(isoDateString);
    const timestampWithOffset = date.getTime();
    const offset = date.getTimezoneOffset() * 60 * 1000;
    const timestampWithoutOffset = timestampWithOffset - offset;
    const dateWithoutOffset = new Date(timestampWithoutOffset);
    return dateWithoutOffset;
  }

  static parseCheckInLocation(location?: string | null) {
    if (!location) {
      return null;
    }

    try {
      const parsed = JSON.parse(location);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  static normalizeShiftBoundaryTime(time: Dayjs) {
    return time.minute() === 59 && time.second() === 59 ? time.add(1, 'second') : time;
  }

  static convertISOStringToDayjs(isoDateString: string | undefined) {
    try {
      if (isoDateString && isoDateString !== '') {
        const date = new Date(isoDateString);
        return dayjs(date);
      }
    } catch {}
    return null;
  }

  static createUUID = () => uuidv4();

  static stringToColour = (str?: string) => {
    if (!str) {
      str = uuidv4();
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - colour.length) + colour;
  };

  static spitFullNameIntoFirstMiddleLastName = (name: string) => {
    const parts = name.split(' ');
    const firstName = parts.length > 0 ? parts.pop()?.trim() : '';
    const lastName = parts.length > 0 ? parts.shift()?.trim() : '';
    const middleName = parts.join(' ')?.trim();
    return {
      firstName,
      middleName,
      lastName,
    };
  };

  static errorHandling(error: any) {
    // [09/12/2024][#21139][phuong_td] thêm phương thức xử lý thêm params bổ xung câu thông báo, nếu thêm thì cứ đẩy vào { code: error.values.code, code1: data, code2: data1 }
    if (error.errorCode && error.msg && error.values) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.msg, { code: error.values.code }),
      });
      return;
    }
    if (error.errorCode && error.msg) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.msg),
      });
      return;
    }
    if (typeof error.response === 'string') {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.response),
      });
      return;
    }
    if (error.status === 401) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t('Token expired'),
      });
      return;
    }
    if (error.status === 404) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.message || 'Not Found'),
      });
      return;
    }
    if (error.status === 403) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t('Forbidden'),
      });
      return;
    }
    if (error?.response?.error_description) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.response.error_description),
      });
      return;
    }
    if (error.response?.error) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t(error.response?.error),
      });
      return;
    }
    if (JSON.stringify(error)) {
      notification.error({
        message: i18next.t('notification'),
        description: i18next.t('An error occurred while processing your request'),
      });
      return;
    }
    // TODO:
    notification.error({
      message: i18next.t('notification'),
      description: i18next.t('An error occurred while processing your request'),
    });
  }

  static successNotification(message?: string) {
    notification.success({
      message: i18next.t('notification'),
      description: i18next.t(message || 'Saved successfully'),
    });
  }

  static errorNotification(message?: string) {
    notification.error({
      message: i18next.t('notification'),
      description: i18next.t(message || 'File tải lên không hợp lệ'),
    });
  }

  static errorNotificationPB(message?: string) {
    notification.error({
      message: i18next.t('notification'),
      description: i18next.t(message || 'Cập nhật thất bại'),
    });
  }

  static formatDateTimeStamp(date: Date): any | null {
    const typeFormat = 'DD/MM/YYYY';
    return dayjs(date).format(typeFormat);
  }

  static concatFullName = (firstName: string, middleName: string, lastName: string) => {
    return [lastName?.trim(), middleName?.trim(), firstName?.trim()].filter(x => x).join(' ');
  };

  static getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Ngày đầu tuần (Thứ Hai)
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Ngày cuối tuần (Chủ Nhật)

    const formatDate = (d: Date) => {
      const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = d.getMonth(); // Tháng bắt đầu từ 0
      return `${day} ${monthsOfYear[month]}`;
    };

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  static formatNumber(num: number | string, rounding: number = 3) {
    let _num = num;
    // [01/12/2024][#21012][phuong_td] kiểm tra giá trị số công nếu là Infinity hoặc NaN thì trả về 0
    if ((_num === Infinity || isNaN(_num as any) || _num === null || _num === undefined)) {
      return 0;
    }
    if (_num !== '' && typeof _num === 'string') {
      _num = parseFloat(_num);
    }
    if (typeof _num === 'number' && _num % 1 !== 0) {
      if (rounding && rounding > 0) _num = _num.toFixed(rounding);
    }
    if (_num) {
      const split = _num.toString().split('.');
      let result = '';
      split.forEach((d, index) => {
        if (index > 0) {
          result += ',';
        }
        result += d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      });
      return result;
    }
    return _num;
  }

  static clone(obj: any) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.log(error);
      return obj;
    }
  }

  static getBase64(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  static formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    // [20916][dung_lt][19/11/2024] fix lỗi gantt chart
    if (day && month && year) return `${day}/${month}/${year}`;
    return null;
  }

  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public static generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  public static getMileStoneId(code: string, tags: TagVersion[] | undefined) {
    const tag = tags && tags.find(t => t.code === code);
    return tag ? tag.id : -1;
  }

  public static getStatus(code: string) {
    let statusNum = null;
    if (code === 'Dang_Cho_Duyet') {
      statusNum = Status.Pending;
    } else if (code === 'Da_Duyet') {
      statusNum = Status.Approved;
    } else if (code === 'Dang_Thuc_Hien') {
      statusNum = Status.Processing;
    } else if (code === 'Hoan_Thanh') {
      statusNum = Status.Done;
    } else {
      statusNum = Status.Stop;
    }
    return statusNum;
  }

  public static convertStatus(code: number) {
    let statusCode = null;
    if (code === Status.Pending) {
      statusCode = 'Dang_Cho_Duyet';
    } else if (code === Status.Approved) {
      statusCode = 'Da_Duyet';
    } else if (code === Status.Processing) {
      statusCode = 'Dang_Thuc_Hien';
    } else if (code === Status.Done) {
      statusCode = 'Hoan_Thanh';
    } else {
      statusCode = 'Tam_Dung';
    }
    return statusCode;
  }
  public static getCategoryId(code: string, categorys: CategoryDTO[] | undefined) {
    const category = categorys && categorys.find(t => t.code === code);
    return category ? category.id : -1;
  }

  public static getCategory(categoryId: number, tCategory: any, categorys: CategoryDTO[] | undefined) {
    if (categorys) {
      const category = categorys.find(c => c.id === categoryId);
      if (category) return tCategory(category.code);
    }
    return '';
  }

  public static convertStatusApi(value: any) {
    let code = null;
    if (value === StatusLabel.Pending) {
      code = codeStatus.Pending;
    } else if (value === StatusLabel.Approved) {
      code = codeStatus.Approved;
    } else if (value === StatusLabel.Done) {
      code = codeStatus.Done;
    } else if (value === StatusLabel.Processing) {
      code = codeStatus.Processing;
    } else {
      code = codeStatus.Stop;
    }
    return code;
  }

  public static sortIssueByPlanStartDay(issue: any) {
    let resultSort: any = [];
    if (issue && issue.results && issue.results.length > 0) {
      const data = [...issue.results];
      resultSort = data?.sort((a: any, b: any) => {
        if (a.plannedStartDate && b.plannedStartDate) {
          const dateA = new Date(a.plannedStartDate);
          const dateB = new Date(b.plannedStartDate);
          return dateA.getTime() - dateB.getTime();
        }
        if (a.plannedStartDate) return -1;
        if (b.plannedStartDate) return 1;
        return 0;
      });
    }
    return resultSort;
  }
  public static getFullName(e: EmployeesByCompanyId) {
    let name = '';
    if (e.lastName) name += e.lastName;
    if (e.middleName) name += ` ${e.middleName}`;
    if (e.firstName) name += ` ${e.firstName}`;
    if (name === '') {
      if (e.Lastname) name += e.Lastname;
      if (e.Firstname) name += ` ${e.Firstname}`;
    }
    return name;
  }

  public static getAttributeData(attributes: AttributeDimDTO[] | undefined, code: eAttribute) {
    if (!attributes) return 0;
    const data = attributes.find(r => r.code === code);
    if (data) {
      const { value } = data;
      if (value) {
        const r = parseFloat(value);
        return Number.isNaN(r) ? 0 : r;
      }
    }
    return 0;
  }

  public static fixNumber = (value: number) => {
    if (isNaN(value) || value === Infinity) {
      return 0;
    }
    return value;
  };

  public static createAttributes(attributesData: AttributeDimDTO[], attributes?: AttributeDimDTO[]): AttributeDimDTO[] {
    if (!attributes) return attributesData;
    let _attribute: AttributeDimDTO[] = [];
    if (attributesData) {
      attributesData.forEach(attribute => {
        if (attribute.id !== null && attribute.id !== undefined && attribute.code) {
          const attributeTemplate = attributes.find(a => a.code === attribute.code);
          if (attributeTemplate && attributeTemplate.id) {
            _attribute.push({
              value: attribute.value,
              name: attribute.name,
              code: attribute.code,
              valueType: attribute.valueType,
              status: attribute.status,
              notes: attribute.notes,
              defaultValue: attribute.defaultValue,
              companyId: attribute.companyId,
              AttributeId: attributeTemplate.id,
            });
          }
        }
      });
    } else {
      const attributeTemplate = attributes.find(a => a.code === eAttribute.Dinh_Muc_Luong);
      _attribute.push({
        value: '0',
        name: eAttribute.Dinh_Muc_Luong,
        code: eAttribute.Dinh_Muc_Luong,
        valueType: 0,
        status: 0,
        notes: '',
        defaultValue: '0',
        companyId: 1,
        AttributeId: attributeTemplate && attributeTemplate.id ? attributeTemplate.id : 32,
      });
    }
    return _attribute;
  }

  public static getPredecessorTypeByValue(value: number): EPredecessorType {
    switch (value) {
      case 1:
        return EPredecessorType.FinishToStart;
      case 2:
        return EPredecessorType.StartToStart;
      case 3:
        return EPredecessorType.FinishToFinish;
      case 4:
        return EPredecessorType.StartToFinish;
      default:
        return EPredecessorType.FinishToStart;
    }
  }

  public static getValueByPredecessorType(type: EPredecessorType) {
    switch (type) {
      case EPredecessorType.FinishToStart:
        return 1;
      case EPredecessorType.StartToStart:
        return 2;
      case EPredecessorType.FinishToFinish:
        return 3;
      case EPredecessorType.StartToFinish:
        return 4;
      default:
        return 1;
    }
  }

  public static calDateWithRelationship(date: string, lag: number) {
    return lag > 0 ? dayjs(date).add(lag, 'day') : dayjs(date).subtract(-lag, 'day');
  }

  public static convertDate = (dateString: string, format?: boolean) => {
    if (!/^\d{8}$/.test(dateString)) {
      throw new Error('Định dạng ngày không hợp lệ. Sử dụng YYYYMMDD.');
    }

    // Tách năm, tháng, ngày
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    if (format) {
      return `${day}/${month}/${year}`;
    } else {
      return `${year}/${month}/${day}`;
    }
  };

  public static getTrackerID = (trackers: Tracker[] | undefined, code: eTrackerCode) => {
    let trackerId = -1;
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === code);
      if (tracker && tracker.id) {
        trackerId = tracker.id;
      }
    }
    return trackerId;
  };

  public static checkAllowApproveHour = (data: ApprovedHoursWorkingPayload) => {
    // console.log('ApprovedHoursWorkingPayload ', data);
    // if (data?.day_Hours) {
    //   const time = dayjs(data.day_Hours, "HH:mm:ss", true);
    //   if (time) {
    //     let hour = time.hour();
    //     // hour = 4;
    //     if ((hour >= 3 && hour <= 4)
    //       || (hour >= 7 && hour <= 8)
    //       || hour > 8) {
    //       return true;
    //     }
    //   }
    // }
    // return false;
    return true;
  };

  public static roundTime = (time: Dayjs) => {
    let hour = 0;
    let minute = 0;
    let second = 0;
    const dateOnly = time.format('YYYY-MM-DD');
    if (time) {
      hour = time.hour();
      minute = time.minute();
      second = time.second();
      if (minute >= 30) {
        minute = 0;
        second = 0;
        hour = hour + 1;
      }
      return dayjs(`${dateOnly}T${hour}:${minute}:${second}`);
    }
    return time;
  };

  public static stringify = (user: any) => {
    try {
      return JSON.stringify(user);
    } catch (error) {
      return '';
    }
  };

  static readableFileSize(attachmentSize: number) {
    const DEFAULT_SIZE = 0;
    const fileSize = attachmentSize ?? DEFAULT_SIZE;

    if (!fileSize) {
      return `${DEFAULT_SIZE} KB`;
    }

    const sizeInKb = fileSize / 1024;

    if (sizeInKb > 1024) {
      return `${(sizeInKb / 1024).toFixed(2)} MB`;
    } else {
      return `${sizeInKb.toFixed(2)} KB`;
    }
  }

  static divideArray(array: any[], K: number) {
    let ans: any[] = [];
    let temp: any[] = [];
    array.forEach((item, i) => {
      temp.push(item);
      if ((i + 1) % K == 0) {
        ans.push(temp);
        temp = [];
      }
    });

    // If last group doesn't have enough
    // elements then add 0 to it
    if (temp.length !== 0) {
      let a = temp.length;
      while (a !== K) {
        temp.push(0);
        a++;
      }
      ans.push(temp);
    }
    return ans;
  }
  static formatStartAndEndDate(data: IssuesPagingResponse) {
    // [#19784][dung_lt][27/10/2024] lọc ngày lỗi => để trống
    const dateError = '1900-01-01T00:00:00';
    if (data?.results) {
      data.results = data.results.map(i => {
        if (i.plannedStartDate === dateError) {
          i.plannedStartDate = '';
        }
        if (i.plannedEndDate === dateError) {
          i.plannedEndDate = '';
        }
        return i;
      });
    }
  }

  // [24/10/2024][#20489][phuong_td] lấy giá trị của một employReportAttributes theo mã Attributes
  public static employReportAttributesValue = (
    employReportAttributes: EmployeeReportAttributesDTO[],
    code: eAttribute,
    attributes?: AttributeDimDTO[],
  ) => {
    if (!attributes) {
      return 0;
    }
    const attributeId = attributes.find(a => a.code === code)?.id;
    const data = employReportAttributes.find(a => a.attributeId === attributeId);
    if (data) {
      return data.value;
    }
    return 0;
  };

  // [24/10/2024][#20489][phuong_td] thêm loại number cần lấy
  static getNumber(value: any, type: 'float' | 'int' = 'float'): number {
    let nValue = 0;
    try {
      switch (type) {
        case 'float':
          nValue = parseFloat(value);
          break;
        case 'int':
          nValue = parseInt(value, 10);
          break;
      }
    } catch (error) {
      return 0;
    }
    if (isNaN(value) || value === undefined || value === Infinity) {
      return 0;
    }
    return nValue;
  }

  // [#20692][phuong_td][31/10/2024] lấy danh sách tên thuộc tính của một đối tượng
  static getKeys<T extends object>(obj: T): string[] {
    return Object.keys(obj) as Array<string>;
  }

  static setDataModified = (DataModified: any, key: string, value: any, type: string) => {
    const prev = DataModified[key] as any;
    if (prev) {
      prev[type] = value[type];
      DataModified[key] = prev;
    } else {
      DataModified[key] = value;
    }

    return DataModified;
  };
  static convertBlobToBase64 = (blob: Blob): Observable<string> => {
    return new Observable<string>(observer => {
      const reader = new FileReader();
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = error => observer.error(error);
      reader.readAsDataURL(blob);
    });
  };

  static getFileNmeWithoutExtension = (name: string) => {
    if (name) {
      const nameWithoutExtension = name.replace(/\.[^/.]+$/, '');
      return nameWithoutExtension;
    }

    return '';
  };
  // [09/11/2024][#20629][phuong_td] kiểm tra data có null hay không
  static checkNull(data: any) {
    return data === null || data === undefined;
  }
  // [09/11/2024][#20629][phuong_td] kiểm tra một ngày có nằm trong khoảng hai ngày không
  static isSameOrAfter(date: Dayjs, dateStart: Dayjs, dateEnd: Dayjs) {
    return (date.isAfter(dateStart) && date.isBefore(dateEnd)) || date.isSame(dateStart) || date.isSame(dateEnd);
  }
  static getDataTimeString(dateTime: Date) {
    // 2024-11-13T08:10:58
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  static reFormatDateFromIsoString(isoString: string) {
    // iso format to dd-mm-yyyy hh-mm-ss
    try {
      const date = new Date(isoString);

      const dd = String(date.getDate()).padStart(2, '0'); // Ngày (dd)
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (mm) (Lưu ý: tháng trong JavaScript bắt đầu từ 0)
      const yyyy = date.getFullYear(); // Năm (yyyy)

      const hh = String(date.getHours()).padStart(2, '0'); // Giờ (hh)
      const min = String(date.getMinutes()).padStart(2, '0'); // Phút (mm)
      const ss = String(date.getSeconds()).padStart(2, '0'); // Giây (ss)

      return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
    } catch {}
    return isoString;
  }

  static ParseNumber(strNum: any) {
    if (!strNum) return 0;
    try {
      return Number(strNum); // Lấy giá trị của tham số 'id'
    } catch (error) {}
    return 0;
  }

  // return array with fnc true first, then fnc false
  static partition = <T>(arr: T[], fn: (val?: T, i?: number, arr?: T[]) => boolean): [T[], T[]] =>
    arr.reduce(
      (acc, val, i, arr) => {
        acc[fn(val, i, arr) ? 0 : 1].push(val);
        return acc;
      },
      [[], []] as [T[], T[]]
    );
}

export const hasPermission = (userPermissions: { [key: string]: boolean }, requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions[permission] === true);
};

export const getAuthMenuItems = (items: MenuItem[], userPermissions: { [key: string]: boolean }): MenuItem[] => {
  return items
    .filter(item => !item.auth || hasPermission(userPermissions, item.auth))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: getAuthMenuItems(item.children, userPermissions),
        };
      }
      return item;
    })
    .filter(item => !item.children || item.children?.length > 0);
};

export function formatNumber(n: number, maxDigits = 4) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  });
}

export function convertMinutesToWorkday(minutes: number, decimals: number = 4): number {
  const MINUTES_PER_WORKDAY = 480;
  const workdays = minutes / MINUTES_PER_WORKDAY;
  
  return Number(workdays.toFixed(decimals));
}
export const openPdfFromBase64 = (base64Data: string, fileName: string = 'report.pdf'): any => {
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    // ✅ Mở file trong tab mới
    // window.open(url);

    // ❗ Hoặc tải về luôn:
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = fileName;
    // a.click();
    return url;
  } catch (error) {
    console.error('Lỗi khi mở file PDF:', error);
    return null;
  }
}

export function groupByGroupId(items: DataType[]): Record<string, DataType[]> {
  return items.reduce((acc, item) => {
    const groupId = item.groupId ? String(item.groupId) : 'undefined';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(item);
    return acc;
  }, {} as Record<string, DataType[]>);
}
