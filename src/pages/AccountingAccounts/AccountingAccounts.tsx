import { useEffect, useMemo, useState } from 'react';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Tag, Typography } from 'antd';

import { AccountingAccountOption, AccountingAccountService } from '@/services/AccountingAccountService';
import Utils from '@/utils';

export const AccountingAccounts = () => {
  const [items, setItems] = useState<AccountingAccountOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = (keyword = search) => {
    setLoading(true);
    AccountingAccountService.Get.getAccounts(keyword).subscribe({
      next: result => setItems(Array.isArray(result) ? result : []),
      error: Utils.errorHandling,
      complete: () => setLoading(false),
    });
  };

  useEffect(() => {
    loadData('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return items;

    return items.filter(item =>
      [item.code, item.value, item.name, item.label, item.parentCode]
        .some(value => `${value || ''}`.toLocaleLowerCase('vi').includes(keyword)),
    );
  }, [items, search]);

  const columns = [
    {
      title: 'Mã tài khoản',
      dataIndex: 'code',
      width: 160,
      render: (_: unknown, record: AccountingAccountOption) => <Tag color="blue">{record.code || record.value}</Tag>,
    },
    { title: 'Tên tài khoản', dataIndex: 'name', width: 320 },
    {
      title: 'Cấp',
      dataIndex: 'level',
      width: 90,
      align: 'center' as const,
      render: (value: number) => value ?? '-',
    },
    {
      title: 'Tài khoản cha',
      dataIndex: 'parentCode',
      width: 150,
      render: (value: string) => value || '-',
    },
    {
      title: 'Hạch toán',
      dataIndex: 'posting',
      width: 120,
      align: 'center' as const,
      render: (value: boolean) => value ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
          Danh sách tài khoản
        </Typography.Title>
        <Input.Search
          allowClear
          value={search}
          onChange={event => setSearch(event.target.value)}
          onSearch={loadData}
          placeholder="Tìm theo mã hoặc tên tài khoản"
          prefix={<SearchOutlined />}
          style={{ width: 360 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => loadData()}>
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
