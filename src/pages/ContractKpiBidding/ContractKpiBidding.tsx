import { useEffect, useState } from 'react';

import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Modal, PaginationProps, Select, Table, TableProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './Contract.module.less';
import { ContractHeader } from './ContractHeader';
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
  UpdateStatusIssue,
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
import {  codeStatus, IssueContactAndKPIDTO, IssuesResponse, Status, StatusHelperControl, StatusLabel } from '@/services/IssueService';
import { getCurrentCompany } from '@/store/app'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, getIssueStatusList, getIssues, getIssuesView, issueActions, getIssueByVersion, getTagsVersion, getTracker, queryParamsByTagVersion } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject, projectActions } from '@/store/project';
import Utils from '@/utils';



export const ContractKpiBidding = () => {
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
  const issueStatusList = useAppSelector(getIssueStatusList());
  const ContractTaskIssues = useAppSelector(getIssueByVersion());
  const [dataInita, setDataInit] = useState<IssueContactAndKPIDTO[]>([]);
  const [checkStrictly,] = useState(true);
  const tags = useAppSelector(getTagsVersion());
  const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0 , record: []});
  const [countRows, setCountRows]= useState<IssueContactAndKPIDTO[]>([])
  const [filteredData, setFilteredData] = useState<IssueContactAndKPIDTO[] | null>(null);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const fullDataSet: IssueContactAndKPIDTO[] = [...dataInita]; 
  const [loading, setLoading] = useState<boolean>(true);
  const isLoadingUpdateStatus = useAppSelector(getLoading(UpdateStatusIssue));
  const isLoadingGenIssue = useAppSelector(getLoading(genIssue));
  const trackers = useAppSelector(getTracker());
  const company = useAppSelector(getCurrentCompany());
  const paramsVersion = useAppSelector(queryParamsByTagVersion())
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

  const addIssueGranted = usePermission(['HopDong_KPIDauThau.Create']);
  const aprroveIssueGranted = usePermission(['HopDong_KPIDauThau.Approve']);
  const editIssueGranted = usePermission(['HopDong_KPIDauThau.Edit']);
  const deleteIssueGranted = usePermission(['HopDong_KPIDauThau.Delete']);
  
  const editButtonProps: ButtonProps = {
    disabled: !editIssueGranted,
  }
  const deleteButtonProps: ButtonProps = {
    disabled: !deleteIssueGranted,
  }

  const infoParentComponent: IInforParenComponent = {
    tagVersionId: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags), 
    typeUpdate: sMilestone.ContractBiddingKPIs, 
    pageSize: 20,
  }

  type PopupState = {
    visible: boolean;
    x: number;
    y: number;
    record: IssueContactAndKPIDTO[];
  };

  useEffect(() => {
    if (!selectedProject) {
      dispatch(issueActions.setIssues(undefined));
      dispatch(projectActions.setProjectMembers(undefined));
      return;
    }
    const trackerId = getTrackerID();
    // dispatch(issueActions.getCategoryByCompanyIdRequest({ companyId: company.id, tagVersionCode: sMilestone.ContractBiddingKPIs}));
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags),
          pageSize: size,
          trackerId,
        },
      }),
    );
    dispatch(issueActions.getMembersToGroup({code: BCHcode.BCHcode}))
    // eslint-disable-next-line
  }, [selectedProject, tags]);


  useEffect(() => {
    const trackerId = getTrackerID();
    setLoading(true);
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject?.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags),
          pageSize: size,
          trackerId,
        },
      }),
    );
    if (!isSaving || !isLoadingUpdateStatus || !isRemoving) {
      setLoading(false)
    }
  },[isRemoving, isSaving,tags , isLoadingUpdateStatus, view])

  type TableRowSelection<T> = TableProps<T>['rowSelection'];


  const statusOptionsTable = StatusHelperControl.statusOptionFilter;

  const mappingData = (ContractTaskIssues: any) => {
    const results: IssueContactAndKPIDTO[] = [];
    ContractTaskIssues?.forEach((item: any) => {
      let status = Utils.getStatus(item.status);
      if (+item.progress === 100) {
        status = Utils.getStatus(sMilestone.Complete);
      }
      const datamap : IssueContactAndKPIDTO = {
        ...item,
        status,
        children: [],
      }
      results.push(datamap);
    })
    const dataTotree = mapDataToTree(results);
    return dataTotree;
  }

  const mapDataToTree = (data: IssueContactAndKPIDTO[]) => {
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

  useEffect(()=>{
    if (ContractTaskIssues && ContractTaskIssues.results && ContractTaskIssues.results.length > 0) {
      const sortDataFllowDayPlanStart = Utils.sortIssueByPlanStartDay(ContractTaskIssues);
      const newData = mappingData(sortDataFllowDayPlanStart);
      setDataInit(newData)
      setFilteredData(newData)
    }
  },[paramsVersion, ContractTaskIssues?.results.length, isLoading, isLoadingGenIssue])

  
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
    let filteredData: IssueContactAndKPIDTO[] = [];
    if (+data.key === Status.Approved || +data.key === Status.Done || +data.key === Status.Pending || +data.key === Status.Processing) {
      filteredData = filterTree(fullDataSet, +data.key);
      setIsFiltered(true);
      setFilteredData(filteredData);
    } else {
        filteredData = [...fullDataSet];  // Nếu không khớp giá trị nào, trả về toàn bộ dữ liệu
        setIsFiltered(false);
    }
}

  const filterTree= (nodes: IssueContactAndKPIDTO[], status: number) : IssueContactAndKPIDTO[] => {
    return nodes.map((item: IssueContactAndKPIDTO) => {
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
    }).filter(node => node !== null) as IssueContactAndKPIDTO[]
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
      ? listRecord.map((item: any) => item.id) 
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
    const trackerId = getTrackerID();
    const search = { ...params, page: current, tagVersionId: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags), pageSize: size, trackerId, };
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

  const rowSelection: TableRowSelection<IssueContactAndKPIDTO> = {
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
  const countRecord: IssueContactAndKPIDTO[] = []
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
      {issueModal && <CreateUpdateIssue tagVersionId={Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags)} />}
      <ContractHeader />
      <div className={styles.wrapperContract}>
        {ContractTaskIssues && ContractTaskIssues.results && ContractTaskIssues.results.length === 0 && (
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
        {view === 'List' && ContractTaskIssues && ContractTaskIssues.results && ContractTaskIssues.results.length > 0 && (
          <>
           {loading ? <Loading /> :
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
              //   current: params?.page || defaultPagingParams.page,
              //   pageSize: paramsVersion?.pageSize > 9999 ? defaultPagingParams.pageSize : paramsVersion?.pageSize,
              //   total: ContractTaskIssues?.queryCount || 0,
              //   responsive: true,
              //   showTotal,
              //   showSizeChanger: true,
              // }}
              loading={isLoading || isRemoving || isLoadingUpdateStatus || isLoadingGenIssue || isSaving}
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
              handleStatusChange={handleStatusChange}
              t={t}
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
        {view === 'Gantt'  && ContractTaskIssues && ContractTaskIssues.results && ContractTaskIssues.results.length > 0 && (
          <Gantt infoParentComponent={infoParentComponent} />
        )}
      </div>
    </>
  );
};
