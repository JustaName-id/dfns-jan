import { NextResponse } from "next/server";
import { apiClient } from "../../clients";

export const POST = async (req: Request) => {
  try {
    const { username } = await req.json();

    const client = apiClient();
    const challenge = await client.auth.createDelegatedRegistrationChallenge({
      body: { kind: "EndUser", email: username },
    });

    return NextResponse.json(challenge);
  } catch (error: any) {
    // Check if it's the user exists error
    if (
      error.httpStatus === 401 &&
      error.message?.includes("User already exists")
    ) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: error.httpStatus || 500 }
    );
  }
};
