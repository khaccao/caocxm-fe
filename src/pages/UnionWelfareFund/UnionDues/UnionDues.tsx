/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { Button, DatePicker, notification, Typography } from 'antd';
import dayjs from 'dayjs';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import { FeeTableEmployee, GettingEmployeeList, IEmployeeFee } from '@/common/define';
import { Loading } from '@/components';
import { eColumnsTpye, iColumnsConfig, TableCustom } from '@/components/TableCustom';
import { WithPermission } from '@/hocs/PermissionHOC';
import { EmployeeResponse } from '@/services/EmployeeService';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams, getEmployees, getFeeTableEmployees } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';
import styles from './UnionDues.module.css';

const { MonthPicker } = DatePicker;

export const UnionDues: React.FC = () => {
  const [data, setData] = useState<IEmployeeFee[]>([]);
  const { t } = useTranslation('material');
  const company = useAppSelector(getCurrentCompany());
  const params = useAppSelector(getEmployeeQueryParams());
  const employees = useAppSelector(getEmployees());
  const feeTable = useAppSelector(getFeeTableEmployees());
  const dispatch = useAppDispatch();
  const feeLoading = useAppSelector(getLoading(FeeTableEmployee));
  const employeeLoading = useAppSelector(getLoading(GettingEmployeeList));
  let DataModifine: { [key: string]: IEmployeeFee } = {};

  //[#20938][hoang_nm][25/11/2024] set trạng thái tháng hiện tại (dùng dayjs)
  const [month, setMonth] = useState<dayjs.Dayjs | null>(dayjs().startOf('month')); // [10/12/2024][#21146][phuong_td] Lấy ngày đầu tiên của tháng

  useEffect(() => {
    //[#20938][hoang_nm][25/11/2024] useEffect để dispatch action getFeeTableEmployeeRequest gọi API lấy bảng chi phí theo tháng đã chọn
    if (month && company?.id) {
      const startOfMonth = month.startOf('month');
      const endOfMonth = month.endOf('month');
      if (company && company.id) {
        // [10/12/2024][#21146][phuong_td] Lấy thông tin chi phí thì không phân trang nếu không sẽ thiếu dữ liệu cho phần nhân công 
        dispatch(
          employeeActions.getFeeTableEmployeeRequest({
            companyId: company.id,
            options: {
              search: {
                ...params,
                page: 1,
                paging: false,
                search: undefined,
                startDate: startOfMonth.format('YYYY-MM-DD'),
                endDate: endOfMonth.format('YYYY-MM-DD'),
              },
            },
          }),
        );
      }
    }
    //[#20938][hoang_nm][25/11/2024] dữ liệu thay đổi theo company và tháng
  }, [company, month]);

  useEffect(() => {
    //[#20938][hoang_nm][25/11/2024] lấy dữ liệu các employees
    if (employees && employees.results) {
      const mapData = employees.results.map((e, index) => {
        const item: IEmployeeFee = {
          companyId: e.companyId,
          employeeId: e.id,
          employeeCode: e.employeeCode,
          employeeName: getNameEmployee(e),
          createTime: month ? month.format('YYYY-MM-DD') : '',
          amount: 0,
          amountOrigin: 0, // [12/12/2024][#21146][phuong_td] lưu giá trị số tiền ban đầu
          index: index + 1,
        };
        return item;
      });

      //[#20938][hoang_nm][25/11/2024] Ghép dữ liệu bảng chi phí vào danh sách nhân viên
      const mapDataWithFee: IEmployeeFee[] = mapData?.map(d => {
        
        // [10/12/2024][#21146][phuong_td] Thay đổi cách lấy chi phí theo mã nhân công
        const item = feeTable?.find(f => f.employeeCode === d.employeeCode);
        if (item) {
          return {
            ...d,
            amountOrigin: item.amount, // [12/12/2024][#21146][phuong_td] lưu giá trị số tiền ban đầu
            amount: item.amount,
            id: item.id,
          };
        }
        
        // [10/12/2024][#21146][phuong_td] Giá trị mặc định nếu không có chi phí là 10000
        return {
          ...d,
          amountOrigin: 0, // [12/12/2024][#21146][phuong_td] lưu giá trị số tiền ban đầu bằng 0 nếu không có dữ liệu phí công đoàn
          amount: 10000
        };
      });
      //[#20938][hoang_nm][25/11/2024] Cập nhật lại dữ liệu sau khi ghép
      mapDataWithFee && setData(mapDataWithFee);
    }
    //[#20938][hoang_nm][25/11/2024] dữ liệu thay đổi theo nhân viên và tháng
  }, [employees, month, feeTable]);

  useEffect(() => {
    //[#20938][hoang_nm][25/11/2024] action get ds nhân viên
    if (month && company?.id) {
      const startMonth = month.startOf('month');
      const endMonth = month.endOf('month');
      dispatch(
        employeeActions.getEmployeesRequest({
          companyId: company.id,
          // options: {
          // [10/12/2024][#21146][phuong_td] Bỏ phân trang từ Backend, phân trang ở table
          params: {
            ...params,
            page: 1,
            pageSize: 10000,
            search: undefined,
            startDate: startMonth.format('YYYY-MM-DD'),
            endDate: endMonth.format('YYYY-MM-DD'),
          },
          // },
        }),
      );
    }
  }, [month, company]);

  //  [#20680][dung_lt][12/11/2024] lấy tên nhân viên
  const getNameEmployee = (e: EmployeeResponse) => {
    const lastName = e?.lastName ?? '';
    const middleName = e?.middleName ?? '';
    const firstName = e?.firstName ?? '';
    return `${lastName + ' ' + middleName + ' ' + firstName}`;
  };

  //  [#20680][dung_lt][12/11/2024] config cho cột của table
  const columnsConfig: { [key: string]: iColumnsConfig } = {
    index: {
      title: t('Numerical order'),
      width: 100,
      type: eColumnsTpye.text,
    },
    employeeCode: {
      title: t('Employee Code'),
      width: 200,
      type: eColumnsTpye.text,
    },
    employeeName: {
      title: t('Employee Name'),
      width: 400,
      type: eColumnsTpye.text,
    },
    amount: {
      title: t('amount of money'),
      width: 150,
      type: eColumnsTpye.inputNumber,
      formaterNumber: true,
    },
  };

  //  [#20680][dung_lt][12/11/2024] kiểm tra có sự thay đổi giá trị không
  const checkModified = (value: IEmployeeFee) => {
    const item = data.find(d => d.index === value.index);
    if (item) {
      return item.amount !== value.amount;
    }
    return false;
  };

  //  [#20680][dung_lt][12/11/2024] gửi bảng chi phí lên server

  const handleApply = () => {
    const newFee: IEmployeeFee[] = [];
    const updateFee: IEmployeeFee[] = [];
    // [10/12/2024][#21146][phuong_td] Điều chỉnh logic cho phép lưu bất cứ lúc nào
    const dataModifine = Object.values(DataModifine);
    data.forEach(d => {
      const data = dataModifine.find(a => a.employeeId === d.employeeId);
      const item: IEmployeeFee = {
        companyId: d.companyId,
        employeeId: d.employeeId,
        employeeCode: d.employeeCode,
        employeeName: d.employeeName,
        createTime: d.createTime ? d.createTime : dayjs().toString(),
        amountOrigin: d.amountOrigin,
        amount: data ? data.amount : d.amount,
      };
      // [12/12/2024][#21146][phuong_td] Nếu giá trị hiện tại và giá trị ban đầu khác nhau thì mới lưu
      if (item.amountOrigin !== item.amount) {
        if (d.id) {
          updateFee.push({
            ...item,
            id: d.id,
          });
        } else {
          newFee.push(item);
        }
      }
    });
    // [10/12/2024][#21146][phuong_td] Hợp nhất danh sách mới và danh sách cập nhật
    const update: IEmployeeFee[] = [...newFee, ...updateFee];
    if (month && update && update.length > 0) {
      const startMonth = month.startOf('month');
      const endMonth = month.endOf('month');
      //[#20938][hoang_nm][25/11/2024] update dữ liệu amount theo nvien và theo tháng
      dispatch(
        employeeActions.createFeeTableEmployeeRequest({
          companyId: company.id,
          datetime: month ? month.format('YYYY-MM-DD') : '', //theo từng tháng
          feeTable: update,
          options: {
            //[#20938][hoang_nm][25/11/2024] truyền thêm vào payload mặc định là đầu tháng và cuối tháng của month select
            search: {
              ...params,
              page: 1,
              // [10/12/2024][#21146][phuong_td] Bỏ phân trang từ Backend, phân trang ở table
              paging: false,
              search: undefined,
              startDate: startMonth.format('YYYY-MM-DD'),
              endDate: endMonth.format('YYYY-MM-DD'),
            },
          },
        })
      );

      // dispatch(employeeActions.createFeeTableEmployeeRequest({ feeTable: newFee, companyId: company.id }));
    } else {
      // [12/12/2024][#21146][phuong_td] thông báo nếu không có data cần lưu
      notification.warning({
        message: i18next.t('notification'),
        description: i18next.t('There is no data to save'),
      });
    }

    // [10/12/2024][#21146][phuong_td] Bỏ phần này chỉ gọi một lần ở phía trên
    // if (month && updateFee && updateFee.length > 0) {
    //   //[#20938][hoang_nm][25/11/2024] month mặc định là đầu tháng và cuối tháng
    //   const startMonth = month.startOf('month');
    //   const endMonth = month.endOf('month');
    //   console.log(updateFee);
    //   dispatch(
    //     employeeActions.createFeeTableEmployeeRequest({
    //       feeTable: updateFee,
    //       datetime: month ? month.format('YYYY-MM-DD') : '',
    //       companyId: company.id,
    //       options: {
    //         //[#20938][hoang_nm][25/11/2024] truyền thêm month
    //         search: {
    //           ...params,
    //           page: 1,
    //           search: undefined,
    //           startDate: startMonth.format('YYYY-MM-DD'),
    //           endDate: endMonth.format('YYYY-MM-DD'),
    //         },
    //       },
    //     })
    //   );
    //   // dispatch(employeeActions.updateFeeEmployeeByMonthRequest({
    //   //   companyId: company.id,
    //   //   datetime: month ? month.format('YYYY-MM-DD') : '',
    //   //   feeTable: updateFee
    //   // }));
    // }
    DataModifine = {};
  };

  // dispatch(employeeActions.updateFeeTableEmployeeRequest({ feeTable: updateFee }));

  return (
    <div className="MachineList">
      <div className={styles.tabheader}>
      <div className={styles.headerContent}>
        {/* <span className={styles.uniondues}>{t('union dues')}</span> */}
        <Typography.Title level={4}>
        {t('union dues')}
          </Typography.Title>
        </div>
        <div className="tab-header-diary">
          <MonthPicker
          style={{width:'100px'}}
            value={month}
            onChange={date => {
              if (date) {
                 // [10/12/2024][#21146][phuong_td] Lấy ngày đầu tiên của tháng
                setMonth(date.startOf('month'));
              } else {
                setMonth(null);
              }
            }}
            placeholder={t('Select Month')}
            // [10/12/2024][#21146][phuong_td] không cho phép xóa filter ngày
            allowClear={false}
          />
          <WithPermission policyKeys={['CongDoan.ThuPhiCD.SaveChanges']} strategy="disable">
            <Button style={{ marginRight: 10 }} type="primary" onClick={handleApply} className="apply-button">
              {t('Save changes')}
            </Button>
          </WithPermission>
        </div>
      </div>

      {(feeLoading || employeeLoading) && <Loading />}
      {!(feeLoading || employeeLoading) && (
        <div>
          <TableCustom
            dataSource={data}
            columnsConfig={columnsConfig}
            onChange={(value, type) => {
              if (checkModified(value)) {
                DataModifine = Utils.setDataModified(DataModifine, value.index, value, type);
              } else {
                if (value.index in DataModifine) {
                  delete DataModifine[value.index];
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UnionDues;
