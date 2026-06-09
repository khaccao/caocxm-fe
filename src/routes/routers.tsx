/* eslint-disable import/order */
import { Outlet } from 'react-router-dom';

import { eTypeReview, eTypeVatTuMayMoc, Paythesubcontractor } from '@/common/define';
import { ComingSoon } from '@/components/ComingSoon';
import MainLayout from '@/components/Layout/MainLayout';
import ProjectLayout from '@/components/Layout/ProjectLayout';
import { Bidding, ConstructionManuals, LoginPage, ShiftTemplates } from '@/pages';
import NotFound from '@/pages/404';
import { CapabilityProfile } from '@/pages/CapabilityProfile/CapabilityProfile';
import CompanyEmployee from '@/pages/CompanyEmployee';
import { CompanyGroup } from '@/pages/CompanyGroup';
import { FileUpload, ViewFileNotOffice } from '@/pages/Components';
import ConstructionMagazine from '@/pages/ConstructionMagazine';
import { ContractKpiBidding } from '@/pages/ContractKpiBidding';
import CostEstimate from '@/pages/CostEstimate';
import CreateProjectPage from '@/pages/CreateProjectPage';
import { DailyLaborSummary } from '@/pages/DailyLaborSummary';
import EnvironmentalSanitationDiary from '@/pages/EnvironmentalSanitationDiary';
import AdvancePlan from '@/pages/FinancialPlan/AdvancePlan';
import { PaymentPlan } from '@/pages/FinancialPlan/PaymentPlan';
import { HomePage } from '@/pages/HomePage';
import { PersonnelTransfer } from '@/pages/HumanResources/PersonnelTransfer';
import StatisticBonus from '@/pages/HumanResources/StatisticBonus';
import { DepartmentKPIs } from '@/pages/KPI/DepartmentKPIs';
import MachineryMaterials from '@/pages/MachineryMaterials';
import { IncidentalCosts } from '@/pages/MachineryMaterials/components/IncidentalCosts';
import { AccoutingManagement } from '@/pages/ManagementAccounting';
import ManagerNews from '@/pages/ManagerNews';
import EditNews from '@/pages/ManagerNews/EditNews';
import MaterialAggregation from '@/pages/MaterialAggregation';
import { NewsDetailPage, NewsPage } from '@/pages/NewsMainPage';
import Organization from '@/pages/Organization';
import { PreConstructionWork } from '@/pages/PreConstructionWork';
import { ProductsDiary } from '@/pages/ProductsDiary/ProductsDiary';
import { TransferMaterial } from '@/pages/Project';
import InventoryDepot from '@/pages/Project/InventoryDepot';
import ListSubcontract from '@/pages/Project/ListSubcontract';
import ConstructionCosts from '@/pages/ProjectManagement/ConstructionCosts';
import { Documents } from '@/pages/ProjectManagement/ProjectDocument';
import { DocumentSettlement } from '@/pages/ProjectManagement/ProjectSettlement';
import ProjectSettingPage from '@/pages/ProjectSettingPage';
import ProjectsPage from '@/pages/ProjectsPage';
import PublicPage from '@/pages/PublicPage';
import { Review } from '@/pages/Review/Review';
import SafetyDiary from '@/pages/SafetyDiary';
import {
  FirstSalaryAdvance,
  FristSalaryPayment,
  SecondSalaryAdvance,
  SecondSalaryPayment,
  YearEndBonus,
} from '@/pages/SalaryKPI';
import { CompareSalaryStandardsView } from '@/pages/SalaryKPI/CompareSalaryStandards';
import SalaryOfDepartment from '@/pages/SalaryOfDepartments';
import { AggregateCosts, PaytheSubcontractors } from '@/pages/Subcontractor';
import TeamManagePage from '@/pages/TeamManagePage';
import { TimelineSection as Timekeeping } from '@/pages/Timekeeping';
import { HolidayCost, RecurringTravelEx, UnionDues, UnionExpenseTable } from '@/pages/UnionWelfareFund';
import { WeeklyAssignment } from '@/pages/WeeklyAssignment';
import { t } from 'i18next';
import { AuthRouteObject } from './AuthRoute';
import { InvoiceX } from '@/pages/InvoiceX';
import { EditInvoiceX } from '@/pages/InvoiceX/EditInvoiceX';

