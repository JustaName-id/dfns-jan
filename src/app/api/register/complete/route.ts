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

  return NextResponse.json(registration);
};
