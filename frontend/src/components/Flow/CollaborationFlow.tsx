'use client';

/**
 * CollaborationFlow Component
 * 
 * 一个交互式的团队协作流程图组件，展示团队成员之间的协作关系和职责分工。
 * 
 * 功能特点：
 * - 可拖拽的团队成员节点
 * - 动态的连接线展示协作关系
 * - 点击显示成员详细信息
 * - 响应式布局和动画效果
 * - 状态重置功能
 * 
 * @version 1.0.0
 * @author Your Name
 */

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  NodeDragHandler,
  NodeMouseHandler,
} from 'reactflow';
import { User } from 'phosphor-react';
import 'reactflow/dist/style.css';

// 团队成员角色颜色定义
const roleColors = {
  mike: '#6366f1',   // Team Leader - Indigo
  emma: '#ec4899',   // Product Manager - Pink
  bob: '#2dd4bf',    // Architect - Teal
  alex: '#f59e0b',   // Engineer - Amber
  david: '#8b5cf6',  // Data Analyst - Purple
};

// 团队成员职责描述
const roleDescriptions = {
  mike: 'Team Leader，负责团队管理和项目协调',
  emma: 'Product Manager，负责产品规划和需求分析',
  bob: 'Architect，负责系统架构设计和技术决策',
  alex: 'Engineer，负责核心功能开发和性能优化',
  david: 'Data Analyst，负责数据分析和业务洞察',
};

// 节点基础样式
const baseNodeStyle = {
  borderRadius: '50%',
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
};

// 信息弹窗基础样式
const basePopupStyle = {
  position: 'absolute' as const,
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(17, 24, 39, 0.95)',
  backdropFilter: 'blur(8px)',
  width: '200px',
  zIndex: 50,
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

/**
 * 创建团队成员节点配置
 * @param id 成员ID
 * @param name 成员名称
 * @param role 职务名称
 * @param x X轴位置
 * @param y Y轴位置
 */
const createTeamMemberNode = (
  id: string,
  name: string,
  role: string,
  x: number,
  y: number
): Node => ({
  id,
  type: 'default',
  position: { x, y },
  data: { 
    label: (
      <div className="flex flex-col items-center justify-center w-20 h-20">
        <User size={24} weight="fill" />
        <span className="text-xs mt-1">{name}</span>
        <span className="text-[10px] opacity-80">{role}</span>
      </div>
    )
  },
  style: {
    ...baseNodeStyle,
    background: roleColors[id as keyof typeof roleColors],
  },
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
});

// 初始节点配置
const initialNodes: Node[] = [
  createTeamMemberNode('mike', 'Mike', 'Team Leader', 50, 150),
  createTeamMemberNode('emma', 'Emma', 'Product Manager', 250, 150),
  createTeamMemberNode('bob', 'Bob', 'Architect', 450, 150),
  createTeamMemberNode('alex', 'Alex', 'Engineer', 650, 150),
  createTeamMemberNode('david', 'David', 'Data Analyst', 850, 150),
];

/**
 * 创建团队协作连接线
 * @param source 起始节点ID
 * @param target 目标节点ID
 */
const createCollaborationEdge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  type: 'smoothstep',
  animated: true,
  style: { 
    stroke: roleColors[source as keyof typeof roleColors],
    strokeWidth: 2,
  },
});

// 初始连接线配置
const initialEdges: Edge[] = [
  createCollaborationEdge('mike', 'emma'),
  createCollaborationEdge('emma', 'bob'),
  createCollaborationEdge('bob', 'alex'),
  createCollaborationEdge('alex', 'david'),
];

export default function CollaborationFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 处理节点点击
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const newSelectedId = node.id === selectedNode ? null : node.id;
    setSelectedNode(newSelectedId);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          label: (
            <div className="relative flex flex-col items-center justify-center w-20 h-20">
              {n.id === newSelectedId && (
                <div
                  className="absolute bottom-full left-1/2 p-3 rounded-lg shadow-lg mb-2 transition-all duration-200 ease-in-out"
                  style={{
                    transform: 'translateX(-50%)',
                    background: 'rgba(17, 24, 39, 0.95)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${roleColors[n.id as keyof typeof roleColors]}`,
                    width: '200px',
                    zIndex: 50,
                  }}
                >
                  <div className="text-sm text-gray-200 leading-relaxed">
                    {roleDescriptions[n.id as keyof typeof roleDescriptions]}
                  </div>
                  <div
                    className="absolute bottom-0 left-1/2 w-3 h-3"
                    style={{
                      transform: 'translate(-50%, 50%) rotate(45deg)',
                      background: 'rgba(17, 24, 39, 0.95)',
                      border: `1px solid ${roleColors[n.id as keyof typeof roleColors]}`,
                      borderTop: 'none',
                      borderLeft: 'none',
                    }}
                  />
                </div>
              )}
              <User size={24} weight="fill" />
              <span className="text-xs mt-1">
                {n.id.charAt(0).toUpperCase() + n.id.slice(1)}
              </span>
              <span className="text-[10px] opacity-80">
                {n.id === 'mike' ? 'Team Leader' :
                 n.id === 'emma' ? 'Product Manager' :
                 n.id === 'bob' ? 'Architect' :
                 n.id === 'alex' ? 'Engineer' :
                 'Data Analyst'}
              </span>
            </div>
          ),
        },
      }))
    );
  }, [selectedNode, setNodes]);

  // 重置功能
  const handleReset = useCallback(() => {
    setSelectedNode(null);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="h-full w-full relative bg-gray-900">
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 
                   text-gray-200 rounded-lg shadow-lg z-50 flex items-center space-x-2
                   transition-colors duration-200"
        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <svg 
          className="w-4 h-4" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" />
          <path d="M16 12H8" />
          <path d="M12 16V8" />
        </svg>
        <span>重置位置</span>
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
} 