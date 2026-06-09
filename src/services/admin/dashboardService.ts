import { axiosInstance } from "@/services/api/axiosInstance";
import { type DashboardCounts } from "@/services/admin/types";

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const { data } = await axiosInstance.get<DashboardCounts>("/api/v1/admin/dashboard/counts");
  return data;
}
