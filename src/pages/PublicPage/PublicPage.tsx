import React, { useEffect, useState } from 'react';

import { UserAddOutlined, CaretDownOutlined, CaretUpOutlined, MenuFoldOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Empty, Modal, PaginationProps, Select, Space, Table, TableProps, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
// eslint-disable-next-line import/order
import { useTranslation } from 'react-i18next';

// import { BidHeader } from './BidHeader';

import { useLocation } from 'react-router-dom';

import { CreateUpdateIssue } from './CreateUpdateIssue';
import styles from './Public.module.less';
import { PublicHeader } from './PublicHeader';
import Menucontext from '../Bidding/components/Menucontext';
import { colors } from '@/common/colors';
import {
  CreateUpdateInitWorkModalName,
  GettingIssueList,
  RemovingIssue,
  SavingIssue,
  formatDateDisplay,
  largePagingParams,
  sMilestone,
  IInforParenComponent,
  UpdateStatusIssue,
  GettingIssueByVersionList,
  genIssue,
  eOrderResourceName,
  eTrackerCode,
  eAttribute,
  eNatureOfTheJob,
} from '@/common/define';
import { Loading } from '@/components';
import { Gantt } from '@/components/Gantt/Gantt';
import { usePermission, useWindowSize } from '@/hooks';
import { codeStatus, issueOtherResourceQuotas, IssuesResponse, IssueTargetDTO, SetupInitialProgressDTO, Status, StatusHelperControl, StatusLabel, TargetIssue } from '@/services/IssueService';
import { getCurrentCompany } from '@/store/app'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, getIssues, getIssuesView, issueActions, getIssueByVersion, getTagsVersion, getCategorys, getIssuesByParentId, getTracker } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getSelectedProject, projectActions, getEmployeesByCompanyId } from '@/store/project';
import { teamActions, getTeams } from '@/store/team';
import Utils from '@/utils';
type TableRowSelection<T> = TableProps<T>['rowSelection'];

type PopupState = {
  visible: boolean;
  x: number;
  y: number;
  record: SetupInitialProgressDTO[];
};

