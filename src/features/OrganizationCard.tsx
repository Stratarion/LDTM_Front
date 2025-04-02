import React from 'react';
import Image from 'next/image';
import { Organization } from '@/types/organization';
import { Building2 } from 'lucide-react';

interface OrganizationCardProps {
  organization: Organization;
}

const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  return (
    <div className="card">
      <div className="w-full h-48 relative">
        {organization.avatar ? (
          <Image
            src={organization.avatar}
            alt={organization.name}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {organization.rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            ⭐ {organization.rating.toFixed(1)}
            <span className="text-gray-600">({organization.reviews_count})</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold">{organization.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{organization.address}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            organization.status === 'active' ? 'bg-green-100 text-green-800' :
            organization.status === 'inactive' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {organization.status === 'active' ? 'Активна' :
             organization.status === 'inactive' ? 'Неактивна' :
             'На модерации'}
          </span>
          
          {organization.school_type === 'private' && organization.cost_info && (
            <span className="text-sm text-gray-600">
              от {organization.cost_info.toLocaleString()} ₽/мес
            </span>
          )}
        </div>
        
        {organization.website && (
          <a 
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm block mt-2"
          >
            Веб-сайт
          </a>
        )}
      </div>
    </div>
  );
};

export default OrganizationCard; 