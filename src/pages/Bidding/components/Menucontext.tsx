
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {CheckOutlined, DeleteOutlined, UserAddOutlined  } from '@ant-design/icons';

import styles from '../Bidding.module.less'

const MenuContext = ({record, visible, x, y, countRows, confirmRemoveIssue, editIssue, t, handleStatusChange, approveProps, removeProps}: any) => {
  return (
   visible &&
  <ul className={styles.popup} style={{left: `${x}px`, top: `${y}px`}}>
    <li style={{background: '#E6F7FF'}}>{t('Selected')} : {record.length} {t('Work')}</li>
    {/* <li><UserAddOutlined type="user"/>Người Đảm Nhận</li> */}
    {
      approveProps?.hidden !== true &&
      <li
      onClick={(e: any) => {
        e.preventDefault()
        handleStatusChange(null,...record,true, record)
      }} 
      >
        <CheckOutlined  type="heart-o"/>{t('Browser')}</li>
    }
    <hr></hr>
    {
      removeProps?.hidden !== true &&
      <li 
      onClick={(e: any) => {
        e.preventDefault()  
        confirmRemoveIssue(record[0], record)}} 
      >
        <DeleteOutlined  type="star-o"/>{t('Remove')}</li>
    }
  </ul>
)}

export default MenuContext