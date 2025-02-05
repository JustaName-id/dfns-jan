'use client'

import { Button } from '@/components/ui/button'
import { DFNSConnector } from '@/connectors/DFNSConnector'
import { JustWeb3Button } from '@justweb3/widget'
import { useEffect, useState } from 'react'
import { useConnect, useDisconnect } from 'wagmi'

export default function Wallets() {
    const [loading, setLoading] = useState(false)
    const [wallets, setWallets] = useState<any>(undefined)
    const [error, setError] = useState<any>(undefined)

    const { connect, error: connectError } = useConnect();
    const { disconnect } = useDisconnect();
    console.log('connectors error', connectError)



    const listWallets = async () => {
        try {
            setLoading(true)

            const res = await fetch('/api/wallets/list', {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                },
                credentials: 'include'
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
            <div className='flex flex-col items-center gap-5'>
                <JustWeb3Button >
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
                </JustWeb3Button>
            </div>
        </div>
    )
}