import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, saveSession, clearSession } from '../utils/session';
import { getArticles, updateUserProfile } from '../Services/api';
import { API_HOST } from '../config/server';

// Query Keys Constant
export const QUERY_KEYS = {
  SESSION: ['session'] as const,
  ARTICLES: ['articles'] as const,
  ARTICLE_DETAIL: (id: string | number) => ['articles', id] as const,
  APPOINTMENTS: (userId?: string | number | null) => ['appointments', userId] as const,
  DOCTORS: (specialization?: string) => ['doctors', specialization] as const,
  ARTICLE_LIKE_STATUS: (articleId: string | number, userId?: string | number) =>
    ['article_like', articleId, userId] as const,
};

// 1. Hook for User Session (Reactive Auth & Profile State)
export const useUserSession = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.SESSION,
    queryFn: async () => {
      const session = await getSession();
      return session || null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      await saveSession(updatedData);
      return updatedData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.SESSION, data);
    },
  });

  const clearSessionMutation = useMutation({
    mutationFn: async () => {
      await clearSession();
    },
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEYS.SESSION, null);
      queryClient.clear(); // Clear all cached queries on logout
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetchSession: query.refetch,
    updateSession: updateSessionMutation.mutateAsync,
    clearSession: clearSessionMutation.mutateAsync,
  };
};

// 2. Hook for Mindful Articles
export const useArticles = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ARTICLES,
    queryFn: async () => {
      const data = await getArticles();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

// 3. Hook for Patient Appointments
export const usePatientAppointments = (userId?: string | number | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS(userId),
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`${API_HOST}/api/my-appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.appointments || [];
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// 4. Hook for Profile Update Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData | any) => {
      const response = await updateUserProfile(formData);
      return response;
    },
    onSuccess: async (response) => {
      // Invalidate session cache so all screens instantly see updated user
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION });
    },
  });
};

