/* eslint-disable import/order */
import { useEffect } from 'react';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
// Import Swiper React components
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { apiDateParamsFormat, breakpoints } from '@/common/define';
import { getEnvVars } from '@/environment';
import ProjectBg from '@/image/icon/project.png';
import HeroImg from '@/image/news-hero-section.png';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { NewsCategoryCode, getNewsByCode, newsActions } from '@/store/news';
import { getProjectList, projectActions } from '@/store/project';
import { IntroductionNews, NewsCard, SectionTitle, ServiceCard } from './components';
import { NewsFooter } from './components/NewsFooter';
import styles from './index.module.less';

const { apiUrl: hostUrl } = getEnvVars();
const MAX_NEWS_VISIBLE = 20;
const MAX_PROJECTS_VISIBLE = 10;
export const NewsPage = () => {
  const { t } = useTranslation(['news', 'layout']);
  const dispatch = useAppDispatch();

  const projectList = useAppSelector(getProjectList());
  const company = useAppSelector(getCurrentCompany());
  const newsList = useAppSelector(getNewsByCode(NewsCategoryCode.BANGTIN_TINTUC));
  const introductionsNews = useAppSelector(getNewsByCode(NewsCategoryCode.BANGTIN_GIOITHIEU));

  // status: 2 === 'Publised'
  const filteredNewsList = newsList.filter(news => {
    return [2].includes(news.status);
  });
  const filteredIntroductionNewsList = introductionsNews.filter(news => {
    return [2].includes(news.status);
  });

  useEffect(() => {
    if (company?.id) {
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
      dispatch(
        newsActions.getNewsByCodeRequest({
          code: NewsCategoryCode.BANGTIN_GIOITHIEU,
          companyId: company.id,
          searchParams,
        }),
      );
      dispatch(
        newsActions.getNewsByCodeRequest({
          code: NewsCategoryCode.BANGTIN_CONGTRINH,
          companyId: company.id,
          searchParams,
        }),
      );
      dispatch(projectActions.getProjectsByCompanyIdRequest(company.id));
    }
    // eslint-disable-next-line
  }, [company]);

  return (
    <div className={`${styles.container}`}>
      <div className={styles.topper}>
        <div>
          <span className={styles.title}>{t('Dashboard', { ns: 'layout' })}</span>
        </div>
      </div>
      <div className={`${styles.main} custom_scrollbar`}>
        <section className={styles.hero}>
          <div className={styles.heroImg}>
            <img src={HeroImg} alt="news hero section" />
          </div>
        </section>
        <section className={styles.news}>
          <div className={styles.titleContainer}>
            <SectionTitle title={t('News')} />
          </div>
          <div className={styles.newsSwiper}>
            <Swiper
              pagination={{
                clickable: true,
              }}
              navigation={true}
              breakpoints={{
                [breakpoints.xxl]: {
                  slidesPerView: 5,
                  spaceBetween: 30,
                },
                [breakpoints.xl]: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
                [breakpoints.lg]: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                [breakpoints.sm]: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                [breakpoints.xs]: {
                  slidesPerView: 1,
                },
              }}
              modules={[Pagination, Navigation]}
              className={styles.swiper}
            >
              {filteredNewsList.slice(0, MAX_NEWS_VISIBLE).map(news => (
                <SwiperSlide key={news.id} className={styles['swiper-slide']}>
                  <NewsCard news={news} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
        <section className={styles.projects}>
          <div className={styles.titleContainer}>
            <SectionTitle title={t('Outstanding project')} />
            <span style={{ color: '#414141', paddingTop: '1rem' }}>{t('Outstanding project description')}</span>
          </div>
          <div>
            <Swiper
              pagination={{
                clickable: true,
              }}
              navigation={true}
              breakpoints={{
                [breakpoints.xxl]: {
                  slidesPerView: 5,
                  spaceBetween: 30,
                },
                [breakpoints.xl]: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
                [breakpoints.lg]: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                [breakpoints.sm]: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                [breakpoints.xs]: {
                  slidesPerView: 1,
                },
              }}
              modules={[Pagination, Navigation]}
              className={styles.swiper}
            >
              {projectList.map(project => (
                <SwiperSlide key={project.id} className={styles['swiper-slide']}>
                  <ServiceCard
                    title={project.name}
                    project={project}
                    img={
                      project.avatar && project.avatar !== 'string' ? `${hostUrl}/Projects${project.avatar}` : ProjectBg
                    }
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
        {!!filteredIntroductionNewsList?.length && (
          <section className={styles.introduction}>
            <div className={styles.titleContainer}>
              <SectionTitle title={t('About us')} />
            </div>
            <div>
              <IntroductionNews news={filteredIntroductionNewsList[0]} />
            </div>
          </section>
        )}
        <NewsFooter />
      </div>
    </div>
  );
};
