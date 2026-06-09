import React, { CSSProperties } from 'react';

interface SectionTitleProps {
  title: string;
  style?: CSSProperties;
}
export const SectionTitle = ({ title, style }: SectionTitleProps) => {
  return (
    <div
      style={{
        // display: 'flex',
        // alignItems: 'flex-end',
        fontWeight: 300,
        fontSize: '2rem',
        textAlign: 'center',
        lineHeight: '37.5px',
        gap: 6,
        textTransform: 'uppercase',
        letterSpacing: '8px',
        ...style,
      }}
    >
      {title}
      <span
        className="underscore"
        style={{ borderBottom: '2px solid #096DD9', whiteSpace: 'nowrap', userSelect: 'none' }}
      >
        &nbsp; &nbsp;
      </span>
    </div>
  );
};
