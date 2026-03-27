import { axiosInstance } from "@/services/api/axiosInstance";
import type {
  PaginatedResponse,
  StaticPage,
  StaticPagePayload,
  StaticPagesQuery,
} from "@/services/admin/types";

export async function listStaticPages(
  query: StaticPagesQuery
): Promise<PaginatedResponse<StaticPage>> {
  const { data } = await axiosInstance.get<PaginatedResponse<StaticPage>>(
    "/admin/pages",
    { params: query }
  );
  return data;
}

export async function getStaticPageById(id: number | string): Promise<StaticPage> {
  const { data } = await axiosInstance.get<StaticPage>(`/admin/pages/${id}`);
  return data;
}

export async function createStaticPage(payload: StaticPagePayload): Promise<StaticPage> {
  const { data } = await axiosInstance.post<StaticPage>("/admin/pages", payload);
  return data;
}

export async function updateStaticPage(
  id: number | string,
  payload: StaticPagePayload
): Promise<StaticPage> {
  const { data } = await axiosInstance.put<StaticPage>(`/admin/pages/${id}`, payload);
  return data;
}

export async function deleteStaticPage(
  id: number | string
): Promise<{ deleted: boolean; id: number | string }> {
  const { data } = await axiosInstance.delete<{ deleted: boolean; id: number | string }>(
    `/admin/pages/${id}`
  );
  return data;
}
