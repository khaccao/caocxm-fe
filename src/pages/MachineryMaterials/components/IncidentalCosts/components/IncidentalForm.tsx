/* eslint-disable import/order */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { ColumnsType } from 'antd/es/table';
import { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { EPaymentMethod, formatDateDisplay, madvcs, paymentOptions } from '@/common/define';
import fallbackSVG from '@/image/fallback.svg';
import { CostDataCreate, IAttachmentLinks, IncidentalData } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import { accountingInvoiceActions, getAccountingMapping, getAdditionalCostAll, getNccList, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getProjectList, getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';
import AutoCompleteCustom from '../../AutoCompleteCustom';
import styles from './IncidentalCard.module.css';
import { AttachmentModal, FormItemRow, UploadModal } from './ui';

// ---------------------------------------------------------------------

interface IncidentalFormProps {
  mode?: 'add' | 'edit';
  data?: IncidentalData | null;
  onCancel: () => void;
  onSuccess: () => void;
  handleDelete: (ids: number[]) => void;
}

interface CustomUploadFile extends UploadFile {
  // thêm vào interface UploadFile để bao gồm cả trường drawingId
  drawingId: string;
  preview?: string;
}

interface FileUpload {
  [key: number]: any[]; // mảng kiểu bất kỳ
}

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function IncidentalForm({
  onCancel,
  onSuccess,
  mode = 'add',
  data,
  handleDelete,
}: IncidentalFormProps): React.JSX.Element {
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const [form] = Form.useForm<any>();
  const rows = Form.useWatch(['rows'], form) || [];

  const dispatch = useAppDispatch();

  const customerLists = useAppSelector(getNccList());
  const [nccList, setNccList] = useState<any[]>(customerLists);
  const projectList = useAppSelector(getProjectList());
  const listWarehouse = useAppSelector(getWareHouses());
  const companyCurrent = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());
  const additionalCostAll = useAppSelector(getAdditionalCostAll());
  const accountingMapping = useAppSelector(getAccountingMapping());
  const dataAttachmentLinks = useAppSelector((state: RootState) => state.accountingInvoice.dataAttachmentLinks) || [];
  const multipleLink = useAppSelector((state: RootState) => state.accountingInvoice.multipleImage) || [];

  const [selectedNcc, setSelectedNcc] = useState<string>();
  const [selectedCodeItem, setSelectedCodeItem] = useState<string>('');
  const [keyAutoComplete, setKeyAutoComplete] = useState<string>('888');
  const [keyAutoComplete_1, setKeyAutoComplete_1] = useState<string>('888');
  const [keyAutoComplete_2, setKeyAutoComplete_2] = useState<string>('888');
  const [selectedAdditionalCost, setSelectedAdditionalCost] = useState<CostDataCreate>();
  const [selectedAdditionalCostCode, setSelectedAdditionalCostCode] = useState<string>();
  const [keyAutoCompleteNcc, setKeyAutoCompleteNcc] = useState('ncc-888');
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [lastPreview, setLastPreview] = useState<string>();
  const [fileUpload, setFileUpload] = useState<FileUpload>({});
  const [rowSelected, setRowSelected] = useState<number>(0);

  const [modalConfirm, setModalConfirm] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAttach, setSelectAttach] = useState<IAttachmentLinks>();
  const [modalAttachmentLinks, setModalAttachmentLinks] = useState(false);
  const [modalAddAttachmentLink, setModalAddAttachmentLink] = useState(false);
  const [sizes, setSizes] = useState<(number | string)[]>(['40%', '60%']);
  const [selectAdditionalCost, setSelectAdditionalCost] = useState<IncidentalData>();
  const [deleteAttachmentLinks, setDeleteAttachmentLinks] = useState<{
    id: number;
    deletList: IAttachmentLinks[];
  }>({ id: 0, deletList: [] });
  const [temp, setTemp] = useState<any>({});



  useEffect(() => {
    setNccList(customerLists);
  }, [customerLists]);
  useEffect(() => {
    console.log(additionalCostAll);
  }, [additionalCostAll]);
  useEffect(() => {
    setKeyAutoCompleteNcc('ncc-' + Date.now());
  }, [nccList]);

  useEffect(() => {
    if (selectedProject?.id) {
      const item = projectList.find((p) => p.id === selectedProject?.id);
      form.setFieldValue(['rows', 0, 'maKM'], item?.code);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    if (selectedProject?.id && companyCurrent.id) {
      dispatch(
        accountingInvoiceActions.getAdditionalCosts({
          projectId: selectedProject?.id,
          companyId: companyCurrent.id,
        }),
      );
    } else {
      dispatch(accountingInvoiceActions.GetALLAdditionalCost({ companyId: companyCurrent.id }));
    }
  }, [dispatch, selectedProject?.id, companyCurrent.id]);

  useEffect(() => {
    if (isEdit && data) {
      const rows =
        Array.isArray(data.items) && data.items.length > 0
          ? data.items.map(item => ({
            id: item.id,
            key: item.id || Date.now() + Math.random(),
            ncc: item.ncc,
            costCode: item.costCode,
            costName: item.costName,
            quantity: item.quantity,
            amount: item.amount,
            totalAmount: item.totalAmount,
            tkNo: item.tkNo,
            tkCo: item.tkCo,
            mavc: item.mavc,
            unit: item.unit || 'VNĐ',
            notes: item.notes,
            paymentType: item.paymentType,
            maKM: item.maKM,
            payer: item.payer,
            createDate: item.createDate,
            madvcs: item.madvcs,
            projectId: item.projectId,
            companyId: item.companyId,
            attachmentLinks: item.attachmentLinks,
            isConfirmByRank1: item.isConfirmByRank1,
            isConfirmByRank2: item.isConfirmByRank2,
            userIdRank1: item.userIdRank1,
            userNameRank1: item.userNameRank1,
            dateConfirmByRank1: item.dateConfirmByRank1,
            userIdRank2: item.userIdRank2,
            userNameRank2: item.userNameRank2,
            dateConfirmByRank2: item.dateConfirmByRank2,
            createdBy: item.createdBy,
            createdById: item.createdById,
          }))
          : [
            {
              key: data.id,
              ncc: data.ncc,
              costCode: data.costCode,
              costName: data.costName,
              quantity: data.quantity,
              amount: data.amount,
              totalAmount: data.totalAmount,
              tkNo: data.tkNo,
              tkCo: data.tkCo,
              mavc: data.mavc,
              unit: data.unit || 'VNĐ',
              notes: data.notes,
              paymentType: data.paymentType,
              maKM: data.maKM,
              payer: data.payer,
              createDate: data.createDate,
              madvcs: data.madvcs,
              projectId: data.projectId,
              companyId: data.companyId,
              attachmentLinks: data.attachmentLinks,
              isConfirmByRank1: data.isConfirmByRank1,
              isConfirmByRank2: data.isConfirmByRank2,
              userIdRank1: data.userIdRank1,
              userNameRank1: data.userNameRank1,
              dateConfirmByRank1: data.dateConfirmByRank1,
              userIdRank2: data.userIdRank2,
              userNameRank2: data.userNameRank2,
              dateConfirmByRank2: data.dateConfirmByRank2,
              createdBy: data.createdBy,
              createdById: data.createdById,
            },
          ];

      form.setFieldsValue({
        createDate: dayjs(data.createDate),
        payer: data.payer,
        madvcs: data.madvcs,
        rows,
      });

      setSelectedAdditionalCost(data);
      setSelectedAdditionalCostCode(data.costCode);
      setSelectedNcc(data.ncc ?? '');

      if (data.attachmentLinks && data.attachmentLinks.length > 0) {
        const first = data.attachmentLinks[0];
        setSelectAttach(first);
        let attachItem: any[] = [];
        data?.items?.forEach((item) => {
          if (Array.isArray(item.attachmentLinks)) {
            attachItem.push(...item.attachmentLinks);
          }
        });
        const keyDownload = `${data.id}-${attachItem.length}`;
        dispatch(accountingInvoiceActions.downloadMultipleImage({ attachmentLinks: attachItem, companyId: companyCurrent.id, keyDownload: keyDownload }))
        dispatch(
          accountingInvoiceActions.getImageUrlAttachmentLinks({
            drawingId: first.drawingId,
            fileName: first.fileName,
            companyId: companyCurrent.id,
            itemId: first.itemId,
          }),
        );
      }
    }
  }, [isEdit, data, companyCurrent.id]);

  useEffect(() => {
    if (selectedAdditionalCost) {
      const rows = form.getFieldValue('rows') || [];
      const item = projectList.find((p) => p.id === selectedProject?.id);
      rows[0] = {
        ...rows[0],
        costName: selectedAdditionalCost.costName,
        tkCo: selectedAdditionalCost.tkCo,
        tkNo: selectedAdditionalCost.tkNo,
        codeItem: selectedAdditionalCost.maKM,
        ncc: selectedAdditionalCost.ncc,
        mavc: selectedAdditionalCost.mavc,
        notes: selectedAdditionalCost.notes,
        paymentType: selectedAdditionalCost.paymentType,
        maKM: item ? item.code : (selectedAdditionalCost.maKM || form.getFieldValue(['rows', 0, 'maKM'])),
      };
      form.setFieldsValue({ rows });
    }
  }, []);

  useEffect(() => {
    if (selectAttach && dataAttachmentLinks) {
      const matchedAttachment = dataAttachmentLinks.find(
        x => x.drawingId === selectAttach.drawingId && x.imageUrl !== selectAttach.imageUrl,
      );

      if (matchedAttachment) {
        setSelectAttach(prev => ({ ...prev!, imageUrl: matchedAttachment.imageUrl }));
      }
    }
  }, [dataAttachmentLinks]);

  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: (
          <span>
            {t('Mã chi phí')} <span style={{ color: 'red' }}>*</span>
          </span>
        ),
        dataIndex: 'costCode',
        fixed: 'left',
        align: 'center',
        width: 200,
        render: (_, field) => (
          <Form.Item {...field} name={[field.name, 'costCode']} rules={[{ required: true, message: t('Bắt buộc') }]}>
            <AutoCompleteCustom
              placeholder={t('Nhập mã chi phí')}
              id={`costCode-${field.key}`}
              keyElement={`${keyAutoComplete_1}-${field.key}`}
              value={form.getFieldValue(['rows', field.name, 'costCode']) || ''}
              optionsList={(accountingMapping || []).map((mapping: any) => ({
                key: `${mapping.id}`,
                id: `${mapping.id}`,
                label: `${mapping.businessContentDetailCode}`,
                value: `${mapping.id}-${mapping.businessContentDetailCode}`,
                item: {
                  name: mapping.businessContentDetail,
                  code: mapping.businessContentDetailCode,
                  data: mapping,
                },
              }))}
              dropdownStyle={{ minWidth: '400px' }}
              onChange={(id: string, data: string) => {
                form.setFieldValue(['rows', field.name, 'costCode'], data);
                const temp = accountingMapping?.find((m: any) => (`${m.id}-${m.businessContentDetailCode}`) === data);
                if (temp) {
                  form.setFieldValue(['rows', field.name, 'costCode'], temp.businessContentDetailCode);
                }
                if (!temp) {
                  form.setFieldsValue({
                    rows: form.getFieldValue('rows').map((rowItem: any, index: any) => {
                      if (index === field.name) {
                        return {
                          ...rowItem,
                          costName: undefined,
                          maKM: form.getFieldValue(['rows', field.name, 'maKM']),
                          ncc: form.getFieldValue(['rows', field.name, 'ncc']),
                          paymentType: form.getFieldValue(['rows', field.name, 'paymentType']),
                        };
                      }
                      return rowItem;
                    }),
                  });
                }
              }}
              onSelect={(id: string, data: string, label: string, item: any) => {
                form.setFieldsValue({
                  rows: form.getFieldValue('rows').map((rowItem: any, index: any) => {
                    if (index === field.name) {
                      const selectedItem = projectList.find((p) => p.id === selectedProject?.id);
                      let notes = `${item.code}-${item.data.businessContentDetail}`;
                      return {
                        ...rowItem,
                        costCode: item.code,
                        costName: item.data.businessContentDetail,
                        maKM: selectedItem ? selectedItem.code : form.getFieldValue([field.name, 'maKM']),
                        notes: notes,
                        ncc: form.getFieldValue([field.name, 'ncc']),
                        paymentType:
                          form.getFieldValue([field.name, 'paymentType']) ||
                          EPaymentMethod.Cash,
                      };
                    }
                    return rowItem;
                  }),
                });
              }}
              className={''}
              onBlur={(id: string, data: string) => {
                // const temp = additionalCostAll.find(w => w.costCode === data);
                // if (temp) {
                //   form.setFieldsValue({
                //     rows: form.getFieldValue('rows').map((rowItem: any, index: any) => {
                //       if (index === field.name) {
                //         const selectedItem = projectList.find((p) => p.id === selectedProject?.id);
                //         return {
                //           ...rowItem,
                //           costCode: temp.costCode,
                //           costName: temp.costName,
                //           tkCo: temp.tkCo,
                //           tkNo: temp.tkNo,
                //           mavc: temp.mavc,
                //           notes: temp.notes,
                //           maKM: selectedItem ? selectedItem.code : (temp.maKM || form.getFieldValue([field.name, 'maKM'])),
                //           ncc: temp.ncc || form.getFieldValue([field.name, 'ncc']),
                //           paymentType:
                //             temp.paymentType || form.getFieldValue([field.name, 'paymentType']) || EPaymentMethod.Cash,
                //         };
                //       }
                //       return rowItem;
                //     }),
                //   });
                // }
              }}
              warning={''}
            />
          </Form.Item>
        ),
      },
      {
        title: t('Tên chi phí'),
        dataIndex: 'costName',
        fixed: 'left',
        width: 220,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'costName']}>
            <Tooltip title={form.getFieldValue(['rows', field.name, 'costName'])}>
              <Input 
                placeholder="Hãy chọn mã chi phí" 
                value={form.getFieldValue(['rows', field.name, 'costName'])} 
                disabled 
                className={styles.boldPlaceholder}
              />
            </Tooltip>
          </Form.Item>
        ),
      },
      // Ẩn cột Tài khoản nợ và Tài khoản có
      // {
      //   title: t('Tài khoản nợ'),
      //   dataIndex: 'tkNo',
      //   width: 120,
      //   align: 'center',
      //   render: (_, field, idx) => (
      //     <Form.Item name={[field.name, 'tkNo']}>
      //       <InputNumber
      //         min={0}
      //         style={{ width: '100%' }}
      //         disabled
      //         // formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      //         onChange={() => updateRowTotal(field.name)}
      //       />
      //     </Form.Item>
      //   ),
      // },
      // {
      //   title: t('Tài khoản có'),
      //   dataIndex: 'tkCo',
      //   width: 120,
      //   align: 'center',
      //   render: (_, field, idx) => (
      //     <Form.Item name={[field.name, 'tkCo']}>
      //       <InputNumber
      //         min={0}
      //         style={{ width: '100%' }}
      //         disabled
      //         // formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      //         onChange={() => updateRowTotal(field.name)}
      //       />
      //     </Form.Item>
      //   ),
      // },
      {
        title: t('Nhà cung cấp'),
        dataIndex: 'ncc',
        width: 200,
        align: 'center',
        render: (_, field) => {
          const value = form.getFieldValue(['rows', field.name, 'ncc']) || '';
          return (
            <Form.Item
              {...field}
              name={[field.name, 'ncc']}
              rules={[{ required: true, message: 'Bắt buộc' }]}
              style={{ marginBottom: 0 }}
            >
              <AutoCompleteCustom
                id={`ncc-${field.key}`}
                keyElement={keyAutoCompleteNcc + '-' + field.key}
                value={
                  // Nếu value là object hoặc label, chuyển về mã NCC
                  typeof value === 'string'
                    ? value
                    : (nccList.find(w => w.ten_kh === value || w.ma_kh === value)?.ma_kh || '')
                }
                optionsList={
                  Array.isArray(nccList)
                    ? nccList.map(w => ({
                      label: `${w.ma_kh} / ${w.ten_kh}`,
                      value: w.ten_kh,
                      item: {
                        name: w.ten_kh,
                        code: w.ma_kh,
                      },
                    }))
                    : []
                }
                onChange={(_, data) => {
                  // data luôn là mã NCC hoặc rỗng
                  form.setFieldValue(['rows', field.name, 'ncc'], data || '');
                }}
                onSelect={(_, data, label, item) => {
                  // Luôn set về mã NCC
                  form.setFieldValue(['rows', field.name, 'ncc'], item.name || '');
                }}
                onBlur={(_, data) => {
                  // Nếu data là label hoặc tên, tìm lại mã NCC
                  const matched = nccList.find(w => w.ten_kh === data || w.ma_kh === data);
                  form.setFieldValue(['rows', field.name, 'ncc'], matched ? matched.ten_kh : '');
                }}
                placeholder=""
                className="ncc"
                warning=""
              />
            </Form.Item>
          );
        }
      },
      {
        title: (
          <span>
            {t('Mã khoản mục')} <span style={{ color: 'red' }}>*</span>
          </span>
        ),
        dataIndex: 'maKM',
        width: 200,
        align: 'center',
        render: (_, field) => (
          <Form.Item
            name={[field.name, 'maKM']}
            rules={[{ required: true, message: t('Bắt buộc') }]}
          >
            <AutoCompleteCustom
              id={`maKM-${field.key}`}
              keyElement={`${keyAutoComplete_2}-${field.key}`}
              disabled={!!selectedProject?.id}  // ✅ Disable khi có project
              value={form.getFieldValue(['rows', field.name, 'maKM']) || ''}

              optionsList={[
                ...(selectedProject?.id
                  ? []
                  : [
                    {
                      label: 'ALL / Tổng NVH',
                      value: 'ALL',
                      item: { code: 'ALL', name: 'Tổng NVH' },
                    },
                  ]),
                ...projectList.map((p) => ({
                  label: `${p.code} / ${p.name}`,
                  value: p.code,
                  item: p,
                })),
              ]}
              onChange={(_, val) => {
                form.setFieldValue(['rows', field.name, 'maKM'], val);
                form.setFieldValue(['rows', field.name, 'ma_nv'], undefined);
              }}
              onSelect={async (id: string, data: string, label: string, item: any) => {
                setSelectedCodeItem(item.code);
                setKeyAutoComplete_2(Utils.generateRandomString(3));
                form.setFieldsValue({ codeItem: item.name });

                const chosenProject = projectList.find((project) => project.name === item.name);
                if (chosenProject) {
                  await ProjectService.Get.getProjectWarehouses(chosenProject.id).subscribe((res) => {
                    try {
                      const warehouse = listWarehouse.find((w) => w.id === res[0]?.warehouseId);
                      const ma_nv = res[0].ma_nv || warehouse?.ma_Nv || 'none';
                      form.setFieldsValue({ ma_nv });
                    } catch (error) {
                      console.error('Failed to parse JSON:', error);
                    }
                  });
                }
              }}
              onBlur={(_, val) => {
                if (val !== 'ALL' && !projectList.some((p) => p.code === val)) {
                  form.setFieldValue(['rows', field.name, 'maKM'], undefined);
                  form.setFieldValue(['rows', field.name, 'ma_nv'], undefined);
                }
              }}
              placeholder=""
              className=""
              warning=""
            />
          </Form.Item>

        ),
      },
      {
        title: t('Mã vụ việc'),
        dataIndex: 'mavc',
        width: 300,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'mavc']}>
            <Input />
          </Form.Item>
        ),
      },

      {
        title: t('Số lượng'),
        dataIndex: 'quantity',
        width: 100,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'quantity']} initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} onChange={() => updateRowTotal(idx)} />
          </Form.Item>
        ),
      },
      {
        title: t('Đơn giá'),
        dataIndex: 'amount',
        width: 130,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'amount']}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              onChange={() => updateRowTotal(idx)}
            />
          </Form.Item>
        ),
      },
      {
        title: t('Thành tiền'),
        dataIndex: 'totalAmount',
        width: 140,
        align: 'center',
        render: (_, field, idx) => {
          const rowIndex = field.name;
          return (
            <Form.Item
              shouldUpdate={(prev, curr) =>
                prev.rows?.[rowIndex]?.quantity !== curr.rows?.[rowIndex]?.quantity ||
                prev.rows?.[rowIndex]?.amount !== curr.rows?.[rowIndex]?.amount
              }
              style={{ marginBottom: 10 }}
            >
              {() => {
                const quantity = form.getFieldValue(['rows', rowIndex, 'quantity']) || 0;
                const amount = form.getFieldValue(['rows', rowIndex, 'amount']) || 0;
                return <span>{(quantity * amount).toLocaleString('en-US')}</span>;
              }}
            </Form.Item>
          );
        },
      },
      {
        title: t('Đơn vị'),
        dataIndex: 'unit',
        width: 90,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'unit']} initialValue={'VNĐ'}>
            <Input />
          </Form.Item>
        ),
      },
      {
        title: t('Ghi chú'),
        dataIndex: 'notes',
        width: 200,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'notes']}>
            <Input />
          </Form.Item>
        ),
      },
      {
        title: 'Hình thức thanh toán',
        dataIndex: 'paymentType',
        width: 200,
        align: 'center',
        render: (_, field, idx) => (
          <Form.Item name={[field.name, 'paymentType']} initialValue={EPaymentMethod.Cash}>
            <Select
              placeholder="Chọn hình thức thanh toán"
              options={paymentOptions}
              defaultValue={EPaymentMethod.Cash}

              style={{ width: '100%' }}
              onChange={value => form.setFieldValue(['rows', field.name, 'paymentType'], value)}
            />
          </Form.Item>
        ),
      },
      {
        title: t('Hình ảnh'),
        dataIndex: 'hinhanh',
        width: 200,
        align: 'center',
        render: (_, field, idx) => {
          let src = undefined;
          if (
            data?.items &&
            Array.isArray(data.items) &&
            data.items.length > field.name &&
            data.items[field.name]
          ) {
            const item = data.items[field.name];
            const drawingIds = item.attachmentLinks?.map(link => link.drawingId) || [];
            const selectedImage = multipleLink.find(link =>
              drawingIds.includes(link.drawingId)
            );
            src = selectedImage?.imageUrl;
          }
          if (!src) {
            const item = fileUpload[field.name]?.at(0);
            src = item?.url || item?.preview || fallbackSVG;
          }
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleImageClick(data!, field)}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleImageClick(data!, field);
                }
              }}
              style={{ cursor: 'pointer' }}
              aria-label={t('Xem hình ảnh')}
            >
              <Image
                preview={false}
                src={src}
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
                alt={t('Hình ảnh')}
                fallback={fallbackSVG}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, keyAutoComplete_1, selectedAdditionalCost, accountingMapping, fallbackSVG, selectAttach, lastPreview, projectList, selectedProject],
  );

  const updateRowTotal = useCallback(
    (fieldIndex: number) => {
      const rows = form.getFieldValue('rows') || [];
      const row = rows[fieldIndex] || {};
      const total = (row.quantity || 0) * (row.amount || 0);
      form.setFieldValue(['rows', fieldIndex, 'totalAmount'], total);
    },
    [form],
  );

  const handleImageClick = useCallback(
    (record: IncidentalData, field?: any) => {
      const index = Number(field?.name);
      if (!isNaN(index)) {
        setRowSelected(field.name);

        const item = record?.items?.[index];
        setSelectAdditionalCost(item);

        const hasItemAttachments = !!item?.attachmentLinks?.length;

        if (hasItemAttachments) {
          setModalAttachmentLinks(true);
          setSelectAttach(item.attachmentLinks![0]);
        } else {
          const files = fileUpload[field.name] || [];
          setFileList(files);
          setModalAddAttachmentLink(true);
        }

      } else {
        const hasRecordAttachments = !!record?.attachmentLinks?.length;

        if (hasRecordAttachments) {
          setModalAttachmentLinks(true);

          record.attachmentLinks!.forEach((x) => {
            dispatch(
              accountingInvoiceActions.getImageUrlAttachmentLinks({
                drawingId: x.drawingId,
                fileName: x.fileName,
                companyId: companyCurrent.id,
                itemId: x.itemId,
              })
            );
          });

          setSelectAttach(record.attachmentLinks![0]);

        } else {
          const files = fileUpload[field.name] || [];
          setFileList(files);
          setModalAddAttachmentLink(true);
        }
      }

    },
    [dispatch, companyCurrent.id],
  );

  const handleFinish = useCallback(
    async (values: any) => {
      const requestBody = values.rows.map((row: any) => {
        const quantity = Number(row.quantity || 0);
        const amount = Number(row.amount || 0);
        const totalAmount = quantity * amount;

        const originalItems = data?.items ?? [];
        const idsStillOnUI = (values.rows ?? []).filter((r: any) => r.id).map((r: any) => r.id as number);

        const confirmedButRemoved: any = originalItems.filter(
          it => (it.isConfirmByRank1 || it.isConfirmByRank2) && idsStillOnUI.includes(it.id),
        );

        const foundOldItem: any = (data?.items || []).find((x: any) => x.id === row.id);
        const oldItem = foundOldItem || {};
        const isNewItem = !row.id || !oldItem.id;
        if (isNewItem) {
          return {
            projectId: selectedProject?.id ?? -1,
            companyId: companyCurrent.id,
            projectName: selectedProject?.name ?? '',
            projectCode: selectedProject?.code ?? '',
            costName: row.costName?.trim() ?? '',
            costCode: row.costCode?.trim() ?? '',
            unit: row.unit ?? 'VNĐ',
            createdBy: values.payer ?? '',
            createDate: dayjs(values.createDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            amount,
            quantity,
            totalAmount,
            payer: values.payer ?? '',
            notes: row.notes ?? '',
            tkCo: row.tkCo,
            tkNo: row.tkNo,
            madvcs: values.madvcs,
            maKM: row.maKM,
            ncc: nccList.find(w => w.ten_kh === row.ncc)?.ma_kh ?? '',
            mavc: row.mavc ?? '',
            paymentType: row.paymentType,
            groupId: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.groupId : undefined,
            isConfirmByRank1: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.isConfirmByRank1 : false,
            isConfirmByRank2: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.isConfirmByRank2 : false,
            userIdRank1: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.userIdRank1 : undefined,
            userIdRank2: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.userIdRank2 : undefined,
            userNameRank1: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.userNameRank1 : undefined,
            userNameRank2: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.userNameRank2 : undefined,
            dateConfirmByRank1: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.dateConfirmByRank1 : undefined,
            dateConfirmByRank2: confirmedButRemoved.length > 0 ? confirmedButRemoved[0]?.dateConfirmByRank2 : undefined,
          };
        } else {
          const updatedFields: any = {
            id: oldItem.id,
          };

          if (row.costName?.trim() !== oldItem.costName) {
            updatedFields.costName = row.costName?.trim() ?? '';
          }
          if (row.costCode?.trim() !== oldItem.costCode) {
            updatedFields.costCode = row.costCode?.trim() ?? '';
          }
          if (row.unit !== oldItem.unit) {
            updatedFields.unit = row.unit ?? 'VNĐ';
          }
          if (amount !== oldItem.amount) {
            updatedFields.amount = amount;
          }
          if (quantity !== oldItem.quantity) {
            updatedFields.quantity = quantity;
          }
          if (totalAmount !== oldItem.totalAmount) {
            updatedFields.totalAmount = totalAmount;
          }
          if (row.notes !== oldItem.notes) {
            updatedFields.notes = row.notes ?? '';
          }
          if (row.tkCo !== oldItem.tkCo) {
            updatedFields.tkCo = row.tkCo;
          }
          if (row.tkNo !== oldItem.tkNo) {
            updatedFields.tkNo = row.tkNo;
          }
          if (row.maKM !== oldItem.maKM) {
            updatedFields.maKM = row.maKM;
          }
          if (row.ncc !== oldItem.ncc) {
            updatedFields.ncc = row.ncc ?? '';
          }
          if (row.mavc !== oldItem.mavc) {
            updatedFields.mavc = row.mavc ?? '';
          }
          if (row.paymentType !== oldItem.paymentType) {
            updatedFields.paymentType = row.paymentType;
          }

          const currentCreateDate = dayjs(values.createDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
          if (currentCreateDate !== oldItem.createDate) {
            updatedFields.createDate = currentCreateDate;
          }
          if (values.payer !== oldItem.payer) {
            updatedFields.payer = values.payer ?? '';
          }
          if (values.madvcs !== oldItem.madvcs) {
            updatedFields.madvcs = values.madvcs;
          }
          if (Object.keys(updatedFields).length > 1) {
            return {
              ...oldItem,
              ...updatedFields,
            };
          } else {
            return oldItem;
          }
        }
      });
      console.log(requestBody);
      if (requestBody.some((r: any) => !r.costCode || !r.maKM)) {
        message.error('Vui lòng nhập mã chi phí hoặc Mã khoản mục');
        return;
      }

      const formData = new FormData();
      pendingUploadFiles.forEach(file => formData.append('files', file));

      let newId = data?.id;
      try {
        if (isEdit) {
          await dispatch(
            accountingInvoiceActions.UpdateAdditionalCosts({
              dataCreates: requestBody,
              companyId: companyCurrent.id,
            }),
          );
        } else {
          await dispatch(
            accountingInvoiceActions.CreateIncidentalCost({
              dataCreate: requestBody,
              files: fileUpload,
              companyId: companyCurrent.id,
            }),
          );
          setFileUpload({});

          form.setFieldsValue({
            createDate: dayjs(),
            madvcs: madvcs.THUCHIEN,
            rows: [{ quantity: 0, amount: 0, totalAmount: 0, unit: 'VNĐ', key: Date.now() }],
          });

          Utils.successNotification('Thêm chi phí phát sinh thành công');
        }

        const hasAnyFileUpload = Object.keys(fileUpload).length > 0;
        if (hasAnyFileUpload && newId) {
          const itemsForUpload = data?.items?.map((_item: any, index: number) => ({
            itemId: _item.id,
            projectId: _item.projectId,
          })) || [];
          dispatch(accountingInvoiceActions.createMultipleFileCPPS({
            itemIds: itemsForUpload.map((x: { itemId: any; }) => x.itemId),
            projectIds: itemsForUpload.map((x: { projectId: any; }) => x.projectId),
            files: fileUpload,
            companyId: companyCurrent.id,
          }));
          setFileUpload({});
          // const fd = new FormData();
          // pendingUploadFiles.forEach(f => fd.append('files', f));

          // await dispatch(
          //   accountingInvoiceActions.uploadAttachmentLinks({
          //     itemId: newId,
          //     id: newId,
          //     companyId: companyCurrent.id,
          //     dataImage: fd,
          //     projectId: selectedProject?.id,
          //   }),
          // );
        }


        setPendingUploadFiles([]);
        onSuccess();
        form.resetFields();

      } catch (err) {
        console.error('Error in handleFinish:', err);
        Utils.errorHandling(err);
      }
    },
    [selectedProject, data, companyCurrent.id, isEdit, pendingUploadFiles, dispatch, onSuccess],
  );

  const updateSelectAttach = useCallback(
    (it: IAttachmentLinks) => {
      if (multipleLink) {
        multipleLink.forEach(x => {
          if (it && it.drawingId === x.drawingId) {
            setSelectAttach({ ...it, imageUrl: x.imageUrl });
          }
        });
      }
    },
    [multipleLink],
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

  // const handleUploadChange = useCallback((info: any) => {
  //   const { fileList } = info;
  //   setFileList(fileList);
  // }, []);

  const handleUploadChange = useCallback(async (info: any) => {
    let newFileList = [...info.fileList];

    newFileList = await Promise.all(
      newFileList.map(async file => {
        if (!file.url && !file.preview && file.originFileObj) {
          file.preview = await getBase64(file.originFileObj);
        }
        return file;
      }),
    );
    if (rowSelected !== undefined && rowSelected !== null) {
      const newFileUpload = { ...fileUpload };
      newFileUpload[rowSelected] = newFileList;
      setFileUpload(newFileUpload);
    }
    setFileList(newFileList);

    const last = newFileList.at(-1);
    setLastPreview(last?.preview);
  }, [rowSelected, fileUpload]);

  const handleDeleteClick = useCallback(() => {
    if (selectAdditionalCost && selectAdditionalCost.attachmentLinks?.length > 0) {
      const deletList = selectAdditionalCost.attachmentLinks.filter(x => x.selected);
      if (deletList && deletList.length > 0) {
        setModalConfirm(true);
        setDeleteAttachmentLinks({ id: selectAdditionalCost.id || -1, deletList });
      } else {
        setDeleteAttachmentLinks({ id: 0, deletList: [] });
      }
    }
  }, [selectAdditionalCost]);

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
          companyId: companyCurrent.id,
        }),
      );

      if (selectAdditionalCost) {
        const notDeletList = selectAdditionalCost.attachmentLinks.filter(x => !x.selected);
        setSelectAdditionalCost({
          ...selectAdditionalCost,
          attachmentLinks: notDeletList,
        });
      }
      setSelectAttach(undefined);
      setSelectAll(false);
    }
  }, [deleteAttachmentLinks, dispatch, selectedProject?.id, companyCurrent.id]);

  const handleUploadOk = useCallback(() => {
    if (!fileList.length) {
      message.warning('Chưa có hình ảnh nào để upload.');
      return;
    }
    setPendingUploadFiles(fileList.map((f: any) => f.originFileObj));
    setModalAddAttachmentLink(false);
  }, [fileList]);

  const handleRemoveFile = (file: UploadFile) => {
    //xử lí khi xóa file ảnh
    const customFile = file as CustomUploadFile;
    const drawingIds = [customFile.drawingId];
    dispatch(accountingInvoiceActions.deleteFileCPPSRequest({ itemId: data?.id || -1, drawingIds })); //dispatch action deleteFileCPPSRequest
    setFileList(prevList => prevList.filter((item: any) => item.uid !== file.uid));
  };

  const grandTotal = useMemo(
    () =>
      rows.reduce((sum: number, r: any) => {
        const lineTotal = r.totalAmount ?? Number(r.quantity || 0) * Number(r.amount || 0);
        return sum + lineTotal;
      }, 0),
    [rows],
  );

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          createDate: dayjs(),
          madvcs: madvcs.THUCHIEN,
          rows: [{ quantity: 0, amount: 0, totalAmount: 0, unit: 'VNĐ', key: Date.now() }],
        }}
      >
        <Col span={24} style={{ marginBottom: 10 }}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            Tên công trình: {selectedProject?.name ?? 'Tổng'}
          </Typography.Text>
        </Col>

        <Row gutter={16} style={{ marginBottom: 10 }} align="middle" justify={'start'}>
          <Col span={4}>
            <FormItemRow label={t('Ngày tạo phiếu')} name="createDate">
              <DatePicker format={formatDateDisplay} style={{ width: '100%' }} />
            </FormItemRow>
          </Col>

          <Col span={6}>
            <FormItemRow label={t('Mã đơn vị')} name="madvcs" initialValue={'THUCHIEN'}>
              <Input />
            </FormItemRow>
          </Col>

          <Col span={10}>
            <FormItemRow label={t('Người chi - nội dung chi')} name="payer">
              <Input.TextArea placeholder="Nhập người chi - nội dung chi" autoSize={{ minRows: 1, maxRows: 3 }} />
            </FormItemRow>
          </Col>

          <Form.Item label="" name="ma_nv"></Form.Item>
        </Row>

        <Form.List name="rows">
          {(fields, { add, remove }) => (
            <>
              <Table
                className={styles.tableWrapper}
                dataSource={fields}
                rowKey="key"
                columns={[
                  ...columns,
                  {
                    title: '',
                    dataIndex: 'actions',
                    width: 60,
                    fixed: 'right',
                    render: (_, field) =>
                      fields.length > 1 ? (
                        <Button
                          type="default"
                          style={{ marginBottom: 10 }}
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            const rowItem = form.getFieldValue(['rows', field.name]);
                            const rowIndex = field.name;

                            const removeRowAndShiftFileUpload = () => {
                              // Step 1: Clone current fileUpload
                              const newFileUpload = { ...fileUpload };
                              // Step 2: Delete the removed row
                              delete newFileUpload[rowIndex];

                              // Step 3: Shift các key phía sau
                              const updatedFileUpload: FileUpload = {};
                              Object.entries(newFileUpload).forEach(([keyStr, value]) => {
                                const key = Number(keyStr);
                                updatedFileUpload[key > rowIndex ? key - 1 : key] = value;
                              });
                              setFileUpload(updatedFileUpload);
                            };
                            if (isEdit && rowItem?.id) {
                              Modal.confirm({
                                title: 'Xác nhận xóa',
                                content: 'Bạn chắc chắn muốn xóa chi phí này?',
                                onOk: () => {
                                  handleDelete([rowItem.id]);
                                  remove(field.name);
                                  removeRowAndShiftFileUpload();
                                },
                              });
                            } else {
                              remove(field.name);
                              removeRowAndShiftFileUpload();
                            }
                          }}
                        />
                      ) : null,
                  },
                ]}
                pagination={false}
                scroll={{ x: 900, y: 270 }}
                bordered
                rowHoverable={false}

              />

              <Row justify="start" style={{ marginTop: 16 }}>
                <Button
                  type="dashed"
                  onClick={() => add({ maKM: (selectedProject?.id ? (projectList.find((p) => p.id === selectedProject?.id)?.code) : 'ALL'), quantity: 0, amount: 0, totalAmount: 0, unit: 'VNĐ', key: Date.now() })}
                  icon={<PlusOutlined />}
                >
                  Thêm chi phí
                </Button>
              </Row>
            </>
          )}
        </Form.List>

        <Row justify="end" style={{ marginTop: 16 }}>
          <Typography.Text strong>
            Tổng thành tiền:&nbsp;
            {grandTotal.toLocaleString('en-US')} VNĐ
          </Typography.Text>
        </Row>

        <Row style={{ marginTop: 24 }} justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>{t('Hủy')}</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              {isEdit ? t('Cập nhật phát sinh') : t('Tạo phát sinh')}
            </Button>
          </Col>
        </Row>
      </Form>

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
        type="edit"
      />

      <UploadModal
        visible={modalAddAttachmentLink}
        onOk={handleUploadOk}
        onCancel={() => setModalAddAttachmentLink(false)}
        fileList={fileUpload[rowSelected] || []}
        onUploadChange={handleUploadChange}
        handleRemoveFile={handleRemoveFile}
        handleImageClick={handleImageClick}
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
