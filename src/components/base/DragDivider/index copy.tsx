import React, { useState, useRef } from "react"

type Props = {
    classNameWrapper?: string;
    className?: string;
    childrenLeft: React.ReactNode;
    childrenRight: React.ReactNode;
    minLeftWidth?: number;
}

const DragDivider = ({classNameWrapper, className, childrenLeft, childrenRight, minLeftWidth}: Props) => {
  const [isDragging, setIsDragging] = useState(false)
  const [leftWidth, setLeftWidth] = useState<number>(minLeftWidth ?? 0);
  const containerRef = useRef<HTMLDivElement>(null); 

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }
    if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // 鼠标位置减去容器左侧位置就是新的宽度
      const newWidth = e.clientX - rect.left;
      const min = minLeftWidth ?? 0;
      // 右侧至少保留 1px，避免把 divider 拖出容器外
      const clamped = Math.max(min, Math.min(newWidth, rect.width - 1));
      setLeftWidth(clamped);
  }

  return (
    <div ref={containerRef} 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex w-full h-screen ${classNameWrapper}`}
    >
        <div style={{ width: leftWidth > (minLeftWidth || 0) ? `${leftWidth}px` : `${minLeftWidth}px` }}>
            {childrenLeft}
        </div>
        <div 
            className={`cursor-col-resize select-none w-[2px] h-full bg-gray-200 rounded-sm ${className}`} 
            onMouseDown={handleMouseDown}
        >
        </div>
        <div className="flex-1 min-w-[400px]">
            {childrenRight}
        </div>
    </div>
  )
}

DragDivider.displayName = 'DragDivider'
export default DragDivider
