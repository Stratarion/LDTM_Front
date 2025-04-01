import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const CHAT_URL = `${API_URL}/chat`;

export interface Room {
  id: string;
  name: string;
  private: boolean;
  is_direct: boolean;
  created_at: string;
  updated_at: string;
  participants: Participant[];
}

export interface Message {
  id: string;
  room_id: string;
  participant_id: string;
  text: string;
  type?: 'message' | 'system';
  deleted: boolean;
  createdAt: string;
  participant: {
    id: string;
    name: string;
  };
}

export interface Participant {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

class ChatService {
  private socket: Socket | null = null;

  // REST API methods
  async createRoom(name: string, creatorId: string, participantId: string, isPrivate = false): Promise<Room> {
    const response = await fetch(`${CHAT_URL}/rooms`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        name, 
        private: isPrivate,
        creatorId,
        participantId
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getRooms(): Promise<Room[]> {
    try {
      const response = await fetch(`${CHAT_URL}/rooms`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }
  }

  async getRoom(id: string): Promise<Room> {
    const response = await fetch(`${CHAT_URL}/rooms/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    const response = await fetch(`${CHAT_URL}/rooms/${roomId}/messages`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getSystemMessages(roomId: string): Promise<Message[]> {
    const response = await fetch(`${CHAT_URL}/rooms/${roomId}/system-messages`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getUsers(): Promise<Participant[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async addParticipantToRoom(participantId: string, roomId: string) {
    const response = await fetch(`${CHAT_URL}/participants/room`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participant_id: participantId, room_id: roomId })
    });
    return response.json();
  }

  async removeParticipantFromRoom(participantId: string, roomId: string) {
    const response = await fetch(`${CHAT_URL}/participants/${participantId}/room/${roomId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  }

  async deleteRoom(roomId: string): Promise<void> {
    const response = await fetch(`${CHAT_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Socket methods
  initSocket() {
    if (!this.socket) {
      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        path: '/socket.io/',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('Socket connected with ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (error.message === 'Authentication error') {
          console.log('Authentication failed, attempting to reconnect...');
          setTimeout(() => {
            this.socket?.connect();
          }, 1000);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          setTimeout(() => {
            this.socket?.connect();
          }, 1000);
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.message === 'Access denied to this room') {
          console.log('Access denied, checking authentication...');
        }
      });
    }
    return this.socket;
  }

  closeSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  joinRoom(participantId: string, roomId: string) {
    if (this.socket) {
      console.log('Joining chat:', roomId, 'as participant:', participantId);
      this.socket.emit('join_chat', { participant_id: participantId, room_id: roomId });
    } else {
      console.error('Socket not initialized');
    }
  }

  sendMessage(roomId: string, text: string) {
    if (this.socket) {
      console.log('Sending message to room:', roomId, 'text:', text);
      this.socket.emit('send_message', { room_id: roomId, text });
    } else {
      console.error('Socket not initialized');
    }
  }

  deleteMessage(messageId: string, roomId: string) {
    if (this.socket) {
      console.log('Deleting message:', messageId, 'from room:', roomId);
      this.socket.emit('delete_message', { message_id: messageId, room_id: roomId });
    } else {
      console.error('Socket not initialized');
    }
  }

  emitTyping(roomId: string) {
    if (this.socket) {
      this.socket.emit('typing', { room_id: roomId });
    } else {
      console.error('Socket not initialized');
    }
  }

  onUserJoined(callback: (data: { participant_id: string, name: string }) => void) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (data: { participant_id: string, name: string }) => void) {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  offUserJoined() {
    if (this.socket) {
      this.socket.off('user_joined');
    }
  }

  offUserLeft() {
    if (this.socket) {
      this.socket.off('user_left');
    }
  }
}

export const chatService = new ChatService(); 