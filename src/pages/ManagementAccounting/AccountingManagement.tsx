/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { eAccoutingKey } from '@/common/define';
import { InformationScreen } from '@/components/InformationScreen';
import { ProjectDocumentsHeader } from '@/pages/Components/Document/ProjectDocumentHeader';
import {
  getBaoCaoBangCanDoiPhatSinhTaiKhoan,
  getbaoCaoBangKeThueMuaVaoBanRa,
  getBaoCaoChiTietCongNo,
  getBaoCaoDanhThuChiPhi,
  getBaoCaoSoCaiSoQuy,
  getBaoCaoXuatNhapTon,
  getBaoCaoXuatNhapTonPdf,
} from '@/store/accountingInvoice';
import { getActiveMenu } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import Loading from '@/components/Loading';

export const AccoutingManagement = ({ AccoutingKey }: any) => {
  const { t } = useTranslation('common');
  const activeMenu = useAppSelector(getActiveMenu());
  const BaoCaoDanhThuChiPhi = useAppSelector(getBaoCaoDanhThuChiPhi());
  // [18/12/2024][#21174][phuong_td] Lấy dữ liệu Báo Cáo Nhập Xuất Tồn
  const BaoCaoXuatNhap = useAppSelector(getBaoCaoXuatNhapTonPdf());
  // [12/01/2024][#21278][phuong_td] Lấy dữ liệu Báo Cáo cân đối kế toán
  const BaoCaoBangCanDoiPhatSinhTaiKhoan = useAppSelector(getBaoCaoBangCanDoiPhatSinhTaiKhoan());
  // [#21175][dung_lt][19/12/2024]- Lấy dữ liệu Báo cáo chi tiết công nợ
  const BaoCaoChiTietCongNo = useAppSelector(getBaoCaoChiTietCongNo());
  // [#21241][dung_lt][04/01/2025]- Lấy dữ liệu Báo cáo sổ cái sổ quý
  const BaoCaoSoCaiSoQuy = useAppSelector(getBaoCaoSoCaiSoQuy());
  // [07/01/2025][#21192][hao_lt] - Lấy dữ liệu báo cáo thuế mua vào bán ra
  const HoaDonVaoRa = useAppSelector(getbaoCaoBangKeThueMuaVaoBanRa());

  const isLoading = useAppSelector(getLoading('getBaoCaoXuatNhapTonPdf'));
  const [dataPdf, setDataPdf] = useState<any>(null);

  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setMonth(currentDate.getMonth() - 3);


  const getFirstAvailableReport = () => {
    if ((HoaDonVaoRa && AccoutingKey === eAccoutingKey.HoaDonDauRa) || (HoaDonVaoRa && AccoutingKey === eAccoutingKey.HoaDonDauVao)) {
      return HoaDonVaoRa;
    } 
    if (BaoCaoXuatNhap && AccoutingKey === eAccoutingKey.TongHopXuatNhapTon) return BaoCaoXuatNhap;
    if (BaoCaoBangCanDoiPhatSinhTaiKhoan && AccoutingKey === eAccoutingKey.CanDoiKeToan) return BaoCaoBangCanDoiPhatSinhTaiKhoan;
    if (BaoCaoChiTietCongNo && AccoutingKey === eAccoutingKey.CongNoNCC_CDT) return BaoCaoChiTietCongNo;
    if (BaoCaoDanhThuChiPhi && (AccoutingKey === eAccoutingKey.ChenhLechHoaDon || AccoutingKey === eAccoutingKey.DongTien 
       || AccoutingKey === eAccoutingKey.TongHopDoanhThu || AccoutingKey === eAccoutingKey.QuyetToanLaiLoCongTrinh)) {
      return BaoCaoDanhThuChiPhi;
    }
    if (BaoCaoSoCaiSoQuy && eAccoutingKey.SoSachKeToan === AccoutingKey) {
      return BaoCaoSoCaiSoQuy
    }
    return null;
  };
  useEffect(() => {
    setDataPdf(null);
    const firstReportUrl = getFirstAvailableReport();
    if (firstReportUrl) {
      setDataPdf(firstReportUrl);
    } else {
      setDataPdf(null);
    }
  }, [
    AccoutingKey,
    BaoCaoSoCaiSoQuy,
    HoaDonVaoRa,
    BaoCaoXuatNhap,
    BaoCaoBangCanDoiPhatSinhTaiKhoan,
    BaoCaoChiTietCongNo,
    BaoCaoDanhThuChiPhi,
  ]);

  return (
    <div style={{ height: '87vh' }}>
      <ProjectDocumentsHeader title={activeMenu?.label} AccoutingKey={AccoutingKey} />
      
      {isLoading ? (
        <Loading />
      ) : dataPdf ? (
        <iframe
          src={dataPdf}
          title={activeMenu?.label}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      ) : (
        <InformationScreen mess={t('No data')} />
      )}
    </div>
  );
};
