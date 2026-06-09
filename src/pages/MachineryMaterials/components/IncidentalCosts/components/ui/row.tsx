import React from 'react';

import { Form } from 'antd';

// --------------------------------------------------------

interface FormItemRowProps {
  label?: string;
  name?: string | string[];
  rules?: any[];
  children?: React.ReactNode;
  initialValue?: any;
}

export default function FormItemRow({ label, name, rules, children, initialValue }: FormItemRowProps): React.JSX.Element {
  return (
    <Form.Item label={label} name={name} rules={rules} initialValue={initialValue}>
      {children}
    </Form.Item>
  );
}