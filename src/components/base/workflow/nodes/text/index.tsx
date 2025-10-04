import Textarea from "@/components/base/TextArea"
import { useState } from "react"
import type { CommonNodeType } from "../../types"
import { useReactFlow } from 'reactflow';
import { useDebounceFn } from 'ahooks';


const TextNode = ({id, data}: {id: string, data: CommonNodeType}) => {
  const [value, setValue] = useState(data.text || '')
  const { setNodes } = useReactFlow();
  const updateNodes = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, text: value } } : node
      )
    );
  }
  const { run: debouncedUpdate } = useDebounceFn(updateNodes, {
    wait: 300, // 延迟时间，可按需调整
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    debouncedUpdate()
  }
  return (
    <div className="flex-1 relative pb-4 nodrag">
      <Textarea
        className={`w-full p-2 text-sm border-none outline-none resize-none bg-primary-50 placeholder-text-secondary`}
        style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          background: 'transparent'
        }}
        placeholder='请输入文本内容'
        value={value}
        onChange={(e) => {
          handleChange(e)
        }}
        maxLength={500}
      />
      {/* 工具栏 */}
      <div className="absolute h-4 w-full bottom-1 right-1 flex items-center justify-end space-x-2">
        <div className="text-xs text-text-secondary">
          {value.length}/{500}
        </div>
      </div>
    </div>
  )
}

export default TextNode