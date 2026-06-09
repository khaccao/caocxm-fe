/* eslint-disable import/order */
import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { DatePicker, Input, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import ContractsTable from 'src/pages/Project/ListSubcontract/components/ContractsTable/ContractsTable';

import { Paythesubcontractor, defaultPagingParams } from '@/common/define';
import { documentActions, getDocumentQueryParams, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFileRoots, getSelectedProject, projectActions } from '@/store/project';
import PaythesubcontractorList from './components/PaythesubcontractorList';

interface PaythesubcontractorProps {
  type: Paythesubcontractor;
}

export const PaytheSubcontractors = (props: PaythesubcontractorProps) => {
  const { type } = props;

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(getSelectedProject());
  const documentPath = useAppSelector(getPathDocument());
  const folderRootId = useAppSelector(getFolderRootId());
  const listDataFileRoots = useAppSelector(getFileRoots());
  const [activeKey, setActiveKey] = useState<string>('1');
  const [searchStr, setSearchStr] = useState<string>('');
  const isCallRef = useRef(true);
  const [timer, setTimer] = useState<any>(null);
  const params = useAppSelector(getDocumentQueryParams());
  const path = useAppSelector(getPathDocument());

  const title = type === Paythesubcontractor.ThanhToan12 ? 'Thanh toán thầu phụ 12' : 'Thanh toán thầu phụ 27';

  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Hàm lấy folderRootId dựa trên type
  const getRootIdByType = useCallback(() => {
    if (!listDataFileRoots?.results?.length) return null;
    return type === Paythesubcontractor.ThanhToan12
      ? listDataFileRoots.results.find((i: any) => i.name === 'thanhtoanthauphu12')
      : listDataFileRoots.results.find((i: any) => i.name === 'thanhtoanthauphu27');
  }, [listDataFileRoots, type]);

  // Lấy danh sách folder root ID
  useEffect(() => {
    if (listDataFileRoots?.length === 0) {
      dispatch(projectActions.getFolderRootId({ projectId: selectedProject?.id, isGetId: true }));
    }
  }, [selectedProject, listDataFileRoots]);

  // Xử lý logic cho folderRootId khi type thay đổi
  useEffect(() => {
    if (selectedProject) {
      const rootId = getRootIdByType();
      if (rootId) {
        dispatch(documentActions.setFolderRootId(rootId.id));
      } else {
        isCallRef.current = false;
        dispatch(documentActions.setFolderRootId(null));
        dispatch(documentActions.setDocuments([]));
      }
      dispatch(documentActions.setDocumentPath([]));
    }
  }, [dispatch, selectedProject, getRootIdByType]);

  // Lấy label từ API
  useEffect(() => {
    const lastPath = documentPath?.[documentPath.length - 1];
    console.log(documentPath, 'lastPath');
    if (lastPath) {
      dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: defaultPagingParams }));
    } else if (folderRootId && isCallRef.current) {
      dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
    }
  }, [dispatch, folderRootId, documentPath, selectedProject]);

  // Gọi API khi thay đổi ngày hoặc dự án
  useEffect(() => {
    if (selectedProject) {
      const currentDate = dayjs();
      const apiStartDate = startDate
        ? startDate.format('YYYY-MM-DD')
        : currentDate.startOf('month').format('YYYY-MM-DD');
      const apiEndDate = endDate ? endDate.format('YYYY-MM-DD') : currentDate.endOf('month').format('YYYY-MM-DD');

      dispatch(
        projectActions.getpaymentByProject({
          projectId: selectedProject.id,
          paymentTerm: type === Paythesubcontractor.ThanhToan12 ? 0 : 1,
          startDate: apiStartDate,
          endDate: apiEndDate,
        }),
      );
    }
  }, [dispatch, selectedProject, startDate, endDate, type, activeKey]);

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setSelectedDates(dates);
    setStartDate(dates?.[0] ?? null);
    setEndDate(dates?.[1] ?? null);
  };

  const handleDownload = () => {
    console.log('Download initiated');
  };

  const onSearchChange = (evt: any) => {
    const search = evt.target.value;
    setSearchStr(search);
    clearTimeout(timer);
    const timeoutId = setTimeout(() => {
      const newParams = { ...params, page: 1, search };
      if (!path?.length && folderRootId) {
        dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: newParams }));
      } else {
        const lastPath = path[(path?.length || 1) - 1];
        if (lastPath) {
          dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: newParams }));
        }
      }
    }, 500);
    setTimer(timeoutId);
  };

  const getTabBarExtraContent = () => {
    const defaultStartDate = dayjs().startOf('month');
    const defaultEndDate = dayjs().endOf('month');

    return activeKey === '1' ? (
      <DatePicker.RangePicker
        style={{ marginRight: '10px' }}
        value={selectedDates ?? [defaultStartDate, defaultEndDate]}
        onChange={handleRangeChange}
        className="date-picker"
      />
    ) : activeKey === '2' ? (
      <Space style={{ marginRight: '120px' }}>
        <Input
          value={searchStr}
          onChange={onSearchChange}
          allowClear
          placeholder="Tìm kiếm"
          suffix={searchStr ? null : <SearchOutlined />}
          style={{ width: 255 }}
        />
      </Space>
    ) : null;
  };

  return (
    <div style={{ padding: '0 5px' }}>
      <Tabs
        defaultActiveKey="1"
        activeKey={activeKey}
        onChange={key => setActiveKey(key)}
        tabBarExtraContent={getTabBarExtraContent()}
      >
        <Tabs.TabPane key="1" tab={title}>
          <PaythesubcontractorList type={type} />
        </Tabs.TabPane>

        <Tabs.TabPane key="2" tab={`Danh sách file ${title}`}>
          {type === Paythesubcontractor.ThanhToan12 && (
            <ContractsTable
              tp12={12}
              policies={{
                create: ['ListThanhToanThauPhu_12.Create'],
                delete: ['ListThanhToanThauPhu_12.Delete'],
              }}
            />
          )}
          {type === Paythesubcontractor.ThanhToan27 && (
            <ContractsTable
              tp27={27}
              policies={{
                create: ['ListThanhToanThauPhu_27.Create'],
                delete: ['ListThanhToanThauPhu_27.Delete'],
              }}
            />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};
