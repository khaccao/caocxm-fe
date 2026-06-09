import React, { useEffect, useState } from 'react';

import { CaretDownOutlined, CaretUpOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Button, DatePicker, Input, Avatar, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './SafetyDiary.module.css';
import { sMilestone } from '@/common/define';
import { HistoryReport, Members, TeamByUser } from '@/services/TeamService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCategorys, issueActions } from '@/store/issue';
import { getSelectedProject } from '@/store/project';
import { teamActions } from '@/store/team';
import { RootState } from '@/store/types';
//[nam_do][30/10/2024] Căn chỉnh lại giao diện
interface DataType {
  key: string;
  date?: string;
  namehome?: string;
  name?: string;
  team?: string;
  weather?: string;
  antoan?: string;
  vsmt?: string;
  categoryId?: string;
  hidden?: boolean;
  children?: DataType[];
}

// Thêm định nghĩa kiểu dữ liệu cho category
interface Category {
  historyReports: DataType[];
  [key: string]: any;
}

// Định nghĩa interface cho node trong cây
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  historyReports: DataType[];
  [key: string]: any;
}

// Hàm clone và lọc cây theo ngày
const cloneTreeWithFilteredData = (node: TreeNode, date: string): TreeNode => {
  const clonedNode: TreeNode = { ...node, children: [], historyReports: [] };

  clonedNode.historyReports = node.historyReports.filter(report => report.date === date);
  clonedNode.children = node.children.map(child => cloneTreeWithFilteredData(child, date));

  return clonedNode;
};

// Hàm tạo groupedData theo ngày
const createGroupedDataByDate = (tree: TreeNode[], mappedData: DataType[]): { date: string; items: TreeNode[] }[] => {
  const allDates = new Set(mappedData.filter(item => item.date).map(item => item.date as string));
  const groupedData: { date: string; items: TreeNode[] }[] = [];

  allDates.forEach(date => {
    const filteredTree = tree.map(node => cloneTreeWithFilteredData(node, date));
    groupedData.push({ date, items: filteredTree });
  });

  return groupedData.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
};

