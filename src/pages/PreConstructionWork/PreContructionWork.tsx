import { useEffect, useState } from 'react';

import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Modal, PaginationProps, Select, Table, TableProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { PreConstruct } from './PreconstrucHeader';
import styles from './PreConstruct.module.less';
import { issuesColumns } from '../Bidding/columns/IssuseColumn';
import Menucontext from '../Bidding/components/Menucontext';
import { CreateUpdateIssue } from '../Bidding/CreateUpdateIssue';
import { expandIconCustom } from '../Components/expandIcon';
import {
  CreateUpdateIssueModalName,
  GettingIssueList,
  RemovingIssue,
  SavingIssue,
  defaultPagingParams,
  largePagingParams,
  IInforParenComponent,
  sMilestone,
  UpdateStatusIssue,
  eTrackerCode,
  GettingIssueByVersionList,
  BCHcode,
} from '@/common/define';
import { Loading } from '@/components';
import { Gantt } from '@/components/Gantt/Gantt';
import { usePermission, useWindowSize } from '@/hooks';
import {  codeStatus, IssuesResponse, PrepareConstructionDTO, Status, StatusHelperControl, StatusLabel } from '@/services/IssueService';
import { getCurrentCompany } from '@/store/app'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueByVersion, getIssueQueryParams, getIssues, getIssuesView, issueActions, getTagsVersion, getTracker, queryParamsByTagVersion } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject, projectActions } from '@/store/project';
import Utils from '@/utils';

type TableRowSelection<T> = TableProps<T>['rowSelection'];
type PopupState = {
  visible: boolean;
  x: number;
  y: number;
  record: PrepareConstructionDTO[];
};

