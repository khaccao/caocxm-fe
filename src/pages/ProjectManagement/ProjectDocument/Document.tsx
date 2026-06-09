import { useEffect, useRef } from 'react';

import { defaultPagingParams } from '@/common/define';
import { DocumentsTable } from '@/pages/Components/Document/DocumentsTable';
import { DocumentsToolbar } from '@/pages/Components/Document/DocumentsToolbar';
import { ProjectDocumentsHeader } from '@/pages/Components/Document/ProjectDocumentHeader';
import { getActiveMenu } from '@/store/app';
import { documentActions, getFolderRootId, getPathDocument, getDocumentQueryParams } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject, getFileRoots } from '@/store/project';

export const Documents = () => {
  const dispatch = useAppDispatch();
  const folderRootId = useAppSelector(getFolderRootId());
  const documentPath: any = useAppSelector(getPathDocument());
  const selectedProject = useAppSelector(getSelectedProject());
  const listDataFileRoots = useAppSelector(getFileRoots());
  const activeMenu = useAppSelector(getActiveMenu());
  const params = useAppSelector(getDocumentQueryParams());
  const isCallRef = useRef(true);
  // [#][hao_lt][23/10/2024]_Tài liệu dự thầu - set path rỗng khi vào dự án
  useEffect(() => {
    if (selectedProject) {
      // [#][hao_lt][23/10/2024]_Tài liệu dự thầu- lấy rootid của tailieuduthau
      if (listDataFileRoots && listDataFileRoots?.results?.length > 0) {
        const rootId = listDataFileRoots.results.find((i: any) => i.name === 'tailieuduan');
        if (rootId) {
          dispatch(documentActions.setFolderRootId(rootId?.id));
        } else {
          isCallRef.current = false;
          dispatch(documentActions.setFolderRootId(null));
          dispatch(documentActions.setDocuments([]));
        }
      }
      dispatch(documentActions.setDocumentPath([]));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const lastPath = documentPath[documentPath?.length - 1];
    if (lastPath) {
      dispatch(documentActions.getLabelRequest({ documentId: lastPath?.id, params: defaultPagingParams }));
    } else {
      if (folderRootId && isCallRef.current) {
        dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
      }
    }
    // eslint-disable-next-line
  }, [folderRootId, documentPath, selectedProject]);

  const handleSearchChange = (search: string) => {
    const newParams = { ...params, page: 1, search };
    if (!documentPath?.length && folderRootId) {
      dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: newParams }));
    } else {
      const lastPath = documentPath[(documentPath?.length || 1) - 1];
      if (lastPath) {
        dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: newParams }));
      }
    }
  };

  return (
    <>
      <ProjectDocumentsHeader
        title={activeMenu?.label}
        pass={activeMenu}
        initialSearch={params.search}
        onSearchChange={handleSearchChange}
      />
      <DocumentsTable
        pass={activeMenu}
        policies={{
          create: ['TaiLieuDuAn.Create'],
          delete: ['TaiLieuDuAn.Delete'],
        }}
      />
    </>
  );
};
