/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, InputNumber, Modal, Select, Space, Table, Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import {
  accountingInvoice,
  AutoCompleteOptions,
  EPaymentMethod,
  eStatusRequest,
  eTypeVatTu,
  eTypeVatTuMayMoc,
  FormatDateAPI,
  madvcs,
  paymentOptions,
  PhieuDeNghiMuaHangDTO,
  ProposalType,
} from '@/common/define';
import { maKhoTongMM, maKhoTongVT } from '@/environment';
import Confirm from '@/pages/Components/Confirm/Confirm';
import { AccountingInvoiceService, ChiTietDeNghiMuaHangDTO, ProposalFormDTO, VatTuMayMocDeXuatDTO } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import {
  accountingInvoiceActions,
  getbaoCaoXuatNhapTonSLTonKhoKhoTong,
  getCaoXuatNhapTonSLTonKhoCacKhoConLai,
  getChiTietHangHoa,
  getClearData,
  getDanhSachBoPhan,
  getNccList,
  getPriceAndNcc,
  getProducts,
  getProposalFormSelected,
  getStatusRequest,
  getTonkho,
  getTonKhoTheoNgay,
  getWareHouses
} from '@/store/accountingInvoice';
import { getCurrentCompany, getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCategorys, getSession } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getEmployeesByCompanyId, getSelectedProject, projectActions } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';
import AutoCompleteCustom from '../AutoCompleteCustom';
import styles from './NewMachineryMaterialList.module.css';
import AddNcc from './addNcc/addNcc';

// ----------------------------------------------------------------

enum eDataFieldName {
  key,
  ma,
  ten,
  donvi,
  klkehoach,
  tonkho,
  klconlai,
  dexuat,
  ngaynhap,
  ghichu,
  maKho,
  tenKho,
  Mavv,
  DienGiai,
  gia1,
  ncc1,
  gia2,
  ncc2,
  gia3,
  ncc3,
  isRowFuction,
  min,
  nearest,
  slTonKhoKhoTong,
  slTonKhoCacKhoConLai,
  kl,
  nccMin,
  nccNearest,
  tt1,
  tt2,
  tt3,
  ttMin,
  ttNearest,
}

interface IDataModifying {
  ma?: string;
  ten?: string;
  dexuat?: number;
  ghichu?: string;
  maKho?: string;
  tenKho?: string;
  Mavv?: string;
  DienGiai?: string;
  gia1?: string;
  gia2?: string;
  gia3?: string;
  ncc1?: string;
  ncc2?: string;
  ncc3?: string;
  guid?: string;
  min?: string;
  nearest?: string;
  slTonKhoKhoTong?: string;
  slTonKhoCacKhoConLai?: string;
  nccMin?: string;
  nccNearest?: string;
  tt1?: string;
  tt2?: string;
  tt3?: string;
  ttMin?: string;
  ttNearest?: string;
  hinhthuc_tt?: number;
}
let dataModifying: {
  [key: string]: IDataModifying;
} = {};
let optionsName: AutoCompleteOptions[] = [];
let optionsCode: AutoCompleteOptions[] = [];
let optionsNcc: AutoCompleteOptions[] = [];
let currentScreen: eTypeVatTuMayMoc = eTypeVatTuMayMoc.VatTuChinh;

