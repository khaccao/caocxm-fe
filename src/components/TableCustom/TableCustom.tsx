/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ReactElement, useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Input, InputNumber, PaginationProps, Popconfirm, Space, Table, Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import './TableCustom.css';

import { colors } from '@/common/colors';
import { formatDateDisplay } from '@/common/define';
import { useWindowSize } from '@/hooks';
import fallback from '@/image/fallback.svg';
import Utils from '@/utils';

export interface TableCustomProps<T> {
  dataSource: T;
  columnsConfig: { [key: string]: iColumnsConfig };
  onChange?: (data: T, type: string) => void;
  // [16/01/2025][#23123] [phuong_td] sự kiện của nút check ở các header
  onCheckAll?: (type: string, value: boolean) => void;
  onImagePopup?: (data: T) => void;
  // [16/01/2025][#23123] [phuong_td] kiểm xoát việc có phân trang hay không
  notPagination?: boolean;
}

export enum eColumnsTpye {
  text = 'text',
  textStart = 'textStart',
  date = 'date',
  number = 'number',
  image = 'image',
  input = 'input',
  checkbox = 'checkbox',
  action = 'action',
  inputNumber = 'inputNumber',
  avatar = 'avatar',
}

export interface iColumnsConfig {
  hidden?: boolean;
  isKey?: boolean;
  title?: string;
  width?: number | string;
  type: eColumnsTpye;
  // [16/01/2025][#23123] [phuong_td] tên trường giá trị sẽ được hiển thị phía sau của checkbox
  fieldDisplayCheckboxType?: string;
  fixed?: 'left' | 'right' | boolean;
  align?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
  onChange?: (checked: boolean, record: any) => void;
  sorter?: boolean;
  onClick?: (record: any) => void;
  onCheckAll?: (type: string, value: boolean) => void;
  // [16/01/2025][#23123] [phuong_td] kiểm xoát việc nút checkbox có thể được check hay không
  notAllowCheck?: boolean;
  // [09/11/2024][#20629][phuong_td] thêm câu thông báo cho action
  actions?: {
    name: 'edit' | 'remove';
    Notification?: string;
    action: (record: any) => void;
    disabled?: boolean;
  }[];
  // [09/11/2024][#20629][phuong_td] tùy chọn cho phép bật tắt chức năng preview cho image
  previewImage?: boolean;
  // [22/01/2025][#21317][phuong_td] tùy chọn cho biết tên thuộc tính chứa danh sách url img
  attributesImage?: string;
  formaterNumber?: boolean; // [dung_lt][13/11/2024] cho phép format 10000 thành 10,000 và đang chỉ dành cho inputNumber
}
export const TableCustom = ({ dataSource, columnsConfig, onChange, onImagePopup, onCheckAll, notPagination }: TableCustomProps<any>) => {
  const windowSize = useWindowSize();
  const [Columns, setColumns] = useState<ColumnType<any>[]>([]);
  const tTable = useTranslation(['table']).t;
  const dispatch = useDispatch(); // Access the dispatch function from Redux
  // [09/11/2024][#20629][phuong_td] thêm state giữ tên của table key
  const [rowKey, setRowKey] = useState<string>('');

  // [09/11/2024][#20629][phuong_td] Không được gọi api trực tiếp ở component này
  // const handleDelete = (id: number) => {
  //   // Dispatch the DeleteAdditionalCost action with the selected record ID
  //   dispatch(accountingInvoiceActions.DeleteAdditionalCost({ id }));
  // };
  const renderAction = (record: any) => {
    const action: ReactElement[] = [];
    const edit = columnsConfig['action']?.actions?.find(a => a.name === 'edit');
    if (edit) {
      action.push(
        <Tooltip title={'Edit'} key={'edit'}>
          <Button
            icon={<EditOutlined style={{ color: colors.primary }} />}
            type="text"
            size="small"
            onClick={() => edit.action(record)}
            disabled={edit.disabled}
          />
        </Tooltip>,
      );
    }

    const remove = columnsConfig['action']?.actions?.find(a => a.name === 'remove');
    if (remove) {
      // [09/11/2024][#20629][phuong_td] điều chỉnh câu thông báo cho hành động
      action.push(
        <Popconfirm // popconfirm xóa ảnh
          key="remove"
          title={remove.Notification}
          onConfirm={() => remove.action(record)}
          cancelText={tTable('Hủy')}
        >
          <Tooltip title={tTable('Xóa')}>
            <Button icon={<DeleteOutlined />} danger size="small" type="text" disabled={remove.disabled} />
          </Tooltip>
        </Popconfirm>,
      );
    }

    return <Space>{action.map(e => e)}</Space>;
  };

  // [16/01/2025][#23123] [phuong_td] kiểm xoát trạng thái check của checkbox ở header
  const handleCheckAll = (type: string) => {
    if (!dataSource.length) return false;
    for (let i = 0; i < dataSource.length; i++) {
      const element = dataSource[i];
      if (!element[type]) return false
    }
    return true;
  }

  useEffect(() => {
    // [#20692][phuong_td][31/10/2024] lấy danh sách tên thuộc tính của một đối tượng
    const personnelKeys: string[] = Utils.getKeys<{ [key: string]: iColumnsConfig }>(columnsConfig);
    const columns: ColumnType<any>[] = [];
    // [#20692][phuong_td][31/10/2024] Tạo columns động theo danh sách thuộc tính và dữ liệu cấu hình của bảng
    personnelKeys.forEach(m => {
      // [#20692][phuong_td][31/10/2024] chỉ tạo các cột mà cấu hình hidden bằng false
      if (columnsConfig[m] && !columnsConfig[m].hidden) {
        const { type, onClick, width, fixed, title, align, previewImage, sorter, isKey, formaterNumber, fieldDisplayCheckboxType, notAllowCheck, attributesImage } =
          columnsConfig[m];
        // [09/11/2024][#20629][phuong_td] tên của thuộc tính là key
        if (isKey) {
          setRowKey(m);
        }
        // [16/01/2025][#23123] [phuong_td] thêm nút checkbox ở header
        const column: any = {
          fixed: fixed,
          title:
            type === eColumnsTpye.checkbox ? (
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {/* [20/01/2025][#21321][phuong_td] điều chỉnh css cho checkbox */}
                <div className='container-checkbox'>
                  <Input
                    type="checkbox"
                    checked={handleCheckAll(m)}
                    disabled={notAllowCheck}
                    onChange={e => {
                      if (onCheckAll) {
                        onCheckAll(m, e.target.checked);
                      }
                    }}
                    style={{ minWidth: 20 }}
                  ></Input>
                </div>
                <div>{title ?? <></>}</div>
              </div>
            ) : (
              title ?? <></>
            ),
          dataIndex: m,
          key: m,
          // width: width,
          // className: _columnsHidden.includes(m) ? 'HiddenColumn' : '',
          align: align ?? 'center',
          render: (text: any, record: any) => {
            // [#20692][phuong_td][31/10/2024] Render Input cho cấu hình type = input
            switch (type) {
              case eColumnsTpye.textStart:
                return (
                  <div key={`${m}-${record.Key}`} style={{ textAlign: 'start' }}>
                    {text}
                  </div>
                );
              case eColumnsTpye.date:
                return <span key={`${m}-${record.Key}`}>{dayjs(text).format(formatDateDisplay)}</span>;
              case eColumnsTpye.number:
                return <span key={`${m}-${record.Key}`}>{Number(text).toLocaleString('en-US')}</span>;
              case eColumnsTpye.image:
                let imgLink = text;
                // [22/01/2025][#21317][phuong_td] nếu có tên thuộc tính chứa danh sách imgs thì lấy ở đây thay cho thuộc tính của trường này
                if (attributesImage) {
                  const imgs = record[attributesImage];
                  imgLink = imgs[0];
                }
                return (
                  <Image
                    onClick={() => {
                      if (onImagePopup) onImagePopup(record);
                    }}
                    width={width}
                    height={width}
                    src={imgLink}
                    // [09/11/2024][#20629][phuong_td] đưa dữ liệu ảnh ra chổ khác
                    fallback={fallback}
                    preview={previewImage}
                  />
                );
              case eColumnsTpye.input:
                return (
                  <Input
                    key={Utils.generateRandomString(3)}
                    className={''}
                    readOnly={false}
                    defaultValue={text}
                    // value={text}
                    onChange={v => {
                      if (onChange) {
                        const data = { ...record };
                        data[m] = v.target.value;
                        onChange(data, m);
                      }
                    }}
                  />
                );
              case eColumnsTpye.inputNumber:
                return (
                  <InputNumber
                    key={Utils.generateRandomString(3)}
                    className={''}
                    style={{ width: '100%' }}
                    readOnly={false}
                    defaultValue={text}
                    formatter={value =>
                      formaterNumber ? value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : value
                    }
                    parser={value => (formaterNumber ? value?.replace(/,/g, '') : value)}
                    // value={text}
                    onChange={v => {
                      if (onChange) {
                        const data = { ...record };
                        data[m] = v || 0;
                        onChange(data, m);
                      }
                    }}
                  />
                );
              case eColumnsTpye.checkbox:
                // [16/01/2025][#23123] [phuong_td] điều chỉnh phương thức hiển thị của checkbox
                return (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {/* [20/01/2025][#21321][phuong_td] điều chỉnh css cho checkbox */}
                    <div className='container-checkbox'>
                      <Input
                        type="checkbox"
                        defaultChecked={text}
                        disabled={notAllowCheck}
                        onChange={e => {
                          if (onChange) {
                            const data = { ...record };
                            data[m] = e.target.checked;
                            onChange(data, m);
                          }
                        }}
                        style={{ minWidth: 20 }}
                      ></Input>
                    </div>
                    <div>{fieldDisplayCheckboxType ? record[fieldDisplayCheckboxType] : <></>}</div>
                  </div>
                );
              case eColumnsTpye.action:
                return renderAction(record);
              // [06/12/2024][#21116][phuong_td] Thêm phương thức render avatar icon
              case eColumnsTpye.avatar:
                return (
                  <Avatar.Group size="small" shape="circle">
                    {text &&
                      text.map((data: string) => {
                        return renderAvata(data);
                      })}
                  </Avatar.Group>
                );
            }
            // [#20692][phuong_td][31/10/2024] Render Input cho cấu hình type = text
            return <span key={`${m}-${record.Key}`}>{text}</span>;
          },
        };
        // [09/11/2024][#20629][phuong_td] thêm xử lý nếu trường width không được truyền vào
        if (width) {
          column.width = width;
        }
        // [09/11/2024][#20629][phuong_td] thêm chức năng sort
        if (sorter) {
          column.sorter = (a: any, b: any) => {
            const data1 = a[m];
            const data2 = b[m];
            switch (type) {
              case eColumnsTpye.textStart:
              case eColumnsTpye.number:
              case eColumnsTpye.text:
                return data1.localeCompare(data2);
              case eColumnsTpye.date:
                return dayjs(data1).diff(dayjs(data2));
              default:
            }
          };
        }
        columns.push(column);
      }
    });
    setColumns(columns);
  }, [columnsConfig]);
  // [09/11/2024][#20629][phuong_td] thêm thông tin phân trang
  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    tTable('pagingTotal', { range1: range[0], range2: range[1], total });
  // [06/12/2024][#21116][phuong_td] Thêm phương thức render avatar icon
  const renderAvata = (name: string | undefined) => {
    if (name) {
      const assigneeName = name;
      return (
        <Tooltip title={assigneeName} key={Utils.generateRandomString(5)}>
          <Avatar
            size="small"
            onClick={() => console.log('')}
            style={{ backgroundColor: Utils.stringToColour(assigneeName), cursor: 'pointer' }}
          >
            {assigneeName.charAt(0)}
          </Avatar>
        </Tooltip>
      );
    }
    return null;
  };
  return (
    <div style={{padding:5}}>

    <Table
      rowKey={record => {
        // [09/11/2024][#20629][phuong_td] gắn key cho các dòng theo biến key
        const key = record[rowKey] ?? Utils.generateRandomString(4);
        return key;
      }}
      className="antd-table-custom"
      dataSource={dataSource}
      columns={Columns}
      rowHoverable={false}
      bordered={true}
      tableLayout={'fixed'}
      // pagination={false}
      // [09/11/2024][#20629][phuong_td] điều chỉnh chức năng phân trang
      pagination={!notPagination ? {
        pageSizeOptions: [20, 50, 100],
        defaultPageSize: 20,
        total: dataSource.length || 0,
        responsive: true,
        showTotal,
        showSizeChanger: true,
      } : false}
      scroll={{
        // x: 'max-content',
        x: 1000,
        y: windowSize[1] - 250,
      }}
      // summary={() => (
      //   <Table.Summary.Row>
      //     <Table.Summary.Cell index={0} colSpan={5}>
      //       Tổng
      //     </Table.Summary.Cell>
      //     <Table.Summary.Cell index={5}>125</Table.Summary.Cell>
      //     <Table.Summary.Cell index={6}></Table.Summary.Cell>
      //     <Table.Summary.Cell index={7}>125</Table.Summary.Cell>
      //   </Table.Summary.Row>
      // )}
    />
    </div>
  );
};

export default TableCustom;
