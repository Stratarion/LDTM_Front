'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, Calendar, Star, BookOpen } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Notification {
  id: string
  type: 'message' | 'lesson' | 'review' | 'homework'
  title: string
  description: string
  time: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Новое сообщение',
    description: 'Вам пришло сообщение от преподавателя математики',
    time: '5 минут назад',
    isRead: false
  },
  {
    id: '2',
    type: 'lesson',
    title: 'Скоро занятие',
    description: 'Урок английского языка через 30 минут',
    time: '10 минут назад',
    isRead: false
  },
  {
    id: '3',
    type: 'review',
    title: 'Новый отзыв',
    description: 'Родители оставили отзыв о последнем занятии',
    time: '1 час назад',
    isRead: true
  },
  {
    id: '4',
    type: 'homework',
    title: 'Домашнее задание',
    description: 'Проверьте новое домашнее задание по физике',
    time: '2 часа назад',
    isRead: true
  }
]

interface NotificationsPopoverProps {
  isOpen: boolean
  onClose: () => void
}

const getIconByType = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-5 h-5" />
    case 'lesson':
      return <Calendar className="w-5 h-5" />
    case 'review':
      return <Star className="w-5 h-5" />
    case 'homework':
      return <BookOpen className="w-5 h-5" />
    default:
      return <Bell className="w-5 h-5" />
  }
}

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              {unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-[#5CD2C6] text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#5CD2C6] hover:text-[#4BC0B5]"
            >
              Отметить все как прочитанные
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 text-gray-600 ${!notification.isRead ? 'text-blue-500' : ''}`}>
                  {getIconByType(notification.type)}
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Нет новых уведомлений
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 