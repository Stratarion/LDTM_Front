export interface IMessage {
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