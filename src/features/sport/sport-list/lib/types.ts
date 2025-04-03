import { ISport } from '@/shared/types/sport';

export interface SportListResponse {
	currentPage: number
	data: ISport[]
	totalPages: number
	totalCount: number
}

export interface SportListRequestBody {
	page: number
	limit: number
	filters?: {
		name?: string
		address?: string
		category?: string
		subcategory?: string
		minRating?: number
		minPrice?: number
		maxPrice?: number
		minAge?: number
		maxAge?: number
		radius?: number
	}
	mapCenter?: [number, number]
}
	