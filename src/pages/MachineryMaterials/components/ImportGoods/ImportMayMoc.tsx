/* eslint-disable import/order */
import { eTypeVatTuMayMoc, RoleEnum } from '@/common/define';
import { maKhoTongMM } from '@/environment';
import { useAuth, usePermission } from '@/hooks';
import { ChiTietDeNghiMuaHangDTO } from '@/services/AccountingInvoiceService';
import { DocumentService } from '@/services/DocumentService';
import { ProjectService } from '@/services/ProjectService';
import { accountingInvoiceActions, getNccList, getPhieuNhapKhoTuDeNghiMuaHang, getProducts, getSelectedProposal, getWareHouses } from '@/store/accountingInvoice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { issueActions } from '@/store/issue';
import { getSelectedProject } from '@/store/project/projectSelector';
import { RootState } from '@/store/types';
import { CheckOutlined, CloseOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Table, Tooltip, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ProposalData } from '../ProposalHistory/ProposalHistory';
import styles from './ImportGoods.module.css';
type ChiTietHangHoa = {
  ma_vt: string;
  so_luong: number;
};

type DanhSachNhapKho = {
  chiTietHangHoa: ChiTietHangHoa[];
}[];
//[10/1/2025][ngoc_td] sửa lỗi danhSachNhapKho trả về rỗng
function tongHopSoLuong(danhSachNhapKho: DanhSachNhapKho) {
  const ketQua: { ma_vt: string; tong_so_luong: number }[] = [];

  // Ensure danhSachNhapKho is a valid array
  if (!Array.isArray(danhSachNhapKho)) {
    return ketQua; // Return an empty array if invalid
  }

  danhSachNhapKho.forEach(nhapKho => {
    // Ensure chiTietHangHoa exists and is an array
    if (!Array.isArray(nhapKho.chiTietHangHoa)) {
      return; // Skip this iteration if chiTietHangHoa is invalid
    }

    nhapKho.chiTietHangHoa.forEach(hangHoa => {
      const { ma_vt, so_luong } = hangHoa;
      const item = ketQua.find(kq => kq.ma_vt === ma_vt);
      if (item) {
        item.tong_so_luong += so_luong;
      } else {
        ketQua.push({ ma_vt, tong_so_luong: so_luong });
      }
    });
  });

  return ketQua;
}

function getLatestNgayDuyet(proposal: any): string | null {
  let maxIndex = 0;
  let latestDate: string | null = null;

  for (let i = 1; i <= 10; i++) { // Giả sử bạn có tối đa ngay_duyet1 đến ngay_duyet10
    const key = `ngay_duyet${i}`;
    const value = proposal[key];
    if (value) {
      maxIndex = i;
      latestDate = value;
    }
  }

  return latestDate;
}

interface NhapKhoData {
  id?: number;
  recId?: number;
  ma_vt?: string;
  ma_kho?: string;
  so_luong?: number;
  gia?: number;
  tien?: number;
  gia_nt?: number;
  tien_nt?: number;
  dien_giai?: string;
  tk_no?: string;
  tk_co?: string;
  so_hopdong?: string;
  ma_Vv?: string;
  ma_Km?: string;
  tinh_gia_von_truc_tiep?: boolean;
  createDate?: string; // or Date, depending on how you handle date types
  guid?: string;
  guidRelation?: string;
}
export interface ImportGood {
  madvcs: string;
  ma_ct: string;
  ngay_ct: string; // ISO 8601 date strin g
  so_ct: string;
  ma_kh: string;
  nguoi_tt: string;
  dien_giai: string;
  ma_nt: string;
  chiTietHangHoa: NhapKhoData[];
  hoaDonVAT: any[]; // Adjust based on actual data structure for VAT invoices
  list_of_extensions: any[]; // Adjust based on actual data structure for extensions
  chiTietDeNghiMuaHang: any[]; // Adjust based on actual data structure for purchase requests
  guidRelation: string;
}
const { Title } = Typography;

