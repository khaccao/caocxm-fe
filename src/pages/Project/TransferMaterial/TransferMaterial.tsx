/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Modal } from 'antd';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';

import { eTypeDieuChuyen, FormatDateAPI } from '@/common/define';
import TabHeaderDiary from '@/components/Layout/TabHeaderDiary/TabHeaderDiary';
import { usePermission } from '@/hooks';
import { accountingInvoiceActions, getDieuchuyenvattu, getProducts, getTypeDieuChuyen } from '@/store/accountingInvoice';
import { useAppSelector } from '@/store/hooks';
import { showModal } from '@/store/modal';
import { getSelectedProject, projectActions } from '@/store/project';
import { RootState } from '@/store/types';
import NewTranMaterials from './components/NewTranMaterials';
import TranMaterials from './components/TranMaterials';

export const TransferMaterial = () => {
  const dispatch = useDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const DanhSachVatTu = useAppSelector(getProducts());
  const [wh, setWh] = useState<string | undefined>(undefined);
  const typeDieuChuyen = useAppSelector(getTypeDieuChuyen());

  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const data = useAppSelector(getDieuchuyenvattu());
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    dispatch(accountingInvoiceActions.GetProducts({ params: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log(wh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wh]);
  //[10/1/2025][ngoc_td] lỗi filter của điều chuyển vật tư, chỉ lấy danh sách điều chuyển theo mã kho vật tư
  useEffect(() => {
    const isMayMoc = typeDieuChuyen === eTypeDieuChuyen.MayMoc;
    let warehouseCode: string | undefined;

    if (selectedProject && projectwareHouses) {
      warehouseCode = projectwareHouses.find(wh =>
        isMayMoc ? wh.warehouseCode.includes('CCDC') : !wh.warehouseCode.includes('CCDC')
      )?.warehouseCode;
    } else {
      warehouseCode = '';
    }

    setWh(warehouseCode);

    dispatch(
      accountingInvoiceActions.GetDieuChuyenVatTu({
        madvcs: 'THUCHIEN',
        tu_ngay: dayjs().startOf('month').format(FormatDateAPI),
        den_ngay: dayjs().endOf('month').format(FormatDateAPI),
        ma_kho: warehouseCode || '',
      })
    );
  }, [selectedProject]);
  const handleDownload = () => { };
  const handleSelectDate = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {

    if (dates) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        dispatch(
          accountingInvoiceActions.setDateTransfers({
            startDate: startDate.format('YYYY/MM/DD'),
            endDate: endDate.format('YYYY/MM/DD'),
          }),
        );
        const isMayMoc = typeDieuChuyen === eTypeDieuChuyen.MayMoc;
        let warehouseCode: string | undefined;

        if (selectedProject && projectwareHouses) {
          warehouseCode = projectwareHouses.find(wh =>
            isMayMoc ? wh.warehouseCode.includes('CCDC') : !wh.warehouseCode.includes('CCDC')
          )?.warehouseCode;
        } else {
          warehouseCode = '';
        }

        // if (!warehouseCode) return;
        setWh(warehouseCode);
        dispatch(
          accountingInvoiceActions.GetDieuChuyenVatTu({
            madvcs: 'THUCHIEN',
            tu_ngay: startDate.format(FormatDateAPI),
            den_ngay: endDate.format(FormatDateAPI),
            ma_kho: warehouseCode || '',
          }),
        );

      }
    } else {
      console.log('Khoảng thời gian chưa được chọn đầy đủ.');
    }
  };

  const getprojectwareHouses = () => {
    if (selectedProject) {
      dispatch(
        projectActions.getWarehousesRequest({
          projectId: selectedProject.id,
        }),
      );
    }
  };

  // Lấy danh sách warehouse khi component mount hoặc khi selectedProject thay đổi
  useEffect(() => {
    getprojectwareHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const handleAddTransfer = () => {
    setIsModalVisible(true);
    dispatch(showModal({ key: 'hideCreatePhieuDieuChuyenSuccess' }));
  };
  const addTransferGranted = usePermission(['KhoCongTy.DieuChuyenVatTu.CreateTransfer']);

  return (
    <div>
      <TabHeaderDiary
        text={'Điều chuyển vật tư'}
        onDownload={handleDownload}
        onSelectDate={handleSelectDate}
        onAddTransfer={handleAddTransfer}
        addButtonProps={{ disabled: !addTransferGranted, hidden: false }}
      />
      <TranMaterials />
      <Modal open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={1250}>
        <NewTranMaterials setIsModalVisible={setIsModalVisible} wh={wh || ''} />
      </Modal>
    </div>
  );
};