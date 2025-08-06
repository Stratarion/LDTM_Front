import { MOSCOW_COORDS } from "@/shared/lib/constants"
import { ICoordinates } from "@/shared/lib/types/ICoordinates"

export const loadUserLocation = (): Promise<ICoordinates> => {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      return resolve(MOSCOW_COORDS)
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => {
        console.error('Error getting location:', error)
        resolve(MOSCOW_COORDS)
      }
    )
  })
}