import { useEffect, useState } from 'react';

import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import styles from '../index.module.less';
import { dateFormat } from '@/common/define';
import { getEnvVars } from '@/environment';
import DefaultImg from '@/image/news-default-img.png';
import { MessageResponse } from '@/services/MesageAPI/MessageService';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

type Props = {
  news?: MessageResponse;
  style?: React.CSSProperties;
  loading?: boolean;
};

const { apiUrl } = getEnvVars();
export const NewsCard = ({ news, style, loading }: Props) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(DefaultImg);
  const company = useAppSelector(getCurrentCompany());

  useEffect(() => {
    if (!news?.attachmentLinkReadDTOs?.length || !company) {
      setImgSrc('');
      return;
    }
    const drawingSrc = `${apiUrl}/Document/downloadFile/${news.attachmentLinkReadDTOs[0].drawingId}?companyId=${company.id}`;
    setImgSrc(drawingSrc);
  }, [news, company]);

  const onImageError = () => {
    setImgSrc('');
    return true;
  };

  const viewDetail = () => {
    navigate(`/dashboard/news/${news?.id}`);
  };

  return (
    <div className={styles.cardNews} style={style}>
      {loading ? (
        <>
          <Skeleton.Image active />
          <Skeleton active />
        </>
      ) : (
        // eslint-disable-next-line
        <div onClick={viewDetail}>
          <div className={styles.cardImg}>
            <img src={imgSrc || DefaultImg} alt={news?.subject} onError={onImageError} />
          </div>
          <div className={styles.inforWrapper}>
            <div style={{ display: 'flex', gap: '.5rem', fontSize: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {news?.createdDate && (
                <div
                  style={{
                    display: 'flex',
                    gap: '.3rem',
                    color: 'black',
                  }}
                >
                  <CalendarOutlined /> {dayjs(news.createdDate).format(dateFormat)}{' '}
                </div>
              )}
              {news?.senderName && (
                <div
                  style={{
                    display: 'flex',
                    gap: '.3rem',
                    color: 'black',
                  }}
                >
                  <UserOutlined /> {news.senderName}{' '}
                </div>
              )}
            </div>
            <div>
              {news?.subject && <h5 className={styles.cardTitle}>{news?.subject}</h5>}
              {news?.description && <div className={styles.cardDesc}>{news.description}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
