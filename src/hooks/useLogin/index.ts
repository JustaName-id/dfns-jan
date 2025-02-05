import { useMutation } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: (username: string) => login(username),
    onError: (error) => {
      console.log(error);
      throw error;
    },
  });
};
