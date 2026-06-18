/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Badge, Modal, Switch, TabsProps } from 'antd';
import dayjs from 'dayjs';

import { eTypeVatTu, eTypeVatTuMayMoc, madvcs } from '@/common/define';
import TabHeader from '@/components/Layout/TabHeader/TabHeader';
import { usePermission } from '@/hooks';
import { AccountingInvoiceService, IBaoCaoXuatNhapTonDTO } from '@/services/AccountingInvoiceService';
import {
  accountingInvoiceActions,
  getDanhSachDuyetMuaHang,
  getDateRange,
  getProducts,
  getWareHouses
} from '@/store/accountingInvoice';
import { getCurrentCompany, getgetUserIIS } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTracker, issueActions } from '@/store/issue';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';
import {
  ApprovalNotificationMode,
  canUserApproveProposal,
  getStoredApprovalNotificationMode,
  isPendingApprovalProposal,
  setStoredApprovalNotificationMode,
} from '@/utils/approvalNotification';
import { lastValueFrom } from 'rxjs';
import MachineryMaterialsList from './components/MachineryMaterialsList';
import NewMachineryMaterialList from './components/NewMachineryMaterialList';
import ProposalDone from './components/ProposalDone';
import ProposalHistory from './components/ProposalHistory';

interface MachineryMaterialsProps {
  type: eTypeVatTuMayMoc;
}

