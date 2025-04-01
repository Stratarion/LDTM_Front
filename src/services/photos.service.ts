import { API } from './api'

export type PhotoEntityType = 'organisation' | 'service' | 'user' | 'review'
export type PhotoStatus = 'active' | 'inactive' | 'deleted'

export interface Photo {
  id: string
  url: string
  thumbnailUrl?: string
  entityType?: PhotoEntityType
  entityId?: string
  order?: number
  status?: PhotoStatus
  mimeType?: string
  size?: number
  width?: number
  height?: number
  description?: string
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
}

interface UpdatePhotoDTO {
  description?: string
  order?: number
}

export class PhotosService {
  static async uploadPhoto(
    file: File, 
    entityType: PhotoEntityType, 
    entityId: string, 
    uploadedBy: string,
    description?: string
  ) {
    // Конвертируем файл в base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })

    const response = await API.post<{ data: Photo }>('/photos/upload', {
      base64Data,
      entityType,
      entityId,
      uploadedBy,
      description
    })
    
    return response.data.data
  }

  static async getEntityPhotos(entityId: string, entityType: PhotoEntityType) {
    const params = new URLSearchParams({ 
      entityId,
      entityType 
    })

    const response = await API.get<{ data: Photo[] }>(`/photos?${params}`)
    return response.data.data
  }

  static async deletePhoto(id: string) {
    await API.delete(`/photos/${id}`)
  }

  static async updateOrder(photos: { id: string; order: number }[]) {
    await API.put('/photos/order', { photos })
  }

  static async updatePhoto(id: string, data: UpdatePhotoDTO) {
    const response = await API.patch<{ data: Photo }>(`/photos/${id}`, data)
    return response.data.data
  }
} 