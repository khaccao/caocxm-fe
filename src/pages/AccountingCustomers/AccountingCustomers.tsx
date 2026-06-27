import { useEffect, useMemo, useState } from 'react';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Tag, Typography } from 'antd';

import { AccountingObjectOption, SubContractorCatalogService } from '@/services/SubContractorCatalogService';
import Utils from '@/utils';

const customerTypeName = (value?: number | null) => {
  switch (value) {
    case 1:
      return 'Thầu phụ';
    case 2:
      return 'NCC vật tư chính';
    case 3:
      return 'NCC vật tư phụ';
    case 4:
      return 'NCC chung';
    case 10:
      return 'Nội bộ NVH';
    case 20:
      return 'Khách hàng';
    case 90:
      return 'Khác';
    default:
      return 'Tất cả/không phân loại';
  }
};

export const AccountingCustomers = () => {
  const [items, setItems] = useState<AccountingObjectOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    SubContractorCatalogService.Get.getAccountingObjects().subscribe({
      next: result => setItems(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return items;

    return items.filter(item =>
      [item.code, item.value, item.name, item.label, customerTypeName(item.customerType)]
        .some(value => `${value || ''}`.toLocaleLowerCase('vi').includes(keyword)),
    );
  }, [items, search]);

  const columns = [
    {
      title: 'Mã khách hàng',
      dataIndex: 'code',
      width: 180,
      render: (_: unknown, record: AccountingObjectOption) => <Tag color="blue">{record.code || record.value}</Tag>,
    },
    { title: 'Tên khách hàng/đối tượng', dataIndex: 'name', width: 420 },
    {
      title: 'Loại',
      dataIndex: 'customerType',
      width: 180,
      render: (value: number) => <Tag color={value === 1 ? 'purple' : 'default'}>{customerTypeName(value)}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
          Danh sách khách hàng
        </Typography.Title>
        <Input
          allowClear
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Tìm theo mã, tên hoặc loại đối tượng"
          prefix={<SearchOutlined />}
          style={{ width: 380, height: 32 }}
        />
        <Button icon={<ReloadOutlined />} onClick={loadData}>
          Tải lại
        </Button>
      </div>

      <Space style={{ marginBottom: 12 }}>
        <Tag color="blue">Tổng: {filteredItems.length}</Tag>
      </Space>

      <Table
        rowKey={record => record.code || record.value}
        loading={loading}
        dataSource={filteredItems}
        columns={columns}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 900 }}
      />
    </div>
  );
};
