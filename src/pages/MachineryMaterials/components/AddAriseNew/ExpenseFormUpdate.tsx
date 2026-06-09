/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Row, Space, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { madvcs } from '@/common/define';
import { getEnvVars } from '@/environment';
import { CostDataCreate } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import { accountingInvoiceActions, getAdditionalCostAll, getNccList, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import { getProjectList, getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import AutoCompleteCustom from '../AutoCompleteCustom';

const { TextArea } = Input;
const { apiUrl } = getEnvVars();

interface CustomUploadFile extends UploadFile {
  // thêm vào interface UploadFile để bao gồm cả trường drawingId
  drawingId: string;
}

interface ExpenseFormUpdateProps {
  // Định nghĩa kiểu dữ liệu cho props của component ExpenseFormUpdate
  record: CostDataCreate;
  // [#20806][dunglt][3/12/2024] thêm set modal để khi update hoặc thêm mới xong thì đóng modal lại
  setModel: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExpenseFormUpdate: React.FC<ExpenseFormUpdateProps> = ({ record, setModel }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('material');
  const selectedProject = useAppSelector(getSelectedProject());
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const company = useAppSelector(getCurrentCompany());
  const [form] = Form.useForm();
  const tDepot = useTranslation('depot').t;
  const [keyAutoComplete, setKeyAutoComplete] = useState<string>('111');
  const [keyAutoComplete_1, setKeyAutoComplete_1] = useState<string>('111');
  const [keyAutoComplete_2, setKeyAutoComplete_2] = useState<string>('111');
  const listWarehouse = useAppSelector(getWareHouses());
  const additionalCostAll = useAppSelector(getAdditionalCostAll());
  const [selectedAdditionalCost, setSelectedAdditionalCost] = useState<CostDataCreate>();
  const [selectedAdditionalCostCode, setSelectedAdditionalCostCode] = useState<string>(record.costCode);

  // [18/12/2024][#21174][phuong_td] Danh sách Nhà cung cấp và nhà cung cấp được chọn
  const [selectedNcc, setSelectedNcc] = useState<string>();
  const nccList = useAppSelector(getNccList());
  // [21/01/2025][#21369][phuong_td] Danh sách công trình và khoản mục được chọn
  const projectList = useAppSelector(getProjectList());
  const [selectedCodeItem, setSelectedCodeItem] = useState<string>('');

  useEffect(() => {
    dispatch(accountingInvoiceActions.getCustomers());
    form.setFieldsValue({
      unitCode: madvcs.THUCHIEN,
      date: dayjs(),
    });
  }, []);

  useEffect(() => {
    if (selectedAdditionalCost) {
      form.setFieldsValue({
        Account: selectedAdditionalCost.tkCo,
        DebtAccount: selectedAdditionalCost.tkNo,
        unitCode: selectedAdditionalCost.madvcs || madvcs.THUCHIEN,
        codeItem: selectedAdditionalCost.maKM,
        supplier: selectedAdditionalCost.ncc,
        caseCode: selectedAdditionalCost.mavc,
      });
    }
  }, [selectedAdditionalCost]);

  // useEffect để load dữ liệu ban đầu nếu có record
  useEffect(() => {
    if (record) {
      // [17/01/2025][#23123][phuong_td] Điều chỉnh lại cách thiết lập giá trị nhà cung cấp khi update
      // Đặt các giá trị mặc định cho form từ record
      form.setFieldsValue({
        expenseCode: record.costCode,
        expenseName: record.costName,
        payer: record.payer,
        date: record.createDate ? dayjs(record.createDate) : null,
        unit: record.unit,
        quantity: record.quantity,
        amount: record.amount,
        totalAmount: record.totalAmount,
        note: record.notes,
        Account: record.tkCo,
        DebtAccount: record.tkNo,
        unitCode: record.madvcs,
        codeItem: projectList.find(n => `${n.code}` === record.maKM)?.name || record.maKM,
        supplier: nccList.find(n => n.ma_kh === record.ncc)?.ten_kh || record.ncc,
        caseCode: record.mavc,
      });
      setSelectedNcc(record.ncc);
      // [21/01/2025][#21369][phuong_td]  Khoản mục được chọn
      setSelectedCodeItem(record.maKM);

      // khởi tạo danh sách file từ record attachmentLinks
      const initialFileList = record.attachmentLinks.map((attachment: any, index: number) => ({
        uid: `${index}`,
        name: attachment.fileName,
        url: `${apiUrl}/Document/downloadFile/${attachment.drawingId}?companyId=${company.id}`, //lấy trực tiếp link apiUrl
        drawingId: attachment.drawingId,
      }));

      setFileList(initialFileList as CustomUploadFile[]);
    }
  }, [record, form, company.id]);

  const onFinish = async (values: any) => {
    console.log(values);
    // [21/01/2025][#21369][phuong_td] bổ xung companyId cho chi phí 
    // xử lý khi form được submit
    // [21/01/2025][#21369][phuong_td]  Khoản mục được chọn
    const dataCreate: CostDataCreate = {
      ...record,
      projectId: record?.projectId || -1,
      costName: values.expenseName,
      costCode: values.expenseCode,
      unit: values.unit,
      createdById: 0,
      createdBy: values.payer,
      createDate: values.date ? dayjs(values.date).format('YYYY-MM-DDTHH:mm:ss[Z]') : dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      amount: values.amount,
      ma_nv: values.ma_nv,
      quantity: values.quantity,
      totalAmount: values.totalAmount,
      payer: values.payer,
      payerId: 0,
      notes: values.note,
      projectCode: `${record?.projectCode}` || '',
      projectName: record?.projectName || '',
      tkCo: values.Account,
      tkNo: values.DebtAccount,
      madvcs: values.unitCode,
      maKM: selectedCodeItem,
      ncc: selectedNcc || '',
      mavc: values.caseCode || '',
      companyId: company.id,
    };

    try {
      //gọi hàm dispatch tới action update để cập nhật dữ liệu bao gồm id và dataCreate cần cập nhật
      await dispatch(
        accountingInvoiceActions.UpdateAdditionalCost({ id: record.id || -1, dataCreate, companyId: company.id }),
      );
      // message.success('Cập nhật chi phí thành công!');

      // Check nếu fileList có file mới thì thông báo tải file thành công
      if (fileList.length > 0) {
        const newFiles = fileList.filter(file => !file.url);

        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach(file => {
            if (file.originFileObj) {
              formData.append('files', file.originFileObj);
            }
          });

          await dispatch(
            // nếu có file thì dispatch tới action createFileCPPS để tải tiếp các file lên

            accountingInvoiceActions.createFileCPPS({
              itemId: record.id || -1,
              dataImage: formData,
              projectId: selectedProject?.id,
              companyId: company.id,
            }),
          );
          message.success('Tải ảnh lên thành công!');
        }
      }
      setModel(false);
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
      console.error('Lỗi:', error);
    }
  };

  const handleChange = (info: { fileList: UploadFile[] }) => {
    // Xử lý khi thay đổi danh sách file

    setFileList(info.fileList as CustomUploadFile[]);
  };

  const handleImageClick = (file: UploadFile) => {
    //xử lí phần xem trước ảnh
    if (file.url) {
      setSelectedImage(file.url);
    } else if (file.originFileObj) {
      const objectUrl = URL.createObjectURL(file.originFileObj);
      setObjectUrls(prevUrls => [...prevUrls, objectUrl]);
      setSelectedImage(objectUrl);
    }
  };

  const handleImageClose = () => {
    //đóng lại phần xem ảnh
    setSelectedImage(null);
  };

  const handleRemoveFile = (file: UploadFile) => {
    //xử lí khi xóa file ảnh
    const customFile = file as CustomUploadFile;
    const drawingIds = [customFile.drawingId];
    dispatch(accountingInvoiceActions.deleteFileCPPSRequest({ itemId: record.id, drawingIds })); //dispatch action deleteFileCPPSRequest
    setFileList(prevList => prevList.filter(item => item.uid !== file.uid));
  };

  // [#21078][dunglt][3/12/2024] thêm set modal để khi update hoặc thêm mới xong thì đóng modal lại
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const { quantity, amount } = allValues;
    if (('quantity' in changedValues || 'amount' in changedValues) && quantity != null && amount != null) {
      const totalAmount = quantity * amount;
      form.setFieldsValue({ totalAmount });
    }
  };
  const validateDuplicates = (_: any, value: any) => {
    const duplicateEmails = additionalCostAll.filter(add => add.costCode === selectedAdditionalCostCode);
    if (duplicateEmails.length >= 1 && selectedAdditionalCostCode !== record.costCode) {
      return Promise.reject(new Error(t('This code has existed')));
    }
    return Promise.resolve();
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 700,
        }}
      >
        <div
          className="custom_scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 2,
            // backgroundColor: 'rgba(255, 0, 0, 0.5)',
          }}
        >
          <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleValuesChange}>
            {/* [21/01/2025][#21369][phuong_td] sắp xếp lại thứ tự cho các trường */}
            <Form.Item label='' name="ma_nv"></Form.Item>
            <Form.Item label={tDepot('Unit Code')} name="unitCode">
              <Input placeholder={tDepot('Enter the unit code')} />
            </Form.Item>
            <Row>
              <Col span={8} style={{ paddingRight: 12 }}>
                {/* [20/01/2025][#21321][phuong_td] bỏ việc check trùng lắp mã vụ việc */}
                <Form.Item
                  label={t('Expense Code')}
                  name="expenseCode"
                  rules={[
                    { required: false, message: t('Enter expense code') },
                    // { validator: validateDuplicates }
                  ]}
                >
                  {/* <Input placeholder={t('Enter expense code')} /> */}
                  <AutoCompleteCustom
                    id={''}
                    keyElement={keyAutoComplete_1}
                    value={selectedAdditionalCost?.costCode || ''}
                    optionsList={additionalCostAll.map(w => ({
                      key: `${w.id}`,
                      label: `${w.costCode}`,
                      value: w.costCode,
                      item: {
                        name: w.costName,
                        code: w.costCode,
                        data: w,
                      },
                    }))}
                    onChange={function (id: string, data: string): void {
                      // throw new Error('Function not implemented.');
                      form.setFieldsValue({ expenseCode: data });
                      setSelectedAdditionalCostCode(data);
                    }}
                    onSelect={function (id: string, data: string, label: string, item: any): void {
                      // throw new Error('Function not implemented.');
                      setSelectedAdditionalCost(item.data);
                      // console.log('Project onSelect ', id, data, label, item);
                      setKeyAutoComplete_1(Utils.generateRandomString(3));

                      form.setFieldsValue({ expenseName: item.name });
                    }}
                    className={''}
                    placeholder={t('Enter expense code')}
                    onBlur={function (id: string, data: string): void {
                      // throw new Error('Function not implemented.');
                      form.setFieldsValue({ expenseCode: data });
                      // console.log('onBlur ', id, data);
                      const temp = additionalCostAll.find(w => w.costCode === data);
                      if (temp) {
                        if (temp.costCode !== selectedAdditionalCost?.costCode) setSelectedAdditionalCost(temp);
                      } else {
                        setSelectedAdditionalCost(undefined);
                      }
                    }}
                    warning={''}
                  ></AutoCompleteCustom>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label={t('Expense Name')} name="expenseName">
                  <Input placeholder={t('Enter expense name')} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12} style={{ paddingRight: 12 }}>
                <Form.Item label={tDepot('Credit Account acronym')} name="Account">
                  <Input placeholder={tDepot('Enter your credit account')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={tDepot('Debit Account acronym')} name="DebtAccount">
                  <Input placeholder={tDepot('Enter the debit account')} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={tDepot('Supplier')} name="supplier">
              <AutoCompleteCustom
                id={''}
                keyElement={keyAutoComplete}
                value={selectedNcc || ''}
                optionsList={nccList.map(w => ({
                  label: `${w.ma_kh} / ${w.ten_kh}`,
                  value: w.ma_kh,
                  item: {
                    name: w.ten_kh,
                    code: w.ma_kh,
                  },
                }))}
                onChange={function (id: string, data: string): void {
                  // throw new Error('Function not implemented.');
                  form.setFieldsValue({ supplier: data });
                }}
                onSelect={function (id: string, data: string, label: string, item: any): void {
                  // throw new Error('Function not implemented.');
                  setSelectedNcc(item.code);
                  // console.log('Project onSelect ', id, data, label, item);
                  setKeyAutoComplete(Utils.generateRandomString(3));
                  form.setFieldsValue({ supplier: item.name });
                }}
                className={''}
                placeholder={tDepot('Choose a supplier')}
                onBlur={function (id: string, data: string): void {
                  // throw new Error('Function not implemented.');
                  form.setFieldsValue({ supplier: data });
                  // console.log('onBlur ', id, data);
                  const temp = nccList.find(w => w.ten_kh === data);
                  if (temp) {
                    if (temp.ma_kh !== selectedNcc) setSelectedNcc(temp.ma_kh);
                  } else {
                    setSelectedNcc('');
                  }
                }}
                warning={''}
              ></AutoCompleteCustom>
            </Form.Item>
            <Form.Item label={tDepot('Code item')} name="codeItem">
              {/* [21/01/2025][#21369][phuong_td] Điều chỉnh trường khoản mục được chọn từ input sang AutoComplete với dữ liệu là danh sách công trình */}
              <AutoCompleteCustom
                id={''}
                keyElement={keyAutoComplete_2}
                value={selectedCodeItem || ''}
                optionsList={projectList.map(w => ({
                  id: `${w.id}`,
                  key: `${w.id}`,
                  label: `${w.code} / ${w.name}`,
                  value: `${w.code}-${w.id}`,
                  item: {
                    name: w.name,
                    code: `${w.code}`,
                  },
                }))}
                onChange={function (id: string, data: string): void {
                  // throw new Error('Function not implemented.');
                  form.setFieldsValue({ codeItem: data });
                }}
                onSelect={async function (id: string, data: string, label: string, item: any): Promise<void> {
                  // throw new Error('Function not implemented.');
                  setSelectedCodeItem(item.code);
                  // console.log('Project onSelect ', id, data, label, item);
                  setKeyAutoComplete_2(Utils.generateRandomString(3));
                  form.setFieldsValue({ codeItem: item.name });
                  const chosenProject = projectList.find(project => project.name === item.name);
                  if (chosenProject) {
                    await ProjectService.Get.getProjectWarehouses(chosenProject.id).subscribe((res) => {
                      try {
                        console.log(res);
                        const warehouse = listWarehouse.find(warehouse => warehouse.id === res[0]?.warehouseId);
                        const ma_nv = res[0].ma_nv ? res[0].ma_nv : warehouse?.ma_Nv ? warehouse?.ma_Nv : 'none';
                        form.setFieldsValue({ ma_nv: ma_nv })
                        console.log(ma_nv);
                        // Process based on type
                      } catch (error) {
                        console.error('Failed to parse JSON:', error);
                      }
                    })
                  }
                }}
                className={''}
                placeholder={tDepot('Enter the code item')}
                onBlur={function (id: string, data: string): void {
                  // throw new Error('Function not implemented.');
                  form.setFieldsValue({ codeItem: data });
                  // console.log('onBlur ', id, data);
                  const temp = projectList.find(w => w.name === data);
                  if (temp) {
                    if (`${temp.code}` !== selectedCodeItem) setSelectedCodeItem(`${temp.code}`);
                  } else {
                    setSelectedCodeItem('');
                  }
                }}
                warning={''}
              ></AutoCompleteCustom>
            </Form.Item>

            <Row>
              <Col span={12} style={{ paddingRight: 12 }}>
                <Form.Item label={t('Payer')} name="payer">
                  <Input style={{ width: '100%' }} placeholder={t('Enter payer')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('Date')} name="date">
                  <DatePicker style={{ width: '100%' }} placeholder={t('Select date')} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12} style={{ paddingRight: 12 }}>
                <Form.Item label={t('Unit')} name="unit">
                  <Input style={{ width: '100%' }} placeholder={t('Enter unit')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('Quantity')} name="quantity">
                  <InputNumber style={{ width: '100%' }} placeholder={t('Enter quantity')} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={12} style={{ paddingRight: 12 }}>
                <Form.Item label={t('Amount')} name="amount">
                  <InputNumber<number>
                    style={{ textAlign: 'center', width: '100%' }}
                    placeholder={t('Enter amount')}
                    type="string"
                    formatter={value => {
                      // Đảm bảo giá trị không phải là undefined hoặc null
                      if (!value) return '0';
                      // Chia giá trị thành số và định dạng
                      const numValue = Number(value.toString().replace(/,/g, '')); // Loại bỏ dấu phẩy trước
                      return `${numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Định dạng số và thêm dấu `$`
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('Total1')} name="totalAmount">
                  <InputNumber<number>
                    style={{ textAlign: 'center', width: '100%' }}
                    placeholder={t('Enter total')}
                    type="string"
                    formatter={value => {
                      // Đảm bảo giá trị không phải là undefined hoặc null
                      if (!value) return '0';
                      // Chia giá trị thành số và định dạng
                      const numValue = Number(value.toString().replace(/,/g, '')); // Loại bỏ dấu phẩy trước
                      return `${numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Định dạng số và thêm dấu `$`
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={tDepot('Case code')} name="caseCode">
              <Input placeholder={tDepot('Enter the case code')} />
            </Form.Item>

            <Form.Item label={t('Note')} name="note">
              <TextArea rows={2} placeholder={t('Enter note')} />
            </Form.Item>

            <Form.Item label={t('Upload Image')} name="upload" valuePropName="upload">
              <Upload.Dragger
                name="files"
                listType="picture"
                accept=".jpg,.jpeg,.png"
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleChange}
                onPreview={handleImageClick} //xem lại ảnh mới tải lên
                onRemove={handleRemoveFile} //xóa ảnh
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng jpeg, png</p>
              </Upload.Dragger>
            </Form.Item>
          </Form>
          {selectedImage && ( //phần xem lại ảnh mới tải lên và ảnh đã có sẵn
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
              role="dialog"
              aria-modal="true"
            >
              <img
                src={selectedImage}
                alt="Selected"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button type="button" onClick={handleImageClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            backgroundColor: '#fff',
            paddingTop: 5,
          }}
        >
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/* <Button type="default" htmlType="button">
              {t('Cancel')}
            </Button> */}
            <Button type="primary" htmlType="submit" onClick={form.submit}>
              {t('update')}
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormUpdate;
