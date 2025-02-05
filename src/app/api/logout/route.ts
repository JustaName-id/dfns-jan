import { NextRequest, NextResponse } from "next/server";
import { delegatedClient } from "../clients";

export const POST = async (request: NextRequest) => {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = delegatedClient(authToken);
    await client.auth.logout({
      body: {
        allSessions: true,
      },
    });
    const response = NextResponse.json(
      {
        message: "Logout successful",
      },
      { status: 200 }
    );

    response.cookies.delete("authToken");

    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 401 });
  }
};
