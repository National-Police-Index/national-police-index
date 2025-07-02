export interface PoliceOfficer {
  agency_name: string;
  current_certificate_status: string;
  document_id: string;
  end_date: string;
  first_name: string;
  full_name: string;
  last_name: string;
  middle_name: string;
  person_nbr: string;
  rank: string;
  start_date: string;
  state: string;
  position?: string;
  status?: string;
  notes?: string;
  offense?: string,
  sanction?: string,
  violation?: string,
  sanction_date?: Date,
  separation_reason?: string,
}

export interface SearchFilters {
  query: string;
  startDate?: Date;
  endDate?: Date;
  agency?: string;
  sortBy?: 'name' | 'date' | 'agency';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  activeOnly?: string;
}

export interface StateData {
  name: string;
  abbreviation: string;
  hasData: boolean;
  totalOfficers?: number;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}
