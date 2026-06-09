import React from 'react';

import { FilterFilled, DeleteOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Space, Checkbox, Typography } from 'antd';

import { EditableColumn } from './BuildColumns';
import { PayrollType } from './data';

const { Text } = Typography;

// ----------------------------------------------------------------

type MetaType = 'text' | 'number' | 'currency';

export const getColumnFilterProps = (
  dataIndex: keyof PayrollType,
  metaType: MetaType = 'text',
  setSort: (cfg: { key: keyof PayrollType; order: 'asc' | 'desc' }) => void,
  dataSource: PayrollType[],
): Partial<EditableColumn<PayrollType>> => {
  if (metaType === 'text') {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        const uniqueValues = Array.from(
          new Set(dataSource.map(item => item[dataIndex] as string).filter(Boolean)),
        ).sort();

        return (
          <CheckboxFilterDropdown
            uniqueValues={uniqueValues}
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            confirm={confirm}
            clearFilters={clearFilters}
            dataIndex={dataIndex}
            setSort={setSort}
          />
        );
      },
      filterIcon: (filtered: boolean) => <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: string[], record: any) => {
        if (!value || !value.length) return true;
        return value.includes(String(record[dataIndex] || ''));
      },
    };
  }

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
      const [min, max] = (selectedKeys[0] as [number?, number?]) || [];
      const setRange = (r: [number?, number?]) => setSelectedKeys([r]);

      return (
        <div style={{ padding: 8 }}>
          <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 8, paddingBottom: 8, paddingTop: 4 }}>
            <Button
              block
              size="middle"
              onClick={() => {
                clearFilters?.();
                setSort({ key: dataIndex, order: 'asc' });
                confirm({ closeDropdown: true });
              }}
            >
              Sắp xếp từ A → Z
            </Button>
            <Button
              block
              size="middle"
              style={{ marginTop: 4 }}
              onClick={() => {
                clearFilters?.();
                setSort({ key: dataIndex, order: 'desc' });
                confirm({ closeDropdown: true });
              }}
            >
              Sắp xếp từ Z → A
            </Button>
          </div>
          <InputNumber
            placeholder="Min"
            value={min}
            style={{ width: 150 }}
            onChange={(v: any) => setRange([v, max])}
            formatter={value => (value !== undefined ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
            parser={value => Number((value || '').toString().replace(/[^\d.-]/g, ''))}
          />{' '}
          -{' '}
          <InputNumber
            placeholder="Max"
            value={max}
            style={{ width: 150 }}
            onChange={(v: any) => setRange([min, v])}
            formatter={value => (value !== undefined ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
            parser={value => Number((value || '').toString().replace(/[^\d.-]/g, ''))}
          />
          <Space style={{ display: 'flex', marginTop: 8, justifyContent: 'flex-end' }}>
            <Button type="primary" size="middle" onClick={() => confirm()}>
              Lọc
            </Button>

            <Button
              size="middle"
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
            >
              Xoá
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value: [number?, number?], record: any) => {
      const [min, max] = value;
      const num = +(record[dataIndex] as number) || 0;
      return (min === undefined || num >= min) && (max === undefined || num <= max);
    },
  };
};

interface CheckboxFilterDropdownProps {
  uniqueValues: string[];
  selectedKeys: any[];
  setSelectedKeys: (keys: any[]) => void;
  confirm: (params?: { closeDropdown?: boolean }) => void;
  clearFilters?: () => void;
  dataIndex: keyof PayrollType;
  setSort: (cfg: { key: keyof PayrollType; order: 'asc' | 'desc' }) => void;
}

interface CheckboxFilterDropdownState {
  searchText: string;
  filteredOptions: string[];
  selectedValues: string[];
}

class CheckboxFilterDropdown extends React.Component<CheckboxFilterDropdownProps, CheckboxFilterDropdownState> {
  constructor(props: CheckboxFilterDropdownProps) {
    super(props);

    this.state = {
      searchText: '',
      filteredOptions: props.uniqueValues,
      selectedValues: props.selectedKeys[0] || [],
    };
  }

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      searchText: value,
      filteredOptions: !value
        ? this.props.uniqueValues
        : this.props.uniqueValues.filter(option => option.toLowerCase().includes(value.toLowerCase())),
    });
  };

  handleCheck = (value: string, checked: boolean) => {
    const { selectedValues } = this.state;
    let newValues;

    if (checked) {
      newValues = [...selectedValues, value];
    } else {
      newValues = selectedValues.filter(v => v !== value);
    }

    this.setState({ selectedValues: newValues });
    this.props.setSelectedKeys([newValues]);
  };

  handleSelectAll = () => {
    const { filteredOptions } = this.state;
    this.setState({ selectedValues: filteredOptions });
    this.props.setSelectedKeys([filteredOptions]);
  };

  handleClear = () => {
    this.setState({
      selectedValues: [],
      searchText: '',
      filteredOptions: this.props.uniqueValues,
    });
    this.props.setSelectedKeys([[]]);
    if (this.props.clearFilters) {
      this.props.clearFilters();
    }
  };

  render() {
    const { confirm, clearFilters, dataIndex, setSort } = this.props;
    const { searchText, filteredOptions, selectedValues } = this.state;

    return (
      <div style={{ padding: 8, width: 250 }}>
        <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 8, paddingBottom: 8, paddingTop: 4 }}>
          <Button
            block
            size="middle"
            onClick={() => {
              if (clearFilters) clearFilters();
              setSort({ key: dataIndex, order: 'asc' });
              confirm({ closeDropdown: true });
            }}
          >
            Sắp xếp từ A → Z
          </Button>

          <Button
            block
            size="middle"
            style={{ marginTop: 4 }}
            onClick={() => {
              if (clearFilters) clearFilters();
              setSort({ key: dataIndex, order: 'desc' });
              confirm({ closeDropdown: true });
            }}
          >
            Sắp xếp từ Z → A
          </Button>
        </div>

        <Input
          placeholder="Search..."
          value={searchText}
          onChange={this.handleSearch}
          style={{ marginBottom: 8, display: 'block' }}
        />

        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
          {filteredOptions.map(option => (
            <div key={option} style={{ padding: '5px 0' }}>
              <Checkbox
                checked={selectedValues.includes(option)}
                onChange={e => this.handleCheck(option, e.target.checked)}
              >
                {option}
              </Checkbox>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '10px 0' }}>
              Không tìm thấy kết quả
            </Text>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Button size="small" onClick={this.handleSelectAll} type="link">
            {`Chọn tất cả (${filteredOptions.length})`}
          </Button>
          <Button size="small" type="link" icon={<DeleteOutlined />} onClick={this.handleClear}>
            Xóa
          </Button>
        </div>

        <div style={{ display: 'flex', marginTop: 8, justifyContent: 'flex-end' }}>
          <Button type="primary" size="middle" onClick={() => confirm()}>
            Lọc ({selectedValues.length})
          </Button>
        </div>
      </div>
    );
  }
}
