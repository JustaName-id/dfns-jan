import { WebAuthnSigner } from "@dfns/sdk-browser";
import { useMutation } from "@tanstack/react-query";

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

    await completeRes.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (username: string) => register(username),
    onError: (error) => {
      console.log(error);
      throw error;
    },
  });
};
