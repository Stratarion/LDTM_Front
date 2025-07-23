'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { chatService, Room, Message } from '@/entities/chat/api/chat.service'
import { Socket } from 'socket.io-client'
import { redirect } from 'next/navigation'
import Header from '@/widgets/Header'
import { Users, MessageCircle, X, Search, MoreVertical } from 'lucide-react'
import { User } from '@/entities/user/model/user'
import { UsersService } from '@/entities/user/api/users.service'

type ChatCreationType = 'direct' | 'group' | null;

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [creationType, setCreationType] = useState<ChatCreationType>(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/')
    }
  }, [isLoading, isAuthenticated])

  // Initialize socket and fetch rooms
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = chatService.initSocket()
      setSocket(newSocket)

      chatService.getRooms().then(setRooms)
      loadUsers()
    }
  }, [isAuthenticated, user])

  const loadUsers = async () => {
    if (isLoadingUsers || !hasMoreUsers) return

    setIsLoadingUsers(true)
    try {
      const response = await UsersService.getUserList(currentPage)
      const newUsers = response.data.filter(u => u.id !== user?.id)
      
      if (currentPage === 1) {
        setUsers(newUsers)
      } else {
        setUsers(prev => [...prev, ...newUsers])
      }
      
      setHasMoreUsers(currentPage < response.pagination.totalPages)
      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !currentRoom) return

    chatService.joinRoom(user!.id, currentRoom.id)
    
    Promise.all([
      chatService.getRoomMessages(currentRoom.id),
      chatService.getSystemMessages(currentRoom.id)
    ]).then(([messages, systemMessages]) => {
      const allMessages = [...messages, ...systemMessages]
        .filter((message, index, self) => 
          index === self.findIndex((m) => m.id === message.id)
        );
      setMessages(allMessages);
    });

    socket.on('message_history', (history: Message[]) => {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        history.forEach(message => {
          if (!newMessages.some(m => m.id === message.id)) {
            newMessages.push(message);
          }
        });
        return newMessages;
      });
    });

    socket.on('new_message', (message: Message) => {
      setMessages(prevMessages => {
        // Проверяем, есть ли временное сообщение
        const tempIndex = prevMessages.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.text === message.text && 
          m.participant_id === message.participant_id
        );

        if (tempIndex !== -1) {
          // Если есть временное сообщение, заменяем его
          const newMessages = [...prevMessages];
          newMessages[tempIndex] = message;
          return newMessages;
        }

        // Если нет временного сообщения и сообщение уникальное, добавляем его в конец
        if (!prevMessages.some(m => m.id === message.id)) {
          return [...prevMessages, message];
        }

        return prevMessages;
      });
    });

    socket.on('user_typing', ({ participant_id }: { participant_id: string }) => {
      setTypingUsers(prev => new Set(prev).add(participant_id))
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(participant_id)
          return newSet
        })
      }, 3000)
    })

    socket.on('message_deleted', ({ message_id }: { message_id: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.id === message_id ? { ...msg, deleted: true } : msg
      ))
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    chatService.onUserJoined((data) => {
      console.log('User joined:', data);
    });

    chatService.onUserLeft((data) => {
      console.log('User left:', data);
    });

    // Обработчики статусов пользователей
    socket.on('user_offline', ({ participant_id }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(participant_id);
        return newSet;
      });
    });

    socket.on('user_joined', ({ participant_id }) => {
      setOnlineUsers(prev => new Set(prev).add(participant_id));
    });

    return () => {
      socket.off('message_history')
      socket.off('new_message')
      socket.off('user_typing')
      socket.off('message_deleted')
      socket.off('error')
      socket.off('user_offline')
      socket.off('user_joined')
      chatService.offUserJoined()
      chatService.offUserLeft()
    }
  }, [socket, currentRoom, user])

  // Очищаем сообщения при смене комнаты
  useEffect(() => {
    setMessages([])
  }, [currentRoom?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentRoom) return

    try {
      const now = new Date();
      const tempMessage: Message = {
        id: `temp-${now.getTime()}`,
        room_id: currentRoom.id,
        participant_id: user!.id,
        text: newMessage,
        deleted: false,
        createdAt: now.toISOString(),
        participant: {
          id: user!.id,
          name: `${user!.first_name} ${user!.last_name}`.trim()
        }
      }
      
      setMessages(prev => [...prev, tempMessage]);
      
      setNewMessage('')
      chatService.sendMessage(currentRoom.id, newMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleTyping = () => {
    if (currentRoom) {
      chatService.emitTyping(currentRoom.id)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (currentRoom) {
      chatService.deleteMessage(messageId, currentRoom.id)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (creationType === 'group' && !newRoomName.trim()) return
    if (selectedUsers.length === 0) return

    try {
      let roomName = newRoomName
      if (creationType === 'direct') {
        const selectedUser = selectedUsers[0]
        roomName = `${selectedUser.first_name} ${selectedUser.last_name}`.trim()
      }

      // Создаем чат только с первым выбранным пользователем (для прямых сообщений)
      const selectedUser = selectedUsers[0]
      const newRoom = await chatService.createRoom(
        roomName,
        user!.id, // creatorId - текущий пользователь
        selectedUser.id, // participantId - выбранный пользователь
        creationType === 'group' // isPrivate
      )
      
      setRooms(prev => [...prev, newRoom])
      setCurrentRoom(newRoom)
      resetChatCreation()
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }

  const resetChatCreation = () => {
    setCreationType(null)
    setNewRoomName('')
    setSelectedUsers([])
    setSearchQuery('')
    setCurrentPage(1)
    setHasMoreUsers(true)
  }

  const filteredUsers = users.filter(user => 
    (`${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !selectedUsers.some(selected => selected.id === user.id)
  )

  const handleUserListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadUsers()
    }
  }

  // Обновляем рендер списка пользователей
  const renderUserItem = (user: User) => (
    <button
      key={user.id}
      type="button"
      onClick={() => {
        if (creationType === 'direct') {
          setSelectedUsers([user])
        } else {
          setSelectedUsers(prev => [...prev, user])
        }
      }}
      className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-[#5CD2C6] flex items-center justify-center text-white">
        {user.first_name.charAt(0)}
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-medium text-gray-700">
          {`${user.first_name} ${user.last_name}`.trim() || 'Без имени'}
        </span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-gray-300'}`} />
    </button>
  )

  // Обновляем рендер сообщений
  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`flex ${
        message.type === 'system' 
          ? 'justify-center' 
          : message.participant_id === user?.id 
            ? 'justify-end' 
            : 'justify-start'
      }`}
    >
      {message.type === 'system' ? (
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {message.text}
        </div>
      ) : (
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            message.participant_id === user?.id
              ? 'bg-[#5CD2C6] text-white'
              : 'bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <span className={message.participant_id === user?.id ? 'text-white' : 'text-gray-700'}>
              {message.participant.name}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              onlineUsers.has(message.participant_id) ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
          <p className={`${message.deleted ? 'italic text-gray-500' : message.participant_id === user?.id ? 'text-white' : 'text-gray-700'}`}>
            {message.deleted ? 'Сообщение удалено' : message.text}
          </p>
          {message.participant_id === user?.id && !message.deleted && (
            <button
              onClick={() => handleDeleteMessage(message.id)}
              className="text-xs underline mt-1 opacity-50 hover:opacity-100"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  )

  const getRoomDisplayName = (room: Room) => {
    if ((room.participants.length > 2) || (room.is_direct)) return room.name;
    
    const otherParticipant = room.participants.find(p => p.id !== user?.id);
    return otherParticipant 
      ? otherParticipant.name
      : room.name;
  }

  // Добавляем обработчик клика вне меню настроек
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDeleteChat = async () => {
    if (!currentRoom) return
    
    try {
      await chatService.deleteRoom(currentRoom.id)
      setRooms(prev => prev.filter(room => room.id !== currentRoom.id))
      setCurrentRoom(null)
      setIsSettingsOpen(false)
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <>
        <Header />
        <div className="p-4">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-4 flex gap-4 h-[calc(100vh-5rem)]">
        {/* Rooms list */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">Чаты</h2>
            {!creationType && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCreationType('direct')}
                  className="p-2 hover:bg-gray-100 rounded-full text-[#5CD2C6]"
                  title="Написать сообщение"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCreationType('group')}
                  className="p-2 hover:bg-gray-100 rounded-full text-[#5CD2C6]"
                  title="Создать групповой чат"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {creationType && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">
                  {creationType === 'direct' ? 'Новое сообщение' : 'Новый групповой чат'}
                </h3>
                <button
                  onClick={resetChatCreation}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom}>
                {creationType === 'group' && (
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Название чата"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] mb-2"
                  />
                )}

                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск пользователей"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedUsers.map(user => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                      >
                        {`${user.first_name} ${user.last_name}`.trim()}
                        <button
                          type="button"
                          onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                          className="hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div 
                  className="max-h-40 overflow-y-auto mb-2"
                  onScroll={handleUserListScroll}
                >
                  {filteredUsers.map(renderUserItem)}
                  {isLoadingUsers && (
                    <div className="text-center py-2 text-gray-500">
                      Загрузка...
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={selectedUsers.length === 0 || (creationType === 'group' && !newRoomName.trim())}
                  className="w-full px-3 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creationType === 'direct' ? 'Начать чат' : 'Создать чат'}
                </button>
              </form>
            </div>
          )}

          {!creationType && (
            rooms.length > 0 ? (
              <div className="space-y-2">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setCurrentRoom(room)}
                    className={`w-full text-left p-2 rounded-lg hover:bg-gray-100 text-gray-700 ${
                      currentRoom?.id === room.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    {getRoomDisplayName(room)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-4">У вас пока нет активных чатов</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setCreationType('direct')}
                    className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
                  >
                    Написать сообщение
                  </button>
                  <button
                    onClick={() => setCreationType('group')}
                    className="px-4 py-2 border border-[#5CD2C6] text-[#5CD2C6] rounded-lg hover:bg-gray-50"
                  >
                    Создать групповой чат
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Chat area */}
        {currentRoom ? (
          <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-700">
                {currentRoom && getRoomDisplayName(currentRoom)}
              </h2>
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setIsAddParticipantsOpen(true)
                        setIsSettingsOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Добавить участников
                    </button>
                    <button
                      onClick={handleDeleteChat}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Удалить чат
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add Participants Modal */}
            {isAddParticipantsOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-white rounded-lg p-4 w-96 max-w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Добавить участников</h3>
                    <button
                      onClick={() => setIsAddParticipantsOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск пользователей"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#5CD2C6]"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto mb-4">
                    {filteredUsers
                      .filter(user => !currentRoom.participants.some(p => p.id === user.id))
                      .map(renderUserItem)}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddParticipantsOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={async () => {
                        // Здесь будет логика добавления участников
                        setIsAddParticipantsOpen(false)
                      }}
                      className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {[...messages]
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                Печатает...
              </div>
            )}

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-700 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500">
            Выберите чат для начала общения
          </div>
        )}
      </div>
    </>
  )
} 