
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {CheckOutlined, DeleteOutlined, UserAddOutlined  } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import styles from './TimeKeeping.module.less'

const MenuContext = ({record, visible, x, y, confirmRemoveIssue, handleEdit}: any) => {
  const { t } = useTranslation('timeKeeping')
  return (
   visible &&
  <ul className={styles.popup} style={{left: `${x}px`, top: `${y}px`}} key={record.key}>
    <li style={{background: '#E6F7FF'}} >{t('Edit time')}</li>
    <li
     onClick={(e: any) => {
      e.preventDefault()
      handleEdit(record)
    }} 
    >
      <CheckOutlined  type="heart-o"/>{t('Edit closing time')}
    </li>
    <hr></hr>
    {/* <li 
    onClick={(e: any) => {
      e.preventDefault()  
      confirmRemoveIssue(record[0], record)}} 
    >
      <DeleteOutlined  type="star-o"/>{t('Remove')}
    </li> */}
  </ul>
)}

export default MenuContext