import { useEffect, useMemo } from 'react';
import { 
  BaseEdge, 
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow
} from 'reactflow';
import { useState, useCallback } from 'react';
import type { EdgeProps } from 'reactflow';
import type { CommonEdgeType } from './types';
import Input from '@/components/base/Input';

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<CommonEdgeType>) {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    setIsEditing(Boolean(data?.selected));
  }, [data?.selected]);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sourceX - 8,
    sourceY,
    sourcePosition,
    targetX: targetX + 8,
    targetY,
    targetPosition,
    curvature: 0.5,
  });

  // 边的激活态：鼠标悬停或编辑中
  const isActive = useMemo(() => data?._hovering || data?.selected, [data?._hovering, data?.selected]);

  const handleInputChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = evt.target.value;
    setEdges((eds) => 
      eds.map((e) => 
        e.id === id 
          ? { ...e, data: { ...e.data, label: newLabel } }
          : e
      )
    );
  }, [id, setEdges]);

  const handleInputBlur = () => {
    // 失焦时，取消选中状态
    setEdges((eds) => eds.map((e) => 
      e.id === id 
        ? { ...e, data: { ...e.data, selected: false } }
        : e
    ));
  };

  const handleInputKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      // 按回车时，取消选中状态
      setEdges((eds) => eds.map((e) => 
        e.id === id 
          ? { ...e, data: { ...e.data, selected: false } }
          : e
      ));
    }
  };
  const commonStyles = useMemo(() => ({
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    background: isActive ? 'var(--bg-secondary)' : 'white',
    color: isActive ? 'var(--primary)' : '#333',
    border: `1px solid ${isActive ? 'var(--primary)' : '#333'}`,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '2px 6px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  } as const), [isActive, labelX, labelY])

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{ 
          stroke: isActive ? 'var(--primary)' : '#333',
          strokeWidth: 1.5,
          transition: 'stroke 150ms ease, stroke-width 150ms ease',
        }} 
      />
      
      <EdgeLabelRenderer>
        {data?.label && (
          isEditing ? (
            <div className="flex">
              <Input
                style={{
                  ...commonStyles,
                  width: 'auto',
                  minWidth: '30px',
                  maxWidth: '200px',
                }}
                className="nodrag !text-text-primary !text-xs"
                value={data.label}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                autoFocus
              />
            </div>
          ) : (
            <div
              style={commonStyles}
              className="nodrag !text-xs"
            >
              {data.label}
            </div>
          )
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;