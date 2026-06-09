import React, { useEffect, useState } from 'react';

import { ClockCircleOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Row, Col, Divider, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import { NewsPublicSider } from './components';
import { NewsFooter } from './components/NewsFooter';
import styles from './newsDetail.module.less';
import { dateFormat } from '@/common/define';
import { MessageResponse, MessageService } from '@/services/MesageAPI/MessageService';
import Utils from '@/utils';

export const NewsDetailPage = () => {
  let { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation(['news', 'common']);
  const [newsDetail, setNewsDetail] = useState<MessageResponse>();
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getMessageDetail = (id: string) => {
    setLoading(true);
    MessageService.Get.getMessageById(id).subscribe({
      next: response => {
        setNewsDetail(response);
        if (response) {
          MessageService.Get.getCountViews(id || '').subscribe({
            next: count => {
              setViewsCount(count);
            },
          });
        }
      },
      error: error => {
        Utils.errorHandling(error);
        setLoading(false);
      },
      complete: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    if (id) {
      getMessageDetail(id);
    }
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      if (newsDetail?.id) {
        MessageService.Post.updateView(newsDetail.id).subscribe({
          next: res => {},
          error: error => {
            console.error(error);
          },
        });
      }
    }, 3000); // sau 3 giây
  }, [newsDetail, location]);

  return (
    <div className={`${styles.container} custom_scrollbar`}>
      <Spin spinning={loading}>
        <div>
          <div className={styles.wrapper}>
            <Link to={'/dashboard'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              {t('Back', { ns: 'common' })}
            </Link>
            <Row gutter={[50, 10]}>
              <Col span={24} lg={14} xxl={16}>
                {newsDetail ? (
                  <div className={styles.newsDetail}>
                    <div>
                      <div className={styles.title}>{newsDetail.subject}</div>
                      <Divider style={{ marginBlock: 8 }} />
                      <div className={styles.extraInfor}>
                        <div>
                          <ClockCircleOutlined />
                          {dayjs(newsDetail.createdDate).format(dateFormat)}
                        </div>
                        <div>
                          <EyeOutlined />
                          {`${viewsCount} ${t('views')}`}
                        </div>
                      </div>
                    </div>
                    <div className="ck-content" dangerouslySetInnerHTML={{ __html: newsDetail.content || '' }} />
                  </div>
                ) : (
                  <div>Không tìm thấy nội dung</div>
                )}
              </Col>
              <Col span={24} lg={10} xxl={8}>
                <NewsPublicSider />
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
      <NewsFooter />
    </div>
  );
};
