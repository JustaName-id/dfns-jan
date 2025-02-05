import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "../../clients";

export const POST = async (req: NextRequest) => {
  const { signedChallenge, temporaryAuthenticationToken } = await req.json();
  const client = apiClient(temporaryAuthenticationToken);
  const registration = await client.auth.registerEndUser({
    body: {
      ...signedChallenge,
      wallets: [{ network: "EthereumSepolia" }],
    },
  });
  const response = NextResponse.json(registration);

  response.cookies.set({
    name: "authToken",
    value: registration.authentication.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
};
