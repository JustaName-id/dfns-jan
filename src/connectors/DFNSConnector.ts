import type { Connector } from "wagmi";
import EventEmitter from "eventemitter3";
import { WebAuthnSigner } from "@dfns/sdk-browser";

export interface DFNSWallet {
  id: string;
  network:
    | "Algorand"
    | "AlgorandTestnet"
    | "Aptos"
    | "AptosTestnet"
    | "ArbitrumOne"
    | "ArbitrumGoerli"
    | "ArbitrumSepolia"
    | "AvalancheC"
    | "AvalancheCFuji"
    | "Base"
    | "BaseGoerli"
    | "BaseSepolia"
    | "BerachainBArtio"
    | "Berachain"
    | "Bitcoin"
    | "BitcoinSignet"
    | "BitcoinTestnet3"
    | "Bsc"
    | "BscTestnet"
    | "Cardano"
    | "CardanoPreprod"
    | "Celo"
    | "CeloAlfajores"
    | "Dogecoin"
    | "DogecoinTestnet"
    | "Ethereum"
    | "EthereumGoerli"
    | "EthereumSepolia"
    | "EthereumHolesky"
    | "FantomOpera"
    | "FantomTestnet"
    | "InternetComputer"
    | "Ion"
    | "IonTestnet"
    | "Iota"
    | "IotaTestnet"
    | "Kaspa"
    | "KaspaTestnet11"
    | "Kusama"
    | "Litecoin"
    | "LitecoinTestnet"
    | "Optimism"
    | "OptimismGoerli"
    | "OptimismSepolia"
    | "Origyn"
    | "Polkadot"
    | "Polygon"
    | "PolygonAmoy"
    | "PolygonMumbai"
    | "Race"
    | "RaceSepolia"
    | "SeiAtlantic2"
    | "SeiPacific1"
    | "Solana"
    | "SolanaDevnet"
    | "Stellar"
    | "StellarTestnet"
    | "Tezos"
    | "TezosGhostnet"
    | "Ton"
    | "TonTestnet"
    | "Tron"
    | "TronNile"
    | "Westend"
    | "XrpLedger"
    | "XrpLedgerTestnet";
  address?: string;
  signingKey: {
    scheme: "ECDSA" | "EdDSA" | "Schnorr";
    curve: "ed25519" | "secp256k1" | "stark";
    publicKey: string;
  };
  status: "Active" | "Archived";
  dateCreated: string;
  name?: string;
  custodial: boolean;
  imported?: boolean;
  exported?: boolean;
  dateExported?: string;
  externalId?: string;
  tags: string[];
}

class DFNSProvider {
  wallet: DFNSWallet;
  constructor(wallet: DFNSWallet) {
    this.wallet = wallet;
  }
  async request({
    method,
    params,
  }: {
    method: string;
    params?: any[];
  }): Promise<any> {
    switch (method) {
      case "eth_accounts": {
        return [this.wallet.address];
      }
      case "personal_sign": {
        const [message, account] = params || [];
        if (
          !this.wallet.address ||
          account.toLowerCase() !== this.wallet.address.toLowerCase()
        ) {
          throw new Error("Account mismatch");
        }
        // --- DFNS Sign Message Flow ---
        // Step 1. Call your backend to initialize the signing process.
        const initRes = await fetch("/api/wallets/signatures/init", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletId: this.wallet.id,
            message,
          }),
        });
        if (!initRes.ok) throw new Error("Failed to initialize signing");
        const { requestBody, challenge } = await initRes.json();

        // Step 2. Use DFNS's WebAuthnSigner to sign the challenge.
        const webauthn = new WebAuthnSigner({
          relyingParty: {
            id: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID!,
            name: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME!,
          },
        });
        const assertion = await webauthn.sign(challenge);

        // Step 3. Complete signing via your backend.
        const completeRes = await fetch("/api/wallets/signatures/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletId: this.wallet.id,
            requestBody,
            signedChallenge: {
              challengeIdentifier: challenge.challengeIdentifier,
              firstFactor: assertion,
            },
          }),
        });
        if (!completeRes.ok) throw new Error("Failed to complete signing");
        const finalResult = await completeRes.json();
        return finalResult;
      }
      default: {
        throw new Error(`Method ${method} not supported by DFNSProvider`);
      }
    }
  }
}

// The connector implements the wagmi Connector interface.
export class DFNSConnector implements Connector {
  readonly id = "dfns";
  readonly name = "DFNS Wallet";
  readonly ready = true;

  wallet: DFNSWallet;
  chainId: number;
  providerInstance: DFNSProvider | null = null;
  private emitter = new EventEmitter();
  private connected = false;

  constructor({ wallet, chainId }: { wallet: DFNSWallet; chainId: number }) {
    this.wallet = wallet;
    this.chainId = chainId;
  }

  async connect() {
    // If already connected, simply return the connection details.
    if (this.connected && this.providerInstance) {
      return {
        accounts: [(await this.getAccount()) as `0x${string}`],
        chainId: this.chainId,
        provider: this.providerInstance,
      };
    }
    const account = await this.getAccount();
    this.providerInstance = new DFNSProvider(this.wallet);
    this.connected = true;
    this.emit("connect", {
      account,
      chain: { id: this.chainId, unsupported: false },
    });
    return {
      accounts: [account as `0x${string}`],
      chainId: this.chainId,
      provider: this.providerInstance,
    };
  }

  async disconnect() {
    this.providerInstance = null;
    this.connected = false;
    this.emit("disconnect", undefined);
  }

  async getAccount() {
    return this.wallet.address;
  }

  async getChainId() {
    return this.chainId;
  }

  async getProvider() {
    if (!this.providerInstance) {
      this.providerInstance = new DFNSProvider(this.wallet);
    }
    return this.providerInstance;
  }

  async isAuthorized() {
    return this.connected;
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }
  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }
  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }
}
