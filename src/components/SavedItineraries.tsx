import { X, Trash2, FolderOpen, MapPin, Calendar } from 'lucide-react'
import type { Itinerary } from '../types'

interface Props {
  itineraries: Itinerary[]
  onLoad: (itinerary: Itinerary) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function SavedItineraries({ itineraries, onLoad, onDelete, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-100">Roteiros Salvos</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {itineraries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-gray-500">Nenhum roteiro salvo ainda.</p>
              <p className="text-xs text-gray-600 mt-1">
                Crie um roteiro e clique em "Salvar" para armazená-lo aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {itineraries.map((it) => (
                <div
                  key={it.id}
                  className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-3 group transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => {
                        onLoad(it)
                        onClose()
                      }}
                      className="flex-1 text-left"
                    >
                      <h3 className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">
                        {it.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={11} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{it.destination}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar size={11} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500">
                          {it.startDate} → {it.endDate}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-gray-600">
                        {it.days.length} dia{it.days.length !== 1 ? 's' : ''} •{' '}
                        {new Date(it.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Deletar roteiro"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            {itineraries.length} roteiro{itineraries.length !== 1 ? 's' : ''} salvo
            {itineraries.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
