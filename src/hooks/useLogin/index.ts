import { useMutation } from "@tanstack/react-query";
import { useToast } from "../useToast";

export const login = async (username: string) => {
  try {
    const loginRes = await fetch("/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    const body = await loginRes.json();

    return body;
  } catch (error) {
    throw error;
  }
};

export const useLogin = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (username: string) => login(username),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Login successful",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error.message,
      });
      throw error;
    },
  });
};
