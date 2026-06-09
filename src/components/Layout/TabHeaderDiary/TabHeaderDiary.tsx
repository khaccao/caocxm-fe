/* eslint-disable import/order */
import { eTypeDieuChuyen, FormatDateAPI } from '@/common/define';
import { maKhoTongVT } from '@/environment';
import { accountingInvoiceActions, getDieuchuyenvattu, getTypeDieuChuyen, getUpdateTransfer } from '@/store/accountingInvoice';
import { getCurrentUser } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import { PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, DatePicker, Tabs, TabsProps, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './TabHeaderDiary.css';

interface TabHeaderDiaryProps {
  onDownload: () => void;
  onSelectDate: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onEllipOutLine?: () => void;
  onAddTransfer?: () => void;
  text?: string;
  addButtonProps?: ButtonProps;
}

const TabHeaderDiary: React.FC<TabHeaderDiaryProps> = ({
  onSelectDate,
  onDownload,
  onEllipOutLine,
  onAddTransfer,
  text,
  addButtonProps,
}) => {
  const dispatch = useDispatch();

  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const user = useAppSelector(getCurrentUser());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const Dieuchuyenvattu = useAppSelector(getDieuchuyenvattu());
  const transferList = useAppSelector(getUpdateTransfer());
  const selectedProject = useAppSelector(getSelectedProject());
  const typeDieuChuyen = useAppSelector(getTypeDieuChuyen());
  const [transferChange, setTransferChange] = useState<any[]>([]);

  useEffect(() => {
    const filteredTransfers = (Array.isArray(transferList) ? transferList : []).filter(item => {
      if (item.ma_ct !== 'PXDC') return false;

      const matchingItem = Dieuchuyenvattu?.find((dc: { id: any }) => dc.id === item.id);
      if (!matchingItem) return true;

      return item.release !== matchingItem.release;
    });
    setTransferChange(filteredTransfers);
  }, [transferList, Dieuchuyenvattu]);

  const handleUpdateTransfer = async () => {
    console.log(transferChange);
    const inputData = transferChange.flatMap(item => [
      {
        guid: item.guid,
        propertyName: "release",
        propertyValue: item.release ? '1' : '0',
      },
      {
        guid: item.guid,
        propertyName: "nguoiDuyet3",
        propertyValue: user.Firstname || "",
      },
    ]);

    dispatch(accountingInvoiceActions.updateChungTuRequest(inputData));
    if (selectedProject && projectwareHouses) {
      const warehouseCode = projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode;
      if (!warehouseCode) {
        return;
      }
      dispatch(
        accountingInvoiceActions.GetDieuChuyenVatTu({
          madvcs: 'THUCHIEN',
          tu_ngay: dayjs().startOf('month').format(FormatDateAPI),
          den_ngay: dayjs().endOf('month').format(FormatDateAPI),
          ma_kho: warehouseCode,
        }),
      );
    } else {
      dispatch(
        accountingInvoiceActions.GetDieuChuyenVatTu({
          madvcs: 'THUCHIEN',
          tu_ngay: dayjs().startOf('month').format(FormatDateAPI),
          den_ngay: dayjs().endOf('month').format(FormatDateAPI),
          ma_kho: maKhoTongVT,
        }),
      );
    }
    dispatch(accountingInvoiceActions.setUpdateTransfer([]));
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setSelectedDates(dates);
    onSelectDate(dates || [null, null]);
  };

  const tabs: TabsProps['items'] = [
    {
      key: eTypeDieuChuyen.VatTuChinh,
      label: 'Điều chuyển vật tư chính',
    },
    {
      key: eTypeDieuChuyen.VatTuPhu,
      label: 'Điều chuyển vật tư phụ',
    },
    {
      key: eTypeDieuChuyen.MayMoc,
      label: 'Điều chuyển máy móc - CCDC',
    },
  ];

  const updateTransfer = (key: any) => {
    dispatch(accountingInvoiceActions.setTypeDieuChuyen(key))
  }
  return (
    <div className="tab-header-diary-container">
      {text === 'Điều chuyển vật tư' ? (
        <Tabs
          defaultActiveKey={eTypeDieuChuyen.VatTuChinh}
          activeKey={typeDieuChuyen}
          items={tabs}
          onChange={updateTransfer}
          className="transfer-tabs"
        />
      ) : (
        <Typography.Title level={4}>{text && <span>{text}</span>}</Typography.Title>
      )}

      <div className="tab-header-diary">
        {/* {text === 'Điều chuyển vật tư' && (
          <Button
            style={{
              marginRight: 8,
              backgroundColor: '#22c55e',
              color: 'white',
            }}
            onClick={handleUpdateTransfer}
            className="confirm-transfer-button"
          >
            Xác nhận
          </Button>
        )} */}
        <DatePicker.RangePicker
          defaultValue={selectedDates ?? undefined}
          onChange={handleRangeChange}
          className="date-picker"
        />
        {text !== 'Nhật ký vật tư, máy móc, CCDC' && (
          <Button
            icon={<PlusOutlined />}
            style={{
              display: text === 'Tổng hợp chi phí' ? 'none' : !addButtonProps?.hidden ? 'flex' : 'none',
            }}
            onClick={onAddTransfer}
            type="primary"
            className="add-transfer-button"
            {...addButtonProps}
          >
            Thêm điều chuyển
          </Button>
        )}
      </div>
    </div>
  );
};
export default TabHeaderDiary;
