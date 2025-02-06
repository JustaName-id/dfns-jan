'use client'

import { Button } from '@/components/ui/button'
import { dfns, DFNSWallet } from '@/connectors/DFNSConnector'
import { useWallets } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { JustWeb3Button } from '@justweb3/widget'
import { useEffect } from 'react'
import { Connector, useAccount, useConnect } from 'wagmi'


export default function Wallets() {

    const { connect } = useConnect();
    const { isConnected } = useAccount();
    const { wallets, walletsLoading, refetchWallets } = useWallets();
    const { isAuthenticated, refetch } = useAuth()

    const connectDFNSWallet = async (wallet: DFNSWallet) => {
        const connector = dfns({ wallet, chainId: 1 })
        await connect({ connector: connector as never as Connector })
    }

    useEffect(() => {
        refetch()
    }, [isConnected, refetch])


    return (
        <div className='flex flex-col items-center gap-5'>
            <div className='flex flex-col items-center gap-5'>
                <JustWeb3Button logout={() => { refetch(); refetchWallets() }}>
                    <div className='flex flex-col gap-5 items-center'>
                        <h3>Current Wallets</h3>
                        {isAuthenticated ? (
                            wallets && wallets.items && wallets.items.length > 0 ? (
                                wallets.items.map((wallet: DFNSWallet) => (
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