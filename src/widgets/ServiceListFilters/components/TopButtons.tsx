'use client'

import { ChevronDown, ChevronUp, X } from "lucide-react"

interface ITopButtons {
  isExpanded: boolean;
  hasActiveFilters: boolean;
  handleReset: () => void;
  handleExpandClick: (isExpanded: boolean) => void;
}

export const TopButtons = ({
  isExpanded,
  hasActiveFilters,
  handleReset,
  handleExpandClick
}: ITopButtons) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleExpandClick(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>Свернуть</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Развернуть</span>
          </>
        )}
      </button>
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Сбросить все</span>
        </button>
      )}
    </div>
  )
}