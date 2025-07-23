import { ICoordinates } from "./types/ICoordinates";

export const MOSCOW_COORDS: ICoordinates = {
  latitude: 55.7522,
  longitude: 37.6156
}



export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export const CHAT_URL = `${API_URL}/chat`;
