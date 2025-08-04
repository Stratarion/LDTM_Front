'use client'
import { IListHeader } from "./models"

export const ListHeader = ({
  header,
  description,
}: IListHeader) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{header}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  )
}