import { RoleEnum } from './define';

export const policies = [
  {
    displayName: 'Bản tin cập nhật mới nhất',
    name: 'LatestNews',
    permissions: [
      {
        displayName: 'Xem bản tin cập nhật mới nhất',
        name: 'BanTin.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
    ],
  },
  {
    displayName: 'Danh sách dự án',
    name: 'Projects',
    permissions: [
      {
        displayName: 'Xem danh sách dự án',
        name: 'DuAn.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Tạo mới dự án',
        name: 'DuAn.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa dự án',
        name: 'DuAn.Delete',
        accessRoles: [RoleEnum.Director],
      },
    ],
  },
  {
    displayName: 'Cài đặt dự án',
    name: 'ProjectSetting',
    permissions: [
      {
        displayName: 'Xem thông tin chung',
        name: 'CaiDat.ThongTinChung.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Chỉnh sửa thông tin chung',
        name: 'CaiDat.ThongTinChung.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xem thành viên',
        name: 'CaiDat.ThanhVien.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm thành viên',
        name: 'CaiDat.ThanhVien.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa thành viên',
        name: 'CaiDat.ThanhVien.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa thành viên',
        name: 'CaiDat.ThanhVien.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
  {
    displayName: 'Nhân sự',
    name: 'HR',
    permissions: [
      {
        displayName: 'Xem nhân sự công ty',
        name: 'CongTy.NhanSu.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thêm nhân sự công ty',
        name: 'CongTy.NhanSu.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Sửa nhân sự công ty',
        name: 'CongTy.NhanSu.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xóa nhân sự công ty',
        name: 'CongTy.NhanSu.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xem phòng ban công ty',
        name: 'CongTy.PhongBan.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Thêm phòng ban công ty',
        name: 'CongTy.PhongBan.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa phòng ban công ty',
        name: 'CongTy.PhongBan.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa phòng ban công ty',
        name: 'CongTy.PhongBan.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Quản lý ca',
    name: 'CaLamViec',
    permissions: [
      {
        displayName: 'Xem ca làm việc',
        name: 'CaLamViec.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Thêm ca làm việc',
        name: 'CaLamViec.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa ca làm việc',
        name: 'CaLamViec.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa ca làm việc',
        name: 'CaLamViec.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Quản lý kho-vật tư-máy móc',
    name: 'MaterialMachinery',
    permissions: [
      // Vật tư chính
      {
        displayName: 'Xem vật tư chính',
        name: 'KhoCongTy.VatTuChinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm vật tư chính',
        name: 'KhoCongTy.VatTuChinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa vật tư chính',
        name: 'KhoCongTy.VatTuChinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa vật tư chính',
        name: 'KhoCongTy.VatTuChinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất vật tư chính',
        name: 'KhoCongTy.VatTuChinh.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho vật tư chính',
        name: 'KhoCongTy.VatTuChinh.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Cho duyệt vật tư chính với giá lớn hơn giá kế hoạch',
        name: 'KhoCongTy.VatTuChinh.ApproveOverBudget',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
        ],
      },
      // Vật tư phụ
      {
        displayName: 'Xem vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho vật tư phụ',
        name: 'KhoCongTy.VatTuPhu.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Cho duyệt vật tư phụ với giá lớn hơn giá kế hoạch',
        name: 'KhoCongTy.VatTuPhu.ApproveOverBudget',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
        ],
      },
      // [implement #22048]
      {
        displayName: 'Xem chi phi phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm chi phi phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa chi phi phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa chi phi phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // Máy móc
      {
        displayName: 'Xem máy móc',
        name: 'KhoCongTy.MayMoc.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm máy móc',
        name: 'KhoCongTy.MayMoc.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa máy móc',
        name: 'KhoCongTy.MayMoc.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa máy móc',
        name: 'KhoCongTy.MayMoc.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất máy móc',
        name: 'KhoCongTy.MayMoc.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho máy móc',
        name: 'KhoCongTy.MayMoc.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Cho duyệt máy móc với giá lớn hơn giá kế hoạch',
        name: 'KhoCongTy.MayMoc.ApproveOverBudget',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
        ],
      },
      // Điều chuyển vật tư
      {
        displayName: 'Xem danh sách',
        name: 'KhoCongTy.DieuChuyenVatTu.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Tạo phiếu điều chuyển',
        name: 'KhoCongTy.DieuChuyenVatTu.CreateTransfer',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Tổng kho
      {
        displayName: 'Xem tổng kho',
        name: 'KhoCongTy.TongKho.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
  {
    displayName: 'Quản lý KPI-lương',
    name: 'KPI_Salary',
    permissions: [
      //KPI
      {
        displayName: 'Xem KPI các bộ phận',
        name: 'KPI.KPIBoPhan.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Lưu thay đổi KPI các bộ phận',
        name: 'KPI.KPIBoPhan.SaveChanges',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // {
      //   displayName: 'Thêm KPI các bộ phận',
      //   name: 'KPI.KPIBoPhan.Create',
      //   accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      // },
      // {
      //   displayName: 'Sửa KPI các bộ phận',
      //   name: 'KPI.KPIBoPhan.Edit',
      //   accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      // },
      // {
      //   displayName: 'Xóa KPI các bộ phận',
      //   name: 'KPI.KPIBoPhan.Delete',
      //   accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      // },

      // lương các bộ phận
      {
        displayName: 'Xem lương các bộ phận',
        name: 'KPI.LuongBoPhan.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm lương các bộ phận',
        name: 'KPI.LuongBoPhan.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa lương các bộ phận',
        name: 'KPI.LuongBoPhan.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa lương các bộ phận',
        name: 'KPI.LuongBoPhan.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Ứng lương lần 1
      {
        displayName: 'Xem ứng lương lần 1',
        name: 'KPI.UngLuong_1.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm ứng lương lần 1',
        name: 'KPI.UngLuong_1.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa ứng lương lần 1',
        name: 'KPI.UngLuong_1.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa ứng lương lần 1',
        name: 'KPI.UngLuong_1.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Thanh toán lương lần 1
      {
        displayName: 'Xem thanh toán lương lần 1',
        name: 'KPI.ThanhToanLuong_1.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm thanh toán lương lần 1',
        name: 'KPI.ThanhToanLuong_1.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa thanh toán lương lần 1',
        name: 'KPI.ThanhToanLuong_1.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa thanh toán lương lần 1',
        name: 'KPI.ThanhToanLuong_1.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Ứng lương lần 2
      {
        displayName: 'Xem ứng lương lần 2',
        name: 'KPI.UngLuong_2.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm ứng lương lần 2',
        name: 'KPI.UngLuong_2.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa ứng lương lần 2',
        name: 'KPI.UngLuong_2.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa ứng lương lần 2',
        name: 'KPI.UngLuong_2.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Thanh toán lương lần 2
      {
        displayName: 'Xem thanh toán lương lần 2',
        name: 'KPI.ThanhToanLuong_2.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm thanh toán lương lần 2',
        name: 'KPI.ThanhToanLuong_2.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa thanh toán lương lần 2',
        name: 'KPI.ThanhToanLuong_2.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa thanh toán lương lần 2',
        name: 'KPI.ThanhToanLuong_2.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // So sánh định mức lương
      {
        displayName: 'Xem so sánh định mức lương',
        name: 'KPI.SoSanhDMLuong.All',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Thưởng cuối năm
      {
        displayName: 'Xem thưởng cuối năm',
        name: 'KPI.ThuongCuoiNam.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm thưởng cuối năm',
        name: 'KPI.ThuongCuoiNam.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa thưởng cuối năm',
        name: 'KPI.ThuongCuoiNam.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa thưởng cuối năm',
        name: 'KPI.ThuongCuoiNam.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Quỹ công đoàn - phúc lợi',
    name: 'UnionFunds',
    permissions: [
      // Bảng phu phí CĐ
      {
        displayName: 'Xem bảng thu phí CĐ',
        name: 'CongDoan.ThuPhiCD.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Lưu thay đổi bảng thu phí CĐ',
        name: 'CongDoan.ThuPhiCD.SaveChanges',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Bảng chi quỹ CĐ
      {
        displayName: 'Xem bảng chi quỹ CĐ',
        name: 'CongDoan.ChiQuyCD.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm bảng chi quỹ CĐ',
        name: 'CongDoan.ChiQuyCD.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa bảng chi quỹ CĐ',
        name: 'CongDoan.ChiQuyCD.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa bảng chi quỹ CĐ',
        name: 'CongDoan.ChiQuyCD.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Duyá»‡t Ä‘á» xuáº¥t chi quá»¹ CÄ',
        name: 'CongDoan.ChiQuyCD.Approve',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Chi phí thưởng lễ tết
      {
        displayName: 'Xem chi tiết thưởng lễ tết',
        name: 'CongDoan.CPLeTet.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm chi tiết thưởng lễ tết',
        name: 'CongDoan.CPLeTet.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa chi tiết thưởng lễ tết',
        name: 'CongDoan.CPLeTet.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa chi tiết thưởng lễ tết',
        name: 'CongDoan.CPLeTet.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Chi phí du lịch định kỳ
      {
        displayName: 'Xem chi tiết du lịch định kỳ',
        name: 'CongDoan.CPDuLichDinhKy.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm chi tiết du lịch định kỳ',
        name: 'CongDoan.CPDuLichDinhKy.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa chi tiết du lịch định kỳ',
        name: 'CongDoan.CPDuLichDinhKy.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa chi tiết du lịch định kỳ',
        name: 'CongDoan.CPDuLichDinhKy.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Kế hoạch tài chính',
    name: 'FinancialPlan',
    permissions: [
      // Lập kế hoạch tạm ứng
      {
        displayName: 'Xem kế hoạch tạm ứng',
        name: 'KeHoachTaiChinh.TamUng.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Thêm kế hoạch tạm ứng',
        name: 'KeHoachTaiChinh.TamUng.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Sửa kế hoạch tạm ứng',
        name: 'KeHoachTaiChinh.TamUng.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Xóa kế hoạch tạm ứng',
        name: 'KeHoachTaiChinh.TamUng.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Material_Accountant],
      },
      // Lập kế hoạch thanh toán
      {
        displayName: 'Xem bảng lương CN',
        name: 'KeHoachTaiChinh.BangLuongCN.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa bảng lương CN',
        name: 'KeHoachTaiChinh.BangLuongCN.SaveChanges',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xuất file bảng lương CN',
        name: 'KeHoachTaiChinh.BangLuongCN.Export',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xem bảng lương BCH',
        name: 'KeHoachTaiChinh.BangLuongBCH.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa bảng lương BCH',
        name: 'KeHoachTaiChinh.BangLuongBCH.SaveChanges',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xuất file bảng lương BCH',
        name: 'KeHoachTaiChinh.BangLuongBCH.Export',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xem bảng lương tổng hợp',
        name: 'KeHoachTaiChinh.BangTHLuong.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xuất file bảng lương tổng hợp',
        name: 'KeHoachTaiChinh.BangTHLuong.Export',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xem thanh toán chi phí',
        name: 'KeHoachTaiChinh.ThanhToan.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Material_Accountant, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tạo chứng từ thanh toán chi phí',
        name: 'KeHoachTaiChinh.ThanhToan.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Material_Accountant, RoleEnum.Material_Accountant],
      },
      // Tổng hợp vật tư
      {
        displayName: 'Xem tổng hợp vật tư',
        name: 'KeHoachTaiChinh.TongHopVatTu.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu tổng hợp vật tư',
        name: 'KeHoachTaiChinh.TongHopVatTu.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Theo dõi dòng tiền
      {
        displayName: 'Xem theo dõi dòng tiền',
        name: 'KeHoachTaiChinh.DongTien.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu theo dõi dòng tiền',
        name: 'KeHoachTaiChinh.DongTien.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Xem sổ sách kế toán
      {
        displayName: 'Xem sổ sách kế toán',
        name: 'KeHoachTaiChinh.SoSachKeToan.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu sổ sách kế toán',
        name: 'KeHoachTaiChinh.SoSachKeToan.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Hóa đơn đầu vào
      {
        displayName: 'Xem hóa đơn đầu vào',
        name: 'KeHoachTaiChinh.HoaDonDauVao.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu hóa đơn đầu vào',
        name: 'KeHoachTaiChinh.HoaDonDauVao.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Hóa đơn đầu ra
      {
        displayName: 'Xem hóa đơn đầu ra',
        name: 'KeHoachTaiChinh.HoaDonDauRa.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu hóa đơn đầu ra',
        name: 'KeHoachTaiChinh.HoaDonDauRa.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Chênh lệch hóa đơn
      {
        displayName: 'Xem chênh lệch hóa đơn',
        name: 'KeHoachTaiChinh.ChenhLechHoaDon.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu chênh lệch hóa đơn',
        name: 'KeHoachTaiChinh.ChenhLechHoaDon.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Hóa đơn X
      {
        displayName: 'Xem hóa đơn X',
        name: 'KeHoachTaiChinh.HoaDonX.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Thêm hóa đơn X',
        name: 'KeHoachTaiChinh.HoaDonX.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Sửa hóa đơn X',
        name: 'KeHoachTaiChinh.HoaDonX.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Xóa hóa đơn X',
        name: 'KeHoachTaiChinh.HoaDonX.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // ĐMDT / HĐ đầu vào + X
      {
        displayName: 'Xem ĐMDT',
        name: 'KeHoachTaiChinh.DMDT.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu ĐMDT',
        name: 'KeHoachTaiChinh.DMDT.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Đối chiếu định mức
      {
        displayName: 'Xem đối chiếu định mức',
        name: 'KeHoachTaiChinh.DoiChieuDinhMuc.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu đối chiếu định mức',
        name: 'KeHoachTaiChinh.DoiChieuDinhMuc.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Công nợ NCC - CĐT
      {
        displayName: 'Xem công nợ NCC - CĐT',
        name: 'KeHoachTaiChinh.CongNoNCC_CDT.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu công nợ NCC - CĐT',
        name: 'KeHoachTaiChinh.CongNoNCC_CDT.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Quyết toán, lãi lỗ công trình
      {
        displayName: 'Xem quyết toán, lãi lỗ công trình',
        name: 'KeHoachTaiChinh.QuyetToanLaiLoCongTrinh.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu quyết toán, lãi lỗ công trình',
        name: 'KeHoachTaiChinh.QuyetToanLaiLoCongTrinh.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      // Tổng hợp xuất nhập tồn
      {
        displayName: 'Xem tổng hợp xuất nhập tồn',
        name: 'KeHoachTaiChinh.TongHopXuatNhapTon.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Tra cứu tổng hợp xuất nhập tồn',
        name: 'KeHoachTaiChinh.TongHopXuatNhapTon.Search',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
    ],
  },
  {
    displayName: 'Đánh giá',
    name: 'Review',
    permissions: [
      // Quản lý dự án - NCC
      {
        displayName: 'Xem đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thêm đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Sửa đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Xóa đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thích đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.Like',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Bình luận đánh giá dự án - NCC',
        name: 'DanhGia.QLDA_NCC.Comment',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      // Tư vấn giám sát - NCC
      {
        displayName: 'Xem đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thêm đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Sửa đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Xóa đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thích đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.Like',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Bình luận đánh giá tư vấn giám sát - NCC',
        name: 'DanhGia.TVGS_NCC.Comment',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      // Chủ đầu tư - Ban quản lý
      {
        displayName: 'Xem đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thêm đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Sửa đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Xóa đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thích đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.Like',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Bình luận đánh giá chủ đầu tư - ban quản lý',
        name: 'DanhGia.CDT_BQL.Comment',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      // Chủ đầu tư - Tư vấn giám sát
      {
        displayName: 'Xem đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thêm đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Sửa đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Xóa đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Thích đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.Like',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Bình luận đánh giá chủ đầu tư - tư vấn giám sát',
        name: 'DanhGia.CDT_TVGS.Comment',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
    ],
  },
  {
    displayName: 'Quản lý tin tức',
    name: 'QuanLyTinTuc',
    permissions: [
      {
        displayName: 'Xem trang quản lý tin tức',
        name: 'QuanLyTinTuc.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Thêm tin tức',
        name: 'QuanLyTinTuc.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Sửa tin tức',
        name: 'QuanLyTinTuc.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xóa tin tức',
        name: 'QuanLyTinTuc.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Hồ sơ năng lực',
    name: 'HoSoNangLuc',
    permissions: [
      {
        displayName: 'Xem hồ sơ năng lực',
        name: 'HoSoNangLuc.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
    ],
  },
  // project layout ↓↓↓
  {
    displayName: 'Dự thầu',
    name: 'Bidding',
    permissions: [
      {
        displayName: 'Xem trang dự thầu',
        name: 'DuThau.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm công việc dự thầu',
        name: 'DuThau.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa công việc dự thầu',
        name: 'DuThau.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa công việc dự thầu',
        name: 'DuThau.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
  {
    displayName: 'Hợp đồng - KPI đấu thầu',
    name: 'HopDong_KPIDauThau',
    permissions: [
      {
        displayName: 'Xem trang hợp đồng - KPI đấu thầu',
        name: 'HopDong_KPIDauThau.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm công việc hợp đồng - KPI đấu thầu',
        name: 'HopDong_KPIDauThau.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa công việc hợp đồng - KPI đấu thầu',
        name: 'HopDong_KPIDauThau.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa công việc hợp đồng - KPI đấu thầu',
        name: 'HopDong_KPIDauThau.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt công việc giai đoạn Hợp đồng KPI đấu thầu',
        name: 'HopDong_KPIDauThau.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
  {
    displayName: 'Sổ tay quy trình thi công',
    name: 'SoTayQuyTrinhThiCong',
    permissions: [
      {
        displayName: 'Xem sổ tay quy trình thi công',
        name: 'SoTayQuyTrinhThiCong.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
    ],
  },
  {
    displayName: 'Chuẩn bị thi công',
    name: 'PreConstruct',
    permissions: [
      // Công tác cbi thi công
      {
        displayName: 'Xem công tác chuẩn bị thi công',
        name: 'ChuanBiThiCong.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thêm công tác chuẩn bị thi công',
        name: 'ChuanBiThiCong.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Sửa công tác chuẩn bị thi công',
        name: 'ChuanBiThiCong.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xóa công tác chuẩn bị thi công',
        name: 'ChuanBiThiCong.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Duyệt công việc giai đoạn Chuẩn bị thi công',
        name: 'ChuanBiThiCong.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Dự trù chi phí
      {
        displayName: 'Xem dự trù chi phí',
        name: 'DuTruKinhPhi.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm dự trù chi phí',
        name: 'DuTruKinhPhi.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Sửa dự trù chi phí',
        name: 'DuTruKinhPhi.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
      {
        displayName: 'Xóa dự trù chi phí',
        name: 'DuTruKinhPhi.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Material_Accountant],
      },
    ],
  },
  {
    displayName: 'Thi công',
    name: 'Construction',
    permissions: [
      // Lập tiến độ ban đầu
      {
        displayName: 'Xem lập tiến độ ban đầu',
        name: 'LapTienDoBanDau.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thêm lập tiến độ ban đầu',
        name: 'LapTienDoBanDau.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Sửa lập tiến độ ban đầu',
        name: 'LapTienDoBanDau.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xóa lập tiến độ ban đầu',
        name: 'LapTienDoBanDau.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Lập tiến độ ban đầu: Duyệt công việc',
        name: 'LapTienDoBanDau.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Giao việc hằng tuần
      {
        displayName: 'Xem giao việc hằng tuần',
        name: 'GiaoViecHangTuan.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thêm giao việc hằng tuần',
        name: 'GiaoViecHangTuan.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Sửa giao việc hằng tuần',
        name: 'GiaoViecHangTuan.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xóa giao việc hằng tuần',
        name: 'GiaoViecHangTuan.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Giao việc hằng tuần: Giao việc',
        name: 'GiaoViecHangTuan.Assign',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Tổng hợp nhân công hằng ngày
      {
        displayName: 'Tổng hợp nhân công hằng ngày',
        name: 'TH_NhanCongHangNgay.All',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Leader,
        ],
      },
      // nhật ký thi công
      {
        displayName: 'Xem nhật ký thi công',
        name: 'NhatKyThiCong.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // nhật ký an toan lao động
      {
        displayName: 'Xem nhật ký an toan lao động',
        name: 'NhatKyATLD_VSMT.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // nhật ký vệ sinh môi trường
    ],
  },
  {
    displayName: 'Kho - Vật tư - máy móc cho công trình (Cho dự án)',
    name: 'ProjMaterialMachinery',
    permissions: [
      // Vật tư chính
      {
        displayName: 'Xem vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho vật tư chính',
        name: 'KhoCongTrinh.VatTuChinh.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // Vật tư phụ
      {
        displayName: 'Xem vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho vật tư phụ',
        name: 'KhoCongTrinh.VatTuPhu.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // [implement #22048]
      {
        displayName: 'Kho vật tư phụ: Xem chi phí phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Kho vật tư phụ: Thêm chi phí phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Kho vật tư phụ: Xóa chi phí phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Kho vật tư phụ: Sửa chi phí phát sinh',
        name: 'KhoCongTrinh.VatTuPhu_ChiPhiPhatSinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // Máy móc
      {
        displayName: 'Xem máy móc',
        name: 'KhoCongTrinh.MayMoc.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm máy móc',
        name: 'KhoCongTrinh.MayMoc.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa máy móc',
        name: 'KhoCongTrinh.MayMoc.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa máy móc',
        name: 'KhoCongTrinh.MayMoc.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Duyệt đề xuất máy móc',
        name: 'KhoCongTrinh.MayMoc.Approve',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Nhập kho máy móc',
        name: 'KhoCongTrinh.MayMoc.Inventory',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // Điều chuyển vật tư
      {
        displayName: 'Xem danh sách',
        name: 'KhoCongTrinh.DieuChuyenVatTu.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Tạo phiếu điều chuyển',
        name: 'KhoCongTrinh.DieuChuyenVatTu.CreateTransfer',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Tổng kho
      {
        displayName: 'Xem tổng kho',
        name: 'KhoCongTrinh.TongKho.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
  {
    displayName: 'Quản lý thầu phụ',
    name: 'SubContractor',
    permissions: [
      // Hợp đồng thầu phụ
      {
        displayName: 'Hợp đồng thầu phụ View',
        name: 'HopDongThauPhu.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Hợp đồng thầu phụ Create',
        name: 'HopDongThauPhu.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Hợp đồng thầu phụ Delete',
        name: 'HopDongThauPhu.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      // Thanh toán thầu phụ ngày 12
      {
        displayName: 'Thanh toán thầu phụ ngày 12 (Full)',
        name: 'ThanhToanThauPhu_12.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Thanh toán thầu phụ ngày 12
      {
        displayName: 'Thanh toán thầu phụ ngày 27 (Full)',
        name: 'ThanhToanThauPhu_27.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      // Tổng hợp chi phí
      {
        displayName: 'Tổng hợp chi phí (Full)',
        name: 'TongHopChiPhi.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
    ],
  },
  {
    displayName: 'Chấm công',
    name: 'Timekeeping',
    permissions: [
      {
        displayName: 'Xem bảng chấm công',
        name: 'ChamCong.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
          RoleEnum.Timekeeping_Attendance,
        ],
      },
      {
        displayName: 'Chốt giờ theo ngày',
        name: 'ChamCong.TrackingByDay',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Chốt giờ theo tháng',
        name: 'ChamCong.TrackingByMonth',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
      {
        displayName: 'Xuất báo cáo',
        name: 'ChamCong.Report',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director],
      },
    ],
  },
  {
    displayName: 'Nhân sự',
    name: 'ProjHR',
    permissions: [
      {
        displayName: 'Xem điều chuyển nhân sự (Full)',
        name: 'DieuChuyenNhanSu.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thông kê ĐM - Thưởng (Full)',
        name: 'ThongKeDM_Thuong.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      //Quản lý tổ đội
      {
        displayName: 'Xem tổ đội',
        name: 'QuanLyToDoi.View',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Thêm tổ đội',
        name: 'QuanLyToDoi.Create',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Sửa tổ đội',
        name: 'QuanLyToDoi.Edit',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
      {
        displayName: 'Xóa tổ đội',
        name: 'QuanLyToDoi.Delete',
        accessRoles: [RoleEnum.Director, RoleEnum.Deputy_Director, RoleEnum.Commander, RoleEnum.Technician],
      },
    ],
  },
  {
    displayName: 'Quản lý thông tin dự án',
    name: 'ProjManage',
    permissions: [
      //Tài liệu dư án
      {
        displayName: 'Xem tài liệu dự án',
        name: 'TaiLieuDuAn.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm tài liệu dự án',
        name: 'TaiLieuDuAn.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa tài liệu dự án',
        name: 'TaiLieuDuAn.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa tài liệu dự án',
        name: 'TaiLieuDuAn.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // hồ sơ quyết toán công trình
      {
        displayName: 'Xem hồ sơ quyết toán công trình',
        name: 'HSQuyetToanCongTrinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm hồ sơ quyết toán công trình',
        name: 'HSQuyetToanCongTrinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa hồ sơ quyết toán công trình',
        name: 'HSQuyetToanCongTrinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa hồ sơ quyết toán công trình',
        name: 'HSQuyetToanCongTrinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      // Chi phí công trình
      {
        displayName: 'Xem chi phí công trình',
        name: 'ChiPhiCongTrinh.View',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Contractor,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Thêm chi phí công trình',
        name: 'ChiPhiCongTrinh.Create',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Sửa chi phí công trình',
        name: 'ChiPhiCongTrinh.Edit',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
      {
        displayName: 'Xóa chi phí công trình',
        name: 'ChiPhiCongTrinh.Delete',
        accessRoles: [
          RoleEnum.Director,
          RoleEnum.Deputy_Director,
          RoleEnum.Material_Accountant,
          RoleEnum.Commander,
          RoleEnum.Technician,
        ],
      },
    ],
  },
];

export const permissionsByRole = policies.reduce((acc, cur) => {
  const permissions = cur.permissions;
  permissions.forEach(permission => {
    permission.accessRoles.forEach((role: RoleEnum) => {
      if (!acc[role]) {
        acc[role] = [permission.name];
      } else {
        acc[role].push(permission.name);
      }
    });
  });
  return acc;
}, <{ [role: string]: string[] }>{});
