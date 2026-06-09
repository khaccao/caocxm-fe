import { useEffect, useState } from 'react';

import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

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
export const MiniNewsCard = ({ news, style, loading }: Props) => {
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

  return loading ? (
    <div>
      <Skeleton.Image active />
      <Skeleton active />
    </div>
  ) : (
    <Link to={`/dashboard/news/${news?.id}`}>
      <div className={styles.cardNewsMini} style={style}>
        <div className={styles.cardImg}>
          <img src={imgSrc || DefaultImg} alt={news?.subject} onError={onImageError} />
        </div>
        <div className={styles.wrapper}>
          <div>
            {news?.subject && (
              <div className="text-dark">
                <span className={styles.cardTitle}>{news?.subject}</span>
              </div>
            )}
            {news?.description && <div className={styles.cardDesc}>{news.description}</div>}
          </div>
          <div className={styles.extraInfor}>
            {news?.createdDate && (
              <div>
                <ClockCircleOutlined /> {dayjs(news.createdDate).format(dateFormat)}{' '}
              </div>
            )}
            {news?.senderName && (
              <div>
                <UserOutlined /> {news.senderName}{' '}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
