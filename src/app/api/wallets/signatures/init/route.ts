import { delegatedClient } from "@/app/api/clients";
import { NextRequest, NextResponse } from "next/server";

export type GenerateSignatureBody =
  | {
      kind: "SignDocDirect";
      signDoc: string;
      externalId?: string | undefined;
    }
  | {
      kind: "Hash";
      hash: string;
      taprootMerkleRoot?: string | undefined;
      externalId?: string | undefined;
    }
  | {
      kind: "Message";
      message: string;
      externalId?: string | undefined;
    }
  | {
      kind: "Transaction";
      transaction: string;
      externalId?: string | undefined;
    }
  | {
      kind: "Eip712";
      types: {
        [x: string]: {
          name: string;
          type: string;
        }[];
      };
      domain: {
        name?: string | undefined;
        version?: string | undefined;
        chainId?: (number | string) | undefined;
        verifyingContract?: string | undefined;
        salt?: string | undefined;
      };
      message: {
        [x: string]: unknown;
      };
      externalId?: string | undefined;
    }
  | {
      kind: "Psbt";
      psbt: string;
      externalId?: string | undefined;
    }
  | {
      kind: "Bip322";
      message: string;
      format?: ("Simple" | "Full") | undefined;
      externalId?: string | undefined;
    };

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
