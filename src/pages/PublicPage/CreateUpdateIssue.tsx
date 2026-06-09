import { useEffect, useRef, useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined, DeleteOutlined, ArrowDownOutlined  } from '@ant-design/icons';
import type { SelectProps, UploadFile, UploadProps } from 'antd';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Button,
  Space,
  Col,
  Checkbox,
  Typography,
  Upload,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import styles from './Public.module.less';
import { colors } from '@/common/colors';
import {
  CreateUpdateInitWorkModalName,
  FormatDateAPI,
  NatureOfWorks,
  WorkingProgress,
  Category,
  eTypeUpdate,
  formatDateDisplay,
  MilestoneLabel,
  eNatureOfTheJob,
  sMilestone,
  eCategoryString,
  eTrackerCode,
  eAttribute,
  AttributeDimDTO,
  AttributesUpdateDTO,
} from '@/common/define';
import { codeStatus, IssuesResponse, IssueTargetDTO, IssueTeamDTO, Status, StatusHelperControl, TargetIssue, WeeklyAssignmentDTO } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCategorys, getEditIssuePublic, getIssueProgressList, getIssueStatusList, getTagsVersion, getSelectedIssue, issueActions, getIssueTeams, getTracker, getAttributes, getTargets, getIssuesByParentId, getFileAttachmenForIssue, getEmployeeReportByIssue, getDateFilter, getIssueQueryParams } from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';
import { getProjectMembers, getSelectedProject } from '@/store/project';
import { getTeams } from '@/store/team';
import { RootState } from '@/store/types';
import Utils from '@/utils';

