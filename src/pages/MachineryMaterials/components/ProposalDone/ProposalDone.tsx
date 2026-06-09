/* eslint-disable import/order */
import React, { useEffect, useMemo, useState } from 'react';

import { eTypeVatTu, eTypeVatTuMayMoc, RoleEnum } from '@/common/define';
import { AccountingInvoiceService, ChiTietDeNghiMuaHangDTO } from '@/services/AccountingInvoiceService';
import {
  accountingInvoiceActions,
  getDanhSachDuyetMuaHang,
  getDateRange,
  getProducts,
  getProposalToken,
  getWareHouses
} from '@/store/accountingInvoice';
import { getgetUserIIS, getUserRoles } from '@/store/app';

import { usePermission } from '@/hooks';
import { ProjectService } from '@/services/ProjectService';
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
import ImportGoods from '../ImportGoods';
import ImportMayMoc from '../ImportGoods/ImportMayMoc';
import NewMachineryMaterialList from '../NewMachineryMaterialList';
import styles from './ProposalDone.module.less';
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
  importFull?: boolean;
  imported?: boolean;
  daChiTien?: number;
  ngay_hoa_don?: string;
}
interface DayDataType {
  date: string;
  proposals: ProposalData[];
  badgeCount?: any;
  totalDayMoney?: any;
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
function tinhTongSauThue(data: any): number {
  const danhSachDeNghi = data.chiTietDeNghiMuaHang || [];

  return danhSachDeNghi.reduce((sum: number, item: { so_luong_nhap1: number; gia: number; vatRate: number }) => {
    const quantity = item.so_luong_nhap1 ?? 0;
    const price = item.gia ?? 0;
    const tax = item.vatRate ?? 0;
    return sum + quantity * price * (1 + tax / 100);
  }, 0);
}
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
  inventory?: ButtonProps;
  edit?: ButtonProps;
  delete?: ButtonProps;
}
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
const ProposalCard: React.FC<{
  proposal: ProposalData;
  type: eTypeVatTuMayMoc;
  onReload: () => void;
  buttonsProps?: ButtonsProps;
}> = ({ proposal, type, onReload, buttonsProps }) => {
  const { t } = useTranslation('proposalhistory');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const getProposalsParams = useAppSelector((state: RootState) => state.accountingInvoice.query_danhSachDuyetMuaHang.params)
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const dispatch = useAppDispatch();
  const proposalToken = useAppSelector(getProposalToken());
  const userIIS = useAppSelector(getgetUserIIS());
  const totalMoney = tinhTongSauThue(proposal);
  const userOrganizations = useAppSelector(getUserOrganizations());
  const wareHouses = useAppSelector(getWareHouses());
  const projectList = useAppSelector(state => state.project.projectList);
  const products = useAppSelector(getProducts()) || [];
  const DanhSachVatTu = products.filter(item => item.productType !== 2)
  const DanhSachMayMoc = products.filter(item => item.productType === 2);
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
  const capDuyetHienTai =
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

  const effectiveCapDuyetHienTai = capDuyetHienTai >= proposal.capDuyet ? 5 : capDuyetHienTai;
  const color = colors[effectiveCapDuyetHienTai as keyof typeof colors];
  const disableApproveButton =
    proposal.capDuyetHienTai === 5 ? false : userIIS && userIIS[0] ? userIIS[0].capDuyetChi < CapDuyet : true;

  const disableEditButton = CapDuyet >= 1;
  const showModal = () => {
    console.log(proposal);
    dispatch(accountingInvoiceActions.setProposal(proposal));
    setIsModalVisible(true);
    dispatch(accountingInvoiceActions.getPhieuNhapKhoTuDeNghiMuaHang({ guid: proposal.guid }));
    dispatch(issueActions.getAttachmentFileRequest({ issueId: proposal.id }));

  };


  const showModalEdit = (value: boolean) => {
    if (value) {
      let _proposal = { ...proposal };
      delete (_proposal as any).capDuyetHienTai;

      dispatch(issueActions.setSession(Utils.generateRandomString(3)));
      dispatch(accountingInvoiceActions.setProposalFormSelected(_proposal as any));
    } else {
      dispatch(accountingInvoiceActions.setProposalFormSelected(undefined));
    }
    setIsModalEdit(value);
  };

  const handleCancel = () => {
    setIsModalVisible(false);

    if (proposalToken) {
      dispatch(accountingInvoiceActions.GetDanhSachDuyetMuaHang({ params: getProposalsParams }));
      dispatch(accountingInvoiceActions.setProposalToken(false));
    }
  };

  const handleDelete = () => {

    dispatch(accountingInvoiceActions.DeletePhieuDeNghiMuaHang({ ids: [proposal.guid], params: {} }));

    setIsDeleteConfirmVisible(false);
  };

  const formatDateString = (dateString: string): string => {

    const [datePart, timePart] = dateString.split('T');


    const formattedTime = timePart.split('.')[0];


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
      totalMoney: totalMoney,
      ngay_ct: proposal.ngay_ct, // Ngày tạo phiếu
      createTime: dayjs().toISOString(), // Ngày in phiếu
      ngay_hoa_don: proposal.ngay_hoa_don, // Ngày đề nghị hàng về
      chiTietHangHoas: proposal.chiTietDeNghiMuaHang.map((item, index: number) => {
        const prod = type === eTypeVatTuMayMoc.MayMoc ? DanhSachMayMoc.find(p => p.ma_vt === item.ma_vt) : DanhSachVatTu.find(p => p.ma_vt === item.ma_vt);
        return {
          stt: index + 1,
          name: prod?.ten_vt,
          dvt: prod?.dvt,
          count: item.so_luong_nhap1 ?? 0,
          money: item.gia ?? 0,
          price: (item.so_luong_nhap1 ?? 0) * (item.gia ?? 0),
        }
      })
    }
    dispatch(issueActions.exportInventoryReceiptPDFRequest({ proposalData, so_ct: proposal.so_ct }));
  }
  return (
    <>
      <Card
        className={`${styles.proposalCard}  ${proposal.importFull ? styles['magenta'] : styles[color]} `}
        onClick={showModal}
        title={
          <div>
            <div className={styles.proposalCardHeader} style={{ backgroundColor: 'white', }}>
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
            <Space className={styles.proposalCardFooter} >
              <Text className={styles.id}>Số chứng từ: {proposal.so_ct}</Text>
            </Space>
          </div>
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
          <br />
          <Text className={styles.textWhite}>
            <strong>Tiền duyệt chi: </strong> {totalMoney.toLocaleString('en-US')} VNĐ
          </Text>
        </div>
        <div className={styles.confirmlevel}>
          {
            proposal.so_ct.includes('.') || proposal.daChiTien === 1 ? (<Text className={styles.textHighlight}>
              <strong>ĐÃ DUYỆT CHI TIỀN</strong>{' '}
            </Text>) : (<></>)
          }
        </div>
        <div className={styles.confirmlevel}>
          {proposal.importFull ? (
            <Text className={styles.textHighlight}>
              <strong>ĐÃ NHẬP ĐỦ KHO</strong>{' '}
            </Text>
          ) : proposal.imported ? (
            <Text className={styles.textHighlight}>
              <strong>ĐÃ NHẬP KHO MỘT PHẦN</strong>{' '}
            </Text>
          ) : (
            <></>
          )}
        </div>
      </Card>

      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1250}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 90px)',
            overflow: 'auto'
          }
        }}
        style={{ top: 20 }}
      >
        {type !== eTypeVatTuMayMoc.MayMoc ? (
          <ImportGoods proposal={proposal} handleClose={handleCancel} type={type} />
        ) : (
          <ImportMayMoc proposal={proposal} handleClose={handleCancel} type={type} />
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
  const dateRange = useAppSelector(getDateRange());
  const [ColoredData, setColoredData] = useState<DayDataType[]>([]);
  const userRoles = useAppSelector(getUserRoles());
  const [reload, setReload] = useState(false); // State to trigger re-fetching
  const products = useAppSelector(getProducts()) || [];
  const DanhSachVatTu = products.filter(item => item.productType !== 2)
  const DanhSachMayMoc = products.filter(item => item.productType === 2);
  const userIIS = useAppSelector(getgetUserIIS());
  const dispatch = useAppDispatch();
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const selectedProject = useAppSelector(getSelectedProject());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [nhapKhoList, setNhapKhoList] = useState<Record<string, any[]>>();
  const [session, setSession] = useState('abc');
  //[10/1/2025][ngoc_td] trong trang chính hiển thị danh sách vật tư máy móc của toàn bộ kho
  const currentWarehouseCode = selectedProject
    ? projectwareHouses && projectwareHouses.length > 0
      ? type === eTypeVatTuMayMoc.MayMoc
        ? projectwareHouses.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
        : projectwareHouses.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
      : undefined // Không gán giá trị nếu projectwareHouses rỗng
    : type === eTypeVatTuMayMoc.MayMoc
      ? ''
      : '';
  // ? maKhoTongMM
  // : maKhoTongVT;
  // Function to trigger reload

  const triggerReload = () => {
    setReload(!reload);
  };
  useEffect(() => {

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      dispatch(
        accountingInvoiceActions.GetDanhSachDuyetMuaHang({
          params: {
            madvcs: 'THUCHIEN',
            ngay_de_nghi_tu_ngay: dayjs(dateRange.startDate).format('YYYY-MM-DD'),
            ngay_de_nghi_den_ngay: dayjs(dateRange.endDate).format('YYYY-MM-DD'),
            ma_kho: currentWarehouseCode,
          },
        }),
      );

    }

  }, [dateRange]);

  useEffect(() => {
    console.log(danhsachduyetmuahang);
    const getDataNhapKho = async () => {
      if (!dateRange?.startDate || !dateRange?.endDate) return;

      AccountingInvoiceService.Get.GetDanhSachPhieuNhapKho({
        search: {
          madvcs: 'THUCHIEN',
          ngay_de_nghi_tu_ngay: dayjs(dateRange.startDate).format('YYYY-MM-DD'),
          ngay_de_nghi_den_ngay: dayjs(dateRange.endDate).format('YYYY-MM-DD'),
          ma_kho: currentWarehouseCode || '',
        }
      }).subscribe(async (res: any) => {
        const parsedData = res.map((item: string) => {
          if (item === "") {
            return []; // Trả về mảng rỗng nếu item là chuỗi rỗng
          }
          return JSON.parse(item);
        });
        setNhapKhoList(groupByGuidMaster(parsedData[2]));
      });
    }
    getDataNhapKho();
  }, [dateRange, danhsachduyetmuahang])

  useEffect(() => {
    setIsInitialLoad(true);
  }, [type]);
  useEffect(() => {
    dispatch(accountingInvoiceActions.getCustomers());
  }, []);
  useEffect(() => {
    const ListVatTu: any = [];
    if (Array.isArray(danhsachduyetmuahang) && danhsachduyetmuahang.length > 0) {
      const isCmdOrTech =
        (userRoles === RoleEnum.Commander || userRoles === RoleEnum.Technician);
      let filteredDanhSach = danhsachduyetmuahang;
      // let filteredDanhSach = isCmdOrTech
      //   ? danhsachduyetmuahang.filter(p => (p.so_ct?.includes('.') || p.daChiTien === 1))
      //   : danhsachduyetmuahang;

      const LstMapMa_vt: ProposalData[] = filteredDanhSach.map(it => ({
        ...it,
        ma_vt: it.chiTietDeNghiMuaHang[0].ma_vt,
      }));
      if (LstMapMa_vt) {
        LstMapMa_vt.map((m: any) => {

          const product = DanhSachVatTu.find(vt => vt.ma_vt === m.ma_vt);
          const maymoc = DanhSachMayMoc.find(mm => mm.ma_vt === m.ma_vt);
          let importFull = false;
          let imported = false;
          if (nhapKhoList) {
            const importSum = Object.values(nhapKhoList).find((item) =>
              item[0].guid_master === m.guid
            );
            importFull = importSum ? m.chiTietDeNghiMuaHang.every((item: { ma_vt: any; so_luong_nhap1: any; }) => {
              const nhapKhoItem = importSum.find(nk => nk.ma_vt === item.ma_vt);

              return nhapKhoItem && parseFloat(nhapKhoItem.tong_luong_nhap) >= item.so_luong_nhap1;
            }) : false;
            imported = importSum?.some(item => parseFloat(item.tong_luong_nhap) > 0) ?? false;

          }
          if (product) {
            const dk =
              (type === eTypeVatTuMayMoc.VatTuChinh && product.productType === eTypeVatTu.VatTuChinh) ||
              (type === eTypeVatTuMayMoc.VatTuPhu && product.productType === eTypeVatTu.VatTuPhu);
            if (dk) {
              ListVatTu.push({
                ...m,
                key: Utils.generateRandomString(15),
                checkbox: false,
                importFull: importFull,
                imported: imported,
              });
            }
          }
          if (maymoc && type === eTypeVatTuMayMoc.MayMoc) {
            ListVatTu.push({
              ...m,
              key: Utils.generateRandomString(15),
              checkbox: false,
              importFull: importFull,
              imported: imported,
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

      const filteredListVatTu = sortedListVatTu.filter((item: ProposalData) => {
        const capDuyet = calculateCapDuyet(item);
        return capDuyet >= item.capDuyet;
      });

      const dayDataArray: DayDataType[] = groupByDate(filteredListVatTu);
      const updatedDayData = dayDataArray.map(dayData => {
        const totalDayMoney = dayData.proposals.reduce((sum, proposal) =>
          sum + tinhTongSauThue(proposal), 0);

        return {
          ...dayData,
          proposals: [...dayData.proposals], // Tạo một bản sao mới của proposals
          badgeCount: dayData.proposals.filter(proposal => !proposal.importFull).length,
          totalDayMoney
        };
      });


      setColoredData(updatedDayData);
      // setColoredData(dayDataArray);
    } else {
      setColoredData([]);
    }
  }, [products, danhsachduyetmuahang, type, userIIS, nhapKhoList]);
  const getPermissionKeys = () => {
    const isProjectLayout = location.pathname.startsWith('/projects')

    let permissionKeys: { inventory?: string[]; edit?: string[]; delete?: string[] } = {};
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Inventory'] : ['KhoCongTy.VatTuChinh.Inventory'],
          edit: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Edit'] : ['KhoCongTy.VatTuChinh.Edit'],
          delete: isProjectLayout ? ['KhoCongTrinh.VatTuChinh.Delete'] : ['KhoCongTy.VatTuChinh.Delete'],
        };
        break;
      case eTypeVatTuMayMoc.VatTuPhu:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Inventory'] : ['KhoCongTy.VatTuPhu.Inventory'],
          edit: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Edit'] : ['KhoCongTy.VatTuPhu.Edit'],
          delete: isProjectLayout ? ['KhoCongTrinh.VatTuPhu.Delete'] : ['KhoCongTy.VatTuPhu.Delete'],
        };
        break;
      case eTypeVatTuMayMoc.MayMoc:
        permissionKeys = {
          inventory: isProjectLayout ? ['KhoCongTrinh.MayMoc.Inventory'] : ['KhoCongTy.MayMoc.Inventory'],
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

  const inventoryGranted = usePermission(permissionKeys.inventory);
  const deleteGranted = usePermission(permissionKeys.delete);
  const editGranted = usePermission(permissionKeys.edit);

  const overallTotal = useMemo(() =>
    ColoredData.reduce((sum, day) => sum + (day.totalDayMoney ?? 0), 0), [ColoredData]);
  return (
    <div key={session}>
      {Array.isArray(ColoredData) && ColoredData.length > 0 ? (
        <>
          <div className={styles.proposalList}>
            {ColoredData.map(dayData => (
              <Card key={dayData.date} className={styles.proposalDayCard}>
                {/*
                Update Badge hiển thị các phiếu cần nhập kho
                */}
                {dayData.badgeCount >= 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge
                      count={dayData.badgeCount}
                      offset={[15, 0]}
                      className="proposal-badge"
                    >
                      <div className={styles.proposalDayCardTitle}>
                        {`${t(dayData.date)} (${dayData.proposals.length} phiếu)`}
                      </div>
                    </Badge>
                    <div className={`${styles.proposalDayCardTitle} `} style={{ marginTop: -12 }}>
                      {`Tổng tiền: ${t(dayData.totalDayMoney.toLocaleString('en-US'))} VNĐ`}
                    </div>
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
                        inventory: {
                          disabled: false,
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
          <div className={styles.overallTotal}>
            {`Tổng tiền: ${overallTotal.toLocaleString('en-US')} VNĐ`}
          </div>
        </>
      ) : (
        <Empty description={t('noProposals')} />
      )}
    </div>
  );
};

export default ProposalList;
