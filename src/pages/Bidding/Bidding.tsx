import { useEffect, useState } from 'react';

import { CaretUpOutlined, CaretDownOutlined, MenuFoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Modal, PaginationProps, Select, Space, Table, TableProps, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './Bidding.module.less';
import { BidHeader } from './BidHeader';
import { issuesColumns } from './columns/IssuseColumn';
import Menucontext from './components/Menucontext';
import { CreateUpdateIssue } from './CreateUpdateIssue';
import { expandIconCustom } from '../Components/expandIcon';
import {
  CreateUpdateIssueModalName,
  GettingIssueList,
  RemovingIssue,
  SavingIssue,
  UpdateStatusIssue,
  defaultPagingParams,
  largePagingParams,
  IInforParenComponent,
  sMilestone,
  GettingIssueByVersionList,
  genIssue,
  eTrackerCode,
  BCHcode,
} from '@/common/define';
import { Loading } from '@/components';
import { Gantt } from '@/components/Gantt/Gantt';
import { usePermission, useWindowSize } from '@/hooks';
import {  BiddingDTO, codeStatus, IssueService, IssuesResponse, Status, StatusHelperControl, StatusLabel } from '@/services/IssueService';
import { getCurrentCompany } from '@/store/app'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, getIssueStatusList, getCategorys, getIssues, getIssuesView, issueActions, getIssueByVersion, getTagsVersion, getTracker, queryParamsByTagVersion } from '@/store/issue';
import { getLoading, startLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject, projectActions, getFileRoots } from '@/store/project';
import Utils from '@/utils';

type TableRowSelection<T> = TableProps<T>['rowSelection'];

