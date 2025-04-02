'use client'

import { 
  Dumbbell, 
  GraduationCap, 
  Music, 
  Palette, 
  Languages, 
  Code,
  Microscope,
  BookOpen,
  Trophy,
  Laptop
} from 'lucide-react'
import { Tooltip } from '@/shared/ui/tooltip'

interface Feature {
  id: string
  name: string
  icon: keyof typeof featureIcons
  description: string
}

interface SportFeaturesProps {
  features: Feature[]
}

const featureIcons = {
  sports: Dumbbell,
  chess: GraduationCap,
  music: Music,
  art: Palette,
  languages: Languages,
  programming: Code,
  science: Microscope,
  literature: BookOpen,
  olympiads: Trophy,
  technology: Laptop
}

export default function SportFeatures({ features }: SportFeaturesProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Особенности школы</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {features?.map((feature) => {
          const Icon = featureIcons[feature.icon]
          
          return (
            <Tooltip key={feature.id} content={feature.description}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-help">
                <Icon className="w-8 h-8 text-[#5CD2C6]" />
                <span className="text-sm font-medium text-gray-900 text-center">
                  {feature.name}
                </span>
              </div>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
} 