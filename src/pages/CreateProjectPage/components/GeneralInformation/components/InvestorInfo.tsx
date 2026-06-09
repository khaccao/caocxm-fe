import React, { ReactNode, useEffect } from 'react';

import { Form, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './components.module.less';

type GeneralInfoProps = {
  AdditionComponent?: ReactNode;
  investorInfo?: {
    investorName?: string;
    investorPhone?: string;
    investorEmail?: string;
  };
};

export const InvestorInfo = (props: GeneralInfoProps) => {
  const { AdditionComponent, investorInfo } = props;
  const { t } = useTranslation(['projects']);
  const [form] = Form.useForm();

  useEffect(() => {
    if (investorInfo && Object.keys(investorInfo).length > 0) {
      form.setFieldsValue(investorInfo);
    } else {
      // Đặt lại form khi investorInfo là đối tượng rỗng
      form.resetFields();
    }
  }, [investorInfo, form]);

  return (
    <>
      <div className={styles.mainContainer}>
        <Typography.Text style={{ fontWeight: '700', fontSize: '18px', marginBottom: '10px' }}>
          {t('createProject.investorInfo.title')}
        </Typography.Text>
        <Form.Item
          name="investorName"
          label={<Typography.Text strong>{t('createProject.investorInfo.investorName')}</Typography.Text>}
          rules={[{ required: true, message: t('createProject.investorInfo.requireInvestorName') }]}
        >
          <Input placeholder={t('createProject.investorInfo.investorNamePlaceholder')} />
        </Form.Item>
        <Form.Item
          name="investorPhone"
          label={<Typography.Text strong>{t('createProject.investorInfo.investorPhone')}</Typography.Text>}
          rules={[{ message: t('createProject.investorInfo.requireInvestorPhone') }]}
        >
          <Input placeholder={t('createProject.investorInfo.investorPhonePlaceholder')} />
        </Form.Item>
        <Form.Item
          name="investorEmail"
          label={<Typography.Text strong>{t('createProject.investorInfo.investorEmail')}</Typography.Text>}
          rules={[
            { message: t('createProject.investorInfo.requireInvestorEmail') },
            {
              type: 'email',
              message: t('createProject.investorInfo.emailNotValid'),
            },
          ]}
        >
          <Input placeholder={t('createProject.investorInfo.investorEmailPlaceholder')} />
        </Form.Item>
        {AdditionComponent}
      </div>
    </>
  );
};
