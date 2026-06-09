/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';

import { Empty, PaginationProps, Table, Typography } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { ColumnType, TableProps } from 'antd/es/table';
import classnames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import {
  accountingInvoice,
  eTrackerCode,
  eTypeVatTu,
  eTypeVatTuMayMoc,
  FormatDateAPI,
  MaterialsDim,
  VatTuMayMocDTO
} from '@/common/define';
import { maKhoTongMM, maKhoTongVT } from '@/environment';
import { useWindowSize } from '@/hooks';
import { TonKhoDTO } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions, getProducts, getWareHouses } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getMachineries,
  getMaterials,
  getTracker,
  issueActions,
  queryParamsMaterial
} from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getSelectedProject, projectActions } from '@/store/project';
import { RootState } from '@/store/types';
import Utils from '@/utils';
import styles from './MachineryMaterialsList.module.css';

interface MachineryMaterialsListProps {
  type: eTypeVatTuMayMoc;
  searchText: string;
}
const MachineryMaterialsList = (props: MachineryMaterialsListProps) => {
  const { type, searchText } = props;
  const [dataSource, setDataSource] = useState<VatTuMayMocDTO[]>([]);
  const [daySelected, setDaySelected] = useState<Dayjs>(dayjs());
  const { t } = useTranslation('material');
  const dispatch = useAppDispatch();
  const trackers = useAppSelector(getTracker());
  const material = useAppSelector(getMaterials());
  const machinery = useAppSelector(getMachineries());
  const products = useAppSelector(getProducts()) || [];
  const [DanhSachVatTu, setDanhSachVatTu] = useState(products.filter(item => item.productType !== 2));
  const [DanhSachMayMoc, setDanhSachMayMoc] = useState(products.filter(item => item.productType === 2));

  const paramsMaterial = useAppSelector(queryParamsMaterial());
  const isLoading = useAppSelector(getLoading(MaterialsDim.getMaterialsDim));
  const Tonkho = useAppSelector((state: RootState) => state.accountingInvoice.Tonkho);
  const Kldinhmuc = useAppSelector((state: RootState) => state.accountingInvoice.KLdinhmuc);
  const company = useAppSelector(getCurrentCompany());
  const windowSize = useWindowSize();
  const selectedProject = useAppSelector(getSelectedProject());
  const wareHouses = useAppSelector(getWareHouses());
  const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);
  const isLoadingTonKho = useAppSelector(getLoading(accountingInvoice.GetTonKho));
  const [originalDataSource, setOriginalDataSource] = useState<VatTuMayMocDTO[]>([]);

  useEffect(() => {
    if (selectedProject) {
      // Dispatch action để lấy danh sách warehouses
      dispatch(accountingInvoiceActions.GetDanhSachBoPhan({ params: {} }));
      dispatch(
        projectActions.getWarehousesRequest({
          projectId: selectedProject?.id,
        }),
      );
    }
  }, [selectedProject]);

  //[21/10/2024] [nam_do] call api man hinh ngoai project
  useEffect(() => {
    if (selectedProject) {
      GetTonKho();
    }
    // Chỉ gọi GetTonKhos nếu không có selectedProject
    else if (!selectedProject) {
      GetTonKhos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, selectedProject]);
  //[20563] [nam_do] Gắn API lấy các trường KL theo định mức, tổng đã cấp, còn được đề xuất cho danh sách vật tư chính, vật tư phụ cho project và tổng kho
  const GetTonKho = () => {
    const danhSachMakho: string[] = [];
    let hasMatchingWarehouseCode = false;
    if (projectwareHouses) {
      projectwareHouses.forEach(warehouse => {
        if (type === eTypeVatTuMayMoc.VatTuChinh) {
          if (!warehouse.warehouseCode.endsWith('CCDC')) {
            danhSachMakho.push(warehouse.warehouseCode);
            hasMatchingWarehouseCode = true;
          }
        }
        if (type === eTypeVatTuMayMoc.VatTuPhu) {
          if (!warehouse.warehouseCode.endsWith('CCDC')) {
            danhSachMakho.push(warehouse.warehouseCode);
            hasMatchingWarehouseCode = true;
          }
        } else if (type === eTypeVatTuMayMoc.MayMoc) {
          if (warehouse.warehouseCode.endsWith('CCDC')) {
            danhSachMakho.push(warehouse.warehouseCode);
            hasMatchingWarehouseCode = true;
          }
        }
      });
    }
    if (!hasMatchingWarehouseCode) {
      return;
    }
    if (selectedProject) {
      dispatch(
        accountingInvoiceActions.GetTonKho({
          data: {
            madvcs: 'THUCHIEN',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho,
          },
          params: {},
        }),
      );
      dispatch(
        accountingInvoiceActions.getKldinhmuc({
          data: {
            madvcs: 'KEHOACH',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho,
          },
          params: {},
        }),
      );
    } else {
      if (type === eTypeVatTuMayMoc.VatTuChinh) {
        dispatch(
          accountingInvoiceActions.GetTonKho({
            data: {
              madvcs: 'THUCHIEN',
              danhSachMaHang: [],
              ngay_kiem_tra: dayjs().format(FormatDateAPI),
              danhSachMakho: [maKhoTongVT],
            },
            params: {},
          }),
        );
        dispatch(
          accountingInvoiceActions.getKldinhmuc({
            data: {
              madvcs: 'KEHOACH',
              danhSachMaHang: [],
              ngay_kiem_tra: dayjs().format(FormatDateAPI),
              danhSachMakho: [maKhoTongVT],
            },
            params: {},
          }),
        );
      } else {
        dispatch(
          accountingInvoiceActions.GetTonKho({
            data: {
              madvcs: 'THUCHIEN',
              danhSachMaHang: [],
              ngay_kiem_tra: dayjs().format(FormatDateAPI),
              danhSachMakho: [maKhoTongMM],
            },
            params: {},
          }),
        );
      }
    }
  };
  const GetTonKhos = () => {
    if (type === eTypeVatTuMayMoc.VatTuChinh) {
      dispatch(
        accountingInvoiceActions.GetTonKho({
          data: {
            madvcs: 'THUCHIEN',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho: [maKhoTongVT],
          },
          params: {},
        }),
      );
      dispatch(
        accountingInvoiceActions.getKldinhmuc({
          data: {
            madvcs: 'KEHOACH',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho: [maKhoTongVT],
          },
          params: {},
        }),
      );
    } if (type === eTypeVatTuMayMoc.VatTuPhu) {
      dispatch(
        accountingInvoiceActions.GetTonKho({
          data: {
            madvcs: 'THUCHIEN',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho: [maKhoTongVT],
          },
          params: {},
        }),
      );
      dispatch(
        accountingInvoiceActions.getKldinhmuc({
          data: {
            madvcs: 'KEHOACH',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho: [maKhoTongVT],
          },
          params: {},
        }),
      );
    } else if (type === eTypeVatTuMayMoc.MayMoc) {
      dispatch(
        accountingInvoiceActions.GetTonKho({
          data: {
            madvcs: 'THUCHIEN',
            danhSachMaHang: [],
            ngay_kiem_tra: dayjs().format(FormatDateAPI),
            danhSachMakho: [maKhoTongMM],
          },
          params: {},
        }),
      );
    }
  };
  const getMaterialsData = (search?: any) => {
    if (trackers) {
      let trackerId = Utils.getTrackerID(trackers, eTrackerCode.GiaoViecTheoNgay);
      if (trackerId >= 0) {
        dispatch(
          issueActions.getMaterialsDimByTracker({
            trackerId,
            params: { ...search, type: 1, pageSize: 50, paging: false },
          }),
        );
        dispatch(
          issueActions.getMachinerysDimByTracker({
            trackerId,
            params: { ...search, type: 1, pageSize: 50, paging: false },
          }),
        );
      }
    }
  };

  const getDataFromTonkho = () => {
    const data: VatTuMayMocDTO[] = [];
    if (Array.isArray(DanhSachVatTu)) { // Kiểm tra nếu DanhSachVatTu là một mảng
      DanhSachVatTu.forEach((product) => {
        const tonKhoItem = Tonkho?.find((m: TonKhoDTO) => m.ma_vt === product.ma_vt);
        const kldinhmucitem = Kldinhmuc?.find((m: TonKhoDTO) => m.ma_vt === product.ma_vt);
        const dk =
          (type === eTypeVatTuMayMoc.VatTuChinh && product.productType === eTypeVatTu.VatTuChinh) ||
          (type === eTypeVatTuMayMoc.VatTuPhu && product.productType === eTypeVatTu.VatTuPhu);
        if (dk) {
          const kldinhmuc = parseFloat(kldinhmucitem ? kldinhmucitem.luong_xuat.toString() : '0');
          const tongdacap = parseFloat(tonKhoItem ? tonKhoItem.luong_xuat.toString() : '0');
          const dexuat = (kldinhmuc - tongdacap).toString();

          data.push({
            key: product.id,
            id: product.id,
            ma: product.ma_vt,
            name: product.ten_vt,
            unitOfMeasure: product.dvt,
            kldinhmuc: kldinhmuc.toString(),
            tongdacap: tongdacap.toString(),
            dexuat: dexuat,
            tonkho: tonKhoItem ? tonKhoItem.luong_ton.toString() : '0',
            checkbox: false,
          });
        }
      });
    }
    setDataSource(data);
    setOriginalDataSource(data);
  };

  const getDataFromTonkhoMayMoc = () => {
    const data: VatTuMayMocDTO[] = [];
    if (Array.isArray(DanhSachMayMoc)) { // Kiểm tra nếu DanhSachMayMoc là một mảng
      DanhSachMayMoc.forEach((danhSachMayMoc) => {
        const tonKhoItem = Tonkho?.find((m: TonKhoDTO) => m.ma_vt === danhSachMayMoc.ma_vt);
        data.push({
          key: danhSachMayMoc.id,
          id: danhSachMayMoc.id,
          ma: danhSachMayMoc.ma_vt,
          name: danhSachMayMoc.ten_vt,
          unitOfMeasure: danhSachMayMoc.dvt,
          soluonghienco: tonKhoItem ? tonKhoItem.luong_ton.toString() : '0', // Hiển thị tồn kho hoặc 0 nếu không có
          vitri: '',
          checkbox: false,
        });
      });
    }
    setDataSource(data);
    setOriginalDataSource(data);
  };
  useEffect(() => {

    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
      case eTypeVatTuMayMoc.VatTuPhu:
        getDataFromTonkho(); // Gọi hàm mới để lấy dữ liệu
        break;
      case eTypeVatTuMayMoc.MayMoc:
        getDataFromTonkhoMayMoc();
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, Tonkho, type]);

  const handelData = (setDataSource: any, checked: boolean, key?: string | number) => {
    setDataSource((prevDataSource: any) => {
      const newDataSource = [...prevDataSource];
      for (let i = 0; i < newDataSource.length; i++) {
        if (key) {
          if (newDataSource[i].key === key) {
            newDataSource[i].checkbox = checked;
          }
        } else newDataSource[i].checkbox = checked;
      }
      return newDataSource;
    });
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
      case eTypeVatTuMayMoc.VatTuPhu:
        handelData(setDataSource, checked);
        break;
      case eTypeVatTuMayMoc.MayMoc:
        handelData(setDataSource, checked);
        break;
    }
  };

  const handleCheckboxChange = (key: string | number, checked: boolean) => {
    switch (type) {
      case eTypeVatTuMayMoc.VatTuChinh:
      case eTypeVatTuMayMoc.VatTuPhu:
        handelData(setDataSource, checked, key);
        break;
      case eTypeVatTuMayMoc.MayMoc:
        handelData(setDataSource, checked, key);
        break;
    }
  };

  const rowClassName = (record: VatTuMayMocDTO | VatTuMayMocDTO) =>
    classnames({ [styles.selectedRow]: record.checkbox });

  //#region columnsVatu
  const columnsVatu: ColumnType<VatTuMayMocDTO>[] = [
    {
      title: <span className={styles.tableHeader}>{t('Material code')}</span>,
      dataIndex: 'ma',
      key: 'ma',
      width: 100,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thep1', 'Thep2', 'Thep10', 'Thep12'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
    },
    {
      title: (
        <span className={styles.tableHeader}>
          {type === eTypeVatTuMayMoc.VatTuChinh ? t('Main material name') : t('Name of auxiliary material')}
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit')}</span>,
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Standard Volume')}</span>,
      dataIndex: 'kldinhmuc',
      key: 'kldinhmuc',
      width: 100,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Total issued')}</span>,
      dataIndex: 'tongdacap',
      key: 'tongdacap',
      width: 100,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Also recommended')}</span>,
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 100,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Actual inventory')}</span>,
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 100,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  //#region columnsMayMoc
  const columnsMayMoc: ColumnType<VatTuMayMocDTO>[] = [
    {
      title: <span className={styles.tableHeader}>{t('Material code')}</span>,
      dataIndex: 'ma',
      key: 'ma',
      width: 142,
      className: styles.tablecell,
      render: (text: string) => (
        <span className={['BT01', 'Thep1', 'Thep2', 'Thep10', 'Thep12'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      // align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Machine name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 520,
      className: styles.tablecell,
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit')}</span>,
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Quantity available')}</span>,
      dataIndex: 'soluonghienco',
      key: 'soluonghienco',
      width: 168,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Current position')}</span>,
      dataIndex: 'vitri',
      key: 'vitri',
      width: 155,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...paramsMaterial, page: current };
    getMaterialsData(search);
  };

  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total });

  useEffect(() => {
    if (searchText) {
      // Nếu có searchText thì lọc từ originalDataSource
      const filteredData = originalDataSource.filter(item => {
        const searchLower = searchText.toLowerCase();
        return item.ma?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower);
      });
      setDataSource(filteredData);
    } else {
      // Nếu searchText rỗng thì khôi phức lại dữ liệu gốc
      setDataSource(originalDataSource);
    }
  }, [searchText, originalDataSource]);

  return (
    <div className="MaterialList">
      <header className="MaterialList-header">
        {dataSource.length === 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 150px)',
              backgroundColor: 'white',
              margin: 10,
            }}
          >
            <Empty
              description={
                <>
                  <Typography.Title level={4}>{t('No data found based on filtering criteria')}</Typography.Title>
                </>
              }
            />
          </div>
        )}
        {dataSource && dataSource.length > 0 && (
          <Table
            dataSource={dataSource}
            rowKey={r => r.ma}
            columns={type === eTypeVatTuMayMoc.MayMoc ? columnsMayMoc : columnsVatu}
            bordered
            size="middle"
            style={{ width: '100%', height: '75vh', marginTop: -5 }}
            rowClassName={rowClassName}
            scroll={{ x: '100%', y: windowSize[1] * 0.7 }}
            pagination={false}
            loading={isLoading || isLoadingTonKho}
            onChange={handleTableChange}
          />
        )}
      </header>
    </div>
  );
};

export default MachineryMaterialsList;
