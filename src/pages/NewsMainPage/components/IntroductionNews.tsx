/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { getEnvVars } from '@/environment';
import DefaultImg from '@/image/news-default-img.png';
import { MessageResponse } from '@/services/MesageAPI/MessageService';
import { getCurrentCompany } from '@/store/app';
import { useAppSelector } from '@/store/hooks';
import styles from '../index.module.less';

interface IntroductionNewsProps {
  news: MessageResponse;
}

const { apiUrl } = getEnvVars();
export const IntroductionNews = ({ news }: IntroductionNewsProps) => {
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

  const navigateprofile = () => {
    navigate('/capability-profile');
  }
  return (
    <div className={styles.introductionNews}>
      <div className={styles.imgContainer}>
        <button 
          className={styles.imageButton}
          onClick={navigateprofile}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigateprofile();
            }
          }}
        >
          <img 
            src={imgSrc || DefaultImg}
            alt={news?.subject} 
            onError={onImageError} 
          />
        </button>
      </div>
      <div className={styles.inforWrapper}>
        <div
          className={styles.desc}
          dangerouslySetInnerHTML={{
            __html: news.content || '',
          }}
        ></div>
        <div>
          <Button type="primary" size="large" onClick={viewDetail}>
            Xem thêm
          </Button>
        </div>
      </div>
    </div>
  );
};