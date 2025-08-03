'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CategoryCardProps } from './model'


export default function CategoryCard({ title, description, color, icon, href }: CategoryCardProps) {
  const router = useRouter()

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl h-[180px] ${color} text-white cursor-pointer`}
      onClick={() => router.push(href)}
    >
      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </motion.div>
  )
}
