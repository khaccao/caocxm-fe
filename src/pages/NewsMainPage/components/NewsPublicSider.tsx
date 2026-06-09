import React, { useEffect } from 'react';

import { Col, Empty, Row } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { MiniNewsCard } from './MiniNewsCard';
import styles from '../newsDetail.module.less';
import { apiDateParamsFormat } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { NewsCategoryCode, getNewsByCode, newsActions } from '@/store/news';

const cardStyle: React.CSSProperties = {
  margin: 0,
  height: '100%',
};

export const NewsPublicSider = () => {
  const { t } = useTranslation(['news']);
  const dispatch = useAppDispatch();

  const company = useAppSelector(getCurrentCompany());
  const latestNewsList = useAppSelector(getNewsByCode(NewsCategoryCode.BANGTIN_TINTUC));

  const filteredLatestNewsList = latestNewsList.filter(news => {
    return [2].includes(news.status);
  });

  useEffect(() => {
    if (company) {
      const searchParams = {
        paging: false,
        startDate: dayjs('01/01/1900').format(apiDateParamsFormat),
        endDate: dayjs('01/01/9000').endOf('days').format(apiDateParamsFormat),
      };
      dispatch(
        newsActions.getNewsByCodeRequest({
          code: NewsCategoryCode.BANGTIN_TINTUC,
          companyId: company.id,
          searchParams,
        }),
      );
    }
    // eslint-disable-next-line
  }, [company]);

  return (
    <div className={styles.newsSider}>
      <div>
        <p className={styles.title}>{t('Latest news', { ns: 'news' })}</p>
      </div>
      {!!filteredLatestNewsList?.length ? (
        <div>
          <Row gutter={[16, 16]}>
            {filteredLatestNewsList.slice(0, 10).map(news => (
              <Col span={24} key={news.id}>
                <MiniNewsCard style={cardStyle} news={news} />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Empty imageStyle={{ width: 138, height: 75, marginInline: 'auto' }} />
      )}
    </div>
  );
};
