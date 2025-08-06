'use client'

import { IEmptyState } from "../lib/IEmptyState"

export const EmptyState = ({ router, handleFilterChange }: IEmptyState) => (
	<div className="bg-gray-50 rounded-lg p-8 text-center">
		<div className="text-gray-500 mb-4">
			<h3 className="text-lg font-medium">Ничего не найдено</h3>
			<p className="mt-2">
				По вашему запросу не найдено ни одной спортивной секции. 
				Попробуйте изменить параметры поиска.
			</p>
		</div>
		<button
			onClick={() => {
				router.push('/sports')
				handleFilterChange({})
			}}
			className="mt-4 text-[#5CD2C6] hover:text-[#4BC0B5] underline"
		>
			Сбросить все фильтры
		</button>
	</div>
)