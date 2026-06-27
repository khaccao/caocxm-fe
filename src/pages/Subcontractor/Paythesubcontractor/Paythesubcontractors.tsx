/* eslint-disable import/order */
import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { DatePicker, Input, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useParams } from 'react-router-dom';
import ContractsTable from 'src/pages/Project/ListSubcontract/components/ContractsTable/ContractsTable';

import { Paythesubcontractor, defaultPagingParams } from '@/common/define';
import { documentActions, getDocumentQueryParams, getFolderRootId, getPathDocument } from '@/store/documents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFileRoots, getSelectedProject, projectActions } from '@/store/project';
import PaythesubcontractorList from './components/PaythesubcontractorList';

interface PaythesubcontractorProps {
  type?: Paythesubcontractor;
}

export const PaytheSubcontractors = (props: PaythesubcontractorProps) => {
  const { type } = props;
  const { periodCode, detailId } = useParams();
  const paymentPeriodDetailId = detailId ? Number(detailId) : null;

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

  const pageTitle = type === Paythesubcontractor.ThanhToan12
    ? 'Thanh toán thầu phụ 12'
    : type === Paythesubcontractor.ThanhToan27
      ? 'Thanh toán thầu phụ 27'
      : `Thanh toán thầu phụ ${periodCode || ''}`;

  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const getRootIdByType = useCallback(() => {
    if (!type || !listDataFileRoots?.results?.length) return null;
    return type === Paythesubcontractor.ThanhToan12
      ? listDataFileRoots.results.find((i: any) => i.name === 'thanhtoanthauphu12')
      : listDataFileRoots.results.find((i: any) => i.name === 'thanhtoanthauphu27');
  }, [listDataFileRoots, type]);

  useEffect(() => {
    if (type && listDataFileRoots?.length === 0) {
      dispatch(projectActions.getFolderRootId({ projectId: selectedProject?.id, isGetId: true }));
    }
  }, [dispatch, selectedProject, listDataFileRoots, type]);

  useEffect(() => {
    if (type && selectedProject) {
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
  }, [dispatch, selectedProject, getRootIdByType, type]);

  useEffect(() => {
    if (!type) return;

    const lastPath = documentPath?.[documentPath.length - 1];
    if (lastPath) {
      dispatch(documentActions.getLabelRequest({ documentId: lastPath.id, params: defaultPagingParams }));
    } else if (folderRootId && isCallRef.current) {
      dispatch(documentActions.getLabelRequest({ documentId: folderRootId, params: defaultPagingParams }));
    }
  }, [dispatch, folderRootId, documentPath, selectedProject, type]);

  useEffect(() => {
    if (type && selectedProject) {
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
    ) : activeKey === '2' && type ? (
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
        <Tabs.TabPane key="1" tab={pageTitle}>
          <PaythesubcontractorList
            type={type}
            startDate={startDate ? startDate.format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD')}
            endDate={endDate ? endDate.format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD')}
            paymentPeriodCode={periodCode}
            paymentPeriodDetailId={Number.isFinite(paymentPeriodDetailId) ? paymentPeriodDetailId : null}
          />
        </Tabs.TabPane>

        {type && (
          <Tabs.TabPane key="2" tab={`Danh sách file ${pageTitle}`}>
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
        )}
      </Tabs>
    </div>
  );
};
