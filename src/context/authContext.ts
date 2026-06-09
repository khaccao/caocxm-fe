import * as React from 'react';

import { LoginInput } from '@/common/define';

interface AuthContextType {
  user: any;
  signin: (input: LoginInput, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

export const AuthContext = React.createContext<AuthContextType>(null!);