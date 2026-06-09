import { useEffect, useState } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Flex, Input, Modal } from 'antd';

import NewReview from './NewReview';
import ReviewListItem from './ReviewListItem';
import styles from '../Review.module.css';
import { IReviewItem } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface ButtonsProps {
  create?: ButtonProps;
  edit?: ButtonProps;
  delete?: ButtonProps;
}
const ReviewList = (props: {
  messages: IReviewItem[];
  message: IReviewItem;
  onSelectMessage: any;
  categoryCode: string;
  buttonsProps?: ButtonsProps;
}) => {
  const { messages, onSelectMessage, categoryCode, message, buttonsProps } = props;
  const [showModal, setShowModal] = useState<boolean>();
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();
  const [textSearch, setTextSearch] = useState('');
  const [filteredReviewItem, setFilteredReviewItem] = useState<IReviewItem[]>([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const filter = messages.filter(x => x.subject?.includes(textSearch));
      setFilteredReviewItem(filter);
    } else {
      setFilteredReviewItem([]);
    }
  }, [messages, textSearch]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTextChange = (evt: any) => {
    setTextSearch(evt?.currentTarget?.value);
  };

  return (
    <>
      <Flex gap="middle" vertical className={styles.reviewList}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className={styles.fontLarge} style={{ marginRight: '8px' }}>
            Thông báo
          </span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size={'middle'}
            style={{ marginLeft: 'auto' }} // Căn chỉnh nút về phía bên phải
            onClick={() => setShowModal(true)}
            {...buttonsProps?.create}
          >
            {'Soạn mới'}
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            placeholder={'Tìm kiếm'}
            allowClear
            value={textSearch}
            style={{ flex: 1 }} // Chiếm phần còn lại
            suffix={textSearch ? null : <SearchOutlined />}
            onChange={handleTextChange} // Event onChangeText
          />
          {/* <Button
            type="primary"
            icon={<OrderedListOutlined />}
            size={'middle'}
            style={{ marginLeft: '10px' }} // Kích thước cố định
          ></Button> */}
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', alignItems: 'center' }}>
          {filteredReviewItem &&
            filteredReviewItem.map((msg: any) => {
              let aaa = { ...msg, selected: false };
              if (message && message.id === msg.id) {
                aaa = { ...msg, selected: true };
              }
              return (
                <div key={aaa.id} style={{ cursor: 'pointer' }}>
                  {/* , border: "1px solid #ff0000" */}
                  <ReviewListItem
                    message={aaa}
                    handleItemClick={onSelectMessage}
                    categoryCode={categoryCode}
                    buttonsProps={buttonsProps}
                  ></ReviewListItem>
                </div>
              );
            })}
        </div>
      </Flex>
      {showModal && (
        <Modal open={showModal} title="Thêm mới chủ đề" onCancel={handleCloseModal} footer={null}>
          <NewReview categoryCode={categoryCode} messages={undefined} onClose={handleCloseModal} />
        </Modal>
      )}
    </>
  );
};

export default ReviewList;
