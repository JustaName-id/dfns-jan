import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "../clients";

export const POST = async (request: NextRequest) => {
  try {
    const { username } = await request.json();
    const client = apiClient();
    const login = await client.auth.delegatedLogin({ body: { username } });
    const response = NextResponse.json(
      {
        username,
        message: "Login successful",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "authToken",
      value: login.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
};
