export const formatTime = (time: string): string => {
  return time.substring(0, 5) // Обрезаем секунды из формата HH:mm:ss
}

export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
} 