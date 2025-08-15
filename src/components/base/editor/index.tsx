import { Editor } from '@tinymce/tinymce-react';
import { TINYMCE_EDITOR_API_KEY } from '@/constant';
import { getLocale } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

type EditorProps = {
    content?: string;
    onContentChange?: (content: string) => void;
    onTextSelection?: (selectedText: string, position: { x: number; y: number }) => void;
}

const EditorComponent = ({ content = '', onContentChange, onTextSelection }: EditorProps) => {
    const { i18n } = useTranslation();
    const [currentLocale, setCurrentLocale] = useState(getLocale());
    
    // 监听语言变化
    useEffect(() => {
        const handleLanguageChange = () => {
            setCurrentLocale(getLocale());
        };
        
        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);
    
    
    // TinyMCE 语言配置映射
    const getLanguageConfig = () => {
        const locale = currentLocale || i18n.language;
        return {
            language: locale === 'zh' ? 'zh_CN' : 'en',
            language_url: locale === 'zh' 
                ? 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/zh_CN.js'
                : undefined // 英文是默认语言，不需要额外加载
        };
    };
    
    const languageConfig = getLanguageConfig();
    
    return (
        <div className="h-full">           
        <Editor
            key={currentLocale} // 强制重新渲染以应用语言配置
            apiKey={ TINYMCE_EDITOR_API_KEY }
            value={content}
            onEditorChange={(content) => {
                onContentChange?.(content);
            }}
            init={{
                height: '100%',
                plugins: 'lists link image table code',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                ...languageConfig,
                // 设置内容语言
                content_langs: [
                    { title: 'English', code: 'en' },
                    { title: '简体中文', code: 'zh' }
                ],
                // 清除默认内容和品牌信息
                branding: false, // 移除"Powered by TinyMCE"品牌信息
                promotion: false, // 移除推广信息
                statusbar: false, // 隐藏状态栏
                elementpath: false, // 隐藏元素路径
                setup: (editor: any) => {
                    // 添加文本选中事件处理
                    editor.on('selectionchange', () => {
                        const selectedText = editor.selection.getContent({ format: 'text' });
                        if (selectedText && selectedText.trim() && onTextSelection) {
                            const rect = editor.selection.getRng().getBoundingClientRect();
                            // 获取编辑器容器的位置信息
                            const editorContainer = editor.getContainer();
                            const containerRect = editorContainer.getBoundingClientRect();
                            
                            // 计算相对于页面的绝对位置
                            const absoluteX = rect.left + containerRect.left + 32;
                            const absoluteY = rect.bottom + containerRect.top + 16; // 使用选中文本底部位置，并添加3px间距
                            
                            onTextSelection(selectedText, {
                                x: absoluteX,
                                y: absoluteY
                            });
                        }
                    });
                }
            }}
        />
        </div>
    )
}

export default EditorComponent