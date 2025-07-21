'use client'

import { useEffect, useState } from 'react'
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps'
import { Sport } from '@/services/sports.service'
import { Maximize2, Minimize2, ChevronDown, ChevronUp, X } from 'lucide-react'
import Link from 'next/link'

interface SportMapProps {
  sports: Sport[]
  isFullscreen?: boolean
  onFullscreenChange?: (isFullscreen: boolean) => void
  onCenterChange?: (center: [number, number]) => void
}

interface SportWithCoords extends Sport {
  coordinates?: [number, number]
}

const SportMap = ({ sports, isFullscreen = false, onFullscreenChange, onCenterChange }: SportMapProps) => {
  const [mapState, setMapState] = useState({
    center: [55.75, 37.57], // Moscow coordinates as fallback
    zoom: 10,
  })
  const [sportsWithCoords, setSportsWithCoords] = useState<SportWithCoords[]>([])
  const [ymaps, setYmaps] = useState<any>(null)
  const [selectedSport, setSelectedSport] = useState<SportWithCoords | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Обработчик нажатия клавиши Escape для выхода из полноэкранного режима
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && onFullscreenChange) {
        onFullscreenChange(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFullscreen, onFullscreenChange])

  // Get user location and set as map center
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(coords)
          setMapState(prev => ({
            ...prev,
            center: coords,
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          // Keep Moscow coordinates as fallback
        }
      )
    }
  }, [])

  // Geocode addresses to get coordinates
  useEffect(() => {
    if (!ymaps || !sports.length) return

    const geocodeAddresses = async () => {
      const sportsWithCoordsPromises = sports.map(async (sport) => {
        if (!sport.address) return { ...sport, coordinates: undefined }
        
        try {
          const result = await ymaps.geocode(sport.address)
          const firstGeoObject = result.geoObjects.get(0)
          if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates()
            return { ...sport, coordinates: coords as [number, number] }
          }
        } catch (error) {
          console.error('Geocoding error:', error)
        }
        return { ...sport, coordinates: undefined }
      })

      const newSportsWithCoords = await Promise.all(sportsWithCoordsPromises)
      setSportsWithCoords(newSportsWithCoords as SportWithCoords[])

      // Only update map center if user location is not available
      if (!userLocation) {
        const firstSportWithCoords = newSportsWithCoords.find(s => (s as SportWithCoords).coordinates)
        if (firstSportWithCoords && (firstSportWithCoords as SportWithCoords).coordinates) {
          setMapState(prev => ({
            ...prev,
            center: (firstSportWithCoords as SportWithCoords).coordinates!,
          }))
        }
      }
    }

    geocodeAddresses()
  }, [ymaps, sports, userLocation])

  const handlePlacemarkClick = (sport: SportWithCoords) => {
    setSelectedSport(sport)
    if (sport.coordinates) {
      setMapState(prev => ({
        ...prev,
        center: sport.coordinates!,
      }))
    }
  }

  const toggleFullscreen = () => {
    if (onFullscreenChange) {
      if (isCollapsed) {
        setIsCollapsed(false)
      }
      onFullscreenChange(!isFullscreen)
      // При входе в полноэкранный режим увеличиваем зум
      if (!isFullscreen) {
        setMapState(prev => ({
          ...prev,
          zoom: prev.zoom + 1
        }))
      }
    }
  }

  const toggleCollapse = () => {
    if (isFullscreen && onFullscreenChange) {
      onFullscreenChange(false)
    }
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div 
      className={`relative transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'h-16' 
          : isFullscreen 
            ? 'fixed inset-0 z-50' 
            : 'h-[400px]'
      } mb-6 rounded-lg overflow-hidden bg-white shadow-lg`}
    >
      {/* Map Controls */}
      <div className={`absolute ${isFullscreen ? 'top-6 right-6' : 'top-4 right-4'} z-10 flex gap-2`}>
        {!isFullscreen && (
          <button
            onClick={toggleCollapse}
            className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white/100 transition-colors border border-gray-200"
            title={isCollapsed ? 'Развернуть карту' : 'Свернуть карту'}
          >
            {isCollapsed ? <ChevronDown className="text-gray-700" /> : <ChevronUp className="text-gray-700" />}
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white/100 transition-colors border border-gray-200"
          title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
        >
          {isFullscreen ? <Minimize2 className="text-gray-700" /> : <Maximize2 className="text-gray-700" />}
        </button>
      </div>

      {/* Selected Sport Info */}
      {/* {selectedSport && !isCollapsed && (
        <div className={`absolute ${isFullscreen ? 'left-6 top-6' : 'left-4 top-4'} z-10 w-80 bg-white rounded-lg shadow-lg p-4`}>
          <button
            onClick={() => setSelectedSport(null)}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">{selectedSport.name}</h3>
            
            {selectedSport.image && (
              <img
                src={selectedSport.image}
                alt={selectedSport.name}
                className="w-full h-40 object-cover rounded-md"
              />
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Адрес:</span> {selectedSport.address}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Цена:</span> {selectedSport.price}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Возраст:</span> {selectedSport.age_from}-{selectedSport.age_to} лет
              </p>
              {selectedSport.description && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Описание:</span> {selectedSport.description}
                </p>
              )}
            </div>

            <Link
              href={`/sports/${selectedSport.id}`}
              className="block w-full text-center py-2 px-4 bg-[#5CD2C6] hover:bg-[#4BC0B5] text-white rounded-md transition-colors"
            >
              Подробнее
            </Link>
          </div>
        </div>
      )} */}

      {/* Collapsed Map Title */}
      {isCollapsed && (
        <div className="absolute inset-0 flex items-center px-4 bg-white">
          <h3 className="font-medium text-gray-700">Карта спортивных секций</h3>
        </div>
      )}

      {/* Map */}
      {!isCollapsed && (
        <YMaps query={{ apikey: 'e8fb8a66-5d6c-400f-ae13-024a40a5f460' }}>
          <Map
            defaultState={mapState}
            state={mapState}
            width="100%"
            height="100%"
            modules={['geocode']}
            onLoad={(ymapsInstance: any) => setYmaps(ymapsInstance)}
            onBoundsChange={(e: any) => {
              const newCenter = e.get('target').getCenter()
              if (onCenterChange) {
                onCenterChange(newCenter)
              }
            }}
          >
            <ZoomControl options={{ position: { right: 10, top: 90 } }} />
            {/* User location marker */}
            {userLocation && (
              <Placemark
                geometry={userLocation}
                options={{
                  preset: 'islands#geolocationIcon',
                  iconColor: '#1E88E5'
                }}
                properties={{
                  hintContent: 'Ваше местоположение'
                }}
              />
            )}
            {/* {sportsWithCoords.map((sport) => {
              if (sport.coordinates) {
                return (
                  <Placemark
                    key={sport.id}
                    geometry={sport.coordinates}
                    onClick={() => handlePlacemarkClick(sport)}
                    properties={{
                      iconContent: selectedSport?.id === sport.id ? '•' : undefined
                    }}
                    options={{
                      preset: selectedSport?.id === sport.id 
                        ? 'islands#redCircleDotIcon'
                        : 'islands#blueCircleDotIcon',
                    }}
                  />
                )
              }
              return null
            })} */}
          </Map>
        </YMaps>
      )}
    </div>
  )
}

export default SportMap 