export const MachineryMaterials = (props: MachineryMaterialsProps) => {
  const { type } = props;
  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());
  const products = useAppSelector(getProducts()) || [];
  const producsts = products.filter(item => item.productType !== 2)
  const machineries = products.filter(item => item.productType === 2);
  const wareHouses = useAppSelector(getWareHouses());
  const trackers = useAppSelector(getTracker());
  const danhsachduyetmuahang = useAppSelector(getDanhSachDuyetMuaHang());
  const dateRanges = useAppSelector(getDateRange());
  const userIIS = useAppSelector(getgetUserIIS());

  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  //[10/1/2025][ngoc_td] nếu ở trang chủ, sẽ trả về danh sách phiếu đề nghị mua hàng của tất cả mã kho
  const currentWarehouseCode = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? type === eTypeVatTuMayMoc.MayMoc
        ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
        : projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : undefined // Không gán giá trị nếu projectwareHouses rỗng
    : type === eTypeVatTuMayMoc.MayMoc
      ? ''
      : '';

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasPendingProposals, setHasPendingProposals] = useState({
    [eTypeVatTuMayMoc.VatTuChinh]: 0,
    [eTypeVatTuMayMoc.VatTuPhu]: 0,
    [eTypeVatTuMayMoc.MayMoc]: 0,
  });
  const [readyToPay, setReadyToPay] = useState({
    [eTypeVatTuMayMoc.VatTuChinh]: 0,
    [eTypeVatTuMayMoc.VatTuPhu]: 0,
    [eTypeVatTuMayMoc.MayMoc]: 0,
  });
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState('');
  const [approvalNotificationMode, setApprovalNotificationMode] = useState<ApprovalNotificationMode>(
    getStoredApprovalNotificationMode(),
  );

  useEffect(() => {
    dispatch(accountingInvoiceActions.GetProducts({ params: {} }));
    dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
  }, []);

  useEffect(() => {
    if (company) {

      dispatch(issueActions.getTrackerByCompany({ id: company.id }));
    }
  }, [company, dispatch]);
  // Nhóm toàn bộ các vt có cùng guid master
  function groupByGuidMaster(items: any[]): Record<string, any[]> {
    if (items) {
      return items.reduce((acc, item) => {
        if (!acc[item.guid_master]) {
          acc[item.guid_master] = [];
        }
        acc[item.guid_master].push(item);
        return acc;
      }, {} as Record<string, any[]>);
    }
    return {};
  }
  // đếm số lượng object chưa được nhập đủ kho
  const checkQuantities = (data: any): number => {
    let result = 0;

    Object.entries(data).forEach(([key, items]) => {
      if (Array.isArray(items)) {
        // Kiểm tra xem có ít nhất một item trong mảng có `tong_luong_nhap` < `so_luong_yeu_cau` không
        const hasInvalidItem = items.some((item: any) => {
          const total = parseFloat(item.tong_luong_nhap) || 0;
          const required = parseFloat(item.so_luong_nhap1) !== 0 ? parseFloat(item.so_luong_nhap1) : parseFloat(item.soLuongYeuCau) || 0;
          if (required === 0) return true;
          return total < required;
        });

        // Nếu có ít nhất một item không hợp lệ, tăng `result` lên 1
        if (hasInvalidItem) {
          result++;
        }
      }
    });

    return result;
  };
  // phân loại các phiếu xem thuộc vật tư chính, vật tư phụ hay máy móc
  const getProductTypeFromData = (data: any): { VTC: any[][]; VTP: any[][]; MM: any[][] } => {
    const VTC: any[][] = [];
    const VTP: any[][] = [];
    const MM: any[][] = [];

    Object.values(data).forEach((items) => {
      if (Array.isArray(items) && items.length > 0) {
        // Kiểm tra xem tất cả các item trong mảng có `so_luong_nhap1 = 0` không
        const allZero = items.every((item) => parseFloat(item.so_luong_nhap1) === 0);

        // Nếu không phải tất cả đều bằng 0, tiếp tục xử lý
        if (!allZero) {
          const matchedVatTu = producsts.find((vt) => vt.ma_vt === items[0].ma_vt);

          if (matchedVatTu) {
            // Kiểm tra loại vật tư và thêm vào mảng tương ứng
            if (matchedVatTu.productType === eTypeVatTu.VatTuChinh) {
              VTC.push(items);
            } else if (matchedVatTu.productType === eTypeVatTu.VatTuPhu) {
              VTP.push(items);
            }
          } else {
            MM.push(items);
          }
        }
      }
    });

    return { VTC, VTP, MM };
  };
  useEffect(() => {
    // console.log('wareHouses ', wareHouses);
  }, [wareHouses]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  //[20434] [nam_do] hiển thị thông báo và số lượng phiếu đề xuất mới chưa được duyệt
  const calculateCapDuyet = (proposal: any): number => {
    return proposal.nguoiDuyet1 === ''
      ? 0
      : proposal.nguoiDuyet2 === ''
        ? 1
        : proposal.nguoiDuyet3 === ''
          ? 2
          : proposal.nguoiDuyet4 === ''
            ? 3
            : proposal.nguoiDuyet5 === ''
              ? 4
              : 5;
  };
  async function tongHopSoLuong(guid: string) {

    const ketQua: { ma_vt: string; tong_so_luong: number }[] = [];

    try {
      const res = await lastValueFrom(AccountingInvoiceService.Get.getPhieuNhapKhoTuDeNghiMuaHang(guid));

      res.forEach((nhapKho: any) => {
        nhapKho.chiTietHangHoa.forEach((hangHoa: any) => {
          const { ma_vt, so_luong } = hangHoa;
          const item = ketQua.find(kq => kq.ma_vt === ma_vt);
          if (item) {
            item.tong_so_luong += so_luong;
          } else {
            ketQua.push({ ma_vt, tong_so_luong: so_luong });
          }
        });
      });
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu nhập kho:', error);
    }
    return ketQua;
  }
  useEffect(() => {
    const startDate = dateRanges?.startDate || dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const endDate = dateRanges?.endDate || dayjs().format('YYYY-MM-DD');

    dispatch(
      accountingInvoiceActions.GetDanhSachDuyetMuaHang({
        params: {
          madvcs: 'THUCHIEN',
          ngay_de_nghi_tu_ngay: startDate,
          ngay_de_nghi_den_ngay: endDate,
          ma_kho: currentWarehouseCode,
        },
      }),
    );
    const formattedValues: IBaoCaoXuatNhapTonDTO = {
      madvcs: madvcs.KEHOACH,
      tu_ngay: startDate,
      den_ngay: endDate,
      ma_kho: currentWarehouseCode,
      tk_no: '',
      tk_co: '',
      otherFilter: '',
    };
    dispatch(
      accountingInvoiceActions.getBaoCaoXuatNhapTon({
        params: {
          data: formattedValues,
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWarehouseCode, dateRanges]);

  useEffect(() => {
    const updateProposals = async () => {
      if (Array.isArray(danhsachduyetmuahang) && danhsachduyetmuahang.length > 0) {
        const pendingProposals = {
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        };
        let pay = {
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        };

        const userApprovalLevel = userIIS?.[0]?.capDuyetChi ?? 0;
        for (const proposal of danhsachduyetmuahang) {
          const shouldCount =
            approvalNotificationMode === 'all'
              ? isPendingApprovalProposal(proposal)
              : canUserApproveProposal(proposal, userApprovalLevel);

          if (shouldCount) {
            const maVt = proposal.chiTietDeNghiMuaHang[0]?.ma_vt || '';
            const product = producsts.find(vt => vt.ma_vt === maVt);
            const maymoc = machineries.find(mm => mm.ma_vt === maVt);

            if (product) {
              if (product.productType === eTypeVatTu.VatTuChinh) {
                pendingProposals[eTypeVatTuMayMoc.VatTuChinh]++;
              } else if (product.productType === eTypeVatTu.VatTuPhu) {
                pendingProposals[eTypeVatTuMayMoc.VatTuPhu]++;
              }
            } else if (maymoc) {
              pendingProposals[eTypeVatTuMayMoc.MayMoc]++;
            }
          }
        }
        setHasPendingProposals(pendingProposals);
        // Logic xử lý danh sách phiếu nhập kho:
        //  lấy và xử lý dữ liệu từ api
        //  nhóm các dữ liệu thuộc về cùng 1 phiếu đề nghị mua hàng
        //  lọc xem phiếu nào thuộc về VTC, VTP, MM
        //  kiểm tra số lượng nhập kho có đủ không, nếu không đủ thì +1 vào biến đếm
        //  đẩy danh sách giá trị lên state để biểu diễn
        AccountingInvoiceService.Get.GetDanhSachPhieuNhapKho({
          search: {
            madvcs: 'THUCHIEN',
            ngay_de_nghi_tu_ngay: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            ngay_de_nghi_den_ngay: dayjs().format('YYYY-MM-DD'),
            ma_kho: currentWarehouseCode || '',
          }
        }).subscribe(async (res: any) => {
          const parsedData = res.map((item: string) => {
            if (item === "") {
              return []; // Trả về mảng rỗng nếu item là chuỗi rỗng
            }
            return JSON.parse(item);
          });
          const checkImport = groupByGuidMaster(parsedData[2]);
          const { VTC, VTP, MM } = getProductTypeFromData(checkImport);
          pay = {
            [eTypeVatTuMayMoc.VatTuChinh]: checkQuantities(VTC),
            [eTypeVatTuMayMoc.VatTuPhu]: checkQuantities(VTP),
            [eTypeVatTuMayMoc.MayMoc]: checkQuantities(MM),
          }
          setReadyToPay(pay);
        });
      } else {
        setHasPendingProposals({
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        });
        setReadyToPay({
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        });
      }
    };
    updateProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [danhsachduyetmuahang, products, approvalNotificationMode, userIIS]);

  let tabs: TabsProps['items'] = [];

  switch (type) {
    case eTypeVatTuMayMoc.VatTuChinh:
      tabs = [
        {
          key: '1',
          label: 'Danh sách vật tư chính',
          children: <MachineryMaterialsList type={type} searchText={searchText} />,
        },
        {
          key: '2',
          label: (
            <Badge count={hasPendingProposals[eTypeVatTuMayMoc.VatTuChinh]} offset={[20, 0]}>
              Đề xuất cấp vật tư chính
            </Badge>
          ),
          children: <ProposalHistory type={type} approvalMode={approvalNotificationMode} />,
        },
        {
          key: '3',
          label:
            <Badge count={readyToPay[eTypeVatTuMayMoc.VatTuChinh]} offset={[2, 0]}>
              <span style={{ paddingLeft: 15, paddingRight: 15 }}>Đề xuất sẵn sàng nhập kho</span>
            </Badge>,
          children: <ProposalDone type={type} />,
        },
      ];
      break;
    case eTypeVatTuMayMoc.VatTuPhu:
      tabs = [
        {
          key: '1',
          label: 'Danh sách vật tư phụ',
          children: <MachineryMaterialsList type={type} searchText={searchText} />,
        },
        {
          key: '2',
          label: (
            <Badge count={hasPendingProposals[eTypeVatTuMayMoc.VatTuPhu]} offset={[15, 0]}>
              Đề xuất cấp vật tư phụ
            </Badge>
          ),
          children: <ProposalHistory type={type} approvalMode={approvalNotificationMode} />,
        },
        {
          key: '3',
          label: <Badge count={readyToPay[eTypeVatTuMayMoc.VatTuPhu]} offset={[-5, 0]}>
            <span style={{ paddingLeft: 15, paddingRight: 15 }}>Đề xuất sẵn sàng nhập kho</span>
          </Badge>,
          children: <ProposalDone type={type} />,
        },
        // // [16/01/2025][#23123] [phuong_td] bỏ qua việc kiểm tra project được chọn để hiển thị tab chi phí phát sinh
        // {
        //   key: '4',
        //   label: <span>Chi phí phát sinh</span>,
        //   children: <AdditionalCost type={type} />,
        // }
      ];
      break;
    case eTypeVatTuMayMoc.MayMoc:
      tabs = [
        {
          key: '1',
          label: 'Danh sách máy móc - CCDC',
          children: <MachineryMaterialsList type={type} searchText={searchText} />,
        },
        {
          key: '2',
          label: (
            <Badge count={hasPendingProposals[eTypeVatTuMayMoc.MayMoc]} offset={[15, 0]}>
              Đề xuất cấp máy móc - CCDC
            </Badge>
          ),
          children: <ProposalHistory type={type} approvalMode={approvalNotificationMode} />,
        },
        {
          key: '3',
          label: <Badge count={readyToPay[eTypeVatTuMayMoc.MayMoc]} offset={[0, 0]}>
            <span style={{ paddingLeft: 15, paddingRight: 15 }}>Đề xuất sẵn sàng nhập kho</span>
          </Badge>,
          children: <ProposalDone type={type} />,
        },
      ];
      break;
  }
  //[20433] [ngoc_td] lấy ncc list
  const handleAddProposal = () => {
    dispatch(accountingInvoiceActions.setProposalFormSelected(undefined));
    dispatch(accountingInvoiceActions.getCustomers());
    // [21/10/2024][phuong_td] Thay đổi Session để dialog Tạo phiếu đề xuất gọi lại api
    dispatch(issueActions.setSession(Utils.generateRandomString(3)));
    setIsModalVisible(true);
  };

  const handleDownload = () => { };

  const handleSelectDate = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        dispatch(
          accountingInvoiceActions.setDateRange({
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
          }),
        );
      }
    } else {
      console.log('Khoảng thời gian chưa được chọn đầy đủ.');
    }
  };
  const handleModalClose = () => {
    const random = Utils.generateRandomString(3);
    dispatch(accountingInvoiceActions.setClearData(random));
    setIsModalVisible(false);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleApprovalModeChange = (checked: boolean) => {
    const nextMode: ApprovalNotificationMode = checked ? 'all' : 'mine';
    setApprovalNotificationMode(nextMode);
    setStoredApprovalNotificationMode(nextMode);
  };

  const getPermissionKey = () => {
    let permissionKey = '';
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
        permissionKey = 'KhoCongTy.VatTuChinh.Create';
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        permissionKey = 'KhoCongTy.VatTuPhu.Create';
        break;
      case eTypeVatTuMayMoc.MayMoc:
        permissionKey = 'KhoCongTy.MayMoc.Create';
        break;
      default:
        break;
    }
    return permissionKey;
  };

  const key = getPermissionKey();
  const isAddProposalGranted = usePermission([key]);
  const proposalToolbarExtra = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
      <Switch
        size="small"
        checked={approvalNotificationMode === 'all'}
        onChange={handleApprovalModeChange}
      />
      <span>Hiển thị tất cả phiếu chờ duyệt</span>
    </div>
  );

  return (
    <div>
      <TabHeader
        tabs={tabs}
        onAddProposal={handleAddProposal}
        onDownload={handleDownload}
        onSelectDate={handleSelectDate}
        onSearch={handleSearch}
        proposalToolbarExtra={proposalToolbarExtra}
        addButtonProps={{
          disabled: !isAddProposalGranted,
        }}
      />
      <div style={{ display: 'none' }}>
        <Switch
          size="small"
          checked={approvalNotificationMode === 'all'}
          onChange={handleApprovalModeChange}
        />
        <span>Hiển thị tất cả phiếu chờ duyệt</span>
      </div>
      <Modal open={isModalVisible} onCancel={handleModalClose} footer={null} width={1250}>
        <NewMachineryMaterialList
          type={type}
          handleClose={() => {
            setIsModalVisible(false);
          }}
        />
      </Modal>
    </div>
  );
};
