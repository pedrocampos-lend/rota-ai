export interface Activity {
  id: string
  time: string
  title: string
  description: string
  type: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'activity'
  location?: { lat: number; lng: number; address: string }
  tips?: string
  cost?: string
}

export interface DayPlan {
  id: string
  day: number
  date: string
  title: string
  activities: Activity[]
}

export interface Itinerary {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: string
  days: DayPlan[]
  createdAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Session {
  id: string
  title: string
  messages: Message[]
  itinerary: Itinerary | null
  createdAt: string
  updatedAt: string
}
