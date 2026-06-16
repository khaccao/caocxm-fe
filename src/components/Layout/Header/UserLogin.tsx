import { useEffect, useState } from 'react';

import { Avatar, Button, Form, Input, Menu, Modal, notification, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks';
import { useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store/types';
import { userActions } from '@/store/user';
import Utils from '@/utils';

export const UserLogin = () => {
  const { t } = useTranslation('layout');
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [isModalProfile, setIsModalProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //[#20926][hoang_nm][26/11/2024] lấy mật khẩu vừa đăng nhập vào từ compnent LoginPage sang component này
  const passwordLogin = useSelector((state: RootState) => state.app.password);
  const errorPassword = useSelector((state: RootState) => state.user.errorPassword);
  //[#20926][hoang_nm][26/11/2024] check nhập đủ 3 mục mới cho enable button Lưu thông tin
  const saveButton = !oldPassword || !newPassword || !confirmPassword;

  const handleNavigateOrgPage = () => {
    navigate('/organization');
    dispatch(userActions.setDefaultOrganization(undefined));
  };

  const handleSignout = () => {
    auth.signout(() => {
      navigate('/login');
    });
  };

  //[#20992][hoang_nm][28/11/2024] Check lỗi 500(đổi mật khẩu thành công) => logout ra để login lại
  useEffect(() => {
    if (errorPassword?.status === 500) {
      handleSignout();
    }
  }, [errorPassword]);

  const handleShowProfile = () => {
    setIsModalProfile(true);
  };

  const handleCancel = () => {
    setIsModalProfile(false);
  };

  const handleUpdatePassword = async () => {
    //[#20926][hoang_nm][26/11/2024] Kiểm tra mật khẩu cũ
    if (oldPassword !== passwordLogin) {
      notification.error({
        message: t('Mật khẩu cũ không đúng. Vui lòng kiểm tra lại.'),
      });
      return;
    }

    //[#20926][hoang_nm][26/11/2024] Kiểm tra xem đã khớp giữa mật khẩu mới và xác nhận mật khẩu mới
    if (newPassword !== confirmPassword) {
      notification.error({
        message: t('Mật khẩu mới và xác nhận mật khẩu mới không giống nhau.'),
      });
      return;
    }

    //[#20926][hoang_nm][26/11/2024] Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      notification.error({
        message: t('Mật khẩu mới phải có ít nhất 6 ký tự.'),
      });
      return;
    }

    //[#20926][hoang_nm][26/11/2024] Kiểm tra mật khẩu mới có ít nhất 1 chữ cái in hoa, 1 chữ cái in thường, 1 ký tự đặc biệt và 1 chữ số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      notification.error({
        message: t('Mật khẩu mới phải có ít nhất 1 chữ cái in hoa, 1 chữ cái in thường, 1 ký tự đặc biệt và 1 chữ số.'),
      });
      return;
    }

    try {
      //[#20926][hoang_nm][26/11/2024] Dispatch action cập nhật mật khẩu với requestbody là oldPass và newPass
      dispatch(userActions.updateUser({ oldPassword, newPassword }));
      handleCancel();
    } catch (error) {
      notification.error({
        message: t('Đã xảy ra lỗi khi cập nhật mật khẩu.'),
      });
    }
  };

  return (
    auth.user && (
      //[#20926][hoang_nm][26/11/2024] thêm menu item Đổi mật khẩu
      <>
        <p style={{ color: 'white', marginRight: 10 }}>{auth.user.Firstname ? `${auth.user.Firstname}`.trim() : ''}</p>
        <Popover
          content={
            <Menu style={{ borderInlineEnd: 0 }}>
              {/* <Menu.Item onClick={handleNavigateOrgPage}>{t('Chọn organization')}</Menu.Item> */}
              <Menu.Item onClick={handleShowProfile}>{t('Change Password')}</Menu.Item>
              <Menu.Item onClick={handleSignout}>{t('Sign out')}</Menu.Item>
            </Menu>
          }
          title={auth.user.Firstname ? `${auth.user.Lastname} ${auth.user.Firstname}`.trim() : ''}
          arrow={false}
        >
          <Avatar size={30} style={{ backgroundColor: Utils.stringToColour(auth.user.Id), cursor: 'pointer' }}>
            {auth.user?.Firstname ? auth.user.Firstname?.charAt(0) : ''}
          </Avatar>
        </Popover>

        <Modal
          //[#20926][hoang_nm][26/11/2024] thêm modal Đổi mật khẩu

          title={t('Change Password')}
          open={isModalProfile}
          onCancel={handleCancel}
          footer={[
            <Button
              type="primary"
              disabled={saveButton}
              onClick={handleUpdatePassword}
              style={{ width: '25%', marginTop: 20 }}
            >
              {t('Save info')}
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item
              label={t('Mật khẩu cũ')}
              name="oldPassword"
              rules={[
                { required: true, message: t('Vui lòng nhập mật khẩu cũ!') },
                {
                  validator: (_, value) => {
                    if (!value || value === passwordLogin) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('Mật khẩu cũ không đúng!')));
                  },
                },
              ]}
            >
              <Input.Password value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            </Form.Item>

            <Form.Item
              label={t('Mật khẩu mới')}
              name="newPassword"
              rules={[
                { required: true, message: t('Vui lòng nhập mật khẩu mới!') },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error(t('Vui lòng nhập mật khẩu mới!')));
                    }
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
                    if (!passwordRegex.test(value)) {
                      return Promise.reject(
                        new Error(
                          t(
                            'Mật khẩu mới phải có ít nhất 1 chữ cái in hoa, 1 chữ cái in thường, 1 ký tự đặc biệt và 1 chữ số!',
                          ),
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </Form.Item>

            <Form.Item
              label={t('Xác nhận mật khẩu mới')}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('Vui lòng nhập xác nhận mật khẩu mới!') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('Mật khẩu mới và xác nhận mật khẩu mới không giống nhau!')));
                  },
                }),
              ]}
            >
              <Input.Password value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  );
};
