export interface ISportFilters {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  price?: [number, number]
  age?: number
  ageRange?: [number, number]
  radius?: number
  coordinates?: [number, number]
  mapCenter?: [number, number]
}
