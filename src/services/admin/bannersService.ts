import { axiosInstance } from "@/services/api/axiosInstance";
import type {
  Banner,
  BannerPayload,
  BannersQuery,
  PaginatedResponse,
} from "@/services/admin/types";

export async function listBanners(query: BannersQuery): Promise<PaginatedResponse<Banner>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Banner>>(
    "/admin/banners",
    { params: query }
  );
  return data;
}

export async function getBannerById(id: number | string): Promise<Banner> {
  const { data } = await axiosInstance.get<Banner>(`/admin/banners/${id}`);
  return data;
}

export async function createBanner(payload: BannerPayload): Promise<Banner> {
  const { data } = await axiosInstance.post<Banner>("/admin/banners", payload);
  return data;
}

export async function updateBanner(
  id: number | string,
  payload: BannerPayload
): Promise<Banner> {
  const { data } = await axiosInstance.put<Banner>(`/admin/banners/${id}`, payload);
  return data;
}

export async function deleteBanner(
  id: number | string
): Promise<{ deleted: boolean; id: number | string }> {
  const { data } = await axiosInstance.delete<{ deleted: boolean; id: number | string }>(
    `/admin/banners/${id}`
  );
  return data;
}
