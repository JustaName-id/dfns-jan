import { delegatedClient } from "@/app/api/clients";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletId, requestBody, signedChallenge } = await request.json();
    const client = delegatedClient(authToken);
    const result = await client.wallets.generateSignatureComplete(
      {
        walletId,
        body: requestBody,
      },
      signedChallenge
    );
    const res = result;

    console.log("res", res);

    const modifiedMessage = Buffer.from(
      res.requestBody.message,
      "hex"
    ).toString("utf8");

    return NextResponse.json({
      ...res,
      requestBody: {
        ...res.requestBody,
        message: modifiedMessage,
      },
    });
    // return NextResponse.json(res);
  } catch (error) {
    console.error("Signature complete failed:", error);
    return NextResponse.json(
      { error: "Signature completion failed" },
      { status: 500 }
    );
  }
};
