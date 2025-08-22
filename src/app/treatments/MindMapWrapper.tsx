'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNodesState, useEdgesState } from 'reactflow';
import MindMap from './MindMap';
import { DBTreatmentPlan, DBPatient } from '@/types/db';
import { Node, Edge } from 'reactflow';

export default function MindMapWrapper({ patientId, initialPlan }: { patientId: number, initialPlan: DBTreatmentPlan | null }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState(initialPlan);

  const handleNodeNoteChange = useCallback((id: string, notes: string) => {
    setPlan(p => {
      if (!p) return p;
      return {
        ...p,
        nodes: p.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, notes } } : n)
      }
    });
  }, []);

  const handleNodeDelete = useCallback((id: string) => {
    setPlan(p => {
      if (!p) return p;
      return {
        ...p,
        nodes: p.nodes.filter(n => n.id !== id)
      }
    });
  }, []);

  const handleNodeLabelChange = useCallback((id: string, label: string) => {
    setPlan(p => {
      if (!p) return p;
      return {
        ...p,
        nodes: p.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, label } } : n)
      }
    });
  }, []);

  const handleNodeColorChange = useCallback((id: string, color: string) => {
    setPlan(p => {
      if (!p) return p;
      return {
        ...p,
        nodes: p.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, color } } : n)
      }
    });
  }, []);

  const enrichedNodes = useMemo(() => {
    if (!plan) return [];
    return plan.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onNoteChange: handleNodeNoteChange,
        onLabelChange: handleNodeLabelChange,
        onColorChange: handleNodeColorChange,
        onDelete: handleNodeDelete,
      },
    }));
  }, [plan, handleNodeNoteChange, handleNodeLabelChange, handleNodeColorChange, handleNodeDelete]);

  useEffect(() => {
    if (plan) {
      const savePlan = async () => {
        await fetch('/api/treatments/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, nodes: plan.nodes, edges: plan.edges }),
        });
      };
      savePlan();
    }
  }, [patientId, plan]);

  const addNode = (label: string, color: string) => {
    setPlan(p => {
      if (!p) return p;
      const newNode = {
        id: `${p.nodes.length + 1}`,
        type: 'custom',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: label || `Node ${p.nodes.length + 1}`,
          notes: '',
          color: color,
        },
      };
      return {
        ...p,
        nodes: [...p.nodes, newNode]
      }
    });
  };

  if (!plan) {
    return <div>No plan</div>;
  }

  return (
    <MindMap
      nodes={enrichedNodes}
      edges={plan.edges}
      user={user}
      addNode={addNode}
    />
  );
}
