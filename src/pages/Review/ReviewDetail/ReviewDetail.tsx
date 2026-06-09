/* eslint-disable import/order */
import { useEffect, useState } from 'react';

import { Carousel, Flex, Image } from 'antd';

import styles from '../Review.module.css';
import ReviewDetailComment from './ReviewDetailComment/ReviewDetailComment';
import ReviewDetailHead from './ReviewDetailHead/ReviewDetailHead';
import { IReviewItem } from '@/common/define';

const ReviewDetail = (props: {message: IReviewItem, disableds?: { [key: string]: boolean }}) => {
  const { message, disableds } = props;
  if (!message) return <div className={styles.reviewDetail}>Select a message to view details</div>;

  return (
    <Flex vertical style={{padding: 10}}>
      <ReviewDetailHead message={message}></ReviewDetailHead>      
      <ReviewDetailComment message={message} disableds={disableds}></ReviewDetailComment>
    </Flex>
  );
};

export default ReviewDetail;
