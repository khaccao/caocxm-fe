/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Row, Space, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { madvcs } from '@/common/define';
import { CostDataCreate } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import { accountingInvoiceActions, getAdditionalCostAll, getNccList, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import { getProjectList, getSelectedProject } from '@/store/project';
import Utils from '@/utils';
import AutoCompleteCustom from '../AutoCompleteCustom';

interface ExpenseFormProps {
  record?: any;
  // [#20806][dunglt][3/12/2024] thêm set modal để khi update hoặc thêm mới xong thì đóng modal lại
  setModel: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ record, setModel }) => {
  const { TextArea } = Input;
  const dispatch = useDispatch();
  const { t } = useTranslation('material');
  const selectedProject = useAppSelector(getSelectedProject());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const company = useAppSelector(getCurrentCompany());
  const [form] = Form.useForm();
  const tDepot = useTranslation('depot').t;
  const listWarehouse = useAppSelector(getWareHouses());
  const [keyAutoComplete, setKeyAutoComplete] = useState<string>('111');
  const [keyAutoComplete_1, setKeyAutoComplete_1] = useState<string>('111');
  const [keyAutoComplete_2, setKeyAutoComplete_2] = useState<string>('111');

  const additionalCostAll = useAppSelector(getAdditionalCostAll());
  const [selectedAdditionalCost, setSelectedAdditionalCost] = useState<CostDataCreate>();
  const [selectedAdditionalCostCode, setSelectedAdditionalCostCode] = useState<string>();

  // [18/12/2024][#21174][phuong_td] Danh sách Nhà cung cấp và nhà cung cấp được chọn
  const [selectedNcc, setSelectedNcc] = useState<string>();
  const nccList = useAppSelector(getNccList());
  // [21/01/2025][#21369][phuong_td] Danh sách công trình và khoản mục được chọn
  const projectList = useAppSelector(getProjectList());
  const [selectedCodeItem, setSelectedCodeItem] = useState<string>('');

  //khởi tạo form dữ liệu formdata để lưu dữ liệu các tệp ảnh vừa tải lên
  const [formFileData, setFormFileData] = useState<FormData | null>(null);
  const formData = new FormData();
  fileList.forEach((file: any) => {
    if (file.originFileObj) {
      formData.append('files', file.originFileObj);
    }
  });

  // [16/01/2025][#23123] [phuong_td] khởi tạo giá trị ban đầu cho trường madvcs và ngày
  useEffect(() => {
    // [21/01/2025][#21369][phuong_td] thêm giá trị ban đầu cho đơn vị và số lượng
    form.setFieldsValue({
      unitCode: madvcs.THUCHIEN,
      date: dayjs(),
      unit: 'VND',
      quantity: 1,
    });
  }, []);

  // [16/01/2025][#23123] [phuong_td] fill tự động các trường thuộc kế toán khi chọn mã vụ việc
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

  // useEffect để xử lý tải ảnh khi có tệp trong danh sách tải lên
  useEffect(() => {
    dispatch(accountingInvoiceActions.getCustomers());
    const uploadFiles = async () => {
      if (fileList.length > 0) {
        try {
          await dispatch(
            accountingInvoiceActions.createFileCPPS({
              itemId: record?.id,
              dataImage: formData,
              projectId: selectedProject?.id,
              companyId: company.id,
            }),
          );
          message.success('Thêm mới chi phí và tải ảnh lên thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra khi tải ảnh lên.');
          console.error('Lỗi khi tải ảnh lên:', error);
        }
      }
    };
    uploadFiles();
  }, []);

  const onFinish = async (values: any) => {
    console.log(selectedCodeItem);
    // const project = projectList.find(project => project.code === selectedCodeItem)
    // Kiểm tra nếu selectedCodeItem không hợp lệ
    const isValidCodeItem = projectList.some(project => project.code === selectedCodeItem);
    if (!isValidCodeItem) {
      message.error('Mã khoản mục không hợp lệ');
      return; // Dừng thực thi nếu mã không hợp lệ
    }
  
    // [16/01/2025][#23123] [phuong_td] bổ sung thêm dữ liệu
    if (selectedAdditionalCostCode) {
      const dataCreate: CostDataCreate = {
        projectId: selectedProject?.id || -1,
        costName: values.expenseName,
        costCode: selectedAdditionalCostCode,
        unit: values.unit,
        createdById: 0,
        createdBy: values.payer,
        createDate: values.date ? dayjs(values.date).format('YYYY-MM-DDTHH:mm:ss[Z]') : dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        amount: values.amount,
        quantity: values.quantity,
        totalAmount: values.totalAmount,
        ma_nv: values.ma_nv,
        payer: values.payer,
        payerId: 0,
        notes: values.note,
        checkbox: false,
        id: undefined,
        key: '',
        attachmentLinks: [],
        projectCode: `${selectedProject?.code}` || '',
        projectName: selectedProject?.name || '',
        tkCo: values.Account,
        tkNo: values.DebtAccount,
        madvcs: values.unitCode,
        maKM: selectedCodeItem,
        ncc: selectedNcc || '',
        mavc: values.caseCode || '',
        companyId: company.id,
      };
  
      try {
        await dispatch(
          accountingInvoiceActions.CreateAdditionalCost({
            dataCreate: [dataCreate],
            files: formData,
            companyId: company.id,
          }),
        );
        setModel(false);
      } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại.');
        console.error('Lỗi:', error);
      }
    }
  };
  const handleUploadChange = (info: any) => {
    // Xử lý khi có thay đổi trong upload, cập nhật danh sách tệp
    const { status, fileList } = info;
    const formData = new FormData();
    fileList.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });
    setFormFileData(formData);

    setFileList(fileList);
  };

  const handlePreview = async (file: UploadFile) => {
    // Xử lý khi người dùng nhấn để xem lại các ảnh vừa tải lên
    if (file.url) {
      setSelectedImage(file.url);
    } else if (file.preview) {
      setSelectedImage(file.preview as string);
    } else {
      const preview = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as Blob);
        reader.onload = () => resolve(reader.result as string);
      });
      setSelectedImage(preview);
      file.preview = preview;
    }
  };

  const handleImageClose = () => {
    //close xem ảnh
    setSelectedImage(null);
  };

  // [#21078][dunglt][3/12/2024] thêm set modal để khi update hoặc thêm mới xong thì đóng modal lại
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const { quantity, amount } = allValues;
    if (('quantity' in changedValues || 'amount' in changedValues) && quantity != null && amount != null) {
      const totalAmount = quantity * amount;
      form.setFieldsValue({ totalAmount });
    }
  };
  // [16/01/2025][#23123] [phuong_td] validateDuplicates
  const validateDuplicates = (_: any, value: any) => {
    const duplicateCode = additionalCostAll.filter(add => add.costCode === selectedAdditionalCostCode);
    if (duplicateCode.length >= 1) {
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
          {/* [21/01/2025][#21369][phuong_td] sắp xếp lại thứ tự cho các trường */}
          <Form.Item label='' name="ma_nv"></Form.Item>
          <Form layout="vertical" form={form} onFinish={onFinish} onValuesChange={handleValuesChange}>
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
                    { required: true, message: t('Enter expense code') },
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

            <Form.Item label={tDepot('Code item')} name="codeItem" rules={[{ required: true, message: t('Code Item is required') }]}
            >
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
                  // console.log(item.code, id, label, data  );
                  const chosenProject = projectList.find(project => project.name === item.name);
                  if (chosenProject) {
                    await ProjectService.Get.getProjectWarehouses(chosenProject.id).subscribe((res) => {
                      try {
                        console.log(res);
                        const warehouse = listWarehouse.find(warehouse => warehouse.id === res[0]?.warehouseId);
                        const ma_nv = res[0].ma_nv ? res[0].ma_nv :  warehouse?.ma_Nv ? warehouse?.ma_Nv : 'none';
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
                onChange={handleUploadChange}
                onPreview={handlePreview}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng jpeg, png</p>
              </Upload.Dragger>
            </Form.Item>
          </Form>
          {selectedImage && ( // Phần hiển thị ảnh khi người dùng nhấn xem trước
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '10px', //padding ảnh
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
                <button
                  type="button"
                  onClick={handleImageClose}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleImageClose();
                    }
                  }}
                  style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
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
              {t('Save')}
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
