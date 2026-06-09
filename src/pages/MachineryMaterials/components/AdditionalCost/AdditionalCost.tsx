import { useEffect, useState } from 'react';
import React from 'react';

import { ExclamationCircleOutlined,InboxOutlined } from '@ant-design/icons';
import { Table, Checkbox, Avatar, Modal, Flex, Splitter, Image, Button, Upload } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType } from 'antd/es/table';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './AdditionalCost.module.css';
import ExpenseFormUpdate from '../AddAriseNew/ExpenseFormUpdate';
import { eTypeVatTuMayMoc, FormatDateAPI, RoleEnum } from '@/common/define';
import { eColumnsTpye, iColumnsConfig, TableCustom } from '@/components/TableCustom';
import { usePermission } from '@/hooks';
import { CostDataCreate, DataType, IAttachmentLinks } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { getCurrentUser, getgetUserIIS } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getEmployeesByCompanyId, getProjectList, getSelectedProject, projectActions } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';

type AdditionalCostProps = {
  type: eTypeVatTuMayMoc;
};
const AdditionalCost = (props: AdditionalCostProps) => {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const projects = useAppSelector(getProjectList());
  const company = useAppSelector(getCurrentCompany());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const additionalCosts = useAppSelector((state: RootState) => state.accountingInvoice.AdditionalCosts) || [];
  const additionalCostAll = useAppSelector((state: RootState) => state.accountingInvoice.AdditionalCostAll) || [];
  const dataAttachmentLinks = useAppSelector((state: RootState) => state.accountingInvoice.dataAttachmentLinks) || []; // data imageUrl
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DataType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation('material');
  const [modalAttachmentLinks, setModalAttachmentLinks] = useState(false);
  const [modalAddAttachmentLink, setModalAddAttachmentLink] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [sizes, setSizes] = React.useState<(number | string)[]>(['40%', '60%']);
  const [selectAttach, setSelectAttach] = React.useState<IAttachmentLinks>();
  const [selectAdditionalCost, setSelectAdditionalCost] = React.useState<DataType>();
  const [deleteAttachmentLinks, setDeleteAttachmentLinks] = React.useState<{
    id: number;
    deletList: IAttachmentLinks[];
  }>({ id: 0, deletList: [] });
  const [fileList, setFileList] = useState([]);
  const tProjects = useTranslation(['projects']).t;
  const tShift = useTranslation(['shift']).t;
  const [selectAll, setSelectAll] = React.useState(false);
  const editGranted = usePermission(['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Edit']);
  const deleteGranted = usePermission(['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Delete']);
  const firstApproveGranted = usePermission([], [RoleEnum.Director, RoleEnum.Deputy_Director]);
  const secondApproveGranted = usePermission([], [RoleEnum.Director]);
  
  const user = useAppSelector(getCurrentUser());

  let DataModifine: { [key: string]: DataType } = {};
  const columnsConfig: { [key: string]: iColumnsConfig } = {
    // checkbox: {
    //   width: 20,
    //   type: eColumnsTpye.checkbox,
    // },
    costCode: {
      hidden: true,
      title: t('Cost code'),
      width: 20,
      type: eColumnsTpye.text,
    },
    costName: {
      title: t('Cost name'),
      width: 200,
      type: eColumnsTpye.text,
    },
    projectName: {
      title: tShift('Project'),
      width: 200,
      type: eColumnsTpye.text,
    },
    unit: {
      title: t('Unit'),
      width: 60,
      type: eColumnsTpye.text,
    },
    createDate: {
      title: t('Day'),
      width: 100,
      type: eColumnsTpye.date,
    },
    amount: {
      title: t('amount of money'),
      width: 50,
      type: eColumnsTpye.number,
    },
    quantity: {
      title: t('Quantity'),
      width: 50,
      type: eColumnsTpye.number,
    },
    totalAmount: {
      title: t('Into money'),
      width: 100,
      type: eColumnsTpye.number,
    },
    hinhanh: {
      title: t('Image'),
      width: 50,
      type: eColumnsTpye.image,
      previewImage: true,
      attributesImage: 'imgs', // [22/01/2025][#21317][phuong_td] tên thuộc tính danh sách url imgs
      onClick: (record: any) => {
        //console.log(record);
      },
    },
    payer: {
      title: t('People who spend money'),
      width: 60,
      type: eColumnsTpye.text,
    },
    isConfirmByRank1: {
      title: t('Approve 1'),
      width: 60,
      type: eColumnsTpye.checkbox,
      fieldDisplayCheckboxType: 'userNameRank1',
      notAllowCheck: !firstApproveGranted, // phân quyền thì gắn vào đây để vô hiệu hóa checkbox
    },
    isConfirmByRank2: {
      title: t('Approve 2'),
      width: 60,
      type: eColumnsTpye.checkbox,
      fieldDisplayCheckboxType: 'userNameRank2',
      notAllowCheck: !secondApproveGranted,  // phân quyền thì gắn vào đây để vô hiệu hóa checkbox
    },
    notes: {
      title: t('Note'),
      width: 50,
      type: eColumnsTpye.text,
    },
    action: {
      width: 50,
      type: eColumnsTpye.action,
      actions: [
        {
          name: 'edit',
          action: (record: any) => {
           // console.log('edit ', record);
            setSelectedRecord(record);
            setIsModalVisible(true);
          },
          disabled: !editGranted,
        },
        {
          // [09/11/2024][#20629][phuong_td] đưa việc gọi api xóa dữ liệu từ table custom ra vị trí này
          name: 'remove',
          Notification: tProjects('Bạn có muốn xóa chi phí phát sinh này không?'),
          action: (record: any) => {
            //console.log('remove ', record);
            const drawingIds = Array.isArray(record.attachmentLinks)
              ? record.attachmentLinks.map((link: any) => link.drawingId)
              : [];
            dispatch(
              accountingInvoiceActions.deleteFileCPPSRequest({
                itemId: record.id,
                drawingIds: drawingIds,
              }),
            );
            dispatch(accountingInvoiceActions.DeleteAdditionalCostRequest({ id: record.id, projectId: selectedProject?.id, companyId: company?.id }));
          },
          disabled:!deleteGranted,
        },
      ],
    },
  };

  useEffect(() => {
    // Gọi action để lấy dữ liệu chi phí phát sinh từ API
    if (selectedProject?.id && company.id) {
      dispatch(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject?.id, companyId: company.id }));
    }
    dispatch(accountingInvoiceActions.GetALLAdditionalCost({ companyId: company.id }));
  }, [selectedProject, company]);

  useEffect(() => {
    let data: CostDataCreate[] = [];
    if (selectedProject) {
      data = [...additionalCosts];
    } else {
      data = [...additionalCostAll];
    }
    let sortData: CostDataCreate[] = [...data];
    if (data.length) {
      // [16/01/2025][#23123] [phuong_td] sắp xếp danh sách chi phí 
      sortData = data.sort((a, b) => {
        // Kiểm tra nếu `a` hoặc `b` chứa "BCH"
        const isCheckAllA = a.isConfirmByRank1 && a.isConfirmByRank2;
        const isCheckAllB = b.isConfirmByRank1 && b.isConfirmByRank2;
        const createDateA = dayjs(a.createDate);
        const createDateB = dayjs(b.createDate);
        // Nếu cả hai đều không phải "BCH", giữ nguyên thứ tự
        if ((!isCheckAllA && !isCheckAllB) || (!isCheckAllA && !isCheckAllB)) return createDateA.isBefore(createDateB) ? 1 : -1;
  
        // Nếu `a` Đã Duyệt xong, đưa xuống sau
        if (isCheckAllA && !isCheckAllB) return 1;
  
        // Nếu `b` Đã Duyệt xong, đưa xuống sau
        if (!isCheckAllA && isCheckAllB) return -1;
  
        // Nếu cả hai đều Đã Duyệt xong, giữ nguyên thứ tự
        return createDateA.isBefore(createDateB) ? 1 : -1;
      });
    }
    setDataSource(sortData);
    if (selectAdditionalCost) {
      data.forEach(x => {
        if (selectAdditionalCost.id === x.id) {
          setSelectAdditionalCost(x);
        }
      });
    }
  }, [additionalCosts, additionalCostAll]);

  const updateSelectAttach = (it: IAttachmentLinks) => {
    if (dataAttachmentLinks) {
      dataAttachmentLinks.forEach(x => {
        if (it && it.drawingId === x.drawingId) {
          setSelectAttach({ ...it, imageUrl: x.imageUrl });
        }
      });
    }
  };

  const handleAttachClick = (attach: IAttachmentLinks) => {
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
  };

  //[#21050][hoang_nm][03/12/2024] Thêm hàm để chọn tất cả các file ảnh 
  const handleSelectAllChange = (e: CheckboxChangeEvent) => {
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
  };
  
  //[#21050][hoang_nm][03/12/2024] Theo dõi trạng thái checkbox trong danh sách
  const handleCheckboxChange = (id: number, checked: boolean) => {
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
  };

  const handleUploadChange = (info: any) => {
    const { fileList } = info;
    setFileList(fileList);
  };

  useEffect(() => {
    selectAttach && updateSelectAttach(selectAttach);
  }, [dataAttachmentLinks]);

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  // [16/01/2025][#23123] [phuong_td] Cập nhật thông tin Duyệt theo checkbox
  const handleConfirm = (data: DataType, confirm: boolean, type: string): CostDataCreate =>  {
    let temp: CostDataCreate = {...data, projectCode: data.projectCode };
    switch (type) {
      case 'isConfirmByRank1':
        if (confirm) {
          temp = {
            ...temp,
            isConfirmByRank1: true,
            dateConfirmByRank1: dayjs().format(FormatDateAPI),
            userIdRank1: user.Id,
            userNameRank1: user.UserName,
          };
        } else {
          temp = {
            ...temp,
            isConfirmByRank1: false,
            dateConfirmByRank1: undefined,
            userIdRank1: '',
            userNameRank1: '',
          };
        }
        
        break;
      case 'isConfirmByRank2': {
        if (confirm) {
          temp = {
            ...temp,
            isConfirmByRank2: true,
            dateConfirmByRank2: dayjs().format(FormatDateAPI),
            userIdRank2: user.Id,
            userNameRank2: user.UserName,
          };
        } else {
          temp = {
            ...temp,
            isConfirmByRank2: false,
            dateConfirmByRank2: undefined,
            userIdRank2: '',
            userNameRank2: '',
          };
        }
      }
    }
    return temp;
  }
  const handleCheckAll = (type: string, value: boolean) => {
    const dataCreates: any[] = dataSource.map((d) => handleConfirm(d, value, type));
    dispatch(accountingInvoiceActions.UpdateAdditionalCosts({
      dataCreates,
      companyId: company.id
    }));
  }

  return (
    <div className="AdditionalCost">
      <header className="AdditionalCost-header">
        <TableCustom
          dataSource={dataSource}
          columnsConfig={columnsConfig}
          notPagination={false}
          onChange={(value, type) => {
            const confirmType = ['isConfirmByRank1', 'isConfirmByRank2'];
            if (confirmType.includes(type)) {
              const data = handleConfirm(value, value[type], type);
              dispatch(accountingInvoiceActions.UpdateAdditionalCosts({
                dataCreates: [data],
                companyId: company.id
              }));
            }
            // [#20692][phuong_td][31/10/2024] Đặt dữ liệu thay đổi
            DataModifine = Utils.setDataModified(DataModifine, value.costCode, value, type);
          }}
          onCheckAll={(type, value) => {
            // [#20692][phuong_td][31/10/2024] Đặt dữ liệu thay đổi
            handleCheckAll(type, value);
          }}
          onImagePopup={(value: DataType) => {
            setModalAttachmentLinks(true);
            setSelectAdditionalCost(value);
            if (value?.attachmentLinks) {
              value.attachmentLinks.forEach((x: any) => {
                //ham xu ly download se tu bo qua neu đã có
                dispatch(
                  accountingInvoiceActions.getImageUrlAttachmentLinks({
                    drawingId: x.drawingId,
                    fileName: x.fileName,
                    companyId: company.id,
                    itemId: x.itemId,
                  }),
                );
              });
              setSelectAttach(value.attachmentLinks[0]);
            }
          }}
        />
        <Modal title={t('Update incidental costs')} visible={isModalVisible} onCancel={handleCancel} footer={null} width={500}>
          {selectedRecord && <ExpenseFormUpdate record={selectedRecord} setModel={setIsModalVisible} />}
        </Modal>
      </header>
      <Modal
        title={`Hình ảnh đính kèm (${selectAdditionalCost?.attachmentLinks.length})`}
        centered
        open={modalAttachmentLinks}
        onOk={() => setModalAttachmentLinks(false)}
        onCancel={() => setModalAttachmentLinks(false)}
        width={750}
        footer={[
          <div key={'footer'} style={{ display: 'flex' }}>
            <Button
              type="primary"
              key="Add"
              onClick={() => {
                setFileList([]);
                setModalAddAttachmentLink(true);
              }}
            >
              {t('Add')}
              </Button>
            <Button
              style={{ backgroundColor: '#CC0000', color: 'white', marginLeft: 150 }}
              key="Delete"
              onClick={() => {
                if (selectAdditionalCost && selectAdditionalCost.attachmentLinks?.length > 0) {
                  const deletList = selectAdditionalCost.attachmentLinks.filter(x => x.selected);
                  if (deletList && deletList.length > 0) {
                    setModalConfirm(true);
                    setDeleteAttachmentLinks({ id: selectAdditionalCost.id || -1, deletList });
                  } else {
                    setDeleteAttachmentLinks({ id: 0, deletList: [] });
                  }
                }
              }}
            >
              {t('Delete')}
              </Button>
          </div>,
        ]}
      >
        <Splitter onResize={setSizes} className={styles.model}>
        <Splitter.Panel size={sizes[0]} resizable={true}>
            <div style={{ overflowY: 'auto', alignItems: 'center' }}>
              <div style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
            {/* [#21050][hoang_nm][03/12/2024] Thêm ô checkbox để select toàn bộ item có trong list  */}
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  style={{color: 'black', fontWeight: '500'}}
                >
                  {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Checkbox>{' '}
              </div>

              {selectAdditionalCost?.attachmentLinks?.map((attach: IAttachmentLinks) => (
                <div
                  key={attach.id}
                  className={`${styles.rowItem}`}
                  style={{
                    background: attach.selected ? '#1890ff' : 'white',
                    color: attach.selected ? 'white' : 'black',
                  }}
                >
                  {/* , border: "1px solid #ff0000" */}
                  <Flex
                    vertical={false}
                    style={{ gap: 5, cursor: 'pointer', width: '100%' }}
                    onClick={() => handleAttachClick(attach)}
                  >
                      <Checkbox
                        checked={attach.selected}
                        onChange={e => handleCheckboxChange(attach.id, e.target.checked)}
                      ></Checkbox>

                    <div className={`${styles.fontMedium} ${styles.truncateText}`}>
                      {Utils.getFileNmeWithoutExtension(attach.fileName)}
                    </div>
                  </Flex>
                </div>
              ))}
            </div>
          </Splitter.Panel>

          <Splitter.Panel size={sizes[1]}>
            {selectAttach?.imageUrl && (
              <Image width="100%" height="100%" src={selectAttach.imageUrl} style={{ objectFit: 'contain' }} />
            )}
          </Splitter.Panel>

        </Splitter>
      </Modal>
      {/* Confirm Add Dialog */}
      <Modal
        title={t('Add AttachmentLink')}
        open={modalAddAttachmentLink}
        onOk={() => {
          if (selectAdditionalCost) {
            setModalAddAttachmentLink(false);
            if (!fileList || fileList.length < 1) {
              alert('Chưa có hình ảnh nào để upload.');
              return;
            }
            const formData = new FormData();
            fileList.forEach((file: any) => {
              if (file.originFileObj) {
                formData.append('files', file.originFileObj);
              }
            });

            dispatch(
              accountingInvoiceActions.uploadAttachmentLinks({
                itemId: selectAdditionalCost.id,
                id: selectAdditionalCost.id,
                companyId: company.id,
                dataImage: formData,
                projectId: selectedProject?.id
              }),
            );
          }
        }}
        onCancel={() => {
          setModalAddAttachmentLink(false);
        }}
      >
        <Upload.Dragger
          name="files"
          listType="picture"
          accept=".jpg,.jpeg,.png,.jfif"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={handleUploadChange}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng jpg, jpeg, png, jfif</p>
        </Upload.Dragger>
      </Modal>
      {/* Confirm Delete Dialog */}
     <Modal
        title={'Xác nhận xóa'}
          // <span>
          //   <ExclamationCircleOutlined
          //     style={{ marginRight: 5, borderRadius: '50%', backgroundColor: '#FFCC00', color: 'white' }}
          //   />
          //   {t('Do you want to delete this image?')}
          // </span>
        //}
        
        open={modalConfirm}
        onOk={() => {
          setModalConfirm(false);
          if (deleteAttachmentLinks && deleteAttachmentLinks.deletList.length > 0) {
            const itemId = deleteAttachmentLinks.deletList[0].itemId;
            const drawingIds = deleteAttachmentLinks.deletList.map(x => x.drawingId);
            dispatch(
              accountingInvoiceActions.deleteAttachmentLinks({ itemId, drawingIds, id: deleteAttachmentLinks.id, projectId: selectedProject?.id, companyId: company.id }),
            );

            setSelectAttach(undefined);
            setSelectAll(false);
          }
        }}
        onCancel={() => {
          setModalConfirm(false);
        }}
         okText="Xác nhận"
      >
        {t('Do you want to delete this image?')}
      </Modal>
    </div>
  );
};

export default AdditionalCost;