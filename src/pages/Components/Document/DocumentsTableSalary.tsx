/* eslint-disable import/order */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { Input, InputNumber, notification, PaginationProps, Select, Table, TableProps, Typography } from 'antd'; // or the appropriate library
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import {
  BCHcode,
  documentProject,
  DocumentsTableSalaryRef,
  eKyLuong,
  eSalaryType,
  FormatDateAPI,
  iSalary,
  PagingResponse,
  SalaryPayload
} from '@/common/define';
import { usePermission } from '@/hooks';
import { FaceCheckService } from '@/services/CheckInService';
import { getCurrentCompany } from '@/store/app';
import { documentActions, getSelectedRowKeys } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllMembersToGroup, issueActions } from '@/store/issue';
import { getLoading } from '@/store/loading';
import { getEmployeesByCompanyId, projectActions } from '@/store/project';
import { getOnSave, getSalarys, getSearchStr, getThangNam, salaryActions } from '@/store/salary';
import Utils from '@/utils';
import styles from './DocumentsTableSalary.module.css';
enum eDataFieldName {
  STT,
  MaNV,
  TenNV,
  ADPhatLuong,
  TienUngNgay,
  TongCong,
  KyNhan,
  totalShifts,
  paymentType,
}
interface DocumentsTableProps {
  policies?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
  Type: eSalaryType;
  KyLuong: eKyLuong;
}
let dataModifying: {
  [key: string]: iSalary;
} = {};

