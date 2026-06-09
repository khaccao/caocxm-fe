/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row, Select, SelectProps, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { ProjectEmployeeWithRoles, ProjectResponse } from '@/common/project';
import { CreateProjectWarehousePayload } from '@/services/ProjectService';
import { accountingInvoiceActions, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCreateProjectInformationValue, getProjectList, projectActions } from '@/store/project';
import Utils from '@/utils';
import { InvestorInfo, ProjectInfo } from './components';
import styles from './GeneralInformation.module.less';

export const GeneralInformation = () => {
  const { t } = useTranslation(['projects']);
  const company = useAppSelector(getCurrentCompany());
  const projectList = useAppSelector(getProjectList());
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [investorInfo, setInvestorInfo] = useState({});
  const projectById = useAppSelector(state => state.project.projectById);
  const projectMemberList = useAppSelector(state => state.project.projectMembers);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [copiedProjectMembers, setCopiedProjectMembers] = useState<ProjectEmployeeWithRoles[]>([]);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();

  const createProjectInformationValue = useAppSelector(getCreateProjectInformationValue());
  const [warehouses, setWarehouses] = useState<CreateProjectWarehousePayload[]>([]);
  const [warehousesIds, setWarehousesIds] = useState<number[]>([]);
  const listWarehouse = useAppSelector(getWareHouses());

  // [#20662][dung_lt][05/11/2024] lấy danh sách kho từ kế toán
  useEffect(() => {
    dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
    // eslint-disable-next-line
  }, []);
  //[20491] [nam_do] tinh nang copy project
  const handleSubmit = (values: any) => {
    const projectInfoValues = form.getFieldsValue();
    const investorInfoValues = form.getFieldsValue(['investorName', 'investorPhone', 'investorEmail']);

    const combinedValues = {
      ...projectInfoValues,
      ...investorInfoValues,
      ...values,
      warehouses,
      copyFromProject: selectedProjectId,
    };

    console.log('Combined values:', combinedValues); // Kiểm tra giá trị

    dispatch(projectActions.setCreateProjectCurrentStep(1));
    dispatch(projectActions.setCreateProjectInformationValue(combinedValues));
  };

  useEffect(() => {
    // Fetch project list
    dispatch(projectActions.getProjectsByCompanyIdRequest(company.id));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (projectList && Array.isArray(projectList)) {
      setProjects(projectList);
    }
  }, [projectList]);
  //[24/10/2024] [nam_do] Thêm lấy danh sách thành viên khi copy dự án
  const handleCopyFromProject = (projectId: number | '') => {
    if (projectId === '') {
      // Đặt lại tất cả các trường form về trạng thái ban đầu
      form.resetFields();
      // Xóa avatar dự án
      dispatch(projectActions.setProjectAvatar(''));
      // Đặt lại thông tin nhà đầu tư
      setInvestorInfo({});
      setSelectedProjectId(null);
      // Cập nhật state projectById thành rỗng
      dispatch(projectActions.setProjectByIdResponse(null));
      // Reset danh sách thành viên
      dispatch(projectActions.setProjectMemberList([]));
      // Đặt lại các trường cụ thể về giá trị mặc định
      form.setFieldsValue({
        projectName: '',
        projectStartDate: null,
        projectEndDate: null,
        address: '',
        description: '',
        status: undefined,
        investorName: '',
        investorPhone: '',
        investorEmail: '',
      });
      return;
    }

    setSelectedProjectId(projectId);
    // Gọi action để lấy thông tin dự án theo ID
    dispatch(projectActions.getProjectByIdRequest(projectId.toString()));

    // Gọi action để lấy danh sách thành viên dự án
    dispatch(projectActions.getProjectMembersRequest({ projectId: projectId.toString() }));
  };

  useEffect(() => {
    if (projectById && selectedProjectId) {
      // Điền thông tin dự án mẫu vào form
      form.setFieldsValue({
        projectName: projectById.name,
        projectStartDate: dayjs(),
        projectEndDate: dayjs().add(1, 'year'),
        address: projectById.address,
        description: projectById.description,
        status: projectById.status,
        // Thêm thông tin chủ đầu tư vào form
        investorName: projectById.ownerName,
        investorPhone: projectById.ownerPhone,
        investorEmail: projectById.ownerEmail,
      });

      // Cập nhật avatar nếu có
      if (projectById.avatar) {
        dispatch(projectActions.setProjectAvatar(projectById.avatar));
      } else {
        dispatch(projectActions.setProjectAvatar(''));
      }
      // Cập nhật thông tin nhà đầu tư
      setInvestorInfo({
        investorName: projectById.ownerName,
        investorPhone: projectById.ownerPhone,
        investorEmail: projectById.ownerEmail,
      });
      if (projectMemberList && Array.isArray(projectMemberList.results)) {
        const convertedMembers = projectMemberList.results.map(member => ({
          ...member,
          Roles: member.role ? [member.role] : [],
        })) as unknown as ProjectEmployeeWithRoles[];

        setCopiedProjectMembers(convertedMembers);
        dispatch(projectActions.setProjectMemberList(convertedMembers));
      }
    }
    // eslint-disable-next-line
  }, [projectById, selectedProjectId, form, projectMemberList]);

  const AdditionComponent = () => {
    return (
      <Col span={24}>
        <div className={styles.footerContainer}>
          <Form.Item>
            <Button type="primary" htmlType="submit" className={styles.buttonWithIcon}>
              {t('createProject.next')}
              <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </div>
      </Col>
    );
  };
  // [#20662][dung_lt][05/11/2024] hàm xử lý khi lựa chọn kho
  const handleChangeWarehouse = (value: any) => {

    setWarehousesIds([...value]);
    const warehousesProject = listWarehouse
      .filter(warehouse => value.includes(warehouse.id)) // lọc những kho trong selectedIds
      .map(
        warehouse =>
          ({
            projectId: 0,
            warehouseCode: warehouse.ma_kho,
            warehouseId: warehouse.id,
            ma_nv: warehouse.ma_Nv,
            type: 0,
            status: 0,
            note: '',
            createTime: warehouse.createDate,
          } as unknown as CreateProjectWarehousePayload),
      );
      console.log(warehousesProject);
    setWarehouses([...warehousesProject]);
  };
  // [#20662][dung_lt][05/11/2024] xử lý tên hiện thị của các option ở select kho
  const dataTeams: SelectProps['options'] = listWarehouse?.map((mem: any) => {
    return { value: mem.id, label: `${mem.ten_kho}` };
  });
  // [#20662][dung_lt][05/11/2024] Hàm để loại bỏ dấu tiếng Việt
  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };
  // [#20662][dung_lt][05/11/2024] set warehouseids cho phần select component và warehouses cho phần lưu đầy đủ gửi về BE
  useEffect(() => {
    if (createProjectInformationValue && createProjectInformationValue.warehouses) {
      const ids = Utils.clone(createProjectInformationValue.warehouses).map(
        (w: CreateProjectWarehousePayload) => w.warehouseId,
      );
      setWarehouses([...createProjectInformationValue.warehouses]);
      setWarehousesIds([...ids]);
    }
  }, [createProjectInformationValue]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...createProjectInformationValue,
        projectStartDate: createProjectInformationValue?.projectStartDate
          ? dayjs(createProjectInformationValue.projectStartDate)
          : null,
        projectEndDate: createProjectInformationValue?.projectEndDate
          ? dayjs(createProjectInformationValue.projectEndDate)
          : null,
      }}
      onFinish={handleSubmit}
    >
      <Row gutter={[16, 16]}>
        <Col span={24} lg={24} xl={12}>
          <ProjectInfo projectList={projectList} onCopyFromProject={handleCopyFromProject} />
        </Col>
        <Col span={24} lg={24} xl={12}>
          <div className={styles.warehouseContainer}>
            <Typography.Text style={{ fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>
              {t('createProject.Warehouse.title')}
            </Typography.Text>
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
          </div>
          <InvestorInfo AdditionComponent={<AdditionComponent />} investorInfo={investorInfo} />
        </Col>
      </Row>
    </Form>
  );
};
