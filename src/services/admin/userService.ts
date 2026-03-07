import { axiosInstance } from "@/services/api/axiosInstance";
import {
  type CreateDoctorPayload,
  type CreateLabPayload,
  type DoctorItem,
  type LabItem,
  type PaginatedResponse,
  type PatientItem,
  type UsersQuery,
} from "@/services/admin/types";

export async function listPatients(
  query: UsersQuery
): Promise<PaginatedResponse<PatientItem> & { include_inactive?: boolean }> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<PatientItem> & { include_inactive?: boolean }
  >("/admin/users/patients", { params: query });
  return data;
}

export async function listDoctors(
  query: UsersQuery
): Promise<PaginatedResponse<DoctorItem> & { include_inactive?: boolean }> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<DoctorItem> & { include_inactive?: boolean }
  >("/admin/users/doctors", { params: query });
  return data;
}

export async function listLabs(
  query: UsersQuery
): Promise<PaginatedResponse<LabItem> & { include_inactive?: boolean }> {
  const { data } = await axiosInstance.get<PaginatedResponse<LabItem> & { include_inactive?: boolean }>(
    "/admin/users/labs",
    { params: query }
  );
  return data;
}

export async function createDoctor(payload: CreateDoctorPayload) {
  const { data } = await axiosInstance.post("/admin/users/doctors", payload);
  return data;
}

export async function createLab(payload: CreateLabPayload) {
  const { data } = await axiosInstance.post("/admin/users/labs", payload);
  return data;
}

export async function updatePatient(userId: number, payload: Partial<PatientItem>) {
  const { data } = await axiosInstance.put(`/admin/users/patients/${userId}`, payload);
  return data;
}

export async function updateDoctor(userId: number, payload: Partial<DoctorItem>) {
  const { data } = await axiosInstance.put(`/admin/users/doctors/${userId}`, payload);
  return data;
}

export async function updateLab(userId: number, payload: Partial<LabItem>) {
  const { data } = await axiosInstance.put(`/admin/users/labs/${userId}`, payload);
  return data;
}

export async function disablePatient(userId: number): Promise<{ disabled: boolean; user_id: number }> {
  const { data } = await axiosInstance.delete<{ disabled: boolean; user_id: number }>(
    `/admin/users/patients/${userId}`
  );
  return data;
}

export async function disableDoctor(userId: number): Promise<{ disabled: boolean; user_id: number }> {
  const { data } = await axiosInstance.delete<{ disabled: boolean; user_id: number }>(
    `/admin/users/doctors/${userId}`
  );
  return data;
}

export async function disableLab(userId: number): Promise<{ disabled: boolean; user_id: number }> {
  const { data } = await axiosInstance.delete<{ disabled: boolean; user_id: number }>(
    `/admin/users/labs/${userId}`
  );
  return data;
}
