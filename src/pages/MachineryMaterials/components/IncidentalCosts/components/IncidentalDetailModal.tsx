/* eslint-disable import/order */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Col, Image, message, Modal, Row, Select, Table, Typography } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { paymentOptions, RoleEnum } from '@/common/define';
import { usePermission } from '@/hooks';
import fallbackSVG from '@/image/fallback.svg';
import { IAttachmentLinks, IncidentalData } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getSelectedIncidental } from '@/store/accountingInvoice';
import { getCurrentCompany, getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/types';
import { ConfirmField, handleConfirm } from '../utils';
import styles from './IncidentalCard.module.css';
import { AttachmentModal, UploadModal } from './ui';

// ------------------------------------------------------------------

interface IncidentalDetailModalProps {
  incidental: IncidentalData;
  onClose: () => void; // Thêm dòng này
}

const capDuyetHienTai = ({ isConfirmByRank1, isConfirmByRank2 }: IncidentalData): 0 | 1 | 2 =>
  isConfirmByRank2 ? 2 : isConfirmByRank1 ? 1 : 0;

// --------------------------------main---------------------------------
export default function IncidentalDetailModal({ incidental, onClose }: IncidentalDetailModalProps): React.JSX.Element {
  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();

  const user = useAppSelector(getCurrentUser());
  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(state => state.project.selectedProject);
  const dataAttachmentLinks = useAppSelector((state: RootState) => state.accountingInvoice.dataAttachmentLinks) || [];
  const incidentalSelected = useAppSelector(getSelectedIncidental()) || incidental;

  const firstApproveGranted = usePermission([], [RoleEnum.Director, RoleEnum.Deputy_Director]);
  const secondApproveGranted = usePermission([], [RoleEnum.Director]);

  const [modalAttachmentLinks, setModalAttachmentLinks] = useState(false);
  const [modalAddAttachmentLink, setModalAddAttachmentLink] = useState(false);
  const [selectAttach, setSelectAttach] = useState<IAttachmentLinks>();
  const [fileList, setFileList] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sizes, setSizes] = useState<(number | string)[]>(['40%', '60%']);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [selectAdditionalCost, setSelectAdditionalCost] = useState<IncidentalData>();
  const multipleLink = useAppSelector((state: RootState) => state.accountingInvoice.multipleImage) || [];

  const [deleteAttachmentLinks, setDeleteAttachmentLinks] = useState<{
    id: number;
    deletList: IAttachmentLinks[];
  }>({ id: 0, deletList: [] });
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);

  const handleCheckAll = (type: ConfirmField, value: boolean) => {
    const itemPayload = incidentalSelected.items?.map(d => handleConfirm(d, value, type, user));
    dispatch(
      accountingInvoiceActions.UpdateAdditionalCosts({
        dataCreates: itemPayload || [],
        companyId: company.id,
      }),
    );
    onClose();
  };
  // useEffect(() => {
  //   console.log(selectAttach, dataAttachmentLinks);
  // }, [selectAttach, dataAttachmentLinks]);
  useEffect(() => {
    if (selectedProject?.id && company.id) {
      dispatch(
        accountingInvoiceActions.getAdditionalCosts({
          projectId: selectedProject?.id,
          companyId: company.id,
        }),
      );
    } else {
      dispatch(
        accountingInvoiceActions.getAdditionalCosts({
          projectId: -1,
          companyId: company.id,
        }),
      );
    }
  }, [dispatch, selectedProject?.id, company.id]);
  useEffect(() => {
    if (incidentalSelected.attachmentLinks && incidentalSelected.attachmentLinks.length > 0) {
      const first = incidentalSelected.attachmentLinks[0];
      console.log(first);
      setSelectAttach(first);
      let attachItem: any[] = [];
      incidental?.items?.forEach(item => {
        if (Array.isArray(item.attachmentLinks)) {
          attachItem.push(...item.attachmentLinks);
        }
      });
      const keyDownload = `${incidental.id}-${attachItem.length}`;
      dispatch(
        accountingInvoiceActions.downloadMultipleImage({
          attachmentLinks: attachItem,
          companyId: company.id,
          keyDownload: keyDownload,
        }),
      );
      dispatch(
        accountingInvoiceActions.getImageUrlAttachmentLinks({
          drawingId: first.drawingId,
          fileName: first.fileName,
          companyId: company.id,
          itemId: first.itemId,
        }),
      );
    }
  }, [company.id, incidentalSelected]);

  const handleImageClick = useCallback(
    (record: IncidentalData) => {
      setSelectAdditionalCost(record);

      const hasAttachments = record?.attachmentLinks && record.attachmentLinks.length > 0;

      if (hasAttachments) {
        setModalAttachmentLinks(true);

        record.attachmentLinks!.forEach(x => {
          dispatch(
            accountingInvoiceActions.getImageUrlAttachmentLinks({
              drawingId: x.drawingId,
              fileName: x.fileName,
              companyId: company.id,
              itemId: x.itemId,
            }),
          );
        });
        setSelectAttach(record.attachmentLinks![0]);
      } else {
        // setFileList([]);
        setModalAddAttachmentLink(true);
      }
    },
    [dispatch, company.id],
  );

  const columns = useMemo<ColumnsType<IncidentalData>>(
    () => [
      {
        title: 'Mã chi phí',
        dataIndex: 'costCode',
        key: 'costCode',
        align: 'center',
        width: 200,
        fixed: 'left',
      },
      {
        title: 'Tên chi phí',
        dataIndex: 'costName',
        key: 'costName',
        align: 'center',
        width: 220,
        fixed: 'left',
      },
      // Ẩn cột Tài khoản nợ và Tài khoản có
      // {
      //   title: 'Tài khoản nợ',
      //   dataIndex: 'tkNo',
      //   key: 'tkNo',
      //   width: 120,
      //   align: 'center',
      // },
      // {
      //   title: 'Tài khoản có',
      //   dataIndex: 'tkCo',
      //   key: 'tkCo',
      //   width: 120,
      //   align: 'center',
      // },
      {
        title: 'Nhà cung cấp',
        dataIndex: 'ncc',
        key: 'ncc',
        align: 'center',
        width: 200,
      },
      {
        title: 'Mã khoản mục',
        dataIndex: 'maKM',
        key: 'maKM',
        width: 200,
        align: 'center',
      },
      {
        title: 'Mã vụ việc',
        dataIndex: 'mavc',
        key: 'mavc',
        align: 'center',
        width: 200,
      },
      { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 90, align: 'center' },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        align: 'center',
      },
      {
        title: 'Đơn giá',
        dataIndex: 'amount',
        key: 'amount',
        width: 130,
        align: 'center',
        render: v => Number(v).toLocaleString('en-US'),
      },
      {
        title: 'Thành tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 140,
        align: 'center',
        render: v => Number(v).toLocaleString('en-US'),
      },
      { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', width: 200, align: 'center' },
      {
        title: 'Hình thức thanh toán',
        dataIndex: 'paymentType',
        width: 200,
        align: 'center',
        render: (_, record, idx) => (
          <Select
            placeholder="Chọn hình thức thanh toán"
            options={paymentOptions}
            // value={incidental.paymentType}
            value={record.paymentType}
            onChange={value => {
              // const updatedIncidental = { ...incidentalSelected, paymentType: value };
              const updatedIncidental = { ...record, paymentType: value };
              // setSelectAdditionalCost(updatedIncidental);
              dispatch(
                accountingInvoiceActions.UpdateAdditionalCosts({
                  dataCreates: [updatedIncidental],
                  companyId: company.id,
                }),
              );
            }}
            style={{ width: '100%' }}
          />
        ),
      },
      {
        title: t('Hình ảnh'),
        dataIndex: 'hinhanh',
        width: 120,
        fixed: 'left',
        render: (_, record) => {
          let img;
          if (multipleLink && multipleLink.length > 0) {
            const first = record.attachmentLinks[0];
            if (first) {
              const drawingId = first.drawingId;
              const selectedImage = multipleLink.find(link => link.drawingId === drawingId);
              img = selectedImage?.imageUrl;
            }
          }
          const src = img || selectAttach?.imageUrl || fallbackSVG;
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleImageClick(record)}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleImageClick(incidental);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <Image
                preview={false}
                width={96}
                height={96}
                style={{ objectFit: 'cover' }}
                src={src}
                alt={t('Hình ảnh')}
                fallback={fallbackSVG}
              />
            </div>
          );
        },
      },
    ],
    [handleImageClick, incidentalSelected, dataAttachmentLinks, selectAttach, t, company.id, dispatch],
  );

  const handleDeleteClick = useCallback(() => {
    if (incidentalSelected && incidentalSelected.attachmentLinks.length > 0) {
      const deletList = incidentalSelected.attachmentLinks.filter(x => x.selected);
      if (deletList && deletList.length > 0) {
        setModalConfirm(true);
        setDeleteAttachmentLinks({ id: incidentalSelected.id || -1, deletList });
      } else {
        setDeleteAttachmentLinks({ id: 0, deletList: [] });
      }
    }
  }, [incidentalSelected]);

  const handleConfirmDelete = useCallback(() => {
    setModalConfirm(false);
    if (deleteAttachmentLinks && deleteAttachmentLinks.deletList.length > 0) {
      const itemId = deleteAttachmentLinks.deletList[0].itemId;
      const drawingIds = deleteAttachmentLinks.deletList.map(x => x.drawingId);
      dispatch(
        accountingInvoiceActions.deleteAttachmentLinks({
          itemId,
          drawingIds,
          id: deleteAttachmentLinks.id,
          projectId: selectedProject?.id,
          companyId: company.id,
        }),
      );

      setSelectAttach(undefined);
      setSelectAll(false);
    }
  }, [deleteAttachmentLinks, dispatch, selectedProject?.id, company.id]);

  const updateSelectAttach = useCallback(
    (it: IAttachmentLinks) => {
      if (dataAttachmentLinks) {
        dataAttachmentLinks.forEach(x => {
          if (it && it.drawingId === x.drawingId) {
            setSelectAttach({ ...it, imageUrl: x.imageUrl });
          }
        });
      }
    },
    [dataAttachmentLinks],
  );

  const handleAttachClick = useCallback(
    (attach: IAttachmentLinks) => {
      if (selectAdditionalCost) {
        const attachs = { ...selectAdditionalCost };
        attachs?.attachmentLinks?.forEach((it: IAttachmentLinks) => {
          if (attach.drawingId === it.drawingId) {
            it = { ...it, selected: true };
            updateSelectAttach(it);
          } else {
            it = { ...it, selected: false };
          }
        });

        setSelectAdditionalCost(attachs);
      }
    },
    [selectAdditionalCost, updateSelectAttach],
  );

  const handleCheckboxChange = useCallback(
    (id: number, checked: boolean) => {
      if (selectAdditionalCost && selectAdditionalCost.attachmentLinks) {
        const updatedAttachmentLinks = selectAdditionalCost.attachmentLinks.map((attach: IAttachmentLinks) => {
          if (attach.id === id) {
            return { ...attach, selected: checked };
          }
          return attach;
        });
        setSelectAdditionalCost({
          ...selectAdditionalCost,
          attachmentLinks: updatedAttachmentLinks,
        });
        const allSelected = updatedAttachmentLinks.every((attach: IAttachmentLinks) => attach.selected);
        setSelectAll(allSelected);
      }
    },
    [selectAdditionalCost],
  );
  const handleSelectAllChange = useCallback(
    (e: CheckboxChangeEvent) => {
      const checked = e.target.checked;
      setSelectAll(checked);
      if (selectAdditionalCost && selectAdditionalCost.attachmentLinks) {
        const updatedAttachmentLinks = selectAdditionalCost.attachmentLinks.map((attach: IAttachmentLinks) => ({
          ...attach,
          selected: checked,
        }));

        setSelectAdditionalCost({
          ...selectAdditionalCost,
          attachmentLinks: updatedAttachmentLinks,
        });
      }
    },
    [selectAdditionalCost],
  );

  const handleUploadOk = useCallback(() => {
    if (!fileList.length) {
      message.warning('Chưa có hình ảnh nào để upload.');
      return;
    }
    setPendingUploadFiles(fileList.map((f: any) => f.originFileObj));
    setModalAddAttachmentLink(false);
  }, [fileList]);

  const handleUploadChange = useCallback((info: any) => {
    const { fileList } = info;
    setFileList(fileList);
  }, []);

  return (
    <>
      <Row>
        <Typography.Title level={4}>{t('Approve incidental costs')}</Typography.Title>
      </Row>

      <Col span={24} style={{ marginBottom: 8 }}>
        <Typography.Text strong>
          Tên công trình: {incidentalSelected.projectName ? incidentalSelected.projectName : 'Tổng'}
        </Typography.Text>
      </Col>
      <Row gutter={16} style={{ marginBottom: 10 }}>
        <Col span={5} style={{ display: 'flex', alignItems: 'center' }}>
          <Typography.Text strong>Cấp duyệt hiện tại: {capDuyetHienTai(incidentalSelected)}</Typography.Text>
        </Col>

        <Col span={5}>
          <Typography.Text strong>
            Ngày tạo phiếu: {dayjs(incidentalSelected.createDate).format('DD/MM/YYYY')}
          </Typography.Text>
        </Col>

        <Col span={5}>
          <Typography.Text strong>Mã đơn vị: {incidentalSelected.madvcs}</Typography.Text>
        </Col>

        <Col span={8}>
          <Typography.Text strong>Người chi - nội dung chi: {incidentalSelected.payer}</Typography.Text>
        </Col>
      </Row>

      <Table
        className={styles.tableWrapper}
        rowKey={record => record.id!}
        // dataSource={[incidental]}
        dataSource={incidentalSelected.items?.length ? incidentalSelected.items : [incidentalSelected]}
        columns={columns}
        pagination={false}
        scroll={{ x: 1200 }}
      />

      <strong style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        Tổng thành tiền: {Number(incidentalSelected.totalAmount).toLocaleString('en-US')} VNĐ
      </strong>

      <Button
        type="primary"
        style={{ float: 'right', marginTop: 16 }}
        onClick={() => {
          if (secondApproveGranted && incidentalSelected.isConfirmByRank1 && !incidentalSelected.isConfirmByRank2) {
            handleCheckAll('isConfirmByRank2', true);
          } else if (firstApproveGranted && !incidentalSelected.isConfirmByRank1) {
            handleCheckAll('isConfirmByRank1', true);
          }
        }}
        disabled={
          incidentalSelected.isConfirmByRank2 ||
          (!firstApproveGranted && !secondApproveGranted) ||
          (secondApproveGranted && !incidentalSelected.isConfirmByRank1 && !firstApproveGranted) ||
          (!secondApproveGranted && incidentalSelected.isConfirmByRank1)
        }
      >
        Duyệt
      </Button>

      <AttachmentModal
        visible={modalAttachmentLinks}
        onClose={() => setModalAttachmentLinks(false)}
        onAddClick={() => {
          // setFileList([]);
          setModalAddAttachmentLink(true);
        }}
        onDeleteClick={handleDeleteClick}
        onAttachClick={handleAttachClick}
        onCheckboxChange={handleCheckboxChange}
        onSelectAllChange={handleSelectAllChange}
        selectAll={selectAll}
        attachments={selectAdditionalCost?.attachmentLinks}
        selectedAttach={selectAttach}
        sizes={sizes}
        onResize={setSizes}
      />

      <UploadModal
        visible={modalAddAttachmentLink}
        onOk={handleUploadOk}
        onCancel={() => setModalAddAttachmentLink(false)}
        fileList={fileList}
        onUploadChange={handleUploadChange}
      />

      <Modal
        title={'Xác nhận xóa'}
        open={modalConfirm}
        onOk={handleConfirmDelete}
        onCancel={() => setModalConfirm(false)}
        okText="Xác nhận"
      >
        {t('Bạn có chắc chắn muốn xóa hình ảnh này không?')}
      </Modal>
    </>
  );
}
