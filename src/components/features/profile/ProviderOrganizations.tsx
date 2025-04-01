'use client'

import { useState, useEffect } from 'react'
import { Plus, Building2, Loader2, GraduationCap, Flower } from 'lucide-react'
import { OrganizationsService } from '@/services/organizations.service'
import { Photo, PhotosService } from '@/services/photos.service'
import { useAuth } from '@/hooks/useAuth'
import AddOrganizationForm from './AddOrganizationForm'
import Image from 'next/image'
import { Organization } from '@/types/organization'
import OrganizationDetailsModal from './OrganizationDetailsModal'
import { useNotifications } from '@/hooks/useNotifications'

type OrganizationType = 'school' | 'garden'

const typeLabels: Record<OrganizationType, string> = {
  school: 'Школа',
  garden: 'Детский сад'
}

const TypeIcon = ({ type }: { type: OrganizationType }) => {
  if (type === 'school') {
    return <GraduationCap className="w-5 h-5 text-blue-500" />
  }
  return <Flower className="w-5 h-5 text-pink-500" />
}

interface OrganizationWithPhoto extends Organization {
  photos: Photo[]
  mainPhoto?: {
    url: string;
  } | null;
}

export default function ProviderOrganizations() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<OrganizationWithPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationWithPhoto | null>(null)
  const { showNotification } = useNotifications()

  const loadOrganizations = async () => {
    if (!user) return
    
    try {
      const orgs = await OrganizationsService.getUserOrganizations(user.id)
      
      // Загружаем фотографии для каждой организации
      const orgsWithPhotos = await Promise.all(
        orgs.map(async (org) => {
          try {
            const photos = await PhotosService.getEntityPhotos(org.id, 'organisation')
            // Сначала ищем фото с description === 'main'
            let mainPhoto = photos.find(p => p.description === 'main')
            
            // Если главного фото нет, берем первое активное по порядку
            if (!mainPhoto) {
              mainPhoto = photos
                .filter(p => p.status === 'active')[0]
            }
            
            return { 
              ...org, 
              mainPhoto,
              photos: photos.filter(p => p.status === 'active')
            }
          } catch (error) {
            console.error(`Error loading photo for organization ${org.id}:`, error)
            return { ...org, mainPhoto: null, photos: [] }
          }
        })
      )
      
      setOrganizations(orgsWithPhotos)
    } catch (err) {
      setError('Не удалось загрузить организации')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [user])

  const handleDelete = async (id: string) => {
    try {
      await OrganizationsService.deleteOrganization(id)
      setOrganizations(organizations.filter(org => org.id !== id))
      setSelectedOrganization(null)
      showNotification({
        title: 'Успешно',
        message: 'Организация была удалена',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось удалить организацию',
        type: 'error'
      })
    }
  }

  const handleEdit = async () => {
    await loadOrganizations()
  }

  const handleOrganizationClick = (org: OrganizationWithPhoto) => {
    setSelectedOrganization(org)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Мои организации
        </h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить организацию
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => handleOrganizationClick(org)}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#5CD2C6] transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {org.mainPhoto ? (
                    <Image
                      src={org.mainPhoto.url}
                      alt={org.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {org.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-gray-600">
                          {org.address}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm">
                          <TypeIcon type={org.type} />
                          <span className={`${
                            org.type === 'school' ? 'text-blue-600' : 'text-pink-600'
                          }`}>
                            {typeLabels[org.type]}
                          </span>
                        </div>
                      </div>
                    </div>
                    {org.cost_info && (
                      <span className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-600">
                        ~{org.cost_info?.toLocaleString()} ₽/месяц
                      </span>
                    )}
                  </div>
                  {org.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {org.rating > 0 && (
                      <span className="text-sm text-gray-600">
                        ⭐ {org.rating.toFixed(1)} ({org.reviews_count})
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      org.status === 'active' ? 'bg-green-100 text-green-800' :
                      org.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {org.status === 'active' ? 'Активна' :
                       org.status === 'inactive' ? 'Неактивна' :
                       'На модерации'}
                    </span>
                    {org.website && (
                      <a 
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Веб-сайт
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              У вас пока нет организаций. Добавьте первую!
            </p>
          </div>
        )}
      </div>

      <AddOrganizationForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          loadOrganizations()
        }}
      />

      {selectedOrganization && (
        <OrganizationDetailsModal
          organization={selectedOrganization}
          photos={selectedOrganization.photos || []}
          isOpen={!!selectedOrganization}
          onClose={() => setSelectedOrganization(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
} 