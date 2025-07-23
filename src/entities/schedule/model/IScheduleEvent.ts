import { IService } from "@/entities/service/model/IService"
import { TScheduleStatus } from "./TScheduleStatus"
import { IUser } from "@/entities/user/model/IUser"

export interface IScheduleEvent {
  id: string
  date: string
  startTime: string
  endTime: string
  serviceId: string
  service: IService
  teacherId?: string
  teacher: IUser
  ownerId: string
  owner: IUser
  maxStudents: number
  currentParticipants: number
  participants: IUser[]
  status: TScheduleStatus
  createdAt: string
}