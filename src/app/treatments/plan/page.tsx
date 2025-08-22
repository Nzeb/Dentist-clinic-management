'use client'

import MindMap from '../MindMap'
import { useSearchParams } from 'next/navigation'
import React from 'react'

function TreatmentPlanContent() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return <div>Error: patientId is required</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Treatment Plan Builder</h1>
      <MindMap patientId={parseInt(patientId, 10)} />
    </div>
  )
}

export default function TreatmentsPlanPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TreatmentPlanContent />
    </React.Suspense>
  )
}
