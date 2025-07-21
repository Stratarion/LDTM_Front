'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import SportFilters from '@/features/SportFilters'
import SportMap from '@/features/sport/SportMap'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'
import { loadUserLocation } from '../lib/helpers'
import { ISportFilters } from '@/shared/types/SportFilter'

import { MOSCOW_COORDS } from '@/shared/lib/constants'
import { Coordinates } from '@/shared/types/map'
import { MainList } from '@/widgets/MainList'
import { IContentItem } from '@/widgets/MainList/models/ContentItem'
import { IService } from '@/shared/types/service'
import { ServicesAPI } from '@/shared/api/services.api'

export const SportList = () => {
	const router = useRouter()
	const pathname = usePathname()
	const [sports, setSports] = useState<IService[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoading, setIsLoading] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentFilters, setCurrentFilters] = useState<ISportFilters>({})
	const [isMapFullscreen, setIsMapFullscreen] = useState(false)
	const [userLocation, setUserLocation] = useState<Coordinates>(null)

	// Get user location
	useEffect(() => {
		const fetchLocation = async () => {
			const coords = await loadUserLocation()
			setUserLocation(coords ?? MOSCOW_COORDS) // fallback to [0, 0] если null
		}
		
		fetchLocation()
	}, [])

	// Загрузка данных с фильтрами
	const loadSports = useCallback(async (pageNum: number, filters: ISportFilters) => {
		try {
			setIsLoading(true)
			setError(null)
			
			const response = await ServicesAPI.getServicesWithMap(pageNum, 12, filters, userLocation || undefined)
			if (pageNum === 1) {
				setSports(response.data)
			} else {
				setSports(prev => [...prev, ...response.data])
			}
			
			setHasMore(pageNum < response.totalPages)
		} catch (err: any) {
			setError(err.response?.data?.message || 'Произошла ошибка при загрузке данных')
			setHasMore(false)
		} finally {
			setIsLoading(false)
			setIsInitialLoad(false)
		}
	}, [userLocation])

	// Обработчик изменения фильтров (с обновлением URL)
	const handleFilterChange = useCallback((newFilters: ISportFilters) => {
		const params = new URLSearchParams()
		
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value !== undefined) {
				if (Array.isArray(value)) {
					params.set(key, JSON.stringify(value))
				} else {
					params.set(key, String(value))
				}
			}
		})

		router.push(`${pathname}${params.toString() ? '?' + params.toString() : ''}`)
		setCurrentFilters(newFilters)
		setPage(1)
		setSports([])
		loadSports(1, newFilters)
	}, [router, pathname, loadSports])

	// Загрузка следующей страницы
	const { ref, inView } = useInView({
		threshold: 0,
	})

	useEffect(() => {
		if (inView && hasMore && !isLoading) {
			const nextPage = page + 1
			setPage(nextPage)
			loadSports(nextPage, currentFilters)
		}
	}, [inView, hasMore, isLoading, page, loadSports, currentFilters])

	// Начальная загрузка только при изменении фильтров
	useEffect(() => {
		loadSports(1, currentFilters)
	}, [loadSports, currentFilters])

	return (
		<>
			<div className="mb-8">
				<SportFilters
					initialFilters={currentFilters}
					onFilterChange={handleFilterChange}
				/>
			</div>

			{error && <ErrorMessage
				error={error}
				setError={setError}
				loadSports={loadSports}
				currentFilters={currentFilters}
			/>}

			{!error && sports.length === 0 && !isInitialLoad && !isLoading && (
				<EmptyState router={router} handleFilterChange={handleFilterChange} />
			)}

			<SportMap 
				sports={sports} 
				isFullscreen={isMapFullscreen}
				onFullscreenChange={setIsMapFullscreen}
			/>

      <MainList content={sports as IContentItem[]} startLink='sport' />

			{isLoading && (
				<div className="flex justify-center py-8">
					<Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
				</div>
			)}

			{!isLoading && !error && hasMore && (
				<div ref={ref} className="h-4" />
			)}
		</>
	)
}