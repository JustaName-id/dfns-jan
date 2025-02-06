import { WebAuthnSigner } from "@dfns/sdk-browser";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { useAuth } from "../useAuth";

export const register = async (username: string) => {
  try {
    const initRes = await fetch("/api/register/init", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    if (!initRes.ok) {
      const errorData = await initRes.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const challenge = await initRes.json();

    const webauthn = new WebAuthnSigner({
      relyingParty: {
        id: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID!,
        name: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME!,
      },
    });
    const attestation = await webauthn.create(challenge);

    const completeRes = await fetch("/api/register/complete", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        signedChallenge: { firstFactorCredential: attestation },
        temporaryAuthenticationToken: challenge.temporaryAuthenticationToken,
      }),
    });

    if (!completeRes.ok) {
      const errorData = await completeRes.json();
      throw new Error(errorData.error || "Registration completion failed");
    }

    await completeRes.json();
  } catch (error) {
    throw error;
  }
};

export const useRegister = () => {
  const { toast } = useToast();
  const { refetch } = useAuth();
  return useMutation({
    mutationFn: (username: string) => register(username),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Registration successful",
      });
      refetch();
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
