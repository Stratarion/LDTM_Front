'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// models
import { IContentItem } from '@/widgets/MainList/models/IContentItem'
import { ICoordinates } from '@/shared/lib/types/ICoordinates'
import { IServiceFilters } from '@/entities/service/model/IServiceFilters'
import { IService } from '@/entities/service/model/IService'
import { TServiceCategory } from '@/entities/service/model/TService'

// constants
import { filtersList, PAGES_LIMIT } from './lib/constanst'
import { loadUserLocation } from './lib/helpers'
import { MOSCOW_COORDS } from '@/shared/lib/constants'

// api
import { ServicesAPI } from '@/entities/service/api/services.api'

// components
import { ErrorMessage } from './ui/ErrorMessage'
import { EmptyState } from './ui/EmptyState'
import { ServiceListFilters } from '@/widgets/ServiceListFilters'
import { MainList } from '@/widgets/MainList'
import { SportMap } from '@/features/sport/SportMap'

export const SerivcesList = ({ serciveType }: {serciveType: TServiceCategory}) => {
	const router = useRouter()
	const pathname = usePathname()
	const [servicesList, setServicesList] = useState<IService[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoading, setIsLoading] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentFilters, setCurrentFilters] = useState<IServiceFilters>({})
	const [isMapFullscreen, setIsMapFullscreen] = useState(false)
	const [userLocation, setUserLocation] = useState<ICoordinates>()

	// Get user location
	useEffect(() => {
		const fetchLocation = async () => {
			const coords = await loadUserLocation()
			setUserLocation(coords ?? MOSCOW_COORDS) // fallback to [0, 0] если null
		}
		
		fetchLocation()
	}, [])

	// Загрузка данных с фильтрами
	const loadServicesList = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			
			const response = await ServicesAPI.getServicesWithMap(
        page,
        PAGES_LIMIT,
        serciveType,
        currentFilters,
        userLocation || undefined
      );

			if (page === 1) {
				setServicesList(response.data)
			} else {
				setServicesList(prev => [...prev, ...response.data])
			}
			
			setHasMore(page < response.totalPages)
		} catch (err: any) {
			setError(err.response?.data?.message || 'Произошла ошибка при загрузке данных')
			setHasMore(false)
		} finally {
			setIsLoading(false)
			setIsInitialLoad(false)
		}
	}, [userLocation, serciveType, currentFilters, page])

	// Обработчик изменения фильтров (с обновлением URL)
	const handleFilterChange = useCallback((newFilters: IServiceFilters) => {
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
		setServicesList([])
		loadServicesList()
	}, [router, pathname, loadServicesList])

	// Загрузка следующей страницы
	const { ref, inView } = useInView({
		threshold: 0,
	})

	useEffect(() => {
		if (inView && hasMore && !isLoading) {
			const nextPage = page + 1
			setPage(nextPage)
			loadServicesList()
		}
	}, [inView, hasMore, isLoading, page, loadServicesList, currentFilters])

	// Начальная загрузка только при изменении фильтров
	useEffect(() => {
		loadServicesList()
	}, [loadServicesList, currentFilters])

	return (
		<>
			<div className="mb-8">
				<ServiceListFilters
					initialFilters={currentFilters}
					onFilterChange={handleFilterChange}
          filtersList={filtersList}
				/>
			</div>

			{error && <ErrorMessage
				error={error}
				setError={setError}
				reload={loadServicesList}
			/>}

			{!error && servicesList.length === 0 && !isInitialLoad && !isLoading && (
				<EmptyState router={router} handleFilterChange={handleFilterChange} serviceType={serciveType} />
			)}

			<SportMap 
				sports={servicesList} 
				isFullscreen={isMapFullscreen}
				onFullscreenChange={setIsMapFullscreen}
			/>

      <MainList content={servicesList as IContentItem[]} startLink={serciveType} />

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