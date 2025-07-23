import { IParticipant } from "./IParticipant";

export interface IRoom {
  id: string;
  name: string;
  private: boolean;
  is_direct: boolean;
  created_at: string;
  updated_at: string;
  participants: IParticipant[];
}