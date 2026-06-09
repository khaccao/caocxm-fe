import { Modal, Typography } from 'antd';
const Confirm: React.FC<{
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  notification: string;
  buttons: {
    ok: {
      label: string;
      action: () => void;
    };
    cancel: {
      label: string;
      action: () => void;
    };
  };
}> = ({ modalVisible, setModalVisible, notification, buttons }) => {
  return (
    <Modal open={modalVisible} onOk={buttons.ok.action} onCancel={buttons.cancel.action} width={300}>
      <Typography.Text style={{fontSize: 20}}>{notification}</Typography.Text>
    </Modal>
  );
};

export default Confirm;
