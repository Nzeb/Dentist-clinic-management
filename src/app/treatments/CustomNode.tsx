'use client'

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default memo(({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Handle position={Position.Top} id="top" />
      <Handle position={Position.Bottom} id="bottom" />
      <Handle position={Position.Left} id="left" />
      <Handle position={Position.Right} id="right" />
      <Card style={{ width: 250 }}>
        <CardHeader style={{ backgroundColor: data.color, color: '#000', padding: '10px' }}>
          <CardTitle>{data.label}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm text-gray-700">{data.notes}</p>
        </CardContent>
        <div className="p-2 border-t">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Node</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <label>Label</label>
                  <Input defaultValue={data.label} onChange={(e) => data.onLabelChange(id, e.target.value)} />
                </div>
                <div>
                  <label>Notes</label>
                  <Textarea defaultValue={data.notes} onChange={(e) => data.onNoteChange(id, e.target.value)} />
                </div>
                <div>
                  <label>Color</label>
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
            </DialogContent>
          </Dialog>
          <Button onClick={() => data.onDelete && data.onDelete(id)} size="sm" variant="destructive" className="ml-2">
            Delete
          </Button>
        </div>
      </Card>
    </>
  );
});
