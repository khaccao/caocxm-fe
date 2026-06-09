/* eslint-disable import/order */
import { useEffect } from 'react';


import { CreateUpdateEmployeeModalName } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getModalVisible } from '@/store/modal';
import styles from './CompanyEmployee.module.less';
import { CompanyEmployeeHeader, CompanyEmployeeTable, CreateUpdateEmployeeModal } from './components';

export const CompanyEmployee = () => {
  const dispatch = useAppDispatch();

  const isOpenCreateUpdateEmployeeModal = useAppSelector(getModalVisible(CreateUpdateEmployeeModalName));
  const company = useAppSelector(getCurrentCompany());
  const params = useAppSelector(getEmployeeQueryParams());

  useEffect(() => {
    dispatch(
      employeeActions.getEmployeesRequest({ companyId: company.id, params: { ...params, page: 1, search: undefined, pageSize: 10000 } }),
    );
    // eslint-disable-next-line
  }, [company]);

  return (
    <div className={styles.mainContainer}>  
      <CompanyEmployeeHeader />
      <CompanyEmployeeTable />
      {isOpenCreateUpdateEmployeeModal && <CreateUpdateEmployeeModal />}
    </div>
  );
};
