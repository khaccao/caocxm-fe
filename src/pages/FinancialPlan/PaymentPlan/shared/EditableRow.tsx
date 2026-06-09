import React from 'react';

import { Form } from 'antd';

import { EditableContext } from './EditableContext';

// ---------------------------------------------------

export const EditableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { index: number }
>((props, ref) => {
  const { index, ...restProps } = props;
  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr ref={ref} {...restProps} />
      </EditableContext.Provider>
    </Form>
  );
});

EditableRow.displayName = 'EditableRow';