export interface IBaseListResponse<T = undefined> {
	currentPage: number
	data: T[]
	totalPages: number
	totalCount: number
}