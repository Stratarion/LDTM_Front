import { Coordinates } from "@/shared/types/map"

export const loadUserLocation = (): Promise<Coordinates> => {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      return resolve(null)
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.latitude, position.coords.longitude]),
      (error) => {
        console.error('Error getting location:', error)
        resolve(null)
      }
    )
  })
}