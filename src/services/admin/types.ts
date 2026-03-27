export const REQUEST_STATUSES = ["New", "Reviewed", "Approved", "Rejected"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface DashboardCounts {
  new_requests: number;
  patients_count: number;
  doctors_count: number;
  labs_count: number;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

export interface AccessRequest {
  contact_id: number;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  role?: string;
  status: RequestStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AccessRequestsQuery {
  status?: RequestStatus;
  role?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserBase {
  user_id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

export interface PatientItem extends AdminUserBase {
  patient_id?: number;
  age?: number;
  gender?: string;
  chronic_diseases?: string;
  lat?: number;
  lng?: number;
}

export interface DoctorItem extends AdminUserBase {
  doctor_id?: number;
  specialization?: string;
  license_number?: string;
  consultation_price?: number;
  experience_years?: number;
  rating?: number;
  reviews?: number;
  available?: boolean;
  location?: string;
  image?: string;
  lat?: number;
  lng?: number;
}

export interface LabItem extends AdminUserBase {
  lab_id?: number;
  lab_name?: string;
  address?: string;
  lab_phone?: string;
  lat?: number;
  lng?: number;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  include_inactive?: boolean;
}

export interface CreateDoctorPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  specialization: string;
  license_number: string;
  consultation_price: number;
  experience_years: number;
  lat?: number;
  lng?: number;
  rating?: number;
  reviews?: number;
  available?: boolean;
  location?: string;
  image?: string;
}

export interface CreateLabPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  lab_name: string;
  address: string;
  lab_phone?: string;
  lat?: number;
  lng?: number;
}

export interface StaticPagesQuery {
  page?: number;
  limit?: number;
}

export interface StaticPagePayload {
  slug: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  meta_title_en: string;
  meta_title_ar: string;
  meta_description_en: string;
  meta_description_ar: string;
  is_active: boolean;
}

export interface StaticPage extends StaticPagePayload {
  id?: number;
  page_id?: number;
  created_at?: string;
  updated_at?: string;
}
