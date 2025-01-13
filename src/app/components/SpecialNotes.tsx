'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SpecialNotesProps {
  patientId: number
  initialNotes: string
  onSave: (notes: string) => void
}

export function SpecialNotes({ patientId, initialNotes, onSave }: SpecialNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onSave(notes)
    setIsEditing(false)
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Special Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-wrap mb-2">{notes || "No special notes."}</p>
            <Button size="sm" onClick={() => setIsEditing(true)}>Edit Notes</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

