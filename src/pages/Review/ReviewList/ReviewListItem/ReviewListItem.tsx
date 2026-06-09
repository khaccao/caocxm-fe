import { useEffect, useState } from 'react';

import { UserOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Flex, Modal, notification } from 'antd';
import dayjs from 'dayjs';

import styles from '../../Review.module.css';
import NewReview from '../NewReview';
import { IReviewItem } from '@/common/define';
import { getCurrentUser, getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review';
import Utils from '@/utils';


interface ButtonsProps {
  edit?: ButtonProps;
  delete?: ButtonProps;
}
const ReviewListItem = (props: {message: IReviewItem, handleItemClick?: any, categoryCode: string, buttonsProps?: ButtonsProps}) => {
  const { message, handleItemClick, categoryCode, buttonsProps } = props;
  const [showModal, setShowModal] = useState<boolean>();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false); // New state for delete confirmation modal
  const user = useAppSelector(getCurrentUser());
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();

  const handleCloseModal = () => {
    setShowModal(false);
    // infor da updat roi ==> ko can lay lai thong tin
    // dispatch(reviewActions.getReviewMessage({
    //   companyId: Number(company.id),
    //   categoryCode: categoryCode,
    //   startDate: "2000-01-01",
    //   // endDate: dayjs().format('YYYY-MM-DD'),
    //   endDate: "3000-01-01",
    // }))
  };

  const handleDelete = () => {
    dispatch(reviewActions.deleteReviewRequest({ id: message.id }));
    // infor da updat roi ==> ko can lay lai thong tin
    // dispatch(reviewActions.getReviewMessage({
    //   companyId: Number(company.id),
    //   categoryCode: categoryCode,
    //   startDate: "2000-01-01",
    //   // endDate: dayjs().format('YYYY-MM-DD'),
    //   endDate: "3000-01-01",
    // }));
    setIsDeleteConfirmVisible(false); // Hide the delete confirmation modal after deletion
  };

  useEffect(() => {
  }, [])

  const resetEvent = (event: any) => {
    event?.preventDefault();
    event?.stopPropagation();
  }

  return (
    // border: "1px solid #14aeea"
    <div>
      <Flex className={`${styles.rowMessage} ${message.selected ? styles.rowMessageSelected : ""}`}
        onClick={() => handleItemClick && handleItemClick(message)}
      >
        <div className={`${styles.fontMedium} ${styles.onerow}`}>
          {message.subject}
        </div>
        <div className={`${styles.fontSmall} ${styles.onerow}`}>
          {`${message.content}`}
        </div>
        <div className={`${styles.fontSmall} ${styles.flexRow}`}>
          <ClockCircleOutlined style={{marginRight: 5}}/>
          <div style={{paddingRight: 20}}>{Utils.formatDateTimeStamp(new Date(message.createdDate))}</div>
          <UserOutlined style={{marginRight: 5}}/>
          <div style={{paddingRight: 20}}>{message.senderName}</div>
          <span className={styles.buttonGroup}>
            <Button 
              onClick={(event) => {
                resetEvent(event);
                if (user && message.senderId === user.Id )
                  setShowModal(true)
                else {
                  notification.warning({
                    message: 'Chỉnh sửa chủ đề',
                    description: 'Bạn không phải là người tạo chủ đề này!',
                  });
                }
              }} 
              type='text' 
              icon={<EditOutlined className={`${styles.buttons} ${styles.buttonEdit}`} />} 
              {...buttonsProps?.edit }
            />
            
            <Button 
              onClick={(event) => {
                resetEvent(event);
                if (user && message.senderId === user.Id )
                  setIsDeleteConfirmVisible(true)
                else {
                  notification.warning({
                    message: 'Xóa chủ đề',
                    description: 'Bạn không phải là người tạo chủ đề này!',
                  });              
              }
              }} 
              type='text' 
              icon={<DeleteOutlined className={`${styles.buttons} ${styles.buttonDelete}`}/>}
              {...buttonsProps?.delete }
            />
            
          </span>
        </div>
      </Flex>  
      { showModal && (<Modal open={showModal} title="Chỉnh sửa chủ đề" onCancel={handleCloseModal} footer={null}>
        <NewReview messages={message} categoryCode={categoryCode} onClose={handleCloseModal}/>
      </Modal>)
      }
      <Modal
          open={isDeleteConfirmVisible}
          onCancel={(event) => {
            setIsDeleteConfirmVisible(false)
          }} // Close modal if user cancels
          onOk={(event) => {
            handleDelete();
          }} // Proceed with delete if user confirms
          okText="Xác nhận"
          cancelText="Hủy"
          title="Xác nhận xóa"
        >
          <p>Bạn có chắc chắn muốn xóa đề nghị này không?</p>
        </Modal>
    </div>    
  )
}
export default ReviewListItem;
