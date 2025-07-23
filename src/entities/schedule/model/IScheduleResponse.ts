import { IScheduleEvent } from "./iScheduleEvent"

export interface IScheduleResponse {
  data: IScheduleEvent[]
  totalCount: number
}