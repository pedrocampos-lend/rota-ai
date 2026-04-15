import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
  Lightbulb,
  Camera,
  UtensilsCrossed,
  Bus,
  Hotel,
  Zap,
} from 'lucide-react'
import type { DayPlan, Activity } from '../types'

interface Props {
  dayPlan: DayPlan
  isActive: boolean
  onToggle: () => void
}

const activityConfig = {
  sightseeing: {
    icon: Camera,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    label: 'Turismo',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  food: {
    icon: UtensilsCrossed,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    label: 'Gastronomia',
    badge: 'bg-orange-500/20 text-orange-300',
  },
  transport: {
    icon: Bus,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    label: 'Transporte',
    badge: 'bg-green-500/20 text-green-300',
  },
  accommodation: {
    icon: Hotel,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    label: 'Hospedagem',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  activity: {
    icon: Zap,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/30',
    label: 'Atividade',
    badge: 'bg-pink-500/20 text-pink-300',
  },
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type] ?? activityConfig.activity
  const Icon = config.icon

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border ${config.border} ${config.bg} animate-slide-in`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} border ${config.border}`}
      >
        <Icon size={15} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100">{activity.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
          </div>
          {activity.time && (
            <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
              <Clock size={11} />
              <span className="text-xs">{activity.time}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{activity.description}</p>
        <div className="flex flex-wrap gap-3 mt-2">
          {activity.location && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin size={11} />
              <span className="text-xs truncate max-w-[200px]">{activity.location.address}</span>
            </div>
          )}
          {activity.cost && (
            <div className="flex items-center gap-1 text-emerald-500">
              <DollarSign size={11} />
              <span className="text-xs">{activity.cost}</span>
            </div>
          )}
        </div>
        {activity.tips && (
          <div className="flex items-start gap-1.5 mt-2 bg-amber-400/5 border border-amber-400/20 rounded-lg p-2">
            <Lightbulb size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-300/80 leading-relaxed">{activity.tips}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const DAY_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-indigo-500 to-blue-500',
  'from-red-500 to-pink-500',
]

export function DayCard({ dayPlan, isActive, onToggle }: Props) {
  const [_expanded, _setExpanded] = useState(true)
  const colorClass = DAY_COLORS[(dayPlan.day - 1) % DAY_COLORS.length]

  return (
    <div
      className={`bg-gray-800 rounded-2xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
        >
          {dayPlan.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Dia {dayPlan.day}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">{dayPlan.date}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-100 truncate">{dayPlan.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 hidden sm:block">
            {dayPlan.activities.length} atividades
          </span>
          {isActive ? (
            <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Activities */}
      {isActive && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-700/50 pt-3">
          {dayPlan.activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}
