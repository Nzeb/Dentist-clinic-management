'use client'

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export default memo(({ data, id, style }: { data: any, id: string, style: any }) => {
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
      <Card style={{ width: 200 }}>
        <CardHeader style={{ backgroundColor: style?.backgroundColor, color: '#fff', padding: '10px' }}>
          <CardTitle>
            {isExpanded ? (
              <input type="text" defaultValue={data.label} onChange={onLabelChange} className="bg-transparent text-white w-full" />
            ) : (
              data.label
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <Button onClick={() => setIsExpanded(!isExpanded)} size="sm" variant="outline">
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button onClick={() => data.onDelete && data.onDelete(id)} size="sm" variant="destructive" className="ml-2">
            Delete
          </Button>
          {isExpanded && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Details for {data.label}</p>
              <textarea
                placeholder="Add notes..."
                defaultValue={data.notes}
                onChange={onNoteChange}
                className="w-full mt-1 p-1 border rounded"
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
