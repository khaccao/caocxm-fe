import { Button, Flex, Modal, Splitter, Checkbox, Image } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import styles from '../IncidentalCard.module.css';
import { IAttachmentLinks } from '@/services/AccountingInvoiceService';
import Utils from '@/utils';

// ------------------------------------------------------------------------

interface AttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAddClick: () => void;
  onDeleteClick: () => void;
  onAttachClick: (attach: IAttachmentLinks) => void;
  onCheckboxChange: (id: number, checked: boolean) => void;
  onSelectAllChange: (e: CheckboxChangeEvent) => void;
  selectAll: boolean;
  attachments?: IAttachmentLinks[];
  selectedAttach?: IAttachmentLinks;
  sizes: (number | string)[];
  onResize: (sizes: (number | string)[]) => void;
  type?: string;
}

export default function AttachmentModal({
  visible,
  onClose,
  onAddClick,
  onDeleteClick,
  onAttachClick,
  onCheckboxChange,
  onSelectAllChange,
  selectAll,
  attachments,
  selectedAttach,
  sizes,
  onResize,
  type = 'view',
}: AttachmentModalProps): React.JSX.Element {
  return (
    <Modal
      title={`Hình ảnh đính kèm (${attachments?.length ?? 0})`}
      centered
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      width={750}
      footer={
        type !== 'view'
          ? [
              <div key="footer" style={{ display: 'flex' }}>
                <Button type="primary" key="Add" onClick={onAddClick}>
                  Thêm
                </Button>
                <Button
                  style={{ backgroundColor: '#CC0000', color: 'white', marginLeft: 150 }}
                  key="Delete"
                  onClick={onDeleteClick}
                >
                  Xóa
                </Button>
              </div>,
            ]
          : null
      }
    >
      <Splitter onResize={onResize} className={styles.model}>
        <Splitter.Panel size={sizes[0]} resizable={true}>
          <div style={{ overflowY: 'auto', alignItems: 'center' }}>
            <div style={{ padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox checked={selectAll} onChange={onSelectAllChange} style={{ color: 'black', fontWeight: '500' }}>
                {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Checkbox>
            </div>

            {attachments?.map((attach: IAttachmentLinks) => (
              <div
                key={attach.id}
                className={styles.rowItem}
                style={{
                  background: attach.selected ? '#1890ff' : 'white',
                  color: attach.selected ? 'white' : 'black',
                }}
              >
                <Flex
                  vertical={false}
                  style={{ gap: 5, cursor: 'pointer', width: '100%' }}
                  onClick={() => onAttachClick(attach)}
                >
                  <Checkbox checked={attach.selected} onChange={e => onCheckboxChange(attach.id, e.target.checked)} />
                  <div className={`${styles.fontMedium} ${styles.truncateText}`}>
                    {Utils.getFileNmeWithoutExtension(attach.fileName)}
                  </div>
                </Flex>
              </div>
            ))}
          </div>
        </Splitter.Panel>

        <Splitter.Panel size={sizes[1]}>
          {selectedAttach?.imageUrl && (
            <Image width="100%" height="100%" src={selectedAttach.imageUrl} style={{ objectFit: 'contain' }} />
          )}
        </Splitter.Panel>
      </Splitter>
    </Modal>
  );
}
