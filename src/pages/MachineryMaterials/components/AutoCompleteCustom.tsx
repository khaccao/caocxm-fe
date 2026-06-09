import { useEffect, useState } from 'react';

import { WarningOutlined } from '@ant-design/icons';
import { AutoComplete, Tooltip } from 'antd';

import { AutoCompleteOptions } from '@/common/define';
const AutoCompleteCustom = ({
  id,
  value,
  optionsList,
  onChange,
  onSelect,
  onBlur,
  className,
  placeholder,
  dropdownStyle,
  style,
  status,
  warning,
  keyElement,
  disabled, // ✅ Thêm prop ở đây
}: {
  id: string;
  value: string;
  optionsList: AutoCompleteOptions[];
  onChange: (id: string, data: string) => void;
  onSelect: (id: string, data: string, label: string, item: {
    name: string;
    code: string;
  }) => void;
  className: string;
  placeholder: string;
  dropdownStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  status?: 'error' | 'warning';
  onBlur: (id: string, data: string) => void;
  warning: string;
  keyElement?: string;
  disabled?: boolean; // ✅ Thêm type cho prop
}) => {
  const [TextValue, setTextValue] = useState(value);
  const [options, setOptions] = useState<AutoCompleteOptions[]>([]);

  const getPanelValue = (searchText: string): AutoCompleteOptions[] => {
    if (!searchText) return optionsList;
    return optionsList.filter(item => {
      const st1 = item?.label ?? '';
      const st2 = searchText ?? '';
      return st1.toUpperCase().includes(st2.toUpperCase());
    });
  };

  useEffect(() => {
    setTextValue(value);
  }, [value, keyElement]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
      <AutoComplete
        className={className}
        value={TextValue}
        options={options}
        style={{ ...style, marginRight: 2 }}
        status={status}
        disabled={disabled} // ✅ Truyền vào đây
        onBlur={() => {
          onBlur(id, TextValue);
        }}
        onFocus={() => {
          setOptions(getPanelValue(TextValue));
        }}
        onSelect={(text, options) => {
          onSelect(id, text, options.label, options.item);
          if (options.label.includes('/') || options.label.includes('-')) {
            setTextValue(text);
          } else {
            setTextValue(options.label);
          }
        }}
        onSearch={(text: any) => setOptions(getPanelValue(text))}
        onChange={text => {
          setTextValue(text);
          onChange(id, text);
        }}
        placeholder={placeholder}
        dropdownStyle={dropdownStyle}
      />
      {status === 'error' && (
        <Tooltip title={warning}>
          <WarningOutlined style={{ fontSize: '15px', color: '#FF0000' }} />
        </Tooltip>
      )}
    </div>
  );
};

export default AutoCompleteCustom;