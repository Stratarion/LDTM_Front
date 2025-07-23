export interface IBid {
  id: string
  status: 'active' | 'cancelled'
  createdAt: string
  user_id: string
  schedule?: { // вынести
    id: string
    date: string
    startTime: string  // "10:00:00"
    service: {
      id: string
      name: string
      description: string
      max_students: number
      duration: number
    }
    teacher: {
      id: string
      first_name: string
      last_name: string
    }
    activeBidsCount: number
  }
}