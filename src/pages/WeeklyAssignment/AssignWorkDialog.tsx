import { ChangeEvent, useEffect, useState } from 'react';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Typography,
  Upload,
  Button,
  Space,
  Col,
  Table,
  DatePicker,
  Progress,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import styles from './WeeklyAssignment.module.less';
import {
  AttributeDimDTO,
  AttributesUpdateDTO,
  Category,
  ControlAssignWorkModalName,
  eAttribute,
  eNatureOfTheJob,
  eTrackerCode,
  eTypeUpdate,
  FormatDateAPI,
  formatDateDisplay,
  sMilestone,
  TargetDTO,
} from '@/common/define';
import { IssueTargetDTO, IssueTeamDTO, Status, StatusHelperControl, WeeklyAssignmentDTO } from '@/services/IssueService';
import { TeamResponse } from '@/services/TeamService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getIssueTeams,
  getSelectedWorkWeekly,
  issueActions,
  getTagsVersion,
  getCategorys,
  getTargets,
  getOtherResources,
  getTracker,
  getAttributes,
  getIssuesByParentId,
  getEmployeeReportByIssue,
} from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';
import { getEmployeesByCompanyId, getProjectMembers, getSelectedProject } from '@/store/project';
import { getTeams } from '@/store/team';
import { RootState } from '@/store/types';
import Utils from '@/utils';

// rowSelection object indicates the need for row selection
interface optionCustom {
  key: string;
  id: number;
  code: string;
  label: string;
  value: string | number;
}

