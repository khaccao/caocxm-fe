/* eslint-disable import/order */
import { ProjectResponse } from '@/common/project';
import { useAppSelector } from '@/store/hooks';
import { NewsCategoryCode, getNewsByCode } from '@/store/news';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from '../index.module.less';

type Props = {
  img: string;
  onClick?: () => void;
  title: string;
  project: ProjectResponse;
};

export const ServiceCard = ({ img, onClick, title, project }: Props) => {
  const navigate = useNavigate();
  const newsList = useAppSelector(getNewsByCode(NewsCategoryCode.BANGTIN_CONGTRINH));
  const filteredLatestNewsList = newsList.filter(news => {
    return [2].includes(news.status);
  });
  const viewDetail = () => {
    const news = filteredLatestNewsList.find((news) => news.projectId === project?.id);
    if (news) {
      navigate(`/dashboard/news/${news.id}`);
    } else {
      notification.warning({
        message: 'Chưa có tin tức',
        description: 'Tin tức của công trình chưa được xuất bản',
      });
    }
  };  
  return (
    // eslint-disable-next-line
    <div className={styles.serviceCard} onClick={viewDetail}>
      <div className={styles.serviceImg}>
        <img src={img} alt={title} />
      </div>
      <div className={styles.serviceTitle}>
        <h4 className="">{title}</h4>
      </div>
    </div>
  );
};
