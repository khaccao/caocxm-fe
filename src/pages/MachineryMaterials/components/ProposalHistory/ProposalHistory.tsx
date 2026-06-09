/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { eTypeVatTu, eTypeVatTuMayMoc, madvcs } from '@/common/define';
import { maKhoTongMM, maKhoTongVT } from '@/environment';
import { usePermission } from '@/hooks';
import { ChiTietDeNghiMuaHangDTO } from '@/services/AccountingInvoiceService';
import { ProjectService } from '@/services/ProjectService';
import {
  accountingInvoiceActions,
  getDanhSachDuyetMuaHang,
  getProducts,
  getWareHouses
} from '@/store/accountingInvoice';
import { getCurrentUser, getgetUserIIS } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { issueActions } from '@/store/issue';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import { getUserOrganizations } from '@/store/user';
import Utils from '@/utils';
import { DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { Badge, Button, ButtonProps, Card, Empty, Modal, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import MachineryMaterialsConfirm from '../MachineryMaterialsConfirm';
import MayMocConfirm from '../MachineryMaterialsConfirm/MayMocConfirm';
import NewMachineryMaterialList from '../NewMachineryMaterialList';
import styles from './ProposalHistory.module.less';
const { Text } = Typography;
export interface ProposalData {
  id: number;
  del: boolean;
  madvcs: string;
  recId: number;
  ma_ct: string;
  ngay_ct: string;
  so_ct: string;
  loai_tt: number;
  han_tt: string;
  ma_kh: string;
  ma_bo_phan: string;
  nguoi_tt: string;
  nv_bh: string;
  dia_chi: string;
  dien_giai: string;
  ma_nt: string;
  ty_gia: number;
  info: string;
  is_local: boolean;
  release: boolean;
  moduleName: string;
  createDate: string;
  capDuyet: number;
  capDuyetHienTai?: number;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  ngay_duyet1?: string;
  ngay_duyet2?: string;
  ngay_duyet3?: string;
  ngay_duyet4?: string;
  ngay_duyet5?: string;
  recIdparent: number;
  nguoiDuyet1: string;
  nguoiDuyet2: string;
  nguoiDuyet3: string;
  recIdrelation: number;
  guid: string;
  nguoiDuyet4: string;
  nguoiDuyet5: string;
  guidRelation: string;
  chiTietHangHoa: any; // Assuming null can later be replaced with specific type
  hoaDonVAT: any; // Assuming null can later be replaced with specific type
  list_of_extensions: any; // Assuming null can later be replaced with specific type
  chiTietDeNghiMuaHang: ChiTietDeNghiMuaHangDTO[];
  color?: string;
  daChiTien?: number;
  importFull?: boolean;
  ngay_hoa_don?: string;
}
interface DayDataType {
  date: string;
  proposals: ProposalData[];
}

const calculateCapDuyet = (proposal: ProposalData): number => {
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
//[20672] [ngoc_td] sắp xếp List theo thứ tự thời gian
const groupByDate = (data: ProposalData[]): DayDataType[] => {
  const groupedData = data.reduce((acc, item) => {
    const date = dayjs(item.createDate).format('DD/MM/YYYY');

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);

    return acc;
  }, {} as Record<string, ProposalData[]>);

  const sortedData = Object.keys(groupedData)
    .map(date => ({
      date,
      proposals: groupedData[date].sort((a, b) => dayjs(b.createDate).diff(dayjs(a.createDate))), // Sắp xếp mỗi ngày theo phút
    }))
    .sort((a, b) => dayjs(a.date, 'DD/MM/YYYY').unix() - dayjs(b.date, 'DD/MM/YYYY').unix());

  return sortedData;
};

const colors = {
  0: 'red', // Cấp 0 - Đỏ
  1: 'orange', // Cấp 1 - Cam
  2: 'green', // Cấp 2 - Xanh lá
  3: 'cyan',
  4: 'yellow', // Cấp 4 - Màu vàng
  5: 'blue',
};

interface ButtonsProps {
  approve?: ButtonProps;
  edit?: ButtonProps;
  delete?: ButtonProps;
}
const ProposalCard: React.FC<{
  proposal: ProposalData;
  type: eTypeVatTuMayMoc;
  onReload: () => void;
  buttonsProps?: ButtonsProps;
}> = ({ proposal, type, onReload, buttonsProps }) => {
  const { t } = useTranslation('proposalhistory');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false); // New state for delete confirmation modal
  const dispatch = useAppDispatch();
  const userIIS = useAppSelector(getgetUserIIS());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const userOrganizations = useAppSelector(getUserOrganizations());
  const selectedProject = useAppSelector(getSelectedProject());
  const wareHouses = useAppSelector(getWareHouses());
  const projectList = useAppSelector(state => state.project.projectList);
  const products = useAppSelector(getProducts()) || [];
  const [DanhSachVatTu, setDanhSachVatTu] = useState(products.filter(item => item.productType !== 2));
  const [DanhSachMayMoc, setDanhSachMayMoc] = useState(products.filter(item => item.productType === 2));
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const currentWarehouseCode = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? type === eTypeVatTuMayMoc.MayMoc
        ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
        : projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : undefined // Không gán giá trị nếu projectwareHouses rỗng
    : type === eTypeVatTuMayMoc.MayMoc
      ? maKhoTongMM
      : maKhoTongVT;
  // Xác định CapDuyet
  const CapDuyet =
    proposal.nguoiDuyet1 === ''
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
  proposal.capDuyetHienTai = CapDuyet;
  if (CapDuyet >= proposal.capDuyet) {
    proposal.capDuyetHienTai = 5;
  }
  const color = colors[proposal.capDuyetHienTai as keyof typeof colors]; // Default to gray if capDuyet is out of bounds
  const disableApproveButton =
    proposal.capDuyetHienTai === 5 ? false : userIIS && userIIS[0] ? userIIS[0].capDuyetChi < CapDuyet : true;

  const disableEditButton = CapDuyet >= 1;

  const showModal = () => {
    setIsModalVisible(true);
    console.log(proposal);
    dispatch(
      accountingInvoiceActions.getGiaXuatGanNhat({
        data: {
          madvcs: 'KEHOACH',
          DanhSachMaHang: proposal.chiTietDeNghiMuaHang.map(item => item.ma_vt),
          ngay_kiem_tra: dayjs(),
          DanhSachMakho: [proposal.chiTietDeNghiMuaHang[0].ma_kho],
        },
      }),
    );
    // Implement #21904 [hao_lt]
    let listMaKho: any[] = [];
    let listMaVT: any[] = [];
    proposal && proposal?.chiTietDeNghiMuaHang.map((item) => {
      listMaKho.push(item.ma_kho);
      listMaVT.push(item.ma_vt)
    });
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
          otherFilter: `${listMaVT?.map(vt => `'${vt}'`).join(',')}`,
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
          otherFilter: `${listMaVT?.map(vt => `'${vt}'`).join(',')}`,
        }
      }
    }))

    setIsInitialLoad(false);
  };
  const showModalEdit = (value: boolean) => {
    if (value) {
      let _proposal = { ...proposal };
      delete (_proposal as any).capDuyetHienTai;
      // [21/10/2024][phuong_td] Thay đổi Session để dialog Tạo phiếu đề xuất gọi lại api
      dispatch(issueActions.setSession(Utils.generateRandomString(3)));
      dispatch(accountingInvoiceActions.setProposalFormSelected(_proposal as any));
      // Implement #21904 [hao_lt]
      let listMaKho: any[] = [];
      let listMaVT: any[] = [];
      proposal && proposal?.chiTietDeNghiMuaHang.map((item) => {
        listMaKho.push(item.ma_kho);
        listMaVT.push(item.ma_vt)
      });
      const listMKTong = ['TONGTEST_CCDC', 'TONG_CCDC']
      dispatch(accountingInvoiceActions.getBaoCaoXuatNhapTon({
        params: {
          data: {
            tu_ngay: dayjs().format('YYYY-MM-DD'),
            keyStore: 'slTonKhoKhoTong',
            madvcs: madvcs.THUCHIEN,
            ma_kho: selectedProject ? `${listMKTong?.map(vt => `${vt}`).join(',')}` : currentWarehouseCode,
            den_ngay: dayjs().format('YYYY-MM-DD'),
            otherFilter: `${listMaVT?.map(vt => `'${vt}'`).join(',')}`,
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
            otherFilter: `${listMaVT?.map(vt => `'${vt}'`).join(',')}`,
          }
        }
      }))
    } else {
      dispatch(accountingInvoiceActions.setProposalFormSelected(undefined));
    }
    setIsModalEdit(value);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = () => {
    // Dispatch delete action and hide confirmation modal
    dispatch(accountingInvoiceActions.DeletePhieuDeNghiMuaHang({ ids: [proposal.guid], params: {} }));
    setIsDeleteConfirmVisible(false); // Hide the delete confirmation modal after deletion
  };

  const formatDateString = (dateString: string): string => {
    // Tách phần ngày và thời gian
    const [datePart, timePart] = dateString.split('T');

    // Loại bỏ phần mili giây từ thời gian
    const formattedTime = timePart.split('.')[0];

    // Kết hợp lại thành chuỗi theo định dạng yêu cầu
    return `${datePart} ${formattedTime}`;
  };

  async function getProjectId(): Promise<number | undefined> {
    const id = wareHouses.find(w => w.ma_kho === proposal.chiTietDeNghiMuaHang[0].ma_kho)?.id;
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
  const handlePrint = async () => {
    const projectId = await getProjectId();
    const projectFound = projectList.find(p => p.id === projectId)?.name || 'Tổng';

    const proposalData =
    {
      date: dayjs().toISOString(),
      companyName: userOrganizations[0].companyName,
      companyLocation: userOrganizations[0].billingAddress,
      dayCreate: dayjs(proposal.createDate).date(),          // ngày trong tháng (1-31)
      monthCreate: dayjs(proposal.createDate).month() + 1,   // tháng (0-11) nên cần +1
      yearCreate: dayjs(proposal.createDate).year(),         // năm (e.g., 2025) 
      projectName: projectFound,
      dayPlan: dayjs(proposal.createDate).date(),
      monthPlan: dayjs(proposal.createDate).month(),
      yearPlan: dayjs(proposal.createDate).year(),
      ngay_ct: proposal.ngay_ct, // Ngày tạo phiếu
      createTime: dayjs().toISOString(), // Ngày in phiếu
      ngay_hoa_don: proposal.ngay_hoa_don, // Ngày đề nghị hàng về
      chiTietHangHoas: proposal.chiTietDeNghiMuaHang.map((item, index: number) => {
        const prod = type === eTypeVatTuMayMoc.MayMoc ? DanhSachMayMoc.find(p => p.ma_vt === item.ma_vt) : DanhSachVatTu.find(p => p.ma_vt === item.ma_vt);
        return {
          stt: index,
          name: prod?.ten_vt,
          dvt: prod?.dvt,
          count: item.so_luong_yeu_cau
        }
      })
    }

    dispatch(issueActions.exportProposalPDFRequest({ proposalData, so_ct: proposal.so_ct }));
  }
  return (
    <>
      <Card
        className={`${styles.proposalCard} ${styles[color]}`}
        onClick={showModal} // ← Thêm dòng này
        title={
          <>
            <div className={styles.proposalCardHeader}>
              <Text className={styles.project}>{proposal.dien_giai}</Text>
              <Space className={styles.buttonGroup}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    icon={<PrinterOutlined />}
                    className={styles.noBorderButton}
                    style={{ color: '#1890FF' }}
                    onClick={(e) => {
                      e.stopPropagation(); // 👉 chặn sự kiện nổi bọt
                      handlePrint();
                    }}
                    // {...buttonsProps?.edit}
                    disabled={false}
                  />
                  <Text className={styles.noteText}>In phiếu</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    icon={<EditOutlined />}
                    className={styles.noBorderButton}
                    style={{ color: '#1890FF' }}
                    onClick={(e) => {
                      e.stopPropagation(); // 👉 chặn sự kiện nổi bọt
                      showModalEdit(true);
                    }}
                    {...buttonsProps?.edit}
                    disabled={disableEditButton || buttonsProps?.edit?.disabled}
                  />
                  <Text className={styles.noteText}>Sửa</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    icon={<DeleteOutlined />}
                    className={styles.noBorderButton}
                    style={{ color: 'red' }}
                    onClick={(e) => {
                      e.stopPropagation(); // 👉 chặn sự kiện nổi bọt
                      setIsDeleteConfirmVisible(true);
                    }}
                    {...buttonsProps?.delete}
                  />
                  <Text className={styles.noteText}>Xóa</Text>
                </div>
              </Space>
            </div>
            <Space className={styles.proposalCardFooter}>
              <Text className={styles.id}>Số chứng từ: {proposal.so_ct}</Text>
            </Space>
          </>
        }
      >
        <div className={styles.proposalCardBody}>
          <Text className={styles.textWhite}>
            <strong>{t('proposer')}:</strong> {proposal.nv_bh}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>Thời gian tạo: </strong> {formatDateString(proposal.createDate)}
          </Text>
          <br />

          <Text className={styles.textWhite}>
            <strong>Cấp duyệt tối đa:</strong> {proposal.capDuyet - 1}
          </Text>
          <br />
          <Text className={styles.textWhite}>
            <strong>Mã kho:</strong> {proposal.chiTietDeNghiMuaHang[0].ma_kho}
          </Text>
        </div>
        <div className={styles.confirmlevel}>
          <Text className={styles.textHighlight}>
            {proposal.capDuyetHienTai === 1 || proposal.capDuyetHienTai === 0
              ? ''
              : 'ĐÃ DUYỆT CẤP: '}
            {proposal.capDuyetHienTai === 0
              ? 'CHƯA RÁP GIÁ'
              : proposal.capDuyetHienTai === 1
                ? 'ĐÃ RÁP GIÁ'
                : proposal.capDuyetHienTai - 1}
          </Text>
        </div>
      </Card>

      {/* Existing modals */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1250}
        style={{ top: 20, overflow: 'hidden', height: '100vh' }}
        destroyOnClose
      >
        {type !== eTypeVatTuMayMoc.MayMoc ? (
          <MachineryMaterialsConfirm proposal={proposal} type={type} capDuyet={CapDuyet} handleClose={handleCancel} />
        ) : (
          <MayMocConfirm proposal={proposal} type={type} capDuyet={CapDuyet} handleClose={handleCancel} />
        )}
      </Modal>

      <Modal
        open={isModalEdit}
        onCancel={() => {
          dispatch(accountingInvoiceActions.setProposalFormSelected(undefined));
          const random = Utils.generateRandomString(3);
          dispatch(accountingInvoiceActions.setClearData(random));
          showModalEdit(false);
        }}
        footer={null}
        width={1200}
      >
        <NewMachineryMaterialList
          type={type}
          handleClose={() => {
            setIsModalEdit(false);
          }}
        />
      </Modal>

      {/* New Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmVisible}
        onCancel={() => setIsDeleteConfirmVisible(false)} // Close modal if user cancels
        onOk={handleDelete} // Proceed with delete if user confirms
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa đề nghị này không?</p>
      </Modal>
    </>
  );
};

type ProposalListProps = {
  type: eTypeVatTuMayMoc;
};

const ProposalList = ({ type }: ProposalListProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const danhsachduyetmuahang = useAppSelector(getDanhSachDuyetMuaHang());
  const [ColoredData, setColoredData] = useState<DayDataType[]>([]);
  const [reload, setReload] = useState(false); // State to trigger re-fetching
  const user = useAppSelector(getCurrentUser());
  const products = useAppSelector(getProducts()) || [];
  const [DanhSachVatTu, setDanhSachVatTu] = useState(products.filter(item => item.productType !== 2));
  const [DanhSachMayMoc, setDanhSachMayMoc] = useState(products.filter(item => item.productType === 2));
  const userIIS = useAppSelector(getgetUserIIS());
  const dispatch = useAppDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  //[10/1/2025][ngoc_td] trong trang chính hiển thị danh sách vật tư máy móc của toàn bộ kho

  // ? maKhoTongMM
  // : maKhoTongVT;
  // Function to trigger reload
  const triggerReload = () => {
    setReload(!reload);
  };

  useEffect(() => {
    setIsInitialLoad(true);
  }, [type]);
  useEffect(() => {
    dispatch(accountingInvoiceActions.getCustomers());
  }, []);
  useEffect(() => {
    const ListVatTu: any = [];
    if (Array.isArray(danhsachduyetmuahang) && danhsachduyetmuahang.length > 0) {

      let filteredDanhSach = danhsachduyetmuahang;

      // Lọc riêng nếu là user hang_ntt
      if (user?.UserName === 'hang_ntt') {
        filteredDanhSach = danhsachduyetmuahang.filter((proposal: ProposalData) => {
          return proposal.chiTietDeNghiMuaHang?.some(item => {
            const product = DanhSachVatTu.find(p => p.ma_vt === item.ma_vt);
            return product?.productType2 === 1;
          });
        });
      } else if (user?.UserName === 'thuyen_dt') {
        filteredDanhSach = danhsachduyetmuahang.filter((proposal: ProposalData) => {
          return proposal.chiTietDeNghiMuaHang?.some(item => {
            const product = DanhSachVatTu.find(p => p.ma_vt === item.ma_vt);
            const maymoc = DanhSachMayMoc.find(p => p.ma_vt === item.ma_vt);
            return product?.productType2 === 0 || maymoc?.productType2 === 0;
          });
        });
      }

      const LstMapMa_vt: ProposalData[] = filteredDanhSach.map(it => ({
        ...it,
        ma_vt: it.chiTietDeNghiMuaHang?.[0]?.ma_vt || "",
      }));

      if (LstMapMa_vt) {
        LstMapMa_vt.map((m: any) => {
          const product = DanhSachVatTu.find(vt => vt.ma_vt === m.chiTietDeNghiMuaHang[0].ma_vt);
          const maymoc = DanhSachMayMoc.find(mm => mm.ma_vt === m.chiTietDeNghiMuaHang[0].ma_vt);
          if (product) {
            const dk =
              (type === eTypeVatTuMayMoc.VatTuChinh && product.productType === eTypeVatTu.VatTuChinh) ||
              (type === eTypeVatTuMayMoc.VatTuPhu && product.productType === eTypeVatTu.VatTuPhu);
            if (dk) {
              ListVatTu.push({
                ...m,
                key: Utils.generateRandomString(15),
                checkbox: false,
              });
            }
          }
          if (maymoc && type === eTypeVatTuMayMoc.MayMoc) {
            ListVatTu.push({
              ...m,
              key: Utils.generateRandomString(15),
              checkbox: false,
            });
          }
        });
      }
      const sortedListVatTu = ListVatTu.sort((a: ProposalData, b: ProposalData) => {
        const capDuyetChi = userIIS && userIIS[0] ? userIIS[0].capDuyetChi : 0;

        // Tính toán cấp duyệt cho mỗi proposal
        const capDuyetA = calculateCapDuyet(a);
        const capDuyetB = calculateCapDuyet(b);

        // Nếu capDuyet của người dùng lớn hơn capDuyet của proposal, ưu tiên proposal đó
        if (capDuyetA < capDuyetChi && capDuyetB >= capDuyetChi) return -1;
        if (capDuyetA >= capDuyetChi && capDuyetB < capDuyetChi) return 1;

        // Sắp xếp theo cấp duyệt tăng dần
        return capDuyetA - capDuyetB;
      });
      // [20703] [ngoc_td] chỉ hiển thị các đề xuất chưa duyệt xong
      const filteredListVatTu = sortedListVatTu.filter((item: ProposalData) => {
        const capDuyet = calculateCapDuyet(item);
        return capDuyet < item.capDuyet;
      });

      const dayDataArray: DayDataType[] = groupByDate(filteredListVatTu);
      setColoredData(dayDataArray);
    } else {
      setColoredData([]);
    }
  }, [danhsachduyetmuahang, type, userIIS]);

  const getPermissionKeys = () => {
    const isProjectLayout = location.pathname.startsWith('/projects');

    let permissionKeys: { approve?: string[]; edit?: string[]; delete?: string[] } = {};
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
        permissionKeys = {
          approve: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Approve'] : [],
          edit: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Edit'] : ['KhoCongTy.VatTuChinh.Edit'],
          delete: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Delete'] : ['KhoCongTy.VatTuChinh.Delete'],
        };
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        permissionKeys = {
          approve: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Approve'] : [],
          edit: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Edit'] : ['KhoCongTy.VatTuPhu.Edit'],
          delete: isProjectLayout ? ['KhoCongTrinh.VatTuP `~`````````````hu.Delete'] : ['KhoCongTy.VatTuPhu.Delete'],
        };
        break;
      case eTypeVatTuMayMoc.MayMoc:
        permissionKeys = {
          approve: isProjectLayout ? ['KhoCongTrinh.MayMoc.Approve'] : [],
          edit: isProjectLayout ? ['KhoCongTrinh.MayMoc.Edit'] : ['KhoCongTy.MayMoc.Edit'],
          delete: isProjectLayout ? ['KhoCongTrinh.MayMoc.Delete'] : ['KhoCongTy.MayMoc.Delete'],
        };
        break;
      default:
        break;
    }
    return permissionKeys;
  };

  const permissionKeys = getPermissionKeys();

  const approveGranted = usePermission(permissionKeys.approve);
  const deleteGranted = usePermission(permissionKeys.delete);
  const editGranted = usePermission(permissionKeys.edit);

  //[implement #22154]
  const extractApproveLevel = (un?: string): number => {
    if (!un) return 0;
    const m = un.toUpperCase().match(/CAPDUYET(\d+)/);
    return m ? Number(m[1]) : 0;
  };

  const canApproveByLevel = (proposal: ProposalData, userCap: number) => {
    if (proposal.capDuyetHienTai === 5) return false;
    const waiting = calculateCapDuyet(proposal) + 1;
    return userCap === waiting;
  };

  const rawUser = userIIS?.[0];
  const userCap = extractApproveLevel(rawUser?.un);
  const hasApprovePermission = approveGranted;

  const canUserSee = (p: ProposalData) =>
    hasApprovePermission && canApproveByLevel(p, userCap);

  const ColoredDataWithApprovable = ColoredData.map(d => ({
    ...d,
    approvableCount: d.proposals.filter(canUserSee).length,
  }));

  return (
    <div>
      {Array.isArray(ColoredDataWithApprovable) && ColoredDataWithApprovable.length > 0 ? (
        <div className={styles.proposalList}>
          {ColoredDataWithApprovable.map(dayData => (
            <Card key={dayData.date} className={styles.proposalDayCard}>
              {/* hiển thị Badge số phiếu có thể duyệt */}
              {dayData.approvableCount > 0 ? (
                <Badge count={dayData.approvableCount} offset={[15, 0]} className="proposal-badge">
                  <div className={styles.proposalDayCardTitle}>
                    {`${t(dayData.date)} (${dayData.proposals.length} phiếu)`}
                  </div>
                </Badge>
              ) : (
                <div className={styles.proposalDayCardTitle}>
                  {`${t(dayData.date)} (${dayData.proposals.length} phiếu)`}
                </div>
              )}
              <div className={styles.proposalDayCardContent}>
                {dayData.proposals.map(proposal => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    type={type}
                    onReload={triggerReload}
                    buttonsProps={{
                      approve: {
                        disabled: !approveGranted,
                      },
                      edit: {
                        disabled: !editGranted,
                      },
                      delete: {
                        disabled: !deleteGranted,
                      },
                    }}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description={t('noProposals')} />
      )}
    </div>
  );
};

export default ProposalList;