const ImportMayMoc: React.FC<{ proposal: ProposalData, handleClose: () => void; type: eTypeVatTuMayMoc }> = ({ proposal, handleClose, type }) => {
  const { t } = useTranslation('material');
  const proposalSelected = useAppSelector(getSelectedProposal()) || proposal;
  const latestNgayDuyet = getLatestNgayDuyet(proposalSelected);

  const [selectedProposal, setSelectedProposal] = useState(proposal);
  const [dienGiai, setDienGiai] = useState<string>(proposalSelected.dien_giai);
  const [dataMuaHang, setDataMuaHang] = useState(proposalSelected.chiTietDeNghiMuaHang);
  const danhSachNhapKho = useAppSelector(getPhieuNhapKhoTuDeNghiMuaHang());
  const [listNhapKho, setListNhapKho] = useState(danhSachNhapKho);
  const approveChtGranted = usePermission([], [RoleEnum.Commander]);
  const approveKtGranted = usePermission([], [RoleEnum.Technician]);
  const approvePaymentGranted = usePermission([], [RoleEnum.Director]);

  const auth = useAuth();
  const employee = useAppSelector((state: RootState) => state.app.selectedEmployeeDetails);
  const [dct, setDCT] = useState<number>(selectedProposal.daChiTien || 0);

  const currentUserName = employee ? `${employee.lastName} ${employee.middleName} ${employee.firstName}`
    :
    auth.user.Firstname ? `${auth.user.Lastname} ${auth.user.Firstname}`.trim() : '';
  const [project, setProject] = useState<any>();
  const wareHouses = useAppSelector(getWareHouses());
  const [danhGiaValues, setDanhGiaValues] = useState<{ [key: string]: string }>({});
  const [chiTietHangHoa, setChiTietHangHoa] = useState<ChiTietDeNghiMuaHangDTO[]>([]);
  const [soluongnhanValues, setSoluongnhanValues] = useState<{ [key: string]: string }>({});
  const [ktxacnhanStatus, setKtxacnhanStatus] = useState<{ [key: string]: boolean }>({});
  const [chtxacnhanStatus, setChtxacnhanStatus] = useState<{ [key: string]: boolean }>({});
  const [tongGiaTri, setTongGiaTri] = useState<number>(0);
  const imageList = useAppSelector((state: RootState) => state.issue.issueImageList);
  const nccList = useAppSelector(getNccList());
  const machineList = useAppSelector(getProducts());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const selectedProject = useAppSelector(getSelectedProject());
  const isSameSupplier = dataMuaHang.every(item => item.ma_kh === dataMuaHang[0]?.ma_kh);
  const currentWarehouseCode = selectedProject
    ? (projectwareHouses && projectwareHouses.length > 0
      ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : undefined) // Không gán giá trị nếu projectwareHouses rỗng
    : maKhoTongMM; // Default value when selectedProject is not defined
  //[10/1/2025][ngoc_td] kiểm tra trạng thái đã duyệt chi
  const hasSuffix = (soCt: string) => /\.\d{3}$/.test(soCt);
  const [isApproved, setIsApproved] = useState(false);
  const [ngayXacNhan, setNgayXacNhan] = useState<string | null>(dayjs(proposalSelected.chiTietDeNghiMuaHang[0].ngayXacNhanHangHoa1).format('DD/MM/YYYY'));
  useEffect(() => {
    setSelectedProposal(proposalSelected);
  }, [proposalSelected]);
  useEffect(() => {
    if (hasSuffix(selectedProposal.so_ct)) {
      setIsApproved(true);
    } else {
      setIsApproved(false);
    }
  }, [selectedProposal]);
  const selectedFiles = useMemo(
    () => (imageList ? imageList.filter(file => file.status === 0).slice(0, 5) : []),
    [imageList]
  ); const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // upload ảnh  vừa chọn từ máy bằng api 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;


    if (!files) return;
    if (files.length > 5) {
      alert("Bạn chỉ có thể chọn tối đa 5 tệp.");
      event.target.value = ""; // reset input
      return;
    }

    if (files) {
      const newFiles = Array.from(files);
      // setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      const formData = new FormData();
      [...newFiles].forEach((file, index) => {
        formData.append('files', file); // 'files' là tên field mà API backend mong đợi
      });

      dispatch(issueActions.uploadAdditionAttachment({ itemId: proposalSelected.id, files: formData }));
    }
  };
  const handlePreviewImage = async (file: any) => {

    // Nếu có danh sách ảnh và có drawingId
    if (file) {
      const drawingId = file.drawingId?.toString() || '';

      DocumentService.Get.getFileFromId(drawingId).subscribe(async (res) => {
        try {
          // Chuyển blob từ res thành file
          const blob = res as Blob;
          const fileFromBlob = new File([blob], file.name || "preview.jpg", {
            type: blob.type || 'image/jpeg',
          });
          console.log(fileFromBlob);
          // Tạo URL từ file và gán vào preview
          const fileUrl = URL.createObjectURL(fileFromBlob);
          setPreviewImage(fileUrl);
          setIsPreviewModalVisible(true);
        } catch (error) {
          console.error('Lỗi chuyển đổi blob thành file:', error);
        }
      });
    }
  };
  const handleRemoveFile = (fileToRemove: any) => {
    dispatch(accountingInvoiceActions.deleteImageProposal({ itemId: proposalSelected.id, drawingIds: [fileToRemove.drawingId] }));
  };
  function renderNgayDuyetList(proposal: any) {
    const ngayDuyetList: { key: string; value: string }[] = [];

    for (let i = 1; i <= 10; i++) {
      const key = `ngay_duyet${i}`;
      const value = proposal[key];
      if (value) {
        ngayDuyetList.push({ key, value });
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '8px 0',
        }}
      >
        <span style={{ width: '20%' }}>
          <span style={{ fontWeight: '500' }}>Tên công trình: </span>
          <span>{project}</span>
        </span>
        {ngayDuyetList.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === ngayDuyetList.length - 1;

          let label = '';
          if (isFirst) {
            label = 'Ngày ráp giá:';
          } else if (isLast) {
            label = 'Ngày duyệt cấp cuối cùng:';
          } else {
            label = `Ngày duyệt cấp ${index}:`;
          }

          return (
            <div key={item.key} style={{ flex: 1, minWidth: 150 }}>
              <span style={{ fontWeight: 500 }}>{label} </span>
              <span>{dayjs(item.value).format('DD/MM/YYYY')}</span>
            </div>
          );
        })}
      </div>
    );
  }
  const [nhapKho, setNhapKho] = useState<ImportGood>({
    madvcs: 'THUCHIEN',
    ma_ct: 'PNKTP',
    ngay_ct: dayjs().format('YYYY-MM-DD'),
    so_ct: 'Test01',
    ma_kh: proposalSelected.ma_kh,
    nguoi_tt: '',
    dien_giai: '',
    ma_nt: 'VND',
    chiTietHangHoa: [],
    hoaDonVAT: [],
    list_of_extensions: [],
    chiTietDeNghiMuaHang: [],
    guidRelation: proposalSelected.guid,
  });

  const projectList = useAppSelector(state => state.project.projectList);
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState<boolean>(false);
  const [disabledConfirm, setDisabledConfirm] = useState<boolean>(false);

  const location = useLocation();
  const getPermissionKeys = () => {
    const isProjectLayout = location.pathname.startsWith('/projects');

    let permissionKeys: { inventory?: string[]; edit?: string[]; delete?: string[] } = {};
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Inventory'] : ['KhoCongTy.VatTuChinh.Inventory'],
        };
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Inventory'] : ['KhoCongTy.VatTuPhu.Inventory'],
        };
        break;
      case eTypeVatTuMayMoc.MayMoc:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.MayMoc.Inventory'] : ['KhoCongTy.MayMoc.Inventory'],
        };
        break;
      default:
        break;
    }
    return permissionKeys;
  };

  const permissionKeys = getPermissionKeys();

  const inventoryGranted = usePermission(permissionKeys.inventory);
  // chặn việc nhập kho nếu tổng số lượng đã nhập kho lớn hơn hoặc bằng số lượng được duyệt
  useEffect(() => {
    const danhSachSoLuong = tongHopSoLuong(listNhapKho);
    const allValid = chiTietHangHoa.every(item => {
      const totalQuantity = danhSachSoLuong.find(ds => ds.ma_vt === item.ma_vt)?.tong_so_luong || 0;
      return totalQuantity >= (item.so_luong_nhap1 ?? 0);
    });
    setIsSaveDisabled(allValid);
  }, [chiTietHangHoa, listNhapKho]);

  useEffect(() => {
    setSelectedProposal(proposal);
  }, [proposal])
  useEffect(() => {
    // Nếu không có chiTietDeNghiMuaHang thì không làm gì
    if (!selectedProposal?.chiTietDeNghiMuaHang) return;

    setDataMuaHang(selectedProposal.chiTietDeNghiMuaHang);

    // Kiểm tra xác nhận
    const hasConfirmation = selectedProposal.chiTietDeNghiMuaHang.some(
      (item) => (item.xacNhanHangHoa1?.trim() || '') !== '' || (item.xacNhanHangHoa2?.trim() || '') !== ''
    );
    setIsConfirmDisabled(!hasConfirmation || !!selectedProposal.importFull);

    // Tính tổng số lượng đã nhập kho theo mã vật tư
    const danhSachSoLuong = tongHopSoLuong(listNhapKho);

    // Chỉ khởi tạo lại trạng thái nếu số lượng vật tư hoặc mã vật tư thay đổi
    setKtxacnhanStatus(prev => {
      const next: { [key: string]: boolean } = {};
      selectedProposal.chiTietDeNghiMuaHang.forEach((item) => {
        const approvedQty = Number(item.so_luong_nhap1 || 0);
        const importedQty = danhSachSoLuong.find(ds => ds.ma_vt === item.ma_vt)?.tong_so_luong || 0;
        // nếu đã có xác nhận kỹ thuật từ backend Hoặc số lượng đã nhập kho bằng số lượng được duyệt => true
        next[item.ma_vt] = (item.xacNhanHangHoa2?.trim() || '') !== '' || (importedQty > 0 && importedQty === approvedQty);
      });
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });

    setChtxacnhanStatus(prev => {
      const next: { [key: string]: boolean } = {};
      selectedProposal.chiTietDeNghiMuaHang.forEach((item) => {
        const approvedQty = Number(item.so_luong_nhap1 || 0);
        const importedQty = danhSachSoLuong.find(ds => ds.ma_vt === item.ma_vt)?.tong_so_luong || 0;
        // nếu đã có xác nhận chỉ huy từ backend Hoặc số lượng đã nhập kho bằng số lượng được duyệt => true
        next[item.ma_vt] = (item.xacNhanHangHoa1?.trim() || '') !== '' || (importedQty > 0 && importedQty === approvedQty);
      });
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [selectedProposal?.chiTietDeNghiMuaHang, listNhapKho]);


  const dispatch = useAppDispatch();
  const handleDanhGiaChange = (key: string, value: string) => {
    setDanhGiaValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const handleDiengiaiChange = (value: string) => {
    setDienGiai(value);
    setNhapKho((prevNhapKho) => ({
      ...prevNhapKho,
      dien_giai: value,
    }));
  };
  const resetForm = () => {
    setDienGiai(''); // Reset the explanation field
    setSoluongnhanValues({}); // Reset quantity received values
    setKtxacnhanStatus({}); // Reset technician confirmation status
    setChtxacnhanStatus({}); // Reset commander confirmation status
    setDanhGiaValues({}); // Reset danh gia values

  };
  async function getProjectId(): Promise<number | undefined> {
    const id = wareHouses.find(w => w.ma_kho === selectedProposal.chiTietDeNghiMuaHang[0].ma_kho)?.id;
    if (!id) return undefined;
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
  // [02/04] [ngoc_td]: mỗi khi kho thay đổi sẽ get lại project ứng với kho đó
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
  const calculateTax = (gia: number, soLuong: number, rateVAT: number) => {
    return gia * soLuong * (rateVAT / 100);
  }
  const onSaveWarehouseReceipt = async () => {
    try {
      const projectId = await getProjectId(); // Chờ lấy được projectId trước khi tiếp tục
      const updatedChiTietHangHoa = chiTietHangHoa.map(item => {
        const quantity = parseFloat(soluongnhanValues[item.ma_vt] || '0');
        const price = item.gia ?? 0;
        const total = quantity * price;
        const xacNhanHangHoa1 = item.xacNhanHangHoa1;
        const xacNhanHangHoa2 = item.xacNhanHangHoa2;
        const xacNhanHangHoa3 = item.xacNhanHangHoa3;
        return {
          ma_vt: item.ma_vt,
          gia: price,
          so_luong: quantity,
          tien: total,
          gia_nt: price,
          tien_nt: total,
          dien_giai: item.dien_giai || '',
          ma_kho: dataMuaHang[0].ma_kho,
          createDate: new Date().toISOString(),
          xacNhanHangHoa1, // Thêm trường này
          xacNhanHangHoa2, // Thêm trường này
          xacNhanHangHoa3, // Thêm trường này
          danhGiaHangHoa: danhGiaValues[item.ma_vt] || '',
          ma_kh: item.ma_kh,
        };
      })
        .filter(item => item.xacNhanHangHoa1 !== '' || item.xacNhanHangHoa2 !== '');
      const updateThueVAT = chiTietHangHoa.every(item => item.vatRate === 0)
        ? []
        : chiTietHangHoa.map((item) => {
          const {
            vatRate = 0,
            gia = 0,
            guid = "",
            ma_kho = "",
            ma_vt = "",
          } = item;
          const now = new Date().toISOString();
          const giaValue = gia ?? 0;
          const soLuong = Number(soluongnhanValues[item.ma_vt]) ?? 0;
          const rateVAT = vatRate === -1 ? 0 : vatRate;
          const tienThue = calculateTax(giaValue, soLuong, (typeof rateVAT === 'number' ? rateVAT : 0));
          return {
            "id": 0,
            "recId": 0,
            "del": false,
            "mau_So": "1",
            "so_Serial": "C25TNH",
            "so_Hd": "1",
            "ngay_Hd": now,
            "ma_Kh": item?.ma_kh || "",
            "tk_No": "",
            "tk_Co": "",
            "tien_Dt": gia * (Number(soluongnhanValues[item.ma_vt]) ?? 0),
            "tien_Dt_Nt": 0,
            "pt_Thue": (rateVAT === -1 ? 0 : rateVAT).toString(),
            "tien": Number((gia * (Number(soluongnhanValues[item.ma_vt]) ?? 0) * (typeof rateVAT === 'number' ? rateVAT : 0) / 100).toFixed(2)),
            "tien_Nt": 0,
            "dien_Giai": "",
            "so_Hopdong": "",
            "ma_Km": projectList.find(p => p.id === projectId)?.code || 'TONG',
            "ma_Vv": "",
            "ten_Kh1": "",
            "ms_Thue1": "",
            "dia_Chi1": "",
            "hinh_Thuc_Thanh_Toan": "",
            "tai_Khoan_Thanh_Toan": "",
            "kyHieuMauHoaDon": "",
            "createDate": now,
            "guid": guid,
            "folioNo": "",
            "roomNo": "",
            "guestQuantity": 0,
            "arrival": "2000-01-01T00:00:00",
            "departure": "2000-01-01T00:00:00",
            "email1": "",
            "nguoi_Giao_Dich": "",
            "ngan_Hang1": "",
            "so_Tk1": "",
            "tk_no": '1332',
            "tk_co": '3312',
            "exchangeDes": "",
            "exchangeStatus": "",
            "guidRelation": guid,
            "chiTietHangHoaVAT": [
              {
                "id": 0,
                "guid": "00000000-0000-0000-0000-000000000000",
                "parentGuid": "00000000-0000-0000-0000-000000000000",
                "createDate": now,
                "recId": 0,
                "ma_Kho": ma_kho || "",
                "ma_Vt": ma_vt || "",
                "ten_Vt": "",
                "dvt": "",
                "ten_Vt1": "",
                "dvt1": "",
                "don_Gia": parseFloat((gia).toFixed(4)),
                "so_Luong": Number(soluongnhanValues[item.ma_vt]) ?? 0,
                "tien_Dt": gia * (Number(soluongnhanValues[item.ma_vt]) ?? 0),
                "tien_Dt_Nt": 0,
                "ma_Thue": `${vatRate === -1 ? 'K' : rateVAT}`,
                "phan_Tram_Thue": rateVAT === -1 ? 0 : rateVAT,
                "tien": Number((gia * (Number(soluongnhanValues[item.ma_vt]) ?? 0) * rateVAT / 100).toFixed(2)),
                "tien_Nt": 0,
                "note": "",
                "phan_Tram_Phi_Dich_Vu": 0,
                "tien_Phi_Dich_Vu": 0,
                "phan_Tram_Thue_Ttdb": 0,
                "tien_Thue_Ttdb": 0,
                "phan_Tram_Thue_Nhap_Khau": 0,
                "tien_Thue_Nhap_Khau": 0,
                "tong_Tien_Truoc_Thue": 0,
                "tien_Thue": tienThue,
                "don_Gia_Nt": 0,
                "tien_Thue_Nt": 0,
                "guidRelation": guid
              }
            ]
          }
        })
      const resetProposal = {
        ...selectedProposal,
        chiTietDeNghiMuaHang: selectedProposal.chiTietDeNghiMuaHang.map((item) => ({
          ...item,
          xacNhanHangHoa1: '', // xóa sau khi đã nhập kho xong
          xacNhanHangHoa2: '', // xóa sau khi đã nhập kho xong
          ngayXacNhanHangHoa1: null,

        })),
        daChiTien: dct,
        hoaDonVAT: [],
        list_of_extensions: [],
        chiTietHangHoa: [],
      };
      if (!projectId) {
        setNhapKho(prevNhapKho => {
          const newNhapKho = {
            ...prevNhapKho,
            dien_giai: dienGiai,
            guidRelation: selectedProposal.guid,
            nguoi_tt: selectedProposal.nguoi_tt,
            chiTietHangHoa: updatedChiTietHangHoa.map(item => ({
              ...item,
              id: 0,
              recId: 0,
              ma_kho: dataMuaHang[0].ma_kho,
              guidRelation: selectedProposal.guid,
              ma_Km: 'TONG',
              tk_co: '3312',
              tk_no: '153',
            })) as NhapKhoData[],
            hoaDonVAT: updateThueVAT,
            ngay_duyet1: selectedProposal.createDate,
          };
          dispatch(accountingInvoiceActions.CreatePhieuNhapKho({ data: newNhapKho, files: selectedFiles, id: selectedProposal.id }));
          dispatch(
            accountingInvoiceActions.UpdatePayProposalForm({
              data: resetProposal,
              params: {},
            })
          );
          setIsConfirmDisabled(true);
          resetForm();
          handleClose();
          return newNhapKho;
        });
        return;
      }
      // [27/11] [ngoc_td]: Thêm điều kiện Số lượng nhận không được lớn hơn số lượng còn lại
      for (const item of chiTietHangHoa) {
        const receivedQuantity = parseFloat(soluongnhanValues[item.ma_vt] || '0');
        const remainingQuantity = item.soluongconlai || 0;
        // if (receivedQuantity > remainingQuantity) {
        //   Utils.errorHandling({ errorCode: 1, msg: 'Số lượng nhận không được lớn hơn số lượng còn lại' });
        //   return; // Ngăn lưu nếu vượt quá số lượng còn lại
        // }
      }
      setNhapKho(prevNhapKho => {
        const newNhapKho = {
          ...prevNhapKho,
          dien_giai: dienGiai,
          guidRelation: selectedProposal.guid,
          nguoi_tt: selectedProposal.nguoi_tt,
          chiTietHangHoa: updatedChiTietHangHoa.map(item => ({
            ...item,
            id: 0,
            recId: 0,
            ma_kho: dataMuaHang[0].ma_kho,
            guidRelation: selectedProposal.guid,
            ma_Km: projectList.find(p => p.id === projectId)?.code || '',
            tk_co: '3312',
            tk_no: '153',
          })) as NhapKhoData[],
          hoaDonVAT: updateThueVAT,
          ngay_duyet1: selectedProposal.createDate,
        };
        dispatch(accountingInvoiceActions.CreatePhieuNhapKho({ data: newNhapKho, files: selectedFiles, id: selectedProposal.id }));
        dispatch(
          accountingInvoiceActions.UpdatePayProposalForm({
            data: resetProposal,
            params: {},
          })
        );
        setIsConfirmDisabled(true);
        resetForm();
        handleClose();
        return newNhapKho;
      });



    } catch (error) {
      console.error("Lỗi khi lấy projectId:", error);
    }
  };
  const updateConfirmStatus = () => {
    setNgayXacNhan(dayjs().format('YYYY-MM-DD'));

    const supplierCode = selectedProposal.chiTietDeNghiMuaHang[0]?.ma_kh?.toString();
    // Tạo bản sao của proposal để cập nhật
    const updatedProposal = isSameSupplier ? {
      ...selectedProposal,
      daChiTien: dct,
      ma_kh: supplierCode || '',
      chiTietDeNghiMuaHang: selectedProposal.chiTietDeNghiMuaHang.map((item) => ({
        ...item,
        xacNhanHangHoa1: chtxacnhanStatus[item.ma_vt] ? currentUserName : '', // Gán currentUserName nếu true, ngược lại để rỗng
        xacNhanHangHoa2: ktxacnhanStatus[item.ma_vt] ? currentUserName : '', // Gán currentUserName nếu true, ngược lại để rỗng
        ngayXacNhanHangHoa1: dayjs().format('YYYY-MM-DD'),


      })),
      hoaDonVAT: [],
      list_of_extensions: [],
      chiTietHangHoa: []
    } : {
      ...selectedProposal,
      daChiTien: dct,
      chiTietDeNghiMuaHang: selectedProposal.chiTietDeNghiMuaHang.map((item) => ({
        ...item,
        xacNhanHangHoa1: chtxacnhanStatus[item.ma_vt] ? currentUserName : '', // Gán currentUserName nếu true, ngược lại để rỗng
        xacNhanHangHoa2: ktxacnhanStatus[item.ma_vt] ? currentUserName : '', // Gán currentUserName nếu true, ngược lại để rỗng
        ngayXacNhanHangHoa1: dayjs().format('YYYY-MM-DD'),

      })),
      hoaDonVAT: [],
      list_of_extensions: [],
      chiTietHangHoa: []
    };
    // Gửi action để cập nhật proposal
    dispatch(
      accountingInvoiceActions.UpdatePayProposalForm({
        data: updatedProposal,
        params: {},
      })
    );
    handleClose();
    setSelectedProposal(updatedProposal);
    dispatch(accountingInvoiceActions.setProposalToken(true));
  };
  // [02/04] [ngoc_td]: nếu tất cả các vat_tu trong phiếu đều có chung ncc thì k tách phiếu

  const SplitBySupplier = () => {
    setDCT(1);
    const supplierCode = selectedProposal.chiTietDeNghiMuaHang[0]?.ma_kh?.toString();
    if (isSameSupplier) {
      dispatch(accountingInvoiceActions.UpdatePayProposalForm({
        data: { ...selectedProposal, daChiTien: 1, hoaDonVAT: [], list_of_extensions: [], chiTietHangHoa: [], ma_kh: supplierCode },
        params: {}
      }));
      setIsApproved(true);
      dispatch(accountingInvoiceActions.setProposalToken(true));
      return;
    }
    else {
      dispatch(accountingInvoiceActions.UpdatePayProposalForm({
        data: { ...selectedProposal, daChiTien: 1, hoaDonVAT: [], list_of_extensions: [], chiTietHangHoa: [] },
        params: {}
      }));
      dispatch(
        accountingInvoiceActions.splitDeNghiMuaHangTheoNhaCungCap({
          params: {
            guid: selectedProposal.guid,
          },
        }),
      );
    }
  };

  useEffect(() => {

    // setListNhapKho([...danhSachNhapKho]);
    if (danhSachNhapKho) {
      setListNhapKho([...danhSachNhapKho]);
    } else {
      setListNhapKho([]);
    }
  }, [danhSachNhapKho]);
  useEffect(() => {
    setTongGiaTri(chiTietHangHoa.reduce((sum, item) => {
      const quantity = item.so_luong_nhap1 ?? 0;
      const price = item.gia ?? 0;

      const tax = item.vatRate === -1 ? 0 : item.vatRate;

      return sum + quantity * price * (1 + tax / 100);
    }, 0));
    const initialSoluongnhanValues: { [key: string]: string } = {};
    chiTietHangHoa.forEach((item: ChiTietDeNghiMuaHangDTO) => {
      //[13/1/2025] [ngoc_td] Gán giá trị mặc định bằng với soluongconlai
      initialSoluongnhanValues[item.ma_vt] = item.soluongconlai?.toString() || '0';
    });
    setSoluongnhanValues(initialSoluongnhanValues);

  }, [chiTietHangHoa]);

  useEffect(() => {
    const danhSachSoLuong = tongHopSoLuong(listNhapKho);
    const updatedData = dataMuaHang.map((item: any) => {

      const machine = machineList.find((p) => p.ma_vt === item.ma_vt);
      const nccItem = nccList.find(ncc => ncc.ma_kh === item.ma_kh);
      const nccName = nccItem ? nccItem.ten_kh : '';
      const totalQuantity = danhSachSoLuong.find(
        (ds) => ds.ma_vt === item.ma_vt
      )?.tong_so_luong || 0; // Default to 0 if not found
      const approvedQuantity = item.so_luong_nhap1 || 0;
      const remainingQuantity = approvedQuantity - totalQuantity;
      return {
        ...item,
        name: machine?.ten_vt || '', // Default to empty string if not found
        unit: machine?.dvt || '', // Default to empty string if not found
        key: item.ma_vt,
        tongsoluong: totalQuantity,
        soluongconlai: remainingQuantity > 0 ? remainingQuantity : 0,
        nccName
      };
    });
    setChiTietHangHoa(updatedData);

    // Điều kiện enable nút [Xác nhận]
    const allRemaining = updatedData.every((it: any) => (it.soluongconlai ?? 0) <= 0);
    setDisabledConfirm(allRemaining);
  }, [dataMuaHang, machineList, listNhapKho]);

  const handleSoluongnhanChange = (key: string, value: string) => {
    setSoluongnhanValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const toggleKtxacnhan = (key: string) => {
    setKtxacnhanStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };

  const toggleChtxacnhan = (key: string) => {
    setChtxacnhanStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };
  const tableData = [
    ...chiTietHangHoa,
    {
      ma_vt: 'Tổng tiền duyệt chi',
      so_luong: '',
      gia: chiTietHangHoa.reduce((sum, item) => {
        const quantity = item.so_luong_nhap1 ?? 0;
        const price = item.gia ?? 0;
        return sum + quantity * price;
      }, 0).toLocaleString('en-US'), // Hiển thị tổng giá trị 
    },
  ];
  const columns: ColumnsType<ChiTietDeNghiMuaHangDTO> = [
    {
      title: <span>Mã máy móc - CCDC</span>,
      dataIndex: 'ma_vt',
      key: 'ma_vt',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (text, record) =>
        record.ma_vt === 'Tổng tiền duyệt chi' ? <strong>{text}</strong> : text,
    },
    {
      title: <span>Tên máy móc - CCDC</span>,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      align: 'center',
      fixed: 'left',
    },
    {
      title: <span>{t('Unit')}</span>,
      dataIndex: 'unit',
      key: 'unit',
      width: 75,
      align: 'center',
    },
    //[10/1/2025][ngoc_td] hiển thị tên ncc thay vì code
    {
      title: <span>{t('Supplier')}</span>,
      dataIndex: 'nccName',
      key: 'nccName',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Approved quantity')}</span>,
      dataIndex: 'so_luong_nhap1',
      key: 'so_luong_nhap1',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Approved price')}</span>,
      dataIndex: 'gia',
      key: 'gia',
      width: 100,
      align: 'center',
      render: (text, record: any) => {
        return record.ma_vt === 'Tổng tiền duyệt chi' ? <strong>{text.toLocaleString('en-US')}</strong> : text.toLocaleString('en-US')
      },
    },
    {
      title: <span>% thuế</span>,
      dataIndex: 'phan_Tram_Thue',
      key: 'phan_Tram_Thue',
      width: 80,
      align: 'center',
      render: (_: any, record: any) => {

        return record.vatRate === -1 ? `K` : `${record.vatRate}%`;
      },
    },
    {
      title: <span>{t('Total quantity received')}</span>,
      dataIndex: 'tongsoluong',
      key: 'tongsoluong',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Quantity received this time')}</span>,
      dataIndex: 'soluongnhan',
      key: 'soluongnhan',
      width: 100,
      align: 'center',
      render: (_: any, record: any) =>
        record.ma_vt === 'Tổng tiền duyệt chi' ? <></> : <Input
          value={soluongnhanValues[record.key] || ''}
          onChange={e => handleSoluongnhanChange(record.key, e.target.value)}
        />
    },
    {
      title: <span>{t('Quantity remaining')}</span>,
      dataIndex: 'soluongconlai',
      key: 'soluongconlai',
      width: 100,
      align: 'center',
    },
    {
      title: <span>{t('Quality Assessment (Warehouse Keeper)')}</span>,
      dataIndex: 'danhgia',
      key: 'danhgia',
      width: 265,
      align: 'center',
      render: (_: any, record: any) => (
        record.ma_vt === 'Tổng tiền duyệt chi' ? <></> : <Input
          value={danhGiaValues[record.key] || ''}
          onChange={e => handleDanhGiaChange(record.key, e.target.value)}
        />
      ),
    },
    {
      title: <span>{t('Commander confirmed')}</span>,
      dataIndex: 'chtxacnhan',
      key: 'chtxacnhan',
      render: (_: any, record: any) => {
        if (record.ma_vt === 'Tổng tiền duyệt chi') return null;
        const forceChecked = (record.soluongconlai ?? 0) <= 0;
        const disabled = forceChecked || !approveChtGranted || selectedProposal.daChiTien !== 1;
        const tooltipTitle = selectedProposal.daChiTien !== 1 ? 'Phiếu chưa được Duyệt chi tiền không hỗ trợ Xác nhận nhập kho' : '';
        return (
          <Tooltip title={tooltipTitle}>
            <span style={{ display: 'inline-block' }}>
              <Button
                icon={
                  (forceChecked || chtxacnhanStatus[record.key]) ? (
                    <CheckOutlined style={{ color: 'green' }} />
                  ) : (
                    <CloseOutlined style={{ color: 'red' }} />
                  )
                }
                onClick={() => toggleChtxacnhan(record.key)}
                disabled={disabled}
              />
            </span>
          </Tooltip>
        );
      },
      width: 130,
      align: 'center',
    },
    {
      title: <span>{t('Confirmation technique')}</span>,
      dataIndex: 'ktxacnhan',
      key: 'ktxacnhan',
      width: 130,
      render: (_: any, record: any) => {
        if (record.ma_vt === 'Tổng tiền duyệt chi') return null;
        const forceChecked = (record.soluongconlai ?? 0) <= 0;
        const disabled = forceChecked || !approveKtGranted || selectedProposal.daChiTien !== 1;
        const tooltipTitle = selectedProposal.daChiTien !== 1 ? 'Phiếu chưa được Duyệt chi tiền không hỗ trợ Xác nhận nhập kho' : '';
        return (
          <Tooltip title={tooltipTitle}>
            <span style={{ display: 'inline-block' }}>
              <Button
                icon={
                  (forceChecked || ktxacnhanStatus[record.key]) ? (
                    <CheckOutlined style={{ color: 'green' }} />
                  ) : (
                    <CloseOutlined style={{ color: 'red' }} />
                  )
                }
                onClick={() => toggleKtxacnhan(record.key)}
                disabled={disabled}
              />
            </span>
          </Tooltip>
        );
      },
      align: 'center',
    },

  ];

  return (
    <div>
      <div id="div1">
        <Row>
          <Col span={24}>
            <Title level={4}>Nhập kho máy móc</Title>
          </Col>
        </Row>
        <Row >
          {/* <span style={{ width: '34%' }}>
            <span style={{ fontWeight: '500' }}>Tên công trình: </span>
            <span>{project}</span>
          </span> */}
          <div style={{ marginBottom: 10, width: '101%' }}>{renderNgayDuyetList(proposal)}</div>
        </Row>

        <Form initialValues={{ mavattu: 'DX2509_1', requestDate: dayjs() }}>
          <div className={styles.formContainer} style={{ width: '100%' }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <Form.Item label={t('Interpret')} className={styles.formItem} style={{ maxWidth: 425 }}>
                <TextArea
                  value={dienGiai}
                  style={{ width: '175%' }}
                  onChange={e => handleDiengiaiChange(e.target.value)}
                />
              </Form.Item>
              <Form.Item label={t('Input day')} name="requestDate" className={styles.formItem} style={{ marginLeft: 36 }}>
                <DatePicker format="DD/MM/YYYY" />
              </Form.Item>
              {ngayXacNhan !== 'Invalid Date' ?
                <span style={{ marginBottom: 10 }}>
                  <span style={{ fontWeight: '500' }}>Ngày xác nhận: </span>
                  <span>{ngayXacNhan}</span>
                </span> : <></>
              }
            </div>

            <Button
              style={{
                backgroundColor: isApproved || proposal.daChiTien === 1 ? 'gray' : '#009BEB',
                color: 'white',
              }}
              disabled={!approvePaymentGranted}
              variant="solid"
              onClick={() => {
                if (isApproved) { }
                else { SplitBySupplier() }
              }}
            >
              {isApproved || proposal.daChiTien === 1 ? 'Đã duyệt chi tiền' : 'Duyệt chi tiền'}
            </Button>
          </div>
        </Form>

        <Table dataSource={chiTietHangHoa} columns={columns} pagination={false} scroll={{ x: 'max-content', y: '45vh' }} rowHoverable={false} />
        <strong style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          Tổng tiền duyệt chi: {tongGiaTri.toLocaleString('en-US')} VND
        </strong>
        <div id="div2" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          {/* Button Upload File */}
          <div className={styles.uploadButton}>
            <input
              type="file"
              id="fileUpload"
              className={styles.uploadInput}
              onChange={handleFileChange}
              accept="image/*"
              multiple // Thêm prop multiple để cho phép chọn nhiều file
              aria-label="Upload file"
              title="Choose files to upload"
            />
            <Button
              onClick={() => document.getElementById('fileUpload')?.click()}
              icon={<UploadOutlined />}
            >
              Upload ảnh đính kèm
            </Button>

            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 8
                  }}>
                    <button onClick={() => handlePreviewImage(file)} className={styles.linkButton}>
                      {file.fileName}
                    </button>

                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(file)}
                    />
                  </div>
                ))}
              </div>
            )}

            <Modal
              open={isPreviewModalVisible}
              footer={null}
              onCancel={() => {
                setIsPreviewModalVisible(false);
                if (previewImage) {
                  URL.revokeObjectURL(previewImage);
                  setPreviewImage(null);
                }
              }}
            >
              {previewImage && (
                <img
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                  src={previewImage}
                />
              )}
            </Modal>
          </div>

          {/* Các button hiện tại */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {isConfirmDisabled && (approveChtGranted || approveKtGranted) ? (
              <Button type="primary" onClick={updateConfirmStatus} disabled={disabledConfirm}>
                Xác nhận
              </Button>
            ) : null}

            <div className={styles.buttonContainer}>
              <Tooltip
                title={
                  isSaveDisabled
                    ? "Đã nhập đủ số lượng"
                    : isConfirmDisabled
                      ? "Chưa có vật tư nào được xác nhận bởi chỉ huy trưởng hoặc kỹ thuật!"
                      : ""
                }
                arrow
              >
                <span>
                  <Button
                    type="primary"
                    onClick={onSaveWarehouseReceipt}
                    disabled={isSaveDisabled || isConfirmDisabled || !inventoryGranted}
                  >
                    {t('Save warehouse receipt')}
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default ImportMayMoc;