const NewMachineryMaterialList: React.FC<{
  type: eTypeVatTuMayMoc;
  handleClose: () => void;
}> = ({ type, handleClose }) => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(getProducts());
  const [producsts, setProducsts] = useState(products.filter(item => item.productType !== 2));
  const [machineries, setMachineries] = useState(products.filter(item => item.productType === 2));

  // [21/10/2024][phuong_td] Bắt giá trị session để gọi lại API
  const session = useAppSelector(getSession());
  const tonKhoTheoNgay = useAppSelector(getTonKhoTheoNgay());
  const tonKho = useAppSelector(getTonkho());
  const proposalFormSelected = useAppSelector(getProposalFormSelected());
  const BaoCaoXuatNhapTonSlTonKho = useAppSelector(getbaoCaoXuatNhapTonSLTonKhoKhoTong());
  const BaoCaoXuatNhapTonSlTonKhoCacKhoConLai = useAppSelector(getCaoXuatNhapTonSLTonKhoCacKhoConLai());

  // const [optionsName, setOptionsName] = useState<AutoCompleteOptions[]>([]);
  // const [optionsCode, setOptionsCode] = useState<AutoCompleteOptions[]>([]);
  const company = useAppSelector(getCurrentCompany());
  const wareHouses = useAppSelector(getWareHouses());
  const selectedProject = useAppSelector(getSelectedProject());
  const ChiTietHangHoa = useAppSelector(getChiTietHangHoa());
  const statusRequest = useAppSelector(getStatusRequest());
  const user = useAppSelector(getCurrentUser());
  const clearData = useAppSelector(getClearData());
  const danhSachBoPhan = useAppSelector(getDanhSachBoPhan());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dataDinhmuc = useAppSelector((state: RootState) => state.accountingInvoice.KLdinhmuc);
  const [newNccKey, setNewNccKey] = useState<string | null>(null);
  // [22/10/2024][phuong_td] thêm key cho table để bắt table reander lại
  const [tableKey, setTableKey] = useState<string>(Utils.generateRandomString(3));

  const defaultPaymentMethod = type === eTypeVatTuMayMoc.VatTuChinh ? EPaymentMethod.Debt : EPaymentMethod.Cash;

  const currentWarehouseCode = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? type === eTypeVatTuMayMoc.MayMoc
        ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
        : projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : undefined // Không gán giá trị nếu projectwareHouses rỗng
    : type === eTypeVatTuMayMoc.MayMoc
      ? maKhoTongMM
      : maKhoTongVT;
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const isLoading = useAppSelector(getLoading(accountingInvoice.GetTonKho));
  // const isLoading = true;
  // [20703] [ngoc_td] bỏ cấp duyệt 0
  const summary: ProposalType = {
    key: 'summary',
    ma: '',
    ten: 'Tổng',
    donvi: '',
    klkehoach: '',
    tonkho: '',
    klconlai: '',
    dexuat: '0',
    ngaynhap: '',
    ghichu: '',
    isRowFuction: true,
    maKho: '',
    tenKho: '',
    Mavv: '',
    DienGiai: '',
    capDuyet: 1,
  };
  const [selectedProposal, setSelectedProposal] = useState<PhieuDeNghiMuaHangDTO | undefined>(proposalFormSelected);
  const priceAndNcc = useAppSelector(getPriceAndNcc());
  const nccList = useAppSelector(getNccList());
  const [priceAndNcc1, setPriceAndNcc] = useState<any[]>(priceAndNcc);
  const [dataSource, setDataSource] = useState<ProposalType[]>([]);
  const projectList = useAppSelector(state => state.project.projectList);
  const [daySelected, setDaySelected] = useState<Dayjs>(dayjs());
  const [GoodsReceiptDate, setGoodsReceiptDate] = useState<Dayjs>(dayjs());
  const [dienGiai, setDienGiai] = useState<string>();
  const [department, setDepartment] = useState<string | undefined>('');
  const [maPhieu, setMaPhieu] = useState<string>('DX2509_2');
  const [category, setCategory] = useState<any>();
  const categorys = useAppSelector(getCategorys());
  const tCategory = useTranslation('category').t;
  const [level, setlevel] = useState([2, 3, 4, 5]);
  const [capDuyet, setcapDuyet] = useState<number>(type === eTypeVatTuMayMoc.VatTuChinh ? 3 : type === eTypeVatTuMayMoc.VatTuPhu ? 3 : 3);
  const employeesByCompanyId = useAppSelector(getEmployeesByCompanyId());
  const [proponent, setProponent] = useState<string>(Utils.getFullName(user));
  const userCode = employeesByCompanyId.find(emp => emp.contactDetail.workEmail === user.Email)?.employeeCode || '';
  const [proponentCode, setProponentCode] = useState<string>(userCode);
  const [tongThanhTien1, setTongThanhTien1] = useState(0);
  const [tongThanhTien2, setTongThanhTien2] = useState(0);
  const [tongThanhTien3, setTongThanhTien3] = useState(0);
  const [tongThanhTienMin, setTongThanhTienMin] = useState(0);
  const [tongThanhTienNearest, setTongThanhTienNearest] = useState(0);
  const [project, setProject] = useState<any>();
  const [userData, setUserData] = useState<{ email: string; phone: string; id: string; userName: string }>({
    email: user.Email,
    phone: user.PhoneNumber,
    id: user.Id,
    userName: user.UserName,
  });
  const [notification, setNotification] = useState<string>('');
  const defaultDepartment = danhSachBoPhan?.find(item => item.in_Lookup);
  useEffect(() => {
    if (company) {
      dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);
  useEffect(() => {
    setSelectedProposal(proposalFormSelected)
  }, [proposalFormSelected]);
  useEffect(() => {
    const userCode = employeesByCompanyId.find(emp => emp.contactDetail.workEmail === user.Email)?.employeeCode || '';
    setProponentCode(userCode);
  }, [employeesByCompanyId, user]);
  useEffect(() => {
    setPriceAndNcc(priceAndNcc1);
  }, [priceAndNcc1]);
  useEffect(() => {
    const bophan = danhSachBoPhan?.find((b) => b.ma_bo_phan === selectedProposal?.ma_bo_phan);
    setDepartment(bophan?.ten_bo_phan ?? defaultDepartment?.ten_bo_phan);
  }, [danhSachBoPhan]);
  useEffect(() => {
    GetTonKho([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectwareHouses]);

  useEffect(() => {
    resetDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearData]);

  async function getProjectId(): Promise<number | undefined> {
    const id = wareHouses.find(w => w.ma_kho === selectedProposal?.chiTietDeNghiMuaHang?.[0]?.ma_kho)?.id; if (!id) return undefined;
    return new Promise((resolve, reject) => {
      ProjectService.Get.getProjectWarehousesbyId(id).subscribe({
        next: (res) => {
          if (res && Array.isArray(res) && res.length > 0) {
            resolve(res[0].projectId);
          } else if (res?.projectId) {
            resolve(res.projectId);
          } else {
            resolve(undefined);
          }
        },
        error: (error) => {
          console.error('Error getting projectId:', error);
          reject(error);
        }
      });
    });
  }

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const projectId = await getProjectId();
        const projectFound = projectList.find(p => p.id === projectId)?.name || 'Tổng';
        setProject(projectFound); // Lưu giá trị projectId vào state
      } catch (error) {
        console.error('Error fetching projectId:', error);
      }
    };
    if (wareHouses.length > 0) {
      fetchProjectId();
    }
  }, [wareHouses]);
  const resetDataSource = () => {
    dataModifying = {};
    setDataSource((prevDataSource: any) => {
      return [];
    });
    // [20703] [ngoc_td] bỏ cấp duyệt 0
    setcapDuyet(type === eTypeVatTuMayMoc.VatTuChinh ? 3 : type === eTypeVatTuMayMoc.VatTuPhu ? 3 : 3);
    setDienGiai('');
    setDaySelected(dayjs());
    setDepartment('');
    setTongThanhTien1(0);
    setTongThanhTien2(0);
    setTongThanhTien3(0);
    setTongThanhTienNearest(0);
    setTongThanhTienMin(0);
  };
  useEffect(() => {
    if (
      statusRequest &&
      statusRequest.api === accountingInvoice.CreateProposalForm &&
      statusRequest.status === eStatusRequest.success
    ) {
      resetDataSource();
      handleClose();
      dispatch(accountingInvoiceActions.setStatusRequest(undefined));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusRequest]);

  useEffect(() => {
    // resetDataSource();
    // setcapDuyet(1);
    // setDienGiai('');
    dispatch(accountingInvoiceActions.GetDanhSachBoPhan({ params: {} }));
    if (selectedProject) {
      dispatch(
        projectActions.getWarehousesRequest({
          projectId: selectedProject.id,
        }),
      );
    } else {
      dispatch(projectActions.setprojectwarehouse([]));
    }
    setcapDuyet(type === eTypeVatTuMayMoc.VatTuChinh ? 3 : type === eTypeVatTuMayMoc.VatTuPhu ? 3 : 3);
    currentScreen = type;
    GetTonKho([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, type]);

  useEffect(() => {
    if (selectedProposal) {
      convertPhieuDeXuat(selectedProposal);
      const danhSachMaHang = selectedProposal.chiTietDeNghiMuaHang?.map(d => d.ma_vt) || [];
      getGiaandNcc(danhSachMaHang);
    } else {
      resetDataSource();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProposal]);

  const tinhKLConlai = (klDinhMuc: number, tonkho: number, dexuat: number) => {
    return klDinhMuc - tonkho - dexuat;
    // return tonkho - dexuat;
  }

  const createOptionsVatTu = (loaiVT: eTypeVatTu) => {
    const oName: AutoCompleteOptions[] = [];
    const oCode: AutoCompleteOptions[] = [];
    if (producsts && producsts.length) {
      producsts.forEach(p => {
        if (p.productType === loaiVT) {
          // [15/10/2024][#20438][phuong_td] Add codes before the name of the material
          oName.push({
            label: `${p.ma_vt} / ${p.ten_vt}`,
            value: p.ma_vt,
            item: {
              name: p.ten_vt,
              code: p.ma_vt,
            }
          });
          oCode.push({
            label: `${p.ma_vt} / ${p.ten_vt}`,
            value: p.ma_vt,
            item: {
              name: p.ten_vt,
              code: p.ma_vt,
            }
          });
        }
      });
    }
    // setOptionsName(oName);
    // setOptionsCode(oCode);
    optionsName = oName;
    optionsCode = oCode;
    setTableKey(Utils.generateRandomString(3));
  };
  //[20433] [ngoc_td] tao danh sach ncc tu data redux
  const createOptionsNcc = () => {
    const oName: AutoCompleteOptions[] = [];

    if (nccList && nccList.length) {
      nccList.forEach(ncc => {
        oName.push({
          label: `${ncc.ma_kh} / ${ncc.ten_kh}`,  // Adding both code and name
          value: ncc.ma_kh,
          item: {
            name: ncc.ten_kh,
            code: ncc.ma_kh,
          }
        });
      });
    }

    // Assign these options to be used in renderAutocomplete for NCC fields
    optionsNcc = oName;
    // setOptionsNcc(oName);
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource];
      for (let i = 0; i < newDataSource.length; i++) {
        const data = newDataSource[i];
        const item = dataModifying[data.key];
        newDataSource[i].ncc1 = renderAutoComplete(newDataSource[i].key, optionsNcc, item.ncc1 || '', getPlaceholder(eDataFieldName.ncc1), eDataFieldName.ncc1);
        newDataSource[i].ncc2 = renderAutoComplete(newDataSource[i].key, optionsNcc, item.ncc2 || '', getPlaceholder(eDataFieldName.ncc2), eDataFieldName.ncc2);
        newDataSource[i].ncc3 = renderAutoComplete(newDataSource[i].key, optionsNcc, item.ncc3 || '', getPlaceholder(eDataFieldName.ncc3), eDataFieldName.ncc3);
      }
      return newDataSource;
    });
  };
  const createOptionsMayMoc = () => {
    const oName: AutoCompleteOptions[] = [];
    const oCode: AutoCompleteOptions[] = [];
    if (machineries && machineries.length) {
      machineries.forEach(p => {
        // [15/10/2024][#20438][phuong_td] Add codes before the name of the material
        oName.push({
          label: `${p.ma_vt} / ${p.ten_vt}`,
          value: p.ma_vt,
          item: {
            name: p.ten_vt,
            code: p.ma_vt,
          }
        });
        oCode.push({
          label: `${p.ma_vt} / ${p.ten_vt}`,
          value: p.ma_vt,
          item: {
            name: p.ten_vt,
            code: p.ma_vt,
          }
        });
      });
    }
    // setOptionsName(oName);
    // setOptionsCode(oCode);
    optionsName = oName;
    optionsCode = oCode;
  };
  useEffect(() => {
    let reset = false;
    currentScreen = type;
    switch (currentScreen) {
      case eTypeVatTuMayMoc.VatTuChinh:
        if (producsts && producsts.length) {
          createOptionsVatTu(eTypeVatTu.VatTuChinh);
          reset = true;
        }
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        if (producsts && producsts.length) {
          createOptionsVatTu(eTypeVatTu.VatTuPhu);
          reset = true;
        }
        break;
      case eTypeVatTuMayMoc.MayMoc:
        if (machineries && machineries.length) {
          createOptionsMayMoc();
          reset = true;
        }
        break;
    }

    if (nccList && nccList.length) {
      createOptionsNcc();
    }

    if (selectedProject) {
      dispatch(
        projectActions.getWarehousesRequest({
          projectId: selectedProject.id,
        })
      );
    }
  }, [products, nccList, type, session]);

  useEffect(() => {
  }, [optionsName]);

  useEffect(() => {
    GenerateOutgoingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, dienGiai]);

  useEffect(() => {
    if (tonKhoTheoNgay && tonKhoTheoNgay.length) {
      setDataSource((prevDataSource: any) => {
        const newDataSource = [...prevDataSource];
        for (let i = 0; i < newDataSource.length; i++) {
          if (!newDataSource[i].isRowFuction) {
            let code = getData(newDataSource[i].ma);
            let kl_theo_ke_hoach = getData(newDataSource[i].kl_theo_ke_hoach);
            const kldinhmucitem = dataDinhmuc.find(t => t.ma_vt === code);
            const kldinhmuc = parseFloat(kldinhmucitem ? kldinhmucitem.luong_xuat.toString() : '0');
            newDataSource[i].klkehoach = <Input value={kldinhmuc} readOnly />;
            // newDataSource[i].tonkho = <Input value={tonkho} readOnly />;
            // newDataSource[i].klconlai = <Input value={tonkho} readOnly />;
          }
        }
        return newDataSource;
      });
    }
  }, [tonKhoTheoNgay]);

  useEffect(() => {
    if (tonKhoTheoNgay && tonKhoTheoNgay.length) {
      setDataSource((prevDataSource: any) => {
        const newDataSource = [...prevDataSource];
        for (let i = 0; i < newDataSource.length; i++) {
          const m = getData(newDataSource[i].ma);
          if (m) {
            const tk_thuchien = tonKho?.find(t => t.ma_vt === m);
            let luongTon = tk_thuchien ? tk_thuchien?.luong_ton : 0;
            let dx = dataModifying[newDataSource[i].key]?.dexuat || 0;
            const vt = selectedProposal?.chiTietDeNghiMuaHang?.find(ct => ct.ma_vt === m);
            if (vt) {
              luongTon = vt.ton_kho;
              dx = vt.so_luong_yeu_cau;
            }
            newDataSource[i].tonkho = renderInput(true, luongTon.toString(), newDataSource[i].key, eDataFieldName.tonkho);
            newDataSource[i].klconlai = renderInput(true, tinhKLConlai(0, luongTon, dx).toString(), newDataSource[i].key, eDataFieldName.klconlai);
          }
        }
        return newDataSource;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonKho]);

  const getData = (data: string | JSX.Element) => {
    if (typeof data === 'string') {
      return data;
    } else {
      return data?.props.value;
    }
  };
  // [16/10/2024][#20413][ngoc_td] use api in component to avoid bugs 
  const getGiaandNcc = async (danhSachMaHang: string[]) => {
    await AccountingInvoiceService.Post.GetGiaVaNhaCungCap({
      madvcs: 'THUCHIEN',
      danhSachMaHang: danhSachMaHang,
      ngay_kiem_tra: dayjs().format(FormatDateAPI),
      danhSachMakho: [],
    }).subscribe((res) => {
      // Check if res is an empty string or invalid JSON
      if (!res || res.trim() === '') {
        const defaultData = danhSachMaHang.map(ma_vt => ({
          ma_vt,
          gia_thap_nhat: "0",
          gia_cao_nhat: "0",
          ngay_gan_nhat: "",
          gia_gan_nhat: "0",
          nha_cung_cap_gan_nhat: ""
        }));
        console.log(defaultData, 'min');
        GetTheLowestSupplierPrice(defaultData);  // Pass an empty array
        GetTheNearestSupplierPrice(defaultData);  // Pass an empty array
        return;  // Exit early if res is empty
      }

      // Proceed with processing the response if not empty
      let data = res
        .replaceAll('\\"', '"') // Replace escaped double quotes
        .replaceAll(/"\[|\]"/g, (match: string) => match.replace(/"/g, '')) // Remove quotes before/after brackets
        .replaceAll(/\n/g, '')  // Remove newline characters
        .replaceAll(/\r/g, ''); // Remove carriage return characters

      try {
        const jsonParse = JSON.parse(data);
        // Process based on type
        GetTheLowestSupplierPrice(jsonParse);
        GetTheNearestSupplierPrice(jsonParse);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        GetTheLowestSupplierPrice([]);  // Pass an empty array in case of error
        GetTheNearestSupplierPrice([]);  // Pass an empty array in case of error
      }
    });
  }; // [16/10/2024][#20413][ngoc_td]  add async await for button

  const GetTheLowestSupplierPrice = async (data: any[]) => {
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource];
      let TongTTMin = 0;

      for (let i = 0; i < newDataSource.length; i++) {
        const maItem = newDataSource[i].ma?.props?.value || newDataSource[i].ma;

        const matchedItem = data.find((item: { ma_vt: string }) => item.ma_vt === maItem);

        if (matchedItem) {
          const gia_thap_nhat = matchedItem.gia_thap_nhat;
          const min = gia_thap_nhat
            ? Number(gia_thap_nhat.toString().replace(/\.(\d*?)0+$/, '.$1').replace(/\.$/, ''))
            : 0;

          newDataSource[i].min = min.toLocaleString('en-US');
          newDataSource[i].ttMin = (
            gia_thap_nhat * (dataModifying[newDataSource[i].key]?.dexuat || 0)
          ).toLocaleString('en-US');
        } else {
          // Không tìm thấy item tương ứng
          newDataSource[i].min = 0;
          newDataSource[i].ttMin = '0';
        }

        TongTTMin += Number((newDataSource[i].ttMin as string).replace(/,/g, '') || 0);
      }

      setTongThanhTienMin(TongTTMin);
      console.log(newDataSource);
      return newDataSource;
    });
  };

  const GetTheNearestSupplierPrice = async (data: any[]) => {
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource];
      let TongTTNearest = 0;

      for (let i = 0; i < newDataSource.length; i++) {
        const maItem = newDataSource[i].ma?.props?.value || newDataSource[i].ma;

        const matchedItem = data.find((item: { ma_vt: string }) => item.ma_vt === maItem);

        if (matchedItem) {
          const { gia_gan_nhat, nha_cung_cap_gan_nhat } = matchedItem;

          const nearest = gia_gan_nhat
            ? Number(gia_gan_nhat.toString().replace(/\.(\d*?)0+$/, '.$1').replace(/\.$/, ''))
            : 0;

          const ncc = optionsNcc.find(i => i.item.code === nha_cung_cap_gan_nhat);

          newDataSource[i].nearest = nearest.toLocaleString('en-US');
          newDataSource[i].ttNearest = (
            gia_gan_nhat * (dataModifying[newDataSource[i].key]?.dexuat || 0)
          ).toLocaleString('en-US');
          newDataSource[i].nccNearest = ncc?.item.name || '';
        } else {
          // Không tìm thấy item tương ứng
          newDataSource[i].nearest = 0;
          newDataSource[i].ttNearest = '0';
          newDataSource[i].nccNearest = '';
        }

        TongTTNearest += Number((newDataSource[i].ttNearest as string).replace(/,/g, '') || 0);
      }

      setTongThanhTienNearest(TongTTNearest);
      return newDataSource;
    });
  };
  const GenerateOutgoingData = () => {
    const data: ProposalFormDTO = {
      ma_phieu: maPhieu || '',
      dien_giai: dienGiai || '',
      hang_muc: category,
      ngay_tao: daySelected.format(FormatDateAPI),
      vat_tu_may_moc: [],
      capDuyet: capDuyet || 3,
      ngay_hoa_don: GoodsReceiptDate ? GoodsReceiptDate.format(FormatDateAPI) : dayjs().format(FormatDateAPI),
    };
    dataSource.forEach((d: ProposalType) => {
      const ma = getData(d.ma);
      if (!d.isRowFuction && ma !== '') {
        const itemMod = dataModifying[d.key];
        const item: VatTuMayMocDeXuatDTO = {
          ma,
          ten: getData(d.ten),
          dvt: getData(d.donvi),
          kl_theo_ke_hoach: getData(d.klkehoach),
          ton_kho_thuc_te: getData(d.tonkho),
          kl_con_lai: getData(d.klconlai),
          de_xuat_lan_nay: itemMod?.dexuat || 0,
          // ngay_yeu_cau_nhap_ve: getData(d.ngaynhap),
          ghi_chu: itemMod?.ghichu || '',
          maKho: itemMod?.maKho || '',
          tenKho: itemMod?.tenKho || '',
          Mavv: itemMod?.Mavv || '',
          DienGiai: itemMod?.DienGiai || '',
          gia1: itemMod?.gia1 || '0',
          gia2: itemMod?.gia2 || '0',
          gia3: itemMod?.gia3 || '0',
          nhaCungCap1: itemMod?.ncc1 || '',
          nhaCungCap2: itemMod?.ncc2 || '',
          nhaCungCap3: itemMod?.ncc3 || '',
          hinhthuc_tt: itemMod && itemMod.hinhthuc_tt !== undefined
            ? itemMod.hinhthuc_tt
            : defaultPaymentMethod
        };
        if (itemMod && itemMod.guid) {
          item.guid = itemMod.guid;
        }
        data.vat_tu_may_moc.push(item);
      }
    });
    return data;
  };
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const { t } = useTranslation('material');
  const tCommon = useTranslation('common').t;

  const getDonViTinh = (code: string) => {
    switch (currentScreen) {
      case eTypeVatTuMayMoc.VatTuChinh:
        {
          const pr = producsts.find(v => v.ma_vt === code && v.productType === eTypeVatTu.VatTuChinh);
          if (pr) return pr.dvt;
        }
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        {
          const pr = producsts.find(v => v.ma_vt === code && v.productType === eTypeVatTu.VatTuPhu);
          if (pr) return pr.dvt;
        }
        break;
      case eTypeVatTuMayMoc.MayMoc:
        {
          const pr = machineries.find(v => v.ma_vt === code);
          if (pr) return pr.dvt;
        }
        break;
    }
    return '';
  };

  useEffect(() => {
    GetTonKho([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daySelected]);

  const GetDanhSachMaKho = () => {
    const danhSachMakho: string[] = [];
    if (projectwareHouses) {
      switch (currentScreen) {
        case eTypeVatTuMayMoc.VatTuChinh:
        case eTypeVatTuMayMoc.VatTuPhu:
          const khoVT = projectwareHouses.filter(w => !w.warehouseCode.includes('CCDC')).map(w => w.warehouseCode);
          danhSachMakho.push(...khoVT);
          break;
        case eTypeVatTuMayMoc.MayMoc:
          const khoCCDC = projectwareHouses.filter(w => w.warehouseCode.includes('CCDC')).map(w => w.warehouseCode);
          danhSachMakho.push(...khoCCDC);
          break;
      }
      if (projectwareHouses?.length === 1 && danhSachMakho.length === 0) {
        danhSachMakho.push(projectwareHouses[0].warehouseCode);
      }
    }
    if (!selectedProject) {
      switch (currentScreen) {
        case eTypeVatTuMayMoc.VatTuChinh:
        case eTypeVatTuMayMoc.VatTuPhu:
          danhSachMakho.push(maKhoTongVT);
          break;
        case eTypeVatTuMayMoc.MayMoc:
          danhSachMakho.push(maKhoTongMM);
          break;
      }
    }
    return danhSachMakho;
  };

  const GetTonKho = (_codes: string[]) => {
    const codes = [..._codes];

    // Add codes from dataSource
    dataSource.forEach(d => {
      const code = getData(d.ma);
      if (code) codes.push(code);
    });
    const danhSachMakho: string[] = GetDanhSachMaKho();
    dispatch(
      accountingInvoiceActions.GetTonKho({
        data: {
          madvcs: madvcs.KEHOACH,
          danhSachMaHang: codes,
          ngay_kiem_tra: daySelected.format(FormatDateAPI),
          danhSachMakho,
        },
        params: {},
        TonKhoTheoNgay: true
      }),
    );
  };

  const handelSelect = (id: string, data: string, type: eDataFieldName, key: string) => {
    const listMKTong = ['TONGTEST_CCDC', 'TONG_CCDC']
    const url = window.location.href;
    const MaKho = url.includes('namviethung') ? 'TONG_CCDC' : 'TONGTEST_CCDC';

    dispatch(accountingInvoiceActions.getBaoCaoXuatNhapTon({
      params: {
        data: {
          tu_ngay: dayjs().format('YYYY-MM-DD'),
          keyStore: 'slTonKhoKhoTong',
          madvcs: madvcs.THUCHIEN,
          ma_kho: selectedProject ? MaKho : currentWarehouseCode,
          den_ngay: dayjs().format('YYYY-MM-DD'),
          otherFilter: `'${data}'`,
        }
      }
    }))
    dispatch(accountingInvoiceActions.getBaoCaoXuatNhapTon({
      params: {
        data: {
          tu_ngay: dayjs().format('YYYY-MM-DD'),
          keyStore: 'slTonKhoCacKhoConLai',
          madvcs: madvcs.THUCHIEN,
          ma_kho: `${listMKTong?.map(vt => `'${vt}'`).join(',')}`,
          den_ngay: dayjs().format('YYYY-MM-DD'),
          otherFilter: `'${data}'`,
        }
      }
    }))
    const name = optionsName.find(i => i.value === data);
    const ncc = optionsNcc.find(i => i.item.code === data);
    let codes: string[] = [];
    switch (type) {
      case eDataFieldName.ma:
        if (name) codes.push(name.value);
        break;
      case eDataFieldName.ten:
        codes.push(data);
        break;
    }
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource];
      for (let i = 0; i < newDataSource.length; i++) {
        if (newDataSource[i].key === id) {
          switch (type) {
            case eDataFieldName.ma:
              if (name) {
                newDataSource[i].ten = renderAutoComplete(
                  id,
                  optionsName,
                  name.item.name,
                  getPlaceholder(eDataFieldName.ten),
                  eDataFieldName.ten,
                );
                newDataSource[i].ma = renderAutoComplete(
                  id,
                  optionsCode,
                  name.item.code,
                  getPlaceholder(eDataFieldName.ma),
                  eDataFieldName.ma,
                  { width: 400 },
                );
                // [15/10/2024][#20437][phuong_td] Attach the value of dhengiai when choosing machinery materials
                newDataSource[i].DienGiai = renderInput(false, name.item.name, id, eDataFieldName.DienGiai);
                const prev = dataModifying[newDataSource[i].key];
                dataModifying = {
                  ...dataModifying,
                  [newDataSource[i].key]: { ...prev, DienGiai: name?.item?.name || '' },
                };
                newDataSource[i].donvi = <Input value={getDonViTinh(name.value)} readOnly />;
                dataModifying = {
                  ...dataModifying,
                  [newDataSource[i].key]: { ...prev, ten: name?.item?.name || '' },
                }
                dataModifying = {
                  ...dataModifying,
                  [newDataSource[i].key]: { ...prev, ma: name?.item?.code || '' },
                }
              }
              break;
            case eDataFieldName.ten:
              newDataSource[i].ten = renderAutoComplete(
                id,
                optionsName,
                name?.item?.name || '',
                getPlaceholder(eDataFieldName.ten),
                eDataFieldName.ten,
              );
              newDataSource[i].ma = renderAutoComplete(
                id,
                optionsCode,
                name?.item?.code || '',
                getPlaceholder(eDataFieldName.ma),
                eDataFieldName.ma,
                { width: 400 },
              );
              // [15/10/2024][#20437][phuong_td] Attach the value of dhengiai when choosing machinery materials
              newDataSource[i].DienGiai = renderInput(false, name?.item?.name || '', id, eDataFieldName.DienGiai);
              const prev = dataModifying[newDataSource[i].key];
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, DienGiai: name?.item?.name || '' },
              };
              newDataSource[i].donvi = <Input value={getDonViTinh(data)} readOnly />;
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ten: name?.item?.name || '' },
              }
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ma: name?.item?.code || '' },
              }
              break;
            case eDataFieldName.ncc1:
              updateData(ncc?.item.name || '', eDataFieldName.ncc1, newDataSource[i].key);
              newDataSource[i].ncc1 = renderAutoComplete(
                id,
                optionsNcc,
                ncc?.item.name || '',
                getPlaceholder(eDataFieldName.ncc1),
                eDataFieldName.ncc1,
              );
              break;
            case eDataFieldName.ncc2:
              updateData(ncc?.item.name || '', eDataFieldName.ncc2, newDataSource[i].key);
              newDataSource[i].ncc2 = renderAutoComplete(
                id,
                optionsNcc,
                ncc?.item.name || '',
                getPlaceholder(eDataFieldName.ncc2),
                eDataFieldName.ncc2,
              );
              break;
            case eDataFieldName.ncc3:
              updateData(ncc?.item.name || '', eDataFieldName.ncc3, newDataSource[i].key);
              newDataSource[i].ncc3 = renderAutoComplete(
                id,
                optionsNcc,
                ncc?.item.name || '',
                getPlaceholder(eDataFieldName.ncc3),
                eDataFieldName.ncc3,
              );
              break;
          }
        }
        const m = getData(newDataSource[i].ma);
        if (m) {
          const tk_thuchien = tonKho?.find(t => t.ma_vt === m);
          const luongTon = tk_thuchien ? tk_thuchien.luong_ton : 0;
          const dx = dataModifying[newDataSource[i].key]?.dexuat || 0;
          newDataSource[i].tonkho = renderInput(true, luongTon.toString(), newDataSource[i].key, eDataFieldName.tonkho);
          newDataSource[i].klconlai = renderInput(true, tinhKLConlai(0, luongTon, dx).toString(), newDataSource[i].key, eDataFieldName.klconlai);
          const kldinhmucitem = dataDinhmuc.find(t => t.ma_vt === m);
          const kldinhmuc = parseFloat(kldinhmucitem ? kldinhmucitem.luong_xuat.toString() : '0');
          newDataSource[i].klkehoach = <Input value={kldinhmuc} readOnly />;
        }
      }
      return newDataSource;
    });
    getGiaandNcc(Object.values(dataModifying).map(item => item.ma).filter((ma): ma is string => ma !== undefined));
  };

  // Implement #21904 [hao_lt]
  useEffect(() => {
    if (!BaoCaoXuatNhapTonSlTonKho.length && !BaoCaoXuatNhapTonSlTonKhoCacKhoConLai.length) return;
    setDataSource(prev => {
      const newDataSource: any = [...prev];
      for (let i = 0; i < newDataSource.length; i++) {
        const m = getData(newDataSource[i].ma);
        // Nếu có dữ liệu từ kho tổng
        if (m && BaoCaoXuatNhapTonSlTonKho?.length) {
          const ton = BaoCaoXuatNhapTonSlTonKho.find(t => t?.ma_vt === m);
          if (ton) {
            newDataSource[i].slTonKhoKhoTong = ton ? Math.max(parseInt(ton.ton_cuoi || '0'), 0) : 0;
          }
        }
        // Nếu có dữ liệu từ các kho còn lại
        if (m && BaoCaoXuatNhapTonSlTonKhoCacKhoConLai?.length) {
          const check = BaoCaoXuatNhapTonSlTonKhoCacKhoConLai.find(t => t.ma_vt === m);
          if (check) {
            const ton = BaoCaoXuatNhapTonSlTonKhoCacKhoConLai.filter(t => t.ma_vt === m);
            if (ton) {
              const tong =
                ton &&
                ton.reduce((sum: any, item: any) => {
                  return sum + (parseFloat(item?.ton_cuoi ?? '0') || 0);
                }, 0);
              newDataSource[i].slTonKhoCacKhoConLai = tong > 0 ? Math.max(parseInt(tong), 0) : 0; // hoặc làm tròn nếu muốn
            }
            const datanewtool =
              ton &&
              ton.map(item => {
                return {
                  ma_kho: item.ma_kho,
                  ton_cuoi: item.ton_cuoi,
                };
              });
            newDataSource[i].Tooltip = datanewtool;
          }
        }
      }
      return newDataSource;
    });
  }, [BaoCaoXuatNhapTonSlTonKho, BaoCaoXuatNhapTonSlTonKhoCacKhoConLai]);

  const formatNumber = (value: string) => {
    if (typeof value === "string") {
      return parseFloat(value.replace(/,/g, "")) || 0;
    }
    return value;
  };

  // [22/10] [ngoc_td] fix reset data Ncc to Vattu
  const renderAutoComplete = (
    newKey: string,
    options: AutoCompleteOptions[],
    value: string,
    placeholder: string,
    typeHandleSelect: eDataFieldName,
    dropdownStyle?: React.CSSProperties,
    status?: 'error' | 'warning',
  ) => {
    // Thêm tùy chọn "Add NCC" vào options nếu là ncc1, ncc2 hoặc ncc3
    const updatedOptions = [...options];

    return (
      <AutoCompleteCustom
        keyElement={Utils.generateRandomString(3)}
        className={styles.newRow}
        optionsList={updatedOptions} // Sử dụng options mới có "Add NCC"
        id={newKey}
        status={status}
        onChange={(key: string, data: string) => {
        }}
        warning={'Value does not exist'}
        onBlur={(key: string, data: any) => {
          setDataSource((prevDataSource: ProposalType[]) => {
            const newDataSource = [...prevDataSource];
            for (let i = 0; i < newDataSource.length; i++) {
              if (newDataSource[i].key === key) {
                switch (typeHandleSelect) {
                  case eDataFieldName.ma:
                    newDataSource[i].ma = renderAutoComplete(
                      key,
                      optionsCode,
                      data,
                      getPlaceholder(eDataFieldName.ma),
                      eDataFieldName.ma,
                      { width: 400 },
                    );
                    const prev = dataModifying[newDataSource[i].key];
                    dataModifying = {
                      ...dataModifying,
                      [newDataSource[i].key]: { ...prev, ma: data || '' },
                    }
                    break;
                  case eDataFieldName.ten:
                    newDataSource[i].ten = renderAutoComplete(
                      key,
                      optionsName,
                      data,
                      getPlaceholder(eDataFieldName.ten),
                      eDataFieldName.ten,
                    );
                    break;
                  case eDataFieldName.ncc1:
                    newDataSource[i].ncc1 = renderAutoComplete(
                      key,
                      optionsNcc,
                      data,
                      getPlaceholder(typeHandleSelect),
                      typeHandleSelect,
                    );
                    break;
                  case eDataFieldName.ncc2:
                    newDataSource[i].ncc2 = renderAutoComplete(
                      key,
                      optionsNcc,
                      data,
                      getPlaceholder(typeHandleSelect),
                      typeHandleSelect,
                    );
                    break;
                  case eDataFieldName.ncc3:
                    newDataSource[i].ncc3 = renderAutoComplete(
                      key,
                      optionsNcc,
                      data,
                      getPlaceholder(typeHandleSelect),
                      typeHandleSelect,
                    );
                    break;
                  default:
                }
              }
            }
            return newDataSource;
          });
        }}
        onSelect={(id: string, data: any) => {
          handelSelect(id, data, typeHandleSelect, newKey);
        }}
        value={value}
        placeholder={placeholder}
        dropdownStyle={dropdownStyle}
      />
    );
  };

  // [22/10] [ngoc_td] fix render  reset to 0
  const renderInputNumber = (readOnly: boolean, value: string, key: string, type: eDataFieldName) => {
    const numericValue = value ? Number(value.replace(/,/g, '')) : 0; // Nếu value có, chuyển đổi thành số, nếu không thì gán 0
    updateData(numericValue.toString(), type, key);
    return (
      <InputNumber<number>
        key={Utils.generateRandomString(3)}
        className={styles.newRow}
        formatter={(value) => {
          // Đảm bảo giá trị không phải là undefined hoặc null
          if (!value) return '0';

          // Chia giá trị thành số và định dạng
          const numValue = Number(value.toString().replace(/,/g, '')); // Loại bỏ dấu phẩy trước
          return `${numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Định dạng số và thêm dấu `$`
        }}
        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number} // Hàm parser giữ nguyên

        defaultValue={numericValue}
        onChange={(v: string | number | null) => {
          const rawValue = v ? v.toString().replace(/,/g, '') : ''; // Loại bỏ dấu phẩy khi thay đổi giá trị
          updateData(rawValue, type, key);
        }}
      />
    );
  };

  const renderInput = (readOnly: boolean, value: string, key: string, type: eDataFieldName) => {
    updateData(value, type, key);
    if (readOnly) {
      return (
        <Input
          key={Utils.generateRandomString(3)}
          className={styles.newRow}
          readOnly={readOnly}
          value={value}
          onChange={v => {
            updateData(v.target.value, type, key);
          }}
        />
      );
    }
    // [15/10/2024][#20437][phuong_td] Add the key for the input to tie the value of value
    return (
      <Input
        key={Utils.generateRandomString(3)}
        className={styles.newRow}
        readOnly={readOnly}
        // [22/10/2024][phuong_td] chỉ gắn giá trị bằng defaultValue để tránh tình trạng không nhập dữ liệu đc
        defaultValue={value}
        onChange={v => {
          updateData(v.target.value, type, key);
        }}
      />
    );
  };
  useEffect(() => {
    let TongTT1 = 0;
    let TongTT2 = 0;
    let TongTT3 = 0;
    let TongTTMin = 0;
    let TongTTMNearest = 0;
    for (let i = 0; i < dataSource.length; i++) {
      if (typeof dataSource[i].tt1 === 'string' && typeof dataSource[i].tt2 === 'string' && typeof dataSource[i].tt3 === 'string') {
        TongTT1 += Number((dataSource[i].tt1 as string).replace(/,/g, '') || 0);
        TongTT2 += Number((dataSource[i].tt2 as string).replace(/,/g, '') || 0);
        TongTT3 += Number((dataSource[i].tt3 as string).replace(/,/g, '') || 0);
        TongTTMin += Number((dataSource[i].ttMin as string).replace(/,/g, '') || 0);
        TongTTMNearest += Number((dataSource[i].ttNearest as string).replace(/,/g, '') || 0);
      }
      setTongThanhTien1(TongTT1);
      setTongThanhTien2(TongTT2);
      setTongThanhTien3(TongTT3);
      setTongThanhTienMin(TongTTMin);
      setTongThanhTienNearest(TongTTMNearest);
    }
  }, [dataSource])
  const updateData = (data: string | null, type: eDataFieldName, key: string) => {
    setDataSource((prevDataSource: ProposalType[]) => {
      const newDataSource = [...prevDataSource];
      let TongTT1 = 0;
      let TongTT2 = 0;
      let TongTT3 = 0;
      let TongTTMin = 0;
      let TongTTMNearest = 0;
      for (let i = 0; i < newDataSource.length; i++) {
        if (newDataSource[i].key === key) {

          const prev = dataModifying[newDataSource[i].key] || {};
          switch (type) {
            case eDataFieldName.dexuat:
              let dx = 0;
              if (data) {
                try {
                  dx = parseFloat(data);
                } catch (error) { }
              }
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, dexuat: dx },
              };
              const klDinhMuc = 0;
              const tonkho = getData(newDataSource[i].tonkho);
              const klconlai = tinhKLConlai(klDinhMuc, tonkho, dx);
              newDataSource[i].klconlai = renderInput(
                true,
                Utils.fixNumber(klconlai).toString(),
                key,
                eDataFieldName.klconlai,
              );
              const dexuatValue = Number(dx || 0);
              const gia1Value = Number(Number(dataModifying[key]?.gia1) || 0);
              const gia2Value = Number(Number(dataModifying[key]?.gia2) || 0);
              const gia3Value = Number(Number(dataModifying[key]?.gia3) || 0);
              const minValue =
                typeof newDataSource[i].min === 'string'
                  ? Number((newDataSource[i].min as string).replace(/,/g, ''))
                  : 0;
              const nearestValue =
                typeof newDataSource[i].nearest === 'string'
                  ? Number((newDataSource[i].nearest as string).replace(/,/g, ''))
                  : 0;
              const tt1Value = dexuatValue * gia1Value;
              const tt2Value = dexuatValue * gia2Value;
              const tt3Value = dexuatValue * gia3Value;
              const ttMinValue = dexuatValue * minValue;
              const ttNearestValue = dexuatValue * nearestValue;
              newDataSource[i].tt1 = tt1Value.toLocaleString('en-US');
              newDataSource[i].tt2 = tt2Value.toLocaleString('en-US');
              newDataSource[i].tt3 = tt3Value.toLocaleString('en-US');
              newDataSource[i].ttMin = ttMinValue.toLocaleString('en-US');
              newDataSource[i].ttNearest = ttNearestValue.toLocaleString('en-US');
              break;
            case eDataFieldName.gia1:
              let gia1 = 0;
              if (data) {
                try {
                  gia1 = parseFloat(data);
                } catch (error) { }
              }
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, gia1: gia1.toString() },
              };

              const dx1Value = Number(Number(dataModifying[key]?.dexuat) || 0);
              const d1Value = Number(gia1 || 0);
              const ttValue1 = dx1Value * d1Value;
              newDataSource[i].tt1 = ttValue1.toLocaleString('en-US');
              break;
            case eDataFieldName.gia2:
              let gia2 = 0;
              if (data) {
                try {
                  gia2 = parseFloat(data);
                } catch (error) { }
              }
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, gia2: gia2.toString() },
              };

              const dx2Value = Number(Number(dataModifying[key]?.dexuat) || 0);
              const d2Value = Number(gia2 || 0);
              const ttValue2 = dx2Value * d2Value;
              newDataSource[i].tt2 = ttValue2.toLocaleString('en-US');
              break;
            case eDataFieldName.gia3:
              let gia3 = 0;
              if (data) {
                try {
                  gia3 = parseFloat(data);
                } catch (error) { }
              }
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, gia3: gia3.toString() },
              };

              const dx3Value = Number(Number(dataModifying[key]?.dexuat) || 0);
              const d3Value = Number(gia3 || 0);
              const ttValue3 = dx3Value * d3Value;
              newDataSource[i].tt3 = ttValue3.toLocaleString('en-US');
              break;
            case eDataFieldName.ghichu:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ghichu: data || '' },
              };

              break;
            case eDataFieldName.maKho:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, maKho: data || '' },
              };

              break;
            case eDataFieldName.tenKho:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, tenKho: data || '' },
              };

              break;
            case eDataFieldName.Mavv:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, Mavv: data || '' },
              };

              break;
            case eDataFieldName.DienGiai:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, DienGiai: data || '' },
              };
              break;
            case eDataFieldName.ncc1:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ncc1: data || '' },
              };
              break;
            case eDataFieldName.ncc2:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ncc2: data || '' },
              };
              break;
            case eDataFieldName.ncc3:
              dataModifying = {
                ...dataModifying,
                [newDataSource[i].key]: { ...prev, ncc3: data || '' },
              };
              break;
            default:
          }
        }
        if (typeof newDataSource[i].tt1 === 'string' && typeof newDataSource[i].tt2 === 'string' && typeof newDataSource[i].tt3 === 'string') {
          TongTT1 += Number((newDataSource[i].tt1 as string).replace(/,/g, '') || 0);
          TongTT2 += Number((newDataSource[i].tt2 as string).replace(/,/g, '') || 0);
          TongTT3 += Number((newDataSource[i].tt3 as string).replace(/,/g, '') || 0);
          TongTTMin += Number((newDataSource[i].ttMin as string).replace(/,/g, '') || 0);
          TongTTMNearest += Number((newDataSource[i].ttNearest as string).replace(/,/g, '') || 0);
        }

      }
      setTongThanhTien1(TongTT1);
      setTongThanhTien2(TongTT2);
      setTongThanhTien3(TongTT3);
      setTongThanhTienMin(TongTTMin);
      setTongThanhTienNearest(TongTTMNearest);
      return newDataSource;
    });
  };

  const removeItem = (key: string) => {
    setDataSource((prevDataSource: any[]) => {
      delete dataModifying[key];
      return prevDataSource.filter(i => i.key !== key);
    });
  };
  //[	20433] [ngoc_td] update getPlaceholder for autoComplete
  const getPlaceholder = (typeValue: eDataFieldName) => {
    switch (typeValue) {
      case eDataFieldName.ten:
        return currentScreen !== eTypeVatTuMayMoc.MayMoc ? t('Enter material name') : t('Enter machines name');
      case eDataFieldName.ma:
        return currentScreen !== eTypeVatTuMayMoc.MayMoc ? t('Enter material code') : t('Enter machines code');
      case eDataFieldName.ncc1:
        return 'Nhập nhà cung cấp'
      case eDataFieldName.ncc2:
        return 'Nhập nhà cung cấp';
      case eDataFieldName.ncc3:
        return 'Nhập nhà cung cấp';
    }
    return '';
  };

  const getKhoHienTai = () => {
    let maKho = proposalFormSelected?.chiTietDeNghiMuaHang?.[0]?.ma_kho || '';
    let tenKho = '';
    // Nếu proposalFormSelected đã có ma_kho, không cần xử lý danh sách kho nữa
    if (!maKho) {
      const danhSachMakho: string[] = GetDanhSachMaKho();

      if (danhSachMakho && danhSachMakho.length) {
        switch (currentScreen) {
          case eTypeVatTuMayMoc.VatTuChinh:
          case eTypeVatTuMayMoc.VatTuPhu:
            maKho = danhSachMakho.find(i => !i.includes('CCDC')) || '';
            break;
          case eTypeVatTuMayMoc.MayMoc:
            maKho = danhSachMakho.find(i => i.includes('CCDC')) || '';
            break;
        }

        if (danhSachMakho.length === 1 && !maKho) {
          maKho = danhSachMakho[0];
        }
      }
    }
    tenKho = getTenKho(maKho || '');
    return { maKho, tenKho };
  };

  const getTenKho = (maKho: string) => {
    if (!maKho || !wareHouses || !wareHouses.length) return '';

    const kho = wareHouses.find(w => w.ma_kho === maKho);
    return kho ? kho.ten_kho : '';
  };

  const handleAddRow = () => {
    const newKey = Utils.generateRandomString(15);
    const kho = getKhoHienTai();
    let maKho = kho.maKho || '';
    let tenKho = kho.tenKho || '';
    dataModifying = {
      ...dataModifying,
      [newKey]: { maKho, tenKho, dexuat: 0, hinhthuc_tt: defaultPaymentMethod },
    };
    const newRow: ProposalType = {
      key: newKey,
      ma: renderAutoComplete(newKey, optionsCode, '', getPlaceholder(eDataFieldName.ma), eDataFieldName.ma, {
        width: 400,
      }),
      ten: renderAutoComplete(newKey, optionsName, '', getPlaceholder(eDataFieldName.ten), eDataFieldName.ten),
      donvi: renderInputNumber(true, '', newKey, eDataFieldName.donvi),
      klkehoach: renderInputNumber(true, '0', newKey, eDataFieldName.klkehoach),
      tonkho: renderInputNumber(true, '0', newKey, eDataFieldName.tonkho),
      klconlai: renderInputNumber(true, '0', newKey, eDataFieldName.klconlai),
      dexuat: renderInputNumber(false, '0', newKey, eDataFieldName.dexuat),
      min: '0',
      nearest: '0',
      gia1: renderInputNumber(false, '0', newKey, eDataFieldName.gia1),
      gia2: renderInputNumber(false, '0', newKey, eDataFieldName.gia2),
      gia3: renderInputNumber(false, '0', newKey, eDataFieldName.gia3),
      tt1: '0',
      tt2: '0',
      tt3: '0',
      ttMin: '0',
      ttNearest: '0',
      ncc1: renderAutoComplete(newKey, optionsNcc, '', getPlaceholder(eDataFieldName.ncc1), eDataFieldName.ncc1, {
        width: 400,
      }),
      ncc2: renderAutoComplete(newKey, optionsNcc, '', getPlaceholder(eDataFieldName.ncc2), eDataFieldName.ncc2, {
        width: 400,
      }),
      nccNearest: '',
      nccMin: '',
      ncc3: renderAutoComplete(newKey, optionsNcc, '', getPlaceholder(eDataFieldName.ncc3), eDataFieldName.ncc3, {
        width: 400,
      }),
      // ngaynhap: <DatePicker className={styles.newRow} />,
      ghichu: renderInput(false, '', newKey, eDataFieldName.ghichu),
      maKho: renderInput(true, maKho, newKey, eDataFieldName.maKho),
      tenKho: renderInput(true, tenKho, newKey, eDataFieldName.tenKho),
      Mavv: renderInput(false, '', newKey, eDataFieldName.Mavv),
      DienGiai: renderInput(false, '', newKey, eDataFieldName.DienGiai),
      hinhthuc_tt: defaultPaymentMethod,
    };
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource, newRow];
      return newDataSource;
    });
    setNewRows(new Set(newRows.add(newKey)));
  };

  const getTenVatTuVaDonViTinh = (ma: string) => {
    let ten = '';
    let donViTinh = '';
    switch (currentScreen) {
      case eTypeVatTuMayMoc.VatTuChinh:
      case eTypeVatTuMayMoc.VatTuPhu:
        if (producsts && producsts.length) {
          const vt = producsts.find(p => p.ma_vt === ma);
          if (vt) {
            ten = vt.ten_vt;
            donViTinh = vt.dvt;
          }
        }
        break;
      case eTypeVatTuMayMoc.MayMoc:
        if (machineries && machineries.length) {
          const vt = machineries.find(p => p.ma_vt === ma);
          if (vt) {
            ten = vt.ten_vt;
            donViTinh = vt.dvt;
          }
        }
        break;
    }
    return { ten, donViTinh };
  };

  useEffect(() => {
    // createDanhSachVatTu(ChiTietHangHoa);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ChiTietHangHoa]);
  //[	20433] [ngoc_td] update createDanhSachVatTu for autoComplete

  const createDanhSachVatTu = (dsChiTietDeNghiMuaHang: ChiTietDeNghiMuaHangDTO[]) => {
    const datas: ProposalType[] = [];
    dataModifying = {};
    const mavattu: string[] = [];
    if (dsChiTietDeNghiMuaHang) {
      dsChiTietDeNghiMuaHang.forEach(c => {
        const newKey = c.guid || Utils.generateRandomString(15);
        mavattu.push(c.ma_vt);
        const result = getTenVatTuVaDonViTinh(c.ma_vt);
        let ten = result.ten;
        let dvt = result.donViTinh;
        let klkehoach = '';
        let tonkho = c.ton_kho || 0;
        let klconlai = tinhKLConlai(0, tonkho, c.so_luong_yeu_cau / 1);
        let note = '';
        let tenKho = getTenKho(c.ma_kho);
        const payment = c.hinhthuc_tt !== undefined && c.hinhthuc_tt !== null
          ? c.hinhthuc_tt
          : defaultPaymentMethod;
        dataModifying = {
          ...dataModifying,
          [newKey]: {
            dexuat: c.so_luong_yeu_cau / 1,
            // ghichu: ,
            maKho: c.ma_kho,
            tenKho: tenKho,
            // Mavv: ,
            DienGiai: c.dien_giai,
            guid: c.guid,
            gia1: c.gia1?.toString() || '0',
            gia2: c.gia2?.toString() || '0',
            gia3: c.gia3?.toString() || '0',
            tt1: ((c.gia1 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
            tt2: ((c.gia2 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
            tt3: ((c.gia3 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
            ncc1: c.nhaCungCap1 || '',
            ncc2: c.nhaCungCap2 || '',
            ncc3: c.nhaCungCap3 || '',
            hinhthuc_tt: payment,
          },
        };
        // [22/10/2024][phuong_td] Khởi tạo giá trị dvt/ncc khi sửa phiếu đề xuất
        const newRow: ProposalType = {
          key: newKey,
          ma: renderAutoComplete(newKey, optionsCode, c.ma_vt, getPlaceholder(eDataFieldName.ma), eDataFieldName.ma, {
            width: 400,
          }),
          ten: renderAutoComplete(newKey, optionsName, ten, getPlaceholder(eDataFieldName.ten), eDataFieldName.ten),
          donvi: renderInput(true, dvt, newKey, eDataFieldName.donvi),
          klkehoach: renderInputNumber(true, klkehoach || '0', newKey, eDataFieldName.klkehoach),
          tonkho: renderInputNumber(true, tonkho ? tonkho.toString() : '0', newKey, eDataFieldName.tonkho),
          klconlai: renderInputNumber(true, klconlai ? klconlai.toString() : '0', newKey, eDataFieldName.klconlai),
          dexuat: renderInputNumber(false, c.so_luong_yeu_cau.toString(), newKey, eDataFieldName.dexuat),
          min: '0',
          nearest: '0',
          tt1: ((c.gia1 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
          tt2: ((c.gia2 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
          tt3: ((c.gia3 || 0) * c.so_luong_yeu_cau).toLocaleString('en-US'),
          ttMin: '0',
          ttNearest: '0',
          gia1: renderInputNumber(false, c.gia1?.toString() || '', newKey, eDataFieldName.gia1),
          ncc1: renderAutoComplete(newKey, optionsNcc, c.nhaCungCap1 || '', getPlaceholder(eDataFieldName.ncc1), eDataFieldName.ncc1, {
            width: 400,
          }),
          nccNearest: '',
          nccMin: '',
          gia2: renderInputNumber(false, c.gia2?.toString() || '', newKey, eDataFieldName.gia2),
          ncc2: renderAutoComplete(newKey, optionsNcc, c.nhaCungCap2 || '', getPlaceholder(eDataFieldName.ncc2), eDataFieldName.ncc2, {
            width: 400,
          }),
          gia3: renderInputNumber(false, c.gia3?.toString() || '', newKey, eDataFieldName.gia3),
          ncc3: renderAutoComplete(newKey, optionsNcc, c.nhaCungCap3 || '', getPlaceholder(eDataFieldName.ncc3), eDataFieldName.ncc3, {
            width: 400,
          }),
          // ngaynhap: <DatePicker className={styles.newRow} />,
          ghichu: renderInput(false, note, newKey, eDataFieldName.ghichu),
          maKho: renderInput(true, c.ma_kho, newKey, eDataFieldName.maKho),
          tenKho: renderInput(true, tenKho, newKey, eDataFieldName.tenKho),
          Mavv: renderInput(false, '', newKey, eDataFieldName.Mavv),
          DienGiai: renderInput(false, c.dien_giai, newKey, eDataFieldName.DienGiai),
          hinhthuc_tt: payment,
        };
        datas.push(newRow);


      });
    } setDataSource(datas);
    GetTonKho(mavattu);
    // [22/10/2024][phuong_td] thay đổi key cho table để bắt table reander lại
    setTableKey(Utils.generateRandomString(3));
  };
  //[10/1/2025][ngoc_td] sửa lại text theo design

  //#region convertPhieuDeXuat
  const convertPhieuDeXuat = (data: PhieuDeNghiMuaHangDTO) => {
    const { chiTietHangHoa, chiTietDeNghiMuaHang, recId } = data;
    // recId && dispatch(accountingInvoiceActions.GetDanhSachPhieuDeNghiMuaHang_ChiTietHangHoa({ params: { recId: recId } }));;
    const { createDate, dien_giai, capDuyet, ngay_hoa_don } = data;
    setDaySelected(dayjs(createDate));
    ngay_hoa_don && setGoodsReceiptDate(dayjs(ngay_hoa_don));
    setDienGiai(dien_giai);
    capDuyet && setcapDuyet(capDuyet / 1);
    chiTietDeNghiMuaHang && createDanhSachVatTu(chiTietDeNghiMuaHang);
    const bophan = danhSachBoPhan?.find((b) => b.ma_bo_phan === data.ma_bo_phan);
    bophan && setDepartment(bophan.ten_bo_phan);
    // setMaPhieu('');
    // setCategory(1);
  };
  // [21/10/2024][#20538][phuong_td] ẩn cột mã kho để tiết kiệm kích thước, cố định một số trường dữ liệu trên table
  const columns: ColumnType<ProposalType>[] = [
    {
      title: <span className={styles.tableHeader}>Tên Kho</span>,
      dataIndex: 'tenKho',
      key: 'tenKho',
      width: 200,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && ['Kho1', 'Kho2'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
      fixed: 'left',
    },
    {
      title: (
        <span className={styles.tableHeader}>
          {currentScreen === eTypeVatTuMayMoc.MayMoc ? t('Machinery code') : t('Material code')}
        </span>
      ),
      dataIndex: 'ma',
      key: 'ma',
      width: 150,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && ['BT1', 'Thep1'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
      fixed: 'left',
    },
    {
      title: (
        <span className={styles.tableHeader}>
          {currentScreen === eTypeVatTuMayMoc.MayMoc ? t('Machinery name') : t('Material name')}
        </span>
      ),
      dataIndex: 'ten',
      key: 'ten',
      width: 250,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && text === 'Tổng' ? styles.boldText : ''}>{text}</span>
      ),
      align: 'center',
      fixed: 'left',
    },
    {
      title: '',
      key: 'operation',
      width: 40,
      align: 'center',
      fixed: 'left',
      render: (_: any, record: any) => {
        const showDelete = record.key !== 'summary' && !record.key.startsWith('add-');
        return (
          showDelete && (
            <DeleteOutlined
              onClick={e => {
                const ma = getData(record.ma);
                if (ma) {
                  setNotification(tCommon('Do you want to delete?'));
                  setIsModalOpen(true);
                  setRemoveId(record.key);
                } else {
                  removeItem(record.key);
                }
              }}
              style={{ fontSize: '18px', color: '#FF0000', border: 'node' }}
            />
          )
        );
      },
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit')}</span>,
      dataIndex: 'donvi',
      key: 'donvi',
      width: 100,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Diễn giải</span>,
      dataIndex: 'DienGiai',
      key: 'DienGiai',
      width: 200,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Planned volume')}</span>,
      dataIndex: 'klkehoach',
      key: 'klkehoach',
      width: 100,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Actual inventory')}</span>,
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 120,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Remaining mass')}</span>,
      dataIndex: 'klconlai',
      key: 'klconlai',
      width: 100,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('SL Tồn kho kho Tổng')}</span>,
      dataIndex: 'slTonKhoKhoTong',
      key: 'slTonKhoKhoTong',
      width: 100,
      render: (text: string | JSX.Element) => text || 0,
      className: styles.tablecell,
      align: 'center',
      ...(currentScreen === eTypeVatTuMayMoc.MayMoc ? {} : { hidden: true }),
    },
    {
      title: <span className={styles.tableHeader}>{t('SL tồn kho các kho còn lại')}</span>,
      dataIndex: 'slTonKhoCacKhoConLai',
      key: 'slTonKhoCacKhoConLai',
      width: 110,
      align: 'center',
      className: styles.tablecell,
      render: (text: number, record: any) => {
        const content = (
          <div style={{ whiteSpace: 'pre-line' }}>
            {record &&
              record?.Tooltip?.map((kho: any, index: number) => (
                <div key={index}>
                  Kho: {kho?.ma_kho} &nbsp;&nbsp;&nbsp; {parseFloat(kho?.ton_cuoi).toString()}
                </div>
              ))}
          </div>
        );

        return (
          <Tooltip title={content} placement="top">
            <span>{text || 0}</span>
          </Tooltip>
        );
      },
      ...(currentScreen === eTypeVatTuMayMoc.MayMoc ? {} : { hidden: true }),
    },
    {
      title: <span className={styles.tableHeader}>{t('This time proposal')}</span>,
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 190,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Giá thấp nhất</span>,
      dataIndex: 'min',
      key: 'min',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Thành Tiền thấp nhất</span>,
      dataIndex: 'ttMin',
      key: 'ttMin',
      width: 150,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} thấp nhất</span>,
      dataIndex: 'nccMin',
      key: 'nccMin',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>Giá gần nhất</span>,
      dataIndex: 'nearest',
      key: 'nearest',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Thành Tiền gần nhất</span>,
      dataIndex: 'ttNearest',
      key: 'ttNearest',
      width: 150,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} gần nhất</span>,
      dataIndex: 'nccNearest',
      key: 'nccNearest',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>Giá 1</span>,
      dataIndex: 'gia1',
      key: 'gia1',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Thành Tiền 1</span>,
      dataIndex: 'tt1',
      key: 'tt1',
      width: 150,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 1</span>,
      dataIndex: 'ncc1',
      key: 'ncc1',
      width: 300,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>Giá 2</span>,
      dataIndex: 'gia2',
      key: 'gia2',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Thành Tiền 2</span>,
      dataIndex: 'tt2',
      key: 'tt2',
      width: 150,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 2</span>,
      dataIndex: 'ncc2',
      key: 'ncc2',
      width: 300,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },

    {
      title: <span className={styles.tableHeader}>{t('Price')} 3</span>,
      dataIndex: 'gia3',
      key: 'gia3',
      width: 130,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>Thành Tiền 3</span>,
      dataIndex: 'tt3',
      key: 'tt3',
      width: 150,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Supplier')} 3</span>,
      dataIndex: 'ncc3',
      key: 'ncc3',
      width: 300,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    // [implement #22237]
    {
      title: 'Hình thức thanh toán',
      dataIndex: 'hinhthuc_tt',
      key: 'hinhthuc_tt',
      align: 'center',
      width: 200,
      render: (value, record) => {
        return (
          <Select
            value={value}
            options={paymentOptions}
            placeholder="Chọn hình thức thanh toán"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 200, overflowY: 'auto' }}
            onChange={(v: number) => {
              const newData = [...dataSource];
              const idx = newData.findIndex(row => row.key === record.key);
              if (idx !== -1) {
                newData[idx].hinhthuc_tt = v;
                setDataSource(newData);
              }

              const prev = dataModifying[record.key] ?? {};
              dataModifying = {
                ...dataModifying,
                [record.key]: { ...prev, hinhthuc_tt: v },
              };
            }}
          />
        );
      },
    },
  ];

  const addButtonRow: ProposalType = {
    key: `add-${(dataSource.length + 1).toString()}`,
    ma: (
      <Button className={styles.addButton} onClick={handleAddRow}>
        +
      </Button>
    ),
    ten: '',
    donvi: '',
    klkehoach: '',
    tonkho: '',
    klconlai: '',
    dexuat: '',
    ngaynhap: '',
    ghichu: '',
    isRowFuction: true,
    maKho: '',
    tenKho: '',
    Mavv: '',
    DienGiai: '',
  };

  let ItemTong = null;
  let ItemAdd = null;
  const PData: ProposalType[] = [];
  dataSource.forEach((d, i) => {
    if (d.key === 'summary') {
      ItemTong = d;
    } else if (d.key.startsWith('add-')) {
      ItemAdd = d;
    } else {
      PData.push(d);
    }
  });
  const updatedDataSource = [
    ...PData,
    // ItemTong ? ItemTong : summary,
    // ItemAdd ? ItemAdd : addButtonRow
  ];

  const formatDateAPI = (date: any) => {
    return date ? dayjs(date).format(FormatDateAPI) : dayjs().format(FormatDateAPI);
  };

  const create_nguoi_tt = () => {
    let nguoi_tt = '';
    if (userData.id) {
      nguoi_tt += `ID_[${userData.id}]`
    }
    if (userData.userName) {
      nguoi_tt += nguoi_tt === '' ? `USERNAME_[${userData.userName}]` : `_USERNAME_[${userData.userName}]`;
    }
    if (userData.email) {
      nguoi_tt += nguoi_tt === '' ? `EMAIL_[${userData.email}]` : `_EMAIL_[${userData.email}]`;
    }
    if (userData.phone) {
      nguoi_tt += nguoi_tt === '' ? `PHONE_[${userData.phone}]` : `_PHONE_${userData.phone}]`;
    }
    return nguoi_tt;
  };

  const checkCode = () => {
    let error = false;
    const newDataSource = [...dataSource];
    for (let i = 0; i < newDataSource.length; i++) {
      const temp = newDataSource[i];
      const ma = getData(temp.ma);
      // [15/10/2024][#20438][phuong_td] Adjust the code check function
      const index = optionsCode.findIndex(c => c.item.code === ma);
      if (index < 0 && ma !== '') {
        newDataSource[i].ma = renderAutoComplete(
          temp.key,
          optionsCode,
          ma,
          getPlaceholder(eDataFieldName.ma),
          eDataFieldName.ma,
          { width: 400 },
          'error',
        );
        error = true;
      }
    }
    setDataSource(newDataSource);
    return error;
  };

  //#region handleSave
  function handleSave() {
    const isError = checkCode();
    if (isError) return;
    const PhieuDeXuat = GenerateOutgoingData();
    if (PhieuDeXuat.vat_tu_may_moc.length === 0) {
      setNotification(tCommon('The proposal list is not blank'));
      setIsModalOpen(true);
      return;
    }
    const inputData: any = selectedProposal || {};
    let dsChiTietDeNghiMuaHang = selectedProposal?.chiTietDeNghiMuaHang;
    const kho = getKhoHienTai();
    const departmentCode = danhSachBoPhan?.find((b) => b.ten_bo_phan === department)?.ma_bo_phan;
    const PhieuDeNghiMuaHang: PhieuDeNghiMuaHangDTO = {
      ...inputData,
      ma_bo_phan: departmentCode || defaultDepartment?.ma_bo_phan,
      madvcs: madvcs.THUCHIEN,
      dien_giai: PhieuDeXuat.dien_giai,
      ngay_hoa_don: PhieuDeXuat.ngay_hoa_don,
      // createDate: formatDateAPI(PhieuDeXuat.ngay_tao),
      // CreateDate: formatDateAPI(PhieuDeXuat.ngay_tao),
      capDuyet: PhieuDeXuat.capDuyet,
      dia_chi: inputData?.dia_chi || '',
      ngay_ct: formatDateAPI(PhieuDeXuat.ngay_tao),
      ma_nt: inputData?.ma_nt || 'VND',
      // ma_ct: PhieuDeXuat.ma_phieu,
      nv_bh: selectedProposal ? selectedProposal.nv_bh : proponent, // Utils.stringify(user),
      ma_nv_bh: selectedProposal ? selectedProposal.ma_nv_bh : proponentCode,
      hoaDonVAT: inputData?.hoaDonVAT || [],
      nguoi_tt: wareHouses.find(w => w.ma_kho === kho.maKho)?.ma_Nv,
      chiTietHangHoa: inputData?.chiTietHangHoa || [],
      list_of_extensions: inputData?.list_of_extensions || [],
      chiTietDeNghiMuaHang: PhieuDeXuat.vat_tu_may_moc.map(d => {
        let ct: any = {};
        if (dsChiTietDeNghiMuaHang) {
          ct = dsChiTietDeNghiMuaHang.find(c => c.guid === d.guid) || {};
        }
        const temp: ChiTietDeNghiMuaHangDTO = {
          ...ct,
          // createDate: ct.createDate ? formatDateAPI(ct.createDate) : formatDateAPI(PhieuDeXuat.ngay_tao),
          // CreateDate: ct.createDate ? formatDateAPI(ct.createDate) : formatDateAPI(PhieuDeXuat.ngay_tao),
          ma_kho: d.maKho, // 'PHANTON',//
          ma_vt: d.ma,
          // ??: Mã vụ việc
          dien_giai: d.DienGiai,
          // ?? : KL kế hoạch
          ton_kho: d.ton_kho_thuc_te,
          // ??: KL còn lại
          so_luong_yeu_cau: d.de_xuat_lan_nay,
          // ??: Ghi chú
          so_luong_thuc_te: ct.so_luong_thuc_te || 0,
          // ma_kh: wareHouses.find(w => w.ma_kho === kho.maKho)?.ma_Nv,
          // gia: ct.gia || 0,
          // "ma_kho": "TANTHAI",
          // gia_gan_nhat: 0,
          // nhaCungCap1: "mã nhà cung cấp đề xuất ",
          // nhaCungCap2: "mã nhà cung cấp đề xuất "
          xacNhanHangHoa1: "",
          xacNhanHangHoa2: "",
          xacNhanHangHoa3: "",
          gia1: d.gia1,
          gia2: d.gia2,
          gia3: d.gia3,
          nhaCungCap1: d.nhaCungCap1,
          nhaCungCap2: d.nhaCungCap2,
          nhaCungCap3: d.nhaCungCap3,
          hinhthuc_tt: d.hinhthuc_tt,
        };
        return temp;
      }),
    };
    const arrayDelete: string[] = [];
    if (dsChiTietDeNghiMuaHang) {
      dsChiTietDeNghiMuaHang.forEach(c => {
        const index = PhieuDeNghiMuaHang.chiTietDeNghiMuaHang?.findIndex(c1 => c1.guid === c.guid);
        if (index === -1) {
          c.guid && arrayDelete.push(c.guid);
          // PhieuDeNghiMuaHang.chiTietDeNghiMuaHang?.push({...c, del: true});
        }
      });
    }
    if (selectedProposal) {
      PhieuDeNghiMuaHang.guid = selectedProposal.guid;
    }
    if (arrayDelete.length) {
      dispatch(
        accountingInvoiceActions.DeletePhieuDeNghiMuaHang({
          ids: arrayDelete,
          params: undefined,
        }),
      );
    }
    dispatch(accountingInvoiceActions.CreateProposalForm({ data: PhieuDeNghiMuaHang, params: {} }));
    // resetDataSource();
    // handleClose();
  }

  const getTitle = () => {
    let title = '';
    if (selectedProposal) {
      title += `${t('EDIT')} `;
    } else {
      title += `${t('CREATE NEW')} `;
    }
    switch (currentScreen) {
      case eTypeVatTuMayMoc.VatTuChinh:
        title += `${t('MATERIAL PROPOSAL FORM')} ${t('MAIN')}`;
        break
      case eTypeVatTuMayMoc.VatTuPhu:
        title += `${t('MATERIAL PROPOSAL FORM')} ${t('EXTRA')}`;
        break
      case eTypeVatTuMayMoc.MayMoc:
        title += t('MACHINERY PROPOSAL FORM');
        break
    }
    return title;
  };
  const disabledDate = (current: Dayjs) => {
    // So sánh ngày hiện tại với ngày hôm nay
    return current && current < daySelected.startOf('day');
  };

  const SplitBySupplier = () => { };

  //#region Element
  return (
    <div style={{ flex: 1, flexDirection: 'column' }}>
      <h1 className={styles.formtitle}>{getTitle()}</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <span style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: '500' }}>Tên công trình: </span>
          <span>{selectedProject ? selectedProject?.name : project}</span>
        </span>
        <Space style={{ marginBottom: 5, width: '100%' }}>
          {/* <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>{t('Form code')}</span>
            <div>
              <Input type="text" className={styles.inputfield} value={maPhieu}/>
            </div>
          </Space> */}
          {/* <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>
              {t('Belongs to category / Father job')}
              <span className="fadedText">{t('(Optional)')}</span>
            </span>
            <div>
              <Select
                defaultValue={categorys?.find(c => c.id === category)?.name}
                className={styles.selectfield}
                options={Category(categorys, tCategory).map(item => ({ value: item.id, label: item.label }))}
                value={category}
                onSelect={setCategory}
              />
            </div>
          </Space>  */}

          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>{t('Cấp duyệt')}</span>
            <div>
              <Select
                defaultValue={capDuyet}
                style={{ width: 80 }}
                options={level.map(item => ({ value: item, label: item - 1 }))}
                value={capDuyet}
                onSelect={l => {
                  setcapDuyet(l);
                }}
              />
            </div>
          </Space>
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>{t('Date of creation of ticket')}</span>
            <div>
              <DatePicker
                allowClear={false}
                className={styles.datepicker}
                value={daySelected}
                onChange={(date, dateString) => {
                  date && setDaySelected(date);
                }}
                disabled
              />
            </div>
          </Space>
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>{t('Goods receipt date')}</span>
            <div>
              <DatePicker
                allowClear={false}
                className={styles.datepicker}
                value={GoodsReceiptDate}
                onChange={(date, dateString) => {
                  date && setGoodsReceiptDate(date);
                }}
                disabledDate={disabledDate}
              />
            </div>
          </Space>
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <span className={styles.labeltext}>{t('Proposal Department')}</span>
            <div>
              <Select
                defaultValue={department || defaultDepartment?.ten_bo_phan}
                style={{ width: 200 }}
                options={danhSachBoPhan?.map(item => ({ value: item.ma_bo_phan, label: item.ten_bo_phan }))}
                value={department || defaultDepartment?.ten_bo_phan}
                onSelect={(l, o) => {
                  o && setDepartment(o.label);
                }}
              />
            </div>
          </Space>
          {/*
            [22/10] [ngoc_td] fix button name

          */}
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <Button
              type="primary"
              // className={styles.button}
              style={{ marginTop: 28 }}
              onClick={() => {
                showModal();
              }}
            >
              Thêm nhà cung cấp
            </Button>
          </Space>
        </Space>
        <div style={{ marginBottom: 5, width: '100%', display: 'flex' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', marginRight: 10, marginBottom: 5 }}
          >
            <span className={styles.labeltext}>{t('Proponent')}</span>
            {/* <Input style={{ width: '100%' }} value={Utils.getFullName(user)} /> */}
            <AutoCompleteCustom
              id={Utils.generateRandomString(3)}
              keyElement={Utils.generateRandomString(3)}
              value={proponent}
              optionsList={employeesByCompanyId?.map(e => {
                const name = Utils.getFullName(e);
                const t: AutoCompleteOptions = {
                  label: name,
                  value: e.employeeCode,
                  item: {
                    name: name,
                    code: e.employeeCode,
                  }
                };
                return t;
              })}
              warning=''
              onBlur={(id, data) => {
                setProponent(data);
              }}
              onChange={() => { }}
              onSelect={(id, data, label, value) => {
                const em = employeesByCompanyId.find(e => e.id.toString() === data);
                setProponent(label);
                console.log(value.code);
                setProponentCode(value.code);
                setUserData({
                  email: em?.contactDetail?.workEmail || '',
                  phone: em?.contactDetail?.workPhone || '',
                  id: data,
                  userName: '',
                });
              }}
              className={''}
              placeholder={''}
              style={{ width: 200 }}
            />
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', width: '100%', marginBottom: 5 }}
          >
            <span className={styles.labeltext} style={{ flex: 1 }}>
              {t('Interpret')}
            </span>
            <Input
              style={{ width: '100%' }}
              value={dienGiai}
              onChange={value => {
                setDienGiai(value.target.value);
              }}
            />
          </div>
        </div>

        {/* [22/10/2024][phuong_td] thêm key cho table để bắt table reander lại */}
        <Table
          key={tableKey}
          rowKey={record => {
            let key = record?.key;
            if (key === undefined || key === null) {
              key = Utils.generateRandomString(5);
            }
            return key;
          }}
          dataSource={updatedDataSource}
          columns={columns}
          rowHoverable={false}
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 900, y: 270 }}
          // components={<div></div>}
          loading={isLoading}
          rowClassName={record => {
            if (record) {
              return newRows.has(record.key) ? `${styles.newRow} ${styles.tableRow}` : styles.tableRow;
            }
            return '';
          }}
        />
        <Space style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 5, paddingBottom: 5 }}>
          <Button onClick={handleAddRow} style={{ width: 80 }} type={'default'} disabled={isLoading}>
            +
          </Button>
          <div style={{ paddingRight: 40 }}>
            <div style={{ fontWeight: 'bold' }}>Tổng Thành tiền 1: {tongThanhTien1.toLocaleString('en-US')}</div>
            <div style={{ fontWeight: 'bold' }}>Tổng Thành tiền 2: {tongThanhTien2.toLocaleString('en-US')}</div>
            <div style={{ fontWeight: 'bold' }}>Tổng Thành tiền 3: {tongThanhTien3.toLocaleString('en-US')}</div>
            <div style={{ fontWeight: 'bold' }}>Tổng Thành tiền thấp nhất: {tongThanhTienMin.toLocaleString('en-US')}</div>
            <div style={{ fontWeight: 'bold' }}>Tổng Thành tiền gần nhất: {tongThanhTienNearest.toLocaleString('en-US')}</div>
          </div>

        </Space>
      </div>
      <Space
        style={{
          display: 'flex',
          // paddingTop: 5,
          // paddingBottom: 5,
          // position: 'absolute',
          // bottom: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div>
          <Button
            type="primary"
            // className={styles.button}
            // style={{ marginRight: 80 }}
            disabled
            onClick={() => {
              SplitBySupplier();
            }}
          >
            {t('Split by supplier')}
          </Button>
        </div>
        {/* <Button type="primary">{t('Import to warehouse')}</Button> */}
        {/* <div>
          <Button
            type="primary"
            // className={styles.button}
            style={{ marginRight: 10 }}
            onClick={() => {
              getGiaandNcc('thap')
            }}
          >
            {t('Get the lowest supplier price')}
          </Button>
          <Button
            type="primary"
            // className={styles.button}
            style={{ marginRight: 10 }}
            onClick={() => {
              getGiaandNcc('gan')
            }}
          >
            {t('Get the nearest supplier price')}
          </Button>
        </div> */}
        <div>
          <Button
            type="primary"
            // className={styles.button}
            // style={{ marginRight: 80 }}
            onClick={() => {
              handleSave();
            }}
            disabled={isLoading}
          >
            {t('Submit a proposal')}
          </Button>
        </div>
      </Space>
      <Confirm
        modalVisible={isModalOpen}
        setModalVisible={setIsModalOpen}
        notification={notification}
        buttons={{
          ok: {
            label: '',
            action: function (): void {
              removeId && removeItem(removeId);
              setRemoveId(undefined);
              setIsModalOpen(false);
            },
          },
          cancel: {
            label: '',
            action: function (): void {
              setRemoveId(undefined);
              setIsModalOpen(false);
            },
          },
        }}
      />

      {/* [21/10/2024] [ngoc_td] change title */}
      <Modal title="Tạo mới nhà cung cấp" visible={isModalVisible} footer={null} onCancel={handleCancel} style={{ top: 20, minHeight: '105%' }}>
        {/* Nội dung modal để thêm NCC */}
        <AddNcc onSaveSuccess={handleCancel} />
      </Modal>
    </div>
  );
};

export default NewMachineryMaterialList;
