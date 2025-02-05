import { useQuery } from "@tanstack/react-query";

const fetchWallets = async () => {
  try {
    const res = await fetch("/api/wallets/list", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
    });

    return await res.json();
  } catch (error: any) {
    console.log(error);
  }
};

export const useWallets = () => {
  const query = useQuery({
    queryKey: ["WALLETS"],
    queryFn: () => fetchWallets(),
  });

  return {
    wallets: query.data,
    walletsLoading: query.isLoading,
    refetchWallets: query.refetch,
  };
};
