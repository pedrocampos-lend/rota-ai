import type { Session } from '../types'

const SESSIONS_KEY = 'rota_ai_sessions'

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const sessions = JSON.parse(raw) as Session[]
    // Deserialize message timestamps back to Date objects
    return sessions.map((s) => ({
      ...s,
      messages: s.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }))
  } catch {
    return []
  }
}

export function saveSession(session: Session): void {
  const all = getSessions()
  const idx = all.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    all[idx] = session
  } else {
    all.unshift(session)
  }
  // Keep max 50 sessions
  const trimmed = all.slice(0, 50)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed))
}

export function deleteSession(id: string): void {
  const all = getSessions().filter((s) => s.id !== id)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all))
}
