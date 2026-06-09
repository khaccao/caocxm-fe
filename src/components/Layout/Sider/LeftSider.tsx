/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import {
  // eslint-disable-next-line
  DashboardOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  SnippetsOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Layout, Menu, MenuProps, SiderProps, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { eTypeVatTu, eTypeVatTuMayMoc, LeftPanelWidth, MenuItem } from '@/common/define';
import './leftPanel.css';
import styles from './LeftSider.module.less';
// eslint-disable-next-line
import { IconSvg } from '@/components';
import { getEnvVars } from '@/environment';
import { fullPermissionsRoles } from '@/hooks';
import ProjectBg from '@/image/icon/project.png';
import { AccountingInvoiceService } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getProducts } from '@/store/accountingInvoice';
import { appActions, getActiveMenu, getCurrentCompany, getGrantedPolicies, getUserRoles } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import { getDefaultOrganization } from '@/store/user';
import { getAuthMenuItems, groupByGroupId } from '@/utils';

const { Sider } = Layout;

const { apiUrl } = getEnvVars();

export const LeftSider = (props: SiderProps) => {
  const { ...rest } = props;

  const { t } = useTranslation(['layout', 'organization']);
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
          const required =
            parseFloat(item.so_luong_nhap1) !== 0
              ? parseFloat(item.so_luong_nhap1)
              : parseFloat(item.soLuongYeuCau) || 0;
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

    Object.values(data).forEach(items => {
      if (Array.isArray(items) && items.length > 0) {
        // Kiểm tra xem tất cả các item trong mảng có `so_luong_nhap1 = 0` không
        const allZero = items.every(item => parseFloat(item.so_luong_nhap1) === 0);

        // Nếu không phải tất cả đều bằng 0, tiếp tục xử lý
        if (!allZero) {
          const matchedVatTu = producsts.find(vt => vt.ma_vt === items[0].ma_vt);

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
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const selectedProject = useAppSelector(getSelectedProject());
  const activeMenu = useAppSelector(getActiveMenu());
  const defaultOrganization = useAppSelector(getDefaultOrganization());
  const grantedPolicies = useAppSelector(getGrantedPolicies());

  const userRoles = useAppSelector(getUserRoles());
  const isFullPermissions = fullPermissionsRoles.some(role => userRoles.includes(role));

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(['/projects/employees']);
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);

  const currentWarehouseCodeMM = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : '' // Không gán giá trị nếu projectwareHouses rỗng
    : '';
  const currentWarehouseCodeVT = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : '' // Không gán giá trị nếu projectwareHouses rỗng
    : '';
  const products = useAppSelector(getProducts()) || []; // fallback là []
  const producsts = products.filter(item => item.productType !== 2);
  const machineries = products.filter(item => item.productType === 2);
  // const [producsts, setProducsts] = useState(products.filter(item => item.productType !== 2));
  // const [machineries, setMachineries] = useState(products.filter(item => item.productType === 2));
  const [hasPendingVTC, setHasPendingVTC] = useState(0);
  const [hasPendingVTP, setHasPendingVTP] = useState(0);
  const [hasPendingMM, setHasPendingMM] = useState(0);
  const [payReadyVTC, setPayReadyVTC] = useState(0);
  const [payReadyVTP, setPayReadyVTP] = useState(0);
  const [payReadyMM, setPayReadyMM] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [badgeCountVTC, setBadgeCountVTC] = useState(0);
  const [badgeCountVTP, setBadgeCountVTP] = useState(0);
  const [badgeCountMM, setBadgeCountMM] = useState(0);

  const company = useAppSelector(getCurrentCompany());
  const additionalCosts = useAppSelector((state: RootState) => state.accountingInvoice.AdditionalCosts) || [];
  const [badgeCountCPPS, setBadgeCountCPPS] = useState(0);

  useEffect(() => {
    setBadgeCount(
      hasPendingVTC + hasPendingMM + hasPendingVTP + payReadyMM + payReadyVTC + payReadyVTP + badgeCountCPPS,
    );
    setBadgeCountVTC(hasPendingVTC + payReadyVTC);
    setBadgeCountVTP(hasPendingVTP + payReadyVTP);
    setBadgeCountMM(hasPendingMM + payReadyMM);
  }, [hasPendingVTC, hasPendingMM, hasPendingVTP, payReadyMM, payReadyVTC, payReadyVTP, badgeCountCPPS]);
  useEffect(() => {
    dispatch(accountingInvoiceActions.GetProducts({ params: {} }));
    dispatch(accountingInvoiceActions.GetWareHouse({ params: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const updateAllProposals = async () => {
      const commonSearchParams = {
        madvcs: 'THUCHIEN',
        ngay_de_nghi_tu_ngay: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        ngay_de_nghi_den_ngay: dayjs().format('YYYY-MM-DD'),
      };

      // 1. Call Duyệt Mua Hàng cho cả 2 kho
      AccountingInvoiceService.Get.GetDanhSachDuyetMuaHang({
        search: {
          ...commonSearchParams,
          ma_kho: currentWarehouseCodeMM || '',
        },
      }).subscribe((resMM: any) => {
        const pending = {
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        };

        if (Array.isArray(resMM)) {
          for (const proposal of resMM) {
            const capDuyetHienTai = calculateCapDuyet(proposal);
            if (capDuyetHienTai < proposal.capDuyet) {
              const maVt = proposal.chiTietDeNghiMuaHang[0]?.ma_vt;
              const found = machineries.find(mm => mm.ma_vt === maVt);
              if (found) {
                pending[eTypeVatTuMayMoc.MayMoc]++;
              }
            }
          }
        }

        setHasPendingMM(pending[eTypeVatTuMayMoc.MayMoc]);
      });

      AccountingInvoiceService.Get.GetDanhSachDuyetMuaHang({
        search: {
          ...commonSearchParams,
          ma_kho: currentWarehouseCodeVT || '',
        },
      }).subscribe((resVT: any) => {
        const pending = {
          [eTypeVatTuMayMoc.VatTuChinh]: 0,
          [eTypeVatTuMayMoc.VatTuPhu]: 0,
          [eTypeVatTuMayMoc.MayMoc]: 0,
        };

        if (Array.isArray(resVT)) {
          for (const proposal of resVT) {
            const capDuyetHienTai = calculateCapDuyet(proposal);
            if (capDuyetHienTai < proposal.capDuyet) {
              const maVt = proposal.chiTietDeNghiMuaHang[0]?.ma_vt;
              const found = machineries.find(vt => vt.ma_vt === maVt);
  
              if (found?.productType === eTypeVatTu.VatTuChinh) {
                pending[eTypeVatTuMayMoc.VatTuChinh]++;
              } else if (found?.productType === eTypeVatTu.VatTuPhu) {
                pending[eTypeVatTuMayMoc.VatTuPhu]++;
              }
            }
          }
        }

        setHasPendingVTC(pending[eTypeVatTuMayMoc.VatTuChinh]);
        setHasPendingVTP(pending[eTypeVatTuMayMoc.VatTuPhu]);
      });

      // 2. Call Phiếu Nhập Kho (dùng chung cho cả 2 kho hoặc tách riêng nếu cần)
      const fetchNhapKho = (ma_kho: string) => {
        AccountingInvoiceService.Get.GetDanhSachPhieuNhapKho({
          search: {
            ...commonSearchParams,
            ma_kho,
          },
        }).subscribe((res: any) => {
          if (!Array.isArray(res)) {
            console.error('Dữ liệu trả về không hợp lệ');
            return;
          }

          const parsedData = res.map((item: string) => (item === '' ? [] : JSON.parse(item)));
          const checkImport = groupByGuidMaster(parsedData[2]);
          const { VTC, VTP, MM } = getProductTypeFromData(checkImport);
          setPayReadyVTC(checkQuantities(VTC));
          setPayReadyVTP(checkQuantities(VTP));
          setPayReadyMM(checkQuantities(MM));
        });
      };

      fetchNhapKho(currentWarehouseCodeMM || '');
      fetchNhapKho(currentWarehouseCodeVT || '');
    };

    updateAllProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectwareHouses, products]);

  useEffect(() => {
    if (selectedProject?.id && company.id) {
      dispatch(
        accountingInvoiceActions.getAdditionalCosts({
          projectId: selectedProject.id,
          companyId: company.id,
        }),
      );
    } else {
      dispatch(
        accountingInvoiceActions.getAdditionalCosts({
          projectId: -1,
          companyId: company.id,
        }),
      );
    }
  }, [selectedProject, company]);

  useEffect(() => {
    if (Array.isArray(additionalCosts)) {
      const unconfirmed = additionalCosts.filter(item => item.isSynchronized === 0);
      const merged = groupByGroupId(unconfirmed);
      const groupCount = Object.keys(merged).length;
      setBadgeCountCPPS(groupCount);
    } else {
      setBadgeCountCPPS(0);
    }
  }, [additionalCosts]);

  const mainMenu: MenuItem[] = [
    // {
    //   label: t('Home'),
    //   icon: <FileDoneOutlined />,
    //   key: '/',
    // },
    {
      label: t('Dashboard'),
      icon: <DashboardOutlined />,
      key: '/dashboard',
      auth: ['BanTin.View'],
    },
    {
      label: t('Projects'),
      icon: <HomeOutlined />,
      key: '/projects',
      auth: ['DuAn.View'],
    },
    {
      label: t('Employee'),
      icon: <TeamOutlined />,
      key: '/employee',
      children: [
        {
          label: t('Company employee'),
          key: '/employee/company-employee',
          auth: ['CongTy.NhanSu.View'],
        },
        {
          label: t('Company group'),
          key: '/employee/company-group',
          auth: ['CongTy.PhongBan.View'],
        },
      ],
    },
    {
      label: t('Shift templates'),
      icon: <FieldTimeOutlined />,
      key: '/shift-templates',
      auth: ['CaLamViec.View'],
    },
    {
      label: (
        <div>
          {t('Store - Material - Machinery')}
          <Badge count={badgeCount} offset={[10, -2]} />
        </div>
      ),
      icon: (
        <i>
          <img src="/icons/khovattu.png" width={18} alt="" />
        </i>
      ),
      key: '/material-machinery',
      children: [
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Main material')}
              <Badge count={badgeCountVTC} offset={[10, 1]} />
            </div>
          ),
          key: '/material-machinery/main-material',
          auth: ['KhoCongTy.VatTuChinh.View'],
        },
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Auxiliary material')}
              <Badge count={badgeCountVTP} offset={[10, 1]} />
            </div>
          ),
          key: '/material-machinery/auxiliary-material',
          auth: ['KhoCongTy.VatTuPhu.View'],
        },
        // [implement #22048]
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Additional costs')}
              <Badge count={badgeCountCPPS} offset={[10, 1]} />
            </div>
          ),
          key: '/material-machinery/auxiliary-material/incidental-costs',
          auth: ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View'],
        },
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Machinery')}
              <Badge count={badgeCountMM} offset={[10, 1]} />
            </div>
          ),
          key: '/material-machinery/machinery',
          auth: ['KhoCongTy.MayMoc.View'],
        },
        // {
        //   label: t('Materials log'),
        //   key: '/material-machinery/materials-log',
        // },
        // {
        //   label: t('Machinery log'),
        //   key: '/material-machinery/machinery-log',
        // },
        {
          label: t('Transfer material'),
          key: '/material-machinery/transfer-material',
          auth: ['KhoCongTy.DieuChuyenVatTu.View'],
        },
        {
          label: t('Depot'),
          key: '/material-machinery/depot',
          auth: ['KhoCongTy.TongKho.View'],
        },
      ],
    },
    {
      label: t('Reports'),
      icon: <SolutionOutlined />,
      key: '/reports',
      children: [
        {
          label: t('Timekeeping Report'),
          key: '/reports/timekeeping-report',
          auth: ['ChamCong.View'],
        },
      ],
    },
    {
      label: t('KPI - Salary'),
      icon: (
        <i>
          <img src="/icons/kpiluong.png" width={18} alt="" />
        </i>
      ),
      key: '/kpi-salary',
      children: [
        {
          label: t('KPIs of departments'),
          key: '/kpi-salary/kpis-of-departments',
          auth: ['KPI.KPIBoPhan.View'],
        },
        {
          label: t('Salary of departments'),
          key: '/kpi-salary/salary-of-departments',
          auth: ['KPI.LuongBoPhan.View'],
        },
        {
          label: t('1st salary advance'),
          key: '/kpi-salary/1st-salary-advance',
          auth: ['KPI.UngLuong_1.View'],
        },
        {
          label: t('1st salary payment'),
          key: '/kpi-salary/1st-salary-payment',
          auth: ['KPI.ThanhToanLuong_1.View'],
        },
        {
          label: t('2nd salary advance'),
          key: '/kpi-salary/2nd-salary-advance',
          auth: ['KPI.UngLuong_2.View'],
        },
        {
          label: t('2nd salary payment'),
          key: '/kpi-salary/2nd-salary-payment',
          auth: ['KPI.ThanhToanLuong_2.View'],
        },
        {
          label: t('Compare salary standards'),
          key: '/kpi-salary/compare-salary-standards',
          auth: ['KPI.SoSanhDMLuong.All'],
        },
        // [13/01/2025][#21283][phuong_td] Bỏ màn hình này do không cần thêm màn hình chi phí phát sinh mới
        // {
        //   label: t('Additional costs'),
        //   key: '/kpi-salary/salary-additional-costs',
        //   auth: ['KPI.ChiPhiPhatSinh.View'],
        // },
        {
          label: t('Year-end bonus'),
          key: '/kpi-salary/year-end-bonus',
          auth: ['KPI.ThuongCuoiNam.View'],
        },
      ],
    },
    {
      label: t('Union welfare funds'),
      icon: (
        <i>
          <img src="/icons/quycongdoan.png" width={18} alt="" />
        </i>
      ),
      key: '/union-welfare-funds',
      children: [
        {
          label: t('Union fee collection report'),
          key: '/union-welfare-funds/fee',
          auth: ['CongDoan.ThuPhiCD.View'],
        },
        {
          label: t('Union funds expenses report'),
          key: '/union-welfare-funds/expenses',
          auth: ['CongDoan.ChiQuyCD.View'],
        },
        {
          label: t('Tet and holiday bonus expenses'),
          key: '/union-welfare-funds/bonus',
          auth: ['CongDoan.CPLeTet.View'],
        },
        {
          label: t('Recurring travel expenses'),
          key: '/union-welfare-funds/recurring-travel-expenses',
          auth: ['CongDoan.CPDuLichDinhKy.View'],
        },
      ],
    },
    {
      label: t('Management accounting'),
      icon: (
        <i>
          <img src="/icons/ktquantri.png" width={18} alt="" />
        </i>
      ),
      key: '/management-accounting',
      children: [
        {
          label: t('Make an advance plan'),
          key: '/management-accounting/make-an-advance-plan',
          auth: ['KeHoachTaiChinh.TamUng.View'],
        },
        {
          label: t('Payment plan'),
          key: '/management-accounting/payment-plan',
          auth: ['KeHoachTaiChinh.ThanhToan.View'],
        },
        {
          label: t('Aggregate materials'),
          key: '/management-accounting/aggregate-materials',
          auth: ['KeHoachTaiChinh.TongHopVatTu.View'],
        },
        {
          label: t('Track cash flow'),
          key: '/management-accounting/track-cash-flow',
          auth: ['KeHoachTaiChinh.DongTien.View'],
        },
        {
          label: t('Bookkeeping'),
          key: '/management-accounting/bookkeeping',
          auth: ['KeHoachTaiChinh.SoSachKeToan.View'],
        },
        {
          label: t('Input invoices'),
          key: '/management-accounting/input-invoices',
          auth: ['KeHoachTaiChinh.HoaDonDauVao.View'],
        },
        {
          label: t('Output invoices'),
          key: '/management-accounting/output-invoices',
          auth: ['KeHoachTaiChinh.HoaDonDauRa.View'],
        },
        {
          label: t('Invoices difference'),
          key: '/management-accounting/invoices-difference',
          auth: ['KeHoachTaiChinh.ChenhLechHoaDon.View'],
        },
        {
          label: t('Invoice X'),
          key: '/management-accounting/invoice-x',
          auth: ['KeHoachTaiChinh.HoaDonX.View'],
        },
        {
          label: t('ĐMDT / HĐ đầu vào + X'),
          key: '/management-accounting/input-invoices-and-x',
          auth: ['KeHoachTaiChinh.DMDT.View'],
        },
        {
          label: t('Compare norms'),
          key: '/management-accounting/compare-norms',
          auth: ['KeHoachTaiChinh.DoiChieuDinhMuc.View'],
        },
        {
          label: t('Supplier - Investor debt'),
          key: '/management-accounting/supplier-investor-debt',
          auth: ['KeHoachTaiChinh.CongNoNCC_CDT.View'],
        },
        {
          label: t('Profit and loss statement'),
          key: '/management-accounting/profit-and-loss-statement',
          auth: ['KeHoachTaiChinh.QuyetToanLaiLoCongTrinh.View'],
        },
        {
          label: t('Tổng hợp xuất nhập tồn'),
          key: '/management-accounting/totalinout',
          auth: ['KeHoachTaiChinh.TongHopXuatNhapTon.View'],
        },
        {
          label: t('Balance sheet'),
          key: '/management-accounting/balance-sheet',
          auth: ['KeHoachTaiChinh.CanDoiKeToan.View'],
        },
        {
          label: t('Table of revenue summary'),
          key: '/management-accounting/table-of-revenue-summary',
          auth: ['KeHoachTaiChinh.TongHopDoanhThu.View'],
        },
        {
          label: t('Products diary'),
          key: '/management-accounting/productsDiary',
          auth: ['KeHoachTaiChinh.NhatKyVTMM.View'],
        },
        // {
        //   label: t('Other cost charts'),
        //   key: '/management-accounting/Other-cost-charts',
        // },
        // {
        //   label: t('Profit chart'),
        //   key: '/management-accounting/profit-chart',
        // },
      ],
    },
    {
      label: t('Review'),
      icon: (
        <i>
          <img src="/icons/danhgia.png" width={18} alt="" />
        </i>
      ),
      key: '/review',
      children: [
        {
          label: t('Project management - suppliers'),
          key: '/review/project-management-suppliers',
          auth: ['DanhGia.QLDA_NCC.View'],
        },
        {
          label: t('Supervision consultants - supplier'),
          key: '/review/supervision-consultants-suppliers',
          auth: ['DanhGia.TVGS_NCC.View'],
        },
        {
          label: t('Investors - Project management'),
          key: '/review/investors-project-management',
          auth: ['DanhGia.CDT_BQL.View'],
        },
        {
          label: t('Investors - Supervision consultants'),
          key: '/review/investors-supervision-consultant',
          auth: ['DanhGia.CDT_BQL.View'],
        },
        {
          label: t('Other'),
          key: '/review/Other',
        },
      ],
    },
    {
      label: t('ManagerNews'),
      icon: <SnippetsOutlined />,
      key: '/manager-news',
      auth: ['QuanLyTinTuc.View'],
    },
    {
      label: t('Capability Profile'),
      icon: <FileTextOutlined />,
      key: '/capability-profile',
      auth: ['HoSoNangLuc.View'],
    },
  ];

  const projectMenu: MenuItem[] = [
    {
      label: t('Bidding'),
      icon: (
        <i>
          <IconSvg name="bidding" width={20} />
        </i>
      ),
      key: '/projects/bidding',
      auth: ['DuThau.View'],
    },
    {
      label: t('Contract, Bidding KPIs'),
      icon: (
        <i>
          <img src="/icons/hopdongkips.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/contract-bid-kpis',
      auth: ['HopDong_KPIDauThau.View'],
    },
    {
      label: t('Construction manuals'),
      key: '/projects/construction/manuals',
      icon: (
        <i>
          <img src="/icons/hopdongkips.png" width={18} alt="" />
        </i>
      ),
      auth: ['SoTayQuyTrinhThiCong.View'],
    },
    {
      label: t('Prepare for construction'),
      icon: (
        <i>
          <img src="/icons/chuanbithicong.png" width={16} alt="" />
        </i>
      ),
      key: '/projects/prepare',
      children: [
        {
          label: t('Preparation work in construction'),
          key: '/projects/prepare/construction',
          auth: ['ChuanBiThiCong.View'],
        },
        {
          label: t('Cost estimate'),
          key: '/projects/prepare/cost-estimate',
          auth: ['DuTruKinhPhi.View'],
        },
      ],
    },
    {
      label: t('Construction'),
      icon: (
        <i>
          <img src="/icons/thicong.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/construction',
      children: [
        {
          label: t('Initial setup process'),
          key: '/projects/construction/init',
          auth: ['LapTienDoBanDau.View'],
        },
        {
          label: t('Weekly assignment'),
          key: '/projects/construction/weekly-assignment',
          auth: ['GiaoViecHangTuan.View'],
        },
        {
          label: t('Daily labor summary'),
          key: '/projects/construction/daily-labor-summary',
          auth: ['TH_NhanCongHangNgay.All'],
        },
        {
          label: t('Construction diary'),
          key: '/projects/construction/diary',
          auth: ['NhatKyThiCong.View'],
        },
        {
          label: t('Products diary'),
          key: '/projects/construction/productsDiary',
          auth: ['NhatKyVTMM.View'],
        },
        {
          label: t('Labor safety diary'),
          key: '/projects/construction/labor-safety-diary',
          auth: ['NhatKyATLD_VSMT.View'],
        },
      ],
    },
    {
      label: (
        <div>
          {t('Store - Material - Machinery')}
          <Badge count={badgeCount} offset={[10, -2]} />
        </div>
      ),
      icon: (
        <i>
          <img src="/icons/khovattu.png" width={18} alt="" />
        </i>
      ),
      key: '/projects',
      children: [
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Main material')}
              <Badge count={badgeCountVTC} offset={[10, 1]} />
            </div>
          ),
          key: '/projects/main-material',
          auth: ['KhoCongTrinh.VatTuChinh.View'],
        },
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Auxiliary material')}
              <Badge count={badgeCountVTP} offset={[10, 1]} />
            </div>
          ),
          key: '/projects/auxiliary-material',
          auth: ['KhoCongTrinh.VatTuPhu.View'],
        },
        // [implement #22048]
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Additional costs')}
              <Badge count={badgeCountCPPS} offset={[10, 1]} />
            </div>
          ),
          key: '/projects/auxiliary-material/incidental-costs',
          auth: ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View'],
        },
        {
          label: (
            <div style={{ paddingLeft: 3 }}>
              {t('Machinery')}
              <Badge count={badgeCountMM} offset={[10, 1]} />
            </div>
          ),
          key: '/projects/machinery',
          auth: ['KhoCongTrinh.MayMoc.View'],
        },
        // {
        //   label: t('Materials log'),
        //   key: '/projects/materials-log',
        // },
        // {
        //   label: t('Machinery log'),
        //   key: '/projects/machinery-log',
        // },
        {
          label: t('Transfer material'),
          key: '/projects/transfer-material',
          auth: ['KhoCongTrinh.DieuChuyenVatTu.View'],
        },
        {
          label: t('Depot'),
          key: '/projects/depot',
          auth: ['KhoCongTrinh.TongKho.View'],
        },
      ],
    },
    {
      label: t('Subcontractors'),
      icon: (
        <i>
          <img src="/icons/thauphu.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/subcontractors',
      children: [
        {
          label: t('Subcontract'),
          key: '/projects/subcontractors/subcontract',
          auth: ['HopDongThauPhu.View'],
        },
        {
          label: t('Pay the subcontractor 12'),
          key: '/projects/subcontractors/pay-the-subcontractor-12',
          auth: ['ThanhToanThauPhu_12.View'],
        },
        {
          label: t('Pay the subcontractor 27'),
          key: '/projects/subcontractors/pay-the-subcontractor-27',
          auth: ['ThanhToanThauPhu_27.View'],
        },
        {
          label: t('Aggregate costs'),
          key: '/projects/subcontractors/aggregate-costs',
          auth: ['TongHopChiPhi.View'],
        },
      ],
    },
    {
      label: t('Check-in'),
      icon: (
        <i>
          <img src="/icons/chamcong.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/check-in',
      children: [
        {
          label: t('Check-in time'),
          key: '/projects/employees/check-in-time',
          auth: ['ChamCong.View'],
        },
        // {
        //   label: t('Overtime'),
        //   key: '/projects/employees/overtime',
        // },
      ],
    },
    {
      label: t('Employees'),
      icon: (
        <i>
          <img src="/icons/nhansu.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/employees',
      children: [
        {
          label: t('Personnel transfer'),
          key: '/projects/employees/transfer',
          auth: ['DieuChuyenNhanSu.View'],
        },
        {
          label: t('DM statistic - Bonus'),
          key: '/projects/employees/statistic-bonus',
          auth: ['ThongKeDM_Thuong.View'],
        },
        {
          label: t('Team manage'),
          key: '/projects/employees/team-manage',
          auth: ['QuanLyToDoi.View'],
        },
      ],
    },
    {
      label: t('Project management'),
      icon: (
        <i>
          <img src="/icons/quanlyduan.png" width={18} alt="" />
        </i>
      ),
      key: '/projects/project-management',
      children: [
        {
          label: t('Project documents'),
          key: '/projects/project-management/documents',
          auth: ['TaiLieuDuAn.View'],
        },
        {
          label: t('Project settlement documents'),
          key: '/projects/project-management/document-settlement',
          auth: ['HSQuyetToanCongTrinh.View'],
        },
        {
          label: t('Construction expenses'),
          key: '/projects/project-management/contruction-expenses',
          auth: ['ChiPhiCongTrinh.View'],
        },
      ],
    },
    // {
    //   label: t('KPI - Salary'),
    //   icon: (
    //     <i>
    //       <img src="/icons/kpiluong.png" width={18} alt="" />
    //     </i>
    //   ),
    //   key: '/projects/kpi-salary',
    //   children: [
    //     {
    //       label: t('KPIs of departments'),
    //       key: '/projects/kpi-salary/kpis-of-departments',
    //     },
    //     {
    //       label: t('Salary of departments'),
    //       key: '/projects/kpi-salary/salary-of-departments',
    //     },
    //     {
    //       label: t('1st salary advance'),
    //       key: '/projects/kpi-salary/1st-salary-advance',
    //     },
    //     {
    //       label: t('1st salary payment'),
    //       key: '/projects/kpi-salary/1st-salary-payment',
    //     },
    //     {
    //       label: t('2nd salary advance'),
    //       key: '/projects/kpi-salary/2nd-salary-advance',
    //     },
    //     {
    //       label: t('2nd salary payment'),
    //       key: '/projects/kpi-salary/2nd-salary-payment',
    //     },
    //     {
    //       label: t('Year-end bonus'),
    //       key: '/projects/kpi-salary/year-end-bonus',
    //     },
    //   ],
    // },
  ];

  const bottomMenu: MenuItem[] = [
    {
      label: t('Project settings'),
      icon: <SettingOutlined />,
      key: '/projects/project-settings',
      auth: ['CaiDat.ThongTinChung.View', 'CaiDat.ThanhVien.View'],
    },
  ];

  const authMainMenu = isFullPermissions ? mainMenu : getAuthMenuItems(mainMenu, grantedPolicies);
  const authProjectMenu = isFullPermissions ? projectMenu : getAuthMenuItems(projectMenu, grantedPolicies);
  const authBottomMenu = isFullPermissions ? bottomMenu : getAuthMenuItems(bottomMenu, grantedPolicies);

  useEffect(() => {
    const { pathname } = location;
    const menus: any = authProjectMenu.concat(authBottomMenu).concat(authMainMenu);
    for (const item of menus) {
      if (item?.key === pathname) {
        const { label, key } = item;
        dispatch(appActions.setActiveMenu({ label, key }));
      }
      if (item?.children) {
        for (const child of item.children) {
          if (child.key === pathname) {
            const { label, key } = child;
            dispatch(appActions.setActiveMenu({ label, key }));
            if (!collapsed) {
              setOpenKeys([item.key]);
            }
          }
        }
      }
    }
    // eslint-disable-next-line
  }, [location, collapsed]);

  const onClickMenu = (menu: any) => {
    const { key } = menu;
    navigate(key);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleLeftPanelVisibility = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <Sider
      breakpoint="lg"
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={LeftPanelWidth}
      onCollapse={setCollapsed}
      className={styles.main}
      {...rest}
    >
      <div className={styles.menusWrapper}>
        <div
          style={{
            display: 'flex',
            margin: selectedProject ? 5 : 0,
            height: !selectedProject ? (collapsed ? 40 : 0) : collapsed ? 30 : 65,
          }}
        >
          {selectedProject && (
            <>
              <Avatar
                shape="square"
                size={64}
                src={selectedProject?.avatar ? `${apiUrl}/Projects${selectedProject?.avatar}` : ProjectBg}
                style={{ display: collapsed ? 'none' : 'block' }}
              />
              <div style={{ marginLeft: 5, paddingTop: 5, display: collapsed ? 'none' : 'block' }}>
                <b>{selectedProject?.name}</b>
              </div>
            </>
          )}
          <Button
            shape="circle"
            size="small"
            onClick={handleLeftPanelVisibility}
            className={styles.toggleButton}
            icon={collapsed ? <RightOutlined style={{ fontSize: 11 }} /> : <LeftOutlined style={{ fontSize: 11 }} />}
            style={{ transform: collapsed ? 'translateX(-110%)' : 'translateX(-10%)' }}
          />
        </div>
        {collapsed && selectedProject && (
          <div style={{ marginTop: 5, marginLeft: 7 }}>
            <Tooltip title={selectedProject?.name}>
              <Avatar
                shape="square"
                size={64}
                src={selectedProject?.avatar ? `${apiUrl}/Projects${selectedProject?.avatar}` : ProjectBg}
              />
            </Tooltip>
          </div>
        )}
        {!selectedProject && defaultOrganization && (
          <Menu
            mode="inline"
            onClick={({ key }) => {
              navigate(key);
            }}
            selectedKeys={[activeMenu?.key]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={authMainMenu}
            inlineIndent={10}
            className={`${styles.top_menu} ${styles.custom_scrollbar} left_menu`}
          />
        )}
        {selectedProject && defaultOrganization && (
          <>
            <Menu
              mode="inline"
              onClick={onClickMenu}
              selectedKeys={[activeMenu?.key]}
              openKeys={openKeys}
              onOpenChange={onOpenChange}
              items={authProjectMenu}
              inlineIndent={5}
              className={`${styles.top_menu} ${styles.custom_scrollbar} left_menu`}
            />
            <Menu
              mode="inline"
              onClick={onClickMenu}
              selectedKeys={[activeMenu?.key]}
              items={authBottomMenu}
              inlineIndent={5}
              className={styles.bottom_menu}
            />
          </>
        )}
      </div>
    </Sider>
  );
};
