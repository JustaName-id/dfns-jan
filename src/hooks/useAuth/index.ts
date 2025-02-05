import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const response = await fetch("/api/auth/check", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return { isAuthenticated: false };
      }

      return { isAuthenticated: true };
    },
  });
  return {
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isAuthenticated: query.data?.isAuthenticated,
    refetch: query.refetch,
  };
};
