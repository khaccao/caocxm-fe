/* eslint-disable react-hooks/exhaustive-deps */
import { debug } from 'util';

import React, { useEffect, useState } from 'react';

import { EllipsisOutlined, CaretDownOutlined, CaretUpOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, MenuProps, Modal, Space, Table, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from '././CompanyGroup.module.less';
import { CompanyGroupHeader } from './CompanyGroupHeader';
import AddItemGroup from './components/AddItemGroup';
import SwitchEmployee from './components/SwitchEmployee';
import { colors } from '@/common/colors';
import { usePermission, useWindowSize } from '@/hooks';
import { getCurrentCompany } from '@/store/app';
import { getGroups, getSearchStr } from '@/store/group/groupSelector';
import { groupActions } from '@/store/group/groupSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { projectActions } from '@/store/project';
export interface iCompanyGroup {
  id: string;
  order?: number;
  companyId: number;
  code:string;
  name: string;
  type: eType;
  parentId: number;
  managerId: number;

  status: number;
  children: iCompanyGroup[];
}
export enum eType {
  PhongBan,
  Nhom,
  NhanSu,
}

const convertData = (inputData: any[]) => {
  const result: any[] = [];
  if (inputData) {
    inputData.forEach((item: any) => {
      // Xác định type và parentID cho từng phòng ban và nhóm
      const type = item.type === 0 ? eType.PhongBan : eType.Nhom;
      const parentId = item.parentId ? item.parentId : null;

      //[#21002][hoang_nm][29/11/2024] Thêm vào kết quả đầy đủ các trường để có thể update
      result.push({
        companyId: item.companyId,
        id: `${item.id}`,
        name: item.name,
        managerId: item.managerId,
        code: item.code,
        parentId: parentId,
        type: type,
        status: item.status,
      });
      //[06/12/2024][ngoc_td] sắp xếp data employee theo alphabet
      const sortedEmployees = [...item.employees].sort((a: any, b: any) => {
        const nameA = `${a.lastName} ${a.middleName} ${a.firstName}`.trim().toLowerCase();
        const nameB = `${b.lastName} ${b.middleName} ${b.firstName}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
    });

      let employeeCounter = 1; // Initialize counter for employees under the same parent

      // Xử lý các employees và thêm vào result
      sortedEmployees.forEach((employee: any) => {
        result.push({
          id: `nv_${employee.id}`,
          //[#21004][hoang_nm][28/11/2024] Format lại hiển thị tên theo thứ tự "Họ - tên đệm - tên"
          name: `${employee.lastName} ${employee.middleName} ${employee.firstName}`.trim(),
          parentId: `${item.id}`,
          type: eType.NhanSu,
          code: employee.employeeCode, // Include employee code
          order: employeeCounter++, // Add sequential numbering for employees
        });
      });
    });
  }
  return result;
};
function getId(str: string) {
  if (str) {
    return str.split('_')[1];
  }
}
export const CompanyGroup: React.FC = () => {
  const { t } = useTranslation('companyGroup');
  const windowSize = useWindowSize();
  const dataGroups = useAppSelector(getGroups());
  const [Data, setData] = useState<iCompanyGroup[]>([]);
  const company = useAppSelector(getCurrentCompany());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEmployee, setModalEmployee] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [employeeDelete, setEmployeeDelete] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<iCompanyGroup | null>(null); // State lưu nhóm được chọn
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null); // State lưu nhóm được chọn
  const searchStr = useAppSelector(getSearchStr());
  const [searchValue, setSearchValue] = useState<string>(searchStr);
  const dispatch = useAppDispatch();

  const editGranted = usePermission(['CongTy.PhongBan.Edit']);
  const deleteGranted = usePermission(['CongTy.PhongBan.Delete']);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [nameGroupFix, setNameGroupFix] = useState('');
  const [codeGroupFix, setCodeGroupFix] = useState('');

  useEffect(() => {
    setSearchValue(searchStr);
  }, [searchStr]);

  const filterTreeBySearch = (nodes: iCompanyGroup[], searchValue: string): iCompanyGroup[] => {
    if (!searchValue) return nodes; // Nếu không có giá trị tìm kiếm, trả về toàn bộ dữ liệu

    return nodes
      .map(node => {
        const filteredChildren = filterTreeBySearch(node.children || [], searchValue); // Đệ quy lọc các nút con

        // Kiểm tra xem `name` của nút hoặc các nút con có khớp với `searchValue`
        const isMatchingNode = node.name.toLowerCase().includes(searchValue.toLowerCase());
        if (isMatchingNode || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children, // Giữ toàn bộ nút con nếu nút gốc hoặc con phù hợp
          };
        }

        return null; // Bỏ qua các nút không phù hợp
      })
      .filter((node): node is iCompanyGroup => node !== null); // Loại bỏ các giá trị null
  };
  const handleDeleteGroup = (group: iCompanyGroup | null) => {
    dispatch(groupActions.removeGroupsRequest({ id: group?.id, companyId: company.id }));
    setSelectedGroup(null);
    setModalDelete(false);
  };
  const handleDeleteEmployee = (employee: any) => {
    dispatch(
      groupActions.deleteEmployeeGroupRequest({
        employeeId: getId(employee?.id),
        parentId: employee?.parentId,
        companyId: company.id,
      }),
    );
    setSelectedEmployee(null);
    setEmployeeDelete(false);
  };
  const handleModalDelete = (group: iCompanyGroup | any | null) => {
    if (group?.type === eType.NhanSu) {
      setSelectedEmployee(group);
      setEmployeeDelete(true);
    } else {
      setSelectedGroup(group);
      setModalDelete(true);
    }
  };
  const handleModalEmployee = (employee: any) => {
    setSelectedEmployee(employee); // Lưu nhóm được chọn
    // dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    setModalEmployee(true);
  };
  const handleEmployeeClose = () => {
    setSelectedEmployee(null); // Lưu nhóm được chọn
    setModalEmployee(false);
  };
  // [#20692][phuong_td][31/10/2024] Dữ liệu thay đổi
  const handleModalVisible = (group: iCompanyGroup | null) => {
    //add mới
    setSelectedGroup(group); // Lưu nhóm được chọn
    dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    setModalVisible(true);
  };

  //[#21002][hoang_nm][29/11/2024] Lưu dữ liệu để set hiển thị lên form modal
  const handleModalVisibleFix = (group: iCompanyGroup | null) => {
    setIsModalVisible(true);
    setSelectedGroup(group);
    if (group) {
      form.setFieldsValue({
        nameGroupFix: group.name, // Cập nhật giá trị tên phòng ban trong form
        codeGroupFix: group.code, // Cập nhật giá trị mã phòng ban trong form
      });
    }
    dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
  };

  const handleModalClose = () => {
    setSelectedGroup(null); // Lưu nhóm được chọn
    setModalVisible(false);
  };
  // [#20692][phuong_td][31/10/2024] Cấu hình của table
  const buildTree = (data: any[]): iCompanyGroup[] => {
    const map: { [key: string]: iCompanyGroup } = {};
    const treeData: iCompanyGroup[] = [];

    data.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    data.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        treeData.push(map[item.id]);
      }
    });

    return treeData.filter(node => !!node); // Ensure no null values
  };
  useEffect(() => {
    dispatch(groupActions.getGroupsRequest(company.id));
  }, [isModalVisible]);

  useEffect(() => {}, [Data]);
  // useEffect(() => {
  //   console.log('dataGroups ', dataGroups);
  //   setData(buildTree(convertData(dataGroups)));
  // }, [dataGroups]);
  
  const columns: any[] = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: `100%`,
      render: (_: any, record: iCompanyGroup) => renderNameColumn(record),
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: iCompanyGroup) => {
        const fAdd = {
          label: (
            <Typography.Text
              // disabled={!isComplete}
              disabled={!editGranted}
              onClick={() => {
                handleModalVisible(record);
              }}
            >
              {t('Add')}
            </Typography.Text>
          ),
          key: `Add-${record.id}`,
        };
        //[#21002][hoang_nm][29/11/2024]Thêm button chỉnh sửa phòng ban
        const fFix = {
          label: (
            <Typography.Text
              // disabled={!isComplete}
              disabled={!editGranted}
              onClick={() => {
                handleModalVisibleFix(record);
              }}
            >
              {t('Fix')}
            </Typography.Text>
          ),
          key: `Fix-${record.id}`,
        };
        const fTransfer = {
          label: (
            <Typography.Text
              // disabled={!isComplete}
              disabled={!editGranted}
              onClick={() => {
                handleModalEmployee(record);
              }}
            >
              {t('Transfer')}
            </Typography.Text>
          ),
          key: `Transfer-${record.id}`,
        };
        const fDelete = {
          label: (
            <Typography.Text
              // disabled={!isComplete}
              disabled={!deleteGranted}
              onClick={() => {
                handleModalDelete(record);
              }}
            >
              {t('Delete')}
            </Typography.Text>
          ),
          key: `Delete-${record.id}`,
        };
        const items: MenuProps['items'] = [];

        switch (record.type) {
          case eType.PhongBan:
          case eType.Nhom:
            items.push(fAdd, fFix, fDelete);
            break;
          case eType.NhanSu:
            items.push(fTransfer, fDelete);
            break;
        }
        return (
          <Space>
            <Dropdown menu={{ items }} trigger={['click']}>
              <EllipsisOutlined style={{ color: colors.primary }} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const renderNameColumn = (record: iCompanyGroup) => {
    const isBold = record.type === eType.PhongBan || record.type === eType.Nhom;
//[06/12/2024] [ngoc_td] chỉnh sửa hiển thị employee
    if (record.type === eType.NhanSu) {
      // Render name with code and numbering
      return (
        <Space>
          <Tooltip title={`${record.code} - ${record.name}`}>
            <Typography.Text>
              {record.order}. {record.code} - {record.name}
            </Typography.Text>
          </Tooltip>
        </Space>
      );
    }
  
    // Render for departments or groups
    return (
      <Space>
        <Tooltip title={`${record.name}`}>
          <Typography.Text strong={isBold}>{record.name}</Typography.Text>
        </Tooltip>
      </Space>
    );
  };

  useEffect(() => {
    const treeData = buildTree(convertData(dataGroups)); // Build hierarchical data
    const filteredData = filterTreeBySearch(treeData, searchValue); // Filter data based on search
    setData(filteredData); // Update state with filtered data
  }, [dataGroups, searchValue]);
  const handleRemoveIssue = (issueId: any[], listRecord: any) => {};

    //[#21002][hoang_nm][29/11/2024]Cancel ẩn modal sửa phòng ban
  const handleCancelFix = () => {
    setIsModalVisible(false);
  };

  //[#21002][hoang_nm][29/11/2024] Dispatch action update phòng ban gồm id và selectgroupid, dữ liệu truyền vào request body là dữ liệu selectGroup, name và code thì lấy mới từ form modal
  const handleOkFix = () => {
    if (selectedGroup) {
      // Lấy giá trị từ form
      const nameFromForm = form.getFieldValue('nameGroupFix');
      const codeFromForm = form.getFieldValue('codeGroupFix');

      const dataUpdate = {
        id: selectedGroup.id,
        companyId: selectedGroup.companyId,
        parentId: selectedGroup.parentId,
        name: nameFromForm,
        managerId: selectedGroup.managerId,
        code: codeFromForm,
        type: selectedGroup.type,
        status: selectedGroup.status,
      };
      // Gọi action cập nhật nhóm
      dispatch(groupActions.updateGroupRequest({ id: selectedGroup.id, dataUpdate }));
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <CompanyGroupHeader />
      <div style={{ padding: 5 }}>
        <Table
          rowKey={record => record.id}
          size={'large'}
          style={{ width: '100%', height: '75vh' }}
          columns={columns}
          dataSource={Data}
          rowHoverable={false}
          scroll={{ x: 1000, y: windowSize[1] * 0.74 }}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => {
              // Show expand/collapse icons for items with type PhongBan (1) or Nhom (2)
              const isExpandableType = record.type === eType.PhongBan || record.type === eType.Nhom;

              if (!isExpandableType) {
                return null; // Hide expand icon for non-expandable types
              }

              // Render the expand icon depending on whether the item is expanded or collapsed
              return expanded ? (
                <Space className={styles.row}>
                  <CaretDownOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ fontSize: '18px', color: '#52c41a', paddingRight: 2 }}
                  />
                </Space>
              ) : (
                <Space className={styles.row}>
                  <CaretRightOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ fontSize: '18px', color: '#000000', paddingRight: 2 }}
                  />
                </Space>
              );
            },
            expandIconColumnIndex: 0,
          }}
          pagination={false}
        />
      </div>

      <Modal visible={modalVisible} title={t('Department Update')} onCancel={handleModalClose} footer={null}>
        <AddItemGroup selectedGroup={selectedGroup} onCancel={handleModalClose} />
      </Modal>
      <Modal visible={modalEmployee} title={t('Personnel transfer')} onCancel={handleEmployeeClose} footer={null}>
        <SwitchEmployee selectedEmployee={selectedEmployee} onCancel={handleEmployeeClose} />
      </Modal>
      <Modal
        title="Chỉnh sửa phòng ban"
        visible={isModalVisible}
        onCancel={handleCancelFix}
        footer={[
          <Button key="cancel" onClick={handleCancelFix}>
            Hủy
          </Button>,
          <Button
          key="submit"
          type="primary"
          onClick={() => {
            form
              .validateFields()
              .then(() => {
                handleOkFix();
              })
              .catch(info => {
               // console.log('Validation failed:', info);
              });
          }}
        >
          Lưu
        </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên phòng ban:"
            name="nameGroupFix"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}
          >
            <Input
              value={nameGroupFix}
              onChange={e => setNameGroupFix(e.target.value)}
              placeholder="Nhập tên phòng ban"
            />
          </Form.Item>
          <Form.Item label="Mã phòng ban:" name="codeGroupFix">
            <Input value={codeGroupFix} readOnly placeholder="Nhập mã phòng ban" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={modalDelete}
        onCancel={() => setModalDelete(false)} // Close modal if user cancels
        onOk={() => {
          if (selectedGroup) {
            handleDeleteGroup(selectedGroup);
          }
          setModalDelete(false);
        }} // Proceed with delete if user confirms
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa đề nghị này không?</p>
      </Modal>
      <Modal
        open={employeeDelete}
        onCancel={() => setEmployeeDelete(false)} // Close modal if user cancels
        onOk={() => {
          if (selectedEmployee) {
            handleDeleteEmployee(selectedEmployee);
          }
          setModalDelete(false);
        }} // Proceed with delete if user confirms
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa nhân sự này không?</p>
      </Modal>
    </>
  );
};
export default CompanyGroup;
