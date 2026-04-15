import { useState } from 'react'
import { MapPin, Calendar, Wallet, ChevronDown, Map, List } from 'lucide-react'
import type { Itinerary } from '../types'
import { DayCard } from './DayCard'
import { MapView } from './MapView'

interface Props {
  itinerary: Itinerary | null
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center mb-6">
        <span className="text-4xl">🗺️</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-200 mb-3">
        Seu roteiro aparecerá aqui
      </h2>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        Converse com o Rota AI no painel ao lado para criar seu roteiro personalizado. Ele vai te guiar passo a passo!
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
        {[
          { icon: '📍', text: 'Pontos marcados no mapa' },
          { icon: '🕐', text: 'Horários detalhados' },
          { icon: '💰', text: 'Estimativa de custos' },
          { icon: '💡', text: 'Dicas de viagem' },
        ].map((item) => (
          <div
            key={item.text}
            className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-start gap-2"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs text-gray-400 leading-tight">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type ViewMode = 'list' | 'map' | 'split'

export function ItineraryPanel({ itinerary }: Props) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const toggleDay = (index: number) => {
    setActiveDayIndex((prev) => (prev === index ? -1 : index))
  }

  if (!itinerary) {
    return (
      <div className="h-full bg-gray-900 flex flex-col">
        <div className="flex-1 overflow-auto">
          <EmptyState />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col" id="itinerary-export">
      {/* Itinerary header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-100 truncate">{itinerary.title}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin size={13} className="text-blue-400" />
                <span className="text-xs">{itinerary.destination}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar size={13} className="text-violet-400" />
                <span className="text-xs">
                  {itinerary.startDate} → {itinerary.endDate}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Wallet size={13} className="text-emerald-400" />
                <span className="text-xs">{itinerary.budget}</span>
              </div>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex-shrink-0 flex items-center bg-gray-800 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => setViewMode('list')}
              title="Lista"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Mapa"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Map size={14} />
            </button>
          </div>
        </div>

        {/* Day tabs */}
        {itinerary.days.length > 0 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
            {itinerary.days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(index)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeDayIndex === index
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Dia {day.day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'map' && (
          <div className="flex-1 p-3">
            <MapView itinerary={itinerary} />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {itinerary.days.map((day, index) => (
              <DayCard
                key={day.id}
                dayPlan={day}
                isActive={activeDayIndex === index}
                onToggle={() => toggleDay(index)}
              />
            ))}
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Map */}
            <div className="h-40 md:h-48 flex-shrink-0 p-2 md:p-3 pb-0">
              <MapView itinerary={itinerary} />
            </div>
            {/* Day cards */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-3">
              {itinerary.days.map((day, index) => (
                <DayCard
                  key={day.id}
                  dayPlan={day}
                  isActive={activeDayIndex === index}
                  onToggle={() => toggleDay(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
