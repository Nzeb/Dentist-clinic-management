'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash } from 'lucide-react'
import { DBHistoryEntry } from '@/types/db'

interface EditHistoryEntryProps {
  entry: DBHistoryEntry
  onUpdate: (entry: { date: string; description: string }) => void
  onDeleteAttachment: (attachmentUrl: string) => void
}

export function EditHistoryEntry({ entry, onUpdate, onDeleteAttachment }: EditHistoryEntryProps) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])

  useEffect(() => {
    if (entry) {
      setDate(entry.date)
      setDescription(entry.description)
      setAttachments(entry.attachments || [])
    }
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ date, description })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Attachments</Label>
        <ul className="space-y-2">
          {attachments.map((attachment, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{attachment.split('-').slice(1).join('-')}</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDeleteAttachment(attachment)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit">Update Entry</Button>
    </form>
  )
}