const getAvatar = (text: string | undefined) => {
  const initials = text
    ? text
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
    : '';

  return (
    <Tooltip title={text || ''}>
      <Avatar style={{ backgroundColor: '#FF99FF', color: '#fff' }} className={styles.avatarIcon}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

const getTeamAvatar = (text: string | undefined) => {
  const initials = text
    ? text
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
    : '';

  return (
    <Tooltip title={text || ''}>
      <Avatar style={{ backgroundColor: '#66FFFF', color: '#fff' }} className={styles.avatarIcon}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

export const SafetyDiary: React.FC = () => {
  const { t } = useTranslation('material');
  const weather = useTranslation('weather').t;
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const teamsByIds = useAppSelector((state: RootState) => state.team.teamsByIds);
  const historyReport = useAppSelector((state: RootState) => state.team.historyReport);
  const company = useAppSelector(getCurrentCompany());
  const categorys = useAppSelector(getCategorys());

  const [selectedDates, setSelectedDates] = useState<[Dayjs, Dayjs] | null>([dayjs().subtract(7, 'days'), dayjs()]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mappedData, setMappedData] = useState<DataType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownload = () => console.log('Download button clicked');
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleApply = () => {
    if (selectedDates && selectedDates[0] && selectedDates[1] && selectedProject) {
      const startDate = selectedDates[0].format('YYYY-MM-DD');
      const endDate = selectedDates[1].format('YYYY-MM-DD');
      dispatch(
        teamActions.getHistoryReportRequest({
          projectId: selectedProject.id,
          startDate,
          endDate,
        }),
      );
    }
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isItemExpanded = (itemId: string) => expandedItems.has(itemId);

  //[20503] [nam_do]Gắn API menu nhật ký thi công và ATLD & VSMT
  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setSelectedDates([dates[0], dates[1]]);
    } else {
      setSelectedDates([dayjs().subtract(7, 'days'), dayjs()]);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      //kiểm tra xem select project chưa
      if (selectedDates) {
        // kiểm tra date chọn chưa
        const startDate = selectedDates[0].format('YYYY-MM-DD');
        const endDate = selectedDates[1].format('YYYY-MM-DD');

        // Dispatch API với khoảng ngày của selectedDates
        dispatch(
          teamActions.getHistoryReportRequest({
            projectId: selectedProject.id,
            startDate,
            endDate,
          }),
        );
      } else {
        // Nếu selectedDates là null, dùng giá trị mặc định
        const defaultStartDate = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
        const defaultEndDate = dayjs().format('YYYY-MM-DD');

        dispatch(
          teamActions.getHistoryReportRequest({
            projectId: selectedProject.id,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        );
      }
    }

    // Dispatch API để lấy danh mục theo companyId
    dispatch(
      issueActions.getCategoryByCompanyIdRequest({
        companyId: company.id,
        tagVersionCode: sMilestone.SetupInitialProgress,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, dispatch, selectedDates]);

  useEffect(() => {
    if (historyReport) {
      const teamIds = historyReport.map(report => report.teamId);

      if (teamIds.length > 0) {
        dispatch(teamActions.getTeamsByIdsRequest({ teamIds }));
      } else {
      }
    }
  }, [historyReport, dispatch]);
  //map data historyReport và teamsByIds
  const getDataFrom = () => {
    const mapped: DataType[] = [];
    if (Array.isArray(historyReport) && Array.isArray(teamsByIds.results)) {
      historyReport.forEach(hr => {
        const teamhr = teamsByIds.results.find((m: TeamByUser) => m.id === hr.teamId);
        if (teamhr) {
          const leadername = teamhr.members.find((m: Members) => m.employeeId === teamhr.leader_Id)?.name || '';
          mapped.push({
            key: hr.id.toString(),
            categoryId: hr.categoryId != null ? hr.categoryId.toString() : undefined,
            date: hr.date,
            namehome: hr.subject || '',
            name: leadername,
            team: teamhr.name,
            weather: hr.weather || '',
            antoan: hr.safetyScore,
            vsmt: hr.environmentScore,
          });
        }
      });
    }
    setMappedData(mapped);
  };

  useEffect(() => {
    if (historyReport && teamsByIds) {
      getDataFrom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyReport, teamsByIds]);

  const expandedRowRender = (mappedData: DataType[]) => (
    <Table columns={columns} dataSource={mappedData} pagination={false} rowKey="key" showHeader={false} />
  );

  const sortData = (data: DataType[]): DataType[] => {
    return data.sort((a, b) => {
      if (a.namehome?.includes('PHẦN MÓNG') && b.namehome?.includes('PHẦN MÓNG')) {
        const aNumber = parseInt(a.namehome.replace(/\D/g, ''), 10);
        const bNumber = parseInt(b.namehome.replace(/\D/g, ''), 10);
        return aNumber - bNumber;
      }
      return 0;
    });
  };

  const groupedData = mappedData.reduce((acc, item) => {
    const group = acc.find(g => g.date === item.date);
    if (group) {
      group.items.push(item);
    } else {
      acc.push({ date: item.date || '', items: [item] });
    }
    return acc;
  }, [] as { date: string; items: DataType[] }[]);

  // Sắp xếp groupedData theo ngày mới nhất
  const sortedGroupedData = groupedData.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

  const tableData = sortedGroupedData
    .map((group, index) => ({
      key: `group-${index}`,
      date: dayjs(group.date).format('DD/MM/YYYY'), // Chỉ lấy phần ngày, bỏ phần giờ
      items: sortData(group.items),
    }))
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))); // Sắp xếp ngày gần đây nhất lên đầu
  const columns: ColumnsType<DataType> = [
    { title: 'Tên công việc', dataIndex: 'namehome', key: 'namehome', width: '30%' },
    {
      title: 'Tổ trưởng',
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      align: 'center',
      render: (text: string) => getAvatar(text),
    },
    {
      title: 'Tên tổ',
      dataIndex: 'team',
      key: 'team',
      width: '10%',
      align: 'center',
      render: (text: string) => getTeamAvatar(text),
    },
    { title: 'Thời tiết', dataIndex: 'weather', key: 'weather', width: '10%', align: 'center', render: (text: string) => weather(text) },
    {
      title: 'An toàn',
      dataIndex: 'antoan',
      key: 'antoan',
      width: '12%',
      align: 'center',
      render: (text: string) => (
        <span className={text === 'Không đạt' ? styles.notAchieved : styles.achieved}>{text}</span>
      ),
    },
    //thêm cột vệ sinh môi trường
    {
      title: 'VSMT',
      dataIndex: 'vsmt',
      key: 'vsmt',
      width: '12%',
      align: 'center',
      render: (text: string) => (
        <span className={text === 'Không đạt' ? styles.notAchieved : styles.achieved}>{text}</span>
      ),
    },
  ];

  const buildCategoryTree = (categories: any[]) => {
    const categoryMap = new Map();
    const rootCategories: any[] = [];
    const usedCodes = new Set();

    // Tạo map cho tất cả các danh mục
    categories.forEach(category => {
      categoryMap.set(category.code, {
        ...category,
        children: [],
      });
    });

    // Xây dựng cây danh mục
    categories.forEach(category => {
      if (usedCodes.has(category.code)) return;

      const categoryNode = categoryMap.get(category.code);

      if (!category.parentCode || category.parentCode === '') {
        rootCategories.push(categoryNode);
      } else {
        const parentCategory = categoryMap.get(category.parentCode);
        if (parentCategory) {
          parentCategory.children.push(categoryNode);
        } else {
          rootCategories.push(categoryNode);
        }
      }
      usedCodes.add(category.code);
    });

    return rootCategories;
  };

  const addDataToTree = (tree: any[], data: DataType[]) => {
    tree.forEach(node => {
      node.historyReports = data.filter(item => item.categoryId === node.id.toString());
      if (node.children.length > 0) {
        addDataToTree(node.children, data);
      }
    });
  };

  const groupDataByDate = (tree: any[]) => {
    const groupedData: { [key: string]: any[] } = {};

    // Chỉ lấy các ngày từ dữ liệu hiện có
    const allDates = new Set(mappedData.map(item => item.date));

    allDates.forEach(date => {
      if (date) {
        groupedData[date] = [];
      }
    });

    const traverseTree = (node: any) => {
      allDates.forEach(date => {
        const reportsForDate = node.historyReports.filter((report: DataType) => report.date === date);
        if (date) {
          // Kiểm tra date không phải undefined
          if (reportsForDate.length > 0) {
            groupedData[date].push({ ...node, historyReports: reportsForDate });
          } else {
            groupedData[date].push({ ...node, historyReports: [] });
          }
        }
      });
      node.children.forEach(traverseTree);
    };

    tree.forEach(traverseTree);

    return Object.entries(groupedData)
      .sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA)))
      .map(([date, items]) => ({ date, items }));
  };

  const renderCategoryTree = (categories: any[], dateKey: string, level = 0) => {
    return categories.map((category, index) => {
      const itemId = `${dateKey}-${category.id}-${index}`;

      return (
        <div
          key={itemId}
          className={`${styles.groupContainer} ${styles[`level-${level}`]} ${styles.categorySeparator}`}
        >
          <div className={`${styles.tableHeaderContainer} ${styles.categoryBorder}`}>
            <button
              className={styles.toggleButton}
              onClick={() => toggleItem(itemId)}
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {isItemExpanded(itemId) ? (
                <>
                  <CaretUpOutlined className={styles.toggleIcon} />
                  <span className={styles.toggleText}>{category.name}</span>
                </>
              ) : (
                <>
                  <CaretDownOutlined className={styles.greenIcon} />
                  <span className={styles.toggleText}>{category.name}</span>
                </>
              )}
            </button>
          </div>
          {isItemExpanded(itemId) && (
            <>
              {category.historyReports && category.historyReports.length > 0 && (
                <div style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                  <Table
                    columns={columns}
                    dataSource={category.historyReports}
                    pagination={false}
                    rowKey="key"
                    showHeader={false}
                  />
                </div>
              )}
              {category.children && category.children.length > 0 && (
                <div className={styles.childCategories}>
                  {renderCategoryTree(category.children, `${itemId}-children`, level + 1)}
                </div>
              )}
            </>
          )}
        </div>
      );
    });
  };

  const renderGroupedData = (groupedData: any[]) => {
    const uniqueDates = new Set();

    return groupedData
      .map((group, groupIndex) => {
        const dateKey = `date-${groupIndex}`;
        const formattedDate = dayjs(group.date).format('DD/MM/YYYY');

        if (uniqueDates.has(formattedDate)) {
          return null;
        }

        uniqueDates.add(formattedDate);

        return (
          <div key={dateKey} className={styles.dateGroup}>
            <h3>{formattedDate}</h3>
            {renderCategoryTree(group.items, dateKey)}
          </div>
        );
      })
      .filter(Boolean);
  };

  // Thêm hàm lọc dữ liệu theo searchTerm
  const filterDataBySearchTerm = (data: any[]) => {
    if (!searchTerm) return data;

    const filteredData = data
      .map(group => ({
        ...group,
        items: group.items
          .map((category: Category) => ({
            ...category,
            historyReports: category.historyReports.filter(report =>
              report.namehome?.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          }))
          .filter((category: Category) => category.historyReports.length > 0),
      }))
      .filter(group => group.items.length > 0);

    // Trả về null nếu không có kết quả nào
    return filteredData.length > 0 ? filteredData : null;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
      <div className={styles.headerContent}>
          {/* <h4>{t('Safety Diary')}</h4> */}
          <Typography.Title level={4}>{t('Safety Diary')} </Typography.Title>
          <div className={styles.searchContainer}>
            <Input
              placeholder="Tìm kiếm công việc"
              onChange={handleSearch}
              className={styles.searchInput}
              suffix={<SearchOutlined />}
            />
          </div>
          {/* Ẩn các button chưa sử dụng đến */}
          {/* <Button icon={<FilterOutlined />} className={styles.filterButton} /> */}
        </div>
        <div className={styles.datapicker}>
          {/* <Button type="primary" className={styles.lastweekButton}>
            Tuần sau
          </Button> */}
          <DatePicker.RangePicker value={selectedDates} onChange={handleRangeChange} className={styles.datePicker} />
          <Button type="primary" onClick={handleApply} className={styles.applyButton}>
            Apply
          </Button>
          {/* <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            type="primary"
            className={styles.downloadButton}
          />
          <Button icon={<EllipsisOutlined />} type="default" className={styles.ellipsisButton} /> */}
        </div>
      </div>
      <div className={styles.scrollableContent}>
        <div className={styles.tableForm}>
          {categorys &&
            mappedData.length > 0 &&
            (() => {
              const tree = buildCategoryTree(categorys);
              addDataToTree(tree, mappedData);
              const groupedData = createGroupedDataByDate(tree, mappedData);
              const filteredData = filterDataBySearchTerm(groupedData);

              if (!filteredData || filteredData.length === 0) {
                return <div className={styles.noResults}>Không tìm thấy dữ liệu</div>;
              }

              return (
                <>
                  <Table
                    columns={columns}
                    dataSource={[]}
                    pagination={false}
                    showHeader={true}
                    className={styles.headerOnly}
                  />
                  <div className={styles.scrollableTable}>{renderGroupedData(filteredData)}</div>
                </>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default SafetyDiary;
