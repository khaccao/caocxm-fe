import React, { useEffect, useState } from 'react'

import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button, Space, Table, Typography } from 'antd'
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { IDinhMucThuong, eTypeDinhMucLuong } from '@/common/define'
import { useAppSelector } from '@/store/hooks';
import { getCategorys } from '@/store/issue';
import { getDinhMucThuongs } from '@/store/project';
import { getTeams } from '@/store/team';
interface IProps {
  startDate: Dayjs
  endDate: Dayjs
  search: string
}

export default function StatisticBonusContent({ startDate, endDate, search }: IProps) {
    const { t } = useTranslation('statistic');
    const teamList = useAppSelector(getTeams());
    const dinhMucThuong = useAppSelector(getDinhMucThuongs());
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [data, setData] = useState<IDinhMucThuong[]>([]);
    const categorys = useAppSelector(getCategorys());
    
    useEffect(() => {
      if (dinhMucThuong) {
        const dataSearch = dinhMucThuong.filter((d) =>  d.subject.toLowerCase().includes(search.toLowerCase()));
        mapDataToTree(dataSearch);
      }
    }, [dinhMucThuong, teamList, search]);
    // [#20693][dung_lt][11/11/2024] xử lý tính toán phát sinh
    const pretreatmentOfData = (dmthuong: IDinhMucThuong[]) => {
      return dmthuong.map((d) => {
        const res: IDinhMucThuong = {
          ...d,
          arise: 0
        }
        if (d.laborCountTeam && d.laborCountComplete) {
          res.arise = Math.abs(Number(res.laborCountTeam) - Number(res.laborCountComplete));
        }
        return res;
      })
    }
    // [#20693][dung_lt][10/11/2024] map data ban đầu thành dạng cây team => category => các issue
    const mapDataToTree = (_dmthuong: IDinhMucThuong[]) => {
      const temp: number[] = [];
      const dmthuong = pretreatmentOfData(_dmthuong);
      const dataAfterMap: IDinhMucThuong[] = [];
      dmthuong.forEach((dm) => {
        if (!temp.includes(dm.teamId)) {
          const children = mapDataWithCategory(getChildOfTeam(dm.teamId, dmthuong, 'teamId'));
          const item: IDinhMucThuong = {
            date: '',
            teamId: dm.teamId,
            id: dm.teamId,
            subject: `${t('Team')} ${getTeamName(dm.teamId)}`,
            categoryId: 0,
            laborCountIssue: calculatorSum('laborCountIssue', children).toString(),
            laborCountTeam: calculatorSum('laborCountTeam', children).toString(),
            laborCountComplete: calculatorSum('laborCountComplete', children).toString(),
            arise: calculatorSum('arise', children),
            type: eTypeDinhMucLuong.Team,
            children,
          }
          temp.push(dm.teamId);
          dataAfterMap.push(item);
        }
      });
      setData(dataAfterMap);
    }
    // [#20693][dung_lt][10/11/2024] lấy tên của team
    const getTeamName = (id: number) => {
      const item = teamList.find((t) => t.id === id);
      return item ? item.name : id.toString();
    }
    // [#20693][dung_lt][10/11/2024] lấy con của team: các category => các issue cùng category
    const getChildOfTeam = (id: number, dmthuong: IDinhMucThuong[], field: keyof IDinhMucThuong) => {
      const listChild: IDinhMucThuong[] = [];
      dmthuong.forEach((dm) => dm[field] === id && listChild.push(dm));
      return listChild;
    }
    // [#20693][dung_lt][10/11/2024] tính tổng các issue trong team
    const calculatorSum = (key: keyof IDinhMucThuong, data: IDinhMucThuong[]) => {
      let res = 0;
      try {
        data.forEach((d) => {
          if (d[key]) {
            res += Number(d[key]);
          }
        })
        return res;
      } catch {
        return 0;
      }
    }
    // [#20693][dung_lt][10/11/2024] map các issue theo cùng category
    const mapDataWithCategory = (dmthuong: IDinhMucThuong[]) => {
      const temp: number[] = [];
      const resCategories: IDinhMucThuong[] = [];
      dmthuong.forEach((dm) => {
        if (!temp.includes(dm.categoryId)) {
          const children = getChildOfTeam(dm.categoryId, dmthuong,'categoryId');
          const item: IDinhMucThuong = {
            date: '',
            teamId: dm.teamId,
            id: Number(`${dm.teamId}${dm.categoryId}`),
            subject: getCategoryName(dm.categoryId),
            categoryId: dm.categoryId,
            laborCountIssue:  calculatorSum('laborCountIssue', children).toString(),
            laborCountTeam:  calculatorSum('laborCountTeam', children).toString(),
            laborCountComplete:  calculatorSum('laborCountComplete', children).toString(),
            arise: calculatorSum('arise', children),
            type: eTypeDinhMucLuong.Category,
            children
          }
          temp.push(dm.categoryId);
          resCategories.push(item);
        }
      });
      return resCategories;
    }
    // [#20693][dung_lt][10/11/2024] lấy tên category
    const getCategoryName = (id: number) => {
      const item = categorys?.find((t) => t.id === id);
      return item ? item.name : id.toString();
    }
    const renderColumns = (value: any, record: any) => {
      const numberValue = Number(value);
      // Kiểm tra nếu phần thập phân tồn tại và có độ dài > 3
      const decimalPart = value?.toString().split('.')[1];
      let res;
      if (decimalPart && decimalPart.length > 3) {
        res = numberValue.toFixed(2);
      } else {
        res = numberValue
      }
      if(record.type === eTypeDinhMucLuong.Category) {
        return <span></span>
      } else if(record.type === eTypeDinhMucLuong.Team) {
        return <Typography.Text 
        style={{ 
          fontWeight: 'bold', 
          cursor: 'pointer', 
        }} 
      >
        {res}
      </Typography.Text>
      } else {
        return <>{res}</>
      }
    } 
    // [#20693][dung_lt][10/11/2024] khai báo các columns trong table
    const columns: any[] = [
      {
        title: t('table.Name'),
        dataIndex: 'subject',
        align: 'left',
        key: 'subject',
        width: '40%',
        render: (text: any) => (<></>),
      },
      {
        title: t('table.StandardOperation'),
        dataIndex: 'laborCountIssue',
        key: 'laborCountIssue',
        width: '15%',
        align: 'center',
        render: renderColumns
      },
      {
        title: t('table.AssignedWork'),
        dataIndex: 'laborCountTeam',
        align: 'center',
        width: '15%',
        key: 'laborCountTeam',
        render: renderColumns
      },
      {
        title: t('table.ActualWork'),
        dataIndex: 'laborCountComplete',
        align: 'center',
        width: '15%',
        key: 'laborCountComplete',
        render: renderColumns
      },
      {
        title: t('table.LaborSaved'),
        dataIndex: 'arise',
        align: 'center',
        width: '15%',
        key: 'arise',
        render: renderColumns
      },
    ];
    // [#20693][dung_lt][10/11/2024] render name của team, category, công việc
    function renderNameColumn(text: any, record: any) {
      if (record.type === eTypeDinhMucLuong.Category || record.type === eTypeDinhMucLuong.Team) { 
          return (
            <Typography.Text 
              style={{ 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                paddingLeft: (record.children && record.children.length > 0) ? '-25px' : (record.isCategory && record?.children?.length) ? '25px' : '0px' 
              }} 
            >
              {text}
            </Typography.Text>
           )
      } else {
        return (
          <Typography.Text
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
          >{`${text}`}</Typography.Text>
        );
      }
    }
    // [#20693][dung_lt][10/11/2024] xử lý expand
    const handleExpand = (expanded: any, record: any) => {
      let newExpandedRowKeys = [...expandedRowKeys];
      if (expanded) {
        newExpandedRowKeys = [...newExpandedRowKeys, record.id];
      } else {
        newExpandedRowKeys = newExpandedRowKeys.filter(key => key !== record.id);
      }
      setExpandedRowKeys(newExpandedRowKeys);
      localStorage.setItem('expandedRowKeys', JSON.stringify(newExpandedRowKeys));
    };

    return (
        <Table
          columns={columns}
          rowKey={record => record.id}
          size="small"
          style={{ width: '100%', height: '75vh' }}
          dataSource={data}
          expandable={{
            expandedRowKeys: expandedRowKeys,
            expandIcon: ({ expanded, onExpand, record }) => {
              if (!record.children || record.children.length === 0) {
                return (
                  <Space style={{ display: 'flex', flexDirection: 'row' }}>
                    <Space style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0)', width: 24}}> 
                      <CaretUpOutlined />
                    </Space>
                    {renderNameColumn(record.subject, record)}
                  </Space>
                );
              }
              return expanded ? (
                <Space style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button 
                    type={'default'} 
                    icon={<CaretUpOutlined />} size="small"
                    onClick={e => onExpand(record, e)}
                    style={{ fontSize: '18px', color: '#000000' }}
                  />
                  {renderNameColumn(record.subject, record)}
                </Space>
              ) : (
                <Space style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button 
                    type={'default'} 
                    icon={<CaretDownOutlined />} size="small"
                  onClick={e => onExpand(record, e)}
                  style={{ fontSize: '18px', color: '#52c41a' }}
                  />
                  {renderNameColumn(record.subject, record)}
                </Space>
              );
            },
            expandIconColumnIndex: 0,
            onExpand: handleExpand,
          }}
          pagination={false}
        />
    );
}
