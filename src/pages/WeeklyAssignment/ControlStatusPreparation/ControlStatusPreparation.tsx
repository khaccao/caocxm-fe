import { useEffect, useState } from 'react';

import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { StatusWorks } from './StatusWorks';
import styles from '../WeeklyAssignment.module.less';
import { ControlStatusPreparationModalName, CreateUpdateWorkWeeklyModalName } from '@/common/define';
import { TextCustom } from '@/components/TextCustom/TextCustom';
import { CheckItemsDTO, Preparation } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueChecklist, getSelectedWorkWeekly, issueActions, getIssueIds } from '@/store/issue';
import { getModalVisible, hideModal, showModal } from '@/store/modal';
import { getTeams } from '@/store/team';

export const ControlStatusPreparation = () => {
  const { t } = useTranslation('weeklyAssignment');

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(ControlStatusPreparationModalName));
  const selectedWorkWeekly = useAppSelector(getSelectedWorkWeekly());
  const issueChecklist = useAppSelector(getIssueChecklist());
  const ids = useAppSelector(getIssueIds() || []);
  const teams = useAppSelector(getTeams() || []);

  const [checklistIds, setChecklistIds] = useState<number[]>([]);

  const [preparationWorks, setPreparationWorks] = useState<Preparation[]>();

  const [complete, setComplete] = useState<number>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const getStatus = (preparationWorks: Preparation[]) => {
      const complete = preparationWorks?.reduce((accumulator, currentValue) => {
        const { checkItems } = currentValue;
        const count = checkItems.reduce((a, c) => {
          if (c.status === 1 || c.status === 2) {
            return (a += 1);
          } else {
            return a;
          }
        }, 0);
        if (count === checkItems.length) {
          return (accumulator += 1);
        } else {
          return accumulator;
        }
      }, 0);
      return complete;
    };
    if (preparationWorks) {
      const c = getStatus(preparationWorks);
      setComplete(c);
    }
  }, [preparationWorks]);

  useEffect(() => {
    if (selectedWorkWeekly && issueChecklist) {
      const { id, subject } = selectedWorkWeekly;
      const preparationWorks: Preparation[] = [];
      if (typeof id === 'number') {
        const checklist = issueChecklist.get(id);
        if (checklist) {
          checklist.forEach(c => {
            const { teamId } = c;
            const team = teams.find((t)=> t.id === teamId);
            const preparationWorkId = teamId || id;
            const tempP = preparationWorks.find(p => p.id === preparationWorkId);
            if (tempP) {
              if (tempP.checkItems) {
                tempP.checkItems.push(c);
              } else {
                tempP.checkItems = [c];
              }
            } else {
              if (team) {
                preparationWorks.push({
                  id: team.id,
                  name: team.name,
                  checkItems: [c],
                });
              } else if (typeof id === 'number')
                preparationWorks.push({
                  id: id,
                  name: subject,
                  checkItems: [c],
                });
            }
          });
        }
        // setChecklist(checklist);
      }
      setPreparationWorks(preparationWorks);
    }
    // if (issueChecklist && selectedWorkWeekly) {
    //   const { id, subject } = selectedWorkWeekly;
    //   if (typeof id === 'number') {
    //     const checklist = issueChecklist.get(id);
    //     if (checklist) {
    //       const checklistIds = checklist.map((c) => c.id);
    //       dispatch(issueActions.getIssueChecklistsTeamByCheckitemIds({ids}))
    //     }
    //   }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueChecklist]);

  const handleAddWork = () => {
    dispatch(showModal({ key: CreateUpdateWorkWeeklyModalName }));
  };

  const handleWorkUpdate = (value: number, work: CheckItemsDTO) => {
    dispatch(
      issueActions.updateChecklistRequest({
        ids,
        issueId: work.id,
        issue: { ...work, status: value },
      }),
    );
  };

  const handleCancel = () => {
    dispatch(hideModal({ key: ControlStatusPreparationModalName }));
  };

  const handleWorkEdit = () => {};

  return (
    <Modal
      // title={t('PreparationFull')}
      centered
      closable={false}
      onCancel={handleCancel}
      open={isModalOpen}
      width={830} // Đặt kích thước Modal ở đây
      footer={null}
    >
      <div style={{ display: 'flex' }}>
        <Space direction={'vertical'}>
          <Typography.Text style={{ fontWeight: 'bold', fontSize: '18px' }}>{t('PreparationFull')}</Typography.Text>
          <Space>
            <TextCustom text={selectedWorkWeekly?.subject} padding={'0 10px 0 0'} />
            <TextCustom
              text={`\u2022 ${t('Complete')} ${complete ? complete : '0'}/${
                preparationWorks?.length ? preparationWorks.length : 0
              }`}
              textColor={'green'}
            />
          </Space>
        </Space>

        <div style={{ flex: '1 1 auto' }} />
        <Space>
          <Button onClick={() => handleAddWork()} shape="default">
            <TextCustom text={t('Add Work')} icon={<PlusOutlined style={{ fontSize: 12 }} />} />
          </Button>
          <Button type="text" onClick={() => handleCancel()}>
            <CloseOutlined />
          </Button>
        </Space>
      </div>
      <div className={styles.scrollable}>
        {preparationWorks &&
          preparationWorks.map((d, i) => (
            <StatusWorks
              data={d}
              key={`StatusWorks-${d.id}`}
              isFirst={i === 0}
              isLast={preparationWorks && i === preparationWorks.length - 1}
              onChange={handleWorkUpdate}
              onClickRow={handleWorkEdit}
            />
          ))}
      </div>
    </Modal>
  );
};
