'use client'

import { useState } from 'react'
import { useAppContext } from '@/app/contexts/AppContext'
import { DBHistoryEntry, DBPrescription } from '@/types/db'

export function usePatientData() {
  const { getPatientHistory, getPatientPrescription } = useAppContext()
  const [patientData, setPatientData] = useState<{
    history: DBHistoryEntry[];
    prescriptions: DBPrescription[];
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPatientData = async (patientId: number) => {
    setIsLoading(true)
    try {
      const [history, prescriptions] = await Promise.all([
        getPatientHistory(patientId),
        getPatientPrescription(patientId),
      ])
      setPatientData({ history, prescriptions })
    } catch (error) {
      console.error("Failed to fetch patient data:", error)
      setPatientData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPatientHistory = async (patientId: number) => {
    try {
      const history = await getPatientHistory(patientId);
      setPatientData(prevData => ({
        ...prevData!,
        history: history,
      }));
    } catch (error) {
      console.error("Failed to refresh patient history:", error);
    }
  };

  return { patientData, isLoading, fetchPatientData, refreshPatientHistory }
}