export const Bidding = () => {
  const { Option } = Select;
  const { t } = useTranslation('bidding');

  const windowSize = useWindowSize();

  const dispatch = useAppDispatch();
  const [biddingIssues, setFullDataSet] =  useState<BiddingDTO[]>([]);
  const selectedProject = useAppSelector(getSelectedProject());
  const view = useAppSelector(getIssuesView());
  const issues = useAppSelector(getIssues());
  const biddingTasksIssues = useAppSelector(getIssueByVersion());
  const issueModal = useAppSelector(getModalVisible(CreateUpdateIssueModalName));
  const params = useAppSelector(getIssueQueryParams());
  const isLoading = useAppSelector(getLoading(GettingIssueByVersionList));
  const isLoadingUpdateStatus = useAppSelector(getLoading(UpdateStatusIssue));
  const isRemoving = useAppSelector(getLoading(RemovingIssue));
  const isSaving = useAppSelector(getLoading(SavingIssue));
  const issueStatusList = useAppSelector(getIssueStatusList());
  const tags = useAppSelector(getTagsVersion());
  const [dataInita, setDataInit] = useState<BiddingDTO[]>([]);
  const [checkStrictly,] = useState(true);
  const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0 , record: []});
  const [countRows, setCountRows]= useState<BiddingDTO[]>([])
  const [filteredData, setFilteredData] = useState<BiddingDTO[] | null>(null);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const fullDataSet: BiddingDTO[] = [...dataInita]; 
  const [loading, setLoading] = useState<boolean>(true);
  const isLoadingGenIssue = useAppSelector(getLoading(genIssue));
  const categorys = useAppSelector(getCategorys());
  const trackers = useAppSelector(getTracker());
  const paramsVersion = useAppSelector(queryParamsByTagVersion())
  const listDataFileRoots = useAppSelector(getFileRoots());
  const company = useAppSelector(getCurrentCompany());
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const addIssueGranted = usePermission(['DuThau.Create']);
  const aprroveIssueGranted = usePermission(['DuThau.Approve']);
  const editIssueGranted = usePermission(['DuThau.Edit']);
  const deleteIssueGranted = usePermission(['DuThau.Delete']);

  const editButtonProps: ButtonProps = {
    disabled: !editIssueGranted,
  }
  const deleteButtonProps: ButtonProps = {
    disabled: !deleteIssueGranted,
  }

  const size = 10000;
  const getTrackerID = () => {
    let trackerId = 20;
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
      if (tracker && tracker.id) {
        trackerId = tracker.id;
      }
    }
    return trackerId;
  }
  const ascending = false;
  const infoParentComponent: IInforParenComponent = {
    isApplyCategory: true,
    tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags), 
    typeUpdate: sMilestone.Bid, 
    pageSize: 20,
    ascending
  }
  type PopupState = {
    visible: boolean;
    x: number;
    y: number;
    record: BiddingDTO[];
  };
  // [hao_lt] Fix call api tạo folder khi vào project
  useEffect(()=> {
    // console.log(first)
  },[])


  useEffect(()=>{
    if (!biddingTasksIssues) {
      setLoading(true);
    }
    if (biddingTasksIssues && biddingTasksIssues.results && biddingTasksIssues.results.length > 0) {
      const sortDataFllowDayPlanStart = Utils.sortIssueByPlanStartDay(biddingTasksIssues);
      const newData = mappingData(sortDataFllowDayPlanStart);
      setDataInit(newData);
      setFullDataSet(newData);
      setLoading(false)
    }
  },[paramsVersion, biddingTasksIssues?.results.length, isRemoving, isSaving, isLoading, isLoadingGenIssue])

  const mappingData = (biddingTasksIssues: any) => {
    const results: BiddingDTO[] = [];
    // [#20436][dung_lt][17/10/2024]_Thêm category vào mục dự thầu
    categorys && categorys.forEach((el: any) => {
      const parentId = el?.parentCode ? el.parentCode : null;
      const dataCategory: BiddingDTO = {
        id: el.code,
        subject: el.name,
        description: '',
        startDate: '',
        dueDate: '',
        actualStartDate: '',
        actualEndDate: '',
        parentId: parentId,
        isCategory: true,
        projectId: 0,
        supervisor: {
          id: 0,
          fullname: '',
          phone: ''
        },
        type: 0,
        status: 0,
        progress: 0,
        startTime: '',
        tagVersionId: 0,
        tagVersionName: '',
        issueContacts: [],
        assignedTo: null,
        createdBy: null,
        attributes: [],
        plannedEndDate: '',
        plannedStartDate: ''
      }
      results.push(dataCategory);
    });
    biddingTasksIssues?.forEach((item: any) => {
      let status = Utils.getStatus(item.status);
      if (+item.progress === 100) {
        status = Utils.getStatus(sMilestone.Complete);
      }
      const datamap : BiddingDTO = {
        ...item,
        status: Utils.getStatus(item.status),
        children: [],
      }
      results.push(datamap);
    })
    const dataTotree = mapDataToTree(results);
    const dataTreeAfterRemove = removeChildrenIfEmpty(dataTotree);
    sortDataFlowFloor(dataTreeAfterRemove);
    return dataTreeAfterRemove;
  }

  // [#20436][dung_lt][17/10/2024]_ Sort data theo tầng
  const sortDataFlowFloor = (data: any) => {
    data && data.map((item: any) => {
      if (item?.id === "Phan_Mong") {
        item?.children?.sort((a: any, b: any) => {
          return customSort(a, b) * -1;
        });
      }
  
      if (item?.id === "Phan_Than") {
        item?.children?.sort((a: any, b: any) => {
          return customSort(a, b);
        });
      }
  
      if (item?.id === "Phan_Hoan_Thien") {
        item?.children?.map((child: any) => {
          if (["Xay_Tuong", "Trat_Tuong_Trong", "Trat_Tuong_Ngoai", "Op_Lat_Tuong_Nen"].includes(child?.id)) {
            return child?.children?.sort((a: any, b: any) => {
              return customSort(a, b);
            });
          }
        });
      }
    });
  };

  const customSort = (a: any, b: any) => {
    const indexA = a?.description?.indexOf(' - ');
    const resultA = a?.description?.substring(indexA + 3).trim();
    const indexB = b?.description?.indexOf(' - ');
    const resultB = b?.description?.substring(indexB + 3).trim();
  
    const numberA = extractNumber(resultA);
    const numberB = extractNumber(resultB);
  
    // So sánh dựa trên số trích xuất được
    if (numberA !== null && numberB !== null) {
      return numberA - numberB;
    }
  
    // Nếu một trong hai không có số, sắp xếp theo thứ tự mặc định
    if (numberA !== null) return -1;
    if (numberB !== null) return 1;
  
    // Nếu cả hai đều không có số, so sánh chuỗi bình thường
    if (resultA < resultB) return -1;
    if (resultA > resultB) return 1;
    return 0;
  };

  const extractNumber = (str: string): number | null => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  // [#20436][dung_lt][17/10/2024]_ Xóa các category không có children
  function removeChildrenIfEmpty(data: any[]): any[] {
    return data.map((item: any) => {
      if (item.isCategory && item.children && item.children.length > 0) {
          item.children = removeChildrenIfEmpty(item.children);
      }
      // Filter out items that are categories and have no children
      if (item.isCategory && (!item.children || item.children.length === 0)) {
          return null; // Remove this item
      }
      return item;
  }).filter((item: any) => item !== null); // Filter out null items
}

  const mapDataToTree = (data: any) => {
    const root: BiddingDTO[] = [];
      const idMapping = data.reduce((acc: any, el: any, i: any) => {
        acc[el.id] = i;
        return acc;
      }, {});
      if (data) {
        // Duyệt qua mỗi đối tượng trong data để xây dựng cấu trúc cây
        data.forEach((el: any) => {
          if (el.parentId === el.id) {
            root.push(el);
            return;
        }
          // Kiểm tra nếu đối tượng có categoryId hợp lệ và parentId không có trong idMapping
          if ((el.categoryId !== null && el.categoryId !== undefined)  && !idMapping.hasOwnProperty(el.parentId)) {
            const category = categorys && categorys.find((c) => c.id === el.categoryId);
            if (category) {
              const parentEl = data[idMapping[category?.code]];
              if (parentEl) {
                parentEl.children = [...(parentEl.children || []), el];
                return;
              }
            } 
          } 
          // Nếu đối tượng có parentId hợp lệ
          const parentEl = data[idMapping[el.parentId]];
          if (parentEl) {
            parentEl.children = [...(parentEl.children || []), el];
          } else {
            // Nếu không tìm thấy đối tượng cha, thêm nó vào mảng root
            root.push(el)
          }
      });
      } 
    return root;
};
  



  useEffect(() => {
    if (!selectedProject) {
      dispatch(issueActions.setIssues(undefined));
      dispatch(projectActions.setProjectMembers(undefined));
      return;
    }
    let trackerId = getTrackerID();
    // [#20474][hao_lt][18/10/2024]_ gọi lại api get category cho từng version theo tagVersionCode
    dispatch(issueActions.getCategoryByCompanyIdRequest({ companyId : company.id, tagVersionCode: sMilestone.Bid}));
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags),
          pageSize: size,
          ascending,
          trackerId,
        },
      }),
    );
    dispatch(issueActions.getMembersToGroup({code: BCHcode.BCHcode}))
    // eslint-disable-next-line
  }, [selectedProject, tags]);

  let trackerId = getTrackerID();
  useEffect(() => {
    setLoading(true);
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject?.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags),
          pageSize: size,
          ascending,
          trackerId,
        },
      }),
    );
    if (!isSaving || !isLoadingUpdateStatus || !isRemoving) {
      setLoading(false)
    }
  },[isRemoving, isSaving, isLoadingUpdateStatus, view])

  const statusOptionsTable = StatusHelperControl.statusOptionFilter;
  
  const handleStatusChange = (value : any, record: any, isChangeOnMenuContext: boolean) => {
    if (isChangeOnMenuContext) {
      if (countRows && countRows.length > 0) {
        const listIdIssue: any[] = [];
        countRows.filter((i:any) => i !== undefined && i.status === Status.Pending).map((r: any) => listIdIssue.push(r.id));
        dispatch(issueActions.updateMultiStatusIssue({id: listIdIssue, projectId: record.projectId, code: codeStatus.ApprovedSeries}))
      } else {
        if (+record.status !== Status.Pending) return;
        dispatch(issueActions.updateStatusIssue({id: record.id, projectId: record.projectId, code: codeStatus.Approved}))
      }
    } else {
      const code = Utils.convertStatusApi(value);
      dispatch(issueActions.updateStatusIssue({id: record.id, projectId: record.projectId, code: code}))

    }
  };
  

  const handleFilterValueTable = (value: any, data: any) => {
       let filteredData: BiddingDTO[] = [];
       if (+data.key === Status.Approved || +data.key === Status.Done || +data.key === Status.Pending || +data.key === Status.Processing) {
        filteredData = filterTree(fullDataSet, +data.key);
        setIsFiltered(true);
        setFilteredData(filteredData);
    } else {
        filteredData = [...fullDataSet];  // Nếu không khớp giá trị nào, trả về toàn bộ dữ liệu
        setIsFiltered(false);
    }
  }

  const filterTree= (nodes: BiddingDTO[], status: number) : BiddingDTO[] => {
    return nodes.map((item: BiddingDTO) => {
        if (item.children && item.children.length > 0) {
            const filteredData = filterTree(item.children, status);
            if (filteredData.length > 0 || item.status === status) {
              return {
                ...item,
                children: filteredData
              }
            } 
          } else if (+item.status === status) {
            return { ...item, children: []}
          }
        return null;
    }).filter(node => node !== null) as BiddingDTO[]
  }

  const editIssue = (issue: any, isEdit: boolean) => {
      if(!isEdit) {
        dispatch(issueActions.setEditIssuePublics(false))
        dispatch(issueActions.setSelectedIssue(issue));
        dispatch(showModal({ key: CreateUpdateIssueModalName }));
      } else {
        dispatch(issueActions.setEditIssuePublics(true))
        dispatch(issueActions.getFileAttachmenForIssue({issueId: issue.id}));
        dispatch(issueActions.setSelectedIssue(issue));
        dispatch(showModal({ key: CreateUpdateIssueModalName }));
      }
  };


  const confirmRemoveIssue = (issue: IssuesResponse, listRecord: any) => {
    let issueId: any[] = []
    if (listRecord) {
      issueId = listRecord.length > 0 && countRows.length > 0 
      ? listRecord.filter((i: any)=> i !== undefined).map((item: any) => item.id) 
      : [issue.id];
    } else {
      issueId = [issue]
    }
    Modal.confirm({
      title: t('Notification'),
      content: (

        <div
          dangerouslySetInnerHTML={{
            __html: t(`${countRows.length === 0 ?  t('Confirm remove') : t('Confirm')}`, {
              name: `<strong>"${countRows.length > 0 ? '': issue.id}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      maskClosable: true,
      onOk: close => {
        handleRemoveIssue(issueId, listRecord);
        close();
      },
    });
  };

  const handleRemoveIssue = (issueId: any[], listRecord: any) => {
    if((selectedProject && countRows.length === 0) || !listRecord) {
      dispatch(issueActions.removeIssueRequest({ issueId: !listRecord ? issueId[0].id : issueId[0], projectId: selectedProject?.id }))
    } else if (listRecord) {
      dispatch(issueActions.deleteMultiIssue({listIdIssue: issueId, projectId: selectedProject?.id}))
      countRecord.push([]);
    } 
  };

  const handleIssueTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const trackerId = getTrackerID();
    const search = { ...params, page: current, pageSize: size, tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags) ,trackerId, ascending};
    if (selectedProject) {
      dispatch(
        issueActions.getIssuesByMilestoneRequest({
          projectId: selectedProject.id,
          params: search,
        })
      );
    }
  };
  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  const rowSelection: TableRowSelection<BiddingDTO> = {
    // [#20709][dung_lt][03/11/2024] _ không cho select category (sửa lỗi delete nhiều issue)
    getCheckboxProps: (record) => {
      const isCategory = record.isCategory;
      return {
        disabled: isCategory
      };
    },
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
      setPopup((prevState) => ({ ...prevState, visible: false }));
      setCountRows(selectedRows);
      // console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      setCountRows(selectedRows);
      // console.log(selected, selectedRows, changeRows);
    },
  };
  const countRecord: any[] = []
  const onRow = (record: any) => ({
    onContextMenu: (event : any) => {
      event.preventDefault();
      if (countRows.length > 0) {
        countRecord.push(...countRows);
      } else {
        countRecord.push(record);
      }
      if (!popup.visible) {
        const onClickOutside = () => {
          setPopup((prevState) => ({ ...prevState, record: [], visible: false }));
          document.removeEventListener('click', onClickOutside);
        };
        document.addEventListener('click', onClickOutside);
      }
      setPopup({
        record: countRecord,
        visible: true,
        x: event.clientX,
        y: event.clientY,
      });
    },
  });

  // [#20436][dung_lt][17/10/2024]_ Render tên công việc theo category or issue thông thường
  function renderNameColumn(text: any, record: any) {
    
    const handleClickAdd: React.MouseEventHandler<HTMLSpanElement> = (event) => {
      // console.log('Span clicked');
      // Do something with the event, if needed
    };
    if (record.isCategory || typeof record.parentId === 'string') { 
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
        <Space
          style={{
            width: '100%',
            // background: 'red',
          }}
        >
          <Tooltip title={`${text}`}>
              <Typography.Text
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              >{`${text}`}</Typography.Text>
            </Tooltip>
          <Space style={{ display: 'flex', gap: '5px' }}>
            <Tooltip title={record.description}>
              <Button type={'default'} icon={<MenuFoldOutlined />} size="small" />
            </Tooltip>
            <Button type={'default'} icon={<PlusOutlined />} size="small" onClick={() => editIssue(record, false)} disabled={!addIssueGranted} />
          </Space>
        </Space>
      );
    }
  }

  // [#20436][dung_lt][17/10/2024]_ Xử lý khi nhấn mở rộng category or issue cha
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
  const dataSource = isFiltered ? filteredData : dataInita;
  return (
    <>
      {issueModal && <CreateUpdateIssue tagVersionId={Utils.getMileStoneId(sMilestone.Bid, tags)} />}
      <BidHeader />
      <div className={styles.wrapperbiding}>
        {biddingTasksIssues && biddingTasksIssues.results && biddingTasksIssues.results.length === 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 150px)',
              backgroundColor: 'white',
              margin: 10,
            }}
          >
            <Empty
              description={
                <>
                  <Typography.Title level={4}>{t('No data found based on filtering criteria')}</Typography.Title>
                  {/* <Typography.Text>{t('Try reselecting the filtering criteria to find your data')}</Typography.Text> */}
                </>
              }
            />
          </div>
        )}
        {view === 'List' && biddingTasksIssues && biddingTasksIssues.results && biddingTasksIssues.results.length > 0 && (
          <>  
            {loading ? <Loading/> :
            <div style={{ padding: 5 }}>
              <div style={{width:"100%", background:'white', height: '40px', padding:"10px"}}>
            <Select
              className={styles.customSelect}
              style={{height:'25px', width: '150px'}}
              defaultValue={statusOptionsTable[0].label}
              onChange={(value, data) => handleFilterValueTable(value, data)}
            >
              {statusOptionsTable.map(option => (
                <Option 
                key={option.value} 
                value={option.label}
                >
                    {option.label}
                </Option>
              ))}
            </Select>
              </div>
              <Table
                key={dataSource!.length}
                className='biddingCustom'
                rowKey={record => record.id}
                dataSource={dataSource!}
                columns={issuesColumns({t, handleStatusChange, editIssue, confirmRemoveIssue, editButtonProps, deleteButtonProps})}
                style={{ width: '100%' }}
                size="small"
                rowHoverable={false}
                scroll={{ x: 1000, y: windowSize[1] - 200 }}
                rowSelection={{ ...rowSelection, checkStrictly }}
                pagination={false}
                // pagination={{
                //   current: paramsVersion?.page || defaultPagingParams.page,
                //   pageSize: paramsVersion?.pageSize > 9999 ? defaultPagingParams.pageSize : paramsVersion?.pageSize,
                //   total: biddingTasksIssues?.queryCount || 0,
                //   responsive: true,
                //   showTotal,
                //   showSizeChanger: true,
                // }}
                loading={isLoading || isRemoving || loading || isLoadingUpdateStatus || isLoadingGenIssue}
                onChange={handleIssueTableChange}
                // expandable={{
                //   expandIcon: ({ expanded, onExpand, record }) => expandIconCustom({expanded, onExpand, record, editIssue}),
                //   expandIconColumnIndex: 3,
                // }}
                expandable={{
                  expandedRowKeys: expandedRowKeys,
                  expandIcon: ({ expanded, onExpand, record }) => {
                    if (!record.children || record.children.length === 0) {
                      return (
                        <Space style={{ display: 'flex', flexDirection: 'row' }}>
                          {/* <Button
                            type={'default'}
                            icon={<CaretUpOutlined />}
                            size="small"
                            onClick={e => onExpand(record, e)}
                            style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0)' }}
                          /> */}
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
                  expandIconColumnIndex: 3,
                  onExpand: handleExpand,
                }}
                onRow={onRow}
              />
                <Menucontext 
                {...popup} 
                countRows={countRows.length} 
                confirmRemoveIssue={confirmRemoveIssue}
                editIssue={editIssue}
                t={t}
                handleStatusChange={handleStatusChange}
                approveProps={{
                  hidden: !aprroveIssueGranted,
                }}
                removeProps={{
                  hidden: !deleteIssueGranted,
                }}
                />
            </div>
            }
          </>
        )}
        {view === 'Gantt'  && biddingTasksIssues && biddingTasksIssues.results && biddingTasksIssues.results.length > 0 && (
        <Gantt infoParentComponent={infoParentComponent}/>
        )}
      </div>
    </>
  );
};