// [22/10/2024][#20533][phuong_td] Enum loại dữ liệu Attribute
enum eTeamIssueAttribute {
  workdays = 'workdays',
  progress = 'progress',
  planeVolumn = 'planeVolumn',
  actualVolumn = 'actualVolumn', 
}
export const AssignWorkDialog = () => {
  const { Option } = Select;
  const { t } = useTranslation('weeklyAssignment');
  const tCommon = useTranslation('common').t;
  const tStatus = useTranslation('status').t;
  const tCategory = useTranslation('category').t;

  const [form] = Form.useForm();

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(ControlAssignWorkModalName));
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const employees = useAppSelector(getEmployeesByCompanyId());
  const issueTeam = useAppSelector(getIssueTeams());
  const teams = useAppSelector(getTeams());
  const tags = useAppSelector(getTagsVersion());
  const categorys = useAppSelector(getCategorys());
  const targets = useAppSelector(getTargets());
  const otherResources = useAppSelector(getOtherResources());
  const trackers = useAppSelector(getTracker());
  const attributes = useAppSelector(getAttributes());
  const [Units, setUnits] = useState<optionCustom[]>([]);
  const [Types, setTypes] = useState<optionCustom[]>([]);
  const [valueType, setValueType] = useState<number | undefined>(undefined);
  const [valueUnit, setValueUnit] = useState(undefined);
  // const issuesByParentId = useAppSelector(getIssuesByParentId());
  // [07/11/2024][#20719][phuong_td] dữ liệu report của issue
  const employeeReportByIssue = useAppSelector(getEmployeeReportByIssue());
  // const [isUnexpectedWork, setIsUnexpectedWork] = useState<boolean>(false);

  // [07/11/2024][#20719][phuong_td] Kiểm tra issue có phải phát sinh đột xuất không
  const checkUnexpectedWork = () => {
    return selectedWorkWeekly?.type === eNatureOfTheJob.UnexpectedWork;
  };
  const [actualWorkDayTotal, setActualWorkDayTotal] = useState(0);

  const [formKey, setFormKey] = useState(0);
  const [tableKey, setTableKey] = useState(Utils.generateRandomString(3));

  const handleReset = () => {
    // Cập nhật key để render lại form
    setFormKey(prevKey => prevKey + 1);
  };

  const handleChange = (newValue: any) => {
    setValueType(newValue);
  };

  const handleClear = (type: 'Types' | 'Units') => {
    switch (type) {
      case 'Types':
        setValueType(undefined);
        break;
      case 'Units':
        setValueUnit(undefined);
        break;
    }
  };

  const selectedWorkWeekly = useAppSelector(getSelectedWorkWeekly());
  //console.log('selectedWorkWeekly', selectedWorkWeekly);
  const totalVolumeAchievedData = useSelector((state: RootState) => state.issue.totalVolumeAchievedData);
  //console.log('totalVolumeAchievedData', totalVolumeAchievedData);
  const result = totalVolumeAchievedData.find(data => data.issueId === selectedWorkWeekly?.id);
  //[04/12/2024][#21068][hoang_nm]Tính số công còn lại = số công giao - số công hoàn thành
  let soconghoanthanhgiaoviec = 0;
  if (result) {
    soconghoanthanhgiaoviec = result.totalLaborCountAchieved;
    //console.log('soconghoanthanhgiaoviec', soconghoanthanhgiaoviec);
  }
  const [WorkSelected, setWorkSelected] = useState<WeeklyAssignmentDTO>();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [teamsAssign, setTeamsAssign] = useState<TeamResponse[]>([]);
  const [current, setCurrent] = useState(0);
  const pageSize = 7; // Số lượng hàng mỗi trang
  const maxNumber = 999999999999999999999999;
  // [07/11/2024][#20719][phuong_td] Số công và Khối lượng hoàn thành
  const [SoCongHoanThanh, setSoCongHoanThanh] = useState<number>(0);
  const [KhoiLuongDatDuoc, setKhoiLuongDatDuoc] = useState<number>(0);

  const handleJumpToLastPage = () => {
    const totalItems = teamsAssign.length;
    const lastPage = Math.ceil(totalItems / pageSize);
    if (lastPage !== current) setCurrent(lastPage);
  };

  useEffect(() => {
    if (employeeReportByIssue) {
      let soCongDatDuoc = 0;
      let khoiLuongDatDuoc = 0;
      // [07/11/2024][#20719][phuong_td] tính số công và khối lượng đạt được
      employeeReportByIssue.forEach(r => {
        const kl = r.employReportAttributes.find(a => a.attributeCode === eAttribute.Khoi_Luong);
        const sc = r.employReportAttributes.find(a => a.attributeCode === eAttribute.So_Cong_Hoan_Thanh);
        khoiLuongDatDuoc += Utils.getNumber(kl?.value);
        soCongDatDuoc += Utils.getNumber(sc?.value);
      });

      // [07/11/2024][#20719][phuong_td] Cập nhật Attribute cho issue
      const dinhMucLuong: AttributesUpdateDTO = getAttributeUpdateData(eAttribute.Dinh_Muc_Luong);
      const So_Cong: AttributesUpdateDTO = getAttributeUpdateData(eAttribute.So_Cong);
      const So_Cong_Con_Lai: AttributesUpdateDTO = getAttributeUpdateData(eAttribute.So_Cong_Con_Lai);
      const Khoi_Luong_Con_Lai: AttributesUpdateDTO = getAttributeUpdateData(eAttribute.Khoi_Luong_Con_Lai);
      setKhoiLuongDatDuoc(khoiLuongDatDuoc);
      setSoCongHoanThanh(soCongDatDuoc);
      if (selectedWorkWeekly) {
        const { unitPrice, salaryDetermination, deliveredQuantity, workdays } = selectedWorkWeekly;
        // [07/11/2024][#20719][phuong_td] Tính khối lượng và số công hoàn thành của issue
        const result = TinhKhoiLuongSoCong(
          unitPrice,
          salaryDetermination,
          deliveredQuantity,
          soCongDatDuoc,
          khoiLuongDatDuoc,
          workdays,
        );
        // [14/11/2024][#20825][phuong_td] Chia điều kiện để cập nhật các thông tin attribute tính tự động cho issue thông thường và issue phát sinh
        if (checkUnexpectedWork()) {
          // [01/12/2024][#21012][phuong_td] kiểm tra giá trị số công nếu là Infinity hoặc NaN thì trả về 0
          const sc = Utils.getNumber(So_Cong.value, 'float') - Utils.getNumber(soCongDatDuoc, 'float');
          let scConlai = 0;
          if (sc !== Infinity && !isNaN(sc)) {
            scConlai = sc;
          }
          So_Cong_Con_Lai.value = `${scConlai}`;
        } else {
          // So_Cong.value = `${result.soCongIssue}`;
          So_Cong_Con_Lai.value = `${result.soCongConLai}`;
          Khoi_Luong_Con_Lai.value = `${result.khoiLuongConLai}`;
        }

        const _attributes = [dinhMucLuong, So_Cong, So_Cong_Con_Lai, Khoi_Luong_Con_Lai];
        // [13/11/2024][#20793][phuong_td] ẩn thông báo khi lưu tự động giá trị tính được
        dispatch(
          issueActions.updateIssueAttributeRequest({
            issueId: selectedWorkWeekly.id,
            attributes: _attributes,
            hiddenNotification: true,
          }),
        );
      }
    }
  }, [employeeReportByIssue]);

  // [07/11/2024][#20719][phuong_td] Cập nhật Field dữ liệu cho form
  useEffect(() => {
    if (checkUnexpectedWork()) {
      form.setFieldsValue({
        workdaysActual: Utils.getNumber(SoCongHoanThanh, 'float'),
      });
    }
    if (selectedWorkWeekly) {
      const { unitPrice, salaryDetermination, deliveredQuantity, workdays } = selectedWorkWeekly;
      handleValuesChange(null, { unitPrice, salaryDetermination, deliveredQuantity });
      const result = TinhKhoiLuongSoCong(
        unitPrice,
        salaryDetermination,
        deliveredQuantity,
        SoCongHoanThanh,
        KhoiLuongDatDuoc,
        workdays,
      );
      // [13/11/2024][#20793][phuong_td] điều chỉnh giá trị hiển thị của số công còn lại
      // console.log("result.soCongConLai",result.soCongConLai)
      // console.log("result",result)

      //[#21068][05/12/2024][hoang_nm] Check thêm trường hợp cv phát sinh
      let isUnexpectedWork = checkUnexpectedWork();
      form.setFieldsValue({
        remainingAmountOfWork: isUnexpectedWork
          ? `${result.soCongConLai}/${result.soCongIssueHT}` // Nếu có công việc bất ngờ
          : `${result.soCongConLai}/${result.soCongIssue}`, // Nếu không có công việc bất ngờ
        remainingVolume: result.remainingVolume,
      });      
    }
  }, [SoCongHoanThanh, KhoiLuongDatDuoc]);

  //#region selectedProject
  useEffect(() => {
    if (selectedWorkWeekly) {
      const _valueType = getType()?.id;
      setValueType(_valueType);
      dispatch(
        issueActions.getIssueTeamsByIssueRequest({
          issueId: selectedWorkWeekly.id,
          params: {},
        }),
      );
      let { trackerId } = selectedWorkWeekly;
      let trackerIdGiaoViecHangNgay = 22;
      if (trackers && trackers.length) {
        const tracker = trackers?.find(t => t.code === eTrackerCode.CongViecHangTuan);
        if (tracker && tracker.id !== null && tracker.id !== undefined) trackerId = tracker.id;

        const trackerGiaoViecHangNgay = trackers?.find(t => t.code === eTrackerCode.GiaoViecTheoNgay);
        if (trackerGiaoViecHangNgay && trackerGiaoViecHangNgay.id !== null && trackerGiaoViecHangNgay.id !== undefined)
          trackerId = trackerGiaoViecHangNgay.id;
      }
      dispatch(issueActions.getOtherResourcesDimByTracker({ trackerId: trackerId }));
      // [07/11/2024][#20719][phuong_td] Bỏ qua việc lấy các thông tin khối lượng giao theo luồng cũ
      // dispatch(
      //   issueActions.getIssueByParentIdRequest({
      //     parentId: selectedWorkWeekly.id,
      //     params: {
      //       trackerId: trackerIdGiaoViecHangNgay,
      //       pageSize: 10000,
      //       page: 1,
      //       paging: false,
      //       // startDate: selectedWorkWeekly.plannedStartDate,
      //       // endDate: selectedWorkWeekly.plannedStartDate,
      //     },
      //   }),
      // );
      // [07/11/2024][#20719][phuong_td] lấy report của issue
      dispatch(
        issueActions.getEmployeeReportByIssue({
          issueId: selectedWorkWeekly.id,
        }),
      );
    }
  }, [dispatch, selectedWorkWeekly]);

  const getTargetData = (issueTargets: IssueTargetDTO[]): IssueTargetDTO | null | undefined => {
    if (issueTargets) {
      if (issueTargets) {
        const { length } = issueTargets;
        if (length > 0) {
          const targetIssue = Utils.clone(issueTargets[length - 1]);
          return targetIssue;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // console.log('valueType ', valueType);
  }, [valueType]);

  // [07/11/2024][#20719][phuong_td] Tính số công theo khối lượng
  const TinhSoCong = (khoiLuongGiao: number, donGia: number, dinhMucLuong: number) => {
    const thanhTien = khoiLuongGiao * donGia;
    // [01/12/2024][#21012][phuong_td] kiểm tra giá trị số công nếu là Infinity hoặc NaN thì trả về 0
    const result = thanhTien / dinhMucLuong;
    if (result === Infinity || isNaN(result)) {
      return 0;
    }
    return result;
  };

  useEffect(() => {
    const _teamsAssign: TeamResponse[] = [];
    let dinhMucLuong = 0;
    let donGia = 0;
    if (selectedWorkWeekly) {
      dinhMucLuong = selectedWorkWeekly.salaryDetermination;
      donGia = selectedWorkWeekly.unitPrice;
    }
    issueTeam?.forEach(_team => {
      const team = teams.find(t => t.id === _team.teamId);
      // [22/10/2024][#20533][phuong_td] Khởi tạo giá trị Team Attribute
      if (team) {
        // [07/11/2024][#20719][phuong_td] Điều chỉnh việc tính số công của team
        const { id, companyId, projectId, name, code, status, leader_Id, shifts, members } = team;
        const { laborCount, actualVolumn, planeVolumn, progress } = _team;
        _teamsAssign.push({
          id: id,
          companyId: companyId,
          projectId: projectId,
          name: name,
          code: code,
          status: status,
          leader_Id: leader_Id,
          shifts: shifts,
          members: members,
          workdays: !checkUnexpectedWork() ? TinhSoCong(planeVolumn ?? 0, donGia, dinhMucLuong) : laborCount ?? 0,
          actualVolumn: actualVolumn ? actualVolumn : 0,
          planeVolumn: planeVolumn ? planeVolumn : 0,
          progress: progress ? progress : 0,
        });
      }
    });
    setTeamsAssign(_teamsAssign);
    setTableKey(Utils.generateRandomString(3));
  }, [issueTeam]);

  useEffect(() => {
    // console.log('team ', teams);
  }, [teams]);

  useEffect(() => {
    // console.log('targets ', targets);
    const _units: optionCustom[] = [];
    const _types: optionCustom[] = [];
    const currentType = getTarget();
    targets?.forEach((t: TargetDTO) => {
      if (!_units.find(u => u.value === t.unitVolume)) {
        _units.push({
          key: Utils.generateRandomString(3),
          id: t.id,
          code: t.code,
          label: t.unitVolume,
          value: t.unitVolume,
        });
      }
      if (!currentType || t.unitVolume === currentType?.targetDim?.unitVolume) {
        _types.push({
          key: Utils.generateRandomString(3),
          id: t.id,
          code: t.code,
          label: t.unitCategory,
          value: t.id,
        });
      }
    });
    setUnits(_units);
    setTypes(_types);
  }, [targets]);

  useEffect(() => {
    // console.log('otherResources ', otherResources);
  }, [otherResources]);

  const { Dragger } = Upload;

  const propsDragger: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    showUploadList: false,
  };

  const removefile = (file: UploadFile<any>) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  //#region handleSaveIssue
  const handleSaveIssue = (values: any) => {
    //console.log("handleSaveIssue",values)
    if (selectedProject && projectMembers && selectedWorkWeekly) {
      const codeProcessing = StatusHelperControl.getCodeByValue(Status.Processing.toString());
      const _type = Types.find(t => t.id === values.type);
      const inputData: WeeklyAssignmentDTO = {
        ...selectedWorkWeekly,
        // id: selectedWorkWeekly.id,
        // workPackageId: selectedWorkWeekly.workPackageId,
        // areaId: selectedWorkWeekly.areaId,
        // assignedTo: selectedWorkWeekly.assignedTo,

        // status: selectedWorkWeekly.status,
        // progress: selectedWorkWeekly.progress,

        // actualEndDate: dayjs(selectedWorkWeekly.actualEndDate).format(FormatDateAPI),
        // actualStartDate: dayjs(selectedWorkWeekly.actualStartDate).format(FormatDateAPI),
        // attachmentLinks: selectedWorkWeekly.attachmentLinks,
        // parentId: selectedWorkWeekly?.id ? selectedWorkWeekly?.id : null,
        // projectId: selectedProject.id,
        // categoryId: values.categoryId,
        trackerId: selectedWorkWeekly.trackerId ? selectedWorkWeekly.trackerId : 20,
        // startDate: values.startDateOfWeek ? dayjs(values.startDateOfWeek).format(FormatDateAPI) : dayjs(selectedWorkWeekly.startDate).format(FormatDateAPI),
        // dueDate: values.endDateOfWeek ? dayjs(values.endDateOfWeek).format(FormatDateAPI) : dayjs(selectedWorkWeekly.dueDate).format(FormatDateAPI),
        subject: values.nameOfWork,
        description: values.jobContent,
        notes: values.notes,
        // plannedStartDate: values.startDateOfWeek ? dayjs(values.startDateOfWeek).format(FormatDateAPI) : dayjs(selectedWorkWeekly.startDate).format(FormatDateAPI),
        // plannedEndDate: values.endDateOfWeek ? dayjs(values.endDateOfWeek).format(FormatDateAPI) : dayjs(selectedWorkWeekly.dueDate).format(FormatDateAPI),
        // type: values.type, // values.type number
        status: codeProcessing ? codeProcessing : selectedWorkWeekly.status,
        // status: selectedWorkWeekly.status,
        // deliveredQuantity: values.deliveredQuantity,
        // unit: values.unitNew,
        // unitPrice: values.unitPrice,
        // workdays: values.workdays,
      };

      const { actualStartDate } = inputData;

      if (!actualStartDate) {
        inputData.actualStartDate = dayjs().format(FormatDateAPI);
      }
      const resources = {
        deliveredQuantity: values.deliveredQuantity?.toString(),
        unit: values.unitNew?.toString(),
        type: values.type,
        unitPrice: values.unitPrice,
        workdays: values.workdays?.toString(),
        salaryDetermination: values.salaryDetermination?.toString(),
      };

      if (selectedWorkWeekly) {
        // if (otherResources && otherResources.length && resources.workdays !== selectedWorkWeekly.workdays) {
        //   const categoryNhanSu = otherResources.find((o)=> o.name === "Nhân Công");
        //   if (categoryNhanSu) {
        //     //#region add Resources
        //     const dataNhansu = [{
        //       requiredQuantity: resources.workdays,
        //       otherResourcesDimId: categoryNhanSu?.id
        //     }];
        //     dispatch(issueActions.addOtherResourcesDimToIssue({id: selectedWorkWeekly.id, data: dataNhansu}));
        //   }
        // }
        //#region create targetIssue
        const { issueTargets } = inputData;
        const length = issueTargets ? issueTargets.length : 0;
        // let targetIssue: IssueTargetDTO | null = getTarget();
        let targetIssue = issueTargets ? issueTargets[length - 1] : null;
        if (issueTargets && length) {
          targetIssue = { ...issueTargets[length - 1] };
        }
        if (!targetIssue) {
          targetIssue = {
            issueId: inputData.id,
            targetId: null,
            planValue: '0',
            actualValue: '0',
            costPerValue: 0,
          };
        }
        targetIssue.planValue = resources.deliveredQuantity ? resources.deliveredQuantity.toString() : '0';
        targetIssue.costPerValue = resources.unitPrice ? resources.unitPrice : 0;
        const target = targets?.find(t => t.id === resources?.type);

        if (target) {
          targetIssue.targetId = target.id;
          targetIssue.targetDim = target;
          dispatch(issueActions.updateTargetToIssue({ id: selectedWorkWeekly.id, data: [targetIssue] }));
        }
        inputData.issueTargets = [targetIssue];

        // if (selectedWorkWeekly) {
        //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //   // [10/11/2024][#20785][phuong_td] lấy giá trị từ form để tính toán thay vì lấy từ issue
        //   const value = form.getFieldsValue([['unitPrice'], ['salaryDetermination']]);
        //   const {deliveredQuantity, unitPrice, salaryDetermination} = value;
        //   // const soCong = TinhSoCong(data, unitPrice, salaryDetermination);
        //   // t.workdays = soCong;
        // }

        // [16/10/2024][#20441][phuong_td] Gắn giá trị So_Cong cho Issue việc phát sinh đột xuất
        let dinhMucLuong: AttributeDimDTO = getAttributeData(eAttribute.Dinh_Muc_Luong);
        let So_Cong: AttributeDimDTO = getAttributeData(eAttribute.So_Cong);

        //[#21068][04/12/2024][hoang_nm] Gắn giá trị So_Cong_Con_Lai và Khoi_Luong_Con_Lai cho Issue việc phát sinh đột xuất
        let So_Cong_Con_Lai: AttributeDimDTO = getAttributeData(eAttribute.So_Cong_Con_Lai);
        let Khoi_Luong_Con_Lai: AttributeDimDTO = getAttributeData(eAttribute.Khoi_Luong_Con_Lai);

        dinhMucLuong.value = resources.salaryDetermination ? resources.salaryDetermination.toString() : '0';
        So_Cong.value = resources.workdays ? resources.workdays.toString() : '0';

        //[#21068][04/12/2024][hoang_nm] Tính giá trị số công còn lại khi click button Lưu
        // const SoCongHoanThanhNew = TinhSoCong(KhoiLuongDatDuoc, values.unitPrice, values.salaryDetermination);
        // let isUnexpectedWork = checkUnexpectedWork();

        //[#21068][04/12/2024][hoang_nm] th phát sinh đột xuất isUnexpectedWork = true
        // if (isUnexpectedWork) {
        //   So_Cong_Con_Lai.value = `${resources.workdays - SoCongHoanThanh}`; //- số công thực tế luôn
        // } else {

        //[04/12/2024][#21068][hoang_nm]Không cần check trường hợp phát sinh nữay
        So_Cong_Con_Lai.value = `${resources.workdays - soconghoanthanhgiaoviec}`; //- số công hoàn thành

        //}
        //[#21068][04/12/2024][hoang_nm] Tính giá trị khối lượng còn lại = khối lượng giao - khối lượng hoàn thành(kl đạt được)
        Khoi_Luong_Con_Lai.value = `${resources.deliveredQuantity - KhoiLuongDatDuoc}`;

        const { attributes } = inputData;
        const _attributes: AttributeDimDTO[] = [];
        let hasDML = false;
        let hasSoCong = false;
        //[#21068][04/12/2024][hoang_nm] Thêm để lưu 2 trườnghasSoCongConLai
        let hasSoCongConLai = false;
        let hasKhoiLuongConLai = false;

        if (attributes) {
          // [16/10/2024][#20441][phuong_td] Duyệt danh sách attribute và gắn giá trị DinhMucLuong và So_Cong
          attributes.forEach(a => {
            const _a = { ...a };
            switch (a.code) {
              case eAttribute.Dinh_Muc_Luong:
                hasDML = true;
                _a.value = dinhMucLuong.value;
                _a.AttributeId = dinhMucLuong.AttributeId;
                _attributes.push(_a);
                break;
              case eAttribute.So_Cong:
                hasSoCong = true;
                _a.value = So_Cong.value;
                _a.AttributeId = So_Cong.AttributeId;
                _attributes.push(_a);
                break;
              //[#21068][04/12/2024][hoang_nm] thêm 2 case So_Cong_Con_Lai và Khoi_Luong_Con_Lai vào issueAttribute
              case eAttribute.So_Cong_Con_Lai:
                hasSoCongConLai = true;
                _a.value = So_Cong_Con_Lai.value;
                _a.AttributeId = So_Cong_Con_Lai.AttributeId;
                _attributes.push(_a);
                break;
              case eAttribute.Khoi_Luong_Con_Lai:
                hasKhoiLuongConLai = true;
                _a.value = Khoi_Luong_Con_Lai.value;
                _a.AttributeId = Khoi_Luong_Con_Lai.AttributeId;
                _attributes.push(_a);
                break;
              default:
            }
            // [26/10/2024][#20441][phuong_td] Sửa lỗi gây trùng lắp Attribute gây lỗi khi gọi api update Issue
            // _attributes.push(_a);
          });
        }
        // [16/10/2024][#20441][phuong_td] Thêm DinhMucLuong và So_Cong nếu trong danh sách Attribute chưa có
        if (!hasDML && dinhMucLuong) {
          _attributes.push(dinhMucLuong);
        }
        if (!hasSoCong && So_Cong) {
          _attributes.push(So_Cong);
        }
        if (!hasSoCongConLai && So_Cong_Con_Lai) {
          _attributes.push(So_Cong_Con_Lai);
        }
        if (!hasKhoiLuongConLai && Khoi_Luong_Con_Lai) {
          _attributes.push(Khoi_Luong_Con_Lai);
        }
        inputData.issueAttributes = _attributes;
        const teamDatas: IssueTeamDTO[] = [];
        // [13/11/2024][#20793][phuong_td] checknull cho các giá trị
        teamsAssign.forEach(a => {
          if (a.id) {
            teamDatas.push({
              issueId: selectedWorkWeekly.id,
              teamId: a.id,
              status: 0,
              laborCount: Utils.getNumber(a.workdays, 'float'),
              progress: Utils.getNumber(a.progress, 'float'),
              planeVolumn: Utils.getNumber(a.planeVolumn, 'float'),
              actualVolumn: Utils.getNumber(a.actualVolumn, 'float'),
            });
          }
        });
        dispatch(
          issueActions.updateIssueTeamsRequest({
            teamDatas,
          }),
        );

        //console.log('inputData ', inputData);
        // console.log('targetIssue ', targetIssue);
        dispatch(
          issueActions.updateIssueRequest({
            issueId: selectedWorkWeekly.id,
            issue: inputData,
            tagVersionId: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
            typeUpdate: eTypeUpdate.AssignWork,
          }),
        );
      }
      // dispatch(issueActions.createIssueRequest({ issue: inputData }));
      handleCancel();
    }
  };

  const getTarget = () => {
    if (selectedWorkWeekly && selectedWorkWeekly.issueTargets) {
      const { issueTargets } = selectedWorkWeekly;
      if (issueTargets) {
        const { length } = issueTargets;
        if (length > 0) {
          const targetIssue = Utils.clone(issueTargets[length - 1]);
          return targetIssue;
        }
      }
    }
    return null;
  };

  const handleAssign = () => {
    const _teamsAssign = [...teamsAssign];
    _teamsAssign.unshift({
      id: 0,
      companyId: 0,
      projectId: 0,
      name: '',
      code: '',
      status: 0,
      leader_Id: 0,
      shifts: [],
      members: [],
      isBlank: true,
      tempId: Utils.generateRandomString(5),
      workdays: 0,
    });
    setTeamsAssign(_teamsAssign);
    // handleJumpToLastPage();
  };

  const handleCancel = () => {
    // [07/11/2024][#20719][phuong_td] xóa dữ liệu report khi đóng dialog
    dispatch(issueActions.setEmployeeReportByIssue(undefined));
    dispatch(issueActions.setSelectedWorkWeekly(undefined));
    dispatch(hideModal({ key: ControlAssignWorkModalName }));
  };

  const handleOk = () => form.submit();

  const onChangeTeam = (event: any, record: TeamResponse, selected: any) => {
    const teamSelected: TeamResponse | undefined = teams.find(t => t.id === selected.value);
    if (teamSelected) {
      const _teamsAssign = teamsAssign.map(t => {
        if ((t.tempId === record.tempId && record.tempId) || (t.id === record.id && !record.tempId)) {
          // teamSelect.workdays = record.workdays;
          return {
            ...teamSelected,
            workdays: 0,
          };
        } else {
          return t;
        }
      });
      if (selected && !selected.data.tempId && selectedWorkWeekly) {
        const issueTeam: IssueTeamDTO = {
          issueId: selectedWorkWeekly.id,
          teamId: selected.value,
          status: 0,
        };
        dispatch(issueActions.createIssueTeamRequest({ issueTeam }));
      }
      setTeamsAssign(_teamsAssign);
    }
  };

  const removeTeam = (teamRemove: TeamResponse) => {
    if (teamRemove && !teamRemove.tempId) {
      dispatch(issueActions.removeIssueTeamRequest({ teamId: teamRemove.id, issueId: selectedWorkWeekly?.id }));
    } else {
      const _teamsAssign = teamsAssign.filter(t => t.tempId !== teamRemove.tempId);
      setTeamsAssign(_teamsAssign);
    }
  };

  // [07/11/2024][#20719][phuong_td] Cập nhật dữ liệu các trường số công và số công thực tế khi các giá trị khác thay đổi
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const { unitPrice, salaryDetermination, deliveredQuantity } = allValues;
    const _teamsAssign = [...teamsAssign];
    // [05/12/2024][#21109][phuong_td] Cập nhật giá trị số công cho tổ đội đối với công việc phát sinh đột xuất
    let isUnexpectedWork = checkUnexpectedWork();
    _teamsAssign.forEach(team => {
      const { planeVolumn, workdays } = team;
      team.workdays = isUnexpectedWork ? workdays : TinhSoCong(planeVolumn ?? 0, unitPrice, salaryDetermination);
    });
    setTeamsAssign(_teamsAssign);
    const soCongIssue = TinhSoCong(deliveredQuantity ?? 0, unitPrice, salaryDetermination);
    const khoiLuongConLai = deliveredQuantity - KhoiLuongDatDuoc;
    // [10/11/2024][#20785][phuong_td] điều chỉnh tính số công hoàn thành theo khối lượng đạt được
    // const soCongTheoKhoiLuongHoanThanh = TinhSoCong(KhoiLuongDatDuoc, unitPrice, salaryDetermination);
    //console.log('isUnexpectedWork');
    //const soCongHT = isUnexpectedWork ? SoCongHoanThanh : soCongTheoKhoiLuongHoanThanh;
    if (selectedWorkWeekly) {
      if (isUnexpectedWork) {
        form.setFieldsValue({
          // workdays: soCongIssue,
          workdaysActual: Utils.getNumber(soconghoanthanhgiaoviec, 'float'),
        });
      } else {
        form.setFieldsValue({
          workdays: Utils.getNumber(soCongIssue, 'float'),
          workdaysActual: Utils.getNumber(soconghoanthanhgiaoviec, 'float'),
        });
      }
    }
  };

  // [07/11/2024][#20719][phuong_td] Tính các giá trị số lượng và sô công hoàn thành
  const TinhKhoiLuongSoCong = (
    unitPrice: number,
    salaryDetermination: number,
    deliveredQuantity: number,
    scHoanThanh: number,
    klDatDuoc: number,
    workdays: number,
  ) => {
    // Tính khối lượng còn lại
    const khoiLuongConLai = deliveredQuantity - klDatDuoc;
    const remainingVolume = `${khoiLuongConLai}/${deliveredQuantity}`;

    // Tính số công theo khối lượng đã hoàn thành
    const soCongTheoKhoiLuongHoanThanh = TinhSoCong(klDatDuoc, unitPrice, salaryDetermination);

    // Tính số công theo khối lượng còn lại
    const soCongTheoKhoiLuongConlai = TinhSoCong(khoiLuongConLai, unitPrice, salaryDetermination);

    // Tính số công theo khối lượng giao
    const soCongIssue = TinhSoCong(deliveredQuantity ?? 0, unitPrice, salaryDetermination);

    // Kiểm tra trạng thái công việc bất ngờ
    const isUnexpectedWork = checkUnexpectedWork();

    // Tính số công thực tế hiển thị (HT)
    let soCongIssueHT;
    if (isUnexpectedWork) {
      soCongIssueHT = workdays; // Trường hợp công việc bất ngờ: lấy số ngày công
      //console.log('soCongIssueHTworkdays', soCongIssueHT);
    } else {
      soCongIssueHT = soCongIssue; // Trường hợp công việc thông thường: số công theo khối lượng giao
      //console.log('soCongIssueHTsoCongIssue', soCongIssueHT);
    }

    //[#21068][05/12/2024][hoang_nm] Check thêm trường hợp cv phát sinh

    const soCongConLai = isUnexpectedWork
      ? soCongIssueHT - soconghoanthanhgiaoviec // Trường hợp bất ngờ
      : workdays - soconghoanthanhgiaoviec; // Trường hợp thông thường
    //console.log('soCongConLai', soCongConLai);
  
    // Tính số công còn lại
    //[#21068][05/12/2024][hoang_nm] Check thêm trường hợp cv phát sinh
    const remainingAmountOfWork = isUnexpectedWork
      ? `${soCongConLai}/${soCongIssueHT}` // Trường hợp bất ngờ
      : `${soCongConLai}/${workdays}`; // Trường hợp thông thường
    //console.log('remainingAmountOfWork', remainingAmountOfWork);
    // [13/11/2024][#20793][phuong_td] Trả về thêm các giá trị cần thiết
    return {
      khoiLuongConLai,
      remainingVolume,
      soCongConLai,
      soCongTheoKhoiLuongHoanThanh,
      soCongTheoKhoiLuongConlai,
      soCongIssue,
      soCongIssueHT,
      remainingAmountOfWork,
    };
  };
  
  //   return {
  //     unitPrice,
  //     salaryDetermination,
  //     deliveredQuantity,
  //     soCongIssue,
  //     soCongConLai: soCongIssue - soconghoanthanhgiaoviec,
  //     soCongTheoKhoiLuongHoanThanh,
  //     soCongTheoKhoiLuongConlai,
  //     khoiLuongConLai,
  //     remainingVolume,
  //     remainingAmountOfWork,
  //   };
  // };

  //#region onChangeWorkdays
  const onChangeDataTeamIssue = (
    event: ChangeEvent<HTMLInputElement>,
    record: TeamResponse,
    type: eTeamIssueAttribute,
  ) => {
    const _teamsAssign = [...teamsAssign];
    for (let i = 0; i < _teamsAssign.length; i += 1) {
      const t = _teamsAssign[i];
      const data = parseFloat(event.target.value);
      // [22/10/2024][#20533][phuong_td] Điều chỉnh để gán giá trị theo loại
      if ((t.tempId === record.tempId && record.tempId) || (t.id === record.id && !record.tempId)) {
        switch (type) {
          case eTeamIssueAttribute.workdays:
            t.workdays = data;
            break;
          case eTeamIssueAttribute.progress:
            t.progress = data;
            break;
          case eTeamIssueAttribute.planeVolumn:
            t.planeVolumn = data;
            // [07/11/2024][#20719][phuong_td] Tính số công cho team khi khối lượng thay đổi
            if (selectedWorkWeekly) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // [10/11/2024][#20785][phuong_td] lấy giá trị từ form để tính toán thay vì lấy từ issue
              const value = form.getFieldsValue([['unitPrice'], ['salaryDetermination']]);
              const { deliveredQuantity, unitPrice, salaryDetermination } = value;
              const soCong = TinhSoCong(data, unitPrice, salaryDetermination);
              t.workdays = soCong;
            }
            break;
          case eTeamIssueAttribute.actualVolumn:
            t.actualVolumn = data;
            break;
        }
        break;
      }
    }
    setTeamsAssign(_teamsAssign);
  };

  const checkDisable = (team: any) => {
    const temp = teamsAssign.find(t => t.id === team.value);
    return temp ? true : false;
  };

  // [22/10/2024][#20533][phuong_td] Cố định trường tên tổ, căn giữa header, thêm 3 trường %HT, Khối lượng giao/ khối lượng đạt được
  //#region columns
  const columns: any = [
    {
      title: t('Team'),
      dataIndex: 'name',
      width: 200,
      align: 'center',
      fixed: 'left',
      render: (value: string, record: TeamResponse) => {
        return (
          <Row gutter={16}>
            <Col span={19}>
              <Select
                placeholder={t('Choose the responsible team')}
                options={teams.map(x => ({ title: x.name, value: x.id, disabled: checkDisable(x) }))}
                style={{ width: '100%' }}
                defaultValue={record.name}
                disabled={!record.tempId}
                optionRender={option => {
                  return (
                    <Button
                      type={'default'}
                      disabled={checkDisable(option.data)}
                      onClick={event => {
                        event.preventDefault();
                        onChangeTeam(option.data, record, option as any);
                      }}
                      style={{ width: '100%' }}
                    >
                      <Space>{option.data.title}</Space>
                    </Button>
                  );
                }}
              />
            </Col>
            <Col span={5}>
              <Button
                icon={<DeleteOutlined style={{ color: '#f00' }} />}
                type={'text'}
                onClick={event => {
                  removeTeam(record);
                }}
                style={{ width: '100%' }}
              ></Button>
            </Col>
          </Row>
        );
      },
    },
    {
      title: t('Team Leader'),
      dataIndex: 'leader_Id',
      width: 200,
      align: 'center',
      render: (value: number, record: any) => {
        let name: string | undefined = '';
        if (value) {
          // const result = dispatch(employeeActions.getEmployeeDetailsRequest({employeeId: value}));
          // console.log(result);
          const e = employees?.find(e => e.id === value);
          if (e) name = `${e.lastName}${e.middleName ? ' ' + e.middleName + ' ' : ' '}${e.firstName}`;
        }
        return <Input value={name} readOnly></Input>;
      },
    },
    // [26/10/2024][phuong_td] bỏ cột %HT
    // {
    //   title: t('Completion Percentage'),
    //   dataIndex: 'progress',
    //   align: 'center',
    //   width: 100,
    //   render: (value: string, record: any) => {
    //     return (<Input defaultValue={`${value ? value : 0}%`} onChange={(event) => onChangeDataTeamIssue(event, record, eTeamIssueAttribute.progress)}></Input>);
    //   },
    // },
    {
      title: t('Workdays'),
      dataIndex: 'workdays',
      width: 100,
      align: 'center',
      render: (value: string, record: any) => {
        // [07/11/2024][#20719][phuong_td] render các element theo mục đích khác nhau cho issue thông thường và phát sinh đột xuất
        let isUnexpectedWork = checkUnexpectedWork();
        if (isUnexpectedWork) {
          return (
            <Input
              type="number"
              defaultValue={value}
              onChange={event => onChangeDataTeamIssue(event, record, eTeamIssueAttribute.workdays)}
            />
          );
        }
        return (
          <Input
            key={Utils.generateRandomString(3)}
            readOnly={!isUnexpectedWork}
            type="number"
            defaultValue={value}
            onChange={event => onChangeDataTeamIssue(event, record, eTeamIssueAttribute.workdays)}
          />
        );
      },
    },
    {
      title: t('Delivered Quantity'),
      dataIndex: 'planeVolumn',
      width: 100,
      align: 'center',
      render: (value: string, record: any) => {
        // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất
        let isUnexpectedWork = checkUnexpectedWork();
        // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi chưa chọn team đảm nhận
        return (
          <Input
            readOnly={isUnexpectedWork || record.isBlank}
            type="number"
            defaultValue={value}
            onChange={event => onChangeDataTeamIssue(event, record, eTeamIssueAttribute.planeVolumn)}
          />
        );
      },
    },
    // [26/10/2024][phuong_td] bỏ cột kl đạt được
    // {
    //   title: t('Number of achievements'),
    //   dataIndex: 'actualVolumn',
    //   width: 100,
    //   align: 'center',
    //   render: (value: string, record: any) => {
    //     return (<Input type='number' defaultValue={value} onChange={(event) => onChangeDataTeamIssue(event, record, eTeamIssueAttribute.actualVolumn)}></Input>);
    //   },
    // },
  ];

  const getType = () => {
    const issueTarget = getTarget();
    if (issueTarget) {
      // return {
      //   id: issueTarget.targetDim?.id,
      //   value: issueTarget.targetDim?.id,
      // };
      return issueTarget.targetDim?.id;
    }
    return null;
  };

  // [16/10/2024][#20441][phuong_td] Điều chỉnh phương thức để lấy data Attribute theo code
  const getAttributeData = (attributeCode: eAttribute): AttributeDimDTO => {
    if (selectedWorkWeekly && selectedWorkWeekly.attributes) {
      const _attributes = selectedWorkWeekly.attributes;
      if (_attributes) {
        const data = _attributes.find(a => a.code === attributeCode);
        if (data) {
          let id = data.id;
          if (attributes) {
            const a = attributes.find(a => a.code === data.code);
            if (a) id = a.id;
          }
          return { ...data, AttributeId: id ? id : 0 };
        }
      }
    }
    const attribute = attributes?.find(a => a.code === attributeCode);
    return {
      value: attribute ? attribute.value : '',
      name: attribute ? attribute.name : attributeCode,
      code: attribute ? attribute.code : attributeCode,
      valueType: attribute ? attribute.valueType : 0,
      status: attribute ? attribute.status : 0,
      notes: attribute ? attribute.notes : '',
      defaultValue: attribute ? attribute.defaultValue : '0',
      companyId: attribute ? attribute.companyId : 1,
      AttributeId: attribute && attribute.id ? attribute.id : 0,
    };
  };

  // [16/10/2024][#20441][phuong_td] Điều chỉnh phương thức để lấy data Attribute theo code
  const getAttributeUpdateData = (attributeCode: eAttribute): AttributesUpdateDTO => {
    if (selectedWorkWeekly && selectedWorkWeekly.attributes) {
      const _attributes = selectedWorkWeekly.attributes;
      if (_attributes) {
        const data = _attributes.find(a => a.code === attributeCode);
        if (data) {
          let id = data.id;
          if (attributes) {
            const a = attributes.find(_a => _a.code === data.code);
            if (a) {
              id = a.id;
            }
          }
          return {
            attributeId: id ?? 0,
            issuesId: selectedWorkWeekly ? selectedWorkWeekly.id : 0,
            dateTimeValue: dayjs().format(FormatDateAPI),
            value: data.value ?? '0',
            valueType: data.valueType,
            code: attributeCode,
          };
        }
      }
    }
    const attribute = attributes?.find(a => a.code === attributeCode);
    return {
      attributeId: attribute && attribute.id ? attribute.id : 0,
      issuesId: selectedWorkWeekly ? selectedWorkWeekly.id : 0,
      dateTimeValue: dayjs().format(FormatDateAPI),
      value: attribute && attribute.value ? attribute.value : '',
      valueType: attribute ? attribute.valueType : 0,
      code: attributeCode,
    };
  };

  // //#region issuesByParentId
  // useEffect(() => {
  //   // console.log('issuesByParentId ', issuesByParentId);
  //   let _actualWorkDay = 0;
  //   if (issuesByParentId) {
  //     const {results} = issuesByParentId;
  //     if (results.length) {
  //       results.forEach((a)=> {
  //         const t = getTargetData(a.issueTargets);
  //         if (t) {
  //           _actualWorkDay += +t?.actualValue;
  //         }
  //       })
  //     }
  //   }
  //   handleReset();
  //   setActualWorkDayTotal(_actualWorkDay);
  // }, [issuesByParentId]);

  //#region getRemainingVolume
  const getRemainingVolume = () => {
    const issueTarget = getTarget();
    if (issueTarget) {
      const { planValue } = issueTarget;
      let p = Utils.fixNumber(planValue);
      let a = Utils.fixNumber(actualWorkDayTotal);
      // actualValue = planValue - tổng của actualValue của các Issue con
      return `${p - a}/${p}`;
    }
    return '0/0';
  };
  //[20481] [nam_do]  tính Khối lượng còn lại = Khối lượng được giao - Tổng khối lượng hoàn thành của issue
  const getRemainingVolumes = () => {
    const issueTarget = getTarget();
    if (issueTarget) {
      const { planValue } = issueTarget;
      let p = Utils.fixNumber(planValue);
      let a = Utils.fixNumber(actualWorkDayTotal);
      // actualValue = planValue - tổng của actualValue của các Issue con
      return `${p - a}`;
    }
    return '0';
  };

  //#region getRemainingAmountOfWork
  const getRemainingAmountOfWork = () => {
    if (selectedWorkWeekly) {
      const { workdays, salaryDetermination, unitPrice } = selectedWorkWeekly;
      // (workdays) Số công ước tính = thành tiền / Định mức lương
      // số công thực tế = tổng của actualValue của các Issue con * Đơn giá / Định mức lương
      // số công còn lại = Số công ước tính -  số công thực tế
      const actualWorkdays = (actualWorkDayTotal * unitPrice) / salaryDetermination;
      // Số công còn lại
      return `${Utils.fixNumber(workdays) - Utils.fixNumber(actualWorkdays)}/${Utils.fixNumber(workdays)}`;
    }
    return '0/0';
  };

  useEffect(() => {
    const remainingAmountOfWork = getRemainingAmountOfWork();
    const remainingVolume = getRemainingVolume();
    const remainingVolumes = getRemainingVolumes();
    form.setFieldsValue({
      remainingAmountOfWork,
      remainingVolume,
      remainingVolumes,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualWorkDayTotal]);

  const getFirstUnit = () => {
    if (Units && Units.length > 0) {
      const unit = Units[0].code;
      const type: optionCustom[] = [];
      targets?.forEach(ta => {
        if (ta.unitVolume === unit) {
          type.push({
            key: Utils.generateRandomString(3),
            id: ta.id,
            code: ta.code,
            label: ta.unitCategory,
            value: ta.id,
          });
        }
      });
      return unit;
    }
    return [];
  };

  const getWorkday = (value: any) => {
    if (typeof value === 'number') {
      if (isNaN(value) || value === Infinity) return 0;
    }
    return value;
  };

  return (
    <Modal
      title={
        <Space direction={'vertical'}>
          <Typography.Text style={{ fontSize: '20px' }}>{t('Assign work weekly')}</Typography.Text>
          <Typography.Text>{selectedWorkWeekly?.subject}</Typography.Text>
        </Space>
      }
      centered
      open={isModalOpen}
      closable={true}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={tCommon('Save')}
      width={1300} // Đặt kích thước Modal ở đây
      footer={(_, { OkBtn, CancelBtn }) => (
        <Space>
          <OkBtn />
        </Space>
      )}
    >
      <Space style={{ height: 500 }}>
        <Row gutter={[16, 16]}>
          <Col span={11}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                selectedWorkWeekly: selectedWorkWeekly,
                actualWorkDay: actualWorkDayTotal,
                subject: selectedWorkWeekly && selectedWorkWeekly.subject,
                status: selectedWorkWeekly && selectedWorkWeekly.status,
                startDateOfWeek: dayjs().startOf('week'),
                endDateOfWeek: dayjs().endOf('week'),
                nameOfWork: selectedWorkWeekly?.subject,
                jobContent: selectedWorkWeekly?.description,
                notes: selectedWorkWeekly?.notes,
                deliveredQuantity: selectedWorkWeekly?.deliveredQuantity,
                unitNew: selectedWorkWeekly?.unit ? selectedWorkWeekly?.unit : getFirstUnit(),
                unit: selectedWorkWeekly?.unit ? selectedWorkWeekly?.unit : getFirstUnit(),
                type: getType(),
                unitPrice: selectedWorkWeekly?.unitPrice,
                salaryDetermination: selectedWorkWeekly?.salaryDetermination,
                workdays: getWorkday(selectedWorkWeekly?.workdays),
                workdaysActual: checkUnexpectedWork() ? SoCongHoanThanh : 0,
                category: categorys?.find(c => c.id === selectedWorkWeekly?.categoryId)?.name, // selectedWorkWeekly?.categoryId,
                nameJob: selectedWorkWeekly?.subject,
                startDate: selectedWorkWeekly?.plannedStartDate ? dayjs(selectedWorkWeekly?.plannedStartDate) : '',
                dueDate: selectedWorkWeekly?.plannedEndDate ? dayjs(selectedWorkWeekly?.plannedEndDate) : '',
                progress: selectedWorkWeekly?.progress,
                remainingVolume: getRemainingVolume(), // khối lượng còn lại/ kế hoạch
                remainingVolumes: getRemainingVolumes(),
                remainingAmountOfWork: getRemainingAmountOfWork(), // số công còn lại/ kế hoạch
              }}
              onFinish={handleSaveIssue}
              onValuesChange={handleValuesChange}
              autoComplete="off"
              key={formKey}
              style={{ height: 700 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Start day of the week')}</Typography>}
                    name="startDateOfWeek"
                  >
                    <DatePicker style={{ width: '100%' }} format={formatDateDisplay} allowClear={false} />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('End day of the week')}</Typography>}
                    name="endDateOfWeek"
                  >
                    <DatePicker style={{ width: '100%' }} format={formatDateDisplay} allowClear={false} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <Typography style={{ fontWeight: 'bold' }}>{t('Name of work assigned for this week')}</Typography>
                    }
                    name="nameOfWork"
                    rules={[{ required: true, message: t('Please input name of work assigned for this week!') }]}
                  >
                    <Input placeholder={t('Name of work assigned for this week')} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Job content')}</Typography>}
                    name="jobContent"
                    rules={[{ required: true, message: t('Please input job content!') }]}
                  >
                    <Input placeholder={t('Enter job content')} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  {/* Sửa tên trường dữ liệu ghi chú của form */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Note')}</Typography>}
                    name="notes"
                    rules={[{ required: false, message: t('Please input notes!') }]}
                  >
                    <Input placeholder={t('Enter work notes')} />
                  </Form.Item>
                </Col>
                {
                  //#region Dòng Target
                }
                <Col span={24} md={8}>
                  {/* Khối lượng giao */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Delivered Quantity')}</Typography>}
                    name="deliveredQuantity"
                  >
                    {/* // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất */}
                    <InputNumber
                      readOnly={checkUnexpectedWork()}
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Enter volume')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col>
                {/* thêm cột KL còn lại */}
                {/* <Col span={24} md={8}>
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Remaining volume')}</Typography>}
                    name="remainingVolumes"
                  >
                    <InputNumber
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Enter volume')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col> */}
                <Col span={24} md={8}>
                  {/* Đơn vị tính */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Unit Full Text')}</Typography>}
                    name="unitNew"
                    rules={[{ required: false, message: t('Please input supervisor!') }]}
                  >
                    {/* <Select
                    options={Units.map(x => ({ key: x.key, label: x.label, value: x.value }))}
                    placeholder={t('Choose the unit of measurement')}
                  /> */}
                    {/* // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất */}
                    <Select
                      disabled={checkUnexpectedWork()}
                      options={Units.map(x => ({ key: x.key, label: x.label, value: x.value }))}
                      placeholder={t('Choose the unit of measurement')}
                      onChange={event => {
                        const type: optionCustom[] = [];
                        targets?.forEach(ta => {
                          if (ta.unitVolume === event) {
                            type.push({
                              key: Utils.generateRandomString(3),
                              id: ta.id,
                              code: ta.code,
                              label: ta.unitCategory,
                              value: ta.id,
                            });
                          }
                        });
                        // handleClear('Types');
                        setTypes(type);
                      }}
                    >
                      {Units.map(item => (
                        <Option key={item.key} value={item.value} name={item.label}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  {/* Loại vật liệu */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Type')}</Typography>}
                    // [16/10/2024][#20441][phuong_td] bỏ qua required khi issue thuộc loại Phát sinh đột xuất
                    name="type"
                    rules={[{ required: selectedWorkWeekly?.type !== 2, message: t('Vui lòng chọn loại') }]}
                  >
                    {/* // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất */}
                    <Select
                      disabled={checkUnexpectedWork()}
                      value={valueType}
                      onChange={handleChange}
                      options={Types.map(x => ({ key: x.key, label: x.label, value: x.value }))}
                      placeholder={t('Choose type')}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  {/* Đơn giá */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Unit price')}</Typography>}
                    name="unitPrice"
                  >
                    {/* // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất */}
                    <InputNumber
                      readOnly={checkUnexpectedWork()}
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Enter unit price')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  {/* Định mức lương */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Salary determination')}</Typography>}
                    name="salaryDetermination"
                  >
                    {/* // [07/11/2024][#20719][phuong_td] vô hiệu hóa nhập khi là issue phát sinh đột xuất */}
                    <InputNumber
                      readOnly={checkUnexpectedWork()}
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Input Salary determination')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  {/* Số Công Giao*/}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Number of works assignment')}</Typography>}
                    name="workdays"
                  >
                    {/* <>// [16/10/2024][#20441][phuong_td] cho phép nhập Số Công khi issue thuộc loại Phát sinh đột xuất</> */}
                    <InputNumber
                      readOnly={selectedWorkWeekly?.type !== eNatureOfTheJob.UnexpectedWork}
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Enter the number')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col>

                {/* [#20797][hoang_nm][27/11/2024] Ẩn số công thực tế với 2 trường hợp(Công việc phát sinh chi tiết- type = 1, Công việc lặp lại hàng ngày- type =0) */}
                {/* ẩn số công thực tế */}
                <Col
                  span={24}
                  md={8}
                  style={{
                    display: selectedWorkWeekly?.type === 0 || selectedWorkWeekly?.type === 1 ? 'none' : 'block',
                  }}
                >
                  {/* Số Công Thực Tế */}
                  <Form.Item
                    label={<Typography style={{ fontWeight: 'bold' }}>{t('Number of works actual')}</Typography>}
                    name="workdaysActual"
                  >
                    {/* [16/10/2024][#20441][phuong_td] cho phép nhập Số Công khi issue thuộc loại Phát sinh đột xuất */}
                    <InputNumber
                      // readOnly={selectedWorkWeekly?.type !== eNatureOfTheJob.UnexpectedWork}
                      readOnly
                      max={maxNumber}
                      min={0}
                      controls={false}
                      placeholder={t('Enter the number')}
                      className={styles.inputItem}
                    />
                  </Form.Item>
                </Col>
                {
                  //#region Thông tin Issue
                }
                <Col span={24}>
                  <Row
                    style={{
                      border: '1px solid rgb(0, 255, 213)',
                      borderRadius: '4px',
                      padding: '8px 0',
                      margin: 0,
                    }}
                    gutter={[16, 16]}
                  >
                    <Col span={24} md={6}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('Name category')}</Typography>}
                        name="category"
                      >
                        <Select
                          disabled
                          options={Category(categorys, tCategory)}
                          optionLabelProp="id"
                          value={selectedWorkWeekly?.categoryId}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={18}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('The name of the job')}</Typography>}
                        name="nameJob"
                      >
                        <Input readOnly />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={8}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('Start day')}</Typography>}
                        name="startDate"
                      >
                        <DatePicker disabled format={formatDateDisplay} />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={8}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('End date')}</Typography>}
                        name="dueDate"
                      >
                        <DatePicker disabled format={formatDateDisplay} />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={8}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('Progress has been made')}</Typography>}
                        name="progress"
                      >
                        <Progress percent={selectedWorkWeekly?.progress ? selectedWorkWeekly?.progress : 0} />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={8}>
                      <Form.Item
                        label={
                          <Typography style={{ fontWeight: 'bold' }}>{`${t('Remaining volume')}/ ${t(
                            'Plan',
                          )}`}</Typography>
                        }
                        name="remainingVolume"
                      >
                        <Input readOnly />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={6}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('Unit Full Text')}</Typography>}
                        name="unit"
                      >
                        <Select disabled allowClear options={Units.map(x => ({ label: x.label, value: x.value }))} />
                      </Form.Item>
                    </Col>
                    <Col span={24} md={10}>
                      <Form.Item
                        label={<Typography style={{ fontWeight: 'bold' }}>{t('Remaining amount of work')}</Typography>}
                        name="remainingAmountOfWork"
                      >
                        <Input readOnly />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col span={13}>
            <Table
              key={tableKey}
              rowKey={record => {
                const { id } = record;
                return id ? id.toString() : Utils.generateRandomString(5);
              }}
              columns={columns}
              dataSource={teamsAssign}
              scroll={{
                x: 700,
                y: 500,
              }}
              // pagination={{
              //   current: current,
              //   pageSize: pageSize,
              //   onChange: page => setCurrent(page),
              // }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="middle"
                        style={{
                          width: '80px',
                        }}
                        onClick={() => {
                          handleAssign();
                        }}
                      />
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Col>
        </Row>
      </Space>
    </Modal>
  );
};
