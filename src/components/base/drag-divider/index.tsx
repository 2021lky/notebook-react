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
  const [leftWidth, setLeftWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null); 

  const handleMouseDown = () => {
    // 用 React 合成事件类型
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
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const newWidth = e.clientX;  // 根据鼠标位置全局位置宽度
    // 宽度需要减去padding left 和 padding right 的像素，要不然容易报错
    setLeftWidth(newWidth - containerLeft);
  }

  return (
    <div ref={containerRef} 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex ${classNameWrapper}`} style={{ width: '100%', height: '100%' }}
    >
        <div style={{ width: leftWidth > (minLeftWidth || 0) ? `${leftWidth}px` : `${minLeftWidth}px` }}>
            {childrenLeft}
        </div>
        <div 
            className={`cursor-col-resize select-none w-1 h-full bg-gray-200 rounded-sm ${className}`} 
            onMouseDown={handleMouseDown}
        >
        </div>
        <div className="flex-1 min-w-[400px]">
            {childrenRight}
        </div>
    </div>
  )
}

export default DragDivider
