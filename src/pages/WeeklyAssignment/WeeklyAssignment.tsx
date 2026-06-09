/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import {
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  MenuProps,
  PaginationProps,
  Space,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { colors } from '@/common/colors';
import {
  CategoryDTO,
  ControlAssignWorkModalName,
  ControlStatusPreparationModalName,
  CreateUpdateInitWorkModalName,
  CreateUpdateWorkWeeklyModalName,
  eAttribute,
  eCategoryNumber,
  eCategoryString,
  eNatureOfTheJob,
  eTrackerCode,
  formatDateDisplay,
  GettingIssueList,
  largePagingParams,
  RemovingIssue,
  sMilestone,
  targetType
} from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { usePermission, useWindowSize } from '@/hooks';
import {
  CheckItemsDTO,
  IssuesPagingResponse,
  IssuesResponse,
  IssueTargetDTO,
  StatusHelperControl,
  TargetIssue,
  WeeklyAssignmentDTO
} from '@/services/IssueService';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getCategorys,
  getCheckItemIds,
  getChecklistsTeams,
  getDateFilter,
  getIssueByVersion,
  getIssueChecklist,
  getIssueIds,
  getIssueQueryParams,
  getSelectedIssue,
  getSelectedWorkWeekly,
  getTagsVersion,
  getTracker,
  issueActions,
} from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getModalVisible, showModal } from '@/store/modal';
import { getEmployeesByCompanyId, getSelectedProject, projectActions } from '@/store/project';
import { getTeams, teamActions } from '@/store/team';
import { RootState } from '@/store/types';
import Utils from '@/utils';
import { CreateUpdateIssue } from '../PublicPage/CreateUpdateIssue';
import { AssignWorkDialog } from './AssignWorkDialog';
import { ControlStatusPreparation } from './ControlStatusPreparation/ControlStatusPreparation';
import { CreateUpdateWorkWeekly } from './ControlStatusPreparation/CreateUpdateWorkWeekly';
import styles from './WeeklyAssignment.module.less';
import { WeeklyAssignmentHeader } from './WeeklyAssignmentHeader';

interface iTotal {
  totalDeliveredQuantity: number;
  totalAmount: number;
  totalNumberOfWorkDays: number;
  totalNumberOfRemainingWorkDays: number;
}

enum eTypeDate {
  plannedStartDate = 'plannedStartDate',
  plannedEndDate = 'plannedEndDate',
  actualEndDate = 'actualEndDate',
  actualStartDate = 'actualStartDate',
}

enum eColorStatus {
  NotAssigned = '#777777',
  Assigned = '#00ff00',
  BehindSchedule = '#ff0000',
  OverSchedule = '#14AEEA',
  Unexpected = '#ffff00',
}

