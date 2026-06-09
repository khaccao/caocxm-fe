import { useEffect, useState } from 'react';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  SelectProps,
  Typography,
  Upload,
  UploadProps,
  notification,
} from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import './GeneralInfo.less';
import { DateEmptyString, FormatDateAPI, SavingProject, formatDateDisplay, largePagingParams } from '@/common/define';
import { getEnvVars } from '@/environment';
import { WithPermission } from '@/hocs/PermissionHOC';
import { CreateProjectWarehousePayload } from '@/services/ProjectService';
import { accountingInvoiceActions, getWareHouses } from '@/store/accountingInvoice';
import { getAuthenticated, getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { getProjectStatusList, getProjectWarehouses, getSelectedProject, projectActions } from '@/store/project';

const { apiUrl } = getEnvVars();

export const GeneralInformation = () => {
  const listWarehouse = useAppSelector(getWareHouses());
  const projectWarehouse = useAppSelector(getProjectWarehouses());
  //[#21091][hoang_nm][04/12/2024] Lấy thông tin warehouses dựa vào warehousesIds
  const getWarehousesByIds = (warehousesIds: any[]): CreateProjectWarehousePayload[] => {
    return listWarehouse
      .filter(warehouse => warehousesIds.includes(warehouse.id)) 
      .map(
        warehouse =>
          ({
            projectId: selectedProject?.id,
            warehouseCode: warehouse.ma_kho,
            warehouseId: warehouse.id,
            type: 0,
            status: 0,
            note: '',
            createTime: warehouse.createDate,
          } as unknown as CreateProjectWarehousePayload),
      );
  };
  

  const { t } = useTranslation(['projects']);
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const statusList = useAppSelector(getProjectStatusList());
  const [photoUrl, setPhotoUrl] = useState<string>();
  const isSaving = useAppSelector(getLoading(SavingProject));
  const [uploading, setUploading] = useState(false);
  const auth = useAppSelector(getAuthenticated());
  const [warehousesIds, setWarehousesIds] = useState<number[]>([]);
  const company = useAppSelector(getCurrentCompany());
  //[#21091][hoang_nm][04/12/2024] Lấy thông tin warehouses dựa vào warehousesIds
  const [warehouses, setWarehouses] = useState<CreateProjectWarehousePayload[]>(getWarehousesByIds(warehousesIds));

  useEffect(() => {
    dispatch(
      projectActions.getStatusListRequest({
        ...largePagingParams,
        type: 0,
      }),
    );
    dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
    // eslint-disable-next-line
  }, []);
  // [#20662][dung_lt][05/11/2024] get danh sách warehouse của project
  useEffect(() => {
    dispatch(
      projectActions.getWarehousesRequest({
        projectId: selectedProject?.id,
      }),
    );
    setPhotoUrl(selectedProject?.avatar);
  }, [selectedProject]);

  // [#20662][dung_lt][05/11/2024] set list ids để hiển thị danh sách kho đã lựa chọn trước đó
  useEffect(() => {
    if (projectWarehouse) {
      const ids = projectWarehouse.map(w => w.warehouseId);      
      setWarehousesIds(ids);
    }
  }, [projectWarehouse]);

  useEffect(() => {
    const updatedWarehouses = getWarehousesByIds(warehousesIds);
    setWarehouses(updatedWarehouses);
  }, [warehousesIds, listWarehouse, selectedProject]);

  const statusOptions: any[] = statusList.map(x => ({ value: x.id, label: x.name }));

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{t('ProjectPhoto')}</div>
    </button>
  );

  const handleChangePhoto: UploadProps['onChange'] = info => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done') {
      const url = info.file.response;
      setUploading(false);
      setPhotoUrl(url);
      return;
    }
    if (info.file.status === 'error') {
      setUploading(false);
      notification.error({
        message: t('Notification'),
        description: t('errorUploadPhoto'),
      });
    }
  };

  const props: UploadProps = {
    name: 'File',
    accept: 'image/*',
    action: `${apiUrl}/Project_Employee/project/uploadImage`,
    headers: {
      Authorization: auth.token ? `Bearer ${auth.token}` : '',
    },
    onChange: handleChangePhoto,
    showUploadList: false,
  };

  const handleSaveProject = (value: any) => {
    const inputData = {
      ...selectedProject,
      ...value,
      avatar: photoUrl,
      startDate: value.startDate ? dayjs(value.startDate).format(FormatDateAPI) : undefined,
      endDate: value.endDate ? dayjs(value.endDate).format(FormatDateAPI) : undefined,
    };

    // [#20662][dung_lt][05/11/2024] lọc những warehouse đã bỏ ra khỏi select
    const deleteProjectWarehouse = projectWarehouse?.filter(w => {
      const index = warehouses?.find(pw => pw.warehouseId === w.warehouseId);
      if (!index) {
        return w;
      }
    });
    // [#20662][dung_lt][05/11/2024] lọc những warehouse đã thêm vào select
    const addProjectWarehouse = warehouses?.filter(w => {
      const index = projectWarehouse?.find(pw => pw.warehouseId === w.warehouseId);
      if (!index) {
        return w;
      }
    });

    // [#20662][dung_lt][05/11/2024] xóa các warehouse đã loại bỏ
    if (deleteProjectWarehouse && deleteProjectWarehouse.length > 0) {
      deleteProjectWarehouse.forEach(dwh =>
        dispatch(projectActions.removeProjectWarehouseRequest({ warehouse: dwh, selectedProject })),
      );
    }

    // [#20662][dung_lt][05/11/2024] thêm các warehouse mới vùa lựa chọn
    if (addProjectWarehouse && addProjectWarehouse.length > 0 && selectedProject) {
      dispatch(projectActions.createWarehousesRequest({ projectId: selectedProject.id, data: addProjectWarehouse }));
    }

    if (selectedProject) {
      dispatch(
        projectActions.updateProjectRequest({ companyId: company.id, projectId: selectedProject.id, data: inputData }),
      );
      return;
    }
  };
  // [#20662][dung_lt][05/11/2024] hàm xử lý khi thay đổi lựa chọn warehouse
  const handleChangeWarehouse = (value: any) => {
    setWarehousesIds([...value]);
    const warehousesProject = listWarehouse
      .filter(warehouse => value.includes(warehouse.id)) // lọc những kho trong selectedIds
      .map(
        warehouse =>
          ({
            projectId: selectedProject?.id,
            warehouseCode: warehouse.ma_kho,
            warehouseId: warehouse.id,
            type: 0,
            status: 0,
            note: '',
            createTime: warehouse.createDate,
          } as unknown as CreateProjectWarehousePayload),
      );
    setWarehouses([...warehousesProject]);
  };
  // // Gọi hàm này trong handleChangeWarehouseReload
  // const handleChangeWarehouseReload = (value: any) => {
  //   setWarehousesIds([...value]);
  //   const warehouses = getWarehousesByIds(value); // Lấy mảng warehouses tương ứng với warehousesIds
  //   setWarehouses(warehouses); // Cập nhật state
  // };

  // [#20662][dung_lt][05/11/2024] xử lý tên hiện thị của các option ở select kho
  const dataTeams: SelectProps['options'] = listWarehouse?.map((mem: any) => {
    return { value: mem.id, label: `${mem.ten_kho}` };
  });
  // [#20662][dung_lt][05/11/2024] Hàm để loại bỏ dấu tiếng Việt
  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  return (
    <Form
      initialValues={{
        ...selectedProject,
        startDate:
          selectedProject?.startDate && selectedProject.startDate !== DateEmptyString
            ? dayjs(selectedProject.startDate)
            : null,
        endDate:
          selectedProject?.endDate && selectedProject.endDate !== DateEmptyString
            ? dayjs(selectedProject.endDate)
            : null,
      }}
      layout="vertical"
      onFinish={handleSaveProject}
    >
      <Row align="stretch" gutter={[16, 10]}>
        {selectedProject && (
          <Col span={24}>
            <Row justify="end">
              <WithPermission policyKeys={['CaiDat.ThongTinChung.Edit']} strategy="disable">
                <Button type="primary" htmlType="submit" loading={isSaving}>
                  {t('Save')}
                </Button>
              </WithPermission>
            </Row>
          </Col>
        )}
        <Col span={24} xl={12}>
          <div style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, marginBottom: 10 }}>
            <Row style={{ marginBottom: 20 }}>
              <Typography.Title style={{ margin: 0 }} level={5}>
                {t('createProject.projectInfo.title')}
              </Typography.Title>
            </Row>
            <Form.Item
              name={'code'}
              label={t('createProject.projectInfo.projectCode')}
              rules={[{ required: true, message: t('createProject.projectInfo.requireProjectCode') }]}
            >
              <Input placeholder={t('createProject.projectInfo.projectCodePlaceholder')} />
            </Form.Item>
            <Form.Item
              name={'name'}
              label={t('createProject.projectInfo.projectName')}
              rules={[{ required: true, message: t('createProject.projectInfo.requireProjectName') }]}
            >
              <Input placeholder={t('createProject.projectInfo.projectNamePlaceholder')} />
            </Form.Item>
            <Form.Item
              name={'startDate'}
              label={t('createProject.projectInfo.projectStartDate')}
              rules={[{ required: true, message: t('createProject.projectInfo.requireProjectStartDate') }]}
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>

            <Form.Item
              name={'endDate'}
              label={t('createProject.projectInfo.projectEndDate')}
              rules={[{ required: true, message: t('createProject.projectInfo.requireProjectEndDate') }]}
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
            {/* <Form.Item style={{ marginBottom: 0 }}>
              <Form.Item
                label={t('City')}
                name="city"
                style={{ display: 'inline-block', width: 'calc(50% - 5px)', marginRight: 5 }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t('District')}
                name="district"
                style={{ display: 'inline-block', width: 'calc(50% - 5px)', marginLeft: 5 }}
              >
                <Input />
              </Form.Item>
            </Form.Item> */}
            <Form.Item
              name={'address'}
              label={t('createProject.projectInfo.address')}
              rules={[{ required: true, message: t('createProject.projectInfo.requireAddress') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name={'description'} label={t('createProject.projectInfo.description')}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name={'status'} label={t('Status')} rules={[{ required: true, message: t('requiredStatus') }]}>
              <Select options={statusOptions} />
            </Form.Item>
            <Form.Item>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader project-photo"
                showUploadList={false}
                {...props}
              >
                {photoUrl ? (
                  <img
                    src={`${apiUrl}/Projects${photoUrl}`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </div>
        </Col>
        <Col span={24} xl={12}>
          <div style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, marginBottom: 10 }}>
            <Row style={{ marginBottom: 20 }}>
              <Typography.Title style={{ margin: 0, marginBottom: 20, width: '100%' }} level={5}>
                {t('createProject.Warehouse.title')}
              </Typography.Title>
              <span style={{ margin: 0, marginBottom: 8 }}>{t('createProject.Warehouse.name')}</span>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                value={warehousesIds}
                onChange={handleChangeWarehouse}
                options={dataTeams}
                optionFilterProp="label"
                showSearch={true}
                filterOption={(inputValue, option) =>
                  typeof option?.label === 'string' &&
                  removeAccents(option.label).toLowerCase().includes(removeAccents(inputValue).toLowerCase())
                }
              />
            </Row>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, marginBottom: 10 }}>
            <Row style={{ marginBottom: 20 }}>
              <Typography.Title style={{ margin: 0 }} level={5}>
                {t('createProject.investorInfo.title')}
              </Typography.Title>
            </Row>
            <Form.Item
              name={'ownerName'}
              label={t('createProject.investorInfo.investorName')}
              rules={[{ required: true, message: t('createProject.investorInfo.requireInvestorName') }]}
            >
              <Input placeholder={t('createProject.investorInfo.investorNamePlaceholder')} />
            </Form.Item>
            <Form.Item
              name={'ownerPhone'}
              label={t('createProject.investorInfo.investorPhone')}
              rules={[{ message: t('createProject.investorInfo.requireInvestorPhone') }]}
            >
              <Input placeholder={t('createProject.investorInfo.investorPhonePlaceholder')} />
            </Form.Item>
            <Form.Item
              name={'ownerEmail'}
              label={t('createProject.investorInfo.investorEmail')}
              rules={[
                { message: t('createProject.investorInfo.requireInvestorEmail') },
                {
                  type: 'email',
                  message: t('createProject.investorInfo.emailNotValid'),
                },
              ]}
            >
              <Input placeholder={t('createProject.investorInfo.investorEmailPlaceholder')} />
            </Form.Item>
          </div>
        </Col>
      </Row>
    </Form>
  );
};
