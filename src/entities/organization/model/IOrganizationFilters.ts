import { TOrganization, TOrganizationStatus, TSchool } from "./TOrtganization";

export interface IOrganizationFilters {
  name?: string;
  type?: TOrganization;
  status?: TOrganizationStatus;
  address?: string;
  school_type?: TSchool;
};
