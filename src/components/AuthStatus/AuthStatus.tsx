import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks';

export const AuthStatus = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.user) {
    return (
      <p>
        You are not logged in. <Button onClick={() => navigate('/login')}>Sign in</Button>
      </p>
    );
  }

  return (
    <p>
      Welcome {auth?.user?.username}!{' '}
      <Button
        onClick={() => {
          auth.signout(() => navigate('/public'));
        }}
      >
        Sign out
      </Button>
    </p>
  );
};
