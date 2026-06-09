import React from 'react';

import { Card, Col, Typography } from 'antd';

import styles from './components.module.less';
import ProjectBg from '@/image/icon/project.png';

type OrganizationCardProps = {
  org: any;
  handleSelectOrg: (org: any) => void;
};

const { Meta } = Card;

export const OrganizationCard = (props: OrganizationCardProps) => {
  const { org, handleSelectOrg } = props;

  return (
    <Col span={24}>
      <Card className={styles.orgCardConatiner} onClick={() => handleSelectOrg(org)}>
        <Meta
          description={
            <div className={styles.descriptionsConatainer}>
              <div className={styles.imgContainer}>
                <img src={ProjectBg} alt="Project" />
              </div>
              <div className={styles.orgInfoContainer}>
                <Typography.Text>{org.companyName}</Typography.Text>
                <Typography.Text>{org.billingCity}</Typography.Text>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );
};
