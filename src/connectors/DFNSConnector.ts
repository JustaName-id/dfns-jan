import type { Connector, ConnectorEventMap } from "wagmi";
import { WebAuthnSigner } from "@dfns/sdk-browser";
import { getAddress } from "viem";
import { Emitter } from "@wagmi/core/internal";

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
    // @ts-ignore
    params?: any[];
    // @ts-ignore
  }): Promise<any> {
    switch (method) {
      case "eth_accounts": {
        return [getAddress(this.wallet.address!).toLocaleLowerCase()];
      }
      case "personal_sign": {
        const [message, account] = params || [];
        if (
          !this.wallet.address ||
          account.toLowerCase() !== this.wallet.address.toLowerCase()
        ) {
          throw new Error("Account mismatch");
        }

        const newMessage = Buffer.from(message.slice(2), "hex").toString(
          "utf8"
        );

        const initRes = await fetch("/api/wallets/signatures/init", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletId: this.wallet.id,
            message: newMessage,
          }),
        });
        if (!initRes.ok) throw new Error("Failed to initialize signing");
        const { requestBody, challenge } = await initRes.json();

        const webauthn = new WebAuthnSigner({
          relyingParty: {
            id: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID!,
            name: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME!,
          },
        });
        const assertion = await webauthn.sign(challenge);
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

        return finalResult.signature.encoded;
      }
      default: {
        throw new Error(`Method ${method} not supported by DFNSProvider`);
      }
    }
  }
}

export class DFNSConnector implements Connector {
  [key: string]: unknown;

  readonly id = "dfns";
  readonly name = "DFNS Wallet";
  readonly uid = `${this.id}:${this.name}`;
  readonly ready = true;
  readonly type = "dfns" as const;

  wallet: DFNSWallet;
  chainId: number;
  providerInstance: DFNSProvider | null = null;
  emitter = new Emitter<ConnectorEventMap>(this.uid);
  private connected = false;

  constructor({ wallet, chainId }: { wallet: DFNSWallet; chainId: number }) {
    this.wallet = wallet;
    this.chainId = chainId;
  }

  async connect() {
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
      accounts: [getAddress(account!) as `0x${string}`],
      chainId: this.chainId,
      provider: this.providerInstance,
    };
  }

  async disconnect() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    this.wallet.address = undefined;

    this.providerInstance = null;
    this.connected = false;
    localStorage.removeItem("wagmi.connector");
    localStorage.removeItem("wagmi.store");

    this.emit("disconnect", undefined);
  }

  async getAccount() {
    return getAddress(this.wallet.address!);
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

  // @ts-ignore
  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  // @ts-ignore
  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }

  // @ts-ignore
  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  async getAccounts() {
    return [getAddress(this.wallet.address!)];
  }

  onAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) this.emit("disconnect");
    else this.emit("change", { account: accounts[0] as `0x${string}` });
  }

  onChainChanged(chain: number | string) {
    const id = Number(chain);
    this.emit("change", { chain: { id, unsupported: false } });
  }

  onDisconnect() {
    this.emit("disconnect");
  }
}
