import { useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const windowSizeHandler = () => {
      setWindowSize(current => {
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        return current[0] === nextWidth && current[1] === nextHeight
          ? current
          : [nextWidth, nextHeight];
      });
    };
    window.addEventListener('resize', windowSizeHandler);

    return () => {
      window.removeEventListener('resize', windowSizeHandler);
    };
  }, []);

  return windowSize;
};
