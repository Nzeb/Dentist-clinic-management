'use client'

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, id }: { data: any, id: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onNoteChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onNoteChange) {
      data.onNoteChange(id, evt.target.value);
    }
  };

  const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onLabelChange) {
      data.onLabelChange(id, evt.target.value);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, background: '#fff' }}>
        {isExpanded ? (
          <input type="text" defaultValue={data.label} onChange={onLabelChange} />
        ) : (
          <div>{data.label}</div>
        )}
        <button onClick={() => setIsExpanded(!isExpanded)} style={{ marginTop: 5 }}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button onClick={() => data.onDelete(id)} style={{ marginTop: 5, marginLeft: 5 }}>
          Delete
        </button>
        {isExpanded && (
          <div style={{ marginTop: 10 }}>
            <p>Details for {data.label}</p>
            <textarea
              placeholder="Add notes..."
              defaultValue={data.notes}
              onChange={onNoteChange}
              style={{ width: '100%', marginTop: 5 }}
            />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
