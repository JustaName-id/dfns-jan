'use client'

import { Button } from '@/components/ui/button'
import { DFNSConnector } from '@/connectors/DFNSConnector'
import { useWallets } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { JustWeb3Button } from '@justweb3/widget'
import { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

export default function Wallets() {

    const { connect } = useConnect();
    const { isConnected } = useAccount();
    const { wallets, walletsLoading, refetchWallets } = useWallets();
    const { isAuthenticated, refetch } = useAuth()

    // @ts-expect-error: wallet is any
    const connectDFNSWallet = async (wallet: any) => {
        try {
            const connector = new DFNSConnector({ wallet, chainId: 1 })
            await connect({ connector })
        } catch (err) {
            console.log('connectDFNSWallet error', err)
        }
    }

    useEffect(() => {
        if (isConnected) {
            refetch()
        }
    }, [isConnected])


    return (
        <div className='flex flex-col items-center gap-5'>
            <div className='flex flex-col items-center gap-5'>
                <JustWeb3Button logout={() => { refetch(); refetchWallets() }}>
                    <div className='flex flex-col gap-5 items-center'>
                        <h3>Current Wallets</h3>
                        {isAuthenticated ? (
                            wallets && wallets.items && wallets.items.length > 0 ? (
                                // @ts-expect-error: wallet is any
                                wallets.items.map((wallet) => (
                                    <div key={wallet.id} className="flex items-center gap-4">
                                        <span>{wallet.address}</span>
                                        <Button onClick={() => connectDFNSWallet(wallet)}>Connect</Button>
                                    </div>
                                ))
                            ) : (
                                walletsLoading ? <div>Loading...</div> : <div>No wallets found</div>
                            )
                        ) : (
                            <div>Please login to see your wallets</div>
                        )}
                    </div>
                </JustWeb3Button>
            </div>
        </div>
    )
}