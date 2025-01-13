'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Paperclip } from 'lucide-react'

interface AddHistoryEntryProps {
  patientId: number
  onAdd: (entry: { date: string; description: string; attachments: File[] }) => void
}

export function AddHistoryEntry({ patientId, onAdd }: AddHistoryEntryProps) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ date, description, attachments })
    setDate('')
    setDescription('')
    setAttachments([])
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
        <Label htmlFor="attachments">Attachments</Label>
        <Input
          id="attachments"
          type="file"
          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          multiple
        />
      </div>
      <Button type="submit">Add Entry</Button>
    </form>
  )
}

