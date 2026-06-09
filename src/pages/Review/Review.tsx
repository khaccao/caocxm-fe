import React, { useEffect, useState } from 'react';

import { Button, Flex, Splitter, Switch, Typography } from 'antd';

import styles from './Review.module.css';
import ReviewDetail from './ReviewDetail/ReviewDetail';
import ReviewList from './ReviewList/ReviewList';
import { eTypeReview, IReviewComment, IReviewItem } from '@/common/define';
import { usePermission } from '@/hooks';
import { getActiveMenu } from '@/store/app';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewActions } from '@/store/review';

export const Review = (props: {categoryCode: eTypeReview}) => {
  const { categoryCode } = props;
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(getActiveMenu());
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const company = useAppSelector(getCurrentCompany());
  const [sizes, setSizes] = React.useState<(number | string)[]>(['30%', '70%']);
  const [startDate, setStartDate] = React.useState<string>("2000-01-01");
  const [endDate, setEndDate] = React.useState<string>("9000-01-01");
  const reviewMessage = useAppSelector(state => state.review.reviewMessage);

  useEffect(() => {
    if (company) {
      dispatch(reviewActions.getReviewMessage({
        companyId: company.id,
        categoryCode,
        startDate,
        endDate,
      }));
    }
  }, [company, categoryCode, startDate, endDate]);
  
  const updateDefaultMessage = (results: IReviewItem[]) => {
    if (results?.length > 0) {
      if (!selectedMessage) { 
        setSelectedMessage(results[0]);
        dispatch(reviewActions.getReviewsById({id: results[0].id, companyId: company.id}));
      } 
      else {
        let index = results.findIndex(x => x.id === selectedMessage.id)
        if (index < 0) {
          setSelectedMessage(results[0]);
          dispatch(reviewActions.getReviewsById({id: results[0].id, companyId: company.id}));
        }
      }
    } else setSelectedMessage(null);    
  }
  useEffect(() => {
    if (reviewMessage && company) {
      updateDefaultMessage(reviewMessage.results);
      setMessages(reviewMessage.results);
      reviewMessage.results.map((x: any) => {
        if (selectedMessage && x.id === selectedMessage.id) setSelectedMessage(x);
      })
    }
    else {
      setSelectedMessage([]);
      setMessages([]);
    }   
  }, [reviewMessage, company]);

  const handleSelectMessage = (message: IReviewItem) => {    
    setSelectedMessage(message);
    if (message && company) {
      dispatch(reviewActions.getReviewsById({id: message.id, companyId: company.id}));
    }
  }

  
  const getPermissionKeys = () => {
    let permissionKeys: any = {};
    switch (categoryCode) {
      case eTypeReview.ProjectManagementSuppliers:
        permissionKeys = {
          create: ['DanhGia.QLDA_NCC.Create'],
          edit: ['DanhGia.QLDA_NCC.Edit'],
          delete: ['DanhGia.QLDA_NCC.Delete'],
          like: ['DanhGia.QLDA_NCC.Like'],
          comment: ['DanhGia.QLDA_NCC.Comment'],
        };
        break;

      case eTypeReview.SupervisionConsultantsSupplier:
        permissionKeys = {
          create: ['DanhGia.TVGS_NCC.Create'],
          edit: ['DanhGia.TVGS_NCC.Edit'],
          delete: ['DanhGia.TVGS_NCC.Delete'],
          like: ['DanhGia.TVGS_NCC.Like'],
          comment: ['DanhGia.TVGS_NCC.Comment'],
        };
        break;

      case eTypeReview.InvestorsProjectManagement:
        permissionKeys = {
          create: ['DanhGia.CDT_BQL.Create'],
          edit: ['DanhGia.CDT_BQL.Edit'],
          delete: ['DanhGia.CDT_BQL.Delete'],
          like: ['DanhGia.CDT_BQL.Like'],
          comment: ['DanhGia.CDT_BQL.Comment'],
        };
        break;

      case eTypeReview.InvestorsSupervisionConsultants:
        permissionKeys = {
          create: ['DanhGia.CDT_TVGS.Create'],
          edit: ['DanhGia.CDT_TVGS.Edit'],
          delete: ['DanhGia.CDT_TVGS.Delete'],
          like: ['DanhGia.CDT_TVGS.Like'],
          comment: ['DanhGia.CDT_TVGS.Comment'],
        };
        break;

      default:
        break;
    }
    return permissionKeys;
  };

  const permissionKeys = getPermissionKeys();
  const createGranted = usePermission(permissionKeys.create);
  const editGranted = usePermission(permissionKeys.edit);
  const deleteGranted = usePermission(permissionKeys.delete);
  const likeGranted = usePermission(permissionKeys.delete);
  const commentGranted = usePermission(permissionKeys.delete);

  return (
    <>
      <div style={{ height: 60, background: 'white', display: 'flex', alignItems: 'center' }}>
        <Typography.Title style={{ marginLeft: 10 }} level={4}>
          {activeMenu?.label}
        </Typography.Title>
      </div>

      <div style={{ padding: 5, height: 'calc(100vh - 250px)' }}>
        <Flex vertical className={styles.layout}>
          <Splitter onResize={setSizes} style={{ flexGrow: 1, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <Splitter.Panel size={sizes[0]} resizable={true}>
              <ReviewList
                messages={messages}
                message={selectedMessage}
                onSelectMessage={handleSelectMessage}
                categoryCode={categoryCode}
                buttonsProps={{
                  create: {
                    disabled: !createGranted
                  },
                  edit: {
                    disabled: !editGranted
                  },
                  delete: {
                    disabled: !deleteGranted
                  },
                }}
              />
            </Splitter.Panel>
            <Splitter.Panel size={sizes[1]}>
              <ReviewDetail message={selectedMessage} disableds={{ like: !likeGranted, comment: !commentGranted }}/>
            </Splitter.Panel>
          </Splitter>
        </Flex>
      </div>
    </>
  );
};