import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import {
  FileDown,
  Share2,
  MessageSquare,
  Plane,
  MessageCircle,
  Map,
  Plus,
} from 'lucide-react'
import { ChatPanel } from './components/ChatPanel'
import { ItineraryPanel } from './components/ItineraryPanel'
import { SessionsSidebar } from './components/SessionsSidebar'
import { useGemini } from './hooks/useGemini'
import { useSessions } from './hooks/useSessions'
import { exportItineraryToPDF } from './utils/pdfExport'
import { buildShareURL, getItineraryFromURL } from './utils/shareLink'
import type { Message, Itinerary } from './types'

type MobileTab = 'chat' | 'itinerary'

export default function App() {
  const {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    switchSession,
    updateSession,
    removeSession,
  } = useSessions()

  const [showSidebar, setShowSidebar] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat')
  const [hasNewItinerary, setHasNewItinerary] = useState(false)

  // Called by useGemini after every exchange to auto-save the session
  const handleUpdate = useCallback(
    (messages: Message[], itinerary: Itinerary | null) => {
      updateSession(currentSessionId, messages, itinerary)
    },
    [currentSessionId, updateSession]
  )

  const { messages, isLoading, currentItinerary, sendMessage } = useGemini({
    session: currentSession,
    onUpdate: handleUpdate,
  })

  // Load shared itinerary from URL on first mount
  useEffect(() => {
    const fromUrl = getItineraryFromURL()
    if (fromUrl) {
      toast.success('Roteiro carregado do link!', { duration: 4000 })
      const url = new URL(window.location.href)
      url.searchParams.delete('roteiro')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // Badge on mobile Roteiro tab when new itinerary arrives
  useEffect(() => {
    if (currentItinerary && mobileTab === 'chat') {
      setHasNewItinerary(true)
    }
  }, [currentItinerary])

  const handleExportPDF = async () => {
    if (!currentItinerary) {
      toast.error('Nenhum roteiro para exportar.')
      return
    }
    setIsExporting(true)
    try {
      await exportItineraryToPDF(currentItinerary)
      toast.success('PDF exportado! 📄')
    } catch {
      toast.error('Erro ao exportar PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!currentItinerary) {
      toast.error('Nenhum roteiro para compartilhar.')
      return
    }
    try {
      const url = buildShareURL(currentItinerary)
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado! 🔗', { duration: 3000 })
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const handleNewChat = () => {
    createSession()
    setMobileTab('chat')
    setHasNewItinerary(false)
  }

  const handleSwitchSession = (id: string) => {
    switchSession(id)
    setMobileTab('chat')
    setHasNewItinerary(false)
  }

  const handleItineraryTab = () => {
    setMobileTab('itinerary')
    setHasNewItinerary(false)
  }

  return (
    <div className="h-full bg-gray-950 flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#60a5fa', secondary: '#1f2937' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1f2937' } },
        }}
      />

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between gap-2 px-3 py-2.5 safe-top">
        <div className="flex items-center gap-2">
          {/* Sessions trigger */}
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-800 transition-colors group"
            title="Conversas"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Plane size={13} className="text-white" />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-xs font-bold text-gray-100 leading-none">Rota AI</h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5 truncate max-w-[100px]">
                {currentSession.title === 'Nova conversa' ? 'Planejador de Viagens' : currentSession.title}
              </p>
            </div>
          </button>

          {/* Conversations button */}
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium transition-colors min-h-[36px]"
            title="Conversas"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">Conversas</span>
            <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full font-mono">
              {sessions.length}
            </span>
          </button>

          {/* New chat shortcut */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium transition-colors min-h-[36px]"
            title="Nova conversa"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium transition-colors disabled:opacity-40 min-h-[36px]"
            disabled={!currentItinerary}
            title="Compartilhar"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={!currentItinerary || isExporting}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white text-xs font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            title="Exportar PDF"
          >
            <FileDown size={13} />
            <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'PDF'}</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Chat panel */}
        <div className={`
          flex flex-col border-gray-800
          md:w-[40%] md:min-w-[300px] md:flex-shrink-0 md:border-r md:flex
          ${mobileTab === 'chat' ? 'flex flex-col flex-1' : 'hidden md:flex'}
        `}>
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Rota AI</span>
            <span className="text-xs text-gray-700">• Gemini Flash</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
            />
          </div>
        </div>

        {/* Itinerary panel */}
        <div className={`
          flex flex-col flex-1 overflow-hidden
          md:flex
          ${mobileTab === 'itinerary' ? 'flex' : 'hidden md:flex'}
        `}>
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              {currentItinerary ? `📍 ${currentItinerary.destination}` : 'Roteiro'}
            </span>
            {currentItinerary && (
              <span className="text-xs text-gray-600">
                • {currentItinerary.days.length} dia{currentItinerary.days.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <ItineraryPanel itinerary={currentItinerary} />
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tabs ── */}
      <nav className="flex-shrink-0 md:hidden border-t border-gray-800 bg-gray-900 flex safe-bottom">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[56px] ${
            mobileTab === 'chat' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <MessageCircle size={20} />
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button
          onClick={handleItineraryTab}
          className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[56px] ${
            mobileTab === 'itinerary' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Map size={20} />
          <span className="text-[10px] font-medium">Roteiro</span>
          {hasNewItinerary && (
            <span className="absolute top-2.5 right-[calc(50%-14px)] w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </button>
      </nav>

      {/* Sessions sidebar */}
      {showSidebar && (
        <SessionsSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={handleNewChat}
          onSwitch={handleSwitchSession}
          onDelete={removeSession}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}
