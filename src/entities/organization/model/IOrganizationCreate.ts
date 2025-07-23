export interface IOrganizationCreate {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  director_name: string;
  type: 'school' | 'garden';
  school_type?: 'state' | 'private';
  max_count: number;
  approach?: string;
  cost_info: number;
  owner_id: string;
  creater_id: string;
}