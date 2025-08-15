import React, { useEffect, useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { useTranslation } from 'react-i18next';

type Props = {
    selectedText: string;
    position: { x: number; y: number };
    onAISearch: (text: string) => void;
    onClose: () => void;
}

const TextSelectionBubble: React.FC<Props> = ({ selectedText, position, onAISearch, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (selectedText) {
            setIsVisible(true);
            // 1秒后自动隐藏气泡
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [selectedText, onClose]);

    const handleAISearch = () => {
        onAISearch(selectedText);
        onClose();
    };

    if (!isVisible || !selectedText) return null;

    return (
        <div 
            className="fixed z-50"
            style={{
                left: position.x,
                top: position.y, // 直接使用传入的Y坐标（已经是文本底部+间距）
                transform: 'translateX(-50%)', // 水平居中
            }}
        >
            <div
                onClick={handleAISearch}
                className="flex items-center gap-1 cursor-pointer select-none bg-secondary rounded p-2"
                title="AI搜索选中文本"
            >
                <RiSearchLine className="w-4 h-4" />
                <span>{t("operate.aiSearch")}</span>
            </div>
        </div>
    );
};

export default TextSelectionBubble;