export const WeeklyAssignment = () => {
  const { t } = useTranslation('weeklyAssignment');
  const tCommon = useTranslation('common').t;
  const tCategory = useTranslation('category').t;
  const tPublic = useTranslation('publics').t;

  const windowSize = useWindowSize();

  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const issueChecklist = useAppSelector(getIssueChecklist() || undefined);
  const checkItemIds = useAppSelector(getCheckItemIds() || undefined);
  const checklistsTeams = useAppSelector(getChecklistsTeams() || undefined);

  const ids = useAppSelector(getIssueIds() || []);

  // const view = useAppSelector(getIssuesView());
  const view = 'List';
  const weeklyTasksIssues = useAppSelector(getIssueByVersion());

  // const [weeklyTasks, setWeeklyTasks] = useState();
  // const [weeklyTasks, setWeeklyTasks] = useState(Utils.clone(fakedata));
  const [dataTable, setDataTable] = useState<WeeklyAssignmentDTO[]>();
  const mapChildren = new Map<number, WeeklyAssignmentDTO[]>();

  const ControlStatusPreparationModal = useAppSelector(getModalVisible(ControlStatusPreparationModalName));
  const CreateUpdateWorkWeeklyModal = useAppSelector(getModalVisible(CreateUpdateWorkWeeklyModalName));
  const CreateUpdateInitWorkModal = useAppSelector(getModalVisible(CreateUpdateInitWorkModalName));
  const ControlAssignWorkModal = useAppSelector(getModalVisible(ControlAssignWorkModalName));
  const params = useAppSelector(getIssueQueryParams());
  const categorys = useAppSelector(getCategorys());
  const dateFilter = useAppSelector(getDateFilter());
  const tags = useAppSelector(getTagsVersion());
  const isLoading = useAppSelector(getLoading(GettingIssueList));
  const isRemoving = useAppSelector(getLoading(RemovingIssue));
  const company = useAppSelector(getCurrentCompany());
  const teams = useAppSelector(getTeams());
  const employees = useAppSelector(getEmployeesByCompanyId());
  const SelectedIssue = useAppSelector(getSelectedIssue());
  const [total, setTotal] = useState<iTotal>({
    totalDeliveredQuantity: 0,
    totalAmount: 0,
    totalNumberOfWorkDays: 0,
    totalNumberOfRemainingWorkDays: 0,
  });
  const [isCreate, setIsCreate] = useState<boolean>(true);
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
  };

  const addPreparationGranted = usePermission(['GiaoViecHangTuan.Create']);
  const assignIssueGranted = usePermission(['GiaoViecHangTuan.Assign']);

  const [sortOrder, setSortOrder] = useState<'descend' | 'ascend' | undefined>('ascend');

  const selectedWorkWeekly = useAppSelector(getSelectedWorkWeekly());
  // let deletePr = false;
  const size = 10000;
  const ascending = true;

  //#region CreateWeeklyAssignmentAsCategory
  const CreateWeeklyAssignmentAsCategory = (category: CategoryDTO) => {
    const categoryOfItem = CreateWeeklyAssignment();
    categoryOfItem.subject = tCategory(category.code);
    categoryOfItem.isCategory = true;
    categoryOfItem.id = category.id;
    categoryOfItem.isCategory = true;
    categoryOfItem.totalAmount = 0;
    categoryOfItem.deliveredQuantity = 0;

    categoryOfItem.workdays = 0;
    categoryOfItem.material = '';
    categoryOfItem.unitPrice = 0;
    categoryOfItem.salaryDetermination = 0;
    return categoryOfItem;
  };

  // [31/10/2024][#20441][phuong_td] Tính Sô Công issue
  const TinhSoCong = (totalAmount: number, salaryDetermination: number, item?: IssuesResponse): number => {
    return item?.type === eNatureOfTheJob.UnexpectedWork ? Utils.getAttributeData(item.attributes, eAttribute.So_Cong) : totalAmount / salaryDetermination // add
  }

  //#region CreateWeeklyAssignment
  const CreateWeeklyAssignment = (item?: IssuesResponse): WeeklyAssignmentDTO => {
    const _item = item as any;
    const target = getTarget(item?.issueTargets);
    const deliveredQuantity = target.planValue ? parseFloat(target.planValue) : 0; // add
    const unitPrice = +target.costPerValue ? +target.costPerValue : 0; // add
    const totalAmount = deliveredQuantity * unitPrice;
    const salaryDetermination = item ? Utils.getAttributeData(item.attributes, eAttribute.Dinh_Muc_Luong) : 0; // add

    return {
      ...item,
      teamIds: item ? item.teamIds : [],
      id: item ? item.id : 0,
      parentId: item ? item.parentId : null,
      projectId: item ? item.projectId : 0,
      workPackageId: item ? item.workPackageId : 0,
      areaId: item ? item.areaId : 0,
      categoryId: item ? item.categoryId : null,
      trackerId: item ? item.trackerId : 20,
      subject: item ? item.subject : '',
      assignedTo: item ? item.assignedTo : null,
      notes: item ? item.notes : '',
      description: item ? item.description : '',
      status: item ? item.status : '',
      progress: item ? item.progress : 0,
      startDate: item ? item.startDate : '',
      dueDate: item ? item.dueDate : '',
      plannedEndDate: item ? item.plannedEndDate : '',
      plannedStartDate: item ? item.plannedStartDate : '',
      actualEndDate: item ? item.actualEndDate : '',
      actualStartDate: item ? item.actualStartDate : '',
      attachmentLinks: item ? item.attachmentLinks : [],
      attributes: item ? item.attributes : [],
      responsibleTeams: [],
      issue_CheckItems: item ? item.issue_CheckItems : [],
      type: item?.type,
      issueOtherQuotaDTOs: item?.issueOtherQuotaDTOs ? item.issueOtherQuotaDTOs : [],
      issueLaborQuotas: item?.issueLaborQuotas ? item.issueLaborQuotas : [],
      issueMaterialsQuotas: item?.issueMaterialsQuotas ? item.issueMaterialsQuotas : [],
      issueTargets: item ? item.issueTargets : [],
      unit: target.targetDim?.unitVolume ? target.targetDim?.unitVolume : '', // add 'r.unit'
      material: target.targetDim?.unitCategory ? target.targetDim?.unitCategory : '', // add
      deliveredQuantity,
      unitPrice: unitPrice,
      totalAmount,
      salaryDetermination, // add
      workdays: TinhSoCong(totalAmount, salaryDetermination, item),
      remainingwork: 0,
      children: null,
      tagVersionId: item && item.tagVersionId ? item.tagVersionId : null,
      level: 0,
    };
  };

  // const getWorkDays = (issueOtherQuotaDTOs: issueOtherResourceQuotas[] | undefined) => {
  //   if (!issueOtherQuotaDTOs) return 0;
  //   const resource = issueOtherQuotaDTOs.find(r => r.name === eOrderResourceName.NhanCong);
  //   if (resource) {
  //     const r = parseFloat(resource.requiredQuantity);
  //     return Number.isNaN(r) ? 0 : r;
  //   }
  //   return 0;
  // };

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

  //#region checklistsTeams
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistsTeams]);

  //#region selectedProject
  useEffect(() => {
    if (!selectedProject) {
      dispatch(issueActions.setIssueByVersion(undefined));
      dispatch(projectActions.setProjectMembers(undefined));
      return;
    } else {
      dispatch(teamActions.getTeamsRequest({ projectId: selectedProject.id, queryParams: {} }));
      dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    }
    dispatch(
      issueActions.getCategoryByCompanyIdRequest({
        companyId: company.id,
        tagVersionCode: sMilestone.SetupInitialProgress,
      }),
    );
    dispatch(
      projectActions.getProjectMembersRequest({
        projectId: selectedProject.id,
        queryParams: { ...largePagingParams },
      }),
    );
    // console.log('trackers ', trackers);

    // dispatch(
    //   issueActions.getOtherResourcesDimByTracker({
    //     tracker: 1
    //   }),
    // );
    // dispatch(issueActions.getCategoryRequest({
    //   categoryId: eCategoryString.BodyPart
    // }))
    // eslint-disable-next-line
  }, [selectedProject]);

  useEffect(() => {
    if (trackers && trackers.length) {
      const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
      tracker &&
        dispatch(
          issueActions.getTargetByConditionRequest({ projectId: -1, trackerId: tracker.id, type: targetType.Category }),
        );
    }
  }, [trackers]);

  //#region tags
  useEffect(() => {
    let startDate = dayjs().startOf('week');
    let endDate = dayjs().endOf('week');
    if (dateFilter) {
      startDate = dateFilter.startDate;
      endDate = dateFilter.endDate;
    }

    if (selectedProject) {
      let trackerId = getTrackerID();
      dispatch(
        issueActions.getIssuesByMilestoneRequest({
          projectId: selectedProject.id,
          params: {
            ...params,
            pageSize: size,
            page: 1,
            search: undefined,
            tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
            trackerId,
            // startDate: startDate.format(FormatDateAPI),
            // endDate: endDate.format(FormatDateAPI),
            // status: sMilestone.Processing
          },
        }),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags, dateFilter]);

  // #region ids
  useEffect(() => {
    if (ids) {
      dispatch(
        issueActions.getIssueChecklistByIssueIdsRequest({
          ids,
          tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
          showNotice: false,
          pageSize: size,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ids]);

  // #region ids
  useEffect(() => {
    dispatch(issueActions.getIssueChecklistsTeamByCheckitemIds({ ids: checkItemIds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, checkItemIds]);

  // #region weeklyTasksIssues
  useEffect(() => {
    //#region Mapdata
    // console.log(weeklyTasksIssues);

    const MapData = (data: IssuesPagingResponse, ids: number[]) => {
      const mapWithCategory: Map<eCategoryNumber | eCategoryString, WeeklyAssignmentDTO[]> = new Map<
        eCategoryNumber | eCategoryString,
        WeeklyAssignmentDTO[]
      >();
      const checkStatusNotAllow = (status: any) => {
        if (status === null || status === undefined) {
          return false;
        }
        const code = StatusHelperControl.getCodeByValue(status.toString());
        const checkCode = code ? code !== sMilestone.WaitingForApproval : false;
        return status !== sMilestone.WaitingForApproval || checkCode;
      };

      const checkStatusAllows = (status: any, statusAllow: string[]) => {
        if (status === null || status === undefined) {
          return false;
        }
        const code = StatusHelperControl.getCodeByValue(status.toString());
        const checkCode = code ? statusAllow.includes(code) : false;
        return status === statusAllow || checkCode;
      };

      //#region checkDateIsBetween/ checkDateAndStatus
      const checkDateIsBetweenAndStatus = (
        startDate: string | null,
        start: Dayjs,
        end: Dayjs,
        status: any,
      ): boolean => {
        if (!start || !end) return true;
        const checkStart = dayjs(startDate);
        const startD = dayjs(start);
        const endD = dayjs(end);
        const dk1 = (checkStart.isAfter(startD) && checkStart.isBefore(endD)) || checkStart.isSame(startD);
        const checkstt = checkStatusNotAllow(status);
        return dk1 && checkstt;
      };

      const checkDateBeforCurrentWeekAndStatus = (startDate: string | null, start: Dayjs, status: any): boolean => {
        const checkStart = dayjs(startDate);

        const dk1 = checkStart.isBefore(start);
        const dk3 = checkStatusAllows(status, [sMilestone.Approved, sMilestone.Processing, sMilestone.Pause]);

        return dk1 && dk3;
      };

      const checkDateAndStatus = (record: IssuesResponse) => {
        let start = dayjs().startOf('week');
        let end = dayjs().endOf('week');
        if (dateFilter) {
          start = dateFilter.startDate;
          end = dateFilter.endDate;
        }
        const { status, plannedStartDate, plannActualStartDate } = record;
        const startDateToCheck = plannActualStartDate ? plannActualStartDate : plannedStartDate;
        const check1 = checkDateIsBetweenAndStatus(startDateToCheck, start, end, status);
        let check2 = false;
        if (
          status !== sMilestone.WaitingForApproval &&
          status !== sMilestone.Complete &&
          dayjs(startDateToCheck).isBefore(start)
        ) {
          check2 = true;
        }
        return check1 || check2;
      };

      mapChildren.clear();
      if (data && data.results) {
        const { results } = data;
        for (let i = 0; i < results.length; i++) {
          const r: IssuesResponse = results[i];
          if (r.id === SelectedIssue?.id) {
            dispatch(issueActions.setSelectedIssue(r));
          }
          if (!checkDateAndStatus(r)) {
            continue;
          }
          // console.log(r.subject, 'issueTargets ', r.issueTargets);
          // console.log(r.subject, 'Resource', r.issueOtherQuotaDTOs);

          ids.push(r.id);
          const data = CreateWeeklyAssignment(r);
          data.isTask = true;
          data.isComplete = true;
          if (r.parentId === null) {
            // không có parrent thì filter theo Danh mục
            const category = categorys?.find(c => c.id === r.categoryId);
            if (category && category.parentCode) {
              // nếu là con của một danh mục khác
              const parrentCategoryId = Utils.getCategoryId(category?.parentCode, categorys);
              let parentCategoryItems = mapWithCategory.get(parrentCategoryId); // lấy danh mục cha
              if (!parentCategoryItems) {
                // nếu chưa có danh mục cha thì tạo danh mục cha
                parentCategoryItems = [];
                mapWithCategory.set(parrentCategoryId, parentCategoryItems);
              }
              if (parentCategoryItems) {
                // nếu có danh mục cha
                let categoryItem = parentCategoryItems.find(c => c.id === r.categoryId); // tìm danh mục gốc
                if (categoryItem) {
                  // nếu có thì đưa data vào
                  const { children } = categoryItem;
                  if (children) {
                    children.push(data);
                  } else {
                    categoryItem.children = [data];
                  }
                } else {
                  // nếu không thì tạo một item danh mục rồi đưa data vào
                  const categoryOfItem = CreateWeeklyAssignmentAsCategory(category);
                  categoryOfItem.children = [data];
                  // result.push(newItem);
                  // Tìm vị trí chèn phù hợp
                  let insertIndex = parentCategoryItems.findIndex(item => item.id > categoryOfItem.id);

                  // Nếu không tìm thấy vị trí phù hợp (tức là phần tử mới có id lớn nhất), chèn vào cuối mảng
                  if (insertIndex === -1) {
                    parentCategoryItems.push(categoryOfItem);
                  } else {
                    parentCategoryItems.splice(insertIndex, 0, categoryOfItem);
                  }
                }
              }
            } else {
              let categoryItems = mapWithCategory.get(r.categoryId);
              if (categoryItems) {
                categoryItems.push(data);
              } else {
                mapWithCategory.set(r.categoryId, [data]);
              }
            }
          }
          if (r.parentId && r.parentId !== r.id) {
            // Có parrent và id parrent khác id của item thì đưa vào map để filter theo parrent
            const mapData = mapChildren.get(r.parentId);
            if (mapData) {
              mapData.push(data);
            } else {
              mapChildren.set(r.parentId, [data]);
            }
          }
        }
      }
      return mapWithCategory;
    };

    const checkNumber = (num: any) => {
      if (num === Infinity || isNaN(num) || typeof num !== 'number') return false;
      return true;
    };

    const total = (total: iTotal, item: WeeklyAssignmentDTO) => {
      if (item) {

        let remainingwork;
        const remainingValue = item?.attributes?.find(attr => attr.code === 'So_Cong_Con_Lai')?.value;
        if (remainingValue) {
          remainingwork = Number(remainingValue);
        } else {
          const workdays = item.workdays || 0;
          const TotalLaborCountAchieved =
            totalVolumeAchievedData.find(entry => entry.issueId === item.id)?.totalLaborCountAchieved || 0;
          remainingwork = workdays - TotalLaborCountAchieved;
        }
        const { deliveredQuantity, totalAmount, workdays } = item;
        if (deliveredQuantity && checkNumber(deliveredQuantity)) total.totalDeliveredQuantity += deliveredQuantity;
        if (totalAmount && checkNumber(totalAmount)) total.totalAmount += totalAmount;
        if (workdays && checkNumber(workdays)) total.totalNumberOfWorkDays += workdays;
        if (remainingwork && checkNumber(remainingwork)) total.totalNumberOfRemainingWorkDays += remainingwork;
      }
      return total;
    };

    //#region createTree
    const createTree = (
      item: WeeklyAssignmentDTO,
      map: Map<number, WeeklyAssignmentDTO[]>,
      subtotal: iTotal,
      level: number = 0,
    ) => {
      const { id } = item;
      if (!item.isCategory) {
        // nếu item không phải danh mục thì cộng dồn vào
        subtotal = total(subtotal, item);
      }
      const children = typeof id === 'number' ? map.get(id) : null; // lấy các nút con
      item.children = children;
      item.level = level;
      if (children && children.length > 0) {
        // nếu tồn tại thì lặp qua từng con
        level += 1;
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          createTree(c, map, subtotal, level);
        }
      }
    };
    // console.log('weeklyTasksIssues ', weeklyTasksIssues);

    if (weeklyTasksIssues && weeklyTasksIssues.results.length) {
      const ids: number[] = [];
      const dataRemap = MapData(weeklyTasksIssues, ids);
      // console.log('dataRemap ', dataRemap);

      const result: WeeklyAssignmentDTO[] = [];
      //#region Tạo danh mục
      dataRemap &&
        dataRemap.forEach((values, key) => {
          // Category
          if (key) {
            // const item = CreateWeeklyAssignment(); // Tạo Dòng Danh Mục

            const category = categorys?.find(c => c.id === key);

            if (category) {
              let newItem: WeeklyAssignmentDTO = CreateWeeklyAssignmentAsCategory(category);
              // result.push(newItem);
              // Tìm vị trí chèn phù hợp
              let insertIndex = result.findIndex(item => item.id > newItem.id);

              // Nếu không tìm thấy vị trí phù hợp (tức là phần tử mới có id lớn nhất), chèn vào cuối mảng
              if (insertIndex === -1) {
                result.push(newItem);
              } else {
                result.splice(insertIndex, 0, newItem);
              }
              values.forEach((value, index, array) => {
                // Duyệt các giá trị của Danh mục
                if (!value.isCategory) {
                  value.isTask = true; // thêm con Cho Danh mục
                }
                if (newItem.children) {
                  newItem.children.push(value);
                } else {
                  newItem.children = [value];
                }
              });
            }
          }
        });
      const totalTemp: iTotal = {
        totalDeliveredQuantity: 0,
        totalAmount: 0,
        totalNumberOfWorkDays: 0,
        totalNumberOfRemainingWorkDays: 0
      };
      let level: number = 0;
      result.forEach(item => {
        let subtotal = {
          totalDeliveredQuantity: 0,
          totalAmount: 0,
          totalNumberOfWorkDays: 0,
          totalNumberOfRemainingWorkDays: 0
        };
        level += 1;
        //#region duyệt danh mục Tạo cây
        item.children?.forEach(c => {
          if (c.isCategory) {
            let subtotal_lv1 = {
              totalDeliveredQuantity: 0,
              totalAmount: 0,
              totalNumberOfWorkDays: 0,
              totalNumberOfRemainingWorkDays: 0
            };
            c.children?.forEach(d => {
              if (!d.isSummery) {
                createTree(d, mapChildren, subtotal_lv1, level);
              }
            });
            let subSummary = CreateWeeklyAssignment();
            //#region Tạo Summary
            subSummary.id = c.id;
            subSummary.subject = t('Total');
            subSummary.isSummery = true;
            subSummary.deliveredQuantity = subtotal_lv1.totalDeliveredQuantity;
            subSummary.totalAmount = subtotal_lv1.totalAmount;
            subSummary.workdays = subtotal_lv1.totalNumberOfWorkDays;
            subSummary.remainingwork = subtotal_lv1.totalNumberOfRemainingWorkDays;
            console.log(subSummary);
            // Cộng dồn cho nút cha
            if (subtotal_lv1) {

              const { totalAmount, totalDeliveredQuantity, totalNumberOfWorkDays, totalNumberOfRemainingWorkDays } = subtotal_lv1;
              if (totalAmount && checkNumber(totalAmount)) subtotal.totalAmount += totalAmount;
              if (totalDeliveredQuantity && checkNumber(totalDeliveredQuantity))
                subtotal.totalDeliveredQuantity += totalDeliveredQuantity;
              if (totalNumberOfWorkDays && checkNumber(totalNumberOfWorkDays))
                subtotal.totalNumberOfWorkDays += totalNumberOfWorkDays;
              if (totalNumberOfRemainingWorkDays && checkNumber(totalNumberOfRemainingWorkDays))
                subtotal.totalNumberOfRemainingWorkDays += totalNumberOfRemainingWorkDays;
            }

            c.children?.push(subSummary);
          } else {
            createTree(c, mapChildren, subtotal, level);
          }
        });
        //#region Tạo Summary
        const summary = CreateWeeklyAssignment();
        summary.id = item.id;
        summary.subject = t('Total');
        summary.isSummery = true;
        summary.deliveredQuantity = subtotal.totalDeliveredQuantity;
        summary.totalAmount = subtotal.totalAmount;
        summary.workdays = subtotal.totalNumberOfWorkDays;
        summary.remainingwork = subtotal.totalNumberOfRemainingWorkDays;

        // Cộng dồn tất cả các nút
        totalTemp.totalAmount += subtotal.totalAmount;
        totalTemp.totalDeliveredQuantity += subtotal.totalDeliveredQuantity;
        totalTemp.totalNumberOfWorkDays += subtotal.totalNumberOfWorkDays;
        totalTemp.totalNumberOfRemainingWorkDays += subtotal.totalNumberOfRemainingWorkDays;
        item.children?.push(summary);
      });
      setTotal(totalTemp);
      console.log(result);
      setDataTable(result);
      dispatch(issueActions.setIssueIds(ids));
    } else {
      setDataTable([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, t, weeklyTasksIssues, dateFilter]);

  const checkComplete = (id: any, checkList: Map<number, CheckItemsDTO[]> | undefined) => {
    if (typeof id === 'number' && checkList) {
      const checkItems = checkList.get(id);
      if (checkItems) {
        for (let i = 0; i < checkItems.length; i++) {
          const checkItem = checkItems[i];
          if (checkItem.status === 0) return false;
        }
      }
    }
    return true;
  };

  /**
   * 16/10/2024
   * phuong_td
   * #20439
   * Add color and tooltip to show the status of Issue
   */
  const renderDot = (issue: WeeklyAssignmentDTO) => {
    let color = '';
    let title = '';
    if (issue.type === eNatureOfTheJob.UnexpectedWork) {
      color = eColorStatus.Unexpected;
      title = tCommon('Unexpected');
    }
    if (
      dayjs(issue.actualEndDate).isBefore(dayjs(issue.plannedEndDate), 'date') &&
      issue.progress === 100 &&
      color === ''
    ) {
      color = eColorStatus.OverSchedule;
      title = tCommon('Over Schedule');
    }
    if (dayjs(issue.plannedEndDate).isBefore(dayjs(), 'date') && color === '') {
      color = eColorStatus.BehindSchedule;
      title = tCommon('Behind Schedule');
    }
    if (color === '') {
      color =
        issue.issueOtherQuotaDTOs?.length || issue.issueTargets?.length
          ? eColorStatus.Assigned
          : eColorStatus.NotAssigned;
      switch (color) {
        case eColorStatus.Assigned:
          title = tCommon('Assigned');
          break;
        case eColorStatus.NotAssigned:
          title = tCommon('Not Assigned');
          break;
      }
    }
    return (
      <Tooltip title={title}>
        <Typography.Text
          style={{
            color,
            fontSize: '40px',
          }}
        >{`\u2022`}</Typography.Text>
      </Tooltip>
    );
  };

  function renderNameColumn(text: any, record: WeeklyAssignmentDTO) {
    const level = record.level ? record.level : 0;
    let l = 0;
    for (let i = 0; i < level; i++) {
      l += 24;
    }
    if (record.isSummery || record.isCategory) {
      return (
        <Space>
          <Typography.Text style={{ fontWeight: 'bold' }}>{`${text}`}</Typography.Text>
        </Space>
      );
    }
    const containerStyle = {
      display: 'flex',
      maxWidth: 345 - l,
      // border: '1px solid #ccc',
      // padding: '10px',
      // borderRadius: '5px',
    };

    const textStyle: any = {
      flex: '1 1 auto',
      maxWidth: 320 - l,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    const buttonContainerStyle: any = {
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      // marginLeft: '5px',
    };

    return (
      <Space
        style={{
          width: '100%',
          // paddingLeft: record.children?.length ? 0 : 21 * level,
        }}
      >
        {record.isTask && renderDot(record)}
        <Space>
          <Tooltip title={`${text}`}>
            <Typography.Text>{`${text}`}</Typography.Text>
          </Tooltip>
        </Space>
        <Space style={buttonContainerStyle} id="container-button">
          {record.isTask ? (
            <Space>
              <WithPermission policyKeys={['GiaoViecHangTuan.Edit']} strategy='disable'>
                <Button
                  type={'default'}
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setIsCreate(false);
                    ShowCreateUpdateWorkInit(record, false);
                  }}
                />
              </WithPermission>
              <WithPermission policyKeys={['GiaoViecHangTuan.Create']} strategy='disable'>
                <Button
                  type={'default'}
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => {
                    setIsCreate(true);
                    ShowCreateUpdateWorkInit({ id: record.id, categoryId: record.categoryId }, true);
                  }}
                />
              </WithPermission>
            </Space>
          ) : (
            <></>
          )}
        </Space>
      </Space>
    );
  }

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

  const sort = (dateTpye: eTypeDate, a: WeeklyAssignmentDTO, b: WeeklyAssignmentDTO) => {
    if (a.isSummery && sortOrder === 'ascend') {
      return -1;
    }
    if (a.isCategory && sortOrder === 'ascend') {
      return 1;
    }
    let dayA = dayjs();
    let dayB = dayjs();

    switch (dateTpye) {
      case eTypeDate.plannedStartDate:
        dayA = dayjs(a.plannedStartDate);
        dayB = dayjs(b.plannedStartDate);
        break;
      case eTypeDate.plannedEndDate:
        dayA = dayjs(a.plannedEndDate);
        dayB = dayjs(b.plannedEndDate);
        break;
      case eTypeDate.actualStartDate:
        dayA = dayjs(a.actualStartDate);
        dayB = dayjs(b.actualStartDate);
        break;
      case eTypeDate.actualEndDate:
        dayA = dayjs(a.actualEndDate);
        dayB = dayjs(b.actualEndDate);
        break;
      default:
        break;
    }
    return dayA.isBefore(dayB) ? -1 : 1;
  };

  const handleIssueTableChange: TableProps<WeeklyAssignmentDTO>['onChange'] = (
    pagination,
    filters,
    sorter: any,
    extra,
  ) => {
    setSortOrder(sorter.order);
  };

  // Lấy dữ liệu `totalVolumeAchievedData` từ Redux store
  const totalVolumeAchievedData = useSelector((state: RootState) => state.issue.totalVolumeAchievedData);

  const fetchTotalVolume = () => {
    // Thiết lập ngày bắt đầu và kết thúc cho tuần hiện tại, nếu dateFilter không có thì sẽ lấy startdate và enddate
    let startDate = dayjs().startOf('week'); // Lấy ngày đầu tuần hiện tại
    let endDate = dayjs().endOf('week'); // Lấy ngày cuối tuần hiện tại

    // Nếu có dateFilter thì sử dụng ngày trong filter
    if (dateFilter) {
      startDate = dayjs(dateFilter.startDate);
      endDate = dayjs(dateFilter.endDate);
    }
    if (selectedProject) {
      // Nếu có project đã được chọn, dispatch action để lấy dữ liệu khối lượng
      dispatch(
        issueActions.getTotalVolumeRequest({
          projectId: selectedProject.id, // ID của project đã chọn
          options: {
            search: {
              ...params,
              startDate: startDate.format('YYYY-MM-DD'), // Định dạng ngày bắt đầu
              endDate: endDate.format('YYYY-MM-DD'), // Định dạng ngày kết thúc
            },
          },
        }),
      );
    }
  };

  useEffect(() => {
    fetchTotalVolume(); // Gọi hàm fetchTotalVolume mỗi khi component được render hoặc `dateFilter` thay đổi
  }, [dateFilter]); // Chạy lại mỗi khi `dateFilter` thay đổi

  //#region weeklyTasksColumns
  const weeklyTasksColumns: any[] = [
    {
      title: t('Work name'),
      dataIndex: 'subject',
      key: 'subject',
      fixed: 'left',
      width: 400,
      render: (value: any, record: WeeklyAssignmentDTO) => <></>,
    },
    {
      title: t('Preparation'), // Chuẩn bị
      dataIndex: 'preparation',
      key: 'prepare',
      width: 100,
      align: 'center',
      render: (value: any, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) {
          return <></>;
        }
        const { id } = record;
        return (
          <Tooltip title={t('Click for more details')}>
            <Button
              // type="primary"
              style={{
                background: !checkComplete(id, issueChecklist) ? '#ff0000' : colors.complete,
                color: '#fff',
              }}
              size={'small'}
              onClick={() => ShowControlStatusPreparation(record)}
              disabled={!addPreparationGranted}
            >
              {t('Prepare')}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: t('Team Leader'), // Tổ trưởng
      dataIndex: 'responsibleTeams',
      key: 'responsibleTeams',
      width: 150,
      render: (value: any, record: any) => {
        if (record.isCategory || record.isSummery) return;
        if (record.teamIds) {
          let teamIds = record.teamIds;
          return (
            <Avatar.Group size="small" shape="circle" style={{ width: '100%' }}>
              {teamIds &&
                teamIds.map((id: number) => {
                  const team = teams.find(t1 => t1.id === id);
                  let name = '';
                  const e = employees?.find(e => e.id === team?.leader_Id);

                  if (e) name = Utils.getFullName(e);
                  return renderAvata(name);
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
      title: t('Team Name'), // Tên tổ
      dataIndex: 'teamName',
      key: 'teamName',
      width: 100,
      render: (value: number[], record: WeeklyAssignmentDTO) => {
        if (record.isCategory || record.isSummery) return;
        if (record.teamIds) {
          let teamIds = record.teamIds;
          return (
            <Avatar.Group size="small" shape="circle" style={{ width: '100%' }}>
              {teamIds &&
                teamIds.map((id: number) => {
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
      title: t('Completion Percentage'), //%HT
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (value: number, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value !== undefined && value !== null ? <>{`${value}%`}</> : '';
      },
    },
    {
      title: t('Unit'), // DVT
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (value: number, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        // console.log('record.issue_OtherResourceQuotas ', record.issue_OtherResourceQuotas);
        return value !== undefined && value !== null ? <>{`${value}`}</> : '';
      },
    },
    {
      title: t('Material Type'), // Loại
      dataIndex: 'material',
      key: 'material',
      width: 100,
      render: (value: number, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        // console.log('record ', record, record.issueTargets);
        return value !== undefined && value !== null ? <>{`${value}`}</> : '';
      },
    },
    {
      title: t('Delivered Quantity'), // KL Giao
      dataIndex: 'deliveredQuantity',
      key: 'deliveredQuantity',
      width: 100,
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask && !record.isSummery) return <></>;
        return value ? Number(value).toLocaleString('en-US') : value;
      },
    },
    // {
    //   title: t('KL hoàn thành'),
    //   dataIndex: 'totalVolumeAchieved',
    //   key: 'totalVolumeAchieved',
    //   width: 100,
    //   render: (text: any, record: WeeklyAssignmentDTO) => {
    //     // Tìm totalVolumeAchieved tương ứng với id trong totalVolumeAchievedData
    //     const totalVolumeAchieved =
    //       totalVolumeAchievedData.find(entry => entry.issueId === record.id)?.totalVolumeAchieved || 0;

    //     return <span>{totalVolumeAchieved}</span>;
    //   },
    // },
    {
      title: t('Remaining Quantity'), // Khối lượng còn lại
      dataIndex: 'remainingQuantity', // Dữ liệu cần hiển thị trong cột
      key: 'remainingQuantity', // key chot cột
      width: 100,
      render: (value: any, record: WeeklyAssignmentDTO) => {
        //[#20992][hoang_nm][27/11/2024]Bug hiển thị 000 trên các trường KL còn lại và Số công còn lại
        if (!record.isTask) return <></>;
        // TH1: tìm code === "Khoi_Luong_Con_Lai" trong item?.attributes
        const khoiLuongConLaiValue = record?.attributes?.find(attr => attr.code === 'Khoi_Luong_Con_Lai')?.value;
        if (khoiLuongConLaiValue) {
          //TH2
          // Nếu tìm thấy trường "Khoi_Luong_Con_Lai", hiển thị value của nó
          return <span>{Number(khoiLuongConLaiValue).toLocaleString('en-US')}</span>;
        } else {
          // Nếu không tìm thấy code === "Khoi_Luong_Con_Lai", tính khối lượng còn lại = Khối lượng giao - Khối lượng hoàn thành
          const deliveredQuantity = record.deliveredQuantity || 0; // Lấy khối lượng giao, nếu không có thì mặc định là 0
          const totalVolumeAchieved =
            totalVolumeAchievedData.find(entry => entry.issueId === record.id)?.totalVolumeAchieved || 0; // Lấy khối lượng hoàn thành từ dữ liệu `totalVolumeAchievedData`, nếu không có thì mặc định là 0
          const remainingQuantity = deliveredQuantity - totalVolumeAchieved; // Tính khối lượng còn lại
          return <span>{remainingQuantity.toLocaleString('en-US')}</span>;
        }
      },
    },
    {
      title: t('Unit price'), // Đơn Giá
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? Number(value).toLocaleString('en-US') : value;
      },
    },
    {
      title: t('Total Amount'), // Thành Tiền
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask && !record.isSummery) return <></>;
        return value ? Number(value).toLocaleString('en-US') : value;
      },
    },
    {
      title: t('Salary determination'), // Định mức lương
      dataIndex: 'salaryDetermination',
      key: 'salaryDetermination',
      width: 100,
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? Number(value).toLocaleString('en-US') : value;
      },
    },
    {
      title: t('Workdays'), // Số Công
      dataIndex: 'workdays',
      key: 'workdays',
      width: 100,
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask && !record.isSummery) return <></>;
        // console.log('record ', record, record.issue_OtherResourceQuotas);
        if (typeof value === 'number') {
          if (isNaN(value) || value === Infinity) return 0;
        }
        return value ? Number(value).toLocaleString('en-US') : value;
      },
    },
    {
      title: t('Remaining Work'),
      dataIndex: 'remainingwork',
      key: 'remainingwork',
      width: 100,
      render: (value: any, record: WeeklyAssignmentDTO) => {
        if (!record.isTask && !record.isSummery) return <></>;
        //[#20992][hoang_nm][27/11/2024]Bug hiển thị 000 trên các trường KL còn lại và Số công còn lại
        if (record.isSummery ) {
          // console.log(record.remainingwork)
          return <span>{(record.remainingwork || 0).toLocaleString('en-US')}</span>;
        };
        const SoCongConLaiValue = record?.attributes?.find(attr => attr.code === 'So_Cong_Con_Lai')?.value;
        if (SoCongConLaiValue) {
          // console.log("SoCongConLaiValue",SoCongConLaiValue)

          return <span>{Number(SoCongConLaiValue).toLocaleString('en-US')}</span>;
        } else {
          const workdays = record.workdays || 0;
          const TotalLaborCountAchieved =
            totalVolumeAchievedData.find(entry => entry.issueId === record.id)?.totalLaborCountAchieved || 0;
          const remainingwork = workdays - TotalLaborCountAchieved;
          return <span>{remainingwork.toLocaleString('en-US')}</span>;
        }
      },
    },
    {
      title: tPublic('Contract Planned Start Date'),
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      width: 150,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: (a: WeeklyAssignmentDTO, b: WeeklyAssignmentDTO) => sort(eTypeDate.plannedStartDate, a, b),
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? dayjs(value).format(formatDateDisplay) : '';
      },
    },
    {
      title: tPublic('Contract Planned End Date'),
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 150,
      align: 'center',
      sorter: (a: WeeklyAssignmentDTO, b: WeeklyAssignmentDTO) => sort(eTypeDate.plannedEndDate, a, b),
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? dayjs(value).format(formatDateDisplay) : '';
      },
    },
    {
      title: t('Actual start date'),
      dataIndex: 'actualStartDate',
      key: 'actualStartDate',
      width: 180,
      sorter: (a: WeeklyAssignmentDTO, b: WeeklyAssignmentDTO) => sort(eTypeDate.actualStartDate, a, b),
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? dayjs(value).format(formatDateDisplay) : '';
      },
    },
    {
      title: t('Actual end date'),
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: 180,
      sorter: (a: WeeklyAssignmentDTO, b: WeeklyAssignmentDTO) => sort(eTypeDate.actualEndDate, a, b),
      render: (value: string, record: WeeklyAssignmentDTO) => {
        if (!record.isTask) return <></>;
        return value ? dayjs(value).format(formatDateDisplay) : '';
      },
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 70,
      align: 'center',
      render: (_: any, record: WeeklyAssignmentDTO) => {
        const isComplete = checkComplete(record.id, issueChecklist);
        const items: MenuProps['items'] = [
          {
            label: (
              <Typography.Text
                // disabled={!isComplete}
                onClick={() => ShowControlAssignWork(record, isComplete)}
              >
                {t('Assign')}
              </Typography.Text>
            ),
            key: `Assign-${record.id}`,
            disabled: !assignIssueGranted
          },
        ];
        return (
          record.isTask && (
            <Space>
              <Dropdown menu={{ items }} trigger={['click']}>
                <EllipsisOutlined style={{ color: colors.primary }} />
              </Dropdown>
              {/* <Button
              onClick={() => {
                deleteIssue(record);
              }}
            >
              <Typography.Text>{t('Delete')}</Typography.Text>
            </Button> */}
            </Space>
          )
        );
      },
    },
  ];

  const ShowControlAssignWork = (issue: WeeklyAssignmentDTO, isComplete: boolean) => {
    // if (!isComplete) return;
    dispatch(issueActions.setSelectedWorkWeekly(issue));
    dispatch(showModal({ key: ControlAssignWorkModalName }));
  };

  //#region ShowControlStatusPreparation
  const ShowControlStatusPreparation = (issue: WeeklyAssignmentDTO) => {
    if (issue) {
      dispatch(issueActions.setSelectedWorkWeekly(issue));
      dispatch(showModal({ key: ControlStatusPreparationModalName }));
    }
  };

  const ShowCreateUpdateWorkInit = (issue: any, isEdit: boolean) => {
    if (!isEdit) {
      dispatch(issueActions.getFileAttachmenForIssue({ issueId: issue.id }));
      dispatch(issueActions.setEditIssuePublics(false));
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateInitWorkModalName }));
    } else {
      dispatch(issueActions.setEditIssuePublics(true));
      dispatch(issueActions.setSelectedIssue(issue));
      dispatch(showModal({ key: CreateUpdateInitWorkModalName }));
    }
  };

  //#region deleteIssue
  const deleteIssue = async (issue: WeeklyAssignmentDTO) => {
    if (selectedProject) {
      // for (let index = 400; index < 500; index++) {
      //   console.log(index);

      //   dispatch(
      //     issueActions.removeIssueRequest({
      //       issueId: index,
      //       projectId: selectedProject.id,
      //       tagVersionId: sMilestone.SetupInitialProgress,
      //     }),
      //   );
      //   await Utils.delay(2000);
      // }
      dispatch(
        issueActions.removeIssueRequest({
          issueId: issue.id,
          projectId: selectedProject.id,
          tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
        }),
      );
    }
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    tCommon('Paging total', { range1: range[0], range2: range[1], total });

  const checkDateIsBetween = (date: string | null, start: string, end: string): boolean => {
    if (!start || !end) return true;
    const check = dayjs(date, formatDateDisplay);
    const startD = dayjs(start, formatDateDisplay);
    const endD = dayjs(end, formatDateDisplay);

    return check.isAfter(startD) && check.isBefore(endD);
  };

  //#region Element
  return (
    <>
      {ControlStatusPreparationModal && <ControlStatusPreparation />}
      {CreateUpdateWorkWeeklyModal && <CreateUpdateWorkWeekly />}
      {CreateUpdateInitWorkModal && (
        <CreateUpdateIssue isCreate={isCreate} dataNeedUpdate={sMilestone.SetupInitialProgress} />
      )}
      {ControlAssignWorkModal && <AssignWorkDialog />}
      <WeeklyAssignmentHeader />
      <div className={styles.wrapperPublicPage}>
        {dataTable && dataTable.length === 0 && (
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
        {view === 'List' && dataTable && dataTable.length > 0 && (
          <div style={{ padding: 5 }} className={styles.wrappertable}>
            <Table
              rowKey={record => {
                let id = record.isSummery ? `summery-${record.id}` : record.id;
                if (record.id === undefined || record.id === null) {
                  id = Utils.generateRandomString(5);
                }
                return id;
              }}
              size="small"
              style={{ width: '100%', height: '75vh' }}
              columns={weeklyTasksColumns}
              onChange={handleIssueTableChange}
              dataSource={dataTable}
              // [07/11/2024][#20719][phuong_td] vô hiệu hóa hover row
              rowHoverable={false}
              loading={isLoading || isRemoving}
              scroll={{ x: 1000, y: windowSize[1] - 255 }}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => {
                  if (!record.children || record.children.length === 0) {
                    // return record.level && record.level > 2 ? (
                    //   <Space style={{ marginRight: '2px' }}>
                    //     <CaretUpOutlined
                    //       style={{
                    //         fontSize: '18px',
                    //         color: '#fff',
                    //         border: 'node',
                    //         pointerEvents: 'none'
                    //       }}
                    //     />
                    //     {renderNameColumn(record.subject, record)}
                    //   </Space>
                    // ) : renderNameColumn(record.subject, record);
                    return (
                      <Space style={{ display: 'flex', flexDirection: 'row', background: '#fff' }}>
                        <CaretUpOutlined
                          style={{
                            fontSize: '18px',
                            color: '#fff',
                            border: 'node',
                            pointerEvents: 'none',
                          }}
                        />
                        {renderNameColumn(record.subject, record)}
                      </Space>
                    );
                  }
                  return expanded ? (
                    <Space style={{ display: 'flex', flexDirection: 'row', background: '#fff' }}>
                      <CaretUpOutlined
                        onClick={e => onExpand(record, e)}
                        style={{ fontSize: '18px', color: '#000000', border: 'node' }}
                      />
                      {renderNameColumn(record.subject, record)}
                    </Space>
                  ) : (
                    <Space style={{ display: 'flex', flexDirection: 'row', background: '#fff' }}>
                      <CaretDownOutlined
                        onClick={e => onExpand(record, e)}
                        style={{ fontSize: '18px', color: '#52c41a' }}
                      />
                      {renderNameColumn(record.subject, record)}
                    </Space>
                  );
                },
                expandIconColumnIndex: 0,
              }}
              // pagination={{ position: ['bottomRight'], pageSize: size }}
              pagination={false}
              summary={() => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      {weeklyTasksColumns.map((c, i) => {
                        switch (c.dataIndex) {
                          case 'subject': {
                            return (
                              <Table.Summary.Cell index={i} key={c.key}>
                                <Typography.Title level={5}>{t('Grand Total')}</Typography.Title>
                              </Table.Summary.Cell>
                            );
                          }
                          case 'deliveredQuantity': {
                            return (
                              <Table.Summary.Cell index={i} key={c.key}>
                                {total.totalDeliveredQuantity.toLocaleString('en-US')}
                              </Table.Summary.Cell>
                            );
                          }
                          case 'totalAmount': {
                            return (
                              <Table.Summary.Cell index={i} key={c.key}>
                                {total.totalAmount.toLocaleString('en-US')}
                              </Table.Summary.Cell>
                            );
                          }
                          case 'workdays': {
                            return (
                              <Table.Summary.Cell index={i} key={c.key}>
                                {total.totalNumberOfWorkDays.toLocaleString('en-US')}
                              </Table.Summary.Cell>
                            );
                          }
                          case 'remainingwork': {
                            return (
                              <Table.Summary.Cell index={i} key={c.key}>
                                {total.totalNumberOfRemainingWorkDays.toLocaleString('en-US')}
                              </Table.Summary.Cell>
                            );
                          }
                          default:
                            return <Table.Summary.Cell index={i} key={c.key} />;
                        }
                      })}
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>
        )}
        {/* {view === 'Gantt' && (
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
            <Typography.Title level={2}>Tính năng đang phát triển</Typography.Title>
          </div>
        )} */}
      </div>
    </>
  );
};
