'use client'

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default memo(({ data, id }: { data: any, id: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onNoteChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onNoteChange) {
      data.onNoteChange(id, evt.target.value);
    }
  };

  const onAdditionalNoteChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onAdditionalNoteChange) {
      data.onAdditionalNoteChange(id, evt.target.value);
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
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Card style={{ width: 250 }}>
        <CardHeader style={{ backgroundColor: data.color, color: '#000', padding: '10px' }}>
          <CardTitle>
            <input type="text" defaultValue={data.label} onChange={onLabelChange} className="bg-transparent text-black w-full" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="notes-section">
            <textarea
              placeholder="Add notes..."
              defaultValue={data.notes}
              onChange={onNoteChange}
              className="w-full mt-1 p-1 border rounded"
            />
          </div>
          {isExpanded && (
            <div className="additional-notes-section mt-2">
              <Separator />
              <textarea
                placeholder="Add additional notes..."
                defaultValue={data.additionalNotes}
                onChange={onAdditionalNoteChange}
                className="w-full mt-2 p-1 border rounded"
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500">Change color:</p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  {['#ffcce6', '#cce6ff', '#ccffcc', '#ffffcc', '#e6ccff', '#ffebcc'].map(color => (
                    <button
                      key={color}
                      style={{ backgroundColor: color, width: 20, height: 20, border: data.color === color ? '2px solid #000' : '1px solid #ccc' }}
                      onClick={() => data.onColorChange(id, color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-2 border-t">
          <Button onClick={() => setIsExpanded(!isExpanded)} size="sm" variant="outline">
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button onClick={() => data.onDelete && data.onDelete(id)} size="sm" variant="destructive" className="ml-2">
            Delete
          </Button>
        </div>
      </Card>
    </>
  );
});
