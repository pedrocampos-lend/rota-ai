import type { Itinerary } from '../types'

export function encodeItinerary(itinerary: Itinerary): string {
  const json = JSON.stringify(itinerary)
  const encoded = btoa(encodeURIComponent(json))
  return encoded
}

export function decodeItinerary(encoded: string): Itinerary | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json) as Itinerary
  } catch {
    return null
  }
}

export function buildShareURL(itinerary: Itinerary): string {
  const encoded = encodeItinerary(itinerary)
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('roteiro', encoded)
  return url.toString()
}

export function getItineraryFromURL(): Itinerary | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('roteiro')
  if (!encoded) return null
  return decodeItinerary(encoded)
}
