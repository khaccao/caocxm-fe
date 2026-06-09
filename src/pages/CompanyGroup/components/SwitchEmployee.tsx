import React, { useEffect, useState } from 'react';

import { Button, Form, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { iCompanyGroup } from '../CompanyGroup';
import { GroupDTO } from '@/services/GroupService';
import { getCurrentCompany } from '@/store/app';
import { groupActions } from '@/store/group';
import { getGroups } from '@/store/group/groupSelector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const { Option } = Select;
function getId(str: string) {
  return str.split('_')[1];
}
const SwitchEmployee: React.FC<{ selectedEmployee: any | null; onCancel: () => void }> = ({
  selectedEmployee,
  onCancel,
}) => {
  const { t } = useTranslation('companyGroup');
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState<string>(''); // Default to "addGroup"
  const company = useAppSelector(getCurrentCompany());
  const dataGroups = useAppSelector(getGroups());
  const dispatch = useAppDispatch();
  useEffect(() => {
    setSelectedOption('');
    form.setFieldsValue({ groupId: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);
  
  const handleSubmit = (values: any) => {
    dispatch(
      groupActions.moveEmployeeRequest({
        employeeId: getId(selectedEmployee.id),
        groupId: selectedEmployee.parentId,
        companyId: company.id,
        newGroupId: values.groupId,
      }),
    );
    message.success('Điều chuyển thành công!');
    onCancel();
  };

  useEffect(() => {
    form.setFieldsValue({ groupId: selectedOption });
  }, [selectedOption, form]);

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{}}>
        <Form.Item
          name="groupId"
          label={<span style={{ fontWeight: 'bold' }}>{t("Select department/team")}:</span>}
          rules={[{ required: true, message: t("Please select a group!") }]}
        >
          <Select placeholder={t("Select department/team")} allowClear showSearch optionFilterProp="children">
            {dataGroups
              .filter(group => {
                // [30/11/2024][#21008][phuong_td] Điều chỉnh điều kiện lọc phòng ban, bỏ qua các phòng ban và tổ đội đã có nhân viên điều chuyển
                const checkGroupNotParentOfEmployee = group.id !== Number(selectedEmployee.parentId) // Bỏ qua group có id là parentId của selectedEmployee
                const {id} = selectedEmployee;
                const index = group.employees?.findIndex((e) => {
                  return `nv_${e.id}` === id;
                }); // Bỏ qua group/team đã có nhân công được chọn điều chuyển
                return checkGroupNotParentOfEmployee && index === -1;
              }) 
              .map(group => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="default"
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
            style={{ marginRight: 10 }}
          >
            {t("Cancel")}
          </Button>
          <Button type="primary" htmlType="submit">
            {t("Save")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SwitchEmployee;

