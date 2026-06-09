import { useEffect, useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Row, Col, Typography, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { WeeklyAssignmenttatusOptions } from '../WeeklyAssignmentStatusOptions';
import { CreateUpdateWorkWeeklyModalName } from '@/common/define';
import { CheckItemsDTO, Preparation } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getSelectedChecklistsTeam, issueActions } from '@/store/issue';
import { showModal } from '@/store/modal';

export interface StatusWorksProps {
  data: Preparation;
  isFirst?: boolean;
  isLast?: boolean;
  onChange: any;
  onClickRow?: any;
}
export const StatusWorks = ({ data, isFirst, isLast, onChange, onClickRow }: StatusWorksProps) => {
  const selectedChecklistsTeam = useAppSelector(getSelectedChecklistsTeam());
  const { t } = useTranslation('weeklyAssignment');
  const dispatch = useAppDispatch();
  const [openModel, setOpenModel] = useState<boolean>(false);
  const { 
    name, 
    // works, 
    checkItems 
  } = data;

  const handleChange = (value: any, work: CheckItemsDTO) => {
    onChange(value, work);
    setComplete(getStatus());
  };
  const getStatus = () => {
    const complete = checkItems ? checkItems.reduce((accumulator, currentValue) => {
      if (currentValue.status === 1 || currentValue.status === 2) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0) : 0;
    return complete;
  };
  
  useEffect(() => {
    const complete = checkItems ? checkItems?.reduce((accumulator, currentValue) => {
      if (currentValue.status === 1 || currentValue.status === 2) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0) : 0;
    setComplete(complete);
  }, [checkItems]);

  useEffect(()=>{
    setOpenModel(false);
    if (openModel) dispatch(showModal({ key: CreateUpdateWorkWeeklyModalName }));
  }, [selectedChecklistsTeam])
  
  const [complete, setComplete] = useState(getStatus());
  function handleClickWork(workPrepare: any): void {
    setOpenModel(true);
    dispatch(issueActions.getTeamsIdsByCheckItemIdRequest({id: workPrepare.id}))
    dispatch(issueActions.setSelectedChecklistItem(workPrepare));
  }

  return (
    <Space
      direction={'vertical'}
      style={{
        padding: '0px',
        borderTop: isFirst ? '1px solid gray' : '',
        borderBottom: '1px solid gray',
        borderLeft: '1px solid gray',
        borderRight: '1px solid gray',
        borderTopLeftRadius: isFirst ? '8px' : 0,
        borderTopRightRadius: isFirst ? '8px' : 0,
        borderBottomLeftRadius: isLast ? '8px' : 0,
        borderBottomRightRadius: isLast ? '8px' : 0,
      }}
    >
      <Row
        style={{
          background: '#EBE7E7',
          borderTopLeftRadius: isFirst ? '8px' : 0,
          borderTopRightRadius: isFirst ? '8px' : 0,
          height: '35px',
          minWidth: '752px',
        }}
      >
        <Col
          span={19}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}
        >
          <Typography.Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{name}</Typography.Text>
        </Col>
        <Col span={5} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'end' }}>
          <Typography.Text style={{ color: 'green', paddingRight: 10 }}>{`\u2022 ${t('Complete')} ${complete}/${
            checkItems ? checkItems?.length : 0
          }`}</Typography.Text>
        </Col>
      </Row>
      <Space direction={'vertical'} style={{ width: '100%' }}>
        {
          <div style={{ paddingBottom: 10 }}>
            {checkItems?.map(w => (
              <Row
                key={`status-${w.id}`}
                style={{
                  margin: '10px 0px',
                  minWidth: '752px',
                }}
              >
                <Col
                  span={17}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}
                >
                  <Typography.Text style={{ paddingLeft: 10 }}>{w.subject}</Typography.Text>
                </Col>
                <Col
                  span={7}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'end' }}
                >
                  <Space style={{ paddingRight: 10 }}>
                    {/* {w.linkImage.length > 0 && (
                      <Button shape={'default'} size="small">
                        <FileImageOutlined />
                      </Button>
                    )} */}
                    <Button
                      shape={'default'}
                      size="small"
                      onClick={() => {
                        handleClickWork(w);
                      }}
                    >
                      <EditOutlined />
                    </Button>
                    <WeeklyAssignmenttatusOptions checkItem={w} onChange={handleChange} />
                  </Space>
                </Col>
              </Row>
            ))}
          </div>
        }
      </Space>
    </Space>
  );
};
