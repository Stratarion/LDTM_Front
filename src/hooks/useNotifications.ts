import { create } from 'zustand'

type NotificationVariant = 'default' | 'destructive' | 'outline'

export type ServiceType = 'sport' | 'development'
interface NotificationAction {
  label: string
  onClick: () => void
  variant?: NotificationVariant
}

interface Notification {
  id: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  actions?: NotificationAction[]
}

interface NotificationsStore {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id'>) => void
  hideNotification: (id: string) => void
}

const useNotificationsStore = create<NotificationsStore>((set: any) => ({
  notifications: [],
  showNotification: (notification: Omit<Notification, 'id'>) => 
    set((state: NotificationsStore) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Math.random().toString(36).substr(2, 9) }
      ]
    })),
  hideNotification: (id: string) =>
    set((state: NotificationsStore) => ({
      notifications: state.notifications.filter((n: Notification) => n.id !== id)
    }))
}))

export const useNotifications = () => {
  const { showNotification, hideNotification } = useNotificationsStore()
  return { showNotification, hideNotification }
} 