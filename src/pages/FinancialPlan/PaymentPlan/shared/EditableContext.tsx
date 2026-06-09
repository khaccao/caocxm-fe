import React from 'react';

import { FormInstance } from 'antd/lib';

// ------------------------------------------

export const EditableContext = React.createContext<FormInstance | null>(null);