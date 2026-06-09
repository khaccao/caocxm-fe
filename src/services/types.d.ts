import { Observable } from 'rxjs';
import { AjaxRequest, AjaxResponse } from 'rxjs/ajax';

export type StringKeyValue = {
  [key: string]: string | number | boolean;
};

export type RequestOptions = Partial<AjaxRequest> & {
  search?: StringKeyValue;
  headers?: StringKeyValue;
  isReturnHeader?: boolean;
  createXHR?: () => XMLHttpRequest;
};

export type RequesterConfig = {
  log?: boolean;
  includeJSONHeaders?: boolean;
};

export type Requester = {
  request(url: string, options?: RequestOptions): Observable<AjaxResponse<any>>;
};
