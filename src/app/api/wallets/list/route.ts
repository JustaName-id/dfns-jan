import { NextRequest, NextResponse } from "next/server";
import { delegatedClient } from "../../clients";

export const POST = async (request: NextRequest) => {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = delegatedClient(authToken);
    const wallets = await client.wallets.listWallets({});
    return NextResponse.json(wallets);
  } catch (error) {
    console.error("List wallets failed:", error);
    return NextResponse.json(
      { error: "Failed to list wallets" },
      { status: 500 }
    );
  }
};