export const PublicPage = () => {
  const { Option } = Select;
  const { t } = useTranslation('publics');
  const tCategory = useTranslation('category').t;
  const location = useLocation();
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const [checkStrictly,] = useState(true);
  const selectedProject = useAppSelector(getSelectedProject());
  const view = useAppSelector(getIssuesView());
  const PublicPageIssues = useAppSelector(getIssueByVersion());
  const issueModal = useAppSelector(getModalVisible(CreateUpdateInitWorkModalName));
  const params = useAppSelector(getIssueQueryParams());
  const isLoading = useAppSelector(getLoading(GettingIssueByVersionList));
  const isLoadingGenIssue = useAppSelector(getLoading(genIssue));
  const isRemoving = useAppSelector(getLoading(RemovingIssue));
  const isSaving = useAppSelector(getLoading(SavingIssue));
  const [dataInita, setDataInit] = useState<SetupInitialProgressDTO[]>([]);
  const [countRows, setCountRows]= useState<SetupInitialProgressDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<SetupInitialProgressDTO[] | null>(null);
  const fullDataSet: SetupInitialProgressDTO[] = [...dataInita]; 
  const isLoadingUpdateStatus = useAppSelector(getLoading(UpdateStatusIssue));
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const tags = useAppSelector(getTagsVersion());
  const categorys = useAppSelector(getCategorys());
  const company = useAppSelector(getCurrentCompany());
  const trackers = useAppSelector(getTracker());
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
  const teams = useAppSelector(getTeams());
  const size = 10000;
  const ascending = true;
  const infoParentComponent: IInforParenComponent = {
    isApplyCategory: true,
    tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags), 
    typeUpdate: sMilestone.SetupInitialProgress, 
    pageSize: size,
    ascending,
  }

  const addIssueGranted = usePermission(['LapTienDoBanDau.Create']);
  const aprroveIssueGranted = usePermission(['LapTienDoBanDau.Approve']);
  const editIssueGranted = usePermission(['LapTienDoBanDau.Edit']);
  const deleteIssueGranted = usePermission(['LapTienDoBanDau.Delete']);

  useEffect(() => {
    if (!selectedProject) {
      dispatch(issueActions.setIssues(undefined));
      dispatch(projectActions.setProjectMembers(undefined));
      return;
    }
    let trackerId = getTrackerID();
    // [#20474][hao_lt][18/10/2024]_ gọi lại api get category cho từng version theo tagVersionCode
    dispatch(issueActions.getCategoryByCompanyIdRequest({ companyId: company.id, tagVersionCode: sMilestone.SetupInitialProgress}));
    dispatch(
      issueActions.getIssuesByMilestoneRequest({
        projectId: selectedProject.id,
        params: {
          ...params,
          page: 1,
          search: undefined,
          tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
          pageSize: size,
          ascending,
          trackerId,
        },
      }),
    );
    dispatch(
      projectActions.getProjectMembersRequest({
        projectId: selectedProject.id,
        queryParams: { ...largePagingParams },
      }),
    );
    if (selectedProject) {
      dispatch(teamActions.getTeamsRequest({ projectId: selectedProject.id, queryParams: {} }));
        }
    // eslint-disable-next-line
  }, [selectedProject, isRemoving, isSaving, tags, isLoadingUpdateStatus, isLoadingGenIssue, view]);


  useEffect(() => {
    // const data = dataChange(dataInit);
    if (!PublicPageIssues || UpdateStatusIssue) {
      setLoading(true);
    }
    const sortDataFllowDayStart = Utils.sortIssueByPlanStartDay(PublicPageIssues);
    const newData = mappingData(sortDataFllowDayStart);
    setDataInit(newData);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PublicPageIssues?.results.length, params, isSaving, isLoading, isLoadingGenIssue, isLoadingUpdateStatus, categorys]);

  
  useEffect(() => {
    const savedExpandedRowKeys = localStorage.getItem('expandedRowKeys');
    const parsedKeys = savedExpandedRowKeys ? JSON.parse(savedExpandedRowKeys) : [];
    if (Array.isArray(parsedKeys)) {
      setExpandedRowKeys(parsedKeys);
    }
  }, [PublicPageIssues?.results.length]);

  useEffect(() => {
    localStorage.removeItem('expandedRowKeys');
  }, [location.search]); 

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


  const mappingData = (PublicPageIssues: any) => {
    const results: SetupInitialProgressDTO[] = [];
    categorys && categorys.forEach((el: any) => {
      const parentId = el?.parentCode ? el.parentCode : null;
      const dataCategory: SetupInitialProgressDTO = {
        id: el.code,
        parentId: parentId,
        projectId: 0,
        workPackageId: 0,
        areaId: 0,
        categoryId: null,
        trackerId: 0,
        subject: el.name,
        description: '',
        status: 0,
        responsibleTeams: [],
        progress: 0,
        startDate: '',
        dueDate: '',
        actualEndDate: '',
        actualStartDate: '',
        type: 0,
        dailyReview: false,
        parentProgress: 0,
        expectedStartDate: '',
        expectedEndDate: '',
        isCategory: true,
        workdays: 0,
        EstimatedAmount: 0,
        salaryDetermination: 0,
      } as SetupInitialProgressDTO;
        results.push(dataCategory);
    });
    PublicPageIssues?.forEach((item: any) => {
      // let status = Utils.getStatus(item.status);
      // if (+item.progress === 100) status = Utils.getStatus(sMilestone.Complete);
      let status = Utils.getStatus(item.status);
      if (+item.progress === 100) status = Utils.getStatus(sMilestone.Complete);
      const datamap : SetupInitialProgressDTO = {
        ...item,
        status: Utils.getStatus(item.status),
        workdays: getWorkDays(item),
      }
      results.push(datamap);
    })
    const DataToTree = mapDataToTree(results)
    removeChildrenIfEmpty(DataToTree.filter((item: any) => item.isCategory));
    sortDataFlowFloor(DataToTree);

    sortAllTreeItems(DataToTree);

    return DataToTree;
  }

  const getWorkDays = (item: any) => {
    const target = getTarget(item?.issueTargets);
    const deliveredQuantity = target.planValue ? parseFloat(target.planValue) : 0; // add
    const unitPrice = +target.costPerValue ? +target.costPerValue : 0; // add
    if (!item.attributes) {
      console.error("Invalid item attributes.");
      return 0;
    }
    const totalAmount = deliveredQuantity * unitPrice;
    const salaryDetermination = item ? Utils.getAttributeData(item.attributes, eAttribute.Dinh_Muc_Luong) : 0; // định mực lương
    if (!salaryDetermination || isNaN(salaryDetermination) || salaryDetermination <= 0) {
      return 0;
    }
    return TinhSoCong(totalAmount, salaryDetermination, item);
  };

  // [31/10/2024][#20441][phuong_td] Tính Sô Công issue
  const TinhSoCong = (totalAmount: number, salaryDetermination: number, item?: IssuesResponse): number => {
    return item?.type === eNatureOfTheJob.UnexpectedWork ? Utils.getAttributeData(item.attributes, eAttribute.So_Cong) : totalAmount / salaryDetermination // add
  }

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

  const getTarget = (issueTargets: IssueTargetDTO[] | undefined): TargetIssue => {
    if (!issueTargets || !issueTargets.length)
      return {
        issueId: 0,
        targetId: null,
        planValue: '0',
        actualValue: '0',
        costPerValue: 0,
        targetDim: null,
      };
    const { length } = issueTargets;
    return issueTargets[length - 1];
  };


  function removeChildrenIfEmpty(data: any[]): any[] {
    return data.map((item: any) => {
        if (item.children && item.children.length > 0) {
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
    const root: SetupInitialProgressDTO[] = [];
    // const categorys = categorys

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

  const editIssue = (issue: any, isEdit: boolean) => {
    const trackerIdLapTienDoBanDau = 22;
    if(!isEdit) {
      dispatch(issueActions.setEditIssuePublics(true))
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateInitWorkModalName }));
    } else {
      if (issue.id) {
        dispatch(
          issueActions.getIssueByParentIdRequest({
            parentId: issue.id,
            params: {
              trackerId: trackerIdLapTienDoBanDau,
              pageSize: 10000,
              page: 1,
              paging: false,
            },
          }),
        );
        dispatch(issueActions.getFileAttachmenForIssue({issueId: issue.id}));
        dispatch(teamActions.getTeamsRequest({ projectId: issue.projectId, queryParams: {} }));
      }
      dispatch(issueActions.setEditIssuePublics(false))
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateInitWorkModalName }));
    }
};


  const confirmRemoveIssue = (issue: IssuesResponse, listRecord: any) => {
    let issueId: any[] = []
    if (listRecord) {
      issueId = listRecord.length > 0 && countRows.length > 0 
      ? listRecord.filter((r:any) => r !== undefined).map((item: any) => item.id) 
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
    } 
  };

  const handleIssueTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...params, page: current, pageSize };
    if (selectedProject) {
      let trackerId = getTrackerID();
      dispatch(
        issueActions.getIssuesByMilestoneRequest({
          projectId: selectedProject.id,
          params: {
            ...params,
            search,
            tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
            pageSize: size,
            ascending,
            trackerId,
          },
        }),
      );
    }
  };
  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });


  const handleFilterValueTable = (value: any, data: any) => {
    let filteredData: SetupInitialProgressDTO[] = [];
    if ([Status.Approved, Status.Done, Status.Pending, Status.Processing].includes(+data.key)) {
     filteredData = filterTree(fullDataSet, +data.key);
     setIsFiltered(true);
     setFilteredData(filteredData);
 } else {
     filteredData = [...fullDataSet];  // Nếu không khớp giá trị nào, trả về toàn bộ dữ liệu
     setIsFiltered(false);
 }
}

