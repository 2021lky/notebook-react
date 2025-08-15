import React from 'react';
import Tree from 'rc-tree';
import type { DataNode } from 'rc-tree/lib/interface';
import 'rc-tree/assets/index.css';
import './tree-styles.css'; // 引入自定义样式
import { RiArrowDownSFill, RiArrowRightSFill, RiFileList3Line } from '@remixicon/react';
import FileMoreTrigger from './file-trigger';
import DirMoreTrigger from './dir-trigger';

export interface TreeNodeData extends DataNode {
  key: string;
  title: string;
  name?: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  icon?: React.ReactNode;
  content?: string;
}

const BasicTree: React.FC<{data: TreeNodeData[], onSelect: (selectedKey: string) => void, defaultSelectedKey?: string}> = ({data, onSelect, defaultSelectedKey}) => {
  
  return (
      <Tree
        treeData={data}
        selectable={true}
        showLine={false}
        showIcon={false}
        checkable={false}
        defaultExpandAll={true}
        selectedKeys={defaultSelectedKey ? [defaultSelectedKey] : []}
        onSelect={(selectedKeys) => {
          // 安全地处理选中的key，避免 undefined
          if (selectedKeys.length > 0) {
            onSelect(selectedKeys[0].toString());
          } else {
            onSelect('');
          }
        }}
        // 自定义展开/折叠图标（通过JSX控制）
        switcherIcon={({ expanded, isLeaf }) => {
          if (isLeaf) return <RiFileList3Line className='custom-expand-icon'/>; // 叶子节点不显示图标
          return (
            expanded ? <RiArrowDownSFill className='custom-expand-icon'/> : <RiArrowRightSFill className='custom-expand-icon'/>
          );
        }}
        titleRender={(node: TreeNodeData) => (
            <>
                {/* 节点标题 */}
                <div className="truncate" style={{overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                  width: 'calc(100% - 20px)'}}
                >{node.title}</div>
                
                {/* 右侧more图标 */}
                <div className="tree-more-trigger">
                    { node.isLeaf ? <FileMoreTrigger data={node} /> : <DirMoreTrigger data={node} /> }
                </div>
            </>
        )}
      />

  );
};

export default BasicTree;
