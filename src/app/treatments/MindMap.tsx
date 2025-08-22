'use client'

import React, { useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from 'reactflow';
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

export default function MindMap({ nodes, edges, user, addNode }: { nodes: Node[], edges: Edge[], user: any, addNode: (label: string, color: string) => void }) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeColor, setNewNodeColor] = useState('#e2e8f0');

  const handleAddNode = () => {
    addNode(newNodeLabel, newNodeColor);
    setNewNodeLabel('');
  };

  const isEditable = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'doctor';

  return (
    <div>
      {isEditable && (
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            placeholder="New node label"
          />
          <div style={{ marginLeft: 5 }}>
            {['#ffcce6', '#cce6ff', '#ccffcc', '#ffffcc', '#e6ccff', '#ffebcc'].map(color => (
              <button
                key={color}
                style={{ backgroundColor: color, width: 20, height: 20, border: newNodeColor === color ? '2px solid #000' : '1px solid #ccc', marginRight: 5 }}
                onClick={() => setNewNodeColor(color)}
              />
            ))}
          </div>
          <button onClick={handleAddNode} style={{ marginLeft: 5 }}>Add Node</button>
        </div>
      )}
      <div style={{ width: '100%', height: '70vh' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(params) => setRfEdges((eds) => addEdge(params, eds))}
          nodeTypes={nodeTypes}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          elementsSelectable={isEditable}
          connectionLineStyle={{ stroke: '#000' }}
          defaultEdgeOptions={{
            animated: true,
            markerEnd: {
              type: 'arrowclosed',
              color: '#000',
            },
            style: {
              stroke: '#000',
            },
          }}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
