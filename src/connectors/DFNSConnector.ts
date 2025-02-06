import { WebAuthnSigner } from "@dfns/sdk-browser";
import { Connector, createConnector } from "@wagmi/core";
import { EventEmitter } from "events";
import { getAddress, ProviderConnectInfo } from "viem";

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

class DFNSProvider extends EventEmitter {
  wallet: DFNSWallet;
  constructor(wallet: DFNSWallet) {
    super();
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
      case "disconnect": {
        this.emit("disconnect");
        return;
      }
      default: {
        throw new Error(`Method ${method} not supported by DFNSProvider`);
      }
    }
  }
}

export type DFNSConnectorParameters = {
  wallet: DFNSWallet;
  chainId: number;
};

export function dfns({ wallet, chainId }: DFNSConnectorParameters) {
  let providerInstance: DFNSProvider | null = null;
  let connected = false;

  type Properties = {
    onConnect(connectInfo: ProviderConnectInfo): void;
    onDisplayUri(uri: string): void;
  };

  let accountsChanged: Connector["onAccountsChanged"] | undefined;
  let chainChanged: Connector["onChainChanged"] | undefined;
  let connect: Connector["onConnect"] | undefined;
  let disconnect: Connector["onDisconnect"] | undefined;

  return createConnector<DFNSProvider, Properties>((config) => ({
    id: "dfns",
    name: "DFNS Wallet",
    icon: undefined,
    rdns: undefined,
    type: "wallet",
    ready: true,
    async setup() {
      const provider = await this.getProvider();
      if (provider.on) {
        if (!connect) {
          connect = this.onConnect.bind(this);
          provider.on("connect", connect);
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on("accountsChanged", accountsChanged);
        }
      }
    },
    async connect({ chainId } = {}) {
      const accounts = [getAddress(wallet.address!)];
      const provider = await this.getProvider();
      if (!connected) {
        provider.on("disconnect", this.onDisconnect.bind(this));
        connected = true;
        provider.emit("connect", { chainId: chainId ?? 1 });
        config.emitter.emit("connect", {
          accounts: accounts,
          chainId: chainId ?? 1,
        });
      }

      return {
        accounts,
        chainId: chainId ?? 1,
        provider,
      };
    },
    async disconnect() {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const provider = await this.getProvider();
      wallet.address = undefined;
      if (provider) {
        provider.emit("disconnect");
      }
      connected = false;
      localStorage.removeItem("wagmi.connector");
      localStorage.removeItem("wagmi.store");
      config.emitter.emit("disconnect");
    },
    async getAccounts() {
      return [getAddress(wallet.address!)];
    },

    async getChainId() {
      return chainId;
    },
    async getProvider(): Promise<DFNSProvider> {
      if (!providerInstance) {
        providerInstance = new DFNSProvider(wallet);
      }
      return providerInstance;
    },
    async isAuthorized() {
      return connected;
    },
    async onAccountsChanged(accounts) {
      if (config.emitter.listenerCount("connect")) {
        const chainId = (await this.getChainId()).toString();
        this.onConnect({ chainId });
      } else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    async onConnect(connectInfo) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) return;

      const chainId = Number(connectInfo.chainId);
      config.emitter.emit("connect", { accounts, chainId });
      const provider = await this.getProvider();
      if (connect) {
        provider.removeListener("connect", connect);
        connect = undefined;
      }
      if (!accountsChanged) {
        accountsChanged = this.onAccountsChanged.bind(this);
        provider.on("accountsChanged", accountsChanged);
      }
      if (!chainChanged) {
        chainChanged = this.onChainChanged.bind(this);
        provider.on("chainChanged", chainChanged);
      }
      if (!disconnect) {
        disconnect = this.onDisconnect.bind(this);
        provider.on("disconnect", disconnect);
      }
    },
    async onDisconnect() {
      const provider = await this.getProvider();
      config.emitter.emit("disconnect");

      if (chainChanged) {
        provider.removeListener("chainChanged", chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        provider.removeListener("disconnect", disconnect);
        disconnect = undefined;
      }
      if (!connect) {
        connect = this.onConnect.bind(this);
        provider.on("connect", connect);
      }
    },
    onDisplayUri(uri) {
      config.emitter.emit("message", { type: "display_uri", data: uri });
    },
  }));
}
