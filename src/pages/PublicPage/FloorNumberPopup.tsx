import React, { useState } from 'react';

import { Modal, Button, Input, Checkbox, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './FloorNumberPopup.module.less';
import { sMilestone } from '@/common/define';
import { getCurrentCompany } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { importFileActions } from '@/store/importFile';

interface FloorNumberPopupProps {
  visible: boolean;
  tagVersionCode: string; 
  onClose: () => void;
}

const FloorNumberPopup: React.FC<FloorNumberPopupProps> = ({ visible, onClose, tagVersionCode }) => {
  const [levelCount, setLevelCount] = useState<number | null>(null);
  const [isMezzanine, setIsMezzanine] = useState(false);
  const [isTechnicalFloors, setIsTechnicalFloors] = useState(false);
  const [isRooftopFloor, setIsRooftopFloor] = useState(false);
  const [numberBasements, setNumberBasements] = useState<number | null>(null);
  const [nameBasements, setNameBasements] = useState<any | null>(null);
  const company = useAppSelector(getCurrentCompany());
  const dispatch = useAppDispatch();
  const { t } = useTranslation('publics');
  const handleSave = async () => {
    const body = {
      levelCount,
      isMezzanine,
      isTechnicalFloors,
      isRooftopFloor,
      floorsBasementCount: numberBasements ? numberBasements  : 0,
      subject: nameBasements ? nameBasements : '',
      isBasement: numberBasements! > 0 ? true : false,
    };

    if (company) {
      const companyId = company.id as number;
      const action = await dispatch(importFileActions.genIssueRequest({ companyId, tagVersionCode, body }));
      if (importFileActions.genIssueRequest.match(action)) {
        onClose();
      }
    }
  };

  return (
    <Modal
      title={t('FloorNumber.Enter number of floors')}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('FloorNumber.Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          {t('FloorNumber.Save')}
        </Button>,
      ]}
      width={400}
    >
      <div style={{ marginBottom: 16 }}>
        <h3>{t('FloorNumber.Basement')}</h3>
      </div>
      <Form layout="vertical">
        <Form.Item>
          <div className={styles.inputContainer}>
            <label htmlFor="levelCount" className={styles.inputLabel}>
              {t('FloorNumber.Number of floors')}:
            </label>
            <Input
              id="levelCount"
              type="number"
              placeholder={t('FloorNumber.Enter number of floors')}
              // value={levelCount ?? ''}
              onChange={(e) =>  setNumberBasements(+e.target.value)}
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputContainer} style={{paddingTop: 10}}>
            <label htmlFor="levelCount" className={styles.inputLabel}>
              {t('FloorNumber.Name of floors')}:
            </label>
            <Input
              id="namelevelCount"
              placeholder={t('FloorNumber.Enter name of floors')}
              onChange={(e) => setNameBasements(e.target.value)}
              className={styles.inputField}
              style={{marginLeft: 43}}
            />
          </div>
        </Form.Item>
      <div style={{ marginBottom: 16 }}>
        <h3>{t('FloorNumber.BODY PART')}</h3>
      </div>
        <Form.Item>
          <div className={styles.inputContainer}>
            <label htmlFor="levelCount" className={styles.inputLabel}>
              {t('FloorNumber.Number of floors')}:
            </label>
            <Input
              id="levelCount"
              type="number"
              placeholder={t('FloorNumber.Enter number of floors')}
              value={levelCount ?? ''}
              onChange={(e) => setLevelCount(Number(e.target.value))}
              className={styles.inputField}
            />
          </div>
        </Form.Item>
        <Form.Item>
          <Checkbox checked={isMezzanine} onChange={(e) => setIsMezzanine(e.target.checked)}>
            {t('FloorNumber.Mezzanine floor')}
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox checked={isTechnicalFloors} onChange={(e) => setIsTechnicalFloors(e.target.checked)}>
            {t('FloorNumber.Technical floor')}
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox checked={isRooftopFloor} onChange={(e) => setIsRooftopFloor(e.target.checked)}>
            {t('FloorNumber.Rooftop floor')}
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FloorNumberPopup;
