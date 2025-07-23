import { IUser } from "@/entities/user/model/IUser"
import { TScheduleStatus } from "./TScheduleStatus"

export interface ISchedule {
  id: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  status: TScheduleStatus
  createdAt: string
  teacher: IUser
  currentParticipants: number
}