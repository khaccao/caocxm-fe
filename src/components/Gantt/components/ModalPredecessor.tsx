import React, { useEffect, useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Modal, Select, Spin, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { Task } from 'dhtmlx-gantt';
import { useTranslation } from 'react-i18next';

import styles from './ModalPredecessor.module.less';
import { EPredecessorType, FormatDateAPI, IDataGantt, IDataPredecessor, IInforParenComponent, IMultiIssueUpdateDate, IssueRelationship, RelationshipDTO, RelationshipUpdateDTO } from '@/common/define';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllChildRelationship, getIssueRelationshipParent, issueActions } from '@/store/issue';
import { getIssueByVersion } from '@/store/issue';
import { getLoading } from '@/store/loading';
import Utils from '@/utils';

interface IModalPredecessor {
  task: Task | null
  isModalVisible: boolean
  ganttData: IDataGantt[]
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  infoParentComponent: IInforParenComponent
}
const ModalPredecessor = ({ task, ganttData, isModalVisible, setIsModalVisible, infoParentComponent }: IModalPredecessor) => {
  const { t } = useTranslation('gantt');
  const dispatch = useAppDispatch();
  const [dataSource, setDataSource] = useState<IDataPredecessor[]>([]);
  const issues = useAppSelector(getIssueByVersion());
  const issueRelationshipData = useAppSelector(getIssueRelationshipParent());
  const allChildissueRelationshipData = useAppSelector(getAllChildRelationship());
  const isLoadingRelationship = useAppSelector(getLoading(IssueRelationship.getParentIssueRelationshipByIssue));
  const isLoadingAllChildRelationship = useAppSelector(getLoading(IssueRelationship.getAllChildIssueRelationShipFromId));
  const columns = [
    {
      title: t("Predecessor.ID"),
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (text: any, record: { key: string; }) => (
        <span className={styles.tableId} >{text}</span>
      ),
    },
    {
      title: t("Predecessor.TaskName"),
      dataIndex: 'taskName',
      key: 'taskName',
      width: 440,
      render: (text: any, record: { key: string; }) => {
        // Sắp xếp ganttData theo id
        const sortedGanttData = ganttData.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateA - dateB;
        });
        const options: any[] | undefined = [];
        sortedGanttData.forEach((d) =>
          // [20946][dung_llt][21/11/2024] thêm bộ lọc các task tiền nhiệm không phải category
          d.id && d.id !== task?.id && !d.isCategory && (
            options.push({value: d.id, label: d.text})
          )
        )
        return (
          <Select
            showSearch
            className={styles.tableTaskName}
            value={text}
            onChange={(value) => handleInputChange(value, record.key, 'taskName')}
            optionFilterProp="label"
            options={options}
          />
        );
      },
    },
    {
      title: t("Predecessor.Type"),
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (text: any, record: { key: string; }) => (
        <Select
          className={styles.tableType}
          value={text}
          onChange={(value) => handleInputChange(value, record.key, 'type')}
        >
          <Select.Option value={EPredecessorType.StartToStart}>{EPredecessorType.StartToStart}</Select.Option>
          <Select.Option value={EPredecessorType.FinishToStart}>{EPredecessorType.FinishToStart}</Select.Option>
          <Select.Option value={EPredecessorType.StartToFinish}>{EPredecessorType.StartToFinish}</Select.Option>
          <Select.Option value={EPredecessorType.FinishToFinish}>{EPredecessorType.FinishToFinish}</Select.Option>
        </Select>
      ),
    },
    {
      title: t("Predecessor.Lag"),
      dataIndex: 'lag',
      key: 'lag',
      width: 120,
      render: (text: string, record: { key: string; }) => (
        <InputNumber
          className={styles.tableLag}
          defaultValue={'0'}
          value={text}
          addonAfter="d"
          onChange={(e) => handleInputChange(e, record.key, 'lag')}
        />
      ),
    },
    {
      title: "",
      dataIndex: 'delete',
      key: 'delete',
      width: 30,
      render: (text: string, record: { key: string; }) => (
        <Button
          className={styles.tableBtn}
          icon={<DeleteOutlined />}
          danger
          size="small"
          type="text"
          onClick={() => handleDeleteRow(record.key)}
        />
      ),
    },
  ];
  
  const handleDeleteRow = (key: string) => {
    const newDataSource:IDataPredecessor = {
      key: '',
      id: '',
      taskName: '',
      type: EPredecessorType.FinishToStart,
      lag: 0
    };
    setDataSource([newDataSource]);
  }

  const handleInputChange = (value: any, key: string, column: string) => {
    const newDataSource = [...dataSource];
    const index = newDataSource.findIndex((item) => key === item.key);
    if (index > -1) {
      const item = newDataSource[index];
      if (column === 'taskName') {
        const issue = ganttData.find((d) => d.id === value);
        newDataSource.splice(index, 1, { ...item, [column]: issue?.text || value, id: value });
      } else {
        newDataSource.splice(index, 1, { ...item, [column]: value });
      }
      setDataSource(newDataSource);
    }
  };
 
  const handleOk = () => {
    // không có datasoure tức là không có công việc tiền nhiệm nhưng có issueRelationShipData thì công việc tiền nhiệm đã bị xóa
    if (!dataSource[0].id && issueRelationshipData) {
      const relationship = Array.isArray(issueRelationshipData) ? issueRelationshipData[0] : issueRelationshipData;
      if (relationship && relationship.issueFirstId && relationship.issueSecondId) {
        dispatch(issueActions.removeIssueRelationship({
          issueFirstId: relationship.issueFirstId,
          issueSecondId: relationship.issueSecondId,
          param: {},
        }));
      }
      setIsModalVisible(false);
      return ;
    }
    //  [#20775][dung_lt][06/11/2024] kiểm tra xem issue này đã có mỗi quan hệ nào chưa
    if (issueRelationshipData && issueRelationshipData.length > 0) {
      const relationship = Array.isArray(issueRelationshipData) ? issueRelationshipData[0] : issueRelationshipData;
      //  [#20775][dung_lt][06/11/2024] kiểm tra có phải update thông tin của issue 2 hay không
      if (relationship && checkUpdateSecondIssue(relationship)) {
        const predecessorItem: IDataPredecessor | null = dataSource.length > 0 ? dataSource[0] : null;
        if (predecessorItem) {
          const lag = predecessorItem.lag || 0;
          const dataUpdate: RelationshipUpdateDTO = {
            relationshipId: Utils.getValueByPredecessorType(predecessorItem.type),
            relationshipCode: predecessorItem.type,
            dayRelationship: lag,
            durationRelationship: lag,
            type: 0,
          }
          dispatch(issueActions.updateRealtionship({
            issueFirstId: relationship.issueFirstId,
            issueSecondId: relationship.issueSecondId,
            issueRelationship: dataUpdate,
            param: {},
          }));
          const firstIssue = issues?.results.find((i) => i.id === relationship.issueFirstId);
          const secondIssue = issues?.results.find((i) => i.id === relationship.issueSecondId);
          if (firstIssue && secondIssue) {
            const firstItem: IMultiIssueUpdateDate = {
              id: firstIssue.id,
              planeStart: firstIssue.plannedStartDate,
              planeEnd: firstIssue.plannedEndDate,
            }
            const secondItem: IMultiIssueUpdateDate = {
              id: secondIssue.id,
              planeStart: secondIssue.plannedStartDate,
              planeEnd: secondIssue.plannedEndDate,
            }
            const [sDate, eDate] = calNewDateOfFirstIssue(firstItem, secondItem, Utils.getValueByPredecessorType(predecessorItem.type), lag )
            if (sDate && eDate) {
              const listUpdateIssue: IMultiIssueUpdateDate[] = []
              const item: IMultiIssueUpdateDate = { id: firstIssue.id,  planeStart: sDate, planeEnd: eDate}
              listUpdateIssue.push(item);
              calUpdateDateOfChildRelationShip(listUpdateIssue);
              dispatch(issueActions.updateMultiIssueDateRequest({ 
                data: listUpdateIssue, 
                tagVersionId: infoParentComponent.tagVersionId, 
                typeUpdate: infoParentComponent.typeUpdate, 
              }));
            //   dispatch(issueActions.updateIssueRequest({ 
            //     issueId: item.id, 
            //     issue: item, 
            //     tagVersionId: infoParentComponent.tagVersionId, 
            //     typeUpdate: infoParentComponent.typeUpdate, 
            //   }));
            }
          }
        }
        setIsModalVisible(false);
        return ;
      }
      //  [#20775][dung_lt][06/11/2024] kiểm tra có phải thay đổi đổi issue tiền nhiệm không
      if (relationship && checkChangeSecondIssue(relationship)) {
        dispatch(issueActions.removeIssueRelationship({
          issueFirstId: relationship.issueFirstId,
          issueSecondId: relationship.issueSecondId,
          param: {},
        }));
        createNewRelationship();
      }
    } else {
      createNewRelationship();
    }
    
    setIsModalVisible(false);
  };

  //  [#20775][dung_lt][06/11/2024] hàm tạo mới một relationship
  const createNewRelationship = () => {
    const predecessorItem: IDataPredecessor | null = dataSource.length > 0 ? dataSource[0] : null;
    if (predecessorItem) {
      const lag = predecessorItem.lag || 0;
      const dataPost: RelationshipDTO = {
        issueFirstId: Number(task?.id),
        issueSecondId: Number(predecessorItem.id),
        relationshipId: Utils.getValueByPredecessorType(predecessorItem.type),
        relationshipCode: predecessorItem.type,
        dayRelationship: lag,
        durationRelationship: lag,
        type: 0,
      }
      dispatch(issueActions.createRealtionship({
        data: dataPost,
        param: {},
      }));
      const firstIssue = issues?.results.find((i) => i.id === Number(task?.id));
      const secondIssue = issues?.results.find((i) => i.id === Number(predecessorItem.id));
      if (firstIssue && secondIssue) {
        const firstItem: IMultiIssueUpdateDate = {
          id: firstIssue.id,
          planeStart: firstIssue.plannedStartDate,
          planeEnd: firstIssue.plannedEndDate,
        }
        const secondItem: IMultiIssueUpdateDate = {
          id: secondIssue.id,
          planeStart: secondIssue.plannedStartDate,
          planeEnd: secondIssue.plannedEndDate,
        }
        const [sDate, eDate] = calNewDateOfFirstIssue(firstItem, secondItem, Utils.getValueByPredecessorType(predecessorItem.type), lag )
        if (sDate && eDate) {
          const listUpdateIssue: IMultiIssueUpdateDate[] = []
            const item: IMultiIssueUpdateDate = { id: firstIssue.id,  planeStart: sDate, planeEnd: eDate}
            listUpdateIssue.push(item);
            calUpdateDateOfChildRelationShip(listUpdateIssue);
            dispatch(issueActions.updateMultiIssueDateRequest({ 
              data: listUpdateIssue, 
              tagVersionId: infoParentComponent.tagVersionId, 
              typeUpdate: infoParentComponent.typeUpdate, 
            }));
          // const item = { ...firstIssue,  plannedStartDate: sDate, plannedEndDate: eDate}
          // dispatch(issueActions.updateIssueRequest({ 
          //   issueId: item.id, 
          //   issue: item, 
          //   tagVersionId: infoParentComponent.tagVersionId, 
          //   typeUpdate: infoParentComponent.typeUpdate, 
          // }));
        }
      }
    }
  }

  const calNewDateOfFirstIssue = (firstIssue: IMultiIssueUpdateDate, secondIssue: IMultiIssueUpdateDate, type: number, lag: number) => {
    switch (type) {
      // EPredecessorType {
      //   FinishToStart = 'FinishToStart', // 1
      //   StartToStart = 'StartToStart', // 2
      //   FinishToFinish = 'FinishToFinish', // 3
      //   StartToFinish = 'StartToFinish', // 4
      // }
      case 1:
        {
          // finish second + 1 = start first
          if (secondIssue.planeEnd) {
            const plannedSDate = Utils.calDateWithRelationship(secondIssue.planeEnd.toString(), lag + 1);
            const duration = dayjs(firstIssue.planeEnd).diff(dayjs(firstIssue.planeStart), 'day') | 0;
            const plannedEDate = Utils.calDateWithRelationship(secondIssue.planeEnd.toString(), lag + 1 + duration);
            return [plannedSDate.format(FormatDateAPI), plannedEDate.format(FormatDateAPI)];
          }
          break;
        }
      case 2:
        {
           // start second = start first
           if (secondIssue.planeStart) {
            const plannedSDate = Utils.calDateWithRelationship(secondIssue.planeStart.toString(), lag);
            const duration = dayjs(firstIssue.planeEnd).diff(dayjs(firstIssue.planeStart), 'day') | 0;
            const plannedEDate = Utils.calDateWithRelationship(secondIssue.planeStart.toString(), lag + duration);
            return [plannedSDate.format(FormatDateAPI), plannedEDate.format(FormatDateAPI)];
          }
          break;
        }
      
      case 3:
        {
          // finish second = finish first
          if (secondIssue.planeEnd) {
            const plannedEDate = Utils.calDateWithRelationship(secondIssue.planeEnd.toString(), lag);
            const duration = dayjs(firstIssue.planeEnd).diff(dayjs(firstIssue.planeStart), 'day') | 0;
            const plannedSDate = Utils.calDateWithRelationship(secondIssue.planeEnd.toString(), lag - duration);
            return [plannedSDate.format(FormatDateAPI), plannedEDate.format(FormatDateAPI)];
         }
         break;
       }
       case 4:
        {
          // start second = finish first
          if (secondIssue.planeStart) {
           const plannedEDate = Utils.calDateWithRelationship(secondIssue.planeStart.toString(), lag);
           const duration = dayjs(firstIssue.planeEnd).diff(dayjs(firstIssue.planeStart), 'day') | 0;
           const plannedSDate = Utils.calDateWithRelationship(secondIssue.planeStart.toString(), lag - duration);
          return [plannedSDate.format(FormatDateAPI), plannedEDate.format(FormatDateAPI)];
         }
         break;
       }
      default:
        return [null, null];
    }
    return [null, null];
  }
  const checkUpdateSecondIssue = (relationship: RelationshipDTO) => {
    const curRelationship: IDataPredecessor = dataSource[0];
    if (!curRelationship || !curRelationship.id) return false;
    if (+curRelationship.id === relationship.issueSecondId
      && (curRelationship.type !== Utils.getPredecessorTypeByValue(relationship.relationshipId)
      || curRelationship.lag !== relationship.dayRelationship)) return true;
    return false;
  }

  const checkChangeSecondIssue = (relationship: RelationshipDTO) => {
    const curRelationship: IDataPredecessor = dataSource[0];
    if (!curRelationship || !curRelationship.id) return false;
    if (+curRelationship.id && !relationship) return true;
    if (+curRelationship.id !== relationship.issueSecondId) return true;
    return false;
  }
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const calUpdateDateOfChildRelationShip = (listUpdateIssue: IMultiIssueUpdateDate[]) => {
    if (allChildissueRelationshipData && allChildissueRelationshipData.length > 0) {
      allChildissueRelationshipData.forEach((child) => {
        if (child.issueFirst && child.issueSecondId) {
          const secondItem = listUpdateIssue.find((l) => l.id === child.issueSecondId);
          const firstItem: IMultiIssueUpdateDate = {
            id: child.issueFirst.id,
            planeStart: child.issueFirst.plannedStartDate,
            planeEnd: child.issueFirst.plannedEndDate,
          }
          if (secondItem && firstItem) {
            const [sDate, eDate] = calNewDateOfFirstIssue(firstItem, secondItem, child.relationshipId, child.dayRelationship )
          if (sDate && eDate) {
              const item: IMultiIssueUpdateDate = { id: firstItem.id,  planeStart: sDate, planeEnd: eDate};
              listUpdateIssue.push(item);
            }
          }
        }
      })
    }
  }

  useEffect(() => {
    if(isModalVisible && task?.id) {
      dispatch(
        issueActions.getParentIssueRelationshipByIssueRequest({
          issueId: Number(task?.id),
          param: {},
        }),
      );
      dispatch(
        issueActions.getAllChildIssueRelationShipFromIdRequest({
          issueId: Number(task?.id),
          param: {},
        }),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible]);

  useEffect(() => {
    if(issueRelationshipData) {
      let key = 0;
      const relationship = Array.isArray(issueRelationshipData) ? issueRelationshipData[0] : issueRelationshipData;
      const item: IDataPredecessor = {
        key: key.toString(),
        id: relationship?.issueSecondId?.toString(),
        taskName: relationship?.issueSecond?.subject || '',
        type: Utils.getPredecessorTypeByValue(relationship?.issueSecondId ? relationship.relationshipId : 1),
        lag: relationship?.dayRelationship || 0
      }
      setDataSource([item]);
    }
  }, [issueRelationshipData]);
  return (
    <Modal
          className={styles.ModalPredecessor}
          title= {t("Predecessor.title")}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div className={styles.currentTask}>
            <div className={styles.currentTaskName}>
              <label htmlFor="name">{t("Predecessor.Name")}:</label>
              <Input disabled id="name" className={styles.inputField} value={task?.text || ''}/>
            </div>
            <div className={styles.currentTaskDuration}>
              <label htmlFor="duration">{t("Predecessor.Duration")}:</label>
              <Input
               disabled
               id="duration"
               className={styles.inputField}
               min={0}
               addonAfter="d" 
               value={(task?.duration || 0) + 1}/>
            </div>
          </div>
          <div>
            <div className={styles.tableHeader}>
              <Typography.Title level={5}>{t('Predecessor.Predecessor')}</Typography.Title>
            </div>
            {
              isLoadingRelationship || isLoadingAllChildRelationship
              ? <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '500px'
              }}
            >
              <Spin size="large" />
            </div>
              : <Table dataSource={dataSource} columns={columns} pagination={false} style={{ maxHeight: '500px'}}/>
            }
          </div>
        </Modal>
  );
};

export default ModalPredecessor;
