import { message } from 'antd';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { catchError, concatMap, mergeMap } from 'rxjs/operators';

import { DocumentResponse, DocumentService } from './DocumentService';
import { StringKeyValue } from './types';
import { FileStatus, FileStatusConstant } from '@/common/define';


const statusList = new BehaviorSubject<FileStatus[]>([]); 
const uploadingStatus = new Subject<boolean>(); 

export const uploadFiles = (params: StringKeyValue, fileList: FileStatus[], setProgress: (x: FileStatus) => void, successCallback?: () => void) => {
  const upload$ = from(fileList).pipe(
    concatMap((fileForm) => {
      uploadingStatus.next(true);
      return DocumentService.Post.uploadFiles(fileForm?.file ?? new FormData(), (progress) => {
        if(fileForm) {
          fileForm = {...fileForm, percent: progress};
          setProgress(fileForm)
        }
      }, { search: params,}).pipe(
        mergeMap((response: DocumentResponse) => {
            console.log('Upload success:', response);
            if(fileForm) {
                fileForm = {...fileForm, percent: 100, status: FileStatusConstant.success};
                setProgress(fileForm)
              }
          return [response];
        }),
        catchError(errors => {
            console.log('Upload fail:', errors);
            if(fileForm) {
                fileForm = {...fileForm, percent: 100, status: FileStatusConstant.error, error: errors};
                setProgress(fileForm)
              }
            return [];
        })
      )}
    )
  );


  upload$.subscribe({
    next: response => {
      console.log('Upload success:', response);
      successCallback && successCallback();
    },
    error: error => {
      console.error('Upload error:', error);
    },
    complete: () => {
      console.log('All uploads complete');
      uploadingStatus.next(false);
      statusList.next(fileList);
      successCallback && successCallback();
    }
  });
  return upload$;
};
export const getStatusList = () => statusList.asObservable();
export const getUploadingStatus = () => uploadingStatus.asObservable();