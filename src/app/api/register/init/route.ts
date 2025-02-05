import { NextResponse } from "next/server";
import { apiClient } from "../../clients";

export const POST = async (req: Request) => {
  const { username } = await req.json();

  const client = apiClient();
  const challenge = await client.auth.createDelegatedRegistrationChallenge({
    body: { kind: "EndUser", email: username },
  });

  return NextResponse.json(challenge);
};
