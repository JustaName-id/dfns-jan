import { delegatedClient } from "@/app/api/clients";
import { GenerateSignatureBody } from "@dfns/sdk/types/Wallets";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletId, message } = await request.json();
    const client = delegatedClient(authToken);

    const body: GenerateSignatureBody = {
      kind: "Message",
      message: Buffer.from(message, "utf-8").toString("hex"),
    };
    console.log("body", body);

    const challenge = await client.wallets.generateSignatureInit({
      walletId,
      body,
    });

    return NextResponse.json({
      requestBody: body,
      challenge,
    });
  } catch (error) {
    console.error("Signature init failed:", error);
    return NextResponse.json(
      { error: "Signature initialization failed" },
      { status: 500 }
    );
  }
};
