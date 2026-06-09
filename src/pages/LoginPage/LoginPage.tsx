import { useEffect } from 'react';

import { LockOutlined, UserOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Space, Tooltip, Typography, notification } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import styles from './LoginPage.module.less';
import { EButtonState, LoginInput } from '@/common/define';
import { useAuth, useReduxStore } from '@/hooks';
import LogoNVH from '@/image/LogoNVH.svg';
import { persistConfigStorage } from '@/store';
import { appActions, getCaptcha } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { changeStoreConfig } = useReduxStore();
  const { t } = useTranslation(['login']);
  const dispatch = useAppDispatch();
  const captcha = useAppSelector(getCaptcha());

  const from = location.state?.from?.pathname || '/';

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t('Require username')),
    password: Yup.string().required(t('Require password')),
    captcha: captcha ? Yup.string().required(t('Require captcha')) : Yup.string().optional(),
  });

  useEffect(() => {
    dispatch(appActions.setCaptcha(undefined));
    sessionStorage.setItem(EButtonState.KeHoachTamUng12, 'false');
    sessionStorage.setItem(EButtonState.KeHoachTamUng27, 'false');
    sessionStorage.setItem(EButtonState.KeHoachThanhToan05, 'false');
    sessionStorage.setItem(EButtonState.KeHoachThanhToan20, 'false');
    // sau khi logout, và dữ liệu trong store được xóa hết thì thiết lập lại redux
    // setTimeout(() => {
    //   changeStoreConfig(persistConfigStorage);
    // }, 200)
    // eslint-disable-next-line
  }, []);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      remember: true,
    },
    validationSchema,
    onSubmit: (values: LoginInput) => {
      handleLogin(values);
    },
  });

  // const handleLogin = (values: LoginInput) => {
  //   if (values) {
  //     auth.signin({ ...values, captchaId: captcha?.CaptchaId, remember: true }, () => {
  //       // Send them back to the page they tried to visit when they were
  //       // redirected to the login page. Use { replace: true } so we don't create
  //       // another entry in the history stack for the login page.  This means that
  //       // when they get to the protected page and click the back button, they
  //       // won't end up back on the login page, which is also really nice for the
  //       // user experience.
  //       navigate(from === '/' ? '/projects' : from, { replace: true });
  //     });
  //   }
  // };

  const handleLogin = (values: LoginInput) => {
    if (values) {
      auth.signin({ ...values, captchaId: captcha?.CaptchaId }, () => {
        navigate(from, { replace: true });
      });
    } else {
      navigate('Projects', { replace: true });
    }
  };

  //[#20992][hoang_nm][28/11/2024] Fix bấm login 1 lần chưa vào được projectPage
  useEffect(() => {
    if (formik.values.username && formik.values.password) {
      dispatch(
        appActions.setLoginInput({
          usernameLogin: formik.values.username,
          passwordLogin: formik.values.password,
        }),
      );
    }
  }, [formik.values, dispatch]);


  const handleRefreshCaptcha = () => {
    const { username, password, remember } = formik.values;
    const loginData: LoginInput = { username, password, remember };
    dispatch(appActions.loginRequest({ input: loginData }));
  };

  const onChangeRememberMe = (evt: CheckboxChangeEvent) => {
    evt.target.checked ? changeStoreConfig(persistConfigStorage) : changeStoreConfig({});
    formik.handleChange(evt);
  };

  return (
    <div className={styles.loginContainer}>
      <Form
        layout="vertical"
        name={'login'}
        initialValues={formik.initialValues}
        onFinish={formik.handleSubmit}
        requiredMark={false}
        className={styles.loginForm}
      >
        <div className={styles.logoContainer}>
          <img src={LogoNVH} alt="Logo" className={styles.logo} />
        </div>
        <Form.Item
          required
          help={formik.touched.username && formik.errors.username}
          validateStatus={formik.touched.username && formik.errors.username ? 'error' : ''}
          className={styles.formItem}
        >
          <Input
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            size="large"
            placeholder={t('Username')}
            className={styles.customInput}
            prefix={<UserOutlined className={styles.anticonOutlined} />}
          />
        </Form.Item>
        <Form.Item
          required
          help={formik.touched.password && formik.errors.password}
          validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
          className={styles.formItem}
        >
          <Input.Password
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            size="large"
            placeholder={t('Password')}
            className={styles.customInput}
            prefix={<LockOutlined className={styles.anticonOutlined} />}
          />
        </Form.Item>
        {captcha?.Captcha && (
          <Form.Item
            className={styles.formItem}
            required
            help={formik.touched.captcha && formik.errors.captcha}
            validateStatus={formik.touched.captcha && formik.errors.captcha ? 'error' : ''}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item noStyle>
                <Input
                  name="captcha"
                  value={formik.values.captcha}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  size="large"
                  className={styles.customInput}
                  placeholder={t('Require captcha')}
                  style={{ width: 'calc(100% - 165px)' }}
                />
              </Form.Item>
              <img
                src={`data:image/png;base64,${captcha.Captcha}`}
                alt="captcha"
                style={{ width: 112, margin: '0px 5px 0px 5px', border: '1px solid #d9d9d9', objectFit: 'contain' }}
              />
              <Tooltip title="Lấy mã xác thực mới">
                <Button
                  style={{ width: 42 }}
                  size="large"
                  type="text"
                  icon={<SyncOutlined style={{ fontSize: 24 }} />}
                  onClick={handleRefreshCaptcha}
                />
              </Tooltip>
            </Space.Compact>
          </Form.Item>
        )}
        <div className={styles.saveAndForgetContainer}>
          <Form.Item>
            <Checkbox name="remember" checked={formik.values.remember} onChange={onChangeRememberMe}>
              <Typography.Text className={styles.textStyle}>{t('Remember')}</Typography.Text>
            </Checkbox>
          </Form.Item> 
          <Typography.Text
            className={styles.Link}
            onClick={() => {
              notification.warning({
                message: t('Forget password Notify'),
              });
            }}
          >
            {t('Forget password')}
          </Typography.Text>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.loginButton}>
            <Typography.Text className={styles.loginButtonText}>{t('Login')}</Typography.Text>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
