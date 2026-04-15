import { Plus, X, Trash2, MessageCircle, MapPin } from 'lucide-react'
import type { Session } from '../types'

interface Props {
  sessions: Session[]
  currentSessionId: string
  onNewChat: () => void
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHour < 24) return `${diffHour}h atrás`
  if (diffDay === 1) return 'Ontem'
  if (diffDay < 7) return `${diffDay} dias atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function SessionsSidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSwitch,
  onDelete,
  onClose,
}: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl animate-slide-right safe-top safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <MessageCircle size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-100">Conversas</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { onNewChat(); onClose() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 text-sm font-medium transition-all"
          >
            <Plus size={15} />
            Nova conversa
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
          {sessions.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-8">
              Nenhuma conversa salva
            </p>
          )}
          {sessions.map((session) => {
            const isActive = session.id === currentSessionId
            const userMessages = session.messages.filter((m) => m.role === 'user')
            return (
              <div
                key={session.id}
                className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-gray-800 border border-gray-700'
                    : 'hover:bg-gray-800/60'
                }`}
                onClick={() => { onSwitch(session.id); onClose() }}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  session.itinerary
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-gray-700 text-gray-500'
                }`}>
                  {session.itinerary ? <MapPin size={11} /> : <MessageCircle size={11} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate leading-snug ${
                    isActive ? 'text-gray-100' : 'text-gray-300'
                  }`}>
                    {session.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-600">
                      {formatDate(session.updatedAt)}
                    </span>
                    {userMessages.length > 0 && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="text-[10px] text-gray-600">
                          {userMessages.length} msg{userMessages.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(session.id) }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all mt-0.5"
                  title="Excluir conversa"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 text-center">
            {sessions.length} conversa{sessions.length !== 1 ? 's' : ''} salva{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>
    </>
  )
}
