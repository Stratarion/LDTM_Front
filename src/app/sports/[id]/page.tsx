'use client'

import { useParams } from 'next/navigation'

import { SportDetailsPage } from "@/pages/sport/sportDetails";

export default function SportDetails() {
  const params = useParams()
  
  if (!params?.id) {
    return null // или fallback UI
  }

  // Проверяем, что id - это строка (а не массив строк)
  const id = typeof params.id === 'string' ? params.id : params.id[0]

  return <SportDetailsPage id={id} />;
}