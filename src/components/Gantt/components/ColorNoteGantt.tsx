import React, { useState } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { List } from 'antd';
import { useTranslation } from 'react-i18next';

import styles from './ColorNoteGantt.module.less';
import { IItemColorNote, ItemColorNotes } from '@/common/define';



const ColorNoteGantt = () => {
  const { t } = useTranslation('gantt');
  const [visible, setVisible] = useState(true);
  const data = new ItemColorNotes(t, styles);
  
  const LegendItem = (item: IItemColorNote) => (
    <List.Item className={styles.listItem__wrapper}>
      <div className={`${styles.colorBlock} ${item.className}`}></div>
      <span className={styles.itemLabel}>{item.label}</span>
    </List.Item>
  );
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      {
        visible && (
          <div className={styles.ColorNote__wraper} >
            <div className={styles.headerWrapper}>
              <span className={styles.headerText}>{t('Color note')}</span>
              <CloseOutlined className={styles.btnClose} onClick={handleClose}/>
            </div>
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={data.getItems()}
              renderItem={item => <LegendItem {...item} />}
            />
          </div>
        )
      }
    </>
  );
};

export default ColorNoteGantt;
