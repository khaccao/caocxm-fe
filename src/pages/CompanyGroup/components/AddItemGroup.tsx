import React, { useEffect, useState } from 'react';

import { Button, Form, Input, Select, message, AutoComplete, Modal } from 'antd';

import { iCompanyGroup } from '../CompanyGroup';
import { GroupDTO } from '@/services/GroupService';
import { getCurrentCompany } from '@/store/app';
import { groupActions } from '@/store/group';
import { getGroups } from '@/store/group/groupSelector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getEmployeesByCompanyId } from '@/store/project';
import Utils from '@/utils';

const { Option } = Select;

const options = [
  { index: 0, name: 'addGroup', label: 'Thêm phòng ban' },
  { index: 1, name: 'addTeam', label: 'Thêm 1 tổ đội' },
  { index: 2, name: 'addEmployee', label: 'Thêm nhân viên' },
];

const AddItemGroup: React.FC<{ selectedGroup: iCompanyGroup | null; onCancel: () => void }> = ({
  selectedGroup,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState<string>('addGroup'); // Mặc định là "addGroup"
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [isCustomGroup, setIsCustomGroup] = useState<boolean>(true); // Cờ kiểm tra nhóm tự nhập
  const company = useAppSelector(getCurrentCompany());
  const employeesByCompanyId = useAppSelector(getEmployeesByCompanyId());
  const dataGroups = useAppSelector(getGroups());
  const dispatch = useAppDispatch();
  //console.log(selectedGroup, 'selectedGroup');
  const handleOptionChange = (value: string) => {
   // console.log(value);
    setSelectedOption(value);
    form.resetFields();
    setIsCustomGroup(true);
  };

  useEffect(() => {
    if (selectedGroup?.type === 1) {
      setSelectedOption('addEmployee');
    } else {
      setSelectedOption('addGroup');
    }
  }, [selectedGroup]);

  const handleSearchGroup = (searchText: string) => {
    const filteredGroups = dataGroups
      .filter(group => group.type === 0 && group.name.toLowerCase().includes(searchText.toLowerCase()))
      .map(group => ({ value: group.name, group }));
    setAutoCompleteOptions(filteredGroups as any);
    setIsCustomGroup(!filteredGroups.find(g => g.value === searchText));
  };

  const handleSelectGroup = (value: string) => {
    const selectedGroup = dataGroups.find(group => group.name === value);
    if (selectedGroup) {
      form.setFieldsValue({ code: selectedGroup.code });
      setIsCustomGroup(false);
    }
  };
  const handleSearchTeam = (searchText: string) => {
    const filteredGroups = dataGroups
      .filter(group => group.type === 1 && group.name.toLowerCase().includes(searchText.toLowerCase()))
      .map(group => ({ value: group.name, group }));
    setAutoCompleteOptions(filteredGroups as any);
    setIsCustomGroup(!filteredGroups.find(g => g.value === searchText));
  };

  const handleSelectTeam = (value: string) => {
    const selectedGroup = dataGroups.find(group => group.name === value);
    if (selectedGroup) {
      form.setFieldsValue({ code: selectedGroup.code });
      setIsCustomGroup(false);
    }
  };

  const handleSubmit = (values: any) => {
    if (selectedOption === 'addGroup') {
      const group: GroupDTO = {
        companyId: Number(company.id),
        parentId: Number(selectedGroup?.id),
        name: values.title,
        code: values.code,
        type: 0,
        status: 0,
      };
      dispatch(groupActions.createGroupRequest({ inputValues: group }));
    } else if (selectedOption === 'addTeam') {
      const team: GroupDTO = {
        companyId: Number(company.id),
        parentId: Number(selectedGroup?.id),
        name: values.title,
        code: values.code,
        type: 1,
        status: 0,
      };
      dispatch(groupActions.createGroupRequest({ inputValues: team }));
    } else if (selectedOption === 'addEmployee') {
      const { employeeIds } = values;
      dispatch(
        groupActions.addMemberToGroupRequest({
          groupId: selectedGroup?.id,
          employeeIds: employeeIds,
          companyId: Number(company.id),
        }),
      );
      Utils.successNotification('Thêm nhân viên thành công!');
    }
    form.resetFields();
    onCancel();
  };
  useEffect(() => {
    form.setFieldsValue({ action: selectedOption });
  }, [selectedOption, form]);
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          // action: 'addGroup',
          title: '',
          code: '',
        }}
      >
        {selectedGroup?.type !== 1 && (
          <Form.Item name="action" label={<span style={{ fontWeight: 'bold' }}>Chọn phương thức:</span>}>
            <Select value={selectedOption} onChange={handleOptionChange}>
              <Option value="addGroup">Thêm phòng ban</Option>
              <Option value="addTeam">Thêm tổ đội</Option>
              <Option value="addEmployee">Thêm nhân viên</Option>
            </Select>
          </Form.Item>
        )}
        {selectedOption === 'addGroup' && (
          <>
            <Form.Item
              name="title"
              label={<span style={{ fontWeight: 'bold' }}>Tên phòng ban:</span>}
              rules={[{ required: true, message: 'Tên phòng ban là bắt buộc!' }]}
            >
              <AutoComplete
                options={dataGroups
                  .filter(
                    group =>
                      group.type === 0 && // Chỉ lấy các group
                      group.id !== Number(selectedGroup?.id) && // Bỏ qua chính group đang được chọn
                      !selectedGroup?.children?.some(child => child.type === 0 && child.id === group.id?.toString()), // Bỏ qua group đã tồn tại trong children
                  )
                  .map(group => ({ value: group.name }))}
                onSearch={handleSearchGroup}
                onSelect={handleSelectGroup}
                placeholder="Nhập tên phòng ban"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 'bold' }}>Mã phòng ban:</span>}
              rules={[
                { required: true, message: 'Mã phòng ban là bắt buộc!' },
                {
                  validator: (_, value) =>
                    isCustomGroup || value ? Promise.resolve() : Promise.reject('Vui lòng nhập mã phòng ban!'),
                },
              ]}
            >
              <Input disabled={!isCustomGroup} placeholder="Nhập mã phòng ban" />
            </Form.Item>
          </>
        )}
        {selectedOption === 'addTeam' && (
          <>
            <Form.Item
              name="title"
              label={<span style={{ fontWeight: 'bold' }}>Tên tổ đội:</span>}
              rules={[{ required: true, message: 'Tên tổ đội là bắt buộc!' }]}
            >
              <AutoComplete
                options={dataGroups
                  .filter(
                    team =>
                      team.type === 1 &&
                      !selectedGroup?.children?.some(child => child.type === 1 && child.id === team.id?.toString()),
                  ) // Lọc các tổ đội chưa tồn tại
                  .map(team => ({ value: team.name }))}
                onSearch={handleSearchTeam}
                onSelect={handleSelectTeam}
                placeholder="Nhập tên tổ đội"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 'bold' }}>Mã tổ đội:</span>}
              rules={[
                { required: true, message: 'Mã tổ đội là bắt buộc!' },
                {
                  validator: (_, value) =>
                    isCustomGroup || value ? Promise.resolve() : Promise.reject('Vui lòng nhập mã tổ đội!'),
                },
              ]}
            >
              <Input disabled={!isCustomGroup} placeholder="Nhập mã tổ đội" />
            </Form.Item>
          </>
        )}
        {selectedOption === 'addEmployee' && (
          <Form.Item
            name="employeeIds"
            label={<span style={{ fontWeight: 'bold' }}>Chọn nhân viên:</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên!' }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              allowClear
              optionFilterProp="children"
              showSearch
              mode="multiple" // Hỗ trợ chọn nhiều nhân viên
            >
              {employeesByCompanyId
                .filter(
                  employee =>
                    !selectedGroup?.children?.some(child => child.type === 2 && child.id === `nv_${employee.id}`),
                ) // Lọc nhân viên chưa có trong nhóm
                .map(employee => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.lastName || ''} ${employee.middleName || ''} ${employee.firstName || ''}`.trim()}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="default"
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
            style={{ marginRight: 10 }}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default AddItemGroup;
