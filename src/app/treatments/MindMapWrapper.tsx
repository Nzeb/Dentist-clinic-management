'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNodesState, useEdgesState } from 'reactflow';
import MindMap from './MindMap';
import { DBTreatmentPlan, DBPatient } from '@/types/db';
import { Node, Edge } from 'reactflow';

export default function MindMapWrapper({ patientId, initialPlan }: { patientId: number, initialPlan: DBTreatmentPlan | null }) {
  const { user } = useAuth();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialPlan?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialPlan?.edges || []);

  const handleNodeNoteChange = useCallback((id: string, notes: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, notes } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  }, [setNodes]);

  const handleNodeLabelChange = useCallback((id: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleNodeColorChange = useCallback((id: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, color } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const enrichedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onNoteChange: handleNodeNoteChange,
        onLabelChange: handleNodeLabelChange,
        onColorChange: handleNodeColorChange,
        onDelete: handleNodeDelete,
      },
    }));
  }, [nodes, handleNodeNoteChange, handleNodeLabelChange, handleNodeColorChange, handleNodeDelete]);

  useEffect(() => {
    const savePlan = async () => {
      await fetch('/api/treatments/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, nodes, edges }),
      });
    };
    savePlan();
  }, [patientId, nodes, edges]);

  const addNode = (label: string, color: string) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: label || `Node ${nodes.length + 1}`,
        notes: '',
        color: color,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  if (!initialPlan) {
    return <div>No plan</div>;
  }

  return (
    <MindMap
      nodes={enrichedNodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      user={user}
      addNode={addNode}
    />
  );
}
