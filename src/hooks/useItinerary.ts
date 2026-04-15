import { useState, useCallback } from 'react'
import type { Itinerary } from '../types'
import { getSavedItineraries, saveItinerary, deleteItinerary } from '../utils/storage'

export function useItinerary() {
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>(() =>
    getSavedItineraries()
  )

  const save = useCallback((itinerary: Itinerary) => {
    saveItinerary(itinerary)
    setSavedItineraries(getSavedItineraries())
  }, [])

  const remove = useCallback((id: string) => {
    deleteItinerary(id)
    setSavedItineraries(getSavedItineraries())
  }, [])

  const refresh = useCallback(() => {
    setSavedItineraries(getSavedItineraries())
  }, [])

  return { savedItineraries, save, remove, refresh }
}
