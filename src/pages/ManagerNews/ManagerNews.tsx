/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { PaginationProps, TableProps } from 'antd';
import { Button, Flex, Input, notification, Select, Space, Table, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { PagingResponse } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission, useWindowSize } from '@/hooks';
import { eNewsCategoryCode, INewsRecord, NewsService } from '@/services/NewsService';
import { getActiveMenu, getCurrentCompany, getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import { newsActions } from '@/store/news';
import styles from './ManagerNews.module.css';

interface IManagerNews {
  test?: string
}

const ManagerNews = ({ test }: IManagerNews) => {
  const { t } = useTranslation('shift');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const windowSize = useWindowSize();
  const activeMenu = useAppSelector(getActiveMenu());
  const company = useAppSelector(getCurrentCompany());
  const user = useAppSelector(getCurrentUser());
  const listNews = useAppSelector(state => state.news.listNews);
  const [filterListNews, setFilterListNews] = useState<INewsRecord[]>([]);
  const [queryParams, setQueryParams] = useState<PagingResponse>();
  const [categoryCode, setCategoryCode] = useState<string>(location.state?.categoryCode || eNewsCategoryCode.BANGTIN_TINTUC);
  const [textSearch, setTextSearch] = useState('');
  const projectList = useAppSelector(state => state.project.projectList);

  const editGranted = usePermission(['QuanLyTinTuc.Edit']);
  const deleteGranted = usePermission(['QuanLyTinTuc.Edit']);

  const isLoading = useAppSelector(getLoading('GetShifts'));
  const newsColumns: TableProps<INewsRecord>['columns'] = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (value: number, record: INewsRecord) => (`${record.description}`),
    },
    ...(categoryCode === eNewsCategoryCode.BANGTIN_CONGTRINH
      ? [{
        title: 'Công trình',
        dataIndex: 'projectId',
        key: 'projectName',
        width: '20%',
        render: (projectId: number) => {
          const project = projectList.find(p => p.id === projectId);
          return project?.name || '-';
        }
      }]
      : []),
    {
      title: 'Xuất bản',
      dataIndex: 'published',
      key: 'published',
      width: 100,
      render: (value: number) => (NewsService.getPublish(value)),
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: INewsRecord) => {
        return (
          <Space>
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined />}
                type="text"
                size="small"
                style={{ color: '#096798' }}
                disabled={!editGranted}
                onClick={() => {
                  // if (user && record.senderId === user.Id) {
                  if (user) {
                    navigate(`/edit-news?id=${record.id}&categoryCode=${categoryCode}`)
                  } else {
                    notification.warning({
                      message: 'Chỉnh sửa chủ đề',
                      description: 'Bạn không phải là người tạo chủ đề này!',
                    });
                  }
                }}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                disabled={!deleteGranted}
                onClick={() => {
                  if (record.published === 2) {
                    notification.warning({
                      message: 'Không thể xóa',
                      description: 'Không thể xóa tin tức đã xuất bản',
                    });
                    return;
                  }
                  if (user && record.senderId === user.Id)
                    deleteRecord(record);
                  else {
                    notification.warning({
                      message: 'Xóa chủ đề',
                      description: 'Bạn không phải là người tạo chủ đề này!',
                    });
                  }

                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    //type: number = 1, startDate: string='2000-01-01', endDate: string='9000-01-01'
    if (company)
      dispatch(newsActions.getListNews({ companyId: company.id | 1, type: 1 }));
  }, [company]);

  useEffect(() => {
    // Loại bỏ các phần tử trùng id
    const uniqueList = filterListNews.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );

    // Nếu có phần tử trùng bị loại bỏ thì cập nhật lại filterListNews
    if (uniqueList.length !== filterListNews.length) {
      setFilterListNews([...uniqueList]); // Cập nhật list mới không trùng id
      return; // Dừng ở đây, không chạy phần dưới khi đang cập nhật lại list
    }

    console.log(uniqueList);
    const query: PagingResponse = {
      page: queryParams?.page || 1,
      pageSize: queryParams?.pageSize || 20,
      queryCount: queryParams?.queryCount || uniqueList.length,
      pageCount: 0,
      firstRowIndex: 0,
      lastRowIndex: 0
    };
    setQueryParams(query);
  }, [filterListNews]);

  useEffect(() => {
    if (listNews && categoryCode) {
      let filter = listNews.filter(x => x.newsGroup === categoryCode);
      if (textSearch && filter) filter = filter.filter(x => x.title?.includes(textSearch) || x.description?.includes(textSearch));
      setFilterListNews(filter);
    } else setFilterListNews([]);
  }, [listNews, categoryCode, textSearch]);

  const showTotal: PaginationProps['showTotal'] = (total, range) => `${range[0]} - ${range[1]} trong ${total} bản ghi`;
  const handleEmpTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const query: PagingResponse = {
      page: current || 1,
      pageSize: pageSize || 20,
      queryCount: queryParams?.queryCount || filterListNews.length,
      pageCount: 0,     // ko dùng
      firstRowIndex: 0, // ko dùng
      lastRowIndex: 0   // ko dùng
    }
    setQueryParams(query);
  };

  const deleteRecord = (record: INewsRecord) => {
    dispatch(newsActions.deleteNews({ id: record.id }));
  }

  const handleTextChange = (evt: any) => {
    setTextSearch(evt?.currentTarget?.value);
  };

  return (
    <>
      <div
        style={{
          height: 60,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0px 10px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            flexWrap: 'wrap',
            minWidth: '300px',
          }}
        >
          <Typography.Title
            style={{
              marginRight: 10,
              fontSize: '16px',
            }}
            level={4}
          >
            {activeMenu?.label}
          </Typography.Title>
          <span
            style={{
              minWidth: '70px',
              textAlign: 'right',
              marginLeft: 'auto',
              marginRight: 10,
            }}
          >
            {'Nhóm tin'}
          </span>
          <Select
            style={{ width: '200px', marginRight: '10px' }}
            options={NewsService.groupOption}
            value={categoryCode}
            onChange={val => setCategoryCode(val)}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 10,
            minWidth: '300px',
          }}
        >
          <Input
            placeholder={'Tìm kiếm'}
            allowClear
            value={textSearch}
            style={{
              width: '300px',
              height: '32px',
            }}
            suffix={textSearch ? null : <SearchOutlined />}
            onChange={handleTextChange}
          />
          <WithPermission policyKeys={['QuanLyTinTuc.Create']} strategy="disable">
            <Button
              type="primary"
              onClick={() => {
                navigate(`/edit-news?id=0&categoryCode=${categoryCode}`);
              }}
            >
              {t('New')}
            </Button>
          </WithPermission>
        </div>
      </div>

      <Flex vertical style={{ height: 'calc(100vh - 250px)' }}>
        <div style={{ flexGrow: 1, alignItems: 'stretch', padding: 5 }}>
          <Table
            size="small"
            rowKey={record => record.id}
            dataSource={filterListNews}
            columns={newsColumns}
            style={{ width: '100%', height: '30%' }}
            scroll={{ x: 1000, y: windowSize[1] - 230 }}
            pagination={{
              current: queryParams?.page || 1,
              pageSize: queryParams?.pageSize || 20,
              total: filterListNews.length,
              responsive: true,
              showTotal,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleEmpTableChange}
            loading={isLoading}
            rowClassName={(record, index) => styles['custom-row']} // Thêm class
          />
        </div>
      </Flex>
    </>
  );
};

export default ManagerNews;
