/* eslint-disable import/order */
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';

import { AppStore } from '@/store';
import { appActions } from '@/store/app';
import { buildRequestUrl, extractHeaders, removeCustomKeys } from './HttpHelper';
import { IdentityService } from './IdentityService';
import { RequesterConfig, RequestOptions } from './types';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

let store: AppStore;
export const injectStore = (reduxStore: AppStore) => {
  store = reduxStore;
};

const mapResponse = (isReturnHeader: boolean = false) =>
  map((x: AjaxResponse<any>, index) => (isReturnHeader ? x : x.response));

const tokenSubject = new BehaviorSubject<string | null>(null);
let isRefreshing = false;
let refreshTokenSuccess = false;
const requestQueue: any[] = [];

export const setToken = (token: string | null) => {
  tokenSubject.next(token);
};

const handleTokenRefresh = (): Observable<string> => {
  const state = store.getState();
  const { preferences } = state.user;
  const { auth } = state.app;
  const loginData = {
    grant_type: 'refresh_token',
    refresh_token: auth?.refresh_token,
    remember: true,
    orgId: auth?.orgId ?? preferences?.defaultOrganization,
  };

  return IdentityService.Post.login(loginData).pipe(
    map((tokenRes: any) => {
      setToken(tokenRes.access_token);
      const { dispatch } = store;
      dispatch(appActions.loginSuccess({ loginResponse: tokenRes, loginData }));
      return tokenRes.access_token as string;
    }),
    catchError(refreshError => throwError(() => refreshError)),
  );
};

const sendHttpRequest = (url: string, options: RequestOptions, headers?: any) => {
  const ajaxRequest = removeCustomKeys(options);
  return ajax({ url, headers, ...ajaxRequest }).pipe(mapResponse(options.isReturnHeader));
};

const httpRequest = (url: string, options: RequestOptions): Observable<any> => {
  const mergedConfig: RequesterConfig = { includeJSONHeaders: true };
  const rUrl = buildRequestUrl(url, options.search);
  const rHeaders = extractHeaders(options, Boolean(mergedConfig.includeJSONHeaders));

  return tokenSubject.pipe(
    take(1),
    switchMap(token => {
      const headersWithToken = token ? { ...rHeaders, Authorization: `Bearer ${token}` } : rHeaders;
      return sendHttpRequest(rUrl, options, headersWithToken).pipe(
        catchError((error: AjaxError) => {
          const state = store.getState();
          const { auth } = state.app;
          console.log(error.status, auth?.remember, isRefreshing);
          if (error.status === 401 && auth?.remember) {
            if (!isRefreshing) {
              isRefreshing = true;
              return handleTokenRefresh().pipe(
                switchMap((newToken: string) => {
                  isRefreshing = false;
                  refreshTokenSuccess = true;
                  const updatedHeaders = { ...rHeaders, Authorization: `Bearer ${newToken}` };
                  return sendHttpRequest(rUrl, options, updatedHeaders);
                }),
                catchError(refreshError => {
                  isRefreshing = false;
                  refreshTokenSuccess = false;
                  return throwError(() => refreshError);
                }),
                finalize(() => {
                  isRefreshing = false;
                  if (refreshTokenSuccess) {
                    refreshTokenSuccess = false;
                    const newRequests = requestQueue.map(queuedRequest => {
                      return () => queuedRequest();
                    });
                    requestQueue.length = 0;
                    newRequests.forEach(queuedRequest => queuedRequest());
                  } else {
                    requestQueue.length = 0;
                    store.dispatch(appActions.logout({}));
                  }
                }),
              );
            } else {
              return new Observable<any>(observer => {
                requestQueue.push(() => httpRequest(url, options).subscribe(observer));
              });
            }
          } else if (error.status === 401) {
            const { dispatch } = store;
            dispatch(appActions.logout({}));
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};

class HttpInterceptor {
  request(method: HttpMethod, url: string, body?: any, options?: RequestOptions) {
    return httpRequest(url, { ...options, method, body });
  }

  get(url: string, options?: RequestOptions) {
    return this.request(HttpMethod.GET, url, undefined, options);
  }

  post(url: string, body?: any, options?: RequestOptions, p0?: { responseType: string; }) {
    return this.request(HttpMethod.POST, url, body, options);
  }

  put(url: string, body?: any, options?: RequestOptions) {
    return this.request(HttpMethod.PUT, url, body, options);
  }

  delete(url: string, options?: Object, body?: any) {
    return this.request(HttpMethod.DELETE, url, body, options);
  }

  /**
   * Updates the progress using the passed setProgress function.
   * @param url
   * @param setProgress khai báo const [progress, setProgress] = useState(0); trong component, sau đó sử dụng setProgress như parameters
   * @param body
   * @param options
   * @returns
   */
  upload(url: string, setProgress: any, body?: any, options?: RequestOptions) {
    const customOptions: RequestOptions = {
      ...options,
      // headers: {
      //   ...options?.headers,
      //   'Content-Type': 'multipart/form-data' // Not needed, FormData sets this
      // },
      // Custom xhr function to include progress event
      createXHR: () => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = event => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`File upload progress: ${percentComplete}%`);
            setProgress(percentComplete);
          }
        };
        return xhr;
      },
    };
    return this.request(HttpMethod.POST, url, body, customOptions);
  }
}

const HttpClient = new HttpInterceptor();
export default HttpClient;
