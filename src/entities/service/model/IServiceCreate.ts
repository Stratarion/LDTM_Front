export interface IServiceCreate {
  name: string;
  description?: string;
  category: string;
  price?: number;
  duration: number;
  organization_id: string;
}