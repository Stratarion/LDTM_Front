import { TServiceCategory } from "@/entities/service/model/TService";
import { IContentItem } from "./IContentItem";

export interface IMainList {
  content: IContentItem[];
  startLink: TServiceCategory;
}