type MetaMenu = {
  name?: string;
  icon?: React.ReactNode;
};

export type MetaMenuAuthRouteObject = AuthRouteObject<MetaMenu>;

export const projectRouters: MetaMenuAuthRouteObject[] = [
  {
    element: <ProjectsPage />,
    name: 'Project List',
    index: true,
    auth: ['DuAn.View'],
  },
  {
    element: <ProjectLayout />,
    children: [
      {
        element: <Bidding />,
        path: '/projects/bidding',
        auth: ['DuThau.View'],
      },
      {
        element: <ContractKpiBidding />,
        path: '/projects/contract-bid-kpis',
        auth: ['HopDong_KPIDauThau.View'],
      },
      {
        element: <CostEstimate />,
        path: '/projects/prepare/cost-estimate',
        auth: ['DuTruKinhPhi.View'],
      },
      {
        element: <PreConstructionWork />,
        path: '/projects/prepare/construction',
        auth: ['ChuanBiThiCong.View'],
      },
      {
        element: <PublicPage />,
        path: '/projects/construction/init',
        auth: ['LapTienDoBanDau.View'],
      },
      {
        element: <WeeklyAssignment />,
        path: '/projects/construction/weekly-assignment',
        auth: ['GiaoViecHangTuan.View'],
      },
      {
        element: <ConstructionManuals />,
        path: '/projects/construction/manuals',
        auth: ['SoTayQuyTrinhThiCong.View'],
      },
      {
        element: <DailyLaborSummary />,
        path: '/projects/construction/daily-labor-summary',
        auth: ['TH_NhanCongHangNgay.All'],
      },
      {
        element: <ConstructionMagazine />,
        path: '/projects/construction/diary',
        auth: ['NhatKyThiCong.View'],
      },
      {
        element: <ProductsDiary />,
        path: '/projects/construction/productsDiary',
        auth: ['NhatKyVTMM.View'],
      },
      {
        element: <SafetyDiary />,
        path: '/projects/construction/labor-safety-diary',
        auth: ['NhatKyATLD_VSMT.View'],
      },
      {
        element: <EnvironmentalSanitationDiary />,
        path: '/projects/construction/enviromental-hygiene-diary',
      },
      // {
      //   element: <MaterialDiary />,
      //   path: '/projects/materials-log',
      // },
      // {
      //   element: <MachineLog />,
      //   path: '/projects/machinery-log',
      // },
      {
        element: <MachineryMaterials type={eTypeVatTuMayMoc.VatTuChinh} />,
        name: 'Main material',
        path: '/projects/main-material',
        auth: ['KhoCongTrinh.VatTuChinh.View'],
      },
      {
        element: <MachineryMaterials type={eTypeVatTuMayMoc.VatTuPhu} />,
        name: 'Auxiliary material',
        path: '/projects/auxiliary-material',
        auth: ['KhoCongTrinh.VatTuPhu.View'],
      },
      {
        element: <IncidentalCosts />,
        name: 'Incidental costs',
        path: '/projects/auxiliary-material/incidental-costs',
        auth: ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View'],
      },
      {
        element: <MachineryMaterials type={eTypeVatTuMayMoc.MayMoc} />,
        name: 'Machinery',
        path: '/projects/machinery',
        auth: ['KhoCongTrinh.MayMoc.View'],
      },
      {
        element: <TransferMaterial />,
        name: 'Transfer-material',
        path: '/projects/transfer-material',
        auth: ['KhoCongTrinh.DieuChuyenVatTu.View'],
      },
      {
        element: <InventoryDepot />,
        name: 'Inventory report',
        path: '/projects/depot',
        auth: ['KhoCongTrinh.TongKho.View'],
      },
      {
        element: <ListSubcontract />,
        name: 'Inventory report',
        path: '/projects/subcontractors/subcontract',
        auth: ['HopDongThauPhu.View'],
      },
      {
        element: <PaytheSubcontractors type={Paythesubcontractor.ThanhToan12} />,
        name: 'Inventory report',
        path: '/projects/subcontractors/pay-the-subcontractor-12',
        auth: ['ThanhToanThauPhu_12.View'],
      },
      {
        element: <PaytheSubcontractors type={Paythesubcontractor.ThanhToan27} />,
        name: 'Inventory report',
        path: '/projects/subcontractors/pay-the-subcontractor-27',
        auth: ['ThanhToanThauPhu_27.View'],
      },
      {
        element: <AggregateCosts />,
        name: 'Inventory report',
        path: '/projects/subcontractors/aggregate-costs',
        auth: ['TongHopChiPhi.View'],
      },
      {
        element: <ComingSoon />,
        name: 'Inventory report',
        path: '/projects/employees/overtime',
      },
      {
        element: <PersonnelTransfer />,
        name: 'Inventory report',
        path: '/projects/employees/transfer',
        auth: ['DieuChuyenNhanSu.View'],
      },
      {
        element: <StatisticBonus />,
        name: 'Inventory report',
        path: '/projects/employees/statistic-bonus',
        auth: ['ThongKeDM_Thuong.View'],
      },
      {
        element: <TeamManagePage />,
        name: 'Team manage',
        path: '/projects/employees/team-manage',
        auth: ['QuanLyToDoi.View'],
      },
      {
        element: <Outlet />,
        name: 'Project management',
        path: '/projects/project-management',
        children: [
          {
            element: <Documents />,
            path: '/projects/project-management/documents',
            auth: ['TaiLieuDuAn.View'],
          },
          {
            element: <DocumentSettlement />,
            path: '/projects/project-management/document-settlement',
            auth: ['HSQuyetToanCongTrinh.View'],
          },
          {
            element: <ConstructionCosts />,
            path: '/projects/project-management/contruction-expenses',
            auth: ['ChiPhiCongTrinh.View'],
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'KPI - Salary',
        path: '/projects/kpi-salary',
        children: [
          {
            element: <DepartmentKPIs />,
            path: '/projects/kpi-salary/kpis-of-departments',
          },
          {
            element: <SalaryOfDepartment />,
            path: '/projects/kpi-salary/salary-of-departments',
          },
          {
            element: <FirstSalaryAdvance />,
            path: '/projects/kpi-salary/1st-salary-advance',
          },
          {
            element: <FristSalaryPayment />,
            path: '/projects/kpi-salary/1st-salary-payment',
          },
          {
            element: <SecondSalaryAdvance />,
            path: '/projects/kpi-salary/2nd-salary-advance',
          },
          {
            element: <SecondSalaryPayment />,
            path: '/projects/kpi-salary/2nd-salary-payment',
          },
          {
            element: <ComingSoon />,
            path: '/projects/kpi-salary/year-end-bonus',
          },
        ],
      },
      {
        element: <ProjectSettingPage />,
        path: '/projects/project-settings',
        auth: ['CaiDat.ThongTinChung.View', 'CaiDat.ThanhVien.View'],
      },
      {
        element: <Outlet />,
        name: 'Employees',
        path: '/projects/employees',
        children: [
          {
            element: <Timekeeping />,
            name: 'Check-in time',
            path: '/projects/employees/check-in-time',
            auth: ['ChamCong.View'],
          },
        ],
      },
    ],
  },
];

export const routers: MetaMenuAuthRouteObject[] = [
  {
    element: <MainLayout />,
    path: '/',
    name: 'Main',
    children: [
      {
        element: <NewsPage />,
        path: 'dashboard',
        auth: ['BanTin.View'],
      },
      {
        name: 'News detail',
        path: '/dashboard/news/:id',
        element: <NewsDetailPage />,
        auth: ['BanTin.View'],
      },
      {
        element: <HomePage />,
        name: 'Home',
        index: true,
      },
      {
        element: <Organization />,
        name: 'Organization',
        path: '/organization',
      },
      {
        element: <CreateProjectPage />,
        name: 'Create Project',
        path: '/create-project',
        auth: ['DuAn.Create'],
      },
      {
        element: <Outlet />,
        name: 'Projects',
        path: '/projects',
        children: projectRouters,
      },
      {
        element: <Outlet />,
        name: 'Reports',
        path: '/reports',
        children: [
          {
            element: <Timekeeping />,
            name: 'Timekeeping Report',
            path: '/reports/timekeeping-report',
            auth: ['ChamCong.View'],
          },
        ],
      },
      {
        element: <ShiftTemplates />,
        name: 'Shift Templates',
        path: '/shift-templates',
        auth: ['CaLamViec.View'],
      },
      {
        element: <CapabilityProfile />,
        name: 'Capability Profile',
        path: '/capability-profile',
        auth: ['HoSoNangLuc.View'],
      },
      {
        element: <ManagerNews />,
        name: 'Manager news',
        path: '/manager-news',
        auth: ['QuanLyTinTuc.View'],
      },
      {
        element: <EditNews />,
        name: 'Edit news',
        path: '/edit-news',
        auth: ['QuanLyTinTuc.Create', 'QuanLyTinTuc.Edit'],
      },
      {
        element: <Outlet />,
        name: 'Store - Material - Machinery',
        path: '/material-machinery',
        children: [
          {
            element: <MachineryMaterials type={eTypeVatTuMayMoc.VatTuChinh} />,
            name: 'Main material',
            path: '/material-machinery/main-material',
            auth: ['KhoCongTy.VatTuChinh.View'],
          },
          {
            element: <MachineryMaterials type={eTypeVatTuMayMoc.VatTuPhu} />,
            name: 'Auxiliary material',
            path: '/material-machinery/auxiliary-material',
            auth: ['KhoCongTy.VatTuPhu.View'],
          },
          {
            element: <MachineryMaterials type={eTypeVatTuMayMoc.MayMoc} />,
            name: 'Machinery',
            path: '/material-machinery/machinery',
            auth: ['KhoCongTy.MayMoc.View'],
          },
          // [implement #22048]
          {
            element: <IncidentalCosts />,
            name: 'Incidental costs',
            path: '/material-machinery/auxiliary-material/incidental-costs',
            auth: ['KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View'],
          },
          // {
          //   element: <ComingSoon />,
          //   name: 'Materials log',
          //   path: '/material-machinery/materials-log',
          // },
          // {
          //   element: <ComingSoon />,
          //   name: 'Machinery log',
          //   path: '/material-machinery/machinery-log',
          // },
          {
            element: <TransferMaterial />,
            name: 'Transfer material',
            path: '/material-machinery/transfer-material',
            auth: ['KhoCongTy.DieuChuyenVatTu.View'],
          },
          {
            element: <InventoryDepot />,
            name: 'Depot',
            path: '/material-machinery/depot',
            auth: ['KhoCongTy.TongKho.View'],
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'KPI - Salary',
        path: '/kpi-salary',
        children: [
          {
            element: <DepartmentKPIs />,
            name: 'KPIs of departments',
            path: '/kpi-salary/kpis-of-departments',
            auth: ['KPI.KPIBoPhan.View'],
          },
          {
            element: <SalaryOfDepartment />,
            name: 'Salary of departments',
            path: '/kpi-salary/salary-of-departments',
            auth: ['KPI.LuongBoPhan.View'],
          },
          {
            element: <FirstSalaryAdvance />,
            name: '1st salary advance',
            path: '/kpi-salary/1st-salary-advance',
            auth: ['KPI.UngLuong_1.View'],
          },
          {
            element: <FristSalaryPayment />,
            name: '1st salary payment',
            path: '/kpi-salary/1st-salary-payment',
            auth: ['KPI.ThanhToanLuong_1.View'],
          },
          {
            element: <SecondSalaryAdvance />,
            name: '2nd salary advance',
            path: '/kpi-salary/2nd-salary-advance',
            auth: ['KPI.UngLuong_2.View'],
          },
          {
            element: <SecondSalaryPayment />,
            name: '2nd salary payment',
            path: '/kpi-salary/2nd-salary-payment',
            auth: ['KPI.ThanhToanLuong_2.View'],
          },
          {
            element: <CompareSalaryStandardsView />,
            name: 'Compare salary standards',
            path: '/kpi-salary/compare-salary-standards',
            auth: ['KPI.SoSanhDMLuong.All'],
          },
          {
            element: <YearEndBonus />,
            name: 'Year-end bonus',
            path: '/kpi-salary/year-end-bonus',
            auth: ['KPI.ThuongCuoiNam.View'],
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'Employee',
        path: '/employee',
        children: [
          {
            element: <CompanyEmployee />,
            name: 'Company employee',
            path: '/employee/company-employee',
            auth: ['CongTy.NhanSu.View'],
          },
          {
            element: <CompanyGroup />,
            name: 'Company group',
            path: '/employee/company-group',
            auth: ['CongTy.PhongBan.View'],
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'Union welfare funds',
        path: '/union-welfare-funds',
        children: [
          {
            element: <UnionDues />,
            name: 'Union fee collection report',
            path: '/union-welfare-funds/fee',
            auth: ['CongDoan.ThuPhiCD.View'],
          },
          {
            element: <UnionExpenseTable />,
            name: 'Union funds expenses report',
            path: '/union-welfare-funds/expenses',
            auth: ['CongDoan.ChiQuyCD.View'],
          },
          {
            element: <HolidayCost />,
            name: 'Tet and holiday bonus expenses',
            path: '/union-welfare-funds/bonus',
            auth: ['CongDoan.CPLeTet.View'],
          },
          {
            element: <RecurringTravelEx />,
            name: 'Recurring travel expenses',
            path: '/union-welfare-funds/recurring-travel-expenses',
            auth: ['CongDoan.CPDuLichDinhKy.View'],
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'Management accounting',
        path: '/management-accounting',
        children: [
          {
            element: <AdvancePlan />,
            name: 'Make an advance plan',
            path: '/management-accounting/make-an-advance-plan',
            auth: ['KeHoachTaiChinh.TamUng.View'],
          },
          {
            element: <PaymentPlan />,
            name: 'Payment plan',
            path: '/management-accounting/payment-plan',
            auth: ['KeHoachTaiChinh.ThanhToan.View'],
          },
          {
            element: <ComingSoon />,
            name: 'Make an advance plan 27th',
            path: '/management-accounting/make-an-advance-plan-27th',
            // auth: ['KeHoachTaiChinh.ThanhToan.View'],
          },
          {
            element: <ComingSoon />,
            name: 'Payment plan 5th',
            path: '/management-accounting/5th-payment-plan',
            // auth: ['KeHoachTaiChinh.ThanhToan.View'],
          },
          {
            element: <MaterialAggregation />,
            name: 'Aggregate materials',
            path: '/management-accounting/aggregate-materials',
            auth: ['KeHoachTaiChinh.TongHopVatTu.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={6} />,
            name: 'Track cash flow',
            path: '/management-accounting/track-cash-flow',
            auth: ['KeHoachTaiChinh.DongTien.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={7} />,
            name: 'Bookkeeping',
            path: '/management-accounting/bookkeeping',
            auth: ['KeHoachTaiChinh.SoSachKeToan.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={8} />,
            name: 'Input invoices',
            path: '/management-accounting/input-invoices',
            auth: ['KeHoachTaiChinh.HoaDonDauVao.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={9} />,
            name: 'Output invoices',
            path: '/management-accounting/output-invoices',
            auth: ['KeHoachTaiChinh.HoaDonDauRa.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={10} />,
            name: 'Invoices difference',
            path: '/management-accounting/invoices-difference',
            auth: ['KeHoachTaiChinh.ChenhLechHoaDon.View'],
          },
          {
            element: <InvoiceX />,
            name: 'Invoice X',
            path: '/management-accounting/invoice-x',
            auth: ['KeHoachTaiChinh.HoaDonX.View'],
          },
          {
            element: <EditInvoiceX />,
            name: 'Edit invoice X',
            path: '/management-accounting/edit-invoice-x',
            auth: ['KeHoachTaiChinh.HoaDonX.Create', 'KeHoachTaiChinh.HoaDonX.Edit'],
          },
          {
            element: <AccoutingManagement AccoutingKey={12} />,
            name: 'ĐMDT / HĐ đầu vào + X',
            path: '/management-accounting/input-invoices-and-x',
            auth: ['KeHoachTaiChinh.DMDT.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={13} />,
            name: 'Compare norms',
            path: '/management-accounting/compare-norms',
            auth: ['KeHoachTaiChinh.DoiChieuDinhMuc.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={14} />,
            name: 'Supplier - Investor debt',
            path: '/management-accounting/supplier-investor-debt',
            auth: ['KeHoachTaiChinh.CongNoNCC_CDT.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={15} />,
            name: 'Profit and loss statement',
            path: '/management-accounting/profit-and-loss-statement',
            auth: ['KeHoachTaiChinh.QuyetToanLaiLoCongTrinh.View'],
          },
          {
            element: <AccoutingManagement AccoutingKey={16} />,
            name: 'Tổng hợp xuất nhập tồn',
            path: '/management-accounting/totalinout',
            auth: ['KeHoachTaiChinh.TongHopXuatNhapTon.View'],
          },
          // [12/01/2024][#21278][phuong_td] Router Cân đối kế toán
          {
            element: <AccoutingManagement AccoutingKey={17} />,
            name: 'Balance sheet',
            path: '/management-accounting/balance-sheet',
            auth: ['KeHoachTaiChinh.CanDoiKeToan.View'],
          },
          // [12/01/2024][#21278][phuong_td] Router Tổng hợp doanh thu
          {
            element: <AccoutingManagement AccoutingKey={18} />,
            name: 'Table of revenue summary',
            path: '/management-accounting/table-of-revenue-summary',
            auth: ['KeHoachTaiChinh.TongHopDoanhThu.View'],
          },
          {
            element: <ComingSoon />,
            name: 'Development chart',
            path: '/management-accounting/develoment-chart',
          },
          {
            element: <ComingSoon />,
            name: 'Other cost charts',
            path: '/management-accounting/Other-cost-charts',
          },
          {
            element: <ComingSoon />,
            name: 'Profit chart',
            path: '/management-accounting/profit-chart',
          },
          {
            element: <ProductsDiary />,
            name: t('Products diary'),
            path: '/management-accounting/productsDiary',
          },
        ],
      },
      {
        element: <Outlet />,
        name: 'Review',
        path: '/review',
        children: [
          {
            element: <Review categoryCode={eTypeReview.ProjectManagementSuppliers} />,
            name: 'Project management - suppliers',
            path: '/review/project-management-suppliers',
            auth: ['DanhGia.QLDA_NCC.View'],
          },
          {
            element: <Review categoryCode={eTypeReview.SupervisionConsultantsSupplier} />,
            name: 'Supervision consultants - supplier',
            path: '/review/supervision-consultants-suppliers',
            auth: ['DanhGia.TVGS_NCC.View'],
          },
          {
            element: <Review categoryCode={eTypeReview.InvestorsProjectManagement} />,
            name: 'Investors - Project management',
            path: '/review/investors-project-management',
            auth: ['DanhGia.CDT_BQL.View'],
          },
          {
            element: <Review categoryCode={eTypeReview.InvestorsSupervisionConsultants} />,
            name: 'Investors - Supervision consultants',
            path: '/review/investors-supervision-consultant',
            auth: ['DanhGia.CDT_BQL.View'],
          },
          {
            element: <Review categoryCode={eTypeReview.Other} />,
            name: 'Other',
            path: '/review/Other',
          },
        ],
      },
    ],
  },
  {
    element: <LoginPage />,
    name: 'Login',
    path: '/login',
  },
  {
    element: <FileUpload />,
    name: 'Preview',
    path: '/preview/:fileType/:fileId/:companyId',
  },
  {
    element: <ViewFileNotOffice />,
    name: 'Preview',
    path: '/preview-not-office/:fileId/:companyId/:fileName',
  },
  { path: '*', element: <NotFound /> },
];
