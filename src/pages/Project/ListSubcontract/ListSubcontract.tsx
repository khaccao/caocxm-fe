/* eslint-disable import/order */
import { useEffect } from 'react';

import { defaultPagingParams } from '@/common/define';
import { documentActions, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFileRoots, getSelectedProject } from '@/store/project';
import ContractsTable from './components/ContractsTable/ContractsTable';
import { ListSubcontractHeader } from './ListSubcontractHeader';

const ListSubcontract = () => {
  const dispatch = useAppDispatch();
  const folderRootId = useAppSelector(getFolderRootId());
  const documentPath: any = useAppSelector(getPathDocument());
  const selectedProject = useAppSelector(getSelectedProject());
  const listDataFileRoots = useAppSelector(getFileRoots());

  useEffect(() => {
    if (selectedProject) {
      //[#20508][dung_lt][24/10/2024]_ Hợp đồng thầu phụ- lấy rootid của hopdongthauphu
      if (listDataFileRoots && listDataFileRoots?.results?.length > 0) {
        const rootId = listDataFileRoots.results.find((i: any) => i.name === 'hopdongthauphu');
        rootId && dispatch(documentActions.setFolderRootId(rootId?.id));
      }
      dispatch(documentActions.setDocumentPath([]));
    }
    // eslint-disable-next-line
  }, []);

  //[#20508][dung_lt][24/10/2024]_ get label theo path hoặc forderRootId
  useEffect(() => {
    const lastPath = documentPath[documentPath?.length - 1];
    if (lastPath) {
      dispatch(documentActions.getLabelRequest({ documentId: lastPath?.id, params: defaultPagingParams }));
    } else {
      if (folderRootId) {
        dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
      }
    }
    // eslint-disable-next-line
  }, [folderRootId, documentPath, selectedProject]);

  return (
    <>
      <ListSubcontractHeader />
      <ContractsTable
        hdtp={1}
        policies={{
          create: ['HopDongThauPhu.Create'],
          delete: ['HopDongThauPhu.Delete'],
          edit: ['CongDoan.ChiQuyCD.Edit'],
        }}
      />
    </>
  );
};
export default ListSubcontract;
