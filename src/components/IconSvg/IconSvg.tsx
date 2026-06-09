import React from 'react';

import SVG from 'react-inlinesvg';

import { IconSvgType } from '@/common/define';

interface IconSvgProps {
  name: IconSvgType;
  width: number;
  color?: string;
}

/** 
 * copy icon svg vào thu mục icons trong public
 * sau đó thêm enum là tên của icon svg vào IconSvgEnum trong common/define.ts để sử dụng
*/
export const IconSvg = ({ name, width, color }: IconSvgProps) => {
  const publicUrl = process.env.PUBLIC_URL ?? '';

  return <>{SVG({ src: `${publicUrl}/icons/${name}.svg`, width, height: 'auto', fill: color })}</>;
};
