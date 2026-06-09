import React, { useState } from 'react';

import {
  DownloadOutlined,
  EllipsisOutlined,
  FilterOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from '@ant-design/icons';
import { Table, Button, DatePicker, Input, Avatar, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from './EnvironmentalSanitationDiary.module.css';

interface DataType {
  key: string;
  date: string;
  namehome: string;
  name: string;
  team: string;
  weather: string;
  vsmt: string;
  children?: DataType[];
}

const getAvatar = (text: string) => {
  const initials = text
    .split(' ')
    .map(part => part.charAt(0))
    .join('');

  return (
    <Tooltip title={text}>
      <Avatar style={{ backgroundColor: '#FF99FF', color: '#fff' }} className={styles.avatarIcon}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

const getTeamAvatar = (text: string) => {
  const initials = text
    .split(' ')
    .map(part => part.charAt(0))
    .join('');

  return (
    <Tooltip title={text}>
      <Avatar style={{ backgroundColor: '#66FFFF', color: '#fff' }} className={styles.avatarIcon}>
        {initials}
      </Avatar>
    </Tooltip>
  );
};

const columns: ColumnsType<DataType> = [
  { title: 'Tên nhà', dataIndex: 'namehome', key: 'namehome', width: '50%' },
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
    width: '10%',
    render: (text: string) => getAvatar(text),
  },
  {
    title: 'Tổ',
    dataIndex: 'team',
    key: 'team',
    width: '10%',
    render: (text: string) => getTeamAvatar(text),
  },
  { title: 'Thời tiết', dataIndex: 'weather', key: 'weather', width: '10%' },
  {
    title: 'Sổ công',
    dataIndex: 'vsmt',
    key: 'vsmt',
    width: '15%',
    render: (text: string) => (
      <span className={text === 'Không đạt' ? styles.notAchieved : styles.achieved}>{text}</span>
    ),
  },
  { title: 'Hành động', key: 'action', width: '5%', render: () => <EllipsisOutlined /> },
];

const data: DataType[] = [
  {
    key: '1',
    date: '01/01/2023',
    namehome: 'Hoàng tạo',
    name: 'Nguyễn Văn Tâm',
    team: 'Tổ thép',
    weather: 'Mưa',
    vsmt: '',
    children: [
      {
        key: '2',
        date: '01/01/2023',
        namehome: 'LD CP, sàn tầng 1',
        name: 'Nguyễn Văn Tâm',
        team: 'Tổ thép',
        weather: 'Nắng',
        vsmt: 'Không đạt',
        children: [
          {
            key: '3',
            date: '01/01/2023',
            namehome: 'LD CP, cốt thép sàn tầng 1',
            name: 'Ngô Minh Hoàng',
            team: 'Tổ sắt',
            weather: 'Nắng',
            vsmt: 'Đạt',
            children: [
              {
                key: '4',
                date: '01/01/2023',
                namehome: 'Đổ bê tông thương phẩm đá 1x2, sàn tầng 1',
                name: 'Nguyễn Thị Dinh',
                team: 'Tổ thép',
                weather: 'Nắng',
                vsmt: 'Đạt',
                children: [
                  {
                    key: '5',
                    date: '02/01/2023',
                    namehome: 'GCLD cốt thép cột vách sàn tầng 1',
                    name: 'Nguyễn Văn Tâm',
                    team: 'Tổ thép',
                    weather: 'Nắng',
                    vsmt: 'Đạt',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: '11',
    date: '01/01/2023',
    namehome: 'Hoàng tạo',
    name: 'Nguyễn Văn Tâm',
    team: 'Tổ hoàn thiện',
    weather: 'Nắng',
    vsmt: 'Đạt',
    children: [
      {
        key: '12',
        date: '01/01/2023',
        namehome: 'Hoàn thiện tường tầng 1',
        name: 'Nguyễn Văn Tâm',
        team: 'Tổ hoàn thiện',
        weather: 'Nắng',
        vsmt: 'Đạt',
        children: [
          {
            key: '13',
            date: '01/01/2023',
            namehome: 'Hoàn thiện trần tầng 1',
            name: 'Nguyễn Văn Tâm',
            team: 'Tổ hoàn thiện',
            weather: 'Nắng',
            vsmt: 'Đạt',
          },
        ],
      },
    ],
  },
  {
    key: '14',
    date: '02/01/2023',
    namehome: 'Hoàng tạo',
    name: 'Nguyễn Văn Tâm',
    team: 'Tổ hoàn thiện',
    weather: 'Mưa',
    vsmt: 'Đạt',
    children: [
      {
        key: '15',
        date: '02/01/2023',
        namehome: 'Hoàn thiện sàn tầng 1',
        name: 'Nguyễn Văn Tâm',
        team: 'Tổ hoàn thiện',
        weather: 'Mưa',
        vsmt: 'Đạt',
      },
    ],
  },
];

export const EnvironmentalSanitationDiary: React.FC = () => {
  const { t } = useTranslation('material');
  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleDownload = () => console.log('Download button clicked');
  const handleSearch = (value: string) => console.log('Search value:', value);
  const handleSelectDate = (dates: [Dayjs | null, Dayjs | null] | null) => setSelectedDates(dates);
  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => setSelectedDates(dates);
  const handleApply = () => handleSelectDate(selectedDates);

  const handleToggleExpand = (key: string) => {
    setExpandedGroups(prevGroups => {
      const newGroups = new Set(prevGroups);
      newGroups.has(key) ? newGroups.delete(key) : newGroups.add(key);
      return newGroups;
    });
  };

  const expandedRowRender = (data: DataType[]) => (
    <Table columns={columns} dataSource={data} pagination={false} rowKey="key" showHeader={false} />
  );

  const sortData = (data: DataType[]): DataType[] => {
    return data.sort((a, b) => {
      if (a.namehome.includes('PHẦN MÓNG') && b.namehome.includes('PHẦN MÓNG')) {
        const aNumber = parseInt(a.namehome.replace(/\D/g, ''), 10);
        const bNumber = parseInt(b.namehome.replace(/\D/g, ''), 10);
        return aNumber - bNumber;
      }
      return 0;
    });
  };

  const groupedData = data.reduce((acc, item) => {
    const group = acc.find(g => g.date === item.date);
    group ? group.items.push(item) : acc.push({ date: item.date, items: [item] });
    return acc;
  }, [] as { date: string; items: DataType[] }[]);

  const tableData = groupedData.map((group, index) => ({
    key: `group-${index}`,
    date: index === 0 ? 'Ngày 01/01/2023' : `${t('Day')} ${group.date}`,
    items: sortData(group.items), // Apply sorting
  }));

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h4>{t('Environmental Sanitation Diary')}</h4>
          <Input.Search
            enterButton
            placeholder="Tìm kiếm công việc"
            onSearch={handleSearch}
            className={styles.searchInput}
          />
          <Button icon={<FilterOutlined />} className={styles.filterButton} />
        </div>

        <div className={styles.datapicker}>
          <Button type="primary" className={styles.lastweekButton}>
            Tuần sau
          </Button>
          <DatePicker.RangePicker onChange={handleRangeChange} className={styles.datePicker} />
          <Button type="primary" onClick={handleApply} className={styles.applyButton}>
            Apply
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            type="primary"
            className={styles.downloadButton}
          />
          <Button icon={<EllipsisOutlined />} type="default" className={styles.ellipsisButton} />
        </div>
      </div>
      <div className={styles.tableForm}>
        <div className={styles.headerContainer}>
          <h3 className={styles.headerTitle}>Thi công nhà ở chị Uyển</h3>
          <h4 className={styles.headerName}>{t('TEAM LEADER')}</h4>
          <h4 className={styles.headerUnit}>{t('TEAM NAME')}</h4>
          <h4 className={styles.headerQuantity}>{t('WEATHER')}</h4>
          <h4 className={styles.headerDot}>{t('Environmental Sanitation')}</h4>
        </div>
        {tableData.map((group, index) => (
          <div key={group.key} className={styles.groupContainer}>
            <div className={styles.tableHeaderContainer}>
              <h2 className={`${styles.tableHeader} ${styles.tableTenct}`}>{group.date}</h2>
              <button
                className={styles.toggleButton}
                onClick={() => handleToggleExpand(`${group.key}-foundation`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${group.key}-foundation`);
                }}
                tabIndex={0}
              >
                {expandedGroups.has(`${group.key}-foundation`) ? (
                  <>
                    <CaretUpOutlined className={styles.toggleIcon} />
                    <span className={styles.toggleText}>{t('Foundation')}</span>
                  </>
                ) : (
                  <>
                    <CaretDownOutlined className={styles.greenIcon} />
                    <span className={styles.toggleText}>{t('Foundation')}</span>
                  </>
                )}
              </button>

              {expandedGroups.has(`${group.key}-foundation`) && (
                <>
                  {group.items
                    .filter(item => item.team === 'Tổ thép')
                    .map(item => (
                      <div key={item.key} className={styles.groupContainer}>
                        <div className={styles.tableHeaderContainer}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => handleToggleExpand(`${item.key}-foundation-sub`)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${item.key}-foundation-sub`);
                            }}
                            tabIndex={0}
                          >
                            {expandedGroups.has(`${item.key}-foundation-sub`) ? (
                              <>
                                <CaretUpOutlined className={styles.toggleIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '02/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN MÓNG 1'
                                    : 'PHẦN MÓNG 1 '}
                                </span>
                              </>
                            ) : (
                              <>
                                <CaretDownOutlined className={styles.greenIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '02/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN MÓNG 1'
                                    : 'PHẦN MÓNG 1 '}
                                </span>
                              </>
                            )}
                          </button>
                          {expandedGroups.has(`${item.key}-foundation-sub`) && expandedRowRender(item.children || [])}
                        </div>
                        {item.date === '01/01/2023' && (
                          <>
                            <button
                              className={styles.toggleButton}
                              onClick={() => handleToggleExpand(`${item.key}-foundation-sub-2`)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ')
                                  handleToggleExpand(`${item.key}-foundation-sub-2`);
                              }}
                              tabIndex={0}
                            >
                              {expandedGroups.has(`${item.key}-foundation-sub-2`) ? (
                                <>
                                  <CaretUpOutlined className={styles.toggleIcon1} />
                                  <span className={styles.toggleText1}>{t('Foundation part 2')}</span>
                                </>
                              ) : (
                                <>
                                  <CaretDownOutlined className={styles.greenIcon1} />
                                  <span className={styles.toggleText1}>{t('Foundation part 2')}</span>
                                </>
                              )}
                            </button>
                            {expandedGroups.has(`${item.key}-foundation-sub-2`) &&
                              expandedRowRender(
                                item.children?.find(child => child.namehome === 'GCLD cốt thép cột vách sàn tầng 1')
                                  ?.children || [],
                              )}
                          </>
                        )}
                      </div>
                    ))}
                </>
              )}
              <button
                className={styles.toggleButton}
                onClick={() => handleToggleExpand(`${group.key}-completion`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${group.key}-completion`);
                }}
                tabIndex={0}
              >
                {expandedGroups.has(`${group.key}-completion`) ? (
                  <>
                    <CaretUpOutlined className={styles.toggleIcon} />
                    <span className={styles.toggleText}>{t('Finishing section')}</span>
                  </>
                ) : (
                  <>
                    <CaretDownOutlined className={styles.greenIcon} />
                    <span className={styles.toggleText}>{t('Finishing section')}</span>
                  </>
                )}
              </button>
              {expandedGroups.has(`${group.key}-completion`) && (
                <>
                  {group.items
                    .filter(item => item.team === 'Tổ hoàn thiện')
                    .map(item => (
                      <div key={item.key} className={styles.groupContainer}>
                        <div className={styles.tableHeaderContainer}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => handleToggleExpand(`${item.key}-completion-sub`)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${item.key}-completion-sub`);
                            }}
                            tabIndex={0}
                          >
                            {expandedGroups.has(`${item.key}-completion-sub`) ? (
                              <>
                                <CaretUpOutlined className={styles.toggleIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '02/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN HOÀN THIỆN 1'
                                    : 'PHẦN HOÀN THIỆN'}
                                </span>
                              </>
                            ) : (
                              <>
                                <CaretDownOutlined className={styles.greenIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '02/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN HOÀN THIỆN 1'
                                    : 'PHẦN HOÀN THIỆN'}
                                </span>
                              </>
                            )}
                          </button>
                          {expandedGroups.has(`${item.key}-completion-sub`) && expandedRowRender(item.children || [])}
                        </div>
                      </div>
                    ))}
                </>
              )}
              <button
                className={styles.toggleButton}
                onClick={() => handleToggleExpand(`${group.key}-body`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${group.key}-body`);
                }}
                tabIndex={0}
              >
                {expandedGroups.has(`${group.key}-body`) ? (
                  <>
                    <CaretUpOutlined className={styles.toggleIcon} />
                    <span className={styles.toggleText}>{t('Body')}</span>
                  </>
                ) : (
                  <>
                    <CaretDownOutlined className={styles.greenIcon} />
                    <span className={styles.toggleText}>{t('Body')}</span>
                  </>
                )}
              </button>
              {expandedGroups.has(`${group.key}-body`) && (
                <>
                  {group.items
                    .filter(item => item.team === 'Tổ thân')
                    .map(item => (
                      <div key={item.key} className={styles.groupContainer}>
                        <div className={styles.tableHeaderContainer}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => handleToggleExpand(`${item.key}-body-sub`)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(`${item.key}-body-sub`);
                            }}
                            tabIndex={0}
                          >
                            {expandedGroups.has(`${item.key}-body-sub`) ? (
                              <>
                                <CaretUpOutlined className={styles.toggleIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '01/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN THÂN 1'
                                    : 'PHẦN THÂN'}
                                </span>
                              </>
                            ) : (
                              <>
                                <CaretDownOutlined className={styles.greenIcon1} />
                                <span className={styles.toggleText1}>
                                  {item.date === '01/01/2023' && item.children && item.children.length > 0
                                    ? 'PHẦN THÂN 1'
                                    : 'PHẦN THÂN'}
                                </span>
                              </>
                            )}
                          </button>
                          {expandedGroups.has(`${item.key}-body-sub`) && expandedRowRender(item.children || [])}
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalSanitationDiary;
