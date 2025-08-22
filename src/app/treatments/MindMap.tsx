'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Diagnosis' }, style: { backgroundColor: '#ffcce6' } },
  { id: '2', type: 'custom', position: { x: 0, y: 100 }, data: { label: 'Medications' }, style: { backgroundColor: '#cce6ff' } },
  { id: '3', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'Tests' }, style: { backgroundColor: '#ccffcc' } },
  { id: '4', type: 'custom', position: { x: 0, y: 200 }, data: { label: 'Procedures' }, style: { backgroundColor: '#ffffcc' } },
  { id: '5', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'Lifestyle' }, style: { backgroundColor: '#e6ccff' } },
  { id: '6', type: 'custom', position: { x: 100, y: 300 }, data: { label: 'Follow-up' }, style: { backgroundColor: '#ffebcc' } },
];
const initialEdges: Edge[] = [];

export default function MindMap({ patientId, initialNodes, initialEdges }: { patientId: number, initialNodes: Node[], initialEdges: Edge[] }) {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeColor, setNewNodeColor] = useState('#e2e8f0');

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onNoteChange: handleNodeNoteChange,
          onLabelChange: handleNodeLabelChange,
          onDelete: handleNodeDelete,
        },
      }))
    );
  }, [initialNodes]);

  useEffect(() => {
    if (nodes !== initialNodes || edges !== initialEdges) {
      const savePlan = async () => {
        await fetch('/api/treatments/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, nodes, edges }),
        });
      };
      savePlan();
    }
  }, [patientId, nodes, edges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodeNoteChange = (id: string, notes: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              notes,
            },
          };
        }
        return node;
      })
    );
  };

  const handleNodeDelete = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const handleNodeLabelChange = (id: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
            },
          };
        }
        return node;
      })
    );
  };

  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: newNodeLabel || `Node ${nodes.length + 1}`,
        onNoteChange: handleNodeNoteChange,
        onLabelChange: handleNodeLabelChange,
        onDelete: handleNodeDelete,
        notes: '',
      },
      style: { backgroundColor: newNodeColor },
    };
    setNodes((nds) => nds.concat(newNode));
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
          <button onClick={addNode} style={{ marginLeft: 5 }}>Add Node</button>
        </div>
      )}
      <div style={{ width: '100%', height: '70vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          elementsSelectable={isEditable}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
