import { axiosInstance } from "@/services/api/axiosInstance";
import {
  type AccessRequest,
  type AccessRequestsQuery,
  type PaginatedResponse,
  type RequestStatus,
} from "@/services/admin/types";

export async function listAccessRequests(
  query: AccessRequestsQuery
): Promise<PaginatedResponse<AccessRequest>> {
  const { data } = await axiosInstance.get<PaginatedResponse<AccessRequest>>(
    "/admin/requests",
    { params: query }
  );
  return data;
}

export async function getAccessRequestById(id: number): Promise<AccessRequest> {
  const { data } = await axiosInstance.get<AccessRequest>(`/admin/requests/${id}`);
  return data;
}

export async function patchAccessRequestStatus(
  id: number,
  status: RequestStatus
): Promise<AccessRequest> {
  const { data } = await axiosInstance.patch<AccessRequest>(`/admin/requests/${id}`, {
    status,
  });
  return data;
}

export async function updateAccessRequest(
  id: number,
  payload: Partial<Pick<AccessRequest, "subject" | "message" | "status" | "role">>
): Promise<AccessRequest> {
  const { data } = await axiosInstance.put<AccessRequest>(`/admin/requests/${id}`, payload);
  return data;
}

export async function deleteAccessRequest(
  id: number
): Promise<{ deleted: boolean; contact_id: number }> {
  const { data } = await axiosInstance.delete<{ deleted: boolean; contact_id: number }>(
    `/admin/requests/${id}`
  );
  return data;
}
