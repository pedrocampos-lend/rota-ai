import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Itinerary, Activity } from '../types'

// Fix Leaflet default marker icons when bundled with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const activityColors: Record<Activity['type'], string> = {
  sightseeing: '#60a5fa',
  food: '#fb923c',
  transport: '#4ade80',
  accommodation: '#a78bfa',
  activity: '#f472b6',
}

const activityEmoji: Record<Activity['type'], string> = {
  sightseeing: '🏛️',
  food: '🍽️',
  transport: '🚌',
  accommodation: '🏨',
  activity: '🎯',
}

function createColoredIcon(type: Activity['type'], day: number) {
  const color = activityColors[type]
  const emoji = activityEmoji[type]
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 44px;
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #111;
        ">${day}</div>
        <div style="
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
        ">${emoji}</div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

interface FitBoundsProps {
  locations: { lat: number; lng: number }[]
}

function FitBounds({ locations }: FitBoundsProps) {
  const map = useMap()
  useEffect(() => {
    if (locations.length === 0) return
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 13)
      return
    }
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [locations, map])
  return null
}

interface Props {
  itinerary: Itinerary | null
}

export function MapView({ itinerary }: Props) {
  const allLocations: { lat: number; lng: number; activity: Activity; day: number }[] = []

  if (itinerary) {
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.location) {
          allLocations.push({
            lat: activity.location.lat,
            lng: activity.location.lng,
            activity,
            day: day.day,
          })
        }
      }
    }
  }

  const defaultCenter: [number, number] = [-14.235, -51.9253] // Brazil center
  const defaultZoom = 4

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {allLocations.map((loc, idx) => (
          <Marker
            key={`${loc.activity.id}-${idx}`}
            position={[loc.lat, loc.lng]}
            icon={createColoredIcon(loc.activity.type, loc.day)}
          >
            <Popup>
              <div className="min-w-[160px]">
                <div className="font-semibold text-sm">{loc.activity.title}</div>
                <div className="text-xs text-gray-600 mt-1">{loc.activity.description}</div>
                {loc.activity.location && (
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {loc.activity.location.address}
                  </div>
                )}
                {loc.activity.time && (
                  <div className="text-xs text-gray-500 mt-0.5">🕐 {loc.activity.time}</div>
                )}
                {loc.activity.cost && (
                  <div className="text-xs text-green-600 mt-0.5">💰 {loc.activity.cost}</div>
                )}
                <div className="text-xs text-blue-600 mt-1 font-medium">Dia {loc.day}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds locations={allLocations} />
      </MapContainer>
    </div>
  )
}