export const PreConstructionWork = () => {
  const { Option } = Select;
  const { t } = useTranslation('bidding');

  const windowSize = useWindowSize();

  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const view = useAppSelector(getIssuesView());
  const issues = useAppSelector(getIssues());
  const issueModal = useAppSelector(getModalVisible(CreateUpdateIssueModalName));
  const params = useAppSelector(getIssueQueryParams());
  const isLoading = useAppSelector(getLoading(GettingIssueByVersionList));
  const isRemoving = useAppSelector(getLoading(RemovingIssue));
  const isSaving = useAppSelector(getLoading(SavingIssue));
  const issueStatusList = useAppSelector(getIssueByVersion());
  const tags = useAppSelector(getTagsVersion());
  const [dataInita, setDataInit] = useState<PrepareConstructionDTO[]>([]);
  const [checkStrictly,] = useState(true);
  const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0 , record: []});
  const [countRows, setCountRows]= useState<PrepareConstructionDTO[]>([])
  const [filteredData, setFilteredData] = useState<PrepareConstructionDTO[] | null>(null);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const fullDataSet: PrepareConstructionDTO[] = [...dataInita]; 
  const [loading, setLoading] = useState<boolean>(true);
  const isLoadingUpdateStatus = useAppSelector(getLoading(UpdateStatusIssue));
  const paramsVersion = useAppSelector(queryParamsByTagVersion())
  const company = useAppSelector(getCurrentCompany());
  const ascending = true;
  const trackers = useAppSelector(getTracker());
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

  const addIssueGranted = usePermission(['ChuanBiThiCong.Create']);
  const aprroveIssueGranted = usePermission(['ChuanBiThiCong.Approve']);
  const editIssueGranted = usePermission(['ChuanBiThiCong.Edit']);
  const deleteIssueGranted = usePermission(['ChuanBiThiCong.Delete']);

  const editButtonProps: ButtonProps = {
    disabled: !editIssueGranted,
  }
  const deleteButtonProps: ButtonProps = {
    disabled: !deleteIssueGranted,
  }

  const infoParentComponent: IInforParenComponent = {
    tagVersionId: Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags), 
    typeUpdate: sMilestone.PrepareForConstruction, 
    pageSize: 20,
    ascending,
  }

  
  useEffect(()=>{
    if (!issueStatusList) {
      setLoading(true);
    }
    if (issueStatusList && issueStatusList.results && issueStatusList.results.length > 0) {
      const sortDataFllowDayPlanStart = Utils.sortIssueByPlanStartDay(issueStatusList);
      const newData = mappingData(sortDataFllowDayPlanStart)
      setDataInit(newData);
      setFilteredData(newData)
      setLoading(false);
    }
  },[issueStatusList?.results.length, paramsVersion, isRemoving, isLoading])

  const mappingData = (issueStatusList: any) => {
    const results: PrepareConstructionDTO[] = [];
    issueStatusList?.forEach((item: any) => {
      let status = Utils.getStatus(item.status);
      if (+item.progress === 100) {
        status = Utils.getStatus(sMilestone.Complete);
      }
      const datamap : PrepareConstructionDTO = {
        ...item,
        status,
        children: [],
      }
      results.push(datamap);
    })    
    const dataTotree = mapDataToTree(results);
    return dataTotree;
  }

  const mapDataToTree = (data: PrepareConstructionDTO[]) => {
    const idMapping = data.reduce((acc: any, el: any, i: any) => {
        acc[el.id] = i;
        return acc;
    }, {});
    const root: any = [];
    data.forEach((el: any) => {
        if (el.parentId === null || !idMapping.hasOwnProperty(el.parentId) || el.parentId === el.id) {
            root.push(el);
            return;
        }
        const parentEl = data[idMapping[el.parentId]];
        if (parentEl) {
          parentEl.children = [...(parentEl.children || []), el];
        } else {
          root.push(el)
        }
    });
    return root;
};
  

  useEffect(() => {
    if (!selectedProject) {
      dispatch(issueActions.setIssues(undefined));
      dispatch(projectActions.setProjectMembers(undefined));
      return;
    }
    let trackerId = getTrackerID();
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags),
          pageSize: size,
          ascending,
          trackerId,
        },
      }),
    );
    dispatch(issueActions.getMembersToGroup({code: BCHcode.BCHcode}))
    // eslint-disable-next-line
  }, [selectedProject, isRemoving, isSaving, tags, isLoadingUpdateStatus, view]);

  useEffect(() => {
    if (isLoadingUpdateStatus) {
      setLoading(true);
    } 
  }, [isLoadingUpdateStatus])

  
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

  const handleFilterValueTable = (value: string, data: any) => {
       let filteredData: PrepareConstructionDTO[] = [];
       if (+data.key === Status.Approved || +data.key === Status.Done || +data.key === Status.Pending || +data.key === Status.Processing) {
        filteredData = filterTree(fullDataSet, +data.key);
        setIsFiltered(true);
        setFilteredData(filteredData);
    } else {
        filteredData = [...fullDataSet];  // Nếu không khớp giá trị nào, trả về toàn bộ dữ liệu
        setIsFiltered(false);
    }
  }

  const filterTree= (nodes: PrepareConstructionDTO[], status: number) : PrepareConstructionDTO[] => {
    return nodes.map((item: PrepareConstructionDTO) => {
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
    }).filter(node => node !== null) as PrepareConstructionDTO[]
  }

  const editIssue = (issue: any, isEdit: boolean) => {
    if(!isEdit) {
      dispatch(issueActions.setEditIssuePublics(false))
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateIssueModalName }));
    } else {
      dispatch(issueActions.setEditIssuePublics(true))
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateIssueModalName }));
    }
};


  const confirmRemoveIssue = (issue: IssuesResponse, listRecord: any) => {
    let issueId: any[] = []
    if (listRecord) {
      issueId = listRecord.length > 0 && countRows.length > 0 
      ? listRecord.filter((r: any)=> r !== undefined).map((item: any) => item.id) 
      : [issue.id];
    } else {
      issueId = [issue]
    }
    Modal.confirm({
      title: t('Notification'),
      content: (

        <div
          dangerouslySetInnerHTML={{
            __html: t(`${countRows.length === 0 ?  t('Confirm remove') : t('Bạn có chắc chắn muốn xóa các công việc đã chọn')}`, {
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
    } 
  };

  const handleIssueTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    let trackerId = getTrackerID();
    const search = { ...params, page: current, pageSize: size, tagVersionId: Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags),ascending, trackerId };
    if (selectedProject) {
      dispatch(
        issueActions.getIssuesByMilestoneRequest({
          projectId: selectedProject.id,
          params: search,
        }),
      );
    }
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  const rowSelection: TableRowSelection<PrepareConstructionDTO> = {
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
  const countRecord: PrepareConstructionDTO[] = []
  const onRow = (record: any) => ({
    onContextMenu: (event : any) => {
      event.preventDefault();
      if (countRows.length > 0) {
        countRecord.push(...countRows)
      } else {
        countRecord.push(record)
      }
      if (!popup.visible) {
        const onClickOutside = () => {
          setPopup((prevState) => ({ ...prevState, record: countRecord, visible: false }));
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

  const dataSource = isFiltered ? filteredData : dataInita;
  return (
    <>
      {issueModal && <CreateUpdateIssue tagVersionId={Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags)} />}
      <PreConstruct />
      <div className={styles.wrapperContract}>
        {issueStatusList && issueStatusList.results && issueStatusList.results.length === 0 && (
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
        {view === 'List' && issueStatusList && issueStatusList.results && issueStatusList.results.length > 0 && (
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
          <>
          </>
            <div>
              {
                loading ? <Loading /> :
                 <>
                  <Table
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
                    loading={isLoading || isRemoving || isLoadingUpdateStatus}
                    onChange={handleIssueTableChange}
                    expandable={{
                      expandIcon: ({ expanded, onExpand, record }) => expandIconCustom({expanded, onExpand, record, editIssue, addButtonProps: { disabled: !addIssueGranted }}),
                      expandIconColumnIndex: 3,
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
                 </>
              }
            </div>
          </div>
        )}
        {view === 'Gantt'  && issueStatusList && issueStatusList.results && issueStatusList.results.length > 0 && (
          <Gantt infoParentComponent={infoParentComponent}/>
        )}
      </div>
    </>
  );
};
