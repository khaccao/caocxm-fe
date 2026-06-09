import { useState } from 'react';

// ---------------------------------------------

export default function ResizableColumn(props: any) {
  const { onResize, width, ...restProps } = props;
  const [isResizing, setIsResizing] = useState(false);
  const [tempWidth, setTempWidth] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width || 150;
    let currentWidth = startWidth;

    const resizeHandle = e.currentTarget;
    const th = resizeHandle?.parentElement;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      currentWidth = Math.max(50, startWidth + deltaX);
      setTempWidth(currentWidth);

      if (th) {
        th.style.width = `${currentWidth}px`;
        th.style.minWidth = `${currentWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setTempWidth(null);

      if (onResize && currentWidth !== startWidth) {
        onResize(currentWidth);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const displayWidth = tempWidth || width || 150;

  return (
    <th
      {...restProps}
      style={{
        ...restProps.style,
        position: 'relative',
        color: '#000',
        fontWeight: 600,
        textAlign: 'center',
        width: `${displayWidth}px`,
        minWidth: `${displayWidth}px`,
        transition: isResizing ? 'none' : 'width 0.1s ease',
      }}
    >
      {restProps.children}
      <div
        role="button"
        tabIndex={0}
        style={{
          position: 'absolute',
          right: '-5px',
          top: 0,
          bottom: 0,
          width: '10px',
          cursor: 'col-resize',
          zIndex: 10,
          backgroundColor: isResizing ? 'rgba(24, 144, 255, 0.2)' : 'transparent',
          borderRight: isResizing ? '2px solid #1890ff' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={e => {
          if (!isResizing) {
            e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
          }
        }}
        onMouseLeave={e => {
          if (!isResizing) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      />
    </th>
  );
}
