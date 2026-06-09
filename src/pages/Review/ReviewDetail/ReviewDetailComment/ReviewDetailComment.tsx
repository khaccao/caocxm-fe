import { useEffect, useState } from 'react';

import { CommentOutlined, LikeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';

import styles from '../../Review.module.css';
import { IReviewComment, IReviewItem } from '@/common/define';
import { getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review';

const ReviewDetailComment = (props: {message: IReviewItem, handleItemClick?: any, disableds?: { [key:string ]: boolean }}) => {
  const { message, handleItemClick, disableds } = props;
  const dispatch = useAppDispatch();
  const user = useAppSelector(getCurrentUser());
  const [inputValue, setInputValue] = useState("");
  
  useEffect(() => {
    
  }, [])
  
  const onSendComment = () => {
    setInputValue("");
    if (message) {
      dispatch(reviewActions.postReviewMessage({
        content: inputValue,
        createdDate: new Date().toISOString(),
        messageId: message.id,
        parentId: null,
        }));
    }
  }

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value); // Cập nhật giá trị input
  };

  const onSendLike = () => {
    if (message) {
      dispatch(reviewActions.getLike({messageId: message.id, user: user, postLike: true})); // lay thong tin de kt like or not
    }
  }

  return (
    <Flex vertical style={{paddingTop: 10, paddingBottom: 10, width: '100%'}} onClick={() => handleItemClick && handleItemClick(message)}>
      <div className={styles.flexRow}>
        <LikeOutlined 
          className={styles.likeButton}
          style={{ color: disableds?.like ? 'grey' : undefined}}
          onClick={disableds?.like ? undefined : onSendLike}
        />
        <div className={styles.flexColumn} style={{paddingRight: 20}}>
          <div className={styles.fontSmall}>Thích bài viết này</div>
          <div className={styles.fontSmall}>{`${message.countLike} lượt thích`}</div>
        </div>
        <CommentOutlined style={{fontSize: 30, color: '#14aeea', marginRight: 5 }}/>
        <div className={styles.flexColumn} style={{paddingRight: 20}}>
          <div className={styles.fontSmall}>Bình luận</div>
          <div className={styles.fontSmall}>{`${!(message?.comments) ? 0 : message?.comments?.length} lượt bình luận`}</div>
        </div>
      </div>
      <Flex vertical={false} style={{ paddingTop: 20, paddingBottom: 20 }}>
        <Input
          placeholder={"bình luận"}
          allowClear
          style={{ flex: 1 }} // Chiếm phần còn lại
          prefix={<CommentOutlined style={{ color: '#14aeea', fontSize: 18 }} />}
          value={inputValue} // Giá trị của input
          onChange={handleInputChange} // Bắt sự kiện thay đổi
        />
        <Button 
          type="primary"
          size={'middle'}
          style={{ marginLeft: '10px' }} // Kích thước cố định
          onClick={onSendComment}
          disabled={disableds?.comment}
        >
          {"Gửi bình luận"}
        </Button>
      </Flex>
      <div>
        {message.comments && message.comments.length > 0 ? [...message.comments].reverse().map((msg: IReviewComment) => (
          // border: "1px solid #14aeea"
          <div key={msg.id} className={styles.flexRow} style={{marginTop: 5, marginBottom: 5}}>
            <CommentOutlined style={{ color: '#14aeea', fontSize: 20, marginRight: 10, marginTop: 10, alignItems: 'baseline' }}/>
            <div className={`${styles.flexColumn} ${styles.rowComment}`}>
              <div className={styles.fontMedium} style={{paddingRight: 20}}>{msg.senderName}</div>
              <div style={{paddingRight: 20}}>{msg.content}</div>
            </div>  
          </div>
        )): <></>}
      </div>
    </Flex>
  )
}

export default ReviewDetailComment;
