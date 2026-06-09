/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { CreateUpdateEmployeeModalName } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { getActiveMenu, getCurrentCompany } from '@/store/app';
import { employeeActions, getEmployeeQueryParams } from '@/store/employee';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showModal } from '@/store/modal';
import styles from './components.module.less';

export const CompanyEmployeeHeader = () => {
  const { t } = useTranslation('employee');
  const dispatch = useAppDispatch();
  const params = useAppSelector(getEmployeeQueryParams());
  const company = useAppSelector(getCurrentCompany());
  const [timer, setTimer] = useState<any>(null);
  const [searchStr, setSearchStr] = useState(params?.search);
  const activeMenu = useAppSelector(getActiveMenu());
  useEffect(() => {
    setSearchStr(params?.search);
  }, [params]);

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      dispatch(employeeActions.getEmployeesRequest({ companyId: company.id, params: { ...params, page: 1, search, pageSize: 10000 } }));
    }, 500);
    setTimer(timeoutId);
  };

  const createEmployee = () => {
    dispatch(showModal({ key: CreateUpdateEmployeeModalName }));
  };

  return (
    <div className={styles.functionContainer}>
      <Row align="stretch" style={{ padding: 10 }}>
      <Typography.Title style={{ flex: 1, marginTop: 5 }} level={4}>
          {activeMenu?.label}
        </Typography.Title>
      </Row>
      <div style={{ paddingTop: 12, paddingRight: 5 }}>
        <Input
          placeholder={t('companyEmployee.findEmployee')}
          allowClear
          value={searchStr}
          onChange={onSearchChange}
          style={{ width: 260, marginRight: 10 }}
          suffix={searchStr ? null : <SearchOutlined />}
        />
        <WithPermission strategy="disable" policyKeys={['CongTy.NhanSu.Create']}>
          <Button type="primary" shape="round" icon={<PlusOutlined />} size={'middle'} onClick={createEmployee}>
            {t('companyEmployee.addEmployee')}
          </Button>
        </WithPermission>
      </div>
    </div>
  );
};
