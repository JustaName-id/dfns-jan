import { NextRequest, NextResponse } from "next/server";
import { delegatedClient } from "../clients";
import { QueryClient } from "@tanstack/react-query";

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
    const queryClient = new QueryClient();
    queryClient.refetchQueries({ queryKey: ["auth"] });

    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 401 });
  }
};
