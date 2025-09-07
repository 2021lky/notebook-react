import React, { useState, useRef, useEffect } from 'react';
import { RiRobot2Line } from '@remixicon/react';
import Button from '@/components/base/Button';

type Props = {
    onClick: () => void;
    isVisible: boolean;
}

// FloatingButton 组件
const FloatingButton = ({ onClick, isVisible }: Props) => {
    // 仅沿右侧上下移动：使用 transform 提升性能
    const buttonRef = useRef<HTMLButtonElement>(null);

    // 垂直位移（像素），仅存在于 ref，不触发渲染
    const yRef = useRef<number>(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
    const draggingRef = useRef(false);  // 是否正在拖拽
    const startYRef = useRef(0);  // 元素初始位置（Y 轴）
    const movedRef = useRef(false);  // 是否已移动
    const rafRunningRef = useRef(false); // 是否正在运行动画循环

    // 将最新的 y 应用到元素 transform（通过 rAF 合批）
    const applyTransform = (y: number) => {
        const el = buttonRef.current;
        if (!el) return;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    // 计算垂直可移动的最大范围（基于按钮高度动态计算）
    const getMaxY = () => {
        const el = buttonRef.current;
        const height = el ? el.offsetHeight : 60;
        return Math.max(0, window.innerHeight - height - 8); // 预留 8px 边距
    };

    // 监听窗口尺寸变化，保持在可视范围内
    useEffect(() => {
        const onResize = () => {
            const maxY = getMaxY();
            yRef.current = Math.min(Math.max(0, yRef.current), maxY);
            applyTransform(yRef.current);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 指针事件（统一鼠标/触摸）
    const onPointerDown = (e: React.PointerEvent) => {
        if (!buttonRef.current) return;
        // 捕获指针，拖拽更稳定
        try {
            (e.target as Element).setPointerCapture?.(e.pointerId);
        } catch (_) {}

        draggingRef.current = true;  // 开始拖拽
        movedRef.current = false;  // 根据拖拽阈值判断是否处于点击状态还是移动状态
        startYRef.current = yRef.current; // 更新移动前的初始位置

        const handlePointerMove = (ev: PointerEvent) => {
            if (!draggingRef.current) return;

            const deltaY = ev.clientY - startYRef.current;  // 移动距离
            // 计算下一次位置
            const nextY = Math.min(Math.max(0, startYRef.current + deltaY), getMaxY());
            // 拖拽阈值（避免点击误触）
            if (Math.abs(deltaY) > 5) movedRef.current = true;

            yRef.current = nextY;
            if (!rafRunningRef.current) {
                rafRunningRef.current = true;
                requestAnimationFrame(() => {
                    applyTransform(yRef.current);
                    rafRunningRef.current = false;
                });
            }
        };

        const handlePointerUp = (_ev: PointerEvent) => {
            draggingRef.current = false;
            window.removeEventListener('pointermove', handlePointerMove, true);
            window.removeEventListener('pointerup', handlePointerUp, true);
        };

        window.addEventListener('pointermove', handlePointerMove, true);
        window.addEventListener('pointerup', handlePointerUp, true);
    };

    const handleClick = (e: React.MouseEvent) => {
        // 如果是拖拽结束，不触发点击
        if (movedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick();
    };

    if (!isVisible) return null;

    return (
        <Button
            ref={buttonRef}
            className="fixed z-40 p-2 hover:bg-tertiary text-text-primary bg-primary rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center cursor-ns-resize"
            style={{
                // 水平固定靠右，通过 CSS right 控制；垂直用 transform
                right: 16,
                top: 0,
                transform: `translate3d(0, ${yRef.current}px, 0)`,
                userSelect: 'none',
                willChange: 'transform',
            }}
            onPointerDown={onPointerDown}
            onClick={handleClick}
            title="AI助手"
        >
            <RiRobot2Line className="w-4 h-4" />
        </Button>
    );
};

export default FloatingButton;