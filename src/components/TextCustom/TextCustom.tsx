import { Typography, Space } from 'antd';

export interface TextCustomProps {
  text: string | undefined;
  icon?: any;
  textColor?: string;
  padding?: string;
}

export const TextCustom = ({ text, icon, textColor, padding }: TextCustomProps) => {
  return (
    <Space style={{padding: padding}}>
      {icon ? icon : null}
      <Typography.Text style={{ color: textColor ? textColor: '' }}>{text}</Typography.Text>
    </Space>
  );
};
