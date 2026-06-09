import { time } from 'console';

import { useEffect, useState } from 'react';


import { ClockCircleOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Carousel, Flex, Image} from 'antd';
import PropTypes from 'prop-types';

import styles from '../../Review.module.css';
import { IReviewDrawing, IReviewItem } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review';
import Utils from '@/utils';

const ReviewDetailHead = (props: {message: IReviewItem, handleItemClick?: any}) => {
  const { message, handleItemClick } = props;
  const dispatch = useAppDispatch();
  const [sizeImage, setSizeImage] = useState<number>(250);
  const [carouselCount, setCarouselCount] = useState<number>(1);
  
  const [attachmentLinks, setAttachmentLink] = useState<IReviewDrawing[]>([]);

  useEffect(() => {
    let count = attachmentLinks?.length > 4 ? 4: attachmentLinks?.length;
    setCarouselCount(count);
  }, [attachmentLinks])
  
  useEffect(() => {
    setAttachmentLink(message.attachmentLinkReadDTOs);
  }, [message?.attachmentLinkReadDTOs])

  useEffect(() => {
    dispatch(reviewActions.postView({messageId: message.id}))
  }, [message?.id])

  return (
    <Flex vertical style={{paddingBottom: 10}} onClick={() => handleItemClick && handleItemClick(message)}>
      <div className={styles.fontLarge}>
        {message.subject}
      </div>
      <div className={`${styles.fontSmall} ${styles.flexRow}`}>
        <ClockCircleOutlined style={{marginRight: 5}}/>
        <div style={{paddingRight: 20}}>{Utils.reFormatDateFromIsoString(message.createdDate)}</div>
        <UserOutlined style={{marginRight: 5}}/>
        <div style={{paddingRight: 20}}>{message.senderName}</div>
        <EyeOutlined style={{marginRight: 5}}/>
        <div style={{paddingRight: 20}}>{message.countView} người xem</div>
      </div>
      <div className={`${styles.fontNormal}`}
          style={{paddingTop: 10}}
      >
        {message.content}
      </div>
      {
      attachmentLinks?.length > 0 ?
      <div style={{display: 'flex', justifyContent: 'center', width:"100%", paddingTop:10, paddingBottom:10}}>
        <Carousel 
          arrows infinite={true} 
          style = {{
            margin: 0, 
            width: `${(carouselCount + 0.5)*sizeImage}px`, 
            height: `${sizeImage}px`, 
            color: '#fff', 
            lineHeight: `${sizeImage}px`, 
            textAlign: 'center', 
            background: '#d9d9d9', 
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          slidesToShow={carouselCount} slidesToScroll={1}
        >
          {attachmentLinks && attachmentLinks.map((draw: IReviewDrawing) => (
            <div key={draw.id}>
              <Image src={draw.url} width={sizeImage} height={sizeImage}/>
            </div>
          ))}
        </Carousel>
      </div>: <></>
      }
    </Flex>
  )
}


export default ReviewDetailHead;
