import { User, ConsultationStats, DashboardStats } from "@/types";
import { AdminApi } from "./axios";
import { authAdminApi } from "./authAdminApi";
import { AxiosError } from "axios";
import { navigateTo } from "@/utils/navigation";


export const adminApi = {
  getAllUsers: async (
    page = 1,
    limit = 10,
    search?: string,
    minAge?: number,
    maxAge?: number,
    startDate?: string,
    endDate?: string
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(minAge && { minAge: minAge.toString() }),
      ...(maxAge && { maxAge: maxAge.toString() }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await AdminApi.get(`/users?${queryParams}`);
    return response.data;
  },

  getAllDoctors: async (): Promise<User[]> => {
    const response = await AdminApi.get("/doctors");
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await AdminApi.patch(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await AdminApi.get("/dashboard-stats");
      console.log(response);
      return response.data.data;
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError &&
        err.response?.data?.error?.message === "jwt malformed") {
        await authAdminApi.logout();
        navigateTo('/login');
      }
      return {
        totalPatients: 0,
        totalDoctors: 0,
        totalConsultations: 0,
        totalRevenue: 0,
        uniqueConsultations: 0,
        totalOneTimePatients: 0
      }
    }
    // if (!response.data.success && response.data.message=="No to"){
    //   return undefined;
    // }
  },

  getConsultationStats: async (): Promise<ConsultationStats> => {
    const response = await AdminApi.get("/consultation-stats");
    return response.data.data;
  },

  getAllConsultations: async (
    page: number,
    limit: number,
    search?: string,
    status?: string,
    types?: string[],
    startDate?: string,
    endDate?: string
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(types?.length && { types: types.join(",") }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await AdminApi.get(`/consultations?${queryParams}`);
    return response.data;
  },

  updateConsultation: async (id: string, consultationData: any) => {
    const response = await AdminApi.put(
      `/consultations/${id}`,
      consultationData
    );
    return response.data;
  },

  deleteConsultation: async (id: string, userId: string) => {
    const response = await AdminApi.delete(`/consultations/${userId}/${id}`);
    return response.data;
  },

  uploadPrescription: async (consultationId: string, formData: FormData) => {
    const response = await AdminApi.post(
      `/consultations/${consultationId}/prescription`,
      formData
    );
    return response.data;
  },

  sendFeedback: async ({
    consultationId,
    feedback,
    rating,
    userEmail,
  }: {
    consultationId: string;
    feedback: string;
    rating: number;
    userEmail: string;
  }) => {
    const response = await AdminApi.post("/api/feedback", {
      consultationId,
      feedback,
      rating,
      userEmail,
    });
    return response.data;
  },
};
