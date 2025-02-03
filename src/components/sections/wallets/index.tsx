'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DFNSConnector } from '@/connectors/DFNSConnector'
import { WebAuthnSigner } from '@dfns/sdk-browser'
import { JustWeb3Button } from '@justweb3/widget'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FormEvent, useEffect, useState } from 'react'
import { Connector, useConnect } from 'wagmi'

export default function Wallets() {
    const [loading, setLoading] = useState(false)
    const [wallets, setWallets] = useState<any>(undefined)
    const [sighash, setSighash] = useState<any>(undefined)
    const [error, setError] = useState<any>(undefined)

    const { connect, connectors, error: connectError } = useConnect();
    const walletConnectConnector = connectors.find(
        ({ id }) => id === 'walletConnect'
    );

    console.log('connectors error', connectError)

    const listenForWalletConnectUri = async (
        walletConnectConnector: Connector
    ) => {
        const provider = await walletConnectConnector.getProvider();
        // @ts-expect-error
        provider.once('display_uri', (uri) => {
            console.log('WalletConnect URI:', uri);
        });
    };



    const listWallets = async () => {
        try {
            setLoading(true)

            const res = await fetch('/api/wallets/list', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                credentials: 'include'
                // body: JSON.stringify({
                //     authToken,
                // }),
            })

            setWallets(await res.json())
            setError(undefined)
        } catch (error: any) {
            console.log(error)
            setWallets(undefined)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        listWallets()
    }, [])

    const signMessage = async (event: FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true)
            event.preventDefault()

            const walletId = wallets.items[0].id
            const formData = new FormData(event.currentTarget)

            const initRes = await fetch('/api/wallets/signatures/init', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    // authToken,
                    walletId,
                    message: formData.get('message') as string,
                }),
            })

            const { requestBody, challenge } = await initRes.json()

            // Sign the challenge to authorize the create wallet action
            const webauthn = new WebAuthnSigner({
                relyingParty: {
                    id: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID!,
                    name: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME!,
                },
            })
            const assertion = await webauthn.sign(challenge)

            const completeRes = await fetch('/api/wallets/signatures/complete', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    // authToken,
                    walletId,
                    requestBody,
                    signedChallenge: {
                        challengeIdentifier: challenge.challengeIdentifier,
                        firstFactor: assertion,
                    },
                }),
            })

            setSighash(await completeRes.json())
            setError(undefined)
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    const connectDFNSWallet = async (wallet: any) => {
        try {
            const connector = new DFNSConnector({ wallet, chainId: 11155111 })
            await connect({ connector })
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className='flex flex-col items-center gap-5'>
            <div className='flex flex-col gap-5 items-center'>
                <h3>Current Wallets</h3>
                {wallets && wallets.items && wallets.items.length > 0 ? (
                    wallets.items.map((wallet: any) => (
                        <div key={wallet.id} className="flex items-center gap-4">
                            <span>{wallet.address}</span>
                            <Button onClick={() => connectDFNSWallet(wallet)}>Connect</Button>
                        </div>
                    ))
                ) : (
                    <div>No wallets found</div>
                )}
            </div>
            <div className='flex flex-col items-center gap-5'>
                <form onSubmit={signMessage}>
                    <div className="flex flex-col items-center gap-5">
                        <Input type="text" name="message" placeholder="Enter your message" className="input" />
                        <Button className="btn" type="submit">
                            Sign Message
                        </Button>
                    </div>
                    {!!sighash && (
                        <pre className="p-4 drop-shadow-lg mt-2 overflow-x-scroll">{JSON.stringify(sighash, null, 2)}</pre>
                    )}

                    {!!loading && <span>loading ...</span>}

                    {!!error && <div className="text-red-700">{JSON.stringify(error, null, 2)}</div>}
                </form>
                <Button onClick={() => {
                    if (!walletConnectConnector) {
                        throw new Error('WalletConnect connector not found');
                    }
                    listenForWalletConnectUri(walletConnectConnector);
                    connect({ connector: walletConnectConnector, chainId: 11155111 });
                }}>Get WalletConnect URI</Button>

                <JustWeb3Button>
                    <ConnectButton />
                </JustWeb3Button>
            </div>
        </div>
    )
}