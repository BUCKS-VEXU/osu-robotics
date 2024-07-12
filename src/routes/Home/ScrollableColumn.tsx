/* Noah Klein */

import React, { useRef, useState, useEffect } from 'react';
import './ScrollableColumn.css';

interface ScrollableColumnProps {
  children: React.ReactNode;
  scrollPercent: number;
  largestColumnHeight: number;
  setColumnHeight: (height: number) => void;
  width: number;
  height: number;
}

const ScrollableColumn = ({ children, scrollPercent, largestColumnHeight, setColumnHeight, width, height }: ScrollableColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const [scrollTranslate, setScrollTranslate] = useState<number>(0);

  useEffect(() => {
    const column = columnRef.current;
    if (column) {
      setScrollTranslate(scrollPercent * (largestColumnHeight - column.clientHeight));
    }
  }, [scrollPercent, largestColumnHeight, width]);

  useEffect(() => {
    const column = columnRef.current;
    if (column)
      setColumnHeight(column.clientHeight);
    //eslint-disable-next-line
  }, [width, height]);

  return (
    <div className="scrollable-column" style={{ transform: `translate(0px, ${scrollTranslate}px)` }} ref={columnRef}>
      {children}
    </div>
  );
};

export default ScrollableColumn;
