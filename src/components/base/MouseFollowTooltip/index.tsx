import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  delay?: number;
  className?: string;
  children?: ReactNode;
}

// 提示框位置
interface Position {
  left: number;
  top: number;
}

// 鼠标位置
interface MousePosition {
  x: number;
  y: number;
}

const MouseFollowTooltip: React.FC<TooltipProps> = ({ 
  content, 
  delay = 1000, 
  className = '',
  children 
}) => {
    const [show, setShow] = useState<boolean>(false);  // 标识是否出现
    const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    // 如果使用 useState 存储鼠标位置，每次移动鼠标时更新状态会导致组件重新渲染：
    const latestMousePos = useRef<MousePosition>({ x: 0, y: 0 }); // 存储最新鼠标位置

    const showFloatTip = (e: React.MouseEvent<HTMLDivElement>) => {
        // 获得鼠标在视口中的位置
        latestMousePos.current = { x: e.clientX, y: e.clientY };  
        
        if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
                // 延迟结束后，使用最新的鼠标位置计算提示框位置
                setPosition({
                    left: latestMousePos.current.x + 20,
                    top: latestMousePos.current.y + 20
                });
                setShow(true);
            }, delay);
        } else {
            setPosition({
                left: e.clientX + 20,
                top: e.clientY + 20
            });
            setShow(true);
        }
    };

    const hideTip = () => {
        setShow(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const updateMousePosition = (e: MouseEvent) => {
        // 持续更新鼠标位置
        latestMousePos.current = { x: e.clientX, y: e.clientY };
        
        // 提示框显示时更新位置
        if (show && tooltipRef.current) {
            const mouseOffsetX = 20;
            const mouseOffsetY = 20;
            let left = e.clientX + mouseOffsetX;
            let top = e.clientY + mouseOffsetY;

            const floatTipRect = tooltipRef.current.getBoundingClientRect();

            // 边界判断 - 右侧
            if (left + floatTipRect.width > window.innerWidth) {
                left = e.clientX - floatTipRect.width - mouseOffsetX;
            }

            // 边界判断 - 底部
            if (top + floatTipRect.height > window.innerHeight) {
                top = e.clientY - floatTipRect.height - mouseOffsetY;
            }

            setPosition({
                left: Math.max(0, left),
                top: Math.max(0, top)
            });
        }
    };

    useEffect(() => {
        const element = triggerRef.current;
        if (!element) return;

        // 在触发元素上监听鼠标移动，持续更新鼠标位置
        element.addEventListener('mousemove', updateMousePosition);
        
        return () => {
            element.removeEventListener('mousemove', updateMousePosition);
        };
    }, [show]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div
                ref={triggerRef}
                className={className}
                onMouseEnter={showFloatTip}
                onMouseLeave={hideTip}
            >
                {children || content}
            </div>
            
            {show && (
                <div
                    ref={tooltipRef}
                    className="fixed z-50 bg-white text-text-primary text-sm max-w-[300px] px-3 py-2 rounded shadow-lg pointer-events-none transition-opacity duration-150"
                    style={{
                        left: `${position.left}px`,
                        top: `${position.top}px`,
                        transform: 'translate3d(0, 0, 0)',
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

MouseFollowTooltip.displayName = 'MouseFollowTooltip'

export default MouseFollowTooltip;