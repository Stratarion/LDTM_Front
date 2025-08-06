'use client'

import { AlertCircle } from 'lucide-react'
import { IErrorMessage } from '../lib/IErrorMessage'

export const ErrorMessage = ({
  setError,
  error,
  reload
}: IErrorMessage) => (
	<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		<div className="flex items-center gap-2 text-red-700">
			<AlertCircle className="w-5 h-5" />
			<span>{error}</span>
		</div>
		<button 
			onClick={() => {
				setError("")
				reload()
			}}
			className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
		>
			Попробовать снова
		</button>
	</div>
)