const filterTree= (nodes: SetupInitialProgressDTO[], status: number) : SetupInitialProgressDTO[] => {
  return nodes.map((item: SetupInitialProgressDTO) => {
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
  }).filter(node => node !== null) as SetupInitialProgressDTO[]
}

  // rowSelection objects indicates the need for row selection
  const rowSelection: TableRowSelection<SetupInitialProgressDTO> = {
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


  const statusOptions = StatusHelperControl.statusOptions;

  const renderAvata = (name: string | undefined) => {
    if (name) {
      const assigneeName = name;
      return (
        <Tooltip title={assigneeName} key={Utils.generateRandomString(5)}>
          <Avatar
            size="small"
            onClick={() => console.log('')}
            style={{ backgroundColor: Utils.stringToColour(assigneeName), cursor: 'pointer', alignItems: 'center' }}
          >
            {assigneeName.charAt(0)}
          </Avatar>
        </Tooltip>
      );
    }
    return null;
  };

  const columns: any = [
    {
      title: t('ID'),
      dataIndex: 'id',
      key: 'id',
      width: 140,
      align: 'center',
      fixed: 'left',
      render: (value: any, record: any) => {
        if(record.isCategory) {
          return <span></span>
        } else {
          return <>{value}</>
        }
      } 
    },
    {
      title: t('Subject'),
      dataIndex: 'subject',
      key: 'subject',
      width: 360,
      fixed: 'left',
      render: (value: any, record: IssuesResponse) => (<></>),
    },
    {
      title: t('Start date Contract'),
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      width: 130,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('End date Contract'),
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 130,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    // [Implement #22096]
    {
      title: t('Actual Planned Start Date'), // t('Ngày bắt đầu KH - thực tế'),
      dataIndex: 'plannActualStartDate',
      key: 'plannActualStartDate',
      width: 140,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Actual Planned End Date'), // t('Ngày kết thúc KH - thực tế'),
      dataIndex: 'plannActualEndDate',
      key: 'plannActualEndDate',
      width: 140,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Actual start date'),// t('Ngày bắt đầu thực tế')
      dataIndex: 'actualStartDate',
      key: 'actualStartDate',
      width: 150,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('Actual end date'), // t('Ngày kết thúc thực tế'),
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: 140,
      align: 'center',
      render: (value: string) => (value ? dayjs(value).format(formatDateDisplay) : ''),
    },
    {
      title: t('team'),
      dataIndex: 'team',
      key: 'team',
      width: 150,
      align: 'center',
      render: (value: number[], record: any) => {
        if (record.isCategory) return;
        if (record.teamIds) {
          let teamIds = record.teamIds;
          return (
            <Avatar.Group
              size='small'
              shape='circle'
              style={{width: '100%', alignItems: 'center', display: 'flow'}}
            >
              {teamIds && teamIds.map((id: number) => {
                const team = teams.find(t1 => t1.id === id);
                return renderAvata(team?.name);
              })}
            </Avatar.Group>
          );
        }
        return (
          <Avatar
            icon={<UserAddOutlined />}
            size="small"
            onClick={() => console.log('')}
            style={{ backgroundColor: '#87d068', cursor: 'pointer' }}
          />
        );
      },
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      width: 180,
      align: 'center',
      render: (value: number, record: any) => {
        if(record.isCategory) return;

        if (record.actualEndDate) {
          const completeOption = statusOptions.find(
            (option: any) => option.code === sMilestone.Complete || option.value === sMilestone.Complete
          );
          return (
            <Select
              className={styles.customSelect}
              defaultValue={completeOption?.label || ''}
              disabled
            >
              <Option key={completeOption?.value} value={completeOption?.label}>
                <Tag
                  color={completeOption?.color}
                  className={styles.customTag}
                  style={{
                    width: '139px',
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '12px',
                  }}
                >
                  {completeOption?.label}
                </Tag>
              </Option>
            </Select>
          );
        }

        const selectedOption = statusOptions.find((option: any) => option.value === +value || option.code === value);
        const filteredStatusOptions = statusOptions.filter(option => option.code !== sMilestone.Complete);
        return <>
          <Select
            className={styles.customSelect}
            defaultValue={selectedOption?.label || null}
            onChange={(value) => handleStatusChange(value, record, false)}
          >
            {filteredStatusOptions.map(option => (
              <Option 
                key={option.value} 
                value={option.label}
                disabled={ +value === 0 || option.code === sMilestone.Complete}
              >
                <Tag color={option.color} className={styles.customTag} 
                   style={{
                    width: '139px',
                    height: '100%',
                    textAlign: "center",
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '12px'
                  }}
                   >
                  {option.label}
                </Tag>
              </Option>
            ))}
          </Select>
        </>
      },
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: any) => {
        if (record.isCategory) return;
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return (
          <Space>
            <Tooltip title={t('Edit')}>
              <Button
                icon={<EditOutlined style={{ color: colors.primary }} />}
                type="text"
                size="small"
                onClick={() => editIssue(record, true)}
                disabled={!editIssueGranted}
              />
            </Tooltip>
            <Tooltip title={t('Remove')}>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                type="text"
                onClick={() => confirmRemoveIssue(record, null)}
                disabled={!deleteIssueGranted}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  


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

  const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0 , record: []});
  const countRecord: SetupInitialProgressDTO[] = [];
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
          setPopup((prevState) => ({ ...prevState, visible: false }));
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


  const statusOptionsTable = StatusHelperControl.statusOptionFilter;
  const dataSource = isFiltered ? filteredData : dataInita;

  // [implement #21907]
  const sortIssuesByPlannedStartDate = (issues: SetupInitialProgressDTO[]) => {
    return [...issues].sort((a, b) => {
      if (a.plannedStartDate && b.plannedStartDate) {
        return new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime();
      }
      
      if (a.plannedStartDate && !b.plannedStartDate) {
        return -1;
      }
      
      if (!a.plannedStartDate && b.plannedStartDate) {
        return 1;
      }
      
      return 0;
    });
  }

  const sortAllTreeItems = (items: SetupInitialProgressDTO[]) => {
    items.forEach(category => {
      if (category.children && category.children.length > 0) {
        category.children = sortIssuesByPlannedStartDate(category.children);
        
        if (String(category.id) === "Phan_Hoan_Thien") {
          category.children.forEach(subCategory => {
            if (subCategory.children && subCategory.children.length > 0) {
              if (["Xay_Tuong", "Trat_Tuong_Trong", "Trat_Tuong_Ngoai", "Op_Lat_Tuong_Nen"].includes(String(subCategory.id))) {
                subCategory.children = sortIssuesByPlannedStartDate(subCategory.children);
              }
            }
          });
        }
        
        category.children.forEach(child => {
          if (child.children && child.children.length > 0) {
            child.children = sortIssuesByPlannedStartDate(child.children);
          }
        });
      }
    });
  }

  return (
    <section className='Public__wrapper'>
      {issueModal && <CreateUpdateIssue isCreate={true} isUpdate={true} />}
      <PublicHeader />
      <div className={styles.wrapperPublicPage}>
        {PublicPageIssues && PublicPageIssues.results && PublicPageIssues.results.length === 0 && (
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
        {view === 'List' && PublicPageIssues && PublicPageIssues.results && PublicPageIssues.results.length > 0 && (
          <> 
            {isLoading ? <Loading/> :
            <div style={{ padding: 5 }} className={styles.wrappertable}>
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
                className='publicPageCustom'
                rowKey={record => record.id}
                size="small"
                rowHoverable={false}
                style={{ width: '100%', height: '75vh' }}
                columns={columns}
                rowSelection={{ ...rowSelection, checkStrictly }}
                onChange={handleIssueTableChange}
                dataSource={[...dataSource!]}
                pagination={false}
                // pagination={{
                //   current: params?.page || defaultPagingParams.page,
                //   pageSize: params?.pageSize || defaultPagingParams.pageSize,
                //   total: PublicPageIssues?.queryCount || 0,
                //   responsive: true,
                //   showTotal,
                //   showSizeChanger: true,
                // }}
                loading={isLoading || isRemoving || isSaving || loading || isLoadingUpdateStatus || isLoadingGenIssue}
                scroll={{ x: 1000, y: windowSize[1] - 310 }}
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
                countRows={countRows} 
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
        {view === 'Gantt' && PublicPageIssues && PublicPageIssues.results && PublicPageIssues.results.length > 0 && (
          <Gantt infoParentComponent={infoParentComponent}/>
        )}
      </div>
      </section>
  );
};