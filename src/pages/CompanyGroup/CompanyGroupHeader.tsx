import { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Modal, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import styles from '././CompanyGroup.module.less';
import NewGroup from './components/NewGroup';
import { eTrackerCode, formatDateDisplay } from '@/common/define';
import { WithPermission } from '@/hocs/PermissionHOC';
import { getActiveMenu } from '@/store/app';
import { groupActions } from '@/store/group';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueQueryParams, issueActions, getTagsVersion, getTracker } from '@/store/issue';
import { getSelectedProject } from '@/store/project';
import Utils from '@/utils';

export const CompanyGroupHeader = () => {
  const tCommon = useTranslation('common').t;
  const activeMenu = useAppSelector(getActiveMenu());
  const params = useAppSelector(getIssueQueryParams());
  const [searchStr, setSearchStr] = useState(params?.search);
  const trackers = useAppSelector(getTracker());
  const selectedProject = useAppSelector(getSelectedProject());
  const [modalVisible, setModalVisible] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const dispatch = useAppDispatch();

  const onSearch = (_search?: string) => {
    const search = _search ?? searchStr;
    dispatch(groupActions.setSearchStr(search));
  }

  // [#20692][phuong_td][31/10/2024] Tìm theo tên
  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    // [31/10/2024][#21006][phuong_td] tìm kiếm khi thay đổi giá trị trong hộp thoại search
    const timeoutId = setTimeout(() => {
      onSearch(search);
      // let trackerId = Utils.getTrackerID();
      // dispatch(
      //   issueActions.getIssuesByMilestoneRequest({
      //     projectId: selectedProject.id,
      //     params: {
      //       ...params,
      //       page: 1,
      //       search,
      //       timeoutId,
      //     },
      //   }),
      // );
    }, 500);
    setTimer(timeoutId);
  };
  const onSearchBlur = () => {
    onSearch();
    // Nếu cần thực hiện logic khác, thêm tại đây
  };
  useEffect(() => {
    // console.log(searchStr, 'searchStr')
  }, [searchStr]);
  // [#20692][phuong_td][31/10/2024] Áp dụng bộ lọc ngày
  const handleModalVisible = () => {
    setModalVisible(true);
  };
  const handleModalClose = () => {
    setModalVisible(false);
  };
  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <div className={styles.titleContainer}>
            <Typography.Title style={{ margin: 0 }} level={4}>
              {activeMenu?.label}
            </Typography.Title>
          </div>
        </div>
        <Space>
          <div className={styles.searchContainer}>
            <Input
              allowClear
              value={searchStr}
              onChange={onSearchChange}
              onBlur={onSearchBlur} // Gắn sự kiện onBlur
              suffix={searchStr ? null : <SearchOutlined />}
              style={{ borderRadius: 20, width: 200 }}
              placeholder={tCommon('Search')}
            />
          </div>
          <WithPermission strategy="disable" policyKeys={['CongTy.PhongBan.Create']}>
            <Button
              type="primary"
              style={{ padding: 10, borderRadius: 15, marginTop: -2 }}
              onClick={() => handleModalVisible()}
            >
              Tạo phòng ban
            </Button>
          </WithPermission>
        </Space>
      </div>
      <Modal open={modalVisible} title="Thêm mới phòng ban" onCancel={handleModalClose} footer={null}>
        <NewGroup onCancel={handleModalClose} />
      </Modal>
    </>
  );
};