export const DocumentsTableSalary = forwardRef<DocumentsTableSalaryRef, DocumentsTableProps>((props, ref) => {
  const { KyLuong, policies } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['document', 'common', 'table']);
  const tTable = useTranslation(['table']).t;
  const employeesByCompanyId = useAppSelector(getEmployeesByCompanyId());
  const company = useAppSelector(getCurrentCompany());
  const salarys = useAppSelector(getSalarys());
  const ThangNam = useAppSelector(getThangNam());
  const SearchStr = useAppSelector(getSearchStr());
  const onSave = useAppSelector(getOnSave());
  const [Documents, setDocuments] = useState<iSalary[]>([]);
  const [DaySelected, setDaySelected] = useState<Dayjs>(ThangNam);
  const [dateTitle, setDateTitle] = useState<string>('');
  // [14/01/2025][#21283][phuong_td] Giá trị cột tổng cộng
  const [SummaryTotal, setSummaryTotal] = useState(0);
  const AllMemberToGroup = useAppSelector(getAllMembersToGroup());
  const salaryPeriodDate = KyLuong === eKyLuong.Ky1 ? {
    startDate: ThangNam.startOf('month').format('YYYY-MM-DD'), // Ngày 1 đầu tháng
    endDate: ThangNam.date(15).format('YYYY-MM-DD'), // Ngày 15
  }
    : {
      startDate: ThangNam.date(16).format('YYYY-MM-DD'), // Ngày 16
      endDate: ThangNam.endOf('month').format('YYYY-MM-DD'), // Ngày cuối tháng
    };
  useEffect(() => {
    const title = KyLuong === eKyLuong.Ky1 ? `12/${ThangNam.month() + 1}/${ThangNam.year()}` : `27/${ThangNam.month() + 1}/${ThangNam.year()}`;
    setDateTitle(title);
    const date = KyLuong === eKyLuong.Ky1 ? ThangNam.set('date', 1) : ThangNam.set('date', 16);
    setDaySelected(date);
    dispatch(issueActions.getMembersToGroup({ code: BCHcode.BCHcode }));
    // updateSalaryAdvance();
  }, [KyLuong, ThangNam]);
  const modifyData = (v: iSalary, type: eDataFieldName, data: any) => {
    // [14/01/2025][#21283][phuong_td] Sửa giá trị để tránh NaN
    const valNum = data ? Utils.getNumber(data) : 0;
    switch (type) {
      case eDataFieldName.ADPhatLuong:
        let ADPhatLuong = 0;
        if (typeof data === 'string') {
          ADPhatLuong = valNum;
        }
        v.ADPhatLuong = ADPhatLuong;
        break;
      case eDataFieldName.TienUngNgay:
        let TienUngNgay = 0;
        if (typeof data === 'string') {
          TienUngNgay = valNum;
        }
        v.TienUngNgay = TienUngNgay;
        break;
      case eDataFieldName.paymentType:
        v.paymentType = data;
        break;
      case eDataFieldName.KyNhan:
        if (typeof data === 'string') {
          v.KyNhan = data;
        }
        break;
      default:
        break;
    }
    v.TongCong = v.ADPhatLuong + v.TienUngNgay;
    dataModifying = {
      ...dataModifying,
      [v.MaNV]: { ...v },
    };
    return v;
  };
  const updateData = (data: number | string, type: eDataFieldName, key: string) => {
    setDocuments(prevData => prevData.map(row => (row.MaNV === key ? modifyData(row, type, data) : row)));
  };
  // [14/01/2025][#21283][phuong_td] tính Giá trị cột tổng cộng
  useEffect(() => {
    let sum = 0;
    Documents.forEach((d) => sum += d.TongCong);
    setSummaryTotal(sum);
  }, [Documents]);

  useEffect(() => {
    if (company) {
      dispatch(projectActions.getEmployeesByCompanyIdRequest(company.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);
  useEffect(() => {
    dispatch(salaryActions.getSalarysRequest({ dateTime: DaySelected.format(FormatDateAPI), period: KyLuong }));
  }, [DaySelected]);
  const renderInputNumber = (_text: any, record: iSalary, type: eDataFieldName) => {
    return (
      <InputNumber<number>
        type='n'
        className={styles.newRow}
        formatter={value => {
          // Đảm bảo giá trị không phải là undefined hoặc null
          if (!value) return '0';
          // Chia giá trị thành số và định dạng
          const numValue = Number(value.toString().replace(/,/g, '')); // Loại bỏ dấu phẩy trước
          return `${numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Định dạng số và thêm dấu `$`
        }}
        value={_text}
        onChange={(v: string | number | null) => {
          const rawValue = v ? v.toString().replace(/,/g, '') : ''; // Loại bỏ dấu phẩy khi thay đổi giá trị
          updateData(rawValue, type, record.MaNV);
        }}
      />
    );
  };
  const renderInput = (_text: any, record: iSalary, type: eDataFieldName) => {
    return (
      <Input
        className={styles.newRow}
        value={record.KyNhan}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value: inputValue } = e.target;
          updateData(inputValue, eDataFieldName.KyNhan, record.MaNV);
        }}
      />
    );
  };
  const Colums: TableProps<iSalary>['columns'] = [
    {
      dataIndex: 'STT',
      title: tTable('STT'),
      key: 'STT',
      width: 40,
      align: 'center',
      render: (value, record) => {
        return <>{value}</>;
      },
    },
    {
      dataIndex: 'MaNV',
      title: tTable('MaNV'),
      key: 'MaNV',
      width: 100,
      align: 'center',
      render: (value, record) => {
        return <>{value}</>;
      },
    },
    {
      dataIndex: 'TenNV',
      title: tTable('TenNV'),
      key: 'TenNV',
      width: 200,
      align: 'center',
      render: (value, record) => {
        return <>{value}</>;
      },
    },
    {
      dataIndex: 'totalShifts',
      title: 'Tổng công',
      key: 'totalShifts',
      width: 70,
      align: 'center',
      render: (value) => {
        if (typeof value === 'number') {
          const decimalPart = value.toString().split('.')[1]; // Lấy phần thập phân
          if (decimalPart && decimalPart.length > 3) {
            return value.toFixed(3); // Làm tròn nếu có nhiều hơn 3 chữ số thập phân
          }
          return value.toString(); // Giữ nguyên nếu có tối đa 3 chữ số thập phân hoặc không có phần thập phân
        }
        return value.toString();
      },
    },
    {
      dataIndex: 'ADPhatLuong',
      title: tTable('Negative positive salary'),
      key: 'ADPhatLuong',
      width: 100,
      align: 'center',
      render: (value, record) => renderInputNumber(value, record, eDataFieldName.ADPhatLuong),
    },
    {
      dataIndex: 'TienUngNgay',
      title: tTable('Daily advance') + ' ' + dateTitle,
      key: 'TienUngNgay',
      width: 100,
      align: 'center',
      render: (value, record) => renderInputNumber(value, record, eDataFieldName.TienUngNgay),
    },
    {
      title: tTable('PaymentMethod'),
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 90,
      align: 'center',
      render: (value: EPaymentMethod, record: iSalary) => (
        <Select
          value={value}
          style={{ width: '100%' }}
          options={paymentOptions}
          onChange={(newValue) => {
            updateData(newValue, eDataFieldName.paymentType, record.MaNV);
          }}
        />
      ),
    },
    {
      dataIndex: 'KyNhan',
      title: tTable('Sign'),
      key: 'KyNhan',
      width: 80,
      align: 'center',
      render: (value, record) => renderInput(value, record, eDataFieldName.KyNhan),
    },
  ];

  const params: PagingResponse = {
    page: 0,
    pageCount: 0,
    pageSize: 0,
    queryCount: 0,
    firstRowIndex: 0,
    lastRowIndex: 0,
  };
  // eslint-disable-next-line
  const createGranted = usePermission(policies?.create);
  const deleteGranted = usePermission(policies?.delete);
  const isLoading = useAppSelector(getLoading(documentProject.GettingDocumentList));
  const showTotal: PaginationProps['showTotal'] = (total, range) =>
    t('Paging total', { range1: range[0], range2: range[1], total, ns: 'common' });
  const [paginationManager, setPaginationManager] = useState<PaginationProps>();
  const selectedRowKeys = useAppSelector(getSelectedRowKeys());

  useEffect(() => {
    const data: SalaryPayload[] = Object.entries(dataModifying).map((d: [string, iSalary]) => ({
      employeeCode: d[1].MaNV,
      employeeName: d[1].TenNV,
      companyId: company.id,
      period: KyLuong,
      total: d[1].TongCong,
      signature: d[1].KyNhan,
      dateTime: DaySelected.format(FormatDateAPI), // 2025-01-10T13:29:07.831Z,
      status: 0,
      money: d[1].TienUngNgay,
      salaryBalance: d[1].ADPhatLuong,
      paymentType: d[1].paymentType,
    }));
    // [13/01/2025][#21283][phuong_td] điều chỉnh xử lý khi lưu ứng lương
    // console.log('onSave', onSave, dataModifying, data);
    if (onSave) {
      if (data.length) {
        dispatch(salaryActions.updateSalarysRequest({ companyId: company.id, dateTime: DaySelected.format(FormatDateAPI), data }));
      } else {
        // [12/12/2024][#21146][phuong_td] thông báo nếu không có data cần lưu
        notification.warning({
          message: i18next.t('notification'),
          description: i18next.t('There is no data to save'),
        });
      }
      dataModifying = {};
    }
    dispatch(salaryActions.setOnSave(undefined));
  }, [onSave]);


  useEffect(() => {
    const updateSalaryAdvance = async () => {
      const res = await FaceCheckService.Get.updateSalaryAdvance(company.id, salaryPeriodDate.startDate, salaryPeriodDate.endDate).toPromise();
      try {
        const totalShiftsData = Object.keys(res).map(MaNV => {
          const employees = res[MaNV];
          const totalShifts = employees.reduce(
            (sum: any, item: { totalApprovedMainShift: any; totalApprovedOTShift: any; }) =>
              sum + item.totalApprovedMainShift + item.totalApprovedOTShift * 1.5,
            0
          );
          return { MaNV, totalShifts };
        });
        const MemberOfBCH = AllMemberToGroup?.results || [];
        const data: iSalary[] = [...employeesByCompanyId].sort((a, b) => {
          const NameA = a.firstName.toLowerCase().trim();
          const NameB = b.firstName.toLowerCase().trim();
          const isBCH_A = MemberOfBCH.find((m: any) => m.employeeCode === a.employeeCode);
          const isBCH_B = MemberOfBCH.find((m: any) => m.employeeCode === b.employeeCode);
          if ((!isBCH_A && !isBCH_B) || (isBCH_A && isBCH_B)) return NameA.localeCompare(NameB);
          if (isBCH_A && !isBCH_B) return 1;
          if (!isBCH_A && isBCH_B) return -1;
          return NameA.localeCompare(NameB);
        }).map((e, i) => {
          const salary = salarys.find(s => s.employeeCode === e.employeeCode);
          const ten = salary ? salary.employeeName : '';
          return {
            STT: (i += 1),
            MaNV: e.employeeCode,
            TenNV: ten || `${Utils.getFullName(e)}`,
            ADPhatLuong: salary ? salary.salaryBalance : 0,
            TienUngNgay: salary ? salary.money : 0,
            TongCong: salary ? salary.total : 0,
            KyNhan: salary ? salary.signature : '',
            totalShifts: totalShiftsData.find(d => d.MaNV === e.employeeCode)?.totalShifts / (8 * 60) || 0,
            paymentType: salary ? salary.paymentType : 0,
          };
        });
        setDocuments(data);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    };

    // const updateDocuments = async () => {
    //   await updateSalaryAdvance();
    //   console.log(totalShifts, 'update');
    //   const MemberOfBCH = AllMemberToGroup?.results || [];
    //   const data: iSalary[] = [...employeesByCompanyId].sort((a, b) => {
    //     const NameA = a.firstName.toLowerCase().trim();
    //     const NameB = b.firstName.toLowerCase().trim();
    //     const isBCH_A = MemberOfBCH.find((m: any) => m.employeeCode === a.employeeCode);
    //     const isBCH_B = MemberOfBCH.find((m: any) => m.employeeCode === b.employeeCode);
    //     if ((!isBCH_A && !isBCH_B) || (isBCH_A && isBCH_B)) return NameA.localeCompare(NameB);
    //     if (isBCH_A && !isBCH_B) return 1;
    //     if (!isBCH_A && isBCH_B) return -1;
    //     return NameA.localeCompare(NameB);
    //   }).map((e, i) => {
    //     const salary = salarys.find(s => s.employeeCode === e.employeeCode);
    //     const ten = salary ? salary.employeeName : '';
    //     return {
    //       STT: (i += 1),
    //       MaNV: e.employeeCode,
    //       TenNV: ten || `${Utils.getFullName(e)}`,
    //       ADPhatLuong: salary ? salary.salaryBalance : 0,
    //       TienUngNgay: salary ? salary.money : 0,
    //       TongCong: salary ? salary.total : 0,
    //       KyNhan: salary ? salary.signature : '',
    //       totalShifts: totalShifts.find(d => d.MaNV === e.employeeCode)?.totalShifts / (8 * 60) || 0,
    //     };
    //   });
    //   setDocuments(data);
    // };

    updateSalaryAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeesByCompanyId, salarys, AllMemberToGroup, KyLuong, ThangNam]);
  // [#20495][hao_lt][23/10/2024]_Tài liệu dự thầu - xóa tài liệu
  const handleRequestDocument = (newParams?: any) => {
    const search = {
      ...params,
      ...newParams,
    };
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows?: iSalary[]) => {
    dispatch(documentActions.setSelectedRowKeys(newSelectedRowKeys));
  };
  // eslint-disable-next-line
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 50,
  };
  const handleTableChange: TableProps<any>['onChange'] = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const search = { ...params, page: current, pageSize: pageSize };
    handleRequestDocument(search);
    setPaginationManager(pagination);
  };

  useImperativeHandle(ref, () => ({
    getRows: () => Documents,
  }));

  const filteredDocuments = useMemo(() => {
    return Documents.filter((f) =>
      SearchStr ? f.TenNV.toLowerCase().includes(SearchStr.toLowerCase()) : true
    ) || [];
  }, [Documents, SearchStr]);

  // [implement #22510]
  enum EPaymentMethod {
    Cash = 0,
    BankTransfer = 1,
  }

  const paymentOptions = [
    { label: 'Tiền mặt', value: EPaymentMethod.Cash },
    { label: 'Chuyển khoản', value: EPaymentMethod.BankTransfer },
  ];

  function getPaymentMethodLabel(value: EPaymentMethod | number | undefined): string {
    const found = paymentOptions.find(o => o.value === value);
    return found ? found.label : '';
  }

  return (
    <div style={{ position: 'relative', overflow: 'auto' }}>
      <Table
        rowKey={record => record.MaNV}
        // [14/01/2025][#21283][phuong_td] Điều chỉnh để tìm kiếm bất kể giá trị hoa thường 
        // dataSource={Documents.filter((f) => SearchStr ? f.TenNV.toLowerCase().includes(SearchStr.toLowerCase()) : true) || []}
        dataSource={filteredDocuments}
        columns={Colums}
        size="small"
        scroll={{ x: 800, y: 'calc(100vh - 210px)' }}
        // [14/01/2025][#21283][phuong_td] Bỏ phân trang
        // pagination={{
        //   pageSizeOptions: [20, 50, 100],
        //   defaultPageSize: 20,
        //   showSizeChanger: true,
        //   responsive: true,
        //   showTotal,
        // }}
        pagination={false}
        loading={isLoading}
        onChange={handleTableChange}
        expandable={{
          showExpandColumn: false,
        }}
      // [14/01/2025][#21283][phuong_td] Giá trị cột tổng cộng
      // summary={() => {
      //   return (
      //     <Table.Summary>
      //       <Table.Summary.Row>
      //         {Colums?.map((c: any, i) => {
      //           switch (c.dataIndex) {
      //             case 'TongCong': {
      //               return (
      //                 <Table.Summary.Cell index={i} key={c.key} colSpan={2}>
      //                   <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'start'}}><Typography.Title level={5}>{i18next.t('Grand Total')}: {Utils.formatNumber(SummaryTotal)}</Typography.Title> </div>
      //                 </Table.Summary.Cell>
      //               );
      //             }
      //             default:
      //               return <Table.Summary.Cell index={i} key={c.key}></Table.Summary.Cell>;
      //           }
      //         })}
      //       </Table.Summary.Row>
      //     </Table.Summary>
      //   );
      // }}
      />

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          padding: '8px 16px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Typography.Title level={5} style={{ margin: 0, fontWeight: "bold" }}>
          <span style={{ paddingLeft: 60 }}>{i18next.t('Tổng hợp lương')}:</span> 
          <span style={{ paddingLeft: 60 }}>{Utils.formatNumber(SummaryTotal)}</span>
        </Typography.Title>
      </div>
    </div>
  );
});
