import { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Content } from '@google/generative-ai'
import { v4 as uuidv4 } from 'uuid'
import type { Message, Itinerary, Session } from '../types'

const SYSTEM_PROMPT = `Você é um agente especializado em planejamento de viagens chamado "Rota AI".
Você cria roteiros personalizados e detalhados.

FLUXO:
1. Colete estas informações conversacionalmente (não pergunte tudo de uma vez):
   - Destino(s)
   - Datas/duração
   - Orçamento (econômico/médio/luxo)
   - Número de viajantes
   - Interesses (cultura, gastronomia, natureza, aventura, compras, etc.)
   - Estilo de viagem (relaxado, intenso, equilibrado)

2. Quando tiver as informações essenciais (destino + datas no mínimo), gere o roteiro completo.

3. Para gerar o roteiro, retorne SEMPRE neste formato:
   - Texto conversacional explicando o roteiro
   - Seguido de um bloco JSON dentro de <itinerary></itinerary> tags

4. O JSON deve seguir exatamente esta interface TypeScript:
interface Activity {
  id: string        // uuid único
  time: string      // ex: "09:00"
  title: string
  description: string
  type: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'activity'
  location?: { lat: number; lng: number; address: string }
  tips?: string
  cost?: string     // ex: "R$ 50,00" ou "Gratuito"
}
interface DayPlan {
  id: string
  day: number
  date: string      // ex: "15/06/2025"
  title: string     // título temático do dia
  activities: Activity[]
}
interface Itinerary {
  id: string
  title: string         // ex: "7 dias em Lisboa"
  destination: string
  startDate: string
  endDate: string
  budget: string        // ex: "Médio"
  days: DayPlan[]
  createdAt: string     // ISO string
}

5. Inclua coordenadas lat/lng reais e precisas dos locais.
6. Sugira horários realistas e lógicos (considere tempo de deslocamento).
7. Inclua dicas práticas nos campos tips.
8. Estime custos em BRL quando possível.
9. Para atualizações, sempre retorne o roteiro completo atualizado dentro de <itinerary></itinerary>.
10. Use IDs únicos (uuid v4 style) para cada objeto.

Seja amigável, entusiasmado e use emojis com moderação.
Responda SEMPRE em português brasileiro.`

function parseItineraryFromResponse(text: string): Itinerary | null {
  const match = text.match(/<itinerary>([\s\S]*?)<\/itinerary>/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim()) as Itinerary
  } catch {
    return null
  }
}

function stripItineraryTag(text: string): string {
  return text.replace(/<itinerary>[\s\S]*?<\/itinerary>/g, '').trim()
}

/** Convert our Message[] to Gemini Content[] for history restoration */
function toGeminiHistory(messages: Message[]): Content[] {
  // Skip the first assistant message (welcome — not from Gemini)
  const conversational = messages.slice(1)
  return conversational.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))
}

interface UseGeminiOptions {
  session: Session
  onUpdate: (messages: Message[], itinerary: Itinerary | null) => void
}

/** Fetch API key from server (runtime) with fallback to build-time env var */
async function resolveApiKey(): Promise<string> {
  // Try runtime endpoint first (Railway / production)
  try {
    const res = await fetch('/api/config')
    if (res.ok) {
      const data = await res.json() as { geminiApiKey?: string }
      if (data.geminiApiKey) return data.geminiApiKey
    }
  } catch {
    // offline or dev without server — fall through
  }
  // Fallback: build-time env var (local dev)
  return (import.meta.env.VITE_GEMINI_API_KEY as string) ?? ''
}

export function useGemini({ session, onUpdate }: UseGeminiOptions) {
  const [messages, setMessages] = useState<Message[]>(session.messages)
  const [isLoading, setIsLoading] = useState(false)
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(
    session.itinerary
  )

  const chatRef = useRef<ReturnType<
    ReturnType<GoogleGenerativeAI['getGenerativeModel']>['startChat']
  > | null>(null)
  const apiKeyRef = useRef<string>('')

  // Refs so effects can read latest values without stale closures
  const sessionRef = useRef(session)
  sessionRef.current = session
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  // Resolve API key once on mount
  useEffect(() => {
    resolveApiKey().then((key) => { apiKeyRef.current = key })
  }, [])

  // When the session switches, reset local state and force chat re-init
  useEffect(() => {
    setMessages(sessionRef.current.messages)
    setCurrentItinerary(sessionRef.current.itinerary)
    setIsLoading(false)
    chatRef.current = null
  }, [session.id]) // only fires when session ID changes

  const initChat = useCallback((history: Message[]) => {
    const apiKey = apiKeyRef.current
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_PROMPT,
    })
    const chat = model.startChat({
      history: toGeminiHistory(history),
      generationConfig: { maxOutputTokens: 8192 },
    })
    chatRef.current = chat
    return chat
  }, [])

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: userText.trim(),
        timestamp: new Date(),
      }

      const assistantMsgId = uuidv4()
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsLoading(true)

      try {
        // Ensure key is resolved (may still be fetching on first send)
        if (!apiKeyRef.current) {
          apiKeyRef.current = await resolveApiKey()
        }
        const apiKey = apiKeyRef.current
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      '⚠️ **Chave da API não configurada.**\n\nPara usar o Rota AI:\n1. Copie `.env.example` para `.env`\n2. Adicione sua chave em `VITE_GEMINI_API_KEY`\n3. Obtenha grátis em: [aistudio.google.com](https://aistudio.google.com)\n4. Reinicie o servidor',
                  }
                : m
            )
          )
          setIsLoading(false)
          return
        }

        // Initialize chat with current history if not yet done
        if (!chatRef.current) {
          initChat(messages)
        }
        if (!chatRef.current) throw new Error('Não foi possível inicializar o chat.')

        const result = await chatRef.current.sendMessageStream(userText.trim())

        let fullText = ''
        for await (const chunk of result.stream) {
          const parts: Array<{ text?: string; thought?: boolean }> =
            (chunk as any).candidates?.[0]?.content?.parts ?? []
          const chunkText =
            parts.length > 0
              ? parts.filter((p) => !p.thought).map((p) => p.text ?? '').join('')
              : chunk.text()
          if (!chunkText) continue
          fullText += chunkText
          const displayText = stripItineraryTag(fullText)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: displayText } : m
            )
          )
        }

        const parsed = parseItineraryFromResponse(fullText)
        const newItinerary = parsed ?? currentItinerary

        if (parsed) setCurrentItinerary(parsed)

        // Persist session after exchange
        setMessages((prev) => {
          onUpdateRef.current(prev, newItinerary)
          return prev
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `❌ Erro ao conectar com o Gemini: ${errorMsg}\n\nVerifique sua chave de API e tente novamente.`,
                }
              : m
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, initChat, messages, currentItinerary]
  )

  return {
    messages,
    isLoading,
    currentItinerary,
    sendMessage,
  }
}
