import type { Itinerary } from '../types'

const STORAGE_KEY = 'rota_ai_itineraries'

export function getSavedItineraries(): Itinerary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Itinerary[]
  } catch {
    return []
  }
}

export function saveItinerary(itinerary: Itinerary): void {
  const all = getSavedItineraries()
  const existing = all.findIndex((i) => i.id === itinerary.id)
  if (existing >= 0) {
    all[existing] = itinerary
  } else {
    all.unshift(itinerary)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteItinerary(id: string): void {
  const all = getSavedItineraries().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
