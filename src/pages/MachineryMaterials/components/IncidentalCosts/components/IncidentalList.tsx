/* eslint-disable import/order */
import React, { useEffect, useMemo } from 'react';

import { Badge, Card, Empty } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useTranslation } from 'react-i18next';

import { FormatDateAPI } from '@/common/define';
import { accountingInvoiceActions } from '@/store/accountingInvoice';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedProject } from '@/store/project';
import { RootState } from '@/store/types';
import { groupAndSortByDate, mergeByGroupId } from '../utils';
import IncidentalCard from './IncidentalCard';
import styles from './IncidentalCard.module.css';

// -----------------------------------------------------------

dayjs.extend(isBetween);

interface IncidentalListProps {
  dateRange: any;
  handleDelete: (ids: number[]) => void;
}

export default function IncidentalList({ dateRange, handleDelete }: IncidentalListProps): React.JSX.Element {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const company = useAppSelector(getCurrentCompany());
  const selectedProject = useAppSelector(getSelectedProject());

  const additionalCosts = useAppSelector((state: RootState) => state.accountingInvoice.AdditionalCosts) ?? [];
  const additionalCostAll = useAppSelector((state: RootState) => state.accountingInvoice.AdditionalCostAll) ?? [];


  useEffect(() => {
    if (selectedProject?.id && company.id) {
      dispatch(accountingInvoiceActions.getAdditionalCosts({ projectId: selectedProject?.id, companyId: company.id }));
    } else {
      dispatch(accountingInvoiceActions.GetALLAdditionalCost({ companyId: company.id }));
    }
  }, [dispatch, selectedProject, company]);

  const groupedData = useMemo(() => {
    const raw = selectedProject ? additionalCosts : additionalCostAll;
    if (!raw.length) return [];

    const [from, to] = dateRange;
    const filtered = raw.filter(item => {
      const d = dayjs(item.createDate, FormatDateAPI);

      return d.isValid() && d.isBetween(from, to, 'day', '[]') && item.id !== undefined;
    });

    const merged = mergeByGroupId(filtered as any);

    const mergedForGroup = merged.map(({ header, items }) => ({
      ...header,
      items,
    }));

    return groupAndSortByDate(mergedForGroup as any);
  }, [additionalCosts, additionalCostAll, selectedProject, dateRange]);
  const overallTotal = useMemo(() =>
    groupedData.reduce((sum, day) => sum + (day.totalDayMoney ?? 0), 0), [groupedData]);

  return (
    <div>
      {Array.isArray(groupedData) && groupedData.length > 0 ? (
        <>
          <div className={styles.incidentalList}>
            {groupedData.map(day => (
              <Card key={day.date} className={styles.incidentalDayCard}>
                {day.badgeCount >= 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge count={day.badgeCount} offset={[15, 0]} className="proposal-badge">
                      <div
                        className={styles.incidentalDayCardTitle}
                      >{`${day.date} (${day.incidentals.length} phiếu)`}</div>
                    </Badge>

                    <div className={`${styles.incidentalDayCardTitle}`} style={{ marginTop: -12 }}>
                      {`Tổng tiền: ${day.totalDayMoney.toLocaleString('en-US')} VNĐ`}
                    </div>
                  </div>
                )}

                <div className={styles.incidentalDayCardContent}>
                  {day.incidentals.map(inc => (
                    <IncidentalCard key={inc.id} incidental={inc} handleDelete={handleDelete} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <div className={styles.overallTotal}>
            <span>{`Tổng tiền: ${overallTotal.toLocaleString('en-US')} VNĐ`}</span>
          </div>
        </>
      ) : (
        <Empty description={t('Không có dữ liệu')} />
      )}
    </div>
  );
}
