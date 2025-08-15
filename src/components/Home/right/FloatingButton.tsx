import React, { useState, useRef, useEffect } from 'react';
import { RiRobot2Line } from '@remixicon/react';
type Props = {
    onClick: () => void;
    isVisible: boolean;
}

const FloatingButton = ({ onClick, isVisible }: Props) => {
    // 初始位置设置在屏幕右侧区域
    const getInitialPosition = () => {
        const minX = window.innerWidth * 2 / 3; // 屏幕右侧1/3开始
        const defaultX = window.innerWidth - 80; // 距离右边缘80px
        return {
            x: Math.max(minX, defaultX),
            y: window.innerHeight / 2
        };
    };
    const [position, setPosition] = useState(getInitialPosition());
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = Math.abs(e.clientX - dragStart.startX);
            const deltaY = Math.abs(e.clientY - dragStart.startY);
            
            // 如果移动距离超过5px，认为是拖拽
            if (deltaX > 5 || deltaY > 5) {
                setHasMoved(true);
            }

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // 限制按钮只能在屏幕右侧移动（右侧1/3区域）
            const minX = window.innerWidth * 2 / 3; // 屏幕右侧1/3开始
            const maxX = window.innerWidth - 60;
            const maxY = window.innerHeight - 60;

            setPosition({
                x: Math.max(minX, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            // 延迟重置hasMoved，避免点击事件被阻止
            setTimeout(() => setHasMoved(false), 100);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            startX: e.clientX,
            startY: e.clientY
        });
        setIsDragging(true);
        setHasMoved(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        // 如果刚刚拖拽过，不触发点击事件
        if (hasMoved) {
            e.preventDefault();
            return;
        }
        onClick();
    };

    // 响应式位置调整
    useEffect(() => {
        const handleResize = () => {
            const minX = window.innerWidth * 2 / 3; // 屏幕右侧1/3开始
            const maxX = window.innerWidth - 60;
            const maxY = window.innerHeight - 60;
            
            setPosition(prev => ({
                x: Math.max(minX, Math.min(prev.x, maxX)),
                y: Math.max(0, Math.min(prev.y, maxY))
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            ref={buttonRef}
            className="fixed z-40 p-2 hover:bg-tertiary text-white rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center cursor-move"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            title="AI助手"
        >
            <RiRobot2Line className="w-4 h-4" />
        </button>
    );
};

export default FloatingButton;