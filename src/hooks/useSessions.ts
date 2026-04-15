import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Session, Message, Itinerary } from '../types'
import { getSessions, saveSession, deleteSession } from '../utils/sessions'

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá! Sou o **Rota AI**, seu assistente de viagens inteligente. 🌍✈️\n\nEstou aqui para criar um roteiro completamente personalizado para você!\n\nPara começar: **qual destino você está pensando em visitar?** Pode ser uma cidade, país ou região — me conta o que está em mente!',
  timestamp: new Date(),
}

function makeNewSession(): Session {
  return {
    id: uuidv4(),
    title: 'Nova conversa',
    messages: [{ ...WELCOME_MESSAGE, id: uuidv4(), timestamp: new Date() }],
    itinerary: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function deriveTitle(messages: Message[], itinerary: Itinerary | null): string {
  if (itinerary?.destination) return `📍 ${itinerary.destination}`
  const firstUser = messages.find((m) => m.role === 'user')
  if (firstUser) return firstUser.content.slice(0, 40).trim()
  return 'Nova conversa'
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = getSessions()
    if (stored.length === 0) {
      const fresh = makeNewSession()
      saveSession(fresh)
      return [fresh]
    }
    return stored
  })

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => getSessions()[0]?.id ?? makeNewSession().id
  )

  const currentSession = sessions.find((s) => s.id === currentSessionId) ?? sessions[0]

  const createSession = useCallback((): Session => {
    const fresh = makeNewSession()
    saveSession(fresh)
    setSessions(getSessions())
    setCurrentSessionId(fresh.id)
    return fresh
  }, [])

  const switchSession = useCallback((id: string) => {
    setCurrentSessionId(id)
  }, [])

  const updateSession = useCallback(
    (id: string, messages: Message[], itinerary: Itinerary | null) => {
      const all = getSessions()
      const existing = all.find((s) => s.id === id)
      if (!existing) return
      const updated: Session = {
        ...existing,
        messages,
        itinerary,
        title: deriveTitle(messages, itinerary),
        updatedAt: new Date().toISOString(),
      }
      saveSession(updated)
      setSessions(getSessions())
    },
    []
  )

  const removeSession = useCallback(
    (id: string) => {
      deleteSession(id)
      const remaining = getSessions()
      if (remaining.length === 0) {
        const fresh = makeNewSession()
        saveSession(fresh)
        setSessions([fresh])
        setCurrentSessionId(fresh.id)
      } else {
        setSessions(remaining)
        if (currentSessionId === id) {
          setCurrentSessionId(remaining[0].id)
        }
      }
    },
    [currentSessionId]
  )

  return {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    switchSession,
    updateSession,
    removeSession,
  }
}