interface CreateUpdateIssueProps {
  isCreate?: boolean,
  dataNeedUpdate?: sMilestone,
  selectedWork?: WeeklyAssignmentDTO,
  isUpdate?: boolean
}
export const CreateUpdateIssue = ({isCreate, dataNeedUpdate, selectedWork, isUpdate} : CreateUpdateIssueProps) => {
  const { t } = useTranslation('publics');
  const tCategory = useTranslation('category').t;

  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const CreateUpdateInitWorkModal = useAppSelector(getModalVisible(CreateUpdateInitWorkModalName));
  const selectedIssue = useAppSelector(getSelectedIssue());
  const isEditPublic = useAppSelector(getEditIssuePublic());
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const issueStatusList = useAppSelector(getIssueStatusList());
  const categorys = useAppSelector(getCategorys());
  const teams = useAppSelector(getTeams());
  const issueProgressList = useAppSelector(getIssueProgressList());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const tags = useAppSelector(getTagsVersion());
  const issueTeam = useAppSelector(getIssueTeams());
  const [teamsData, setTeamsData] = useState(null);
  const trackers = useAppSelector(getTracker());
  const attributes = useAppSelector(getAttributes());
  const targets = useAppSelector(getTargets());
  const [formFileData, setFormFileData] = useState<any>([]);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const [teamsRemove, setTeamsRemove] = useState<number[]>([])
  // const issuesByParentId = useAppSelector(getIssuesByParentId());
  // const [actualWorkDayTotal, setActualWorkDayTotal] = useState(0);
  const [listFileRemove, setListFileRemove] = useState<any[]>([]);
  // [07/11/2024][#20719][phuong_td] dữ liệu report của issue
  const employeeReportByIssue = useAppSelector(getEmployeeReportByIssue());

  const [SoCongHoanThanh, setSoCongHoanThanh] = useState<number>(0);
  // const [KhoiLuongDatDuoc, setKhoiLuongDatDuoc] = useState<number>(0);

  // [07/11/2024][#20719][phuong_td] Kiểm tra issue có phải phát sinh đột xuất không
  const checkUnexpectedWork = () => {
    return selectedIssue?.type === eNatureOfTheJob.UnexpectedWork;
  }
  // [07/11/2024][#20719][phuong_td] Tính số công theo khối lượng
  const TinhSoCong = (khoiLuongGiao: number, donGia: number, dinhMucLuong: number) => {
    const thanhTien = khoiLuongGiao*donGia;
    return thanhTien/dinhMucLuong;
  }

  // [10/11/2024][#20719][phuong_td] Lấy dữ liệu đơn giá/ khối lượng giao/ Định mức lương từ issue
  const getData = () => {
      const target = getTarget(selectedIssue?.issueTargets);
      const unitPrice = +target.costPerValue ? +target.costPerValue : 0; // add
      const salaryDetermination = selectedIssue ? Utils.getAttributeData(selectedIssue.attributes, eAttribute.Dinh_Muc_Luong) : 0;
      const deliveredQuantity = target.planValue ? parseFloat(target.planValue) : 0; // add
      return {unitPrice, salaryDetermination, deliveredQuantity};
  }

  const dateFilter = useAppSelector(getDateFilter());
  const params = useAppSelector(getIssueQueryParams());
  const totalVolumeAchievedData = useSelector((state: RootState) => state.issue.totalVolumeAchievedData);

  // const getRemainingAmountOfWork = () => {
  //   const SoCongTietKiem = Utils.getNumber(selectedIssue?.workdays - SoCongHoanThanh, 'float');
  //   console.log('SoCongTietKiem', SoCongTietKiem);
  // };

 
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
  }, [dateFilter]);

  const getRemainingAmountOfWork = () => {
    // [10/11/2024][#20719][phuong_td] Tính số công tiết kiệm được (số công còn lại)
    if (!selectedIssue) {
      return 0;
    }
    const matchingData = totalVolumeAchievedData.find(item => item.issueId === selectedIssue.id);
    if (!matchingData) {
      return 0;
    }
    const workdays = selectedIssue.workdays && !isNaN(selectedIssue.workdays) ? selectedIssue.workdays : 0;
      //[#21004][hoang_nm][28/11/2024] Tính số công tiêt kiệm với = số công giao-số công hoàn thành theo issue

    const SoCongTietKiem = Utils.getNumber(workdays - matchingData.totalLaborCountAchieved, 'float');
    return SoCongTietKiem;
  };
  
  useEffect(() => {
    if (employeeReportByIssue) {
      let soCongDatDuoc = 0;
      let khoiLuongDatDuoc = 0;
      // [07/11/2024][#20719][phuong_td] tính số công và khối lượng đạt được
      employeeReportByIssue.forEach((r) => {
        const kl = r.employReportAttributes.find((a) => a.attributeCode === eAttribute.Khoi_Luong);
        const sc = r.employReportAttributes.find((a) => a.attributeCode === eAttribute.So_Cong_Hoan_Thanh);
        khoiLuongDatDuoc += Utils.getNumber(kl?.value);
        soCongDatDuoc += Utils.getNumber(sc?.value);
      });
      // setKhoiLuongDatDuoc(khoiLuongDatDuoc);
      // [10/11/2024][#20719][phuong_td] kiểm tra nếu là công việc thông thường thì tính theo khối lượng hoàn thành còn công việc phát sinh thì tính trực tiếp từ report
      if (checkUnexpectedWork()) {
        setSoCongHoanThanh(soCongDatDuoc);
      } else {
        const { unitPrice, salaryDetermination, deliveredQuantity } = getData();
        const result = TinhSoCong(khoiLuongDatDuoc, unitPrice, salaryDetermination);
        setSoCongHoanThanh(result);
      }
    }
  }, [employeeReportByIssue]);

  useEffect(() => {
    if (selectedIssue) {
      const { workdays } = selectedIssue;
      // console.log('SoCongHoanThanh ', SoCongHoanThanh);
      // [10/11/2024][#20719][phuong_td] tính số công tiết kiệm được (số công còn lại) và cập nhật vào form
      form.setFieldsValue({
        remainingAmountOfWork: workdays- SoCongHoanThanh,
      });
    }
  }, [SoCongHoanThanh]);

  const getListFileOfIssue = useAppSelector(getFileAttachmenForIssue())
  const handleUploadChange = (info: any) => {
    const { status, fileList } = info;
      const formData = new FormData();
      fileList.forEach((file: any) => {
        if (file || file.originFileObj) {
          formData.append('files', file.originFileObj || file as File);
        }
      });
      setFormFileData(formData);
  };

  const [team, setTeams] = useState<any[]>([]);
  const uploadProps: UploadProps = {
    beforeUpload: (file, files) => {
      const _fileList = fileList || [];
      setFileList([..._fileList, ...files]);
      return false;
    },
    onChange: handleUploadChange,
    fileList,
    multiple: true,
    name: 'file',
    showUploadList: false,
  };

  useEffect(()=> {
    setFileList([])
    setFileList(getListFileOfIssue);
  },[getListFileOfIssue] )

  
  const getTargetData = (issueTargets: IssueTargetDTO[]): IssueTargetDTO | null | undefined => {
    if (issueTargets) {
      if (issueTargets) {
        const {length} = issueTargets;
        if (length > 0) {
          const targetIssue = Utils.clone(issueTargets[length - 1]);
          return targetIssue;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // let _actualWorkDay = 0;
    // if (issuesByParentId) {
    //   const {results} = issuesByParentId;
    //   if (results.length) {
    //     results.forEach((a)=> {
    //       const t = getTargetData(a.issueTargets);
    //       if (t) {
    //         _actualWorkDay += +t?.actualValue;
    //       }
    //     })
    //   }
    // }
    // setActualWorkDayTotal(_actualWorkDay);
    // [10/11/2024][#20719][phuong_td] lấy dữ liệu report của issue
    if (selectedIssue) {
      dispatch(
        issueActions.getEmployeeReportByIssue({
          issueId: selectedIssue.id,
        }),
      );
    }
  }, [selectedIssue]);


  const removefile = (file: UploadFile<any> | any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    setListFileRemove((prevList: any) => [...prevList, {drawingId: file?.drawingId, id: file?.id } ]);
  };


  const saveFile = (file:any) => {
      dispatch(issueActions.downloadFileAttachmentOfIssue({id: file.drawingId, fileName:file.fileName })); 
  }


  const dataTeams: SelectProps['options'] = teams.map((item) => {
    return {value : item.id, label: item.name, projectId: item.projectId, leaderId: item.leader_Id, id: item.id}
  })
  const handleSaveIssue = (values: any) => {
    if (selectedProject && projectMembers) {
      // createContacts
      const selectedSupervisor = projectMembers.results.find(mem => mem.employeeId === values.supervisorId);
      let createContacts = undefined;
      if(selectedSupervisor) {
        const {id, ...remainingFields} = selectedSupervisor;
        createContacts = {
          ...remainingFields,
          fullname: selectedSupervisor?.name ?? '',
          titleType: 2,
        }
      }
      let trackerId = 20;
      if (trackers && trackers.length) {
        const tracker = trackers?.find((t)=> t.code === eTrackerCode.CongViecHangTuan);
        if (tracker && tracker.id !== null && tracker.id !== undefined) trackerId = tracker.id;
      }
      const selectedTag = issueProgressList.find(tag => tag.id === values.tagVersionId);
      

      let inputData: any = {
        parentId: values.parentId ? values.parentId : null, // number hoặc null
        projectId: selectedProject.id,
        categoryId: values.category,
        tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags), // number mới thêm đc
        selectionSetName: values.selectionSetName,
        subject: values.subject,
        description: values.description,
        tagVersionName: selectedTag ? selectedTag.name : '',
        type: values.type,
        startDate: values.startDate ? values.startDate.format(FormatDateAPI) : undefined,
        dueDate: values.dueDate ? values.dueDate.format(FormatDateAPI) : undefined,
        plannedStartDate: values?.plannedStartDate ? values.plannedStartDate.format(FormatDateAPI) : undefined,
        plannedEndDate: values?.plannedEndDate ? values.plannedEndDate.format(FormatDateAPI) : undefined,
        // [implement#22096]
        paymentDocument: values.paymentDocument,
        plannActualStartDate: values?.plannActualStartDate ? values.plannActualStartDate.format(FormatDateAPI) : undefined,
        plannActualEndDate: values?.plannActualEndDate ? values.plannActualEndDate.format(FormatDateAPI) : undefined,
        actualStartDate: values?.actualStartDate ? values.actualStartDate.format(FormatDateAPI) : undefined,
        actualEndDate: values?.actualEndDate ? values.actualEndDate.format(FormatDateAPI) : undefined,
        status: values.status ? StatusHelperControl.getCodeByValue(values.status.toString()) : sMilestone.WaitingForApproval,
        progress: values.progress,
        notes: values.notes,
        trackerId,
        createContacts: createContacts ? [{...createContacts}] : [],
        teamIds: team,
        estimatedTime: values?.requiredQuantity ? values?.requiredQuantity : 0,
      }
      const _attributes = selectedIssue ? Utils.createAttributes(selectedIssue.attributes, attributes) : [];
      if (inputData && inputData.status === Utils.convertStatus(Status.Done)) {
        inputData = {...inputData, progress: 100}
      }
      if (selectedIssue && (!isCreate || isUpdate) && !isEditPublic) {
        inputData.issueAttributes = _attributes;
        if (inputData && +inputData.progress === 100 && +inputData.progress !== selectedIssue.progress) {
          dispatch(issueActions.updateStatusIssue({id: selectedIssue?.id, issue: inputData, projectId: inputData.projectId, code: codeStatus.Done}))
        }
        dispatch(issueActions.updateIssueRequest(
          { 
            issueId: selectedIssue.id, 
            issue: { ...selectedIssue, ...inputData, status: +inputData.progress === 100 ? 'Hoan_Thanh' : inputData.status},
            tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
            typeUpdate: eTypeUpdate.WeeklyAssignment,
            listId: team,
          }
        ));
        const fileChanges = fileList.filter((file: any) => !file.hasOwnProperty('issueId'))
        if (fileList && fileList.length > 0 && fileChanges.length > 0) {
          dispatch(issueActions.upLoadFileAttachment({issueId: selectedIssue.id, files: formFileData}))
        }
        if (teamsRemove && teamsRemove.length > 0) {
          for (let i = 0; i < teamsRemove.length; i++) {
            const id = teamsRemove[i];
            dispatch(issueActions.removeIssueTeamRequest({teamId: id, issueId: selectedIssue?.id}));
          }
        }
        if (listFileRemove && listFileRemove.length > 0) {
          for (let i = 0; i < listFileRemove.length; i++) {
            const element = listFileRemove[i];
            dispatch(issueActions.removeFileOfIssue({issueId: selectedIssue?.id, fileId: element?.id, drawingId: [element?.drawingId]}))
          }
        }
        dispatch(hideModal({ key: CreateUpdateInitWorkModalName }));
        return;
      }
      if (inputData && +inputData.progress === 100) {
        inputData = {...inputData, status: Utils.convertStatus(Status.Done)}
      }
      inputData.issueAttributes = _attributes;

      // check user have upload file
      const hasFile = fileList && fileList.length > 0 && formFileData && formFileData.has('files');

      dispatch(issueActions.createIssueRequest({ 
        issue: inputData,
        tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
        typeUpdate: eTypeUpdate.WeeklyAssignment,
        // files: formFileData,
        ...(hasFile ? { files: formFileData } : {}),
        listId: team
      }));
     
      dispatch(hideModal({ key: CreateUpdateInitWorkModalName }));
    }
  };

  useEffect(() => {
    if (selectedIssue) {
      dispatch(issueActions.getTeamIdsByIssueRequest({
        issueId: selectedIssue.id,
        params: {},
      }))
     }
  },[selectedIssue])

  const confirmRemoveIssue = (issue: IssuesResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('Confirm remove', {
              name: `<strong>"${issue.id}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      maskClosable: true,
      onOk: close => {
        handleRemoveIssue(issue.id);
        close();
      },
    });
  };

  const handleRemoveIssue = (issueId: number) => {
    if(selectedProject) {
      dispatch(issueActions.removeIssueRequest({ issueId, projectId: selectedProject.id }));
    }
  };

  const handleCancel = () => {
    dispatch(issueActions.setSelectedIssue(undefined));
    dispatch(hideModal({ key: CreateUpdateInitWorkModalName }));
  };

  const handleOk = () => form.submit();

  const issueProgressListTemp = [
    {
      id: Utils.getMileStoneId(sMilestone.Bid, tags),
      key: sMilestone.Bid,
      name: MilestoneLabel.Bid,
    },
    {
      id: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags),
      key: sMilestone.ContractBiddingKPIs,
      name: MilestoneLabel.ContractBiddingKPIs,
    },
    {
      id: Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags),
      key: sMilestone.PrepareForConstruction,
      name: MilestoneLabel.PrepareForConstruction,
    },
    {
      id: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
      key: sMilestone.SetupInitialProgress,
      name: MilestoneLabel.SetupInitialProgress,
    }
  ];

  const issueStatusListTest = StatusHelperControl.statusOptions;

  // parentId: !isEditPublic && selectedIssue ? selectedIssue.parentId : (selectedIssue?.id && isEditPublic && selectedIssue.id !== selectedIssue.parentId) ? selectedIssue.id : '',
  const getParentId = () => {
    if (!isEditPublic && selectedIssue) {
        return selectedIssue.parentId;
    } else if (selectedIssue?.id && isUpdate) {
        return selectedIssue.id;
    } else if (selectedIssue) {
        if (isCreate) {
            return selectedIssue.id;
        } else {
            return selectedIssue.parentId;
        }
    }
    return '';
  }

  const dataTeamsEdit = teams.filter((item: any) =>  issueTeam?.includes(item.id))
  useEffect(()=>{
    if (selectedIssue) {
      const defaultAssigneeTo: any = dataTeamsEdit.map((team: any) => ({value: team.id, label: team.name}));
      setTeamsData(defaultAssigneeTo)
    }
  }, [selectedIssue, dataTeamsEdit.length])

  const handleChange = (value: any) => {
    setTeams([...value])
    if(selectedIssue && selectedIssue?.teamIds ) {
      const result = selectedIssue?.teamIds?.filter((a: any) => !value.includes(a));
      setTeamsRemove(result)
    }
  };
  
  useEffect(() => {
    if (selectedIssue && !isEditPublic) {
      form.setFieldsValue({
        assigneeTeams: teamsData,
        remainingAmountOfWork: getRemainingAmountOfWork(),
      })
      if (teamsData && selectedIssue.teamIds) {
       setTeams([...selectedIssue?.teamIds])
      }
    }
    else {
      form.resetFields();
      setFileList([])
    }
  }, [selectedIssue, teamsData, form])


  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const getStatus = () => {
    if (selectedIssue && +selectedIssue.progress === 100) return StatusHelperControl.getValue(sMilestone.Complete);
    return ((selectedIssue?.status !== null || selectedIssue?.status) && !isEditPublic) ? StatusHelperControl.getValue(selectedIssue?.status) : '';
  };

  // const getRemainingAmountOfWork = () => {
  //   // if (selectedIssue) {
  //   //   const target = getTarget(selectedIssue?.issueTargets);
  //   //   const unitPrice = +target.costPerValue ? +target.costPerValue : 0; // add
  //   //   const {workdays} = selectedIssue;
  //   //   if (!selectedIssue.attributes) {
  //   //     return 0;
  //   //   }
  //   //   const salaryDetermination = selectedIssue ? Utils.getAttributeData(selectedIssue.attributes, eAttribute.Dinh_Muc_Luong) : 0;
  //   //   if (typeof workdays === 'number' && typeof actualWorkDayTotal === 'number' && workdays > 0 && unitPrice > 0 &&
  //   //     salaryDetermination > 0) {
  //   //     const totalWordays =  Utils.fixNumber((actualWorkDayTotal * unitPrice) / salaryDetermination);
  //   //     return Utils.fixNumber(workdays - totalWordays);
  //   //   } else {
  //   //     console.warn("Invalid workdays, actualWorkDayTotal, unitPrice, or salaryDetermination.");
  //   //   }
  //   // }
  //   // [10/11/2024][#20719][phuong_td] tính số công tiết kiệm được (số công còn lại)
  //   const SoCongTietKiem = Utils.getNumber(selectedIssue?.workdays - SoCongHoanThanh, 'float');
  //   // console.log('SoCongTietKiem ', SoCongTietKiem);
  //   return SoCongTietKiem < 0 ? 0 : SoCongTietKiem;
  // }

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



  return (
    <Modal
      title={
        <div
        style={{
          width: '100%',
          cursor: 'move',
        }}
        onMouseOver={() => {
          if (disabled) {
            setDisabled(false);
          }
        }}
        onMouseOut={() => {
          setDisabled(true);
        }}
        onFocus={() => {}}
        onBlur={() => {}}
        >
          {((selectedIssue && !isCreate) || !isEditPublic) ? t('Edit') : t('New')}
        </div>
      }
      centered
      open={CreateUpdateInitWorkModal}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('Save')}
      width={'580px'}
      destroyOnClose
      className="custom-modal-scrollbar"
      style={{ width: '580px', ...{ important: 'true' } }}
      footer={(_, { OkBtn, CancelBtn }) =>
        selectedIssue ? (
          <Row style={{ margin: 0 }} align="stretch">
          <Space style={{ flex: 1 }}>
            <Button key="remove" type="primary" danger onClick={() => confirmRemoveIssue(selectedIssue)} style={{display: 'none'}}>
              {t('Remove')}
            </Button>
          </Space>
          <Space>
            <CancelBtn />
            <OkBtn />
          </Space>
        </Row>
        ) : (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )
      }
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event: any, uiData: any) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...selectedIssue,
          subject: ((!isCreate && selectedIssue) || !isEditPublic) ? selectedIssue?.subject : '',
          startDate: !isCreate && selectedIssue?.startDate ? dayjs(selectedIssue.startDate) : dayjs().startOf('week'),
          dueDate: !isCreate && selectedIssue?.dueDate ? dayjs(selectedIssue.dueDate) : dayjs().startOf('week'),
          plannedStartDate: (selectedIssue?.plannedStartDate && !isEditPublic) ? dayjs(selectedIssue.plannedStartDate) : null,
          plannedEndDate: (selectedIssue?.plannedEndDate && !isEditPublic) ? dayjs(selectedIssue.plannedEndDate) : null,
          // [implement#22096]
          plannActualStartDate: (selectedIssue?.plannActualStartDate && !isEditPublic) ? dayjs(selectedIssue.plannActualStartDate) : null,
          plannActualEndDate: (selectedIssue?.plannActualEndDate && !isEditPublic) ? dayjs(selectedIssue.plannActualEndDate) : null,
          actualStartDate: (selectedIssue?.actualStartDate && !isEditPublic) ? dayjs(selectedIssue.actualStartDate) : null,
          actualEndDate: (selectedIssue?.actualEndDate && !isEditPublic) ? dayjs(selectedIssue.actualEndDate) : null,
          tagVersionId: selectedIssue?.tagVersionId ? selectedIssue?.tagVersionId :  Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
          supervisorId:
            selectedIssue &&
            selectedIssue.issueContacts &&
            selectedIssue.issueContacts[0] &&
            selectedIssue.issueContacts[0]?.contact
              ? selectedIssue.issueContacts[0].contact.employeeId
              : null,
          parentId: (selectedIssue?.id !== selectedIssue?.parentId) ? getParentId() : '',
          requiredQuantity: selectedIssue?.workdays ? selectedIssue?.workdays : 0,
          status : getStatus(),
          remainingAmountOfWork: getRemainingAmountOfWork(),
          description: (selectedIssue?.description && !isEditPublic) ? selectedIssue.description : '',
          category: (selectedIssue && (selectedIssue.categoryId !== null || selectedIssue.categoryId))  ? +selectedIssue.categoryId : '',
          type: selectedIssue?.type ? selectedIssue?.type : eNatureOfTheJob.DailyRepetitiveWork,
          progress: ((selectedIssue?.progress !== null || selectedIssue?.progress) && !isEditPublic) ? selectedIssue?.progress : 0,
        }}
        onFinish={handleSaveIssue}
        autoComplete="off"
      >
        <div className="custom-scrollbar-container">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="selectionSetName" className={styles.formatCheckbox} valuePropName="checked">
                <Checkbox>{t('Daily assessment')}</Checkbox>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={t('Subject')}
                name="subject"
                rules={[{ required: true, message: t('Please input name!') }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="paymentDocument" className={styles.formatCheckbox} valuePropName="checked">
                <Checkbox>{t('Need payment document')}</Checkbox>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={t('team')}
                name="assigneeTeams"
                // rules={[{ required: true, message: t('Please input assignee!') }]}
              >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                onChange={handleChange}
                options={dataTeams}
                // defaultValue={teamsData}
                // {...}
              />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('Nature of work')}
                name="type"
                rules={[{ required: true, message: t('Please input Nature of work!') }]}
              >
                <Select options={NatureOfWorks()} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('Status')}
                name="status"
                rules={[{ required: true, message: t('Please input status!') }]}
              >
                <Select options={issueStatusListTest.map(status => ({ label: status.label, value: status.value }))} />            
                </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={t('Phase')}
                name="tagVersionId"
                rules={[{ required: true, message: t('Please input start date!') }]}
              >
                 <Select
                  options={issueProgressListTemp.map((status) => ({ label: status.name, value: status.id }) )}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={t('category')}
                name="category"
                rules={[{ required: true, message: t('please input category!') }]}
              >
                <Select options={Category(categorys, tCategory).map((item) => ({value: item.id , label: item.label}))}  />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={t('Contract Planned Start Date')}
                name="plannedStartDate"
                // rules={!isEditPublic ? [] : [{ required: true, message: t('planned start date!') }]}
                rules={[{ required: true, message: t('planned start date!') }]}
              >
                <DatePicker style={{ width: '100%' }} 
                  format={formatDateDisplay} 
                  // disabled={!isEditPublic}
                />

              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={t('Contract Planned End Date')}
                name="plannedEndDate"
                // rules={!isEditPublic ? [] : [{ required: true, message: t('planned end date!') }]}
                rules={[{ required: true, message: t('planned end date!') }]}
              >
                <DatePicker style={{ width: '100%' }} 
                  format={formatDateDisplay} 
                  // disabled={!isEditPublic}
                />

              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={t('Actual Planned Start Date')}
                name="plannActualStartDate"
                // rules={[{ required: true, message: t('Please enter actual planned start date') }]}
              >
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={t('Actual Planned End Date')}
                name="plannActualEndDate"
                // rules={[{ required: true, message: t('Please enter actual planned end date') }]}
              >
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={t('Actual start date')}
                name="actualStartDate"
              >
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={t('Actual end date')}
                name="actualEndDate"
              >
                <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
              </Form.Item>
            </Col>

            <Col span={24} sm={12}>
              <div className={styles.formatCol}>
              {/* Số công ước tính */}
                <span>
                  <span className={styles.symbol}> *</span> {t('Number of calculations')}:
                </span>
                <Space direction="vertical" className="">
                  <Form.Item
                    name="requiredQuantity"
                    style={{
                      margin: 0,
                      width: '135px',
                    }}
                    rules={[{ required: true, message: t('Required!') }]}
                  >
                    <Input readOnly />
                  </Form.Item>
                </Space>
              </div>
            </Col>
            

            <Col span={24} sm={12}>
              <div className={styles.formatCol}>
                {/* Số công tiết kiệm được */}
                <span>
                  <span className={styles.symbol}></span> {t('Savings number')}:
                </span>
                <Space direction="vertical" className="">
                  <Form.Item
                    name="remainingAmountOfWork"
                    style={{
                      margin: 0,
                      width: '95px',
                    }}
                  >
                    <Input readOnly />
                  </Form.Item>
                </Space>
              </div>
            </Col>

            <Col span={24} sm={12}>
              <div className={styles.formatCol}>
                <span> {t('Parent')}:</span>
                <Space direction="vertical" className="">
                  <Form.Item
                    name="parentId"
                    style={{
                      margin: 0,
                      width: '165px',
                    }}
                  >
                    <Input />
                  </Form.Item>
                </Space>
              </div>
            </Col>

            <Col span={24} sm={12}>
              <div className={styles.formatCol}>
                <span>
                  <span className={styles.symbol}> *</span> {t('Progress')}:
                </span>
                <Space direction="vertical" className="">
                  <Form.Item
                    name="progress"
                    style={{
                      margin: 0,
                      width: '105px',
                    }}
                    rules={[{ required: true, message: t('Required!') }]}
                  >
                    <Select options={WorkingProgress} />
                  </Form.Item>
                </Space>
              </div>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('Description')}
                name="description"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={t('Notes')} name="notes">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0 }}>
          <Row align="stretch" style={{ margin: 0 }}>
            <Typography.Text style={{ flex: 1 }} className="ant-form-item-label">
              {t('Attachments')}
            </Typography.Text>
            <Upload {...uploadProps}>
              <Button type="link" icon={<CloudUploadOutlined />} style={{ padding: 0 }}>
                {t('Click to Upload')}
              </Button>
            </Upload>
          </Row>
          {fileList?.length > 0 && (
            <div style={{ border: '1px solid #D9D9D9', padding: 10, borderRadius: 8 }}>
              {fileList.map((f: any )=> (
                <Row key={f.uid ? f.uid : f?.id} style={{ margin: 0 }} className="app-upload-list-item">
                  <Space style={{ flex: 1 }}>
                    <PaperClipOutlined />
                    <span>{f.name ? f.name : f.fileName}</span>
                  </Space>
                  {f.fileName  &&
                  <Tooltip title={t('Lưu file')}>
                    <ArrowDownOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: colors.primary }}
                      onClick={() => saveFile(f)}
                    />
                  </Tooltip>
                  }
                  <div style={{marginLeft: '5px'}}></div>
                  <Tooltip title={t('Remove file')}>
                    <DeleteOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => removefile(f)}
                    />
                  </Tooltip>
                </Row>
              ))}
            </div>
          )}
